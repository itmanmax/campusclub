CREATE TABLE user (
    -- 唯一标识
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID（主键）',
    
    -- 账号信息
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名（唯一）',
    password_hash VARCHAR(255) NOT NULL COMMENT '加密后的密码（建议BCrypt）',
    role ENUM('student', 'club_admin', 'teacher', 'school_admin') NOT NULL COMMENT '用户角色',
    
    -- 个人信息
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    gender ENUM('male', 'female', 'other') COMMENT '性别',
    birthdate DATE COMMENT '出生日期',
    phone VARCHAR(20) UNIQUE COMMENT '手机号（加密存储）',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '邮箱（唯一）',
    avatar_url VARCHAR(255) COMMENT '头像存储路径或URL',
    
    -- 学工号信息（根据角色区分）
    student_id VARCHAR(20) UNIQUE COMMENT '学号（学生角色必填）',
    teacher_id VARCHAR(20) UNIQUE COMMENT '工号（教师角色必填）',
    
    -- 院系/班级信息
    department VARCHAR(100) COMMENT '所属院系（教师或学生）',
    class_name VARCHAR(50) COMMENT '班级（学生）',
    
    -- 账号状态
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '账号状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    last_login DATETIME COMMENT '最后登录时间',
    
    -- 安全字段
    email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
    phone_verified BOOLEAN DEFAULT FALSE COMMENT '手机号是否验证',
    two_factor_secret VARCHAR(255) COMMENT '二次验证密钥（2FA）',
    
    -- 扩展字段
    wechat_openid VARCHAR(100) UNIQUE COMMENT '微信OpenID（第三方登录）',
    qq_openid VARCHAR(100) UNIQUE COMMENT 'QQ OpenID'
) COMMENT '用户表';
CREATE TABLE club (
    club_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '社团ID',
    name VARCHAR(100) UNIQUE NOT NULL COMMENT '社团名称',
    description TEXT COMMENT '社团简介',
    logo_url VARCHAR(255) COMMENT 'LOGO存储路径',
    category ENUM('学术', '体育', '艺术', '公益') NOT NULL COMMENT '分类',
    status ENUM('pending', 'active', ' ', 'closed') DEFAULT 'pending' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    president_id INT NOT NULL COMMENT '社长ID（关联user.id）',
    teacher_id INT NOT NULL COMMENT '指导老师ID（关联user.id）',
    star_rating TINYINT DEFAULT 0 COMMENT '星级评分（0-5）',
    
    FOREIGN KEY (president_id) REFERENCES user(id) ON UPDATE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES user(id) ON UPDATE CASCADE
) COMMENT '社团信息表';
CREATE TABLE club_member (
    member_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id INT NOT NULL COMMENT '用户ID（关联user.id）',
    club_id INT NOT NULL COMMENT '社团ID（关联club.club_id）',
    role ENUM('member', 'officer', 'vice_president') DEFAULT 'member' COMMENT '角色',
    join_date DATE NOT NULL COMMENT '加入日期',
    exit_date DATE COMMENT '退出日期',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否在籍',
    
    UNIQUE KEY unique_membership (user_id, club_id), -- 防止重复加入
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES club(club_id) ON DELETE CASCADE
) COMMENT '社团成员关系表';
CREATE TABLE activity (
    activity_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
    club_id INT NOT NULL COMMENT '主办社团ID',
    title VARCHAR(200) NOT NULL COMMENT '活动标题',
    type ENUM('会议', '比赛', '讲座', '其他') NOT NULL,
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    location VARCHAR(100) NOT NULL COMMENT '地点',
    max_participants INT COMMENT '人数限制',
    status ENUM('draft', 'approved', 'rejected', 'completed') DEFAULT 'draft',
    credit_points TINYINT DEFAULT 0 COMMENT '可获学分',
    cover_image VARCHAR(255) COMMENT '封面图',
    
    FOREIGN KEY (club_id) REFERENCES club(club_id) ON DELETE CASCADE
) COMMENT '活动信息表';
CREATE TABLE activity_participation (
    participation_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_id INT NOT NULL,
    signup_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    checkin_time DATETIME COMMENT '签到时间',
    is_present BOOLEAN DEFAULT FALSE COMMENT '是否到场',
    
    UNIQUE KEY unique_participation (user_id, activity_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE
) COMMENT '活动参与记录表';
CREATE TABLE `system_log` (
  `log_id` int NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` int DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) DEFAULT NULL COMMENT '操作用户名',
  `operation` varchar(50) NOT NULL COMMENT '操作类型',
  `method` varchar(200) DEFAULT NULL COMMENT '请求方法',
  `params` text COMMENT '请求参数',
  `ip` varchar(64) DEFAULT NULL COMMENT '操作IP',
  `status` tinyint DEFAULT '1' COMMENT '操作状态（1：成功，0：失败）',
  `error_msg` text COMMENT '错误信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统操作日志';
-- 下面为拓展
CREATE TABLE finance (
    finance_id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL COMMENT '金额',
    type ENUM('income', 'expense') NOT NULL COMMENT '类型',
    category VARCHAR(50) NOT NULL COMMENT '类别（会费/赞助/物资采购等）',
    description VARCHAR(500) COMMENT '详细说明',
    transaction_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    proof_url VARCHAR(255) COMMENT '凭证文件路径',
    auditor_id INT COMMENT '审核人ID（关联user.id）',
    audit_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',

    FOREIGN KEY (club_id) REFERENCES club(club_id) ON DELETE CASCADE,
    FOREIGN KEY (auditor_id) REFERENCES user(id) ON DELETE SET NULL  -- 修改为正确的语法
) COMMENT '财务流水表';
CREATE TABLE notification (
    notify_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '接收者ID',
    content TEXT NOT NULL COMMENT '消息内容',
    type ENUM('system', 'activity', 'finance') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_at DATETIME COMMENT '过期时间',
    
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) COMMENT '消息通知表';
CREATE TABLE activity_checkin_code (
    code_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id)
) COMMENT '活动签到码表';