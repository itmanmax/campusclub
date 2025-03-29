import axios from 'axios';

// 使用server.js的端口
const BASE_URL = 'http://localhost:3001/api';

export interface Club {
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
  teacherName?: string;
  presidentName?: string;
}

export const clubService = {
  getClubList: async () => {
    const response = await axios.get(`${BASE_URL}/clubs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getClubDetail: async (clubId: number) => {
    const response = await axios.get(`${BASE_URL}/clubs/${clubId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  joinClub: async (clubId: number) => {
    const response = await axios.post(
      `${BASE_URL}/clubs/${clubId}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  quitClub: async (clubId: number) => {
    const response = await axios.post(
      `${BASE_URL}/clubs/${clubId}/quit`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  applyClub: async (data: any) => {
    const response = await axios.post(`${BASE_URL}/clubs/apply`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getApplicationStatus: async (clubId: number) => {
    const response = await axios.get(`${BASE_URL}/clubs/${clubId}/application-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  withdrawApplication: async (clubId: number) => {
    const response = await axios.delete(`${BASE_URL}/clubs/${clubId}/withdraw`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getMyClubs: async () => {
    const response = await axios.get(`${BASE_URL}/clubs/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getJoinedClubs: async () => {
    const response = await axios.get(`${BASE_URL}/club-user/joined-clubs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },
}; 