const NumberInput = ({
  label,
  name,
  defaultValue,
  size,
  minValue,
  maxValue,
  step,
  required = true,
  placeholder,
  labelColor = 'text-base-300',
}) => {
  const labelClass = 'font-medium capitalize ' + 'text-' + labelColor;

  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className={labelClass}>{label}</span>
      </label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        className={`input input-bordered ${size}`}
        min={minValue}
        max={maxValue}
        step={step}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};
export default NumberInput;
