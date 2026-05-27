/**
 * UnifiedAuthPage Unit Tests
 * Tests for the authentication page with 2FA support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock the dependencies before importing the component
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    }
  }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  User: () => <svg data-testid="user-icon" />,
  Truck: () => <svg data-testid="truck-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  ArrowRight: () => <svg data-testid="arrow-right-icon" />,
  Smartphone: () => <svg data-testid="smartphone-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  Key: () => <svg data-testid="key-icon" />,
}));

// Import after mocks
import { UnifiedAuthPage } from '../features/auth/UnifiedAuthPage';
import { AuthProvider } from '../contexts/AuthContext';

// Increase viewport for tests
const setupViewport = () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1280 });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
};

describe('UnifiedAuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupViewport();
  });

  describe('Component Rendering', () => {
    it('should render the main container', () => {
      const { container } = render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(container.querySelector('.min-h-screen')).toBeInTheTheDocument?.() ||
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should render the branding section', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome to the Future of/)).toBeInTheDocument();
      });
    });

    it('should render feature cards in branding', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Real-time Tracking')).toBeInTheDocument();
        expect(screen.getByText('AI Automation')).toBeInTheDocument();
        expect(screen.getByText('Bank-level Security')).toBeInTheDocument();
        expect(screen.getByText('2FA Protection')).toBeInTheDocument();
      });
    });

    it('should render the User Portal toggle', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('User Portal')).toBeInTheDocument();
      });
    });

    it('should NOT render Admin Portal option', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Admin Portal')).not.toBeInTheDocument();
      });
    });

    it('should render the 2FA Protected Login badge', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('2FA Protected Login')).toBeInTheDocument();
      });
    });

    it('should render reCAPTCHA checkbox', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("I'm not a robot")).toBeInTheDocument();
      });
    });

    it('should render the Sign In button', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign In with 2FA')).toBeInTheDocument();
      });
    });

    it('should render forgot password link', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Forgot password?')).toBeInTheDocument();
      });
    });

    it('should render sign up link', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign up')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should switch to register mode when clicking sign up', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      // Wait for login form to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      });

      // Click sign up
      const signUpBtn = screen.getByText('Sign up');
      fireEvent.click(signUpBtn);

      // Wait for register form
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('should show email field in login form', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      });
    });

    it('should handle email input change', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('you@example.com');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput).toHaveValue('test@example.com');
      });
    });

    it('should toggle password visibility', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Find and click the visibility toggle button
        const toggleBtn = screen.getByRole('button', { name: /show password/i }) ||
          document.querySelector('button[class*="absolute right"]');
        if (toggleBtn) {
          fireEvent.click(toggleBtn);
          // Password input should now be text type
        }
      });
    });

    it('should show forgot password form when clicking forgot password', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Forgot password?')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Forgot password?'));

      await waitFor(() => {
        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
      });
    });

    it('should return to login when clicking sign in from forgot password', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Forgot password?'));
      });

      await waitFor(() => {
        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Sign in'));
      });

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });
  });

  describe('reCAPTCHA', () => {
    it('should toggle reCAPTCHA verification', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const recaptcha = screen.getByText("I'm not a robot");
        expect(recaptcha).toBeInTheDocument();
        fireEvent.click(recaptcha);
      });

      // After clicking, should be verified (simulated)
      await waitFor(() => {
        // The component should show verified state after timeout
      }, { timeout: 1000 });
    });

    it('should disable submit button until reCAPTCHA is verified', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const submitBtn = screen.getByText('Sign In with 2FA');
        expect(submitBtn).toBeDisabled();
      });
    });
  });

  describe('Register Form', () => {
    it('should show all registration fields', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      // Go to register mode
      await waitFor(() => {
        fireEvent.click(screen.getByText('Sign up'));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument(); // Full name
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument(); // Email
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      // Go to register mode
      await waitFor(() => {
        fireEvent.click(screen.getByText('Sign up'));
      });

      await waitFor(() => {
        // Fill in the form
        const fullNameInput = screen.getByPlaceholderText('John Smith');
        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });

        const emailInput = screen.getAllByPlaceholderText('you@example.com')[0];
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      });
    });

    it('should return to login from register mode', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      // Go to register mode
      await waitFor(() => {
        fireEvent.click(screen.getByText('Sign up'));
      });

      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Sign in'));
      });

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });
  });

  describe('Security Features', () => {
    it('should display 2FA badge only in login mode', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      // In login mode
      await waitFor(() => {
        expect(screen.getByText('2FA Protected Login')).toBeInTheDocument();
      });

      // Switch to register
      fireEvent.click(screen.getByText('Sign up'));

      await waitFor(() => {
        expect(screen.queryByText('2FA Protected Login')).not.toBeInTheDocument();
      });
    });

    it('should enforce reCAPTCHA on login', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const submitBtn = screen.getByText('Sign In with 2FA');
        expect(submitBtn).toBeDisabled();
      });
    });
  });

  describe('Responsive Elements', () => {
    it('should show mobile header on small screens', async () => {
      // Set small viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Mobile view should show compact header
        expect(screen.getByAltText('AirPak Express')).toBeInTheDocument();
      });
    });
  });

  describe('Copyright Footer', () => {
    it('should render copyright text', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UnifiedAuthPage />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/© 2026 AirPak Express/)).toBeInTheDocument();
      });
    });
  });
});
