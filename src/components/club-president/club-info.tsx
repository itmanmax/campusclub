import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'react-hot-toast';
import { Edit, Save, X } from 'lucide-react';

interface ClubInfoData {
  clubId: number;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  status: string;
  createdAt: string;
  presidentId: number;
  teacherId: string;
  starRating: number;
  teacherName: string;
  presidentName: string;
}

const ClubInfo: React.FC = () => {
  const [clubInfo, setClubInfo] = useState<ClubInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<ClubInfoData | null>(null);

  useEffect(() => {
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('正在获取社团信息...');
      
      const response = await fetch('http://localhost:3001/api/admin/club/info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团信息API响应状态:', response.status);
      const data = await response.json();
      console.log('社团信息API响应内容:', data);
      
      if (data && data.code === 200 && data.data) {
        setClubInfo(data.data);
        setEditedInfo(data.data);
      } else {
        setError((data && data.message) || '获取社团信息格式错误');
      }
    } catch (err) {
      console.error('获取社团信息失败:', err);
      setError('获取社团信息失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedInfo) return;
    
    const { name, value } = e.target;
    setEditedInfo({
      ...editedInfo,
      [name]: value
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    if (!editedInfo) return;
    
    setEditedInfo({
      ...editedInfo,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!editedInfo) return;
    
    try {
      setLoading(true);
      console.log('正在更新社团信息...');
      
      const response = await fetch('http://localhost:3001/api/admin/club', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedInfo)
      });
      
      console.log('更新社团信息API响应状态:', response.status);
      const data = await response.json();
      console.log('更新社团信息API响应内容:', data);
      
      if (data && data.code === 200) {
        setClubInfo(editedInfo);
        setIsEditing(false);
        toast.success('社团信息更新成功');
      } else {
        toast.error(`更新失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('更新社团信息失败:', err);
      toast.error('更新社团信息失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedInfo(clubInfo);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !clubInfo) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !clubInfo) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <Button onClick={fetchClubInfo} variant="outline" size="sm">
          重试
        </Button>
      </div>
    );
  }

  const categoryOptions = [
    { label: '体育', value: '体育' },
    { label: '艺术', value: '艺术' },
    { label: '学术', value: '学术' },
    { label: '科技', value: '科技' },
    { label: '公益', value: '公益' },
    { label: '文化', value: '文化' },
    { label: '其他', value: '其他' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">社团信息</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            编辑信息
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave} variant="default" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>社团的基本信息和描述</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">社团名称</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={editedInfo?.name || ''}
                  onChange={handleInputChange}
                  placeholder="请输入社团名称"
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{clubInfo?.name}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">社团分类</Label>
              {isEditing ? (
                <Select
                  value={editedInfo?.category || ''}
                  onValueChange={(value) => handleSelectChange(value, 'category')}
                  options={categoryOptions}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择社团分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="体育">体育</SelectItem>
                    <SelectItem value="艺术">艺术</SelectItem>
                    <SelectItem value="学术">学术</SelectItem>
                    <SelectItem value="科技">科技</SelectItem>
                    <SelectItem value="公益">公益</SelectItem>
                    <SelectItem value="文化">文化</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{clubInfo?.category}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">社团描述</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  name="description"
                  value={editedInfo?.description || ''}
                  onChange={handleInputChange}
                  placeholder="请输入社团描述"
                  rows={4}
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                  {clubInfo?.description}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">社团Logo URL</Label>
              {isEditing ? (
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={editedInfo?.logoUrl || ''}
                  onChange={handleInputChange}
                  placeholder="请输入Logo URL"
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{clubInfo?.logoUrl}</div>
              )}
            </div>
            
            {clubInfo?.logoUrl && (
              <div className="mt-4">
                <Label>Logo预览</Label>
                <div className="mt-2 border rounded-md p-4 flex justify-center">
                  <img 
                    src={isEditing ? editedInfo?.logoUrl : clubInfo?.logoUrl} 
                    alt="社团Logo" 
                    className="h-32 w-32 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Logo';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>管理信息</CardTitle>
            <CardDescription>社团的管理相关信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>社团状态</Label>
              <div className="p-2 border rounded-md bg-gray-50">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  clubInfo?.status === 'active' ? 'bg-green-100 text-green-800' : 
                  clubInfo?.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {clubInfo?.status === 'active' ? '正常' : 
                   clubInfo?.status === 'inactive' ? '禁用' : 
                   clubInfo?.status === 'pending' ? '待审核' : clubInfo?.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>创建时间</Label>
              <div className="p-2 border rounded-md bg-gray-50">
                {clubInfo?.createdAt ? formatDate(clubInfo.createdAt) : '未知'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>社长信息</Label>
              <div className="p-2 border rounded-md bg-gray-50">
                {clubInfo?.presidentName} (ID: {clubInfo?.presidentId})
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacherId">指导老师工号</Label>
              {isEditing ? (
                <Input
                  id="teacherId"
                  name="teacherId"
                  value={editedInfo?.teacherId || ''}
                  onChange={handleInputChange}
                  placeholder="请输入指导老师工号"
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{clubInfo?.teacherId}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacherName">指导老师姓名</Label>
              {isEditing ? (
                <Input
                  id="teacherName"
                  name="teacherName"
                  value={editedInfo?.teacherName || ''}
                  onChange={handleInputChange}
                  placeholder="请输入指导老师姓名"
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{clubInfo?.teacherName}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>社团评分</Label>
              <div className="p-2 border rounded-md bg-gray-50 flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{clubInfo?.starRating || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubInfo; 