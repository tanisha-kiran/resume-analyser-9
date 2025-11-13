import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Type } from "lucide-react";
import { FileUpload } from "./FileUpload";

interface ResumeInputProps {
  onTextChange: (text: string) => void;
}

export const ResumeInput = ({ onTextChange }: ResumeInputProps) => {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="text" className="gap-2">
          <Type className="h-4 w-4" />
          Text Input
        </TabsTrigger>
        <TabsTrigger value="file" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="mt-0">
        <Textarea
          placeholder="Paste your resume here..."
          className="min-h-[300px] resize-none border-border/60 focus:border-primary transition-colors"
          onChange={(e) => onTextChange(e.target.value)}
        />
      </TabsContent>

      <TabsContent value="file" className="mt-0">
        <FileUpload onTextExtracted={onTextChange} />
      </TabsContent>
    </Tabs>
  );
};
