"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type inputType = "text" | "textarea";

interface VariableInputProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: inputType;
}

export default function VariableInput({
  type = "text",
  options = [],
  value = "",
  onChange,
  placeholder,
  className,
}: VariableInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (inputRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)) ||
        (textareaRef.current &&
          !textareaRef.current.contains(event.target as Node) &&
          textareaRef.current &&
          !textareaRef.current.contains(event.target as Node))
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    if (newValue.startsWith("{{") || newValue.indexOf("{{") >= 0) {
      setShowDropdown(true);
    } else if (!inputRef.current && newValue.indexOf("{{") >= 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const getFilterText = (value: string) => {
    const lastIndex = value?.lastIndexOf("{{");
    if (lastIndex >= 0) {
      return value.substring(lastIndex + 2);
    }
    return "";
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(getFilterText(inputValue).toLowerCase())
  );

  const handleOptionSelect = (option: string) => {
    console.log("@@@@@@@@@@@@@@");
    console.log(option);
    setInputValue(option);
    onChange?.(option);
    setShowDropdown(false);
  };

  const renderInput = () => {
    return (
      <Input
        type={type}
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
      />
    );
  };

  return (
    <div className="relative">
      {showDropdown && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
        >
          {filteredOptions.map((option, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left"
              onSelect={() => {
                console.log("passed on here select event");
              }}
              onClick={() => {
                console.log("passed on here");
                handleOptionSelect(option);
              }}
            >
              {option}
            </Button>
          ))}
        </div>
      )}
      {type == "text" && renderInput()}
    </div>
  );
}
