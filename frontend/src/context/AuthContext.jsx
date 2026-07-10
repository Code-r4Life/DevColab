import { useEffect, useState } from 'react';
import api, { clearAuthToken, clearSocketToken, setSocketToken, unwrap } from '../lib/api';
import { disconnectSockets, refreshSocketAuth } from '../lib/socket';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hydrate = async () => {
    try {
      const data = unwrap(await api.get('/auth/me'));
      setUser(data.user);
      refreshSocketAuth();
    } catch (err) {
    
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const login = async (email, password) => {
    setError('');
    const data = unwrap(await api.post('/auth/login', { email, password }));
    setUser(data.user);
    
    setSocketToken(data.socketToken || '');
    refreshSocketAuth();
    return data.user;
  };

  const register = async (name, email, password) => {
    setError('');
    return unwrap(await api.post('/auth/register/start', { name, email, password }));
  };

  const startRegister = async (name, email, password) => {
    setError('');
    return unwrap(await api.post('/auth/register/start', { name, email, password }));
  };

  const verifyRegister = async (email, otp) => {
    setError('');
    const data = unwrap(await api.post('/auth/register/verify', { email, otp }));
    setUser(data.user);
    setSocketToken(data.socketToken || '');
    refreshSocketAuth();
    return data.user;
  };

  const resendRegisterOtp = async (email) => {
    setError('');
    return unwrap(await api.post('/auth/register/resend', { email }));
  };

  const logout = async () => {
    try {
    
      await api.post('/auth/logout');
    } catch {

    }
    clearAuthToken();
    clearSocketToken();
    disconnectSockets();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      startRegister,
      verifyRegister,
      resendRegisterOtp,
      logout,
      setUser,
      setError
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};