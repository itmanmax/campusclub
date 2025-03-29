const path = require('path');

module.exports = {
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' },
        onProxyReq: (proxyReq, req) => {
          if (req.method === 'POST' && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        onProxyRes: (proxyRes) => {
          console.log('Proxy Response Status:', proxyRes.statusCode);
        },
        onError: (err) => {
          console.error('Proxy Error:', err);
        }
      }
    },
    // 添加express中间件来处理请求
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // 添加body-parser中间件
      devServer.app.use(require('body-parser').json());
      
      // 添加请求日志中间件
      devServer.app.use((req, res, next) => {
        console.log('Request received:', {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body
        });
        next();
      });

      return middlewares;
    }
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}; 