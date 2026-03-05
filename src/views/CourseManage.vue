<template>
  <div class="course-manage-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>课程管理</h1>
        <el-button type="primary" @click="createCourse">
          <el-icon><Plus /></el-icon>
          创建课程
        </el-button>
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
        <el-select v-model="filterStatus" placeholder="课程状态" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
        <el-select v-model="filterCategory" placeholder="课程分类" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="方言学习" value="dialect" />
          <el-option label="文化介绍" value="culture" />
          <el-option label="实用技巧" value="skill" />
        </el-select>
      </div>

      <div class="course-list">
        <el-card v-for="course in filteredCourses" :key="course.id" class="course-card">
          <div class="course-cover" @click="viewCourse(course.id)">
            <el-image :src="course.cover" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon :size="40"><VideoPlay /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="course-status" :class="getStatusClass(course.status)">
              {{ getStatusText(course.status) }}
            </div>
          </div>
          <div class="course-content">
            <h3 class="course-title" @click="viewCourse(course.id)">{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>
            <div class="course-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ course.students || 0 }} 学员</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ course.duration }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span>{{ course.lessons || 0 }} 课时</span>
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
              <el-button type="primary" link @click="editCourse(course)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="deleteCourse(course.id)">
                <el-icon><Delete /></el-icon>
                删除
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
  Plus,
  Search,
  VideoPlay,
  User,
  Clock,
  Document,
  Edit,
  Delete
} from '@element-plus/icons-vue'

interface Course {
  id: string
  title: string
  description: string
  cover: string
  category: string
  status: 'draft' | 'published'
  students?: number
  duration: string
  lessons?: number
  tags: string[]
  createTime: string
}

const router = useRouter()
const courseList = ref<Course[]>([])
const searchKeyword = ref('')
const filterStatus = ref('')
const filterCategory = ref('')

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
    result = result.filter(course => course.status === filterStatus.value)
  }

  if (filterCategory.value) {
    result = result.filter(course => course.category === filterCategory.value)
  }

  return result
})

// 加载课程列表
const loadCourses = () => {
  const stored = localStorage.getItem('myCourses')
  if (stored) {
    courseList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    courseList.value = [
      {
        id: '1',
        title: '北京话入门课程',
        description: '从零开始学习北京话，掌握基础发音和日常用语',
        cover: '',
        category: 'dialect',
        status: 'published',
        students: 120,
        duration: '10课时',
        lessons: 10,
        tags: ['北京话', '入门', '基础'],
        createTime: new Date().toLocaleString()
      },
      {
        id: '2',
        title: '上海话进阶课程',
        description: '深入学习上海话，提升语言表达能力',
        cover: '',
        category: 'dialect',
        status: 'published',
        students: 85,
        duration: '15课时',
        lessons: 15,
        tags: ['上海话', '进阶', '口语'],
        createTime: new Date().toLocaleString()
      },
      {
        id: '3',
        title: '粤语文化介绍',
        description: '了解粤语文化背景，更好地学习语言',
        cover: '',
        category: 'culture',
        status: 'draft',
        students: 0,
        duration: '8课时',
        lessons: 8,
        tags: ['粤语', '文化', '背景'],
        createTime: new Date().toLocaleString()
      }
    ]
    localStorage.setItem('myCourses', JSON.stringify(courseList.value))
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'published': '已发布'
  }
  return statusMap[status] || ''
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'draft': 'status-draft',
    'published': 'status-published'
  }
  return classMap[status] || ''
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
const viewCourse = (id: string) => {
  router.push(`/course/${id}`)
}

// 创建课程
const createCourse = () => {
  router.push('/course/create')
}

// 编辑课程
const editCourse = (course: Course) => {
  localStorage.setItem('editingCourse', JSON.stringify(course))
  router.push('/course/create')
}

// 删除课程
const deleteCourse = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这个课程吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = courseList.value.findIndex(c => c.id === id)
      if (index > -1) {
        courseList.value.splice(index, 1)
        localStorage.setItem('myCourses', JSON.stringify(courseList.value))
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-manage-container {
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.status-draft {
  background: #909399;
}

.status-published {
  background: #67C23A;
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
  gap: 16px;
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
