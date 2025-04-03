import { useState } from 'react';
import axios from 'axios';
import { BaseURL } from "../api/constants";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? `${BaseURL}/api/auth/register` : `${BaseURL}/api/auth/login`;
    try {
      const { data } = await axios.post(url, { email, password });
      if (isRegister) {
        setMessage("Registration successful! You can now log in.");
      } else {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">{isRegister ? 'Register' : 'Login'}</h2>
        {message && <p className="mb-4 text-green-600 text-center">{message}</p>}
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
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage('');
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
