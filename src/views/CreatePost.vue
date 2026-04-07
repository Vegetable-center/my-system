<template>
  <div class="create-post-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>创作发帖</h1>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-card class="editor-card">
        <el-form :model="postForm" label-width="100px">
          <el-form-item label="帖子标题">
            <el-input 
              v-model="postForm.title" 
              placeholder="请输入帖子标题" 
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="内容分类">
            <el-select v-model="postForm.category" placeholder="请选择分类">
              <el-option 
                v-for="category in categories" 
                :key="category.id"
                :label="category.name" 
                :value="category.id" 
              />
            </el-select>
          </el-form-item>

          <el-form-item label="封面图片">
            <div class="cover-upload">
              <el-upload
                ref="coverUpload"
                :auto-upload="false"
                :on-change="handleAvatarSuccess"
                :before-upload="beforeImageUpload"
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

          <el-form-item label="帖子内容">
            <div class="editor-container">
              <!-- <el-upload
                class="image-uploader"
                :show-file-list="false"
                :on-success="handleImageSuccess"
                :before-upload="beforeImageUpload"
                accept="image/*"
              >
                <el-button type="primary" size="small">
                  <el-icon><Picture /></el-icon>
                  插入图片
                </el-button>
              </el-upload> -->
              <el-input
                v-model="postForm.content"
                type="textarea"
                :rows="15"
                placeholder="分享你的学习心得、经验或问题..."
                class="content-editor"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="form-actions">
              <!-- <el-button @click="saveDraft">保存草稿</el-button> -->
              <el-button type="primary" @click="publishPost">发布帖子</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request';

interface PostForm {
  title: string
  category: string
  cover: string
  content: string
  tags: string[]
}

const router = useRouter()
const postForm = ref<PostForm>({
  title: '',
  category: '',
  cover: '',
  content: '',
  tags: []
})

const categories = [
  { id: 'share', name: '经验分享' },
  { id: 'question', name: '问题求助' },
  { id: 'resource', name: '资源推荐' },
  { id: 'achievement', name: '学习成果' }
]

const coverFile = ref<any>();
const coverImageUrl = ref<any>('')

// 封面图片选择事件
const handleAvatarSuccess = (file: any) => {
  coverFile.value = file.raw; // 取原生File对象

  coverImageUrl.value = URL.createObjectURL(file.raw!)

  ElMessage.success('封面图选择成功');
}

// 图片上传前验证
const beforeImageUpload = (file: File) => {
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
// 发布帖子
const publishPost = async () => {
  if (!postForm.value.title || !postForm.value.category || !postForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }

  // const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const newPost = {
    title: postForm.value.title,
    content: postForm.value.content,
    category: postForm.value.category,
  }

  const formData = new FormData();

  // 1. 追加普通帖子字段
  Object.entries(newPost).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // 2. 追加封面图文件（如果有）
  if (coverFile.value) {
    formData.append('coverImage', coverFile.value);
  }

  const res = await request.post('/content/create', formData);
  console.log('res', res);

  ElMessage.success('发布成功')
  router.push('/community/list')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
})
</script>

<style scoped>
.create-post-container {
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

.editor-card {
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

.editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-editor {
  width: 100%;
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

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
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
}
</style>
