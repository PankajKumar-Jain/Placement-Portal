const MultipleInputs = ({
  label,
  name,
  type,
  defaultValue,
  manageFields,
  labelColor = 'text-base-300',
}) => {
  const labelClass = 'font-medium capitalize ' + 'text-' + labelColor;

  return (
    <div className="form-control">
      <div className="flex items-center justify-between sm:justify-normal sm:gap-x-40">
        <label htmlFor={name} className="label">
          <span className={labelClass}>{label}</span>
        </label>
        <button
          type="button"
          className="btn btn-xs"
          onClick={() => {
            manageFields([...defaultValue, '']);
          }}
        >
          + Add Field
        </button>
      </div>
      <div id={`${name}Container`} className="mt-4 flex gap-4 flex-wrap">
        {defaultValue.map((value, idx) => {
          return (
            <input
              type={type}
              name={`${name}`}
              defaultValue={value}
              className={`input input-bordered`}
              key={value + idx}
              required
            />
          );
        })}
      </div>
    </div>
  );
};
export default MultipleInputs;
