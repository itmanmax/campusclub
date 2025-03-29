import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误捕获:', event.error);
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
});

console.log('React应用正在初始化...');
console.log('环境变量:', {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_URL: process.env.PUBLIC_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

try {
  console.log('开始渲染React应用...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React应用渲染完成');
} catch (error) {
  console.error('React应用渲染失败:', error);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
