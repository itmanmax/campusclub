"use client"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CalendarDays, MapPin, Users, Clock } from "lucide-react"

const events = [
  {
    id: "1",
    title: "摄影技巧分享会",
    club: "摄影协会",
    date: "2025-03-15",
    time: "14:00-16:00",
    location: "艺术楼 A201",
    attendees: 45,
    type: "workshop",
  },
  {
    id: "2",
    title: "校园篮球联赛",
    club: "篮球俱乐部",
    date: "2025-03-20",
    time: "09:00-17:00",
    location: "体育馆",
    attendees: 120,
    type: "competition",
  },
  {
    id: "3",
    title: "编程马拉松",
    club: "编程社",
    date: "2025-03-25",
    time: "10:00-22:00",
    location: "信息楼 B305",
    attendees: 60,
    type: "hackathon",
  },
  {
    id: "4",
    title: "志愿者招募会",
    club: "志愿者协会",
    date: "2025-04-01",
    time: "15:30-17:00",
    location: "图书馆报告厅",
    attendees: 35,
    type: "meeting",
  },
]

export default function UpcomingEvents() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">即将举行的活动</h2>
          <p className="text-sm text-muted-foreground">查看和管理未来30天内的社团活动</p>
        </div>
        <Button className="rounded-lg">创建活动</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.club}</p>
                </div>
                <Badge
                  variant={
                    event.type === "workshop"
                      ? "default"
                      : event.type === "competition"
                        ? "destructive"
                        : event.type === "hackathon"
                          ? "secondary"
                          : "outline"
                  }
                >
                  {event.type === "workshop"
                    ? "工作坊"
                    : event.type === "competition"
                      ? "比赛"
                      : event.type === "hackathon"
                        ? "黑客马拉松"
                        : "会议"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center text-sm">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  {event.attendees} 人已报名
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  查看详情
                </Button>
                <Button size="sm" className="rounded-lg">
                  报名参加
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 