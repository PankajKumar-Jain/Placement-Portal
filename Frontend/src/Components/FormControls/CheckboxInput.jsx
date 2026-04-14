const CheckboxInput = ({ label, name, options, defaultValues, emptyMsg }) => {
  return (
    <div className="form-control w-[100%]">
      <label className="label">
        <span className="font-medium">{label}</span>
      </label>

      <div className="flex gap-x-4">
        {options.length ? (
          options.map((option) => {
            const { text, value } = option;
            const checked = defaultValues?.includes(value);
            return (
              <label
                key={value}
                className="label justify-normal gap-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={value}
                  name={name}
                  className="checkbox"
                  defaultChecked={checked}
                />
                <span className="label-text">{text}</span>
              </label>
            );
          })
        ) : (
          <p className="ml-4 font-light">{emptyMsg}</p>
        )}
      </div>
    </div>
  );
};
export default CheckboxInput;
