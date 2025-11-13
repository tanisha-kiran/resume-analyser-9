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
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For PDF and DOCX files, use a simple text extraction
    // In production, you'd use a library like pdf-parse or mammoth
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractText(file.name, arrayBuffer);

    return new Response(
      JSON.stringify({ text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error parsing document:", error);
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

async function extractText(filename: string, arrayBuffer: ArrayBuffer): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  
  if (filename.endsWith(".pdf")) {
    // Simple PDF text extraction (basic approach)
    // This extracts raw text from PDF - in production use a proper PDF parser
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = "";
    
    // Try to extract text between stream objects
    const pdfText = decoder.decode(uint8Array);
    const streamMatches = pdfText.match(/stream[\s\S]*?endstream/g);
    
    if (streamMatches) {
      for (const match of streamMatches) {
        const content = match.replace(/^stream\s*/, "").replace(/\s*endstream$/, "");
        text += content + " ";
      }
    }
    
    // Also try to extract plain text
    const textMatches = pdfText.match(/\(([^)]+)\)/g);
    if (textMatches) {
      for (const match of textMatches) {
        text += match.replace(/[()]/g, "") + " ";
      }
    }
    
    return text.trim() || "Unable to extract text from PDF. Please try copying and pasting the text directly.";
  } else if (filename.endsWith(".docx")) {
    // Simple DOCX extraction
    // DOCX is a ZIP file, we'd need to properly parse it in production
    const text = decoder.decode(arrayBuffer);
    // Extract any readable text
    const cleanText = text.replace(/[^\x20-\x7E\n]/g, " ").trim();
    return cleanText || "Unable to extract text from DOCX. Please try copying and pasting the text directly.";
  } else {
    // Plain text file
    return decoder.decode(arrayBuffer);
  }
}
