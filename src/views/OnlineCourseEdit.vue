<template>
  <div class="course-edit-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>创建线上课程</h1>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-card class="form-card">
        <el-form :model="courseForm" label-width="120px">
          <el-form-item label="课程标题">
            <el-input 
              v-model="courseForm.name" 
              placeholder="请输入课程标题" 
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="授课教师">
            <el-input 
              v-model="courseForm.teacher" 
              placeholder="请输入授课教师" 
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="课程封面">
            <div class="cover-upload">
              <el-upload
                ref="coverUpload"
                :auto-upload="false"
                :on-change="handleAvatarSuccess"
                accept="image/jpeg,image/png,image/webp,image/gif"
                action="#"
                :limit="1"
              >
                <img v-if="coverImageUrl" :src="coverImageUrl" class="cover-image" />
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

          <el-form-item label="总课时数">
            <el-input 
              v-model="courseForm.totalLessons" 
              placeholder="例如：10课时"
            />
          </el-form-item>

          <el-divider>课程内容</el-divider>

          <el-form-item label="添加课时">
            <div class="lessons-list">
              <div v-for="(lesson, index) in courseForm.lessons" :key="index" class="lesson-item">
                <el-input 
                  v-model="lesson.lessonNum" 
                  placeholder="课时序号"
                  class="lesson-input"
                />
                <el-input 
                  v-model="lesson.lessonName" 
                  placeholder="课时名称"
                  class="lesson-input"
                />
                <el-input 
                  v-model="lesson.duration" 
                  placeholder="课时时长"
                  class="lesson-input"
                />

                <el-upload
                  ref="video1Upload"
                  :auto-upload="false"
                  :on-change="(file: any) => handleVideoChange(file, index)"
                  accept="video/mp4,video/mpeg,video/avi,video/webm,video/quicktime"
                  action="#"
                >
                  <el-button type="primary">选择视频文件</el-button>
                </el-upload>
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
import request from '@/utils/request'

interface Lesson {
  lessonNum: string
  lessonName: string
  duration: number
}

interface CourseForm {
  name: string
  teacher: string
  cover: string
  description: string
  totalLessons: string
  lessons: Lesson[]
}

const router = useRouter()
const isEdit = ref(false)
const courseForm = ref<CourseForm>({
  name: '',
  teacher: '',
  cover: '',
  description: '',
  totalLessons: '',
  lessons: []
})


// 添加课时
const addLesson = () => {
  courseForm.value.lessons.push({
    lessonNum: '',
    lessonName: '',
    duration: 0,
  })
}

// 文件上传的变量
const videoFiles = ref<any[]>([])
const coverFile = ref<any>(null)
const lessonCoverFiles = ref<(File | null)[]>([]);
// 图片回显的临时路径
const coverImageUrl = ref<string>('')

// 封面图片选择事件
const handleAvatarSuccess = (file: any) => {
  coverFile.value = file.raw; // 取原生File对象

  coverImageUrl.value = URL.createObjectURL(file.raw!)

  ElMessage.success('封面图选择成功');
}

// 视频文件选择事件
const handleVideoChange = (file: any, lessonIndex: number) => {
  videoFiles.value[lessonIndex] = file.raw;
  ElMessage.success(`课时${lessonIndex}视频文件选择成功`);
};

// 删除课时
const removeLesson = (index: number) => {
  courseForm.value.lessons.splice(index, 1)
}

const generateVideoCover = (videoFile: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas 上下文获取失败'));
      return;
    }

    // 1. 配置视频
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.preload = 'auto'; // 预加载完整帧
    video.setAttribute('crossorigin', 'anonymous'); // 解决跨域问题（如果需要）

    // 2. 关键：等待 canplaythrough 事件，确保帧已加载完成
    video.addEventListener('canplaythrough', () => {
      // 跳转到目标时间点
      video.currentTime = 1;
    });

    // 3. 等待时间跳转完成后再绘制
    video.addEventListener('seeked', () => {
      // 设置 canvas 尺寸
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 450;
      
      // 绘制视频帧
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 导出为 Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('封面生成失败：Canvas 导出 Blob 失败'));
        }
      }, 'image/png', 0.8);
    });

    // 4. 错误处理
    video.addEventListener('error', (e) => {
      reject(new Error(`视频加载失败：${video.error?.message || '未知错误'}`));
    });

    // 5. 兼容 Safari：把 video 临时插入 DOM
    document.body.appendChild(video);
    video.style.position = 'fixed';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
  });
};


// 发布课程
const publishCourse = async () => {
  const isValid = courseForm.value.lessons.every(lesson => 
    Object.values(lesson).every((value: any) => 
      value && value.trim() !== ''  // 检查非空且不是空白字符串
    )
  );
  if (!courseForm.value.name || !courseForm.value.teacher || !courseForm.value.description || isValid) {
    ElMessage.warning('请填写完整信息')
    return
  }

  // 自动为所有视频生成封面（用户无感知）
  lessonCoverFiles.value = []; // 清空旧封面
  for (let i = 0; i < videoFiles.value.length; i++) {
    const videoFile = videoFiles.value[i];
    // 生成封面并存储
    const coverBlob = await generateVideoCover(videoFile);
    const coverFile = new File([coverBlob], `lesson-${i+1}-cover.png`, { type: 'image/png' });
    lessonCoverFiles.value[i] = coverFile;
  }

  const formData = new FormData();
  // 封面图文件
  if(coverFile.value){
    formData.append('coverImage', coverFile.value);
  }

  // 课程基础信息
  formData.append('course',JSON.stringify({
    name: courseForm.value.name,
    teacher: courseForm.value.teacher,
    totalLessons: courseForm.value.totalLessons,
    description: courseForm.value.description,
  }))
  // 课时信息
  formData.append('lessons',JSON.stringify(courseForm.value.lessons))

  // 课时封面（和视频顺序完全一致，关键！）
    lessonCoverFiles.value.forEach((file) => {
      if (file) formData.append('lessonCovers', file);
    });

  // 课时视频文件
  videoFiles.value.forEach((file, index) => {
    if (file) {
      formData.append('videos', file);
    }
  })
  try {
    const res: any = await request.post('/course', formData);
    if(res.success === true){
      console.log("course res", res)
      ElMessage.success('课程发布成功')
      router.push('/course/manage')
    } else {
      console.log("Error course res", res)
    }
  } catch (error){
    ElMessage.error('课程发布出错')
    console.log("Error course res", error)
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  
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
