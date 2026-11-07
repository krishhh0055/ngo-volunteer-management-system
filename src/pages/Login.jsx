import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export default function Login() {
  const [email, setEmail] = useState('admin@ngo.org');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      // Redirect based on role
      // For now, simpler redirect or rely on AuthContext user state in App.jsx
      // Actually App.jsx will handle redirection if we navigate to root
      // Better to check role and navigate
      const user = JSON.parse(localStorage.getItem('ngo_user'));
      navigate(`/${user.role}`);
    } else {
      setError('Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary-700">NGO VMS Login</CardTitle>
          <p className="text-center text-gray-500 text-sm mt-1">Virtual Management System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              error={error && !password ? error : ''}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={error}
            />

            <Button type="submit" className="w-full">
              Sign In
            </Button>

            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">Demo Credentials (Password: password123):</p>
              <p>Admin: admin@ngo.org</p>
              <p>Staff: sarah@ngo.org</p>
              <p>Volunteer: mike@ngo.org</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
