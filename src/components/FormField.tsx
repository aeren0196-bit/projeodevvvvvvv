import { Stack } from "./Stack";
import { Label } from "./ui/label";

// FormField.tsx
export interface FormFieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12;
  className?: string;
  labelAction?: React.ReactNode; // YENİ
}

export function FormField({ 
  label, 
  htmlFor,
  error, 
  required, 
  children, 
  description,
  gap = 2,
  className,
  labelAction, // YENİ
}: FormFieldProps) {
  return (
    <Stack gap={gap} className={className}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {labelAction}
      </div>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </Stack>
  );
}