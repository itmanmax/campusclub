import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  CalendarDays,
  MapPin,
  Users,
  Edit2,
  Trash2,
  QrCode,
  CheckCircle,
  Plus,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Activity {
  activityId: number;
  clubId: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  status: string;
  creditPoints: number;
  coverImage: string;
  currentParticipants: number;
  clubName: string;
  isUserParticipated: boolean | null;
  description?: string;
}

interface CreateActivityForm {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  creditPoints: number;
  coverImage: string;
  description?: string;
}

interface Participant {
  userId: number | null;
  username: string;
  realName: string;
  email: string;
  phone: string;
  gender: string;
  studentId: string;
  department: string;
  className: string;
  role: string;
  status: string;
  avatarUrl: string;
}

interface CheckInStats {
  totalParticipants: number;
  checkedInParticipants: number;
}

const activityTypeOptions = [
  { label: '讲座', value: '讲座' },
  { label: '比赛', value: '比赛' },
  { label: '展览', value: '展览' },
  { label: '聚会', value: '聚会' },
  { label: '培训', value: '培训' },
  { label: '其他', value: '其他' }
];

const statusFilterOptions = [
  { label: '全部活动', value: 'all' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' }
];

const ClubActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [checkInStats, setCheckInStats] = useState<CheckInStats | null>(null);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  
  const [newActivity, setNewActivity] = useState<CreateActivityForm>({
    title: '',
    type: '讲座',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: 50,
    creditPoints: 1,
    coverImage: 'https://via.placeholder.com/300x200?text=活动封面',
    description: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('正在获取社团活动列表...');
      
      const response = await fetch('http://localhost:3001/api/admin/club/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团活动API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('社团活动API响应内容:', data);
      
      if (data && Array.isArray(data.data)) {
        setActivities(data.data);
      } else if (data && Array.isArray(data)) {
        setActivities(data);
      } else {
        setError('获取社团活动列表格式错误');
      }
    } catch (err) {
      console.error('获取社团活动列表失败:', err);
      setError('获取社团活动列表失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    try {
      // 验证表单
      if (!newActivity.title || !newActivity.startTime || !newActivity.endTime || !newActivity.location) {
        toast.error('请填写所有必填字段');
        return;
      }
      
      // 验证日期
      const startDate = new Date(newActivity.startTime);
      const endDate = new Date(newActivity.endTime);
      
      if (startDate >= endDate) {
        toast.error('结束时间必须晚于开始时间');
        return;
      }
      
      console.log('正在创建社团活动...');
      console.log('活动数据:', newActivity);
      
      const response = await fetch('http://localhost:3001/api/admin/club/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newActivity)
      });
      
      console.log('创建活动API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('创建活动API响应内容:', data);
      
      if (data && data.code === 200) {
        toast.success('活动创建成功');
        setCreateDialogOpen(false);
        // 重置表单
        setNewActivity({
          title: '',
          type: '讲座',
          startTime: '',
          endTime: '',
          location: '',
          maxParticipants: 50,
          creditPoints: 1,
          coverImage: 'https://via.placeholder.com/300x200?text=活动封面',
          description: ''
        });
        // 重新获取活动列表
        fetchActivities();
      } else {
        toast.error(`创建失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('创建活动失败:', err);
      toast.error('创建活动失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleGenerateCheckInCode = async (activityId: number) => {
    try {
      console.log('正在生成签到码...');
      
      const response = await fetch(`http://localhost:3001/api/admin/club/activities/${activityId}/check-in-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('生成签到码API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('生成签到码API响应内容:', data);
      
      if (data && data.code === 200) {
        setCheckInCode(data.data);
        toast.success('签到码生成成功');
      } else {
        toast.error(`生成失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('生成签到码失败:', err);
      toast.error('生成签到码失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCancelActivity = async (activityId: number) => {
    if (!window.confirm('确定要取消该活动吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      console.log('正在取消活动...');
      
      const response = await fetch(`http://localhost:3001/api/admin/club/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('取消活动API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('取消活动API响应内容:', data);
      
      if (data && data.code === 200) {
        toast.success('活动已取消');
        // 重新获取活动列表
        fetchActivities();
      } else {
        toast.error(`取消失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('取消活动失败:', err);
      toast.error('取消活动失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleViewParticipants = async (activity: Activity) => {
    try {
      setSelectedActivity(activity);
      setParticipantsLoading(true);
      setParticipantsDialogOpen(true);
      
      console.log('正在获取活动参与者列表...');
      
      // 获取参与者列表
      const participantsResponse = await fetch(`http://localhost:3001/api/admin/club/activities/${activity.activityId}/participants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      if (!participantsResponse.ok) {
        throw new Error(`获取参与者列表失败: ${participantsResponse.status}`);
      }
      
      const participantsData = await participantsResponse.json();
      console.log('参与者列表数据:', participantsData);
      
      if (participantsData && participantsData.code === 200 && Array.isArray(participantsData.data)) {
        setParticipants(participantsData.data);
      } else {
        toast.error('获取参与者列表失败');
      }
      
      // 获取签到统计
      const statsResponse = await fetch(`http://localhost:3001/api/admin/club/activities/${activity.activityId}/check-in-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      if (!statsResponse.ok) {
        throw new Error(`获取签到统计失败: ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      console.log('签到统计数据:', statsData);
      
      if (statsData && statsData.code === 200 && statsData.data) {
        setCheckInStats(statsData.data);
      } else {
        toast.error('获取签到统计失败');
      }
    } catch (err) {
      console.error('获取活动参与者数据失败:', err);
      toast.error('获取活动参与者数据失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setParticipantsLoading(false);
    }
  };

  const getStatusBadge = (status: string, startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    let displayStatus = status;
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    if (status === 'approved') {
      if (now < start) {
        displayStatus = '即将开始';
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
      } else if (now >= start && now <= end) {
        displayStatus = '进行中';
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
      } else {
        displayStatus = '已结束';
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
      }
    } else if (status === 'draft') {
      displayStatus = '草稿';
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    } else if (status === 'pending') {
      displayStatus = '待审核';
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
    } else if (status === 'rejected') {
      displayStatus = '已拒绝';
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    } else if (status === 'cancelled') {
      displayStatus = '已取消';
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
        {displayStatus}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch (e) {
      return dateString;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setNewActivity(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  // 过滤活动
  const filteredActivities = activities.filter(activity => {
    // 搜索条件
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.type && activity.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 状态过滤
    let matchesStatus = true;
    const now = new Date();
    const start = new Date(activity.startTime);
    const end = new Date(activity.endTime);
    
    if (statusFilter === 'upcoming') {
      matchesStatus = now < start && activity.status === 'approved';
    } else if (statusFilter === 'ongoing') {
      matchesStatus = now >= start && now <= end && activity.status === 'approved';
    } else if (statusFilter === 'ended') {
      matchesStatus = now > end && activity.status === 'approved';
    } else if (statusFilter === 'draft') {
      matchesStatus = activity.status === 'draft';
    } else if (statusFilter === 'pending') {
      matchesStatus = activity.status === 'pending';
    }
    
    return matchesSearch && matchesStatus;
  });

  if (loading && activities.length === 0) {
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
        <h2 className="text-2xl font-bold">社团活动管理</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              创建新活动
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>创建新活动</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">活动名称 *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newActivity.title}
                    onChange={handleInputChange}
                    placeholder="请输入活动名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">活动类型 *</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    options={activityTypeOptions}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="选择活动类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="讲座">讲座</SelectItem>
                      <SelectItem value="比赛">比赛</SelectItem>
                      <SelectItem value="展览">展览</SelectItem>
                      <SelectItem value="聚会">聚会</SelectItem>
                      <SelectItem value="培训">培训</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">开始时间 *</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={newActivity.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">结束时间 *</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={newActivity.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">活动地点 *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={newActivity.location}
                    onChange={handleInputChange}
                    placeholder="请输入活动地点"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">最大参与人数 *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={newActivity.maxParticipants}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditPoints">学分值 *</Label>
                  <Input
                    id="creditPoints"
                    name="creditPoints"
                    type="number"
                    min="0"
                    step="0.5"
                    value={newActivity.creditPoints}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImage">封面图片URL</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    value={newActivity.coverImage}
                    onChange={handleInputChange}
                    placeholder="请输入封面图片URL"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">活动描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newActivity.description || ''}
                  onChange={handleInputChange}
                  placeholder="请输入活动描述"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
              <Button onClick={handleCreateActivity}>创建活动</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="搜索活动名称、地点或类型..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
            options={statusFilterOptions}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="筛选状态" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部活动</SelectItem>
              <SelectItem value="upcoming">即将开始</SelectItem>
              <SelectItem value="ongoing">进行中</SelectItem>
              <SelectItem value="ended">已结束</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {checkInCode && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">签到码</h3>
            <div className="text-3xl font-bold text-green-600 mb-4">{checkInCode}</div>
            <p className="text-sm text-gray-600">请将此码分享给参与者进行签到</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setCheckInCode(null)}
            >
              关闭
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {filteredActivities.map((activity) => (
          <Card key={activity.activityId}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold">{activity.title}</h4>
                    <p className="text-sm text-gray-500">{activity.type}</p>
                  </div>
                  {getStatusBadge(activity.status, activity.startTime, activity.endTime)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <div>{formatDateTime(activity.startTime)}</div>
                      <div>至 {formatDateTime(activity.endTime)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {activity.currentParticipants}/{activity.maxParticipants} 人
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm">
                    <span className="text-orange-500 font-medium">
                      {activity.creditPoints} 学分
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activity.status === 'approved' && new Date() < new Date(activity.startTime) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center text-red-500 hover:text-red-600"
                          onClick={() => handleCancelActivity(activity.activityId)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          取消
                        </Button>
                      </>
                    )}
                    {activity.status === 'approved' && 
                     new Date() >= new Date(activity.startTime) && 
                     new Date() <= new Date(activity.endTime) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => handleGenerateCheckInCode(activity.activityId)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          生成签到码
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => handleViewParticipants(activity)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          签到统计
                        </Button>
                      </>
                    )}
                    {activity.status === 'approved' && new Date() > new Date(activity.endTime) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => handleViewParticipants(activity)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        查看参与者
                      </Button>
                    )}
                    {activity.status === 'draft' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          编辑
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                        >
                          提交审核
                        </Button>
                      </>
                    )}
                    {activity.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-red-500 hover:text-red-600"
                        onClick={() => handleCancelActivity(activity.activityId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        撤回申请
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter !== 'all' ? '没有找到匹配的活动' : '暂无活动'}
          </div>
        )}
      </div>
      
      {/* 参与者列表对话框 */}
      <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedActivity ? `${selectedActivity.title} - 参与者列表` : '参与者列表'}
            </DialogTitle>
          </DialogHeader>
          
          {participantsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {checkInStats && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">签到统计</h3>
                        <p className="text-sm text-gray-600">总参与人数: {checkInStats.totalParticipants}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{checkInStats.checkedInParticipants}/{checkInStats.totalParticipants}</div>
                        <p className="text-sm text-gray-600">已签到/总人数</p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${checkInStats.totalParticipants > 0 
                            ? (checkInStats.checkedInParticipants / checkInStats.totalParticipants) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {participants.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学号</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">班级</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系方式</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((participant, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={participant.avatarUrl || 'https://via.placeholder.com/40'} alt="" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{participant.realName}</div>
                                <div className="text-sm text-gray-500">{participant.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{participant.studentId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{participant.department}</div>
                            <div className="text-sm text-gray-500">{participant.className}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{participant.email}</div>
                            <div>{participant.phone}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无参与者
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setParticipantsDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubActivitiesList; 