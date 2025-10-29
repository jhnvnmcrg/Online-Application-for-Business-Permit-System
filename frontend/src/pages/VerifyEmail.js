import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'admin' or 'owner'

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid verification link. Token or user type is missing.');
        return;
      }

      try {
        const endpoint = type === 'admin'
          ? `${API_URL}/api/main/verify-email`
          : `${API_URL}/api/user/verify-email`;

        const response = await axios.post(endpoint, { token });

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token, type]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5 text-center">

                {status === 'verifying' && (
                  <>
                    <div className="mb-4">
                      <Loader className="text-primary" size={64} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <h4 className="mb-3">Verifying your email...</h4>
                    <p className="text-muted">Please wait while we verify your email address.</p>
                  </>
                )}

                {status === 'success' && (
                  <>
                    <div className="mb-4">
                      <CheckCircle className="text-success" size={64} />
                    </div>
                    <h4 className="mb-3 text-success">Email Verified!</h4>
                    <p className="text-muted mb-4">{message}</p>
                    <Link
                      to={type === 'admin' ? '/oabps/main/login' : '/oabps/user/login'}
                      className="btn btn-success btn-lg"
                    >
                      Continue to Login
                    </Link>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <div className="mb-4">
                      <XCircle className="text-danger" size={64} />
                    </div>
                    <h4 className="mb-3 text-danger">Verification Failed</h4>
                    <p className="text-muted mb-4">{message}</p>
                    <div className="d-grid gap-2">
                      <Link
                        to={type === 'admin' ? '/oabps/main/register' : '/oabps/user/register'}
                        className="btn btn-primary"
                      >
                        Register Again
                      </Link>
                      <Link
                        to={type === 'admin' ? '/oabps/main/login' : '/oabps/user/login'}
                        className="btn btn-outline-secondary"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;
