import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'react-hot-toast';
import { Upload, CheckCircle2, AlertCircle, Clock, Ban } from 'lucide-react';

interface ClubApplication {
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  teacherId: string;
}

const CLUB_CATEGORIES = ['体育', '艺术', '学术', '公益'] as const;

const CLUB_CATEGORY_OPTIONS = CLUB_CATEGORIES.map(category => ({
  value: category,
  label: category
}));

const STATUS_MAP = {
  'pending': '待审核',
  'active': '活跃中',
  'suspended': '已暂停',
  'closed': '已关闭'
} as const;

const ClubApply: React.FC = () => {
  const navigate = useNavigate();
  const [hasCreatedClub, setHasCreatedClub] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [clubId, setClubId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<ClubApplication>({
    name: '',
    description: '',
    logoUrl: '',
    category: '',
    teacherId: ''
  });

  const checkCreatedClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/club-user/my-created-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });

      const data = await response.json();
      
      if (data.code === 200) {
        setHasCreatedClub(true);
        if (data.data && data.data.length > 0) {
          setClubId(data.data[0].clubId);
          await checkApplicationStatus(data.data[0].clubId);
        }
      } else if (data.code === 500 && data.message.includes('还没有创建过社团')) {
        setHasCreatedClub(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('检查创建的社团失败:', err);
      setError('检查创建的社团失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkCreatedClubs();
  }, []);

  const checkApplicationStatus = async (id: number) => {
    try {
      const response = await fetch(`/api/clubs/${id}/application-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });

      const data = await response.json();
      if (data.code === 200) {
        setApplicationStatus(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('获取申请状态失败:', err);
      setError('获取申请状态失败');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clubs/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.code === 200) {
        toast.success('社团申请提交成功！');
        setClubId(data.data);
        await checkCreatedClubs();
      } else {
        toast.error(data.message || '申请提交失败');
        setError(data.message);
      }
    } catch (err) {
      console.error('提交申请失败:', err);
      toast.error('提交申请失败，请稍后重试');
      setError('提交申请失败');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 font-medium">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center animate-fade-in-up">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="hover:bg-red-50"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (hasCreatedClub && applicationStatus) {
    const statusConfig = {
      'active': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
      'pending': { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'suspended': { icon: Ban, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      'closed': { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' }
    };

    const StatusIcon = statusConfig[applicationStatus as keyof typeof statusConfig]?.icon || AlertCircle;
    const statusColor = statusConfig[applicationStatus as keyof typeof statusConfig]?.color || 'text-gray-600';
    const statusBgColor = statusConfig[applicationStatus as keyof typeof statusConfig]?.bgColor || 'bg-gray-50';

    return (
      <div className="max-w-2xl mx-auto px-4 animate-fade-in-up">
        <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">社团申请状态</CardTitle>
            <CardDescription>查看您的社团申请进度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${statusBgColor} flex items-center space-x-4`}>
                <StatusIcon className={`h-8 w-8 ${statusColor}`} />
                <div>
                  <p className="text-lg font-medium">
                    当前状态：
                    <span className={`ml-2 ${statusColor}`}>
                      {STATUS_MAP[applicationStatus as keyof typeof STATUS_MAP] || applicationStatus}
                    </span>
                  </p>
                  {applicationStatus === 'pending' && (
                    <p className="text-gray-600 mt-2">您的社团申请正在审核中，请耐心等待。</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="hover:bg-gray-50"
                >
                  返回
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 animate-fade-in-up">
      <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">申请创建社团</CardTitle>
          <CardDescription>填写以下信息来申请创建您的社团</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">社团名称</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="输入社团名称"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">社团简介</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[120px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="描述社团的宗旨、活动方向等"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-sm font-medium">社团Logo链接</Label>
              <div className="relative">
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  required
                  className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                  placeholder="输入logo图片链接"
                />
                <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">社团类别</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value }))}
                options={CLUB_CATEGORY_OPTIONS}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
                  <SelectValue placeholder="选择社团类别" />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_CATEGORY_OPTIONS.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacherId" className="text-sm font-medium">指导老师工号</Label>
              <Input
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="输入指导老师工号"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                提交申请
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubApply; 
