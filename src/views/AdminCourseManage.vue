<template>
  <div class="admin-course-manage-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>课程管理</h1>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterType" placeholder="课程类型" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="线上课程" value="online" />
          <el-option label="线下课程" value="offline" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="审核状态" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已封禁" value="banned" />
        </el-select>
      </div>

      <div class="course-list">
        <el-card v-for="course in filteredCourses" :key="course.id" class="course-card">
          <div class="course-cover" @click="viewCourse(course)">
            <el-image :src="course.cover" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon :size="40"><VideoPlay /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="course-type" :class="'type-' + course.type">
              {{ course.type === 'online' ? '线上' : '线下' }}
            </div>
            <div v-if="course.banned" class="course-status status-banned">
              <el-icon><Lock /></el-icon>
              已封禁
            </div>
            <div v-else-if="!course.approved" class="course-status status-pending">
              <el-icon><Clock /></el-icon>
              待审核
            </div>
            <div v-else class="course-status status-approved">
              <el-icon><CircleCheck /></el-icon>
              已通过
            </div>
          </div>
          <div class="course-content">
            <h3 class="course-title" @click="viewCourse(course)">{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>
            <div class="course-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ course.author || '未知' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ course.createTime }}</span>
              </div>
              <div class="meta-item" v-if="course.type === 'online'">
                <el-icon><VideoPlay /></el-icon>
                <span>{{ course.lessons?.length || 0 }} 课时</span>
              </div>
              <div class="meta-item" v-else>
                <el-icon><Location /></el-icon>
                <span>{{ course.city || '未知' }}</span>
              </div>
            </div>
            <div class="course-tags">
              <el-tag 
                v-for="tag in course.tags" 
                :key="tag" 
                size="small"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="course-actions">
              <el-button 
                v-if="!course.approved && !course.banned"
                type="success" 
                @click="approveCourse(course)"
              >
                <el-icon><Select /></el-icon>
                通过审核
              </el-button>
              <el-button 
                v-if="!course.banned"
                type="danger" 
                @click="banCourse(course)"
              >
                <el-icon><Lock /></el-icon>
                封禁课程
              </el-button>
              <el-button 
                v-if="course.banned"
                type="success" 
                @click="unbanCourse(course)"
              >
                <el-icon><Unlock /></el-icon>
                解封课程
              </el-button>
            </div>
          </div>
        </el-card>
        <el-empty v-if="filteredCourses.length === 0" description="暂无课程" />
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search,
  VideoPlay,
  User,
  Calendar,
  Lock,
  Clock,
  CircleCheck,
  Select,
  Unlock
} from '@element-plus/icons-vue'

interface Course {
  id: string
  title: string
  description: string
  cover: string
  type: 'online' | 'offline'
  category: string
  status: 'draft' | 'published'
  approved?: boolean
  banned?: boolean
  author?: string
  createTime: string
  lessons?: any[]
  city?: string
  tags: string[]
}

const router = useRouter()
const courseList = ref<Course[]>([])
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')

// 根据搜索和筛选条件过滤课程
const filteredCourses = computed(() => {
  let result = courseList.value

  if (searchKeyword.value) {
    result = result.filter(course => 
      course.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      course.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (filterType.value) {
    result = result.filter(course => course.type === filterType.value)
  }

  if (filterStatus.value) {
    if (filterStatus.value === 'pending') {
      result = result.filter(course => !course.approved && !course.banned)
    } else if (filterStatus.value === 'approved') {
      result = result.filter(course => course.approved && !course.banned)
    } else if (filterStatus.value === 'banned') {
      result = result.filter(course => course.banned)
    }
  }

  return result
})

// 加载课程列表
const loadCourses = () => {
  const onlineCourses = JSON.parse(localStorage.getItem('onlineCourses') || '[]')
  const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]')

  // 为所有课程添加审核和封禁状态
  const allCourses = [
    ...onlineCourses.map((c: any) => ({ ...c, type: 'online' as const })),
    ...offlineCourses.map((c: any) => ({ ...c, type: 'offline' as const }))
  ]

  courseList.value = allCourses
}

// 搜索
const handleSearch = () => {
  // 过滤逻辑由computed自动处理
}

// 筛选
const handleFilter = () => {
  // 过滤逻辑由computed自动处理
}

// 查看课程
const viewCourse = (course: Course) => {
  if (course.type === 'online') {
    router.push(`/course/${course.id}`)
  } else {
    router.push(`/offline/${course.id}`)
  }
}

// 通过审核
const approveCourse = (course: Course) => {
  ElMessageBox.confirm(
    '确定通过该课程的审核吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      const storageKey = course.type === 'online' ? 'onlineCourses' : 'offlineCourses'
      const courses = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const index = courses.findIndex((c: any) => c.id === course.id)
      if (index > -1) {
        courses[index].approved = true
        localStorage.setItem(storageKey, JSON.stringify(courses))
        loadCourses()
        ElMessage.success('审核通过')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 封禁课程
const banCourse = (course: Course) => {
  ElMessageBox.confirm(
    '确定封禁该课程吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const storageKey = course.type === 'online' ? 'onlineCourses' : 'offlineCourses'
      const courses = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const index = courses.findIndex((c: any) => c.id === course.id)
      if (index > -1) {
        courses[index].banned = true
        localStorage.setItem(storageKey, JSON.stringify(courses))
        loadCourses()
        ElMessage.success('已封禁课程')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 解封课程
const unbanCourse = (course: Course) => {
  ElMessageBox.confirm(
    '确定解封该课程吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      const storageKey = course.type === 'online' ? 'onlineCourses' : 'offlineCourses'
      const courses = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const index = courses.findIndex((c: any) => c.id === course.id)
      if (index > -1) {
        courses[index].banned = false
        localStorage.setItem(storageKey, JSON.stringify(courses))
        loadCourses()
        ElMessage.success('已解封课程')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.admin-course-manage-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.page-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar > * {
  flex: 1;
  min-width: 200px;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.course-card {
  overflow: hidden;
  transition: all 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.course-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  cursor: pointer;
}

.course-cover :deep(.el-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.course-type {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.type-online {
  background: #409EFF;
}

.type-offline {
  background: #67C23A;
}

.course-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-pending {
  background: #E6A23C;
}

.status-approved {
  background: #67C23A;
}

.status-banned {
  background: #F56C6C;
}

.course-content {
  padding: 16px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-title:hover {
  color: #409EFF;
}

.course-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.course-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag-item {
  margin-right: 0;
}

.course-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .page-main {
    padding: 16px;
  }

  .header-content {
    padding: 0 12px;
  }

  .header-content h1 {
    font-size: 18px;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar > * {
    width: 100%;
  }

  .course-list {
    grid-template-columns: 1fr;
  }
}
</style>
