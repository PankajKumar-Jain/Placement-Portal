const SimpleFormInput = ({ name, type, label, defaultValue }) => {
  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className="capitalize font-light">{label}</span>
      </label>
      <input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="border-b-2 border-b-black focus:border-b-blue-500 focus:outline-none"
      />
    </div>
  );
};
export default SimpleFormInput;
