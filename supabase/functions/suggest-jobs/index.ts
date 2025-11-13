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
    const { resume } = await req.json();

    if (!resume) {
      return new Response(
        JSON.stringify({ error: "Resume is required" }),
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

    console.log("Calling Lovable AI for job suggestions...");

    const systemPrompt = `You are an expert career advisor and job market analyst.
Analyze the resume and suggest 5 relevant job positions that would be a good match.

For each job suggestion, provide:
1. Job title (specific role)
2. Brief description (1 sentence about the role)
3. Match reason (why this person would be good for this role based on their resume)

Focus on realistic, current market positions that align with the candidate's skills and experience.
Format your response as JSON with these fields:
- suggestions: array of objects with title, description, and matchReason fields`;

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
              content: `RESUME:\n${resume}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_job_suggestions",
                description: "Provide structured job suggestions",
                parameters: {
                  type: "object",
                  properties: {
                    suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: {
                            type: "string",
                            description: "Job title",
                          },
                          description: {
                            type: "string",
                            description: "Brief job description",
                          },
                          matchReason: {
                            type: "string",
                            description: "Why this matches the resume",
                          },
                        },
                        required: ["title", "description", "matchReason"],
                      },
                      description: "5 job suggestions",
                    },
                  },
                  required: ["suggestions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "provide_job_suggestions" },
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

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in suggest-jobs function:", error);
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
