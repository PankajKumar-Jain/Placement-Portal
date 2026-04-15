import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { customFetch } from '../../utils';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    uploadLimit: 100,
    dobPasswordEnabled: true,
    forcePasswordResetOnFirstLogin: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await customFetch.get('/admin/settings');
      if (data?.settings) {
        setSettings({
          uploadLimit: data.settings.uploadLimit ?? 100,
          dobPasswordEnabled: Boolean(data.settings.dobPasswordEnabled),
          forcePasswordResetOnFirstLogin: Boolean(
            data.settings.forcePasswordResetOnFirstLogin
          ),
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch admin settings';
      toast.error(errorMessage);
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await customFetch.patch('/admin/settings', settings);
      toast.success('Admin settings updated');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update admin settings';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    try {
      setIsChangingPassword(true);
      await customFetch.post('/admin/settings/change-password', passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="my-2 underline text-2xl text-center tracking-wide font-medium">
        Admin Settings
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <form
          className="card bg-base-100 border border-base-300 p-4 space-y-3"
          onSubmit={handleSaveSettings}
        >
          <h4 className="font-semibold">Import and Password Policies</h4>

          <label className="form-control">
            <span className="label-text">Upload Limit (1 - 1000)</span>
            <input
              type="number"
              min={1}
              max={1000}
              className="input input-bordered"
              value={settings.uploadLimit}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  uploadLimit: Number(event.target.value),
                }))
              }
            />
          </label>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={settings.dobPasswordEnabled}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  dobPasswordEnabled: event.target.checked,
                }))
              }
            />
            <span className="label-text">Enable DOB-based password generation</span>
          </label>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={settings.forcePasswordResetOnFirstLogin}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  forcePasswordResetOnFirstLogin: event.target.checked,
                }))
              }
            />
            <span className="label-text">Force password reset on first login</span>
          </label>

          <button className="btn btn-primary btn-sm" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        <form
          className="card bg-base-100 border border-base-300 p-4 space-y-3"
          onSubmit={handleChangePassword}
        >
          <h4 className="font-semibold">Change Admin Password</h4>
          <input
            type="password"
            className="input input-bordered"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: event.target.value,
              }))
            }
          />
          <input
            type="password"
            className="input input-bordered"
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: event.target.value,
              }))
            }
          />
          <input
            type="password"
            className="input input-bordered"
            placeholder="Confirm password"
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
          />
          <button
            className="btn btn-secondary btn-sm"
            type="submit"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
