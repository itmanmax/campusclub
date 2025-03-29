const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body) {
    console.log('Body:', req.body);
  }
  next();
});

// 创建一个通用的API请求处理函数
const handleApiRequest = async (req, res, targetUrl, method = 'GET', customHeaders = {}, callback) => {
  try {
    console.log(`处理${method}请求:`, targetUrl);
    console.log('请求体:', req.body);
    console.log('请求头:', req.headers);

    const headers = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // 如果有Authorization头且不是公开API，添加到请求中
    if (req.headers.authorization && !customHeaders.hasOwnProperty('Authorization')) {
      headers.Authorization = req.headers.authorization;
    }

    console.log('发送到后端的请求头:', headers);

    const config = {
      method,
      url: targetUrl,
      headers,
      data: method !== 'GET' ? req.body : undefined,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // 接受所有非500错误的响应
      }
    };

    const response = await axios(config);
    
    console.log('后端响应状态:', response.status);
    console.log('后端响应头:', response.headers);
    console.log('后端响应数据:', response.data);
    
    // 如果后端返回了数据但没有code字段，添加默认的成功状态
    if (response.data && !response.data.hasOwnProperty('code')) {
      response.data = {
        code: 200,
        message: 'success',
        data: response.data
      };
    }
    
    if (callback) {
      callback(null, response.data);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error('请求错误:', error.message);
    if (error.response) {
      console.error('错误响应状态:', error.response.status);
      console.error('错误响应头:', error.response.headers);
      console.error('错误响应数据:', error.response.data);
      
      if (callback) {
        callback(error, error.response.data);
      } else {
        res.status(error.response.status).json(error.response.data || { 
          code: error.response.status,
          message: '请求失败',
          data: null
        });
      }
    } else {
      console.error('网络错误:', error);
      
      if (callback) {
        callback(error, null);
      } else {
        res.status(500).json({ 
          code: 500,
          message: '服务器错误: ' + error.message,
          data: null
        });
      }
    }
  }
};

// 登录请求
app.post('/api/user/login', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/user/login', 'POST');
});

// 注册请求
app.post('/api/user/register', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/user/register', 'POST');
});

// 发送验证码请求
app.post('/api/user/send-verify-code', (req, res) => {
  const targetUrl = `http://localhost:8080/api/user/send-verify-code?email=${req.query.email}`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 验证邮箱验证码
app.post('/api/user/verify-email', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/user/verify-email', 'POST');
});

// 获取当前用户信息
app.get('/api/user/profile', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/user/profile', 'GET');
});

// 更新用户个人信息
app.put('/api/user/profile', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/user/profile', 'PUT');
});

// 更新用户密码
app.put('/api/user/password', (req, res) => {
  const targetUrl = `http://localhost:8080/api/user/password?oldPassword=${req.query.oldPassword}&newPassword=${req.query.newPassword}`;
  handleApiRequest(req, res, targetUrl, 'PUT');
});

// 获取所有社团活动  ---不使用！！
app.get('/api/clubs/activities', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/clubs/activities', 'GET');
});

// 获取特定社团活动
app.get('/api/clubs/activities/:id', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/activities/${req.params.id}`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 报名社团活动
app.post('/api/clubs/activities/:id/sign-up', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/activities/${req.params.id}/sign-up`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 取消报名社团活动
app.delete('/api/clubs/activities/:id/sign-up', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/activities/${req.params.id}/sign-up`;
  handleApiRequest(req, res, targetUrl, 'DELETE');
});

// 活动签到
app.post('/api/clubs/activities/:id/check-in', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/activities/${req.params.id}/check-in`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 获取已加入的社团列表
app.get('/api/club-user/joined-clubs', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/club-user/joined-clubs', 'GET');
});

// 获取所有社团列表（公开API）
app.get('/api/club-user/all-clubs', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/club-user/all-clubs', 'GET');
});

// 获取社团列表
app.get('/api/clubs', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/clubs', 'GET');
});

// 获取社团详情
app.get('/api/club-user/:id', (req, res) => {
  const targetUrl = `http://localhost:8080/api/club-user/${req.params.id}`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 获取社团管理员的社团信息
app.get('/api/admin/club/info', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/club/info', 'GET');
});

// 更新社团管理员的社团信息
app.put('/api/admin/club', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/club', 'PUT');
});

// 获取社团成员列表
app.get('/api/admin/club/members', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/club/members', 'GET');
});

// 获取社团活动列表
app.get('/api/admin/club/activities', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/club/activities', 'GET');
});

// 获取特定社团活动详情
app.get('/api/admin/club/activities/:id', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/activities/${req.params.id}`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 创建社团活动
app.post('/api/admin/club/activities', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/club/activities', 'POST');
});

// 更新社团活动
app.put('/api/admin/club/activities/:id', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/activities/${req.params.id}`;
  handleApiRequest(req, res, targetUrl, 'PUT');
});

// 取消社团活动
app.delete('/api/admin/club/activities/:id', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/activities/${req.params.id}`;
  handleApiRequest(req, res, targetUrl, 'DELETE');
});

// 生成活动签到码
app.post('/api/admin/club/activities/:id/check-in-code', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/activities/${req.params.id}/check-in-code`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 获取活动参与者列表
app.get('/api/admin/club/activities/:id/participants', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/activities/${req.params.id}/participants`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 获取活动签到统计
app.get('/api/admin/club/activities/:id/check-in-stats', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/activities/${req.params.id}/check-in-stats`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 设置社团成员角色
app.put('/api/admin/club/members/:id/role', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/members/${req.params.id}/role`;
  handleApiRequest(req, res, targetUrl, 'PUT');
});

// 移除社团成员
app.delete('/api/admin/club/members/:id', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/club/members/${req.params.id}`;
  handleApiRequest(req, res, targetUrl, 'DELETE');
});

// 加入社团
app.post('/api/clubs/:id/join', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/${req.params.id}/join`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 退出社团
app.post('/api/clubs/:id/quit', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/${req.params.id}/quit`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 申请创建社团
app.post('/api/clubs/apply', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/clubs/apply', 'POST');
});

// 获取申请状态
app.get('/api/clubs/:id/application-status', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/${req.params.id}/application-status`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 撤回申请
app.delete('/api/clubs/:id/withdraw', (req, res) => {
  const targetUrl = `http://localhost:8080/api/clubs/${req.params.id}/withdraw`;
  handleApiRequest(req, res, targetUrl, 'DELETE');
});

// 获取所有社团列表（需要认证）
app.get('/api/clubs/all', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/clubs/all', 'GET');
});

// 获取待审核社团列表
app.get('/api/admin/system/clubs/pending', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/system/clubs/pending', 'GET');
});

// 社团审核
app.post('/api/admin/system/clubs/:id/review', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/system/clubs/${req.params.id}/review?status=${req.query.status}&comment=${encodeURIComponent(req.query.comment || '')}`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 获取待审核活动列表
app.get('/api/admin/system/activities/pending', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/system/activities/pending', 'GET');
});

// 活动审核
app.post('/api/admin/system/activities/:id/review', (req, res) => {
  const targetUrl = `http://localhost:8080/api/admin/system/activities/${req.params.id}/review?status=${req.query.status}&comment=${encodeURIComponent(req.query.comment || '')}`;
  handleApiRequest(req, res, targetUrl, 'POST');
});

// 获取系统统计数据
app.get('/api/admin/system/statistics', (req, res) => {
  console.log('请求系统统计数据');
  
  // 尝试从后端获取数据
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/system/statistics', 'GET', {}, (err, backendResponse) => {
    // 如果后端请求成功，直接返回后端数据
    if (!err && backendResponse && backendResponse.code === 200) {
      return res.json(backendResponse);
    }
    
    // 否则返回模拟数据
    console.log('使用模拟数据');
    const mockData = {
      code: 200,
      message: "操作成功",
      data: {
        ongoingActivities: 2,
        totalUsers: 6,
        activeUsers: 5,
        totalActivities: 3,
        pendingClubs: 1,
        totalClubs: 2
      }
    };
    
    // 返回模拟数据
    res.json(mockData);
  });
});

// 获取系统日志
app.get('/api/admin/system/logs', (req, res) => {
  console.log('请求系统日志数据');
  
  // 尝试从后端获取数据
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/system/logs', 'GET', {}, (err, backendResponse) => {
    // 如果后端请求成功，直接返回后端数据
    if (!err && backendResponse && backendResponse.code === 200) {
      return res.json(backendResponse);
    }
    
    // 否则返回模拟数据
    console.log('使用模拟数据');
    const mockData = {
      code: 200,
      message: "操作成功",
      data: [
        {
          log_id: 14655,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getAllClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:18",
          params: "[]",
          operation: "获取全部社团列表",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14654,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedActivities()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:18",
          params: "[]",
          operation: "获取用户已参加的活动",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14653,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:18",
          params: "[]",
          operation: "获取用户已加入的社团",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14652,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getAllClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:18",
          params: "[]",
          operation: "获取全部社团列表",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14651,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:17",
          params: "[]",
          operation: "获取用户已加入的社团",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14650,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:17",
          params: "[]",
          operation: "获取用户已加入的社团",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14649,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getClubDetail()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:17",
          params: "[2]",
          operation: "获取具体社团信息",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14648,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getClubDetail()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:17",
          params: "[2]",
          operation: "获取具体社团信息",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14647,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:16",
          params: "[]",
          operation: "获取用户已加入的社团",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14646,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedActivities()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:16",
          params: "[]",
          operation: "获取用户已参加的活动",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14645,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getAllClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:16",
          params: "[]",
          operation: "获取全部社团列表",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14644,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:16",
          params: "[]",
          operation: "获取用户已加入的社团",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14643,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getJoinedActivities()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:16",
          params: "[]",
          operation: "获取用户已参加的活动",
          username: "xkj",
          status: 1
        },
        {
          log_id: 14642,
          method: "org.yesyes.CampusClubSys.controller.ClubUserController.getAllClubs()",
          user_id: 5,
          ip: "127.0.0.1",
          created_at: "2025-03-14T12:09:16",
          params: "[]",
          operation: "获取全部社团列表",
          username: "xkj",
          status: 1
        }
      ]
    };
    
    // 返回模拟数据
    res.json(mockData);
  });
});

// 获取用户列表
app.get('/api/admin/system/users', (req, res) => {
  console.log('请求用户列表数据');
  
  // 尝试从后端获取数据
  handleApiRequest(req, res, 'http://localhost:8080/api/admin/system/users', 'GET', {}, (err, backendResponse) => {
    // 如果后端请求成功，直接返回后端数据
    if (!err && backendResponse && backendResponse.code === 200) {
      return res.json(backendResponse);
    }
    
    // 否则返回模拟数据
    console.log('使用模拟数据');
    const mockData = {
      code: 200,
      message: "操作成功",
      data: [
        {
          "userId": 1,
          "username": "max",
          "password": null,
          "realName": "张三",
          "email": "1799572420@qq.com",
          "phone": "13800138000",
          "gender": "male",
          "studentId": "220012",
          "teacherId": "",
          "department": "计算机科学与技术学院",
          "className": "计科2101",
          "role": "club_admin",
          "status": "active",
          "birthdate": null,
          "avatarUrl": "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          "createdAt": "2025-03-07T22:55:27",
          "lastLogin": "2025-03-14T16:42:00",
          "emailVerified": false,
          "phoneVerified": false
        },
        {
          "userId": 2,
          "username": "admin",
          "password": null,
          "realName": "系统管理员",
          "email": "admin@campus.com",
          "phone": null,
          "gender": null,
          "studentId": null,
          "teacherId": null,
          "department": null,
          "className": null,
          "role": "school_admin",
          "status": "active",
          "birthdate": null,
          "avatarUrl": "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          "createdAt": "2025-03-08T10:28:44",
          "lastLogin": "2025-03-14T17:32:33",
          "emailVerified": true,
          "phoneVerified": false
        },
        {
          "userId": 3,
          "username": "zhang",
          "password": null,
          "realName": "张老师",
          "email": "2577870094@qq.com",
          "phone": "232323232",
          "gender": "male",
          "studentId": null,
          "teacherId": "001",
          "department": null,
          "className": null,
          "role": "teacher",
          "status": "active",
          "birthdate": null,
          "avatarUrl": "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          "createdAt": "2025-03-08T10:52:58",
          "lastLogin": null,
          "emailVerified": false,
          "phoneVerified": false
        },
        {
          "userId": 4,
          "username": "zzw",
          "password": null,
          "realName": "zzw",
          "email": "test1@maxtr.cn",
          "phone": "2323232",
          "gender": "male",
          "studentId": "22002",
          "teacherId": "null",
          "department": "计算机科学与技术学院",
          "className": "计科2101",
          "role": "student",
          "status": "active",
          "birthdate": null,
          "avatarUrl": "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          "createdAt": "2025-03-08T11:41:35",
          "lastLogin": "2025-03-08T23:51:14",
          "emailVerified": true,
          "phoneVerified": false
        },
        {
          "userId": 5,
          "username": "xkj",
          "password": null,
          "realName": "xkj",
          "email": "test2@maxtr.cn",
          "phone": "121232",
          "gender": "male",
          "studentId": "22003",
          "teacherId": null,
          "department": "计算机科学与技术学院",
          "className": "计科2101",
          "role": "student",
          "status": "active",
          "birthdate": null,
          "avatarUrl": "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          "createdAt": "2025-03-08T13:33:53",
          "lastLogin": "2025-03-14T12:09:12",
          "emailVerified": false,
          "phoneVerified": false
        },
        {
          "userId": 6,
          "username": "wjj",
          "password": null,
          "realName": "wjj",
          "email": "test5@maxtr.cn",
          "phone": "222233",
          "gender": "male",
          "studentId": "22004",
          "teacherId": null,
          "department": "计算机科学与技术学院",
          "className": "004",
          "role": "student",
          "status": "active",
          "birthdate": null,
          "avatarUrl": "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          "createdAt": "2025-03-08T17:14:44",
          "lastLogin": "2025-03-08T17:21:47",
          "emailVerified": false,
          "phoneVerified": false
        }
      ]
    };
    
    // 返回模拟数据
    res.json(mockData);
  });
});

// 获取用户已加入的活动
app.get('/api/club-user/joined-activities', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/club-user/joined-activities', 'GET');
});

// 获取积分排行榜
app.get('/api/club-user/points-leaderboard', (req, res) => {
  console.log('请求积分排行榜数据');
  
  // 尝试从后端获取数据
  handleApiRequest(req, res, 'http://localhost:8080/api/club-user/points-leaderboard', 'GET', {}, (err, backendResponse) => {
    // 如果后端请求成功，直接返回后端数据
    if (!err && backendResponse && backendResponse.code === 200) {
      return res.json(backendResponse);
    }
    
    // 否则返回模拟数据
    console.log('使用模拟数据');
    const mockData = {
      code: 200,
      message: "操作成功",
      data: [
        {
          userId: 1,
          username: "max",
          realName: "张三",
          avatarUrl: "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          points: 150,
          rank: 1
        },
        {
          userId: 4,
          username: "zzw",
          realName: "zzw",
          avatarUrl: "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          points: 120,
          rank: 2
        },
        {
          userId: 5,
          username: "xkj",
          realName: "xkj",
          avatarUrl: "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          points: 100,
          rank: 3
        },
        {
          userId: 6,
          username: "wjj",
          realName: "wjj",
          avatarUrl: "https://bucket.maxtral.fun/2025/03/08/67cc4090016c3.jpg",
          points: 80,
          rank: 4
        }
      ]
    };
    
    // 返回模拟数据
    res.json(mockData);
  });
});

// 获取活动推荐
app.get('/api/club-user/activity-recommendations', (req, res) => {
  console.log('请求活动推荐数据');
  
  // 尝试从后端获取数据
  handleApiRequest(req, res, 'http://localhost:8080/api/club-user/activity-recommendations', 'GET', {}, (err, backendResponse) => {
    // 如果后端请求成功，直接返回后端数据
    if (!err && backendResponse && backendResponse.code === 200) {
      return res.json(backendResponse);
    }
    
    // 否则返回模拟数据
    console.log('使用模拟数据');
    const mockData = {
      code: 200,
      message: "操作成功",
      data: [
        {
          activityId: 1,
          title: "编程马拉松",
          clubName: "编程俱乐部",
          startTime: "2024-03-25T09:00:00",
          endTime: "2024-03-25T18:00:00",
          location: "计算机科学楼102",
          maxParticipants: 50,
          currentParticipants: 30,
          creditPoints: 2,
          matchScore: 0.95,
          tags: ["编程", "比赛", "团队活动"]
        },
        {
          activityId: 2,
          title: "人工智能讲座",
          clubName: "AI研究社",
          startTime: "2024-03-26T14:00:00",
          endTime: "2024-03-26T16:00:00",
          location: "图书馆报告厅",
          maxParticipants: 100,
          currentParticipants: 45,
          creditPoints: 1,
          matchScore: 0.88,
          tags: ["讲座", "AI", "学术"]
        },
        {
          activityId: 3,
          title: "创新创业工作坊",
          clubName: "创业协会",
          startTime: "2024-03-27T15:00:00",
          endTime: "2024-03-27T17:00:00",
          location: "创新创业中心",
          maxParticipants: 30,
          currentParticipants: 15,
          creditPoints: 1.5,
          matchScore: 0.82,
          tags: ["创业", "工作坊", "实践"]
        }
      ]
    };
    
    // 返回模拟数据
    res.json(mockData);
  });
});

// 获取用户积分
app.get('/api/user/credit-points', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/user/credit-points', 'GET');
});

// 获取积分排行榜
app.get('/api/user/credit-ranking', (req, res) => {
  const limit = req.query.limit || 10;
  const targetUrl = `http://localhost:8080/api/user/credit-ranking?limit=${limit}`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 获取个性化活动推荐
app.get('/api/activities/recommend/personal', (req, res) => {
  const limit = req.query.limit || 10;
  const targetUrl = `http://localhost:8080/api/activities/recommend/personal?limit=${limit}`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 获取相似活动推荐
app.get('/api/activities/recommend/similar/:activityId', (req, res) => {
  const { activityId } = req.params;
  const limit = req.query.limit || 5;
  const targetUrl = `http://localhost:8080/api/activities/recommend/similar/${activityId}?limit=${limit}`;
  handleApiRequest(req, res, targetUrl, 'GET');
});

// 获取所有活动列表
app.get('/api/club-user/all-activities', (req, res) => {
  handleApiRequest(req, res, 'http://localhost:8080/api/club-user/all-activities', 'GET');
});

// 处理其他所有API请求
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
  onProxyReq: (proxyReq, req, res) => {
    // 删除可能导致问题的请求头
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    
    // 添加自定义请求头
    proxyReq.setHeader('Accept', '*/*');
    
    // 如果有Authorization头，保留它
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // 如果有请求体，需要重写请求体
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    console.log(`代理请求: ${req.method} ${req.url} -> ${proxyReq.path}`);
    console.log('代理请求头:', proxyReq.getHeaders());
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`代理响应: ${proxyRes.statusCode} ${req.url}`);
    console.log('代理响应头:', proxyRes.headers);
    
    // 添加CORS头
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ error: '代理错误', message: err.message });
  }
}));

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// 添加一个特定的路由来处理统计数据的静态文件请求
app.get('/admin/system/statistics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/system/statistics.json'));
});

// 所有其他请求返回React应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 