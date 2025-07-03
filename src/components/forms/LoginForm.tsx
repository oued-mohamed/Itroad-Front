// ===== Example 1: LoginForm using useForm =====
// src/components/forms/LoginForm.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const validateLogin = (values: LoginCredentials) => {
  const errors: Partial<Record<keyof LoginCredentials, string>> = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return errors;
};

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    setFieldError
  } = useForm<LoginCredentials>({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: async (credentials) => {
      try {
        await login(credentials);
        navigate('/dashboard');
      } catch (error: any) {
        setFieldError('password', 'Invalid email or password');
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        error={touched.email ? errors.email : undefined}
        {...getFieldProps('email')}
      />
      
      <Input
        label="Password"
        type="password"
        error={touched.password ? errors.password : undefined}
        {...getFieldProps('password')}
      />

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

