const FormInput = ({
  label,
  name,
  type,
  defaultValue,
  size,
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
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={`input input-bordered ${size}`}
        required={isRequired}
      />
    </div>
  );
};
export default FormInput;
