import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Stack } from "./Stack";
import { Upload } from "lucide-react";

interface FormFileInputProps {
    files: File[];
    onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxFiles?: number;
    accept?: string;
    disabled?: boolean;
    uploadButtonText?: string;
    maxFilesReachedText?: string;
    className?: string;
    handleRemoveFile: (index: number) => void;
  }
  
  export const FormFileInput: React.FC<FormFileInputProps> = ({
    files,
    onFilesChange,
    maxFiles = 5,
    accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    disabled = false,
    uploadButtonText = "Add Files",
    maxFilesReachedText = "Max files reached",
    className,
    handleRemoveFile,
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    
  
    const isMaxReached = files.length >= maxFiles;
  
    return (
      <Stack gap={2} className={className}>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          disabled={isMaxReached || disabled}
          onChange={onFilesChange}
          accept={accept}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isMaxReached || disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isMaxReached ? maxFilesReachedText : uploadButtonText}
        </Button>
        
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm">
                <span className="text-muted-foreground">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Stack>
    );
  };