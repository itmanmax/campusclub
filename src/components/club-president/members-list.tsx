import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserMinus, Crown, Star, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';

interface Member {
  userId: number | null;
  username: string;
  realName: string;
  avatarUrl: string;
  role: string;
  status: string;
  studentId: string;
  department: string;
  className: string;
  email: string;
  phone: string;
  gender: string;
  createdAt: string;
  lastLogin: string | null;
}

const ClubMembersList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('正在获取社团成员列表...');
      
      const response = await fetch('http://localhost:3001/api/admin/club/members', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团成员API响应状态:', response.status);
      const data = await response.json();
      console.log('社团成员API响应内容:', data);
      
      if (data && data.code === 200 && Array.isArray(data.data)) {
        setMembers(data.data);
      } else {
        setError((data && data.message) || '获取社团成员列表格式错误');
      }
    } catch (err) {
      console.error('获取社团成员列表失败:', err);
      setError('获取社团成员列表失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async (userId: number | null, role: string) => {
    if (!userId) {
      toast.error('用户ID不存在');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/club/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      
      const data = await response.json();
      
      if (data && data.code === 200) {
        toast.success('角色设置成功');
        fetchMembers(); // 重新获取列表
      } else {
        toast.error(`设置失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('设置角色失败:', err);
      toast.error('设置角色失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleRemoveMember = async (userId: number | null) => {
    if (!userId) {
      toast.error('用户ID不存在');
      return;
    }
    
    if (!window.confirm('确定要移除该成员吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/club/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      const data = await response.json();
      
      if (data && data.code === 200) {
        toast.success('成员移除成功');
        fetchMembers(); // 重新获取列表
      } else {
        toast.error(`移除失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('移除成员失败:', err);
      toast.error('移除成员失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'club_admin':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            社长
          </span>
        );
      case 'admin':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            <Star className="h-3 w-3 mr-1" />
            管理员
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            成员
          </span>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredMembers = members.filter(member => 
    member.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">社团成员管理</h2>
        <Button onClick={fetchMembers} variant="outline" size="sm">
          刷新列表
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="搜索成员姓名、学号或院系..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.username}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatarUrl} alt={member.realName} />
                  <AvatarFallback>{member.realName?.slice(0, 2) || member.username?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{member.realName}</h4>
                      <p className="text-sm text-gray-500">
                        {member.department} - {member.className}
                      </p>
                    </div>
                    {getRoleBadge(member.role)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 mt-2 text-sm text-gray-500">
                    <span>学号: {member.studentId}</span>
                    <span>用户名: {member.username}</span>
                    <span>加入时间: {formatDate(member.createdAt)}</span>
                    {member.lastLogin && <span>最后登录: {formatDate(member.lastLogin)}</span>}
                  </div>
                </div>
                {member.role !== 'club_admin' && (
                  <div className="flex items-center space-x-2">
                    {member.role === 'student' ? (
                      <Button
                        onClick={() => handleSetRole(member.userId, 'admin')}
                        variant="outline"
                        size="sm"
                      >
                        设为管理员
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSetRole(member.userId, 'student')}
                        variant="outline"
                        size="sm"
                      >
                        取消管理员
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRemoveMember(member.userId)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? '没有找到匹配的成员' : '暂无社团成员'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubMembersList; 