import { useState, useEffect } from 'react';

const SelectInput = ({
  label,
  name,
  options,
  id,
  changeFn,
  defaultValue,
  emptyMessage,
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
    if (changeFn) changeFn(e);
  };

  useEffect(() => {
    setSelectedOption(defaultValue);
  }, [defaultValue]);

  return (
    <div className="form-control max-w-xs">
      <label className="label">
        <span className="font-medium capitalize">{label}</span>
      </label>{' '}
      {options.length ? (
        <select
          className="select select-bordered"
          id={id}
          onChange={handleSelectChange}
          name={name}
          value={selectedOption}
          required
        >
          {options.map((option) => {
            const { text, value } = option;
            return (
              <option key={value} value={value} className="capitalize">
                {text}
              </option>
            );
          })}
        </select>
      ) : (
        <p className="ml-4 font-light">{emptyMessage}</p>
      )}
    </div>
  );
};
export default SelectInput;
