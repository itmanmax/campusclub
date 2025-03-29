import axios from 'axios';

const BASE_URL = '/api';

export const clubAdminService = {
  // 社团信息管理
  updateClubInfo: async (data: any) => {
    const response = await axios.put(`${BASE_URL}/admin/club`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getClubDetail: async () => {
    const response = await axios.get(`${BASE_URL}/admin/club`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  // 成员管理
  setMemberRole: async (userId: number, data: any) => {
    const response = await axios.put(
      `${BASE_URL}/admin/club/members/${userId}/role`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getMembers: async () => {
    const response = await axios.get(`${BASE_URL}/admin/club/members`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  removeMember: async (userId: number) => {
    const response = await axios.delete(
      `${BASE_URL}/admin/club/members/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  // 活动管理
  getActivityDetail: async (activityId: number) => {
    const response = await axios.get(
      `${BASE_URL}/admin/club/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  updateActivity: async (activityId: number, data: any) => {
    const response = await axios.put(
      `${BASE_URL}/admin/club/activities/${activityId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  cancelActivity: async (activityId: number) => {
    const response = await axios.delete(
      `${BASE_URL}/admin/club/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getActivities: async () => {
    const response = await axios.get(`${BASE_URL}/admin/club/activities`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  createActivity: async (data: any) => {
    const response = await axios.post(
      `${BASE_URL}/admin/club/activities`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  generateCheckInCode: async (activityId: number) => {
    const response = await axios.post(
      `${BASE_URL}/admin/club/activities/${activityId}/check-in-code`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getParticipants: async (activityId: number) => {
    const response = await axios.get(
      `${BASE_URL}/admin/club/activities/${activityId}/participants`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getCheckInStats: async (activityId: number) => {
    const response = await axios.get(
      `${BASE_URL}/admin/club/activities/${activityId}/check-in-stats`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },
}; 