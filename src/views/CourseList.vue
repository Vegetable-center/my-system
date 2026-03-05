<template>
  <div class="course-list-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>课程学习</h1>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加课程
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="course in courseList" :key="course.id">
          <el-card class="course-card" @click="viewDetail(course.id)">
            <div class="course-cover">
              <el-image :src="course.cover || defaultCover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-level" :class="getLevelClass(course.level)">
                {{ course.level }}
              </div>
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
                    {{ course.duration }}
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

    <!-- 添加课程对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加课程" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="课程标题">
          <el-input v-model="addForm.title" placeholder="请输入课程标题" />
        </el-form-item>
        <el-form-item label="课程难度">
          <el-select v-model="addForm.level" placeholder="请选择课程难度">
            <el-option label="入门" value="入门" />
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="addForm.teacher" placeholder="请输入授课教师" />
        </el-form-item>
        <el-form-item label="课程时长">
          <el-input v-model="addForm.duration" placeholder="例如：12课时" />
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
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Picture, User, Clock, ArrowRight } from '@element-plus/icons-vue'

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

const router = useRouter()
const courseList = ref<Course[]>([])
const addDialogVisible = ref(false)
const defaultCover = 'https://via.placeholder.com/300x200?text=Course'

const addForm = ref({
  title: '',
  level: '',
  teacher: '',
  duration: '',
  cover: '',
  description: ''
})

// 从localStorage加载课程列表
const loadCourseList = () => {
  const stored = localStorage.getItem('courseList')
  if (stored) {
    courseList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    courseList.value = [
      {
        id: '1',
        title: '北京话入门',
        level: '入门',
        teacher: '王老师',
        duration: '12课时',
        cover: '',
        description: '本课程从零开始学习北京话，包含语音、词汇、日常对话等内容，适合初学者。',
        resourceCount: 15
      },
      {
        id: '2',
        title: '上海话进阶',
        level: '中级',
        teacher: '李老师',
        duration: '20课时',
        cover: '',
        description: '深入学习上海话的语法结构和表达方式，提高语言运用能力。',
        resourceCount: 20
      },
      {
        id: '3',
        title: '粤语基础',
        level: '初级',
        teacher: '张老师',
        duration: '16课时',
        cover: '',
        description: '系统学习粤语发音、常用词汇和日常会话，快速掌握粤语基础。',
        resourceCount: 18
      },
      {
        id: '4',
        title: '四川话高级',
        level: '高级',
        teacher: '刘老师',
        duration: '24课时',
        cover: '',
        description: '深入学习四川话的方言特色和文化内涵，提升语言表达能力。',
        resourceCount: 22
      }
    ]
    localStorage.setItem('courseList', JSON.stringify(courseList.value))
  }
}

const getLevelClass = (level: string) => {
  const classMap: Record<string, string> = {
    '入门': 'level-beginner',
    '初级': 'level-elementary',
    '中级': 'level-intermediate',
    '高级': 'level-advanced'
  }
  return classMap[level] || ''
}

const viewDetail = (id: string) => {
  router.push(`/course/${id}`)
}

const showAddDialog = () => {
  addForm.value = {
    title: '',
    level: '',
    teacher: '',
    duration: '',
    cover: '',
    description: ''
  }
  addDialogVisible.value = true
}

const handleAdd = () => {
  if (!addForm.value.title || !addForm.value.level || !addForm.value.teacher) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const newCourse: Course = {
    id: Date.now().toString(),
    title: addForm.value.title,
    level: addForm.value.level,
    teacher: addForm.value.teacher,
    duration: addForm.value.duration,
    cover: addForm.value.cover,
    description: addForm.value.description,
    resourceCount: 0
  }

  courseList.value.unshift(newCourse)
  localStorage.setItem('courseList', JSON.stringify(courseList.value))

  ElMessage.success('添加成功')
  addDialogVisible.value = false
}

onMounted(() => {
  loadCourseList()
})
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
