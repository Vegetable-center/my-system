<template>
  <div class="course-edit-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>{{ isEdit ? '编辑课程' : '创建课程' }}</h1>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-card class="form-card">
        <el-form :model="courseForm" label-width="120px">
          <el-form-item label="课程标题">
            <el-input 
              v-model="courseForm.title" 
              placeholder="请输入课程标题" 
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="课程分类">
            <el-select v-model="courseForm.category" placeholder="请选择分类">
              <el-option label="方言学习" value="dialect" />
              <el-option label="文化介绍" value="culture" />
              <el-option label="实用技巧" value="skill" />
            </el-select>
          </el-form-item>

          <el-form-item label="课程封面">
            <div class="cover-upload">
              <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload"
                accept="image/*"
              >
                <img v-if="courseForm.cover" :src="courseForm.cover" class="cover-image" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">
                <p>支持 jpg、png 格式，建议尺寸 800x600</p>
                <p>文件大小不超过 2MB</p>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="课程简介">
            <el-input
              v-model="courseForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入课程简介"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="课程时长">
            <el-input 
              v-model="courseForm.duration" 
              placeholder="例如：10课时"
            />
          </el-form-item>

          <el-form-item label="课程标签">
            <div class="tags-input">
              <el-tag
                v-for="tag in courseForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="inputRef"
                v-model="inputValue"
                class="tag-input"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 新标签
              </el-button>
            </div>
          </el-form-item>

          <el-divider>课程内容</el-divider>

          <el-form-item label="添加课时">
            <div class="lessons-list">
              <div v-for="(lesson, index) in courseForm.lessons" :key="index" class="lesson-item">
                <el-input 
                  v-model="lesson.title" 
                  placeholder="课时标题"
                  class="lesson-input"
                />
                <el-input 
                  v-model="lesson.videoUrl" 
                  placeholder="视频链接"
                  class="lesson-input"
                />
                <el-button 
                  type="danger" 
                  size="small"
                  @click="removeLesson(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
              <el-button type="primary" size="small" @click="addLesson">
                <el-icon><Plus /></el-icon>
                添加课时
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button @click="saveDraft">保存草稿</el-button>
              <el-button type="primary" @click="publishCourse">发布课程</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

interface Lesson {
  title: string
  videoUrl: string
}

interface CourseForm {
  title: string
  category: string
  cover: string
  description: string
  duration: string
  tags: string[]
  lessons: Lesson[]
}

const router = useRouter()
const isEdit = ref(false)
const courseForm = ref<CourseForm>({
  title: '',
  category: '',
  cover: '',
  description: '',
  duration: '',
  tags: [],
  lessons: []
})

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// 加载编辑数据
const loadEditData = () => {
  const editingCourse = localStorage.getItem('editingCourse')
  if (editingCourse) {
    const course = JSON.parse(editingCourse)
    courseForm.value = {
      title: course.title,
      category: course.category,
      cover: course.cover,
      description: course.description,
      duration: course.duration,
      tags: course.tags || [],
      lessons: course.lessons || []
    }
    isEdit.value = true
    localStorage.removeItem('editingCourse')
  }
}

// 封面上传成功
const handleCoverSuccess = (response: any) => {
  courseForm.value.cover = response.url
  ElMessage.success('封面上传成功')
}

// 封面上传前验证
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 显示标签输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}

// 确认添加标签
const handleInputConfirm = () => {
  if (inputValue.value) {
    if (courseForm.value.tags.length >= 5) {
      ElMessage.warning('最多添加5个标签')
      return
    }
    if (courseForm.value.tags.includes(inputValue.value)) {
      ElMessage.warning('标签已存在')
      return
    }
    courseForm.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 移除标签
const removeTag = (tag: string) => {
  const index = courseForm.value.tags.indexOf(tag)
  if (index > -1) {
    courseForm.value.tags.splice(index, 1)
  }
}

// 添加课时
const addLesson = () => {
  courseForm.value.lessons.push({
    title: '',
    videoUrl: ''
  })
}

// 删除课时
const removeLesson = (index: number) => {
  courseForm.value.lessons.splice(index, 1)
}

// 保存草稿
const saveDraft = () => {
  if (!courseForm.value.title || !courseForm.value.category) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const course = {
    id: isEdit.value ? (JSON.parse(localStorage.getItem('editingCourse') || '{}')).id : Date.now().toString(),
    ...courseForm.value,
    status: 'draft' as const,
    createTime: new Date().toLocaleString()
  }

  const courses = JSON.parse(localStorage.getItem('myCourses') || '[]')
  if (isEdit.value) {
    const index = courses.findIndex((c: any) => c.id === course.id)
    if (index > -1) {
      courses[index] = course
    }
  } else {
    courses.unshift(course)
  }

  localStorage.setItem('myCourses', JSON.stringify(courses))
  ElMessage.success('草稿已保存')
}

// 发布课程
const publishCourse = () => {
  if (!courseForm.value.title || !courseForm.value.category || !courseForm.value.description) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (courseForm.value.lessons.length === 0) {
    ElMessage.warning('请至少添加一个课时')
    return
  }

  const course = {
    id: isEdit.value ? (JSON.parse(localStorage.getItem('editingCourse') || '{}')).id : Date.now().toString(),
    ...courseForm.value,
    status: 'published' as const,
    students: 0,
    createTime: new Date().toLocaleString()
  }

  const courses = JSON.parse(localStorage.getItem('myCourses') || '[]')
  if (isEdit.value) {
    const index = courses.findIndex((c: any) => c.id === course.id)
    if (index > -1) {
      courses[index] = course
    }
  } else {
    courses.unshift(course)
  }

  localStorage.setItem('myCourses', JSON.stringify(courses))
  ElMessage.success('课程发布成功')
  router.push('/course/manage')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadEditData()
})
</script>

<style scoped>
.course-edit-container {
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
  max-width: 1000px;
  margin: 0 auto;
}

.form-card {
  margin-bottom: 20px;
}

.cover-upload {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.cover-image {
  width: 200px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  color: #909399;
  font-size: 13px;
  line-height: 1.8;
}

.upload-tip p {
  margin: 4px 0;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-item {
  margin-right: 4px;
}

.tag-input {
  width: 90px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 4px;
}

.lessons-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.lesson-input {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
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

  .cover-upload {
    flex-direction: column;
  }

  .lesson-item {
    flex-direction: column;
  }

  .lesson-input {
    width: 100%;
  }
}
</style>
