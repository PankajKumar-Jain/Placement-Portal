const DateInput = ({
  label,
  name,
  defaultValue,
  size,
  minDate,
  maxDate,
  isRequired = true,
  labelColor = 'text-base-300',
}) => {
  const labelClass = 'font-medium capitalize ' + 'text-' + labelColor;

  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className={labelClass}>{label}</span>
      </label>
      <input
        type="date"
        name={name}
        defaultValue={defaultValue}
        className={`input input-bordered ${size}`}
        min={minDate}
        max={maxDate}
        required={isRequired}
      />
    </div>
  );
};
export default DateInput;
