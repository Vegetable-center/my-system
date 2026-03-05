<template>
  <div class="offline-detail-container">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="course-title">{{ courseInfo.title }}</span>
          <el-tag :type="getStatusType(courseInfo.status)" size="large">
            {{ courseInfo.status }}
          </el-tag>
        </div>
      </template>
    </el-page-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="info-card">
            <div class="course-cover" v-if="courseInfo.cover">
              <el-image :src="courseInfo.cover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="card-content">
              <div class="course-meta">
                <div class="meta-item">
                  <el-icon :size="20" color="#409EFF"><Location /></el-icon>
                  <span class="label">城市：</span>
                  <span class="value">{{ courseInfo.city }}</span>
                </div>
                <div class="meta-item">
                  <el-icon :size="20" color="#67C23A"><Calendar /></el-icon>
                  <span class="label">日期：</span>
                  <span class="value">{{ courseInfo.date }}</span>
                </div>
                <div class="meta-item">
                  <el-icon :size="20" color="#E6A23C"><Clock /></el-icon>
                  <span class="label">时长：</span>
                  <span class="value">{{ courseInfo.duration }}</span>
                </div>
                <div class="meta-item">
                  <el-icon :size="20" color="#F56C6C"><Money /></el-icon>
                  <span class="label">价格：</span>
                  <span class="value price">¥{{ courseInfo.price }}</span>
                </div>
              </div>
              <el-divider />
              <div class="course-description">
                <h4>课程简介</h4>
                <p>{{ courseInfo.description }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="schedule-card">
            <template #header>
              <div class="card-header">
                <span>课程安排</span>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in schedule"
                :key="index"
                :timestamp="item.time"
                placement="top"
              >
                <el-card>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.content }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>报名信息</span>
              </div>
            </template>
            <div class="action-content">
              <div class="price-display">
                <span class="label">课程价格</span>
                <span class="value">¥{{ courseInfo.price }}</span>
              </div>
              <el-button 
                type="primary" 
                size="large" 
                class="enroll-button"
                :disabled="courseInfo.status !== '报名中'"
                @click="handleEnroll"
              >
                {{ getEnrollButtonText() }}
              </el-button>
              <div class="enroll-info">
                <p>已有 <strong>{{ enrolledCount }}</strong> 人报名</p>
                <p v-if="courseInfo.status === '报名中'">名额有限，先到先得</p>
              </div>
            </div>
          </el-card>

          <el-card class="contact-card">
            <template #header>
              <div class="card-header">
                <span>联系方式</span>
              </div>
            </template>
            <div class="contact-info">
              <div class="contact-item">
                <el-icon :size="20"><Phone /></el-icon>
                <span>联系电话：400-123-4567</span>
              </div>
              <div class="contact-item">
                <el-icon :size="20"><Message /></el-icon>
                <span>邮箱：contact@studyplant.com</span>
              </div>
              <div class="contact-item">
                <el-icon :size="20"><Location /></el-icon>
                <span>地址：{{ courseInfo.city }}市教学中心</span>
              </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Picture, 
  Location, 
  Calendar, 
  Clock,
  Money,
  Phone,
  Message
} from '@element-plus/icons-vue'

interface OfflineCourse {
  id: string
  title: string
  status: string
  city: string
  date: string
  duration: string
  price: number
  cover: string
  description: string
}

interface ScheduleItem {
  time: string
  title: string
  content: string
}

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.id as string)

const courseInfo = ref<OfflineCourse>({
  id: '',
  title: '',
  status: '',
  city: '',
  date: '',
  duration: '',
  price: 0,
  cover: '',
  description: ''
})

const schedule = ref<ScheduleItem[]>([
  {
    time: '第一天 09:00',
    title: '课程开始',
    content: '开班仪式，介绍课程安排和学习目标'
  },
  {
    time: '第一天 14:00',
    title: '基础学习',
    content: '学习基础发音和常用词汇'
  },
  {
    time: '第二天 09:00',
    title: '进阶学习',
    content: '深入学习语法结构和表达方式'
  },
  {
    time: '第二天 14:00',
    title: '实践练习',
    content: '分组练习和角色扮演'
  },
  {
    time: '第三天 09:00',
    title: '综合应用',
    content: '情景对话和实际应用'
  },
  {
    time: '第三天 14:00',
    title: '课程总结',
    content: '学习成果展示和课程总结'
  }
])

const enrolledCount = ref(Math.floor(Math.random() * 50 + 20))

// 加载课程详情
const loadCourseDetail = () => {
  const allCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]')
  const course = allCourses.find((c: OfflineCourse) => c.id === courseId.value)

  if (course) {
    courseInfo.value = course
  } else {
    ElMessage.error('未找到该课程信息')
    router.push('/offline/list')
  }
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '报名中': 'success',
    '进行中': 'primary',
    '已结束': 'info'
  }
  return typeMap[status] || 'info'
}

const getEnrollButtonText = () => {
  if (courseInfo.value.status === '报名中') {
    return '立即报名'
  } else if (courseInfo.value.status === '进行中') {
    return '课程进行中'
  } else {
    return '课程已结束'
  }
}

const handleEnroll = () => {
  if (courseInfo.value.status !== '报名中') {
    ElMessage.warning('当前课程不可报名')
    return
  }

  ElMessageBox.confirm(
    '确认报名该课程吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      enrolledCount.value += 1
      ElMessage.success('报名成功！我们将尽快与您联系')
    })
    .catch(() => {
      // 用户取消操作
    })
}

const goBack = () => {
  router.push('/offline/list')
}

onMounted(() => {
  loadCourseDetail()
})
</script>

<style scoped>
.offline-detail-container {
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
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.page-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-card,
.schedule-card,
.action-card,
.contact-card {
  margin-bottom: 20px;
}

.course-cover {
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
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

.card-content {
  padding: 0;
}

.course-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
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

.meta-item .value.price {
  color: #F56C6C;
  font-size: 18px;
  font-weight: 600;
}

.course-description h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.course-description p {
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.schedule-card :deep(.el-card) {
  margin-bottom: 10px;
}

.schedule-card :deep(.el-card__body) {
  padding: 12px;
}

.schedule-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.schedule-card p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.action-content {
  padding: 0;
}

.price-display {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.price-display .label {
  color: #909399;
  font-size: 14px;
}

.price-display .value {
  color: #F56C6C;
  font-size: 28px;
  font-weight: 600;
}

.enroll-button {
  width: 100%;
  margin-bottom: 16px;
}

.enroll-info {
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.enroll-info p {
  margin: 8px 0;
}

.enroll-info strong {
  color: #F56C6C;
  font-size: 16px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 14px;
}

@media (max-width: 768px) {
  .page-main {
    padding: 16px;
  }

  .course-meta {
    grid-template-columns: 1fr;
  }

  .price-display .value {
    font-size: 24px;
  }
}
</style>
