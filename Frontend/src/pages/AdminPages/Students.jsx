import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { Form } from 'react-router-dom';

import { SelectInput, CheckboxInput, StudentsTable } from '../../Components';
import {
  fetchStudents,
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
  customFetch,
} from '../../utils';

export const loader = (queryClient, store) => {
  return async function ({ request }) {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);

    const query = {
      page: 1, limit: 10
    };

    if (params.size) {
      query.page = parseInt(params.get('page')) || 1;
      query.limit = parseInt(params.get('limit')) || 10;
      query.course = params.get('course');
      query.departments = params.getAll('departments')?.join('|');
      query.batches = params.getAll('batches')?.join('|');
    }

    try {
      const { students, totalPages } = await queryClient.ensureQueryData(
        fetchStudents(query)
      );
      return { students, totalPages, ...query };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch students!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const Students = () => {
  const courseOptions = useSelector((state) => state.courseOptions);
  const [deptOptions, setDeptOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [exportSummary, setExportSummary] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);

  const invalidRows = useMemo(
    () =>
      (previewData?.previewRows || []).filter(
        (row) => Array.isArray(row.errors) && row.errors.length
      ),
    [previewData]
  );

  const downloadErrorCsv = (failedRows = []) => {
    if (!failedRows.length) {
      toast.info('No failed rows to export');
      return;
    }
    const headers = [
      'Row Number',
      'Name',
      'Roll No',
      'Email',
      'Course',
      'Department',
      'Batch',
      'DOB',
      'Errors',
    ];
    const escapeValue = (value) => {
      const str = value === null || value === undefined ? '' : String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replaceAll('"', '""')}"`;
      }
      return str;
    };
    const rows = failedRows.map((item) => {
      const row = item.row || {};
      return [
        item.rowNumber,
        row.name,
        row['roll no'],
        row.email,
        row.course,
        row.department,
        row.batch,
        row.dob,
        (item.errors || []).join(' | '),
      ]
        .map(escapeValue)
        .join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-import-errors-${Date.now()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h3 className="my-2 underline text-2xl text-center tracking-wide font-medium">
        Students
      </h3>

      {/* FILTERS */}
      <Form className="flex flex-col">
        <div className="px-4 flex flex-wrap justify-between">
          <div>
            <SelectInput
              label="Select Course"
              options={getCourseOptions(courseOptions)}
              id="createJobCourse"
              changeFn={handleCourseChange}
              name="course"
            />
          </div>
          <div>
            <CheckboxInput
              label="Select Deparments"
              options={deptOptions}
              name="departments"
              emptyMsg="Select a course!"
            />
          </div>
          <div>
            <CheckboxInput
              label="Batches"
              options={batchOptions}
              name="batches"
              emptyMsg="no batches found!"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-success self-end capitalize text-white btn-sm px-4"
        >
          Filter
        </button>
      </Form>

      <div className="my-4 p-4 border rounded-lg bg-base-100">
        <h4 className="text-lg font-semibold mb-3">Bulk Student Operations</h4>
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <input
            type="file"
            accept=".csv"
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setImportFile(file || null);
              setPreviewData(null);
              setImportSummary(null);
            }}
          />
          <button
            className="btn btn-sm btn-primary"
            onClick={handlePreviewImport}
            disabled={!importFile || isPreviewLoading}
          >
            {isPreviewLoading ? 'Previewing...' : 'Preview Before Upload'}
          </button>
          <button
            className="btn btn-sm btn-success"
            onClick={handleConfirmImport}
            disabled={!importFile || !previewData || isImportLoading}
          >
            {isImportLoading ? 'Uploading...' : 'Confirm Upload'}
          </button>
          <button className="btn btn-sm btn-neutral" onClick={handleExportStudents}>
            Export Students (CSV)
          </button>
          <a
            className="btn btn-sm btn-outline"
            href={`${import.meta.env.VITE_API_URL}/admin/students/import/sample`}
            target="_blank"
            rel="noreferrer"
          >
            Sample Import CSV
          </a>
        </div>

        {previewData && (
          <div className="my-3">
            <p className="text-sm">
              Total: {previewData.summary?.totalRows || 0} | Valid:{' '}
              {previewData.summary?.validCount || 0} | Invalid:{' '}
              {previewData.summary?.invalidCount || 0}
            </p>
            {!!invalidRows.length && (
              <p className="text-sm text-error">Invalid rows are highlighted below.</p>
            )}
          </div>
        )}

        {importSummary && (
          <div className="my-3">
            <p className="text-sm font-medium">
              Imported: {importSummary.summary?.importedCount || 0} | Failed:{' '}
              {importSummary.summary?.failedCount || 0}
            </p>
            {!!importSummary.summary?.forcePasswordResetCount && (
              <p className="alert alert-warning mt-2 text-sm">
                {importSummary.summary.forcePasswordResetCount} imported student(s)
                are marked as password reset required on first login.
              </p>
            )}
            {!!importSummary.failedRows?.length && (
              <button
                className="btn btn-xs btn-warning mt-2"
                onClick={() => downloadErrorCsv(importSummary.failedRows)}
              >
                Download Error Report CSV
              </button>
            )}
          </div>
        )}

        {exportSummary && (
          <p className="alert alert-info my-3 text-sm">
            Latest export contains {exportSummary.forcePasswordResetCount} student(s)
            with password reset required.
          </p>
        )}

        {previewData?.previewRows?.length ? (
          <div className="overflow-x-auto max-h-96">
            <table className="table table-xs table-pin-rows">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Batch</th>
                  <th>DOB</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {previewData.previewRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={row.isValid ? 'bg-success/10' : 'bg-error/10'}
                  >
                    <td>{row.rowNumber}</td>
                    <td>{row.name}</td>
                    <td>{row['roll no']}</td>
                    <td>{row.email}</td>
                    <td>{row.course}</td>
                    <td>{row.department}</td>
                    <td>{row.batch}</td>
                    <td>{row.dob}</td>
                    <td>{row.isValid ? 'Valid' : row.errors?.join(' | ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* TABLE */}

      <StudentsTable />
    </div>
  );

  async function handleCourseChange() {
    const courseId = document.getElementById('createJobCourse').value;

    if (!courseId || courseId == -1) {
      setDeptOptions([]);
      setBatchOptions([]);
    } else {
      const deptOptions = getDepartmentOptions(
        courseOptions[courseId].departments
      );
      setDeptOptions(deptOptions);
      const batchOptions = getBatchOptions(courseOptions[courseId].batches);
      setBatchOptions(batchOptions);
    }
  }

  async function handlePreviewImport(event) {
    event.preventDefault();
    if (!importFile) {
      toast.error('Please choose a CSV file first');
      return;
    }
    try {
      setIsPreviewLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await customFetch.post('/admin/students/import/preview', formData);
      setPreviewData(data);
      setImportSummary(null);
      toast.success('Preview generated');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to preview CSV import';
      toast.error(errorMessage);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleConfirmImport(event) {
    event.preventDefault();
    if (!importFile || !previewData) {
      toast.error('Generate preview before uploading');
      return;
    }
    try {
      setIsImportLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await customFetch.post('/admin/students/import/confirm', formData);
      setImportSummary(data);
      toast.success(data?.message || 'Students imported successfully');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to import students';
      toast.error(errorMessage);
    } finally {
      setIsImportLoading(false);
    }
  }

  async function handleExportStudents(event) {
    event.preventDefault();
    try {
      const queryString = window.location.search || '';
      const response = await customFetch.get(`/admin/students/export${queryString}`, {
        responseType: 'blob',
      });
      const forcePasswordResetCount = Number(
        response.headers?.['x-force-password-reset-count'] || 0
      );
      setExportSummary({ forcePasswordResetCount });
      const url = URL.createObjectURL(
        new Blob([response.data], { type: 'text/csv;charset=utf-8' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-export-${Date.now()}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(
        `Export complete. ${forcePasswordResetCount} student(s) require password reset.`
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to export students';
      toast.error(errorMessage);
    }
  }
};
export default Students;
