import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { RefreshCw, Search, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Club {
  clubId: number;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  status: string;
  createdAt?: string;
  presidentId?: number;
  teacherId?: string;
  starRating: number;
  presidentName: string;
  teacherName: string;
}

const ClubManagement: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [pendingClubs, setPendingClubs] = useState<Club[]>([]);
  
  useEffect(() => {
    fetchClubs();
    fetchPendingClubs();
  }, []);

  useEffect(() => {
    // 过滤社团
    const filtered = clubs.filter(club => 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.presidentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClubs(filtered);
  }, [searchTerm, clubs]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取社团列表...');
      
      const response = await fetch('/api/club-user/all-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团列表API响应状态:', response.status);
      const data = await response.json();
      console.log('社团列表API响应内容:', data);
      
      if (data && data.code === 200 && data.data) {
        setClubs(data.data);
        setFilteredClubs(data.data);
      } else {
        setError((data && data.message) || '获取社团列表格式错误');
      }
    } catch (err) {
      console.error('获取社团列表失败:', err);
      setError('获取社团列表失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingClubs = async () => {
    try {
      console.log('开始获取待审核社团列表...');
      
      const response = await fetch('/api/admin/system/clubs/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('待审核社团API响应状态:', response.status);
      const data = await response.json();
      console.log('待审核社团API响应内容:', data);
      
      if (data && data.code === 200 && data.data) {
        setPendingClubs(data.data);
      } else {
        console.error('获取待审核社团列表格式错误:', data);
      }
    } catch (err) {
      console.error('获取待审核社团列表失败:', err);
    }
  };

  const handleReviewClub = async (clubId: number, status: string, comment: string = '审核通过') => {
    try {
      console.log(`开始审核社团 ${clubId}, 状态: ${status}`);
      
      const response = await fetch(`/api/admin/system/clubs/${clubId}/review?status=${status}&comment=${encodeURIComponent(comment)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团审核API响应状态:', response.status);
      const data = await response.json();
      console.log('社团审核API响应内容:', data);
      
      if (data && data.code === 200) {
        // 刷新社团列表和待审核社团列表
        fetchClubs();
        fetchPendingClubs();
        alert('审核操作成功');
      } else {
        alert(`审核失败: ${data.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('社团审核失败:', err);
      alert('社团审核失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      '体育': '体育',
      '艺术': '艺术',
      '学术': '学术',
      '科技': '科技',
      '公益': '公益',
      '文化': '文化',
      '其他': '其他'
    };
    return categoryMap[category] || category;
  };

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': '正常',
      'inactive': '禁用',
      'pending': '待审核',
      'rejected': '已拒绝'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const statusClassMap: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-gray-100 text-gray-800'
    };
    return `${statusClassMap[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs font-medium`;
  };

  const getCategoryClass = (category: string) => {
    const categoryClassMap: Record<string, string> = {
      '体育': 'bg-blue-100 text-blue-800',
      '艺术': 'bg-purple-100 text-purple-800',
      '学术': 'bg-indigo-100 text-indigo-800',
      '科技': 'bg-pink-100 text-pink-800',
      '公益': 'bg-green-100 text-green-800',
      '文化': 'bg-yellow-100 text-yellow-800',
      '其他': 'bg-gray-100 text-gray-800'
    };
    return `${categoryClassMap[category] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs font-medium`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '无效日期';
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '无效日期';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <Button onClick={fetchClubs} variant="outline" size="sm">
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 待审核社团部分 */}
      {pendingClubs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-600">待审核社团 ({pendingClubs.length})</h2>
          <div className="bg-yellow-50 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-200">
                <thead className="bg-yellow-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                      社团信息
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                      分类
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                      社长
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                      指导老师
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                      申请时间
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-yellow-200">
                  {pendingClubs.map((club) => (
                    <tr key={club.clubId} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={club.logoUrl || 'https://via.placeholder.com/40'} alt={club.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{club.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{club.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getCategoryClass(club.category)}>
                          {getCategoryName(club.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{club.presidentName}</div>
                        {club.presidentId && <div className="text-sm text-gray-500">ID: {club.presidentId}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{club.teacherName}</div>
                        {club.teacherId && <div className="text-sm text-gray-500">ID: {club.teacherId}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(club.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 hover:text-green-900 border-green-600 hover:bg-green-50"
                            onClick={() => handleReviewClub(club.clubId, 'active')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            通过
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-900 border-red-600 hover:bg-red-50"
                            onClick={() => handleReviewClub(club.clubId, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 所有社团部分 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">社团管理</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索社团名称/分类..."
                className="pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => { fetchClubs(); fetchPendingClubs(); }}>
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              创建社团
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    社团信息
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    社长
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    指导老师
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClubs.map((club) => (
                  <tr key={club.clubId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={club.logoUrl || 'https://via.placeholder.com/40'} alt={club.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{club.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{club.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getCategoryClass(club.category)}>
                        {getCategoryName(club.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.presidentName}</div>
                      {club.presidentId && <div className="text-sm text-gray-500">ID: {club.presidentId}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.teacherName}</div>
                      {club.teacherId && <div className="text-sm text-gray-500">ID: {club.teacherId}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusClass(club.status)}>
                        {getStatusName(club.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(club.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {club.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-yellow-600 hover:text-yellow-900"
                            onClick={() => handleReviewClub(club.clubId, 'inactive', '禁用社团')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleReviewClub(club.clubId, 'active', '启用社团')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubManagement; 