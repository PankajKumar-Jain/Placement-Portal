import { FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import defaultAvatar from '../../assets/default-avatar.jpg';

const CompanyAdminCard = ({ admin }) => {
  const { photo, name, email, companyRole } = admin;
  return (
    <div className="card border p-4 max-w-[100%]">
      <div className="flex gap-4 items-center">
        <div>
          <img
            src={photo || defaultAvatar}
            height="100"
            width="100"
            className="rounded-full"
          />
        </div>
        <div className="self-start mt-4 overflow-auto">
          <p>
            <span className="font-medium">Name:</span> {name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {companyRole}
          </p>
        </div>
      </div>
    </div>
  );
};
export default CompanyAdminCard;
