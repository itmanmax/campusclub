import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axios-config';

export default function DebugPage() {
  const [url, setUrl] = useState('/api/admin/system/statistics');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [useToken, setUseToken] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      let res: any = null;
      
      if (useToken) {
        // 使用我们配置的axiosInstance
        if (method === 'GET') {
          res = await axiosInstance.get(url.replace('/api', ''));
        } else if (method === 'POST') {
          res = await axiosInstance.post(url.replace('/api', ''), body ? JSON.parse(body) : {});
        }
      } else {
        // 使用普通的axios
        const options: any = {
          method,
          url,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        if (method === 'POST' && body) {
          options.data = JSON.parse(body);
        }
        
        res = await axios(options);
      }
      
      if (res) {
        setResponse({
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          data: res.data
        });
      }
    } catch (err: any) {
      console.error('API调试错误:', err);
      setError({
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        } : '无响应',
        request: err.request ? '请求已发送但无响应' : '请求未发送'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API调试工具</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block mb-2">API端点</label>
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-2">请求方法</label>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        
        {method === 'POST' && (
          <div>
            <label className="block mb-2">请求体 (JSON)</label>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-2 border rounded h-32 font-mono"
              placeholder="{}"
            />
          </div>
        )}
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="useToken" 
            checked={useToken} 
            onChange={(e) => setUseToken(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="useToken">使用认证令牌</label>
        </div>
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '请求中...' : '发送请求'}
        </button>
      </form>
      
      {loading && <p className="text-gray-600">请求处理中...</p>}
      
      {error && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">错误</h2>
          <pre className="bg-red-50 p-4 rounded overflow-x-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {response && (
        <div>
          <h2 className="text-xl font-bold mb-2">响应</h2>
          <div className="mb-4">
            <p><strong>状态:</strong> {response.status} {response.statusText}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-bold">响应头:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(response.headers, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-bold">响应体:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 