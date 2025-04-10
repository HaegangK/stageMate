import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import CreatePostPage from './pages/CreatePostPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import MyPage from './pages/MyPage';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4B4B', // 빨간색 계열
    },
    secondary: {
      main: '#2C3E50', // 진한 파란색 계열
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/" element={<Navigate to="/posts" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
