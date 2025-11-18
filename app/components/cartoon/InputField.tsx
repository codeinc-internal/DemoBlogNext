"use client";

import React from "react";

export interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  bg?: string;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  bg = "",
  value,
  onChange,
  required,
}) => {
  return (
    <div className="w-full space-y-1 mt-5">
      <label className="font-bold text-lg text-gray-800">
        {label}
      </label>

      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-5 py-3 
          border-2 border-black 
          rounded-2xl 
          bg-white 
          text-gray-900
          shadow-md 
          transition-all duration-200
          focus:outline-none 
          focus:ring-4 
          focus:ring-yellow-200 
          focus:border-yellow-500 
          placeholder:text-gray-400
          ${bg}
        `}
      />
    </div>
  );
};

export default InputField;
