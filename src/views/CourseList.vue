<template>
  <div class="course-list-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1 style="cursor: pointer;" @click="goHome">课程学习</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="course in courseList" :key="course.courseId">
          <el-card class="course-card" @click="viewDetail(course.courseId)">
            <div class="course-cover">
              <el-image :src="course.coverImageUrl || defaultCover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="card-content">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-desc">{{ course.description }}</p>
              <div class="card-footer">
                <div class="course-info">
                  <span class="info-item">
                    <el-icon><User /></el-icon>
                    {{ course.teacher }}
                  </span>
                  <span class="info-item">
                    <el-icon><Clock /></el-icon>
                    {{ course.totalLessons }} 课时
                  </span>
                </div>
                <el-button type="primary" link>
                  查看详情
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Picture, User, Clock, ArrowRight } from '@element-plus/icons-vue'
import request from '../utils/request'

interface Course {
  courseId: string
  title: string
  teacher: string
  totalLessons: string
  coverImageUrl: string
  description: string
}

const router = useRouter()
const courseList = ref<Course[]>([])
const defaultCover = 'https://via.placeholder.com/300x200?text=Course'

// 从localStorage加载课程列表
const loadCourseList = async () => {
  const res: any = await request.get('/course/list/all')
  console.log('get course list', res);

  courseList.value = res.data;
}
const viewDetail = (id: string) => {
  router.push(`/course/${id}`)
}

onMounted(() => {
  loadCourseList()
})
const goHome = () => {
  router.push('/');
}
</script>

<style scoped>
.course-list-container {
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

.course-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
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

.course-level {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.level-beginner {
  background: #67C23A;
}

.level-elementary {
  background: #409EFF;
}

.level-intermediate {
  background: #E6A23C;
}

.level-advanced {
  background: #F56C6C;
}

.card-content {
  padding: 16px 0;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-info {
  display: flex;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
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
}
</style>
