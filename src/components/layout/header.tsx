import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '../ui/button';

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex flex-1 items-center space-x-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="搜索社团、活动或成员..."
            className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-gray-300"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <Button variant="outline" className="rounded-lg">
          导出数据
        </Button>
        <Button className="rounded-lg">
          申请创建社团
        </Button>
      </div>
    </header>
  );
} 