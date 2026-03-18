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
                class="cover-uploader"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload"
                accept="image/*"
              >
                <img v-if="postForm.cover" :src="postForm.cover" class="cover-image" />
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
              <el-upload
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
              </el-upload>
              <el-input
                v-model="postForm.content"
                type="textarea"
                :rows="15"
                placeholder="分享你的学习心得、经验或问题..."
                class="content-editor"
              />
            </div>
          </el-form-item>

          <el-form-item label="添加标签">
            <div class="tags-input">
              <el-tag
                v-for="tag in postForm.tags"
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

          <el-form-item>
            <div class="form-actions">
              <el-button @click="saveDraft">保存草稿</el-button>
              <el-button type="primary" @click="publishPost">发布帖子</el-button>
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
import { Plus, Picture } from '@element-plus/icons-vue'
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

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// 加载草稿
const loadDraft = () => {
  const draft = localStorage.getItem('postDraft')
  if (draft) {
    postForm.value = JSON.parse(draft)
  }
}

// 封面上传成功
const handleCoverSuccess = (response: any) => {
  postForm.value.cover = response.url
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

// 图片上传成功
const handleImageSuccess = (response: any) => {
  const imageMarkdown = `
![图片](${response.url})
`
  postForm.value.content += imageMarkdown
  ElMessage.success('图片插入成功')
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
    if (postForm.value.tags.length >= 5) {
      ElMessage.warning('最多添加5个标签')
      return
    }
    if (postForm.value.tags.includes(inputValue.value)) {
      ElMessage.warning('标签已存在')
      return
    }
    postForm.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 移除标签
const removeTag = (tag: string) => {
  const index = postForm.value.tags.indexOf(tag)
  if (index > -1) {
    postForm.value.tags.splice(index, 1)
  }
}

// 保存草稿
const saveDraft = () => {
  localStorage.setItem('postDraft', JSON.stringify(postForm.value))
  ElMessage.success('草稿已保存')
}

// 发布帖子
const publishPost = async () => {
  if (!postForm.value.title || !postForm.value.category || !postForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const newPost = {
    id: Date.now().toString(),
    title: postForm.value.title,
    content: postForm.value.content,
    cover: postForm.value.cover || 'https://via.placeholder.com/400x300?text=Post',
    category: postForm.value.category,
    author: userInfo.username || '匿名用户',
    authorAvatar: userInfo.avatar || '',
    views: 0,
    likes: 0,
    tags: postForm.value.tags,
    createTime: new Date().toLocaleString()
  }

  // 保存帖子
  // const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  // posts.unshift(newPost)
  // localStorage.setItem('communityPosts', JSON.stringify(posts))

  const res = await request.post('/content/create', newPost);
  console.log('res', res);

  // 清除草稿
  localStorage.removeItem('postDraft')

  ElMessage.success('发布成功')
  router.push('/community/list')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadDraft()
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
}
</style>
