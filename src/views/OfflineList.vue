<template>
  <div class="offline-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>线下课程</h1>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          发布课程
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="filter-bar">
        <el-select v-model="filters.status" placeholder="课程状态" clearable @change="applyFilters">
          <el-option label="全部" value="" />
          <el-option label="报名中" value="报名中" />
          <el-option label="进行中" value="进行中" />
          <el-option label="已结束" value="已结束" />
        </el-select>
        <el-select v-model="filters.city" placeholder="城市" clearable @change="applyFilters">
          <el-option label="全部" value="" />
          <el-option label="北京" value="北京" />
          <el-option label="上海" value="上海" />
          <el-option label="广州" value="广州" />
          <el-option label="深圳" value="深圳" />
          <el-option label="成都" value="成都" />
        </el-select>
        <el-date-picker
          v-model="filters.date"
          type="date"
          placeholder="选择日期"
          @change="applyFilters"
        />
      </div>

      <el-row :gutter="20" class="course-list">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="course in filteredCourses" :key="course.id">
          <el-card class="course-card" @click="viewDetail(course.id)">
            <div class="course-cover">
              <el-image :src="course.cover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-status" :class="getStatusClass(course.status)">
                {{ course.status }}
              </div>
            </div>
            <div class="card-content">
              <h3 class="course-title">{{ course.title }}</h3>
              <div class="course-info">
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ course.city }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ course.date }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ course.duration }}</span>
                </div>
              </div>
              <div class="course-footer">
                <div class="price">
                  <span class="label">价格</span>
                  <span class="value">¥{{ course.price }}</span>
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

      <el-empty v-if="filteredCourses.length === 0" description="暂无课程" />
    </el-main>

    <!-- 添加课程对话框 -->
    <el-dialog v-model="addDialogVisible" title="发布线下课程" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="课程标题">
          <el-input v-model="addForm.title" placeholder="请输入课程标题" />
        </el-form-item>
        <el-form-item label="课程状态">
          <el-select v-model="addForm.status" placeholder="请选择课程状态">
            <el-option label="报名中" value="报名中" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="addForm.city" placeholder="请选择城市">
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="广州" value="广州" />
            <el-option label="深圳" value="深圳" />
            <el-option label="成都" value="成都" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课日期">
          <el-date-picker
            v-model="addForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="课程时长">
          <el-input v-model="addForm.duration" placeholder="例如：3天" />
        </el-form-item>
        <el-form-item label="课程价格">
          <el-input-number v-model="addForm.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="课程封面">
          <el-input v-model="addForm.cover" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Picture, 
  Location, 
  Calendar, 
  Clock,
  ArrowRight
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

const router = useRouter()
const courseList = ref<OfflineCourse[]>([])
const addDialogVisible = ref(false)

const filters = ref({
  status: '',
  city: '',
  date: ''
})

const addForm = ref({
  title: '',
  status: '',
  city: '',
  date: '',
  duration: '',
  price: 0,
  cover: '',
  description: ''
})

// 根据筛选条件过滤课程
const filteredCourses = computed(() => {
  return courseList.value.filter(course => {
    if (filters.value.status && course.status !== filters.value.status) return false
    if (filters.value.city && course.city !== filters.value.city) return false
    if (filters.value.date && course.date !== filters.value.date) return false
    return true
  })
})

// 从localStorage加载课程列表
const loadCourseList = () => {
  const stored = localStorage.getItem('offlineCourses')
  if (stored) {
    courseList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    courseList.value = [
      {
        id: '1',
        title: '北京话线下体验课',
        status: '报名中',
        city: '北京',
        date: '2024-02-15',
        duration: '3天',
        price: 299,
        cover: '',
        description: '在北京本地体验纯正的北京话，由资深方言老师授课，包含语音、词汇、日常对话等内容。'
      },
      {
        id: '2',
        title: '上海话周末班',
        status: '报名中',
        city: '上海',
        date: '2024-02-20',
        duration: '2天',
        price: 399,
        cover: '',
        description: '利用周末时间学习上海话，快速掌握基础发音和常用表达。'
      },
      {
        id: '3',
        title: '粤语沉浸式学习营',
        status: '进行中',
        city: '广州',
        date: '2024-02-10',
        duration: '5天',
        price: 899,
        cover: '',
        description: '在广州本地进行为期5天的粤语沉浸式学习，全方位提升语言能力。'
      },
      {
        id: '4',
        title: '四川话文化体验',
        status: '已结束',
        city: '成都',
        date: '2024-01-20',
        duration: '4天',
        price: 599,
        cover: '',
        description: '结合四川文化体验学习四川话，感受川渝地区的语言魅力。'
      }
    ]
    localStorage.setItem('offlineCourses', JSON.stringify(courseList.value))
  }
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    '报名中': 'status-enrolling',
    '进行中': 'status-ongoing',
    '已结束': 'status-ended'
  }
  return classMap[status] || ''
}

const applyFilters = () => {
  // 过滤逻辑由computed自动处理
}

const viewDetail = (id: string) => {
  router.push(`/offline/${id}`)
}

const showAddDialog = () => {
  addForm.value = {
    title: '',
    status: '',
    city: '',
    date: '',
    duration: '',
    price: 0,
    cover: '',
    description: ''
  }
  addDialogVisible.value = true
}

const handleAdd = () => {
  if (!addForm.value.title || !addForm.value.status || !addForm.value.city) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const newCourse: OfflineCourse = {
    id: Date.now().toString(),
    title: addForm.value.title,
    status: addForm.value.status,
    city: addForm.value.city,
    date: addForm.value.date,
    duration: addForm.value.duration,
    price: addForm.value.price,
    cover: addForm.value.cover,
    description: addForm.value.description
  }

  courseList.value.unshift(newCourse)
  localStorage.setItem('offlineCourses', JSON.stringify(courseList.value))

  ElMessage.success('发布成功')
  addDialogVisible.value = false
}

onMounted(() => {
  loadCourseList()
})
</script>

<style scoped>
.offline-container {
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

.course-list {
  margin-bottom: 20px;
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

.course-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.status-enrolling {
  background: #67C23A;
}

.status-ongoing {
  background: #409EFF;
}

.status-ended {
  background: #909399;
}

.card-content {
  padding: 16px 0;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price .label {
  color: #909399;
  font-size: 13px;
}

.price .value {
  color: #F56C6C;
  font-size: 20px;
  font-weight: 600;
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
}
</style>
