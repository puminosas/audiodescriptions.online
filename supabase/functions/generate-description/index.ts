import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://esm.sh/openai@4.20.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error("Missing OPENAI_API_KEY environment variable");
    return new Response(
      JSON.stringify({ success: false, error: "API configuration error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get Supabase client for fetching settings
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    return new Response(
      JSON.stringify({ success: false, error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { product_name, language, voice_name } = await req.json();
    
    if (!product_name) {
      return new Response(
        JSON.stringify({ success: false, error: "Product name is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating description for "${product_name}" in ${language} with voice ${voice_name}`);
    
    // Fetch ChatGPT settings from app_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('chatgptmodel, chatgpttemperature, chatgptprompt')
      .single();
    
    if (settingsError) {
      console.error('Error fetching ChatGPT settings:', settingsError);
    }
    
    // Default settings if database fetch fails
    const model = settingsData?.chatgptmodel || 'gpt-4o';
    const temperature = settingsData?.chatgpttemperature || 0.7;
    
    // Improved prompt with clear structure and instructions
    let systemPrompt = settingsData?.chatgptprompt || `
### INSTRUCTIONS
You are an expert in creating engaging audio product descriptions for e-commerce. Your task is to create a clear, concise, and informative product description in {language} that will be converted to audio using voice {voice_name}.

### FORMAT REQUIREMENTS
- Create exactly 3-5 sentences total
- Maximum length: 600 characters (suitable for ~60s audio)
- Use simple, conversational language that sounds natural when read aloud
- Avoid technical jargon unless absolutely necessary for the product
- Do not use special characters, symbols, or formatting that may disrupt text-to-speech
- Do not use bullet points, numbered lists, or other formatting that doesn't work in audio

### CONTENT STRUCTURE
1. First sentence: Introduce the product with its name and primary purpose
2. Middle sentences: Describe 2-3 key features that make this product valuable
3. Final sentence: Explain the main benefit to the user or provide a compelling reason to purchase

### TONE AND STYLE
- Be informative but conversational
- Use active voice and present tense
- Be enthusiastic without using superlatives like "best" or "greatest"
- Speak directly to the customer using "you" and "your"
- Adapt tone to match the selected voice ({voice_name})

### WHAT TO AVOID
- Avoid repetition of the product name more than necessary
- Avoid filler words and phrases
- Avoid complex sentence structures with multiple clauses
- Avoid mentioning price, availability, or time-sensitive information
- Avoid using symbols like *, #, /, @, %, &, etc.

### EXAMPLE FORMAT
"The [Product Name] is a [brief description of what it is]. It features [key feature 1] and [key feature 2] that help you [accomplish something]. With its [notable quality], this [product category] will [main benefit to user]."
`;
    
    // Replace variables in the prompt
    systemPrompt = systemPrompt
      .replace(/{language}/g, language)
      .replace(/{voice_name}/g, voice_name);

    console.log(`Using model: ${model}, temperature: ${temperature}`);

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Improved user prompt with more specific instructions
    const userPrompt = `Create a concise and engaging audio product description for: ${product_name}

Remember:
- Focus only on the most important features
- Use natural, conversational language
- Keep it brief but informative
- Make it sound good when read aloud
- Avoid any special characters or symbols`;

    // Generate description
    const response = await openai.chat.completions.create({
      model: model,
      temperature: temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300 // Limit token count to ensure concise responses
    });

    const generatedText = response.choices[0].message.content;
    
    console.log("Successfully generated description");

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated_text: generatedText,
        model_used: model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-description:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
