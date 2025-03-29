import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { userApi } from '../../lib/api';

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  realName: string;
  email: string;
  verifyCode: string;
  gender: 'male' | 'female';
  phone: string;
  studentId: string;
  teacherId: string;
  department: string;
  className: string;
  role: 'student' | 'teacher';
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    email: '',
    verifyCode: '',
    gender: 'male',
    phone: '',
    studentId: '',
    teacherId: '',
    department: '计算机科学与技术学院',
    className: '',
    role: 'student'
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    // 验证密码是否匹配
    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不匹配');
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('尝试注册:', form);
      
      // 构建注册请求数据
      const registerData = {
        username: form.username,
        password: form.password,
        realName: form.realName,
        email: form.email,
        verifyCode: form.verifyCode,
        gender: form.gender,
        phone: form.phone,
        studentId: form.role === 'student' ? form.studentId : '',
        teacherId: form.role === 'teacher' ? form.teacherId : '',
        department: form.department,
        className: form.className,
        role: form.role
      };
      
      const response = await userApi.register(registerData);
      console.log('注册响应:', response);
      setDebugInfo(JSON.stringify(response, null, 2));
      
      // 注册成功，显示成功消息并跳转到登录页面
      alert('注册成功！请登录');
      navigate('/login');
    } catch (err: any) {
      console.error('注册错误:', err);
      setError(err.message || '注册失败，请稍后重试');
      setDebugInfo(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-gray-900">创建账户</h1>
          <p className="mt-2 text-gray-600">注册以开始使用</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-medium text-center">注册</CardTitle>
            <CardDescription className="text-center">请输入您的信息创建账户</CardDescription>
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
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="realName"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  真实姓名
                </label>
                <input
                  id="realName"
                  name="realName"
                  type="text"
                  value={form.realName}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="请输入真实姓名"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  角色
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                </select>
              </div>
              {form.role === 'student' ? (
                <div className="space-y-2">
                  <label
                    htmlFor="studentId"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    学号
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={form.studentId}
                    onChange={handleInputChange}
                    className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请输入学号"
                    required={form.role === 'student'}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="teacherId"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    教师编号
                  </label>
                  <input
                    id="teacherId"
                    name="teacherId"
                    type="text"
                    value={form.teacherId}
                    onChange={handleInputChange}
                    className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请输入教师编号"
                    required={form.role === 'teacher'}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label
                  htmlFor="department"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  院系
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="请输入院系"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="className"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  班级
                </label>
                <input
                  id="className"
                  name="className"
                  type="text"
                  value={form.className}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="请输入班级"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="gender"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  性别
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  手机号
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="请输入手机号"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  邮箱
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="verifyCode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    id="verifyCode"
                    name="verifyCode"
                    type="text"
                    value={form.verifyCode}
                    onChange={handleInputChange}
                    className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请输入验证码"
                    required
                  />
                  <VerificationButton email={form.email} />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
              <CardFooter className="flex flex-col space-y-4 mt-6">
                <Button 
                  type="submit" 
                  className="h-12 w-full rounded-full bg-black text-white hover:bg-gray-800"
                  disabled={isLoading}
                >
                  {isLoading ? '注册中...' : '创建账户'}
                </Button>
                <div className="text-center text-sm">
                  已有账户？{" "}
                  <Link to="/login" className="font-medium text-gray-900 hover:underline">
                    登录
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

interface VerificationButtonProps {
  email: string;
}

function VerificationButton({ email }: VerificationButtonProps) {
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (sending || countdown > 0 || !email) return;
    
    if (!email) {
      setError('请先输入邮箱');
      return;
    }
    
    setSending(true);
    setError('');

    // 设置请求超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时，但验证码可能已发送，请稍后查看邮箱')), 30000);
    });

    try {
      // 使用Promise.race来处理可能的超时情况
      await Promise.race([
        userApi.sendVerifyCode(email),
        timeoutPromise
      ]);
      
      // 开始倒计时，增加到120秒
      setCountdown(120);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('发送验证码错误:', err);
      
      // 如果是超时错误或网络错误，仍然开始倒计时，因为验证码可能已经发送
      if (err.message.includes('超时') || err.message.includes('网络错误')) {
        setError(err.message);
        // 即使超时也开始倒计时，因为验证码可能已经发送成功
        setCountdown(120);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(err.message || '发送验证码失败');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={sendCode}
        disabled={sending || countdown > 0 || !email}
        className="h-12 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? "发送中..." : countdown > 0 ? `${countdown}秒` : "获取验证码"}
      </Button>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </>
  );
} 