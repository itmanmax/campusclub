import axiosInstance from '../lib/axios-config';

export const systemAdminService = {
  // 用户管理
  manageUserStatus: async (userId: number, data: any) => {
    const response = await axiosInstance.post(
      `/admin/system/users/${userId}/status`,
      data
    );
    return response.data;
  },

  resetUserPassword: async (userId: number) => {
    const response = await axiosInstance.post(
      `/admin/system/users/${userId}/reset-password`,
      {}
    );
    return response.data;
  },

  // 社团管理
  reviewClub: async (clubId: number, data: any) => {
    const response = await axiosInstance.post(
      `/admin/system/clubs/${clubId}/review`,
      data
    );
    return response.data;
  },

  getPendingClubs: async () => {
    const response = await axiosInstance.get(`/admin/system/clubs/pending`);
    return response.data;
  },

  // 活动管理
  reviewActivity: async (activityId: number, data: any) => {
    const response = await axiosInstance.post(
      `/admin/system/activities/${activityId}/review`,
      data
    );
    return response.data;
  },

  getPendingActivities: async () => {
    const response = await axiosInstance.get(
      `/admin/system/activities/pending`
    );
    return response.data;
  },

  // 系统管理
  getStatistics: async () => {
    const response = await axiosInstance.get(`/admin/system/statistics`);
    return response.data;
  },

  getLogs: async () => {
    const response = await axiosInstance.get(`/admin/system/logs`);
    return response.data;
  },
}; 