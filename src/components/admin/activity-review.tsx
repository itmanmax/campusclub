import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { CalendarDays, MapPin, Users } from "lucide-react"

interface Activity {
  activityId: number
  clubId: number
  title: string
  type: string
  startTime: string
  endTime: string
  location: string
  maxParticipants: number
  status: string
  creditPoints: number
  coverImage: string
  currentParticipants: number
  clubName: string
}

const ActivityReview: React.FC = () => {
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const fetchPendingActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/admin/system/activities/pending", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      })

      const data = await response.json()
      if (data.code === 200) {
        setPendingActivities(data.data)
      } else {
        setError(data.message || "获取待审核活动列表失败")
        toast.error(data.message || "获取待审核活动列表失败")
      }
    } catch (err) {
      console.error("获取待审核活动列表失败:", err)
      setError("获取待审核活动列表失败")
      toast.error("获取待审核活动列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPendingActivities()
  }, [])

  const handleReview = async (activityId: number, status: "approved" | "rejected", comment: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/system/activities/${activityId}/review?status=${status}&comment=${encodeURIComponent(
          comment
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "*/*",
          },
        }
      )

      const data = await response.json()
      if (data.code === 200) {
        toast.success("审核成功")
        void fetchPendingActivities() // 刷新列表
      } else {
        toast.error(data.message || "审核失败")
      }
    } catch (err) {
      console.error("审核失败:", err)
      toast.error("审核失败")
    }
  }

  const getActivityTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      比赛: "bg-blue-100 text-blue-800",
      讲座: "bg-purple-100 text-purple-800",
      培训: "bg-green-100 text-green-800",
      展览: "bg-amber-100 text-amber-800",
      演出: "bg-rose-100 text-rose-800",
      志愿服务: "bg-teal-100 text-teal-800",
      其他: "bg-gray-100 text-gray-800",
    }
    return colorMap[type] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={() => void fetchPendingActivities()} variant="outline">
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">活动审核</h1>
      {pendingActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无待审核的活动</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingActivities.map((activity) => (
            <div key={activity.activityId} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={activity.coverImage || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="ml-6 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-medium">{activity.title}</h3>
                      <Badge variant="secondary" className={getActivityTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      待审核
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">举办社团：{activity.clubName}</div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      <span>
                        {format(new Date(activity.startTime), "MM/dd HH:mm")} -{" "}
                        {format(new Date(activity.endTime), "MM/dd HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        人数上限：{activity.maxParticipants}人 (已报名：{activity.currentParticipants}人)
                      </span>
                    </div>
                    <div>学分：{activity.creditPoints} 分</div>
                  </div>
                  <div className="mt-6 flex items-center justify-end space-x-4">
                    <Button variant="outline" onClick={() => setSelectedActivity(activity)}>
                      查看详情
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-50 text-red-600 hover:bg-red-100"
                      onClick={() => handleReview(activity.activityId, "rejected", "活动申请未通过")}
                    >
                      拒绝
                    </Button>
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => handleReview(activity.activityId, "approved", "活动审核通过！")}
                    >
                      通过
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>活动详细信息</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="mt-4">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-6">
                <img
                  src={selectedActivity.coverImage || "/placeholder.svg"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{selectedActivity.title}</h2>
                  <Badge variant="secondary" className={getActivityTypeColor(selectedActivity.type)}>
                    {selectedActivity.type}
                  </Badge>
                </div>
                <div className="text-lg text-gray-600">举办社团：{selectedActivity.clubName}</div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">活动时间</span>
                      <p className="mt-1">
                        开始：{format(new Date(selectedActivity.startTime), "yyyy-MM-dd HH:mm")}
                        <br />
                        结束：{format(new Date(selectedActivity.endTime), "yyyy-MM-dd HH:mm")}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">活动地点</span>
                      <p className="mt-1">{selectedActivity.location}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">参与人数</span>
                      <p className="mt-1">
                        上限：{selectedActivity.maxParticipants}人
                        <br />
                        已报名：{selectedActivity.currentParticipants}人
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">活动学分</span>
                      <p className="mt-1">{selectedActivity.creditPoints} 分</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                    关闭
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => {
                      handleReview(selectedActivity.activityId, "rejected", "活动申请未通过")
                      setSelectedActivity(null)
                    }}
                  >
                    拒绝申请
                  </Button>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      handleReview(selectedActivity.activityId, "approved", "活动审核通过！")
                      setSelectedActivity(null)
                    }}
                  >
                    通过申请
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ActivityReview 