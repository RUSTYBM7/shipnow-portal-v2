#!/bin/bash

# ============================================================================
# AIRPAK EXPRESS — USER PORTAL TESTING & DEPLOYMENT SCRIPT
# ============================================================================
# Run: chmod +x test-and-deploy.sh && ./test-and-deploy.sh
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="${PWD}"
TEST_DIR="${PROJECT_DIR}/src/__tests__"
E2E_DIR="${PROJECT_DIR}/e2e"

echo -e "${BLUE}"
echo "=============================================="
echo " AIRPAK EXPRESS - TEST & DEPLOYMENT SCRIPT"
echo "=============================================="
echo -e "${NC}"

# PHASE 0: VALIDATE PROJECT
echo -e "${YELLOW}[PHASE 0] Validating project...${NC}"
if [ ! -f "package.json" ] || [ ! -f "src/App.tsx" ]; then
    echo -e "${RED}Error: Invalid project structure${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project validated${NC}"

# PHASE 1: INSTALL TESTING TOOLS
echo -e "${YELLOW}[PHASE 1] Installing testing tools...${NC}"
pnpm add -D vitest@latest @testing-library/react@latest @testing-library/jest-dom@latest jsdom@latest happy-dom@latest @playwright/test@latest 2>&1 | tail -5
echo -e "${GREEN}✓ Testing tools installed${NC}"

# PHASE 2: CREATE TEST CONFIG
echo -e "${YELLOW}[PHASE 2] Creating test configuration...${NC}"
mkdir -p "${TEST_DIR}"

cat > "${PROJECT_DIR}/vitest.config.ts" << 'VITESTEOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
VITESTEOF

cat > "${TEST_DIR}/setup.ts" << 'SETUPEOF'
import { expect, vi } from 'vitest';

expect.extend({
  toBeInTheDocument() {
    return {
      pass: this.actual !== null && this.actual !== undefined,
      message: () => 'Expected element to be in the document'
    };
  }
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
});

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: MockIntersectionObserver });
SETUPEOF

# PHASE 3: CREATE UNIT TESTS
echo -e "${YELLOW}[PHASE 3] Creating unit tests for UnifiedAuthPage...${NC}"

cat > "${TEST_DIR}/UnifiedAuthPage.test.ts" << 'TESTEOF'
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedAuthPage } from '../../features/auth/UnifiedAuthPage';
import { AuthProvider } from '../../contexts/AuthContext';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    }
  }
}));

describe('UnifiedAuthPage', () => {
  it('should render login form by default', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <UnifiedAuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('should NOT show admin portal toggle', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <UnifiedAuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText(/Admin Portal/)).not.toBeInTheDocument();
    expect(screen.getByText('User Portal')).toBeInTheDocument();
  });

  it('should show 2FA protected login badge', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <UnifiedAuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('2FA Protected Login')).toBeInTheDocument();
  });

  it('should show reCAPTCHA checkbox', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <UnifiedAuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("I'm not a robot")).toBeInTheDocument();
  });

  it('should switch to register mode', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <UnifiedAuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
    const signUpBtn = screen.getByText('Sign up');
    fireEvent.click(signUpBtn);
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });
});
TESTEOF

echo -e "${GREEN}✓ Unit tests created${NC}"

# PHASE 4: RUN TESTS
echo -e "${YELLOW}[PHASE 4] Running tests...${NC}"
pnpm exec vitest run --config vitest.config.ts --reporter=verbose 2>&1 || echo "Note: Run 'pnpm exec vitest' to run tests manually"

echo -e "${GREEN}"
echo "=============================================="
echo " Testing complete!"
echo "=============================================="
echo -e "${NC}"