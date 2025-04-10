// Test script for ChatGPT prompt improvements
// This script simulates the prompt that would be sent to the OpenAI API

// Import necessary modules (commented out as this is just for demonstration)
// import { OpenAI } from 'openai';

// Mock product data for testing
const testProducts = [
  {
    product_name: "Wireless Bluetooth Headphones",
    language: "en-US",
    voice_name: "en-US-Neural2-F"
  },
  {
    product_name: "Smart Home Security Camera",
    language: "en-US",
    voice_name: "en-US-Neural2-M"
  },
  {
    product_name: "Portable Power Bank 10000mAh",
    language: "lt-LT",
    voice_name: "lt-LT-Standard-A"
  }
];

// Improved system prompt (copied from the implementation)
const systemPrompt = `
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

// Improved user prompt
const userPrompt = `Create a concise and engaging audio product description for: {product_name}

Remember:
- Focus only on the most important features
- Use natural, conversational language
- Keep it brief but informative
- Make it sound good when read aloud
- Avoid any special characters or symbols`;

// Test function to simulate prompt generation
function testPromptGeneration(product) {
  // Replace variables in the prompts
  const finalSystemPrompt = systemPrompt
    .replace(/{language}/g, product.language)
    .replace(/{voice_name}/g, product.voice_name);
  
  const finalUserPrompt = userPrompt
    .replace(/{product_name}/g, product.product_name);
  
  console.log(`\n=== Testing prompt for: ${product.product_name} ===`);
  console.log(`Language: ${product.language}, Voice: ${product.voice_name}`);
  console.log('\n--- System Prompt ---');
  console.log(finalSystemPrompt);
  console.log('\n--- User Prompt ---');
  console.log(finalUserPrompt);
  
  // In a real test, we would make an API call here
  console.log('\n--- Expected Response Format ---');
  console.log(`The ${product.product_name} is a [brief description]. It features [key feature 1] and [key feature 2]. With its [notable quality], this product will [main benefit].`);
  
  console.log('\n=== End Test ===\n');
}

// Run tests for each product
console.log('Testing ChatGPT prompt improvements...');
testProducts.forEach(product => {
  testPromptGeneration(product);
});

console.log('ChatGPT prompt test complete');
