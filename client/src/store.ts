import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

// User profile type definition representing authenticated account details.
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Authentication slice managing current logged-in user state.
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null as User | null },
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
});

// Toast notification slice managing global notification messages and status kinds.
const toastSlice = createSlice({
  name: 'toast',
  initialState: { message: '', kind: 'success' },
  reducers: {
    showToast(_state, action: PayloadAction<{ message: string; kind?: string }>) {
      return { message: action.payload.message, kind: action.payload.kind || 'success' };
    },
    hideToast(state) {
      state.message = '';
    },
  },
});

export const { setUser } = authSlice.actions;
export const { showToast, hideToast } = toastSlice.actions;

// Redux store configuration combining authentication and toast notification slices.
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    toast: toastSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;