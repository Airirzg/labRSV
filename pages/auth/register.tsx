import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const { register, error: authError } = useAuth();
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('individual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        type: registrationType,
        email,
        password,
        name: registrationType === 'individual' ? name : teamName,
        ...(registrationType === 'team' && {
          members: teamMembers.split(',').map(email => email.trim()).filter(Boolean)
        })
      };

      await register(registrationData);
      // Redirect is handled in the register function
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      
      <main className="container py-4">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Register</h2>
                
                {(error || authError) && (
                  <div className="alert alert-danger" role="alert">
                    {error || authError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="registrationType" className="form-label">
                      Registration Type
                    </label>
                    <select
                      className="form-select"
                      id="registrationType"
                      value={registrationType}
                      onChange={(e) => setRegistrationType(e.target.value as 'individual' | 'team')}
                    >
                      <option value="individual">Individual</option>
                      <option value="team">Team</option>
                    </select>
                  </div>

                  {registrationType === 'individual' ? (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label htmlFor="teamName" className="form-label">
                          Team Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="teamName"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="teamMembers" className="form-label">
                          Team Members (comma-separated emails)
                        </label>
                        <textarea
                          className="form-control"
                          id="teamMembers"
                          value={teamMembers}
                          onChange={(e) => setTeamMembers(e.target.value)}
                          placeholder="member1@example.com, member2@example.com"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </form>

                <p className="mt-3 text-center">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
