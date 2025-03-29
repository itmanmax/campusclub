import React, { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = (props) => {
  return (
    <label
      {...props}
      className={`block text-sm font-medium text-gray-700 ${props.className || ''}`}
    />
  );
}; 