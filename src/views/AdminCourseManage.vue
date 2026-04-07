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
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="审核状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="已通过" value="normal" />
          <el-option label="已封禁" value="banned" />
        </el-select>
      </div>

      <div class="course-list">
        <el-card v-for="course in filteredCourses" :key="course.courseId" class="course-card">
          <div class="course-cover" @click="viewCourse(course)">
            <el-image :src="course.coverImageUrl" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon :size="40"><VideoPlay /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-if="course.status =='banned'" class="course-status status-banned">
              <el-icon><Lock /></el-icon>
              已封禁
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
                <span>{{ course.teacher || '未知' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><VideoPlay /></el-icon>
                <span>{{ course.totalLessons || 0 }} 课时</span>
              </div>
            </div>
            <div class="course-actions">
              <el-button 
                v-if="course.status == 'banned'"
                type="success" 
                @click="approveCourse(course)"
              >
                <el-icon><Select /></el-icon>
                通过审核
              </el-button>
              <el-button 
                v-else
                type="danger" 
                @click="banCourse(course)"
              >
                <el-icon><Lock /></el-icon>
                封禁课程
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
  Select,
  CircleCheck
} from '@element-plus/icons-vue'
import request from '@/utils/request'


interface Course {
  courseId: string
  title: string
  description: string
  coverImageUrl: string
  status: 'banned' | 'normal'
  teacher?: string
  totalLessons?: string
}

const router = useRouter()
const courseList = ref<Course[]>([])
const searchKeyword = ref('')
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

  if (filterStatus.value) {
    if (filterStatus.value === 'normal') {
      result = result.filter((course: any) => course.status == 'normal')
    } else if (filterStatus.value === 'banned') {
      result = result.filter((course: any) => course.status == 'banned')
    }
  }

  return result
})

// 加载课程列表
const loadCourses = async () => {
  const res: any = await request.get('/course/list/admin');
  console.log('course admin get', res);

  courseList.value = res.data;
}

// 查看课程
const viewCourse = (course: Course) => {
  
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
  .then(async () => {
    const res: any = await request.post(`/course/${course.courseId}/unban`);
    console.log('course ban put', res);
    await loadCourses();
    ElMessage.success('操作成功')
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
  .then(async () => {
    const res: any = await request.post(`/course/${course.courseId}/ban`);
    console.log('course ban put', res);
    await loadCourses();
    ElMessage.success('操作成功')
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
