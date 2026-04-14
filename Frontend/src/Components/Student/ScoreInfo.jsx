import { Form } from 'react-router-dom';
import { BiSolidEdit } from 'react-icons/bi';
import FormInput from '../FormControls/FormInput';

const ScoreInfo = ({ title, score, board, year }) => {
  const id = `edit-score-${title.toLowerCase()}`;
  const update = title.toLowerCase();

  return (
    <div className='border px-8 py-4 mt-4'>
      <dialog id={id} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit {title} details!</h3>
          <Form method="POST">
            <span
              onClick={() => document.getElementById(id).close()}
              className="btn btn-lg btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </span>

            <FormInput
              type="text"
              label="board"
              name={`${update}_board`}
              defaultValue={board}
            />
            <FormInput
              type="text"
              label="score"
              name={`${update}_score`}
              defaultValue={score}
            />
            <FormInput
              type="text"
              label="year"
              name={`${update}_year`}
              defaultValue={year}
            />
          </Form>
        </div>
      </dialog>

      <h3>
        {title}{' '}
        <button onClick={() => document.getElementById(id).showModal()}>
          <BiSolidEdit className="h-4 w-4 bg-transparent" />
        </button>
      </h3>
      <p>
        Score: <span className="font-bold">{score}%</span>
      </p>
      <p>
        {board} - {year}
      </p>
    </div>
  );
};
export default ScoreInfo;
