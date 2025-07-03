// ===== 23. src/components/forms/RegisterForm.tsx =====
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/auth';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const validateRegister = (values: RegisterData) => {
  const errors: Partial<Record<keyof RegisterData, string>> = {};
  
  if (!values.firstName) {
    errors.firstName = 'First name is required';
  }
  
  if (!values.lastName) {
    errors.lastName = 'Last name is required';
  }
  
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

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    setFieldError
  } = useForm<RegisterData>({
    initialValues: { email: '', password: '', firstName: '', lastName: '' },
    validate: validateRegister,
    onSubmit: async (data) => {
      try {
        await register(data);
        navigate('/dashboard');
      } catch (error: any) {
        setFieldError('email', 'Registration failed. Email might already exist.');
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          error={touched.firstName ? errors.firstName : undefined}
          {...getFieldProps('firstName')}
        />
        
        <Input
          label="Last Name"
          error={touched.lastName ? errors.lastName : undefined}
          {...getFieldProps('lastName')}
        />
      </div>
      
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
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};

