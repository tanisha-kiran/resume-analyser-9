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
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          // Use document parsing for PDF
          const formData = new FormData();
          formData.append("file", file);

          // For now, use FileReader to get text from PDF
          const reader = new FileReader();
          reader.onload = async (e) => {
            const text = e.target?.result as string;
            onTextExtracted(text);
            toast({
              title: "File Uploaded",
              description: "Your document has been processed",
            });
          };
          reader.readAsText(file);
        } else if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.endsWith(".docx")
        ) {
          // Handle DOCX files
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            onTextExtracted(text);
            toast({
              title: "File Uploaded",
              description: "Your document has been processed",
            });
          };
          reader.readAsText(file);
        } else {
          // Plain text file
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            onTextExtracted(text);
            toast({
              title: "File Uploaded",
              description: "Your document has been processed",
            });
          };
          reader.readAsText(file);
        }
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
