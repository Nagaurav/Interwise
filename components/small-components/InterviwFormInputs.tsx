"use client";
import React from "react";

interface InputProps {
  label: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  accept?: string;
  required?: boolean;
  isOptional?: boolean;
}

const InterviwFormInputs = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  min,
  max,
  accept,
  required = true,
  isOptional = false,
}: InputProps) => {
  // Helper components for label styling
  const RequiredLabel = () => (
    <span className="text-red-500 ml-1 text-xs">*</span>
  );
  
  const OptionalLabel = () => (
    <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
  );

  return (
    <div className="flex flex-col w-[100%]">
      <label className="mb-2 text-sm flex items-center">
        {label}
        {isOptional ? <OptionalLabel /> : (required ? <RequiredLabel /> : null)}
      </label>
      <input
        className="border py-2 rounded-lg px-4 border-zinc-700 w-[100%]"
        type={type}
        required={required && !isOptional}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        accept={accept}
      />
    </div>
  );
};

export default InterviwFormInputs;
