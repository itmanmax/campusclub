import React, { useEffect, useState } from 'react';
import { Club } from '../../services/club-service';
import { clubAdminService } from '../../services/admin-service';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ClubInfo extends Omit<Club, 'clubId' | 'createdAt' | 'presidentId' | 'teacherId'> {
  introduction: string;
  contactEmail: string;
  contactPhone: string;
  meetingTime: string;
  meetingLocation: string;
  requirements: string;
}

const ClubInfoForm: React.FC = () => {
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    name: '',
    description: '',
    logoUrl: '',
    category: '',
    status: '',
    starRating: 0,
    introduction: '',
    contactEmail: '',
    contactPhone: '',
    meetingTime: '',
    meetingLocation: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      const response = await clubAdminService.getClubDetail();
      setClubInfo(response.data);
      setLoading(false);
    } catch (err) {
      setError('获取社团信息失败');
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClubInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await clubAdminService.updateClubInfo(clubInfo);
      alert('社团信息更新成功');
    } catch (err) {
      setError('更新社团信息失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>社团基本信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">社团名称</label>
              <input
                type="text"
                name="name"
                value={clubInfo.name}
                onChange={handleInputChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">社团类别</label>
              <input
                type="text"
                name="category"
                value={clubInfo.category}
                onChange={handleInputChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">联系邮箱</label>
              <input
                type="email"
                name="contactEmail"
                value={clubInfo.contactEmail}
                onChange={handleInputChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">联系电话</label>
              <input
                type="tel"
                name="contactPhone"
                value={clubInfo.contactPhone}
                onChange={handleInputChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">例会时间</label>
              <input
                type="text"
                name="meetingTime"
                value={clubInfo.meetingTime}
                onChange={handleInputChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">例会地点</label>
              <input
                type="text"
                name="meetingLocation"
                value={clubInfo.meetingLocation}
                onChange={handleInputChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">社团简介</label>
            <textarea
              name="introduction"
              value={clubInfo.introduction}
              onChange={handleInputChange}
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">社团要求</label>
            <textarea
              name="requirements"
              value={clubInfo.requirements}
              onChange={handleInputChange}
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? '保存中...' : '保存修改'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClubInfoForm; 