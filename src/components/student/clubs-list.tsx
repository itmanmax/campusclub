"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { toast } from "react-hot-toast"
import { Star } from "lucide-react"

interface Club {
  clubId: number
  name: string
  description: string
  category: string
  presidentName: string | null
  teacherName: string | null
  logoUrl: string
  createdAt: string
  starRating: number
  status: string
}

const StudentClubsList: React.FC = () => {
  console.log('ClubsList组件开始初始化', new Date().toISOString());
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('ClubsList useEffect开始执行', new Date().toISOString());
    const fetchClubs = async () => {
      try {
        console.log('开始获取社团列表数据');
        setLoading(true)
        const response = await fetch("/api/club-user/all-clubs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "*/*",
          },
        })

        const data = await response.json()
        console.log("获取社团列表响应:", data)

        if (data.code === 200) {
          setClubs(data.data)
          console.log('社团列表数据获取成功', {
            dataLength: data.data.length,
            firstClub: data.data.length > 0 ? data.data[0].name : null
          });
        } else {
          setError(data.message || "获取社团列表失败")
          toast.error(data.message || "获取社团列表失败")
        }
      } catch (err) {
        console.error("获取社团列表失败:", err)
        setError("获取社团列表失败")
        toast.error("获取社团列表失败")
      } finally {
        setLoading(false)
        console.log('社团列表数据加载完成', new Date().toISOString());
      }
    }

    void fetchClubs()
    
    return () => {
      console.log('ClubsList组件卸载', new Date().toISOString());
    };
  }, [])

  // Add a color mapping function for categories
  const getCategoryColor = (category: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      体育: { bg: "bg-blue-50", text: "text-blue-600" },
      艺术: { bg: "bg-purple-50", text: "text-purple-600" },
      科技: { bg: "bg-green-50", text: "text-green-600" },
      学术: { bg: "bg-amber-50", text: "text-amber-600" },
      文化: { bg: "bg-rose-50", text: "text-rose-600" },
      志愿者: { bg: "bg-teal-50", text: "text-teal-600" },
      音乐: { bg: "bg-indigo-50", text: "text-indigo-600" },
      舞蹈: { bg: "bg-pink-50", text: "text-pink-600" },
      摄影: { bg: "bg-cyan-50", text: "text-cyan-600" },
      戏剧: { bg: "bg-orange-50", text: "text-orange-600" },
    }

    // Default color for categories not in the map
    return colorMap[category] || { bg: "bg-gray-50", text: "text-gray-600" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-lg px-4 py-2">
          重试
        </Button>
      </div>
    )
  }

  // Group clubs by category
  const clubsByCategory: Record<string, Club[]> = {}
  clubs.forEach((club) => {
    if (!clubsByCategory[club.category]) {
      clubsByCategory[club.category] = []
    }
    clubsByCategory[club.category].push(club)
  })

  console.log('ClubsList组件渲染', {
    clubsCount: clubs.length,
    filteredCount: clubs.length,
    loading
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {clubs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无社团</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(clubsByCategory).map(([category, categoryClubs]) => {
            const categoryColor = getCategoryColor(category)
            return (
              <div key={category}>
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <span
                    className={`${categoryColor.bg} ${categoryColor.text} px-3 py-1 rounded-lg text-sm font-medium`}
                  >
                    {category}
                  </span>
                </h2>
                <div className="space-y-3">
                  {categoryClubs.map((club) => (
                    <div
                      key={club.clubId}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/clubs/${club.clubId}`)}
                    >
                      <div className="flex items-center p-4">
                        {/* Club Logo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={club.logoUrl || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Club Info */}
                        <div className="ml-4 flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-medium text-gray-900 truncate">{club.name}</h3>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`${categoryColor.bg} ${categoryColor.text} px-2 py-0.5 rounded-md text-xs font-medium`}
                              >
                                {category}
                              </span>
                              {club.status === "active" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                  活跃
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{club.description}</p>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              {club.presidentName && <span className="truncate">社长: {club.presidentName}</span>}
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="ml-1 text-sm text-gray-600">{club.starRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentClubsList

