import React from 'react';
import { FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface MultiCheckboxFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  label: string;
  description?: string;
}

export const MultiCheckboxField: React.FC<MultiCheckboxFieldProps> = ({
  value,
  onChange,
  options,
  label,
  description,
}) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  return (
    <FormItem>
      <div className="mb-4">
        <FormLabel className="text-base">{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <div key={option.value} className="flex flex-row items-start space-x-3 space-y-0">
            <input
              type="checkbox"
              checked={value?.includes(option.value)}
              onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 mt-1"
            />
            <label className="font-normal cursor-pointer text-sm">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <FormMessage />
    </FormItem>
  );
};
