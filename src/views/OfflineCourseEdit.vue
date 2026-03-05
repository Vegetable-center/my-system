<template>
  <div class="course-edit-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>{{ isEdit ? '编辑线下课程' : '创建线下课程' }}</h1>
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

          <el-form-item label="开课城市">
            <el-select v-model="courseForm.city" placeholder="请选择城市">
              <el-option label="北京" value="北京" />
              <el-option label="上海" value="上海" />
              <el-option label="广州" value="广州" />
              <el-option label="深圳" value="深圳" />
              <el-option label="成都" value="成都" />
            </el-select>
          </el-form-item>

          <el-form-item label="开课日期">
            <el-date-picker
              v-model="courseForm.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="课程时长">
            <el-input 
              v-model="courseForm.duration" 
              placeholder="例如：3天"
            />
          </el-form-item>

          <el-form-item label="课程价格">
            <el-input-number 
              v-model="courseForm.price" 
              :min="0" 
              :precision="2"
              style="width: 100%"
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

          <el-form-item label="课程安排">
            <div class="schedule-list">
              <div v-for="(item, index) in courseForm.schedule" :key="index" class="schedule-item">
                <el-input 
                  v-model="item.time" 
                  placeholder="时间"
                  class="schedule-input"
                />
                <el-input 
                  v-model="item.title" 
                  placeholder="内容"
                  class="schedule-input"
                />
                <el-button 
                  type="danger" 
                  size="small"
                  @click="removeSchedule(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
              <el-button type="primary" size="small" @click="addSchedule">
                <el-icon><Plus /></el-icon>
                添加安排
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="课程地址">
            <el-input
              v-model="courseForm.address"
              placeholder="请输入详细地址"
            />
          </el-form-item>

          <el-form-item label="联系方式">
            <el-input
              v-model="courseForm.contact"
              placeholder="请输入联系电话"
            />
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

interface ScheduleItem {
  time: string
  title: string
}

interface CourseForm {
  title: string
  category: string
  cover: string
  description: string
  city: string
  date: string
  duration: string
  price: number
  tags: string[]
  schedule: ScheduleItem[]
  address: string
  contact: string
}

const router = useRouter()
const isEdit = ref(false)
const courseForm = ref<CourseForm>({
  title: '',
  category: '',
  cover: '',
  description: '',
  city: '',
  date: '',
  duration: '',
  price: 0,
  tags: [],
  schedule: [],
  address: '',
  contact: ''
})

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// 加载编辑数据
const loadEditData = () => {
  const editingCourse = localStorage.getItem('editingOfflineCourse')
  if (editingCourse) {
    const course = JSON.parse(editingCourse)
    courseForm.value = {
      title: course.title,
      category: course.category,
      cover: course.cover,
      description: course.description,
      city: course.city,
      date: course.date,
      duration: course.duration,
      price: course.price || 0,
      tags: course.tags || [],
      schedule: course.schedule || [],
      address: course.address || '',
      contact: course.contact || ''
    }
    isEdit.value = true
    localStorage.removeItem('editingOfflineCourse')
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

// 添加安排
const addSchedule = () => {
  courseForm.value.schedule.push({
    time: '',
    title: ''
  })
}

// 删除安排
const removeSchedule = (index: number) => {
  courseForm.value.schedule.splice(index, 1)
}

// 保存草稿
const saveDraft = () => {
  if (!courseForm.value.title || !courseForm.value.category) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const course = {
    id: isEdit.value ? (JSON.parse(localStorage.getItem('editingOfflineCourse') || '{}')).id : Date.now().toString(),
    ...courseForm.value,
    type: 'offline' as const,
    status: 'draft' as const,
    students: 0,
    createTime: new Date().toLocaleString()
  }

  const courses = JSON.parse(localStorage.getItem('offlineCourses') || '[]')
  if (isEdit.value) {
    const index = courses.findIndex((c: any) => c.id === course.id)
    if (index > -1) {
      courses[index] = course
    }
  } else {
    courses.unshift(course)
  }

  localStorage.setItem('offlineCourses', JSON.stringify(courses))
  ElMessage.success('草稿已保存')
}

// 发布课程
const publishCourse = () => {
  if (!courseForm.value.title || !courseForm.value.category || !courseForm.value.description) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (courseForm.value.schedule.length === 0) {
    ElMessage.warning('请至少添加一个课程安排')
    return
  }

  const course = {
    id: isEdit.value ? (JSON.parse(localStorage.getItem('editingOfflineCourse') || '{}')).id : Date.now().toString(),
    ...courseForm.value,
    type: 'offline' as const,
    status: 'published' as const,
    students: 0,
    createTime: new Date().toLocaleString()
  }

  const courses = JSON.parse(localStorage.getItem('offlineCourses') || '[]')
  if (isEdit.value) {
    const index = courses.findIndex((c: any) => c.id === course.id)
    if (index > -1) {
      courses[index] = course
    }
  } else {
    courses.unshift(course)
  }

  localStorage.setItem('offlineCourses', JSON.stringify(courses))
  ElMessage.success('课程发布成功')
  router.push('/offline/list')
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

.schedule-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.schedule-input {
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

  .schedule-item {
    flex-direction: column;
  }

  .schedule-input {
    width: 100%;
  }
}
</style>
