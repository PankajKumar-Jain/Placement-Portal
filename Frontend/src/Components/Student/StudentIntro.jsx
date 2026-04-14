import { useSelector } from 'react-redux';
import defaultAvatar from '../../assets/default-avatar.jpg';

const StudentIntro = () => {
  const { name, courseName, departmentName, rollNo, batchYear, photo } =
    useSelector((state) => state.studentProfileState);

  return (
    <section className="flex gap-8 items-center flex-wrap justify-center md:justify-normal">
      <div className="flex flex-col gap-y-4">
        <img
          src={photo || defaultAvatar}
          height="150"
          width="150"
          className="rounded-full"
        />
        <div className="text-center text-2xl tracking-wide">{name}</div>
      </div>
      <div className="flex flex-col gap-y-2">
        <p>
          <span className="font-medium text-lg">Course: </span> {courseName}
        </p>
        <p>
          <span className="font-medium text-lg">Batch Year: </span> {batchYear}
        </p>
        <p>
          <span className="font-medium text-lg">Department: </span>
          {departmentName}
        </p>
        <p>
          <span className="font-medium text-lg">Roll No: </span>
          {rollNo}
        </p>
      </div>
    </section>
  );
};
export default StudentIntro;
