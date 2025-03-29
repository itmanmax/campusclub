import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { userService } from '../../services/user-service';

interface LoginProps {
  onLogin: () => void;
}

interface LoginForm {
  username: string;
  password: string;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setIsLoading(true);

    try {
      console.log('尝试登录:', form);
      
      const response = await userService.login(form.username, form.password);
      console.log('登录响应:', response);
      setDebugInfo(JSON.stringify(response, null, 2));
      
      if (response.code === 200) {
        // 保存完整的用户信息
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userId', response.data.userId.toString());
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('userProfile', JSON.stringify(response.data));

        // 根据角色跳转到不同的仪表盘
        switch (response.data.role) {
          case 'student':
            navigate('/student');
            break;
          case 'club_admin':
            navigate('/club-admin');
            break;
          case 'school_admin':
            navigate('/system-admin');
            break;
          default:
            setError('未知的用户角色');
        }
      } else {
        setError(response.message || '登录失败');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      setError(err.message || '登录失败，请稍后重试');
      setDebugInfo(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-gray-900">欢迎</h1>
          <p className="mt-2 text-gray-600">登录以继续访问您的账户</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-medium text-center">登录</CardTitle>
            <CardDescription className="text-center">请输入您的用户名和密码进行登录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="text-sm text-red-500 text-center mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  用户名
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="请输入用户名"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    密码
                  </label>
                  <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900">
                    忘记密码？
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <CardFooter className="flex flex-col space-y-4 mt-6">
                <Button 
                  type="submit" 
                  className="h-12 w-full rounded-full bg-black text-white hover:bg-gray-800"
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
                <div className="text-center text-sm">
                  还没有账户？{" "}
                  <Link to="/register" className="font-medium text-gray-900 hover:underline">
                    注册
                  </Link>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium mb-2">调试信息:</h3>
            <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 