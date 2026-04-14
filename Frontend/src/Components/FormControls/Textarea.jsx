import { useState } from 'react';

const Textarea = ({
  label,
  name,
  placeholder,
  defaultValue,
  labelColor = 'text-base-300',
}) => {
  const labelClass = 'font-medium capitalize ' + 'text-' + labelColor;
  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className={labelClass}>{label}</span>
      </label>
      <textarea
        className="textarea textarea-lg textarea-bordered whitespace-pre-line p-2"
        placeholder={placeholder}
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  );
};
export default Textarea;
