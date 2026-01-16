
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow login with any name and password combination
    if (name.trim()) onLogin(name);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-20 border border-gray-100">
      <div className="text-center mb-8">
        <i className="fas fa-university text-5xl text-blue-900 mb-4"></i>
        <h1 className="text-2xl font-bold text-gray-800">SmartBank Access</h1>
        <p className="text-gray-500 text-sm">Sign in to your advisor dashboard</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter any password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-md"
        >
          Proceed to Dashboard
        </button>
      </form>
      <p className="mt-6 text-xs text-center text-gray-400">
        Demo mode: Any name and password will be accepted.
      </p>
    </div>
  );
};

export default Login;
