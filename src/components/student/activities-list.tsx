"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { toast } from "react-hot-toast"

interface Activity {
  activityId: number
  clubId: number
  clubName: string
  title: string
  type: string
  startTime: string
  endTime: string
  location: string
  maxParticipants: number
  currentParticipants: number
  creditPoints: number
  coverImage: string
  status: string
  isUserParticipated: boolean
}

const StudentActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/club-user/all-activities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      })

      const data = await response.json()
      if (data.code === 200) {
        setActivities(data.data)
      } else {
        toast.error(data.message || "获取活动列表失败")
      }
    } catch (err) {
      console.error("获取活动列表失败:", err)
      toast.error("获取活动列表失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (activityId: number) => {
    try {
      const response = await fetch(`/api/clubs/activities/${activityId}/sign-up`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      })

      const data = await response.json()
      if (data.code === 200) {
        toast.success("报名成功！")
        // 重新获取活动列表以更新状态
        await fetchActivities()
      } else {
        toast.error(data.message || "报名失败")
      }
    } catch (err) {
      console.error("报名失败:", err)
      toast.error("报名失败")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-500 font-medium">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">近期活动</h2>

      {activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <p className="text-gray-500">暂无活动</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.activityId}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Left side with image */}
                <div className="w-full md:w-1/4 aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {activity.coverImage ? (
                    <img
                      src={activity.coverImage || "/placeholder.svg"}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      暂无图片
                    </div>
                  )}
                </div>

                {/* Middle content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        activity.status === "approved" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {activity.status === "approved" ? "进行中" : "未开始"}
                    </span>
                  </div>

                  <p className="text-sm text-blue-600 mb-3">{activity.type}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="w-20 text-gray-500">主办方</span>
                      <span>{activity.clubName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-20 text-gray-500">地点</span>
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-20 text-gray-500">开始时间</span>
                      <span>
                        {new Date(activity.startTime).toLocaleString("zh-CN", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-20 text-gray-500">结束时间</span>
                      <span>
                        {new Date(activity.endTime).toLocaleString("zh-CN", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-20 text-gray-500">参与人数</span>
                      <div className="flex items-center gap-1">
                        <span>
                          {activity.currentParticipants}/{activity.maxParticipants}
                        </span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(activity.currentParticipants / activity.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">学分</span>
                      <span className="text-orange-600 font-medium">{activity.creditPoints} 分</span>
                    </div>
                  </div>
                </div>

                {/* Right side with button */}
                <div className="mt-4 md:mt-0 md:ml-auto">
                  <Button
                    onClick={() => {
                      if (activity.isUserParticipated) {
                        toast.error("您已经报名参加此活动")
                      } else {
                        handleSignUp(activity.activityId)
                      }
                    }}
                    disabled={activity.isUserParticipated}
                    variant={activity.isUserParticipated ? "outline" : "default"}
                    className={`w-full md:w-auto rounded-full px-6 ${
                      activity.isUserParticipated
                        ? "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {activity.isUserParticipated ? "已报名" : "立即报名"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentActivitiesList

