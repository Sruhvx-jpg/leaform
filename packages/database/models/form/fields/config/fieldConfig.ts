export interface FieldStyleConfig {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textSize?: string;
  fontType?: string;
}

export interface FieldValidationConfig {
  pattern?: string;
  customRegex?: string;
  customErrorMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}
