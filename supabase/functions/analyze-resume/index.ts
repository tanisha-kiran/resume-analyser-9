

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume, jobDescription, semanticScore } = await req.json();

    if (!resume || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume and job description are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Calling Lovable AI for resume analysis...");

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and career advisor. 
Analyze the resume against the job description and provide:
1. Detailed, actionable feedback on how to improve the resume
2. Key strengths that align with the job
3. Specific areas for improvement

The semantic similarity score is ${semanticScore}/100. Use this as context.

Be specific, professional, and constructive. Format your response as JSON with these fields:
- feedback: string (2-3 paragraphs of detailed analysis)
- strengths: array of strings (3-5 key strengths)
- improvements: array of strings (3-5 specific improvements)`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_analysis",
                description: "Provide structured resume analysis",
                parameters: {
                  type: "object",
                  properties: {
                    feedback: {
                      type: "string",
                      description: "Detailed feedback (2-3 paragraphs)",
                    },
                    strengths: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 key strengths",
                    },
                    improvements: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 specific improvements",
                    },
                  },
                  required: ["feedback", "strengths", "improvements"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "provide_analysis" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI service credits exhausted. Please contact support.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract tool call arguments
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
