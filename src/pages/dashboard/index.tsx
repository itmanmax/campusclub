import React from 'react';
import { Card } from '../../components/ui/card';

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">42</div>
            <p className="text-sm text-gray-500">总社团数</p>
            <div className="mt-2 text-xs text-green-600">较上月 +12%</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-sm text-gray-500">活跃成员</p>
            <div className="mt-2 text-xs text-green-600">较上月 +5%</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-gray-500">本月活动</p>
            <div className="mt-2 text-xs text-green-600">较上月 +18%</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">¥45,231</div>
            <p className="text-sm text-gray-500">预算使用</p>
            <div className="mt-2 text-xs text-red-600">较上月 -2%</div>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold">社团活跃度</h3>
              <p className="text-sm text-gray-500">过去30天内各社团活动频率分析</p>
              <div className="h-[300px] w-full">
                {/* 这里可以添加图表组件 */}
                <div className="flex h-full items-center justify-center text-gray-500">
                  活跃度图表
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold">最近活动</h3>
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium">张明 创建了新活动 摄影技巧分享会</p>
                    <p className="text-xs text-gray-500">2小时前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium">李强 添加了新成员 篮球俱乐部</p>
                    <p className="text-xs text-gray-500">4小时前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium">王华 更新了活动信息 编程马拉松</p>
                    <p className="text-xs text-gray-500">昨天</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="col-span-12">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">社团列表</h3>
                <input
                  type="search"
                  placeholder="搜索社团..."
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-4 text-left font-medium">社团名称</th>
                      <th className="pb-4 text-left font-medium">类别</th>
                      <th className="pb-4 text-left font-medium">成员数</th>
                      <th className="pb-4 text-left font-medium">负责人</th>
                      <th className="pb-4 text-left font-medium">状态</th>
                      <th className="pb-4 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                          <span>摄影协会</span>
                        </div>
                      </td>
                      <td className="py-4">艺术</td>
                      <td className="py-4">128</td>
                      <td className="py-4">张明</td>
                      <td className="py-4">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">活跃</span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-sm text-gray-500">···</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 