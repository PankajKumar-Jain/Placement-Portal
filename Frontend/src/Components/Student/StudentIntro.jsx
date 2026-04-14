import { useSelector } from 'react-redux';
import defaultAvatar from '../../assets/default-avatar.jpg';

const StudentIntro = () => {
  const {
    name,
    courseName,
    departmentName,
    rollNo,
    batchYear,
    photo,
    activeBacklogs,
    completedBacklogs,
  } = useSelector((state) => state.studentProfileState);

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
        <p>
          <span className="font-medium text-lg">Active Backlogs: </span>
          {activeBacklogs ?? 0}
        </p>
        <p>
          <span className="font-medium text-lg">Completed Backlogs: </span>
          {completedBacklogs ?? 0}
        </p>
      </div>
    </section>
  );
};
export default StudentIntro;
