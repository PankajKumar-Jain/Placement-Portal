import { Link, useLoaderData, redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { customFetch, fetchCompanies } from '../../utils';
import { setModalData } from '../../features/companyModal/companyModal';
import { resetModalData } from '../../features/companyAdminModal/companyAdminModal';
import { CompanyAdminModal } from '../../Components';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* CREATE & UPDATE COMPANY ADMIN */
    if (intent === 'addCompanyAdmin' || intent === 'updateCompanyAdmin') {
      const companyId = formData.get('companyId');
      let url = `/admin/companies/${companyId}/admins/`;
      if (intent === 'updateCompanyAdmin') url += formData.get('adminId');
      try {
        if (intent === 'addCompanyAdmin') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: [companyId] });
        toast.success('Company Admin added successfully!');
        document.forms.companyAdminForm.reset();
        document.getElementById('companyAdminModal').close();
        return redirect(`/admin-dashboard/companies/${companyId}`);
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add admin!';
        document.getElementById('companyAdminFormError').textContent =
          errorMessage;
        return error;
      }
    }
  };
};

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { companies } = await queryClient.ensureQueryData(fetchCompanies());
      return { companies };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch companies!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const Companies = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { companies } = useLoaderData();

  const handleDeleteCompany = async (companyId) => {
    const confirmed = globalThis.confirm(
      'Are you sure you want to delete this company?'
    );
    if (!confirmed) return;

    try {
      await customFetch.delete(`/admin/companies/${companyId}`);
      toast.success('Company deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'], exact: false });
      globalThis.location.reload();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to delete company!';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-2xl text-center underline tracking-wide font-medium">
        Companies
      </h3>
      <CompanyAdminModal />
      <div>
        {companies.length == 0 ? (
          <h3 className="p-2 text-center font-bold">No companies found!</h3>
        ) : (
          <table className="table text-center table-pin-rows">
            {/* head */}
            <thead className="text-base font-normal">
              <tr>
                <th>Name</th>
                <th>Website</th>
                <th>Email</th>
                <th>Jobs Posted</th>
                <th>Openings Created</th>
                <th>Candidates Hired</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id}>
                  <td>
                    <Link
                      to={`${company._id}`}
                      className="link link-success flex gap-x-2 items-center"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={company?.website}
                      target="_blank"
                      className="link link-secondary flex gap-x-2 items-center"
                    >
                      Website <FaExternalLinkAlt />
                    </Link>
                  </td>
                  <td>{company.email}</td>
                  <td>{company?.jobsPosted || 0}</td>
                  <td>{company?.openingsCreated || 0}</td>
                  <td>{company?.candidatesHired || 0}</td>
                  <td className="flex gap-x-2">
                    <div className="dropdown dropdown-end">
                      <div tabIndex={0} role="button" className="m-1">
                        <FaEdit />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                      >
                        <li>
                          <button
                            onClick={() => {
                              dispatch(setModalData({ company }));
                              document
                                .getElementById('companyModal')
                                .showModal();
                            }}
                          >
                            Edit company
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              dispatch(
                                resetModalData({
                                  companyId: company._id,
                                  companyName: company.name,
                                })
                              );
                              document
                                .getElementById('companyAdminModal')
                                .showModal();
                            }}
                          >
                            Add Admin
                          </button>
                        </li>
                        <li>
                          <button
                            className="text-error"
                            onClick={() => handleDeleteCompany(company._id)}
                          >
                            Delete Company
                          </button>
                        </li>
                      </ul>
                    </div>
                    {/* </button> */}
                    {/* <button className="text-lg">
                      <MdDelete />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default Companies;
