import { useState } from 'react';
import { User } from '@/types/user';
import ErrorMessage from '@/components/ErrorMessage';

interface ProfileFormProps {
  initialData: User | null;
  onSubmit: (data: any) => Promise<void>;
}

export default function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  const [teamMembers, setTeamMembers] = useState(initialData?.teamMembers?.join(',') || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (data: any): boolean => {
    setValidationError(null);

    const name = data.name?.trim();
    if (!name) {
      setValidationError('Name is required');
      return false;
    }

    if (initialData?.type === 'team') {
      const members = teamMembers.split(',').map(email => email.trim()).filter(Boolean);
      if (members.length === 0) {
        setValidationError('At least one team member is required');
        return false;
      }

      const invalidEmails = members.filter(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
      if (invalidEmails.length > 0) {
        setValidationError(`Invalid email(s): ${invalidEmails.join(', ')}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name'),
        ...(initialData?.type === 'team' && {
          members: teamMembers.split(',').map(email => email.trim()).filter(Boolean)
        })
      };

      if (!validateForm(data)) {
        setIsSubmitting(false);
        return;
      }

      await onSubmit(data);
      setValidationError(null);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm p-4 mb-4">
      <h3 className="mb-4">Profile Information</h3>
      
      <ErrorMessage error={validationError} className="mb-3" />
      
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          {initialData.type === 'team' ? 'Team Name' : 'Full Name'}
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          defaultValue={initialData.name}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          value={initialData.email}
          disabled
        />
        <small className="text-muted">Email cannot be changed</small>
      </div>

      {initialData.type === 'team' && (
        <div className="mb-3">
          <label htmlFor="members" className="form-label">Team Members</label>
          <textarea
            className="form-control"
            id="members"
            name="members"
            value={teamMembers}
            onChange={(e) => setTeamMembers(e.target.value)}
            placeholder="Enter team member emails, separated by commas"
            rows={3}
          />
          <small className="text-muted">
            Enter team member email addresses, separated by commas
          </small>
        </div>
      )}

      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
