import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">访问未授权</h1>
        <p className="mb-8 text-lg text-gray-600">
          抱歉，您没有权限访问此页面。
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate(-1)}>返回上一页</Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 