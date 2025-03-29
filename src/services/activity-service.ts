import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

export interface Activity {
  activityId: number;
  clubId: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  creditPoints: number;
  coverImage: string;
  currentParticipants?: number;
  clubName?: string;
  isUserParticipated?: boolean;
  description?: string;
}

export const activityService = {
  getAllActivities: async () => {
    const response = await axios.get(`${BASE_URL}/clubs/activities`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getActivityDetail: async (activityId: number) => {
    const response = await axios.get(`${BASE_URL}/clubs/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  signUpActivity: async (activityId: number) => {
    const response = await axios.post(
      `${BASE_URL}/clubs/activities/${activityId}/sign-up`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  cancelSignUp: async (activityId: number) => {
    const response = await axios.delete(
      `${BASE_URL}/clubs/activities/${activityId}/sign-up`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  checkInActivity: async (activityId: number) => {
    const response = await axios.post(
      `${BASE_URL}/clubs/activities/${activityId}/check-in`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getMyActivities: async () => {
    const response = await axios.get(`${BASE_URL}/clubs/activities/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },
}; 