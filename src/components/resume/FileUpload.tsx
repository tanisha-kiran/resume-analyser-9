import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
}

export const FileUpload = ({ onTextExtracted }: FileUploadProps) => {
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        // Upload file to parse it properly
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-document`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to parse document");
        }

        const data = await response.json();
        onTextExtracted(data.text || "");
        toast({
          title: "File Uploaded",
          description: "Your document has been processed",
        });
      } catch (error) {
        console.error("File upload error:", error);
        toast({
          title: "Upload Failed",
          description: "Could not process the file. Please try again.",
          variant: "destructive",
        });
      }
    },
    [onTextExtracted, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        min-h-[300px] border-2 border-dashed rounded-lg p-8
        flex flex-col items-center justify-center gap-4
        cursor-pointer transition-all
        ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="p-4 rounded-full bg-primary/10">
        {isDragActive ? (
          <FileText className="h-10 w-10 text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-primary" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-medium mb-1">
          {isDragActive ? "Drop file here" : "Upload your document"}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports PDF, DOCX, and TXT files
        </p>
      </div>
    </div>
  );
};
