<template>
  <div class="course-detail-container">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="course-title">{{ courseInfo.name }}</span>
        </div>
      </template>
    </el-page-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>课程信息</span>
              </div>
            </template>
            <div class="card-content">
              <div class="course-meta">
                <div class="meta-item">
                  <el-icon :size="20" color="#409EFF"><User /></el-icon>
                  <span class="label">授课教师：</span>
                  <span class="value">{{ courseInfo.teacher }}</span>
                </div>
                <div class="meta-item">
                  <el-icon :size="20" color="#67C23A"><Clock /></el-icon>
                  <span class="label">课程时长：</span>
                  <span class="value">{{ courseInfo.totalLessons }} 课时</span>
                </div>
              </div>
              <el-divider />
              <div class="course-description">
                <h4>课程简介</h4>
                <p>{{ courseInfo.description }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="resource-card">
            <template #header>
              <div class="card-header">
                <span>课程视频</span>
              </div>
            </template>
            <div class="resource-list">
              <div v-for="resource in resourceList" :key="resource.id" class="resource-item">
                <div class="resource-icon">
                  <el-icon :size="32" :color="getResourceIconColor('视频')">
                    <component :is="getResourceIcon('视频')" />
                  </el-icon>
                </div>
                <div class="resource-info">
                  <h4 class="resource-title">{{ resource.lessonName }}</h4>
                  <p class="resource-desc">第{{ resource.lessonNum }} 节</p>
                </div>
                <div class="resource-action">
                  <el-button type="primary" link @click="viewResource(resource.id)">
                    查看
                  </el-button>
                </div>
              </div>
              <el-empty v-if="resourceList.length === 0" description="暂无资源" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <span>课程讯息</span>
              </div>
            </template>
            <div class="progress-content">
              <span>暂无该课程的更新公告</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, VideoPlay, Headset, Document, User, Clock } from '@element-plus/icons-vue'
import request from '../utils/request'

interface Course {
  id: string
  name: string
  teacher: string
  duration: string
  coverImageUrl: string
  description: string
  totalLessons: number
}

interface CourseResource {
  id: string
  courseId: string
  lessonName: string
  lessonNum: string
}

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.id as string)

const courseInfo = ref<Course>({
  id: '',
  name: '',
  teacher: '',
  duration: '',
  coverImageUrl: '',
  description: '',
  totalLessons: 0
})

const resourceList = ref<CourseResource[]>([])
const addResourceDialogVisible = ref(false)
const viewResourceDialogVisible = ref(false)
const currentResource = ref<CourseResource | null>(null)
const progress = ref(0)
const progressColor = computed(() => {
  if (progress.value < 30) return '#F56C6C'
  if (progress.value < 70) return '#E6A23C'
  return '#67C23A'
})

const addResourceForm = ref({
  title: '',
  type: '',
  description: ''
})

// 加载课程详情
const loadCourseDetail = async () => {
  
  const res: any = await request.get(`/course/${courseId.value}/detail`)
  console.log('get course res', res)

  courseInfo.value = res.courseInfo;
  loadResources();
  // const courseList = JSON.parse(localStorage.getItem('courseList') || '[]')
  // const course = courseList.find((c: Course) => c.id === courseId.value)

  // if (course) {
  //   courseInfo.value = course
  //   loadResources()
  //   loadProgress()
  // } else {
  //   ElMessage.error('未找到该课程信息')
  //   router.push('/course/list')
  // }
}

// 加载课时列表
const loadResources = async () => {
  const res: any = await request.get(`/course/${courseId.value}/lessons`)
  console.log('lessons res', res)

  resourceList.value = res.list;
  // resourceList.value = allResources.filter((r: CourseResource) => r.courseId === courseId.value)
}

// 加载学习进度
const loadProgress = () => {
  const progressData = JSON.parse(localStorage.getItem('courseProgress') || '{}')
  progress.value = progressData[courseId.value] || 0
}

const getResourceIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    '视频': VideoPlay,
    '音频': Headset,
    '文档': Document
  }
  return iconMap[type] || Document
}

const getResourceIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '视频': '#409EFF',
    '音频': '#67C23A',
    '文档': '#909399'
  }
  return colorMap[type] || '#909399'
}

const goBack = () => {
  router.push('/course/list')
}


const viewResource = (resourceId: string) => {
  // currentResource.value = resource
  viewResourceDialogVisible.value = true
  router.push(`/video-player/${courseId.value}/${resourceId}`)
}

onMounted(() => {
  loadCourseDetail()
})
</script>

<style scoped>
.course-detail-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.page-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-card,
.resource-card,
.stats-card {
  margin-bottom: 20px;
}

.card-content {
  padding: 10px 0;
}

.course-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-item .label {
  color: #909399;
  font-size: 14px;
}

.meta-item .value {
  color: #303133;
  font-size: 15px;
  font-weight: 500;
}

.course-description h4 {
  color: #303133;
  font-size: 16px;
  margin: 0 0 12px 0;
}

.course-description p {
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.resource-item:hover {
  background: #e6f7ff;
}

.resource-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-title {
  color: #303133;
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.resource-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-date {
  color: #909399;
  font-size: 13px;
}

.resource-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.progress-content {
  padding: 20px 0;
}

.progress-text {
  text-align: center;
  margin-top: 16px;
  color: #606266;
  font-size: 14px;
}

.stats-content {
  padding: 10px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.resource-detail {
  padding: 20px 0;
}

.resource-preview {
  margin-top: 24px;
  padding: 32px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.resource-preview p {
  margin: 16px 0 0 0;
  color: #909399;
}

@media (max-width: 768px) {
  .page-main {
    padding: 16px;
  }

  .course-meta {
    flex-direction: column;
    gap: 12px;
  }

  .resource-item {
    flex-direction: column;
  }

  .resource-action {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
