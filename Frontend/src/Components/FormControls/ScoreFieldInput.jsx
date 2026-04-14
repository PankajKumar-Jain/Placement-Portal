const ScoreFieldInput = ({ type, label, data, semesterNum }) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="capitalize font-light text-center">{label}</span>
      </label>
      <div className="flex flex-col gap-4">
        <input
          disabled={type === 'public'}
          type="number"
          name={`gpa-${semesterNum}`}
          placeholder="GPA Score"
          defaultValue={data?.gpa}
          min="1"
          max="10"
          step="0.01"
          className="w-28 border-b-2 border-b-black focus:border-b-blue-500 focus:outline-none"
        />
        <input
          disabled={type === 'public'}
          type="number"
          name={`backsCount-${semesterNum}`}
          min="0"
          step="1"
          placeholder="Backs Count"
          defaultValue={data?.backsCount}
          className="w-28 border-b-2 border-b-black focus:border-b-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
export default ScoreFieldInput;
