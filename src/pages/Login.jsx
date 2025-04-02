import { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? 'http://localhost:5000/api/auth/register' : 'http://localhost:5000/api/auth/login';
    try {
      const { data } = await axios.post(url, { email, password });
      if (!isRegister) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;