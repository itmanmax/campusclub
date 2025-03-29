import axios from 'axios';

const BASE_URL = '/api';

export const systemAdminService = {
  // 用户管理
  manageUserStatus: async (userId: number, data: any) => {
    const response = await axios.post(
      `${BASE_URL}/admin/system/users/${userId}/status`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  resetUserPassword: async (userId: number) => {
    const response = await axios.post(
      `${BASE_URL}/admin/system/users/${userId}/reset-password`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  // 社团管理
  reviewClub: async (clubId: number, data: any) => {
    const response = await axios.post(
      `${BASE_URL}/admin/system/clubs/${clubId}/review`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getPendingClubs: async () => {
    const response = await axios.get(`${BASE_URL}/admin/system/clubs/pending`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  // 活动管理
  reviewActivity: async (activityId: number, data: any) => {
    const response = await axios.post(
      `${BASE_URL}/admin/system/activities/${activityId}/review`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getPendingActivities: async () => {
    const response = await axios.get(
      `${BASE_URL}/admin/system/activities/pending`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  // 系统管理
  getStatistics: async () => {
    const response = await axios.get(`${BASE_URL}/admin/system/statistics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getLogs: async () => {
    const response = await axios.get(`${BASE_URL}/admin/system/logs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },
}; 