import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { userService } from '../../services/user-service';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

interface UserProfile {
  userId: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  gender: string;
  studentId: string;
  teacherId: string;
  department: string;
  className: string;
  role: string;
  status: string;
  avatarUrl: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  birthdate?: string;
}

interface ProfilePageProps {
  isEditing?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isEditing: initialIsEditing = false }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setIsEditing(initialIsEditing);
    fetchUserProfile();
  }, [initialIsEditing]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getCurrentUser();
      if (response.code === 200 && response.data) {
        setUserProfile(response.data);
        setEditedProfile(response.data);
        // 更新localStorage中的用户信息
        localStorage.setItem('userProfile', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 尝试从localStorage获取用户信息
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
        setEditedProfile(JSON.parse(storedProfile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile(userProfile);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      const response = await userService.updateProfile(editedProfile);
      if (response.code === 200) {
        toast.success('个人信息更新成功');
        setUserProfile(editedProfile);
        localStorage.setItem('userProfile', JSON.stringify(editedProfile));
        setIsEditing(false);
      } else {
        toast.error(`更新失败: ${response.message}`);
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      toast.error('更新个人信息失败，请稍后重试');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedProfile) return;
    
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    try {
      const response = await userService.updatePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      
      if (response.code === 200) {
        toast.success('密码更新成功');
        setIsPasswordDialogOpen(false);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(`更新失败: ${response.message}`);
      }
    } catch (error) {
      console.error('更新密码失败:', error);
      toast.error('更新密码失败，请稍后重试');
    }
  };

  const getDashboardPath = () => {
    const role = userProfile?.role;
    switch (role) {
      case 'student':
        return '/student';
      case 'club_admin':
        return '/club-admin';
      case 'school_admin':
        return '/system-admin';
      default:
        return '/';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">无法加载用户信息</div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student':
        return '学生';
      case 'club_admin':
        return '社团管理员';
      case 'school_admin':
        return '系统管理员';
      default:
        return role;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
        return '男';
      case 'female':
        return '女';
      default:
        return '未设置';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center mb-6">
          <Link
            to={getDashboardPath()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回仪表盘
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>个人信息</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={editedProfile?.avatarUrl} 
                        alt={editedProfile?.realName}
                        className="object-cover"
                      />
                      <AvatarFallback>{editedProfile?.realName?.slice(0, 2)?.toUpperCase() || 'UN'}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="text-sm text-gray-500">
                        预览效果
                      </div>
                    )}
                  </div>
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={editedProfile?.avatarUrl} alt={editedProfile?.realName} />
                    <AvatarFallback>{editedProfile?.realName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-4">
                      <Label htmlFor="avatarUrl">头像URL</Label>
                      <Input
                        id="avatarUrl"
                        name="avatarUrl"
                        value={editedProfile?.avatarUrl || ''}
                        onChange={handleInputChange}
                        placeholder="头像URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="realName">姓名</Label>
                    <Input
                      id="realName"
                      name="realName"
                      value={editedProfile?.realName || ''}
                      onChange={handleInputChange}
                      placeholder="姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">性别</Label>
                    <Select
                      value={editedProfile?.gender || ''}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                      options={[
                        { value: 'male', label: '男' },
                        { value: 'female', label: '女' }
                      ]}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">学号</Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      value={editedProfile?.studentId || ''}
                      onChange={handleInputChange}
                      placeholder="学号"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">院系</Label>
                    <Input
                      id="department"
                      name="department"
                      value={editedProfile?.department || ''}
                      onChange={handleInputChange}
                      placeholder="院系"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="className">班级</Label>
                    <Input
                      id="className"
                      name="className"
                      value={editedProfile?.className || ''}
                      onChange={handleInputChange}
                      placeholder="班级"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editedProfile?.phone || ''}
                      onChange={handleInputChange}
                      placeholder="手机号"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.realName} />
                  <AvatarFallback>{userProfile.realName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">姓名</div>
                      <div className="font-medium">{userProfile.realName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">用户名</div>
                      <div className="font-medium">{userProfile.username}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">角色</div>
                      <div className="font-medium">{getRoleLabel(userProfile.role)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">性别</div>
                      <div className="font-medium">{getGenderLabel(userProfile.gender)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">学号</div>
                      <div className="font-medium">{userProfile.studentId || '未设置'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">院系</div>
                      <div className="font-medium">{userProfile.department || '未设置'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">班级</div>
                      <div className="font-medium">{userProfile.className || '未设置'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">状态</div>
                      <div className="font-medium">
                        {userProfile.status === 'active' ? '正常' : '禁用'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">联系方式</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">邮箱</div>
                        <div className="font-medium flex items-center">
                          {userProfile.email}
                          {userProfile.emailVerified && (
                            <span className="ml-2 text-xs text-green-500">已验证</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">手机号</div>
                        <div className="font-medium flex items-center">
                          {userProfile.phone || '未设置'}
                          {userProfile.phoneVerified && (
                            <span className="ml-2 text-xs text-green-500">已验证</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>取消</Button>
              <Button onClick={handleSaveProfile}>保存</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>修改密码</Button>
              <Button onClick={handleEditProfile}>编辑资料</Button>
            </>
          )}
        </div>
      </div>

      {/* 修改密码对话框 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">当前密码</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="请输入当前密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="请输入新密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="请再次输入新密码"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>取消</Button>
            <Button onClick={handleUpdatePassword}>确认修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage; 