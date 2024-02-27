const isProduction = process.env.NODE_ENV === 'production';

export const API_PATH = {
  BASE: isProduction
    ? 'https://eslteachertoolkitbe.vercel.app/api'
    : 'http://localhost:5050/api',
  SIGN_UP: '/auth/signup',
  SIGN_IN: '/auth/signin',
  CURRENT_USER: '/users/me',
  EXERCISES: '/exercises',
  EXERCISES_GENERATE: '/exercises/generate',
};
