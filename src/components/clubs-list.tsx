"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MoreHorizontal, Edit, Trash, UserPlus } from "lucide-react"

const clubs = [
  {
    id: "1",
    name: "摄影协会",
    category: "艺术",
    members: 128,
    status: "active",
    leader: "张明",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "篮球俱乐部",
    category: "体育",
    members: 45,
    status: "active",
    leader: "李强",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "编程社",
    category: "科技",
    members: 67,
    status: "active",
    leader: "王华",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "辩论队",
    category: "学术",
    members: 32,
    status: "inactive",
    leader: "赵芳",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "志愿者协会",
    category: "公益",
    members: 89,
    status: "active",
    leader: "刘伟",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function ClubsList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.leader.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="search"
          placeholder="搜索社团..."
          className="h-10 w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button size="sm" className="rounded-lg">
          添加社团
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>社团名称</TableHead>
              <TableHead>类别</TableHead>
              <TableHead>成员数</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={club.avatar} alt={club.name} />
                      <AvatarFallback>{club.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {club.name}
                  </div>
                </TableCell>
                <TableCell>{club.category}</TableCell>
                <TableCell>{club.members}</TableCell>
                <TableCell>{club.leader}</TableCell>
                <TableCell>
                  <Badge variant={club.status === "active" ? "default" : "secondary"}>
                    {club.status === "active" ? "活跃" : "非活跃"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">打开菜单</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        添加成员
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 