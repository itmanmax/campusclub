import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "../ui/button"

interface Club {
  clubId: number
  name: string
  description: string
  category: string
  presidentName: string
  teacherName: string
  logoUrl: string
  createdAt: string
  status: string
}

const ClubReview: React.FC = () => {
  const [pendingClubs, setPendingClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingClubs = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/admin/system/clubs/pending", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      })

      const data = await response.json()
      if (data.code === 200) {
        setPendingClubs(data.data)
      } else {
        setError(data.message || "获取待审核社团列表失败")
        toast.error(data.message || "获取待审核社团列表失败")
      }
    } catch (err) {
      console.error("获取待审核社团列表失败:", err)
      setError("获取待审核社团列表失败")
      toast.error("获取待审核社团列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPendingClubs()
  }, [])

  const handleReview = async (clubId: number, status: "active" | "rejected", comment: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/system/clubs/${clubId}/review?status=${status}&comment=${encodeURIComponent(
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
        void fetchPendingClubs() // 刷新列表
      } else {
        toast.error(data.message || "审核失败")
      }
    } catch (err) {
      console.error("审核失败:", err)
      toast.error("审核失败")
    }
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
        <Button onClick={() => void fetchPendingClubs()} variant="outline">
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">社团审核</h1>
      {pendingClubs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无待审核的社团</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingClubs.map((club) => (
            <div key={club.clubId} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={club.logoUrl || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="ml-6 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{club.name}</h3>
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">待审核</span>
                  </div>
                  <p className="mt-2 text-gray-600">{club.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">类别：</span>
                      {club.category}
                    </div>
                    <div>
                      <span className="font-medium">申请时间：</span>
                      {new Date(club.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">社长：</span>
                      {club.presidentName}
                    </div>
                    <div>
                      <span className="font-medium">指导教师：</span>
                      {club.teacherName}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end space-x-4">
                    <Button
                      variant="outline"
                      className="bg-red-50 text-red-600 hover:bg-red-100"
                      onClick={() => handleReview(club.clubId, "rejected", "申请未通过")}
                    >
                      拒绝
                    </Button>
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => handleReview(club.clubId, "active", "审核通过！")}
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
    </div>
  )
}

export default ClubReview 