// This file implements the audio proxy service for the Supabase Edge Function
// It fetches audio files from external sources and serves them through our own domain

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      )
    }

    // Fetch the audio file from the target URL
    const response = await fetch(targetUrl)

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch audio file: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      )
    }

    // Get the audio data and content type
    const audioData = await response.arrayBuffer()
    const contentType = response.headers.get('Content-Type') || 'audio/mpeg'

    // Return the audio file with appropriate headers
    return new Response(audioData, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioData.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400',
        ...corsHeaders
      }
    })
  } catch (error) {
    console.error('Error in audio proxy:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  }
})
