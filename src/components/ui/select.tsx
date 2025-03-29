import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string; }>;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  placeholder,
  options,
  ...props 
}) => {
  return (
    <select
      {...props}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div {...props} />;
};

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div {...props} />;
};

export const SelectItem: React.FC<React.HTMLAttributes<HTMLOptionElement> & { value: string }> = ({ value, children, ...props }) => {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span>{placeholder}</span>
}; 