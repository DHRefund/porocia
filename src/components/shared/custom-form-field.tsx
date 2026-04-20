"use client";

import {
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export enum FormFieldType {
  INPUT = "input",
}

interface CustomFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  fieldType?: FormFieldType;
  inputType?: React.HTMLInputTypeAttribute;
  inputClassName?: string;
  labelClassName?: string;
}

export default function CustomFormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  fieldType = FormFieldType.INPUT,
  inputType = "text",
  inputClassName,
  labelClassName,
}: CustomFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          {label ? (
            <FormLabel className={cn("text-sm font-medium", labelClassName)}>
              {label}
            </FormLabel>
          ) : null}

          <FormControl>
            {fieldType === FormFieldType.INPUT ? (
              <Input
                type={inputType}
                placeholder={placeholder}
                {...field}
                className={cn(
                  "h-12 rounded-2xl border-[--color-border-warm] bg-[--color-ivory] text-[--color-near-black] placeholder:text-[--color-stone-gray]",
                  inputClassName
                )}
              />
            ) : null}
          </FormControl>

          <FormMessage className="text-sm text-[#9a3d3d]" />
        </FormItem>
      )}
    />
  );
}