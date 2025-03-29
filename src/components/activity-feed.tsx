import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"

const activities = [
  {
    id: "1",
    user: "张明",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "创建了新活动",
    target: "摄影技巧分享会",
    time: "2小时前",
  },
  {
    id: "2",
    user: "李强",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "添加了新成员",
    target: "篮球俱乐部",
    time: "4小时前",
  },
  {
    id: "3",
    user: "王华",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "更新了活动信息",
    target: "编程马拉松",
    time: "昨天",
  },
  {
    id: "4",
    user: "刘伟",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "发布了新公告",
    target: "志愿者协会",
    time: "2天前",
  },
]

export default function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.avatar} alt={activity.user} />
            <AvatarFallback>{activity.user.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span> {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 