// ===== 26. src/components/forms/ProfileForm.tsx =====
import React from 'react';
import { useForm } from '../../hooks/useForm';
import { User } from '../../types/user';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface ProfileFormProps {
  user: User;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const validateProfile = (values: ProfileFormData) => {
  const errors: Partial<Record<keyof ProfileFormData, string>> = {};
  
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
  
  return errors;
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    isDirty
  } = useForm<ProfileFormData>({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    validate: validateProfile,
    onSubmit: async (data) => {
      // TODO: Implement profile update API call
      console.log('Updating profile:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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

      <div className="flex justify-end space-x-3">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

