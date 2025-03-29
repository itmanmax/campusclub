const { createProxyMiddleware } = require('http-proxy-middleware');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

module.exports = function(app) {
  console.log('设置API代理：', API_URL);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
      onProxyReq: (proxyReq, req, res) => {
        // 调试信息
        console.log(`代理请求：${req.method} ${req.url} -> ${API_URL}${req.url}`);
        
        // 确保请求头中包含正确的内容类型
        if (!proxyReq.getHeader('content-type') && req.body) {
          proxyReq.setHeader('content-type', 'application/json');
        }
        
        // 确保CORS相关头信息传递正确
        if (req.headers.origin) {
          proxyReq.setHeader('origin', req.headers.origin);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // 添加CORS头（这将在本地开发时帮助调试）
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
        
        // 调试信息
        console.log(`代理响应：${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error('代理请求错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        });
        res.end(JSON.stringify({ 
          code: 500, 
          message: '代理请求失败，请检查网络或后端服务状态',
          error: err.message 
        }));
      }
    })
  );
}; 