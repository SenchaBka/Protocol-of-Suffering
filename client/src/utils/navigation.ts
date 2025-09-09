// Navigation utilities
export const ROUTES = {
  LOGIN: "/login",
  GAME: "/",
} as const;

// Helper function to navigate programmatically
export const navigateTo = (path: string) => {
  window.location.href = path;
};

// Helper function to check current route
export const getCurrentPath = () => {
  return window.location.pathname;
};

// Helper function to check if user is on login page
export const isLoginPage = () => {
  return getCurrentPath() === ROUTES.LOGIN;
};

// Helper function to check if user is on game page
export const isGamePage = () => {
  return getCurrentPath() === ROUTES.GAME;
};
