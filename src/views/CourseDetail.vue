<template>
  <div class="course-detail-container">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="course-title">{{ courseInfo.title }}</span>
          <el-tag :type="getLevelType(courseInfo.level)" size="large">{{ courseInfo.level }}</el-tag>
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
                  <span class="value">{{ courseInfo.duration }}</span>
                </div>
                <div class="meta-item">
                  <el-icon :size="20" color="#E6A23C"><Document /></el-icon>
                  <span class="label">资源数量：</span>
                  <span class="value">{{ courseInfo.resourceCount }} 个</span>
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
                <span>课程资源</span>
                <!-- <el-button type="primary" size="small" @click="showAddResourceDialog">
                  <el-icon><Plus /></el-icon>
                  添加资源
                </el-button> -->
              </div>
            </template>
            <div class="resource-list">
              <div v-for="resource in resourceList" :key="resource.id" class="resource-item">
                <div class="resource-icon">
                  <el-icon :size="32" :color="getResourceIconColor(resource.type)">
                    <component :is="getResourceIcon(resource.type)" />
                  </el-icon>
                </div>
                <div class="resource-info">
                  <h4 class="resource-title">{{ resource.title }}</h4>
                  <p class="resource-desc">{{ resource.description }}</p>
                  <div class="resource-meta">
                    <el-tag size="small" :type="getResourceTagType(resource.type)">
                      {{ resource.type }}
                    </el-tag>
                    <span class="resource-date">{{ resource.createTime }}</span>
                  </div>
                </div>
                <div class="resource-action">
                  <el-button type="primary" link @click="viewResource(resource)">
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
                <span>学习进度</span>
              </div>
            </template>
            <div class="progress-content">
              <el-progress 
                :percentage="progress" 
                :color="progressColor"
                :stroke-width="20"
              />
              <div class="progress-text">
                已完成 {{ progress }}%
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 添加资源对话框 -->
    <el-dialog v-model="addResourceDialogVisible" title="添加资源" width="500px">
      <el-form :model="addResourceForm" label-width="100px">
        <el-form-item label="资源标题">
          <el-input v-model="addResourceForm.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="addResourceForm.type" placeholder="请选择资源类型">
            <el-option label="视频" value="视频" />
            <el-option label="音频" value="音频" />
            <el-option label="文档" value="文档" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="addResourceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资源描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addResourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddResource">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看资源对话框 -->
    <el-dialog v-model="viewResourceDialogVisible" :title="currentResource?.title" width="600px">
      <div class="resource-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="资源类型">
            {{ currentResource?.type }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentResource?.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="资源描述">
            {{ currentResource?.description }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="resource-preview" v-if="currentResource">
          <el-icon :size="64" :color="getResourceIconColor(currentResource.type)">
            <component :is="getResourceIcon(currentResource.type)" />
          </el-icon>
          <p>资源预览功能开发中...</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, VideoPlay, Headset, Document, User, Clock } from '@element-plus/icons-vue'

interface Course {
  id: string
  title: string
  level: string
  teacher: string
  duration: string
  cover: string
  description: string
  resourceCount: number
}

interface CourseResource {
  id: string
  courseId: string
  title: string
  type: string
  description: string
  createTime: string
}

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.id as string)

const courseInfo = ref<Course>({
  id: '',
  title: '',
  level: '',
  teacher: '',
  duration: '',
  cover: '',
  description: '',
  resourceCount: 0
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
const loadCourseDetail = () => {
  const courseList = JSON.parse(localStorage.getItem('courseList') || '[]')
  const course = courseList.find((c: Course) => c.id === courseId.value)

  if (course) {
    courseInfo.value = course
    loadResources()
    loadProgress()
  } else {
    ElMessage.error('未找到该课程信息')
    router.push('/course/list')
  }
}

// 加载资源列表
const loadResources = () => {
  const allResources = JSON.parse(localStorage.getItem('courseResources') || '[]')
  resourceList.value = allResources.filter((r: CourseResource) => r.courseId === courseId.value)
}

// 加载学习进度
const loadProgress = () => {
  const progressData = JSON.parse(localStorage.getItem('courseProgress') || '{}')
  progress.value = progressData[courseId.value] || 0
}

const getLevelType = (level: string) => {
  const typeMap: Record<string, any> = {
    '入门': 'success',
    '初级': 'primary',
    '中级': 'warning',
    '高级': 'danger'
  }
  return typeMap[level] || ''
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

const getResourceTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    '视频': 'primary',
    '音频': 'success',
    '文档': 'info'
  }
  return typeMap[type] || 'info'
}

const goBack = () => {
  router.push('/course/list')
}

const showAddResourceDialog = () => {
  addResourceForm.value = {
    title: '',
    type: '',
    description: ''
  }
  addResourceDialogVisible.value = true
}

const handleAddResource = () => {
  if (!addResourceForm.value.title || !addResourceForm.value.type) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const newResource: CourseResource = {
    id: Date.now().toString(),
    courseId: courseId.value,
    title: addResourceForm.value.title,
    type: addResourceForm.value.type,
    description: addResourceForm.value.description,
    createTime: new Date().toLocaleString()
  }

  const allResources = JSON.parse(localStorage.getItem('courseResources') || '[]')
  allResources.unshift(newResource)
  localStorage.setItem('courseResources', JSON.stringify(allResources))

  // 更新课程资源计数
  const courseList = JSON.parse(localStorage.getItem('courseList') || '[]')
  const courseIndex = courseList.findIndex((c: Course) => c.id === courseId.value)
  if (courseIndex !== -1) {
    courseList[courseIndex].resourceCount += 1
    localStorage.setItem('courseList', JSON.stringify(courseList))
    courseInfo.value.resourceCount += 1
  }

  loadResources()
  ElMessage.success('添加成功')
  addResourceDialogVisible.value = false
}

const viewResource = (resource: CourseResource) => {
  currentResource.value = resource
  viewResourceDialogVisible.value = true
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
