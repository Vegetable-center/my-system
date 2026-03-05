<template>
  <div class="community-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>社区互动</h1>
        <el-button type="primary" @click="goToCreatePost">
          <el-icon><Edit /></el-icon>
          发布新帖
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="category-bar">
        <el-scrollbar>
          <div class="category-list">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              :class="{ active: currentCategory === category.id }"
              @click="changeCategory(category.id)"
            >
              <el-icon :size="20">
                <component :is="category.icon" />
              </el-icon>
              <span>{{ category.name }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <el-row :gutter="20" class="post-list">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="post in filteredPosts" :key="post.id">
          <el-card class="post-card" @click="viewDetail(post.id)">
            <div class="post-cover">
              <el-image :src="post.cover" fit="cover" lazy>
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-desc">{{ post.content }}</p>
              <div class="post-footer">
                <div class="post-author">
                  <el-avatar :size="24" :src="post.authorAvatar">
                    {{ post.author.charAt(0) }}
                  </el-avatar>
                  <span>{{ post.author }}</span>
                </div>
                <div class="post-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ post.views }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    {{ post.likes }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="filteredPosts.length === 0" description="暂无帖子" />
    </el-main>

    <!-- 发布帖子对话框 -->
    <el-dialog v-model="publishDialogVisible" title="发布帖子" width="600px">
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="帖子标题">
          <el-input v-model="publishForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="内容分类">
          <el-select v-model="publishForm.category" placeholder="请选择分类">
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子内容">
          <el-input
            v-model="publishForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入帖子内容"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="publishForm.cover" placeholder="请输入封面图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Edit, 
  Picture, 
  View, 
  Star,
  ChatDotRound,
  Collection,
  Document,
  TrendCharts,
  Trophy
} from '@element-plus/icons-vue'

interface Post {
  id: string
  title: string
  content: string
  cover: string
  category: string
  author: string
  authorAvatar: string
  views: number
  likes: number
  createTime: string
}

interface Category {
  id: string
  name: string
  icon: any
}

const router = useRouter()
const currentCategory = ref('all')
const postList = ref<Post[]>([])
const publishDialogVisible = ref(false)

const categories = ref<Category[]>([
  { id: 'all', name: '全部', icon: Collection },
  { id: 'share', name: '经验分享', icon: ChatDotRound },
  { id: 'question', name: '问题求助', icon: Document },
  { id: 'resource', name: '资源推荐', icon: TrendCharts },
  { id: 'achievement', name: '学习成果', icon: Trophy }
])

const publishForm = ref({
  title: '',
  category: '',
  content: '',
  cover: ''
})

// 根据分类过滤帖子
const filteredPosts = computed(() => {
  if (currentCategory.value === 'all') {
    return postList.value
  }
  return postList.value.filter(post => post.category === currentCategory.value)
})

// 从localStorage加载帖子列表
const loadPostList = () => {
  const stored = localStorage.getItem('communityPosts')
  if (stored) {
    postList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    postList.value = [
      {
        id: '1',
        title: '学习北京话的心得分享',
        content: '经过三个月的学习，我终于掌握了北京话的基本发音和常用词汇，分享一些学习经验...',
        cover: 'https://via.placeholder.com/400x300?text=Beijing',
        category: 'share',
        author: '张三',
        authorAvatar: '',
        views: 1234,
        likes: 56,
        createTime: new Date().toLocaleString()
      },
      {
        id: '2',
        title: '求助：上海话中这些词汇怎么发音？',
        content: '在学习上海话的过程中遇到了一些发音问题，希望有经验的老师能帮忙解答...',
        cover: 'https://via.placeholder.com/400x300?text=Shanghai',
        category: 'question',
        author: '李四',
        authorAvatar: '',
        views: 856,
        likes: 32,
        createTime: new Date().toLocaleString()
      },
      {
        id: '3',
        title: '推荐几个学习粤语的好资源',
        content: '整理了一些优质的粤语学习资源，包括视频、音频和教材，分享给大家...',
        cover: 'https://via.placeholder.com/400x300?text=Cantonese',
        category: 'resource',
        author: '王五',
        authorAvatar: '',
        views: 2341,
        likes: 89,
        createTime: new Date().toLocaleString()
      },
      {
        id: '4',
        title: '我的方言学习成果展示',
        content: '经过半年的努力，我已经能够流利使用三种方言进行日常交流，分享一下学习成果...',
        cover: 'https://via.placeholder.com/400x300?text=Achievement',
        category: 'achievement',
        author: '赵六',
        authorAvatar: '',
        views: 3456,
        likes: 156,
        createTime: new Date().toLocaleString()
      }
    ]
    localStorage.setItem('communityPosts', JSON.stringify(postList.value))
  }
}

const changeCategory = (categoryId: string) => {
  currentCategory.value = categoryId
}

const viewDetail = (id: string) => {
  router.push(`/community/post/${id}`)
}

const showPublishDialog = () => {
  publishForm.value = {
    title: '',
    category: '',
    content: '',
    cover: ''
  }
  publishDialogVisible.value = true
}

const goToCreatePost = () => {
  router.push('/create')
}

const handlePublish = () => {
  if (!publishForm.value.title || !publishForm.value.category || !publishForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const newPost: Post = {
    id: Date.now().toString(),
    title: publishForm.value.title,
    content: publishForm.value.content,
    cover: publishForm.value.cover || 'https://via.placeholder.com/400x300?text=Post',
    category: publishForm.value.category,
    author: userInfo.username || '匿名用户',
    authorAvatar: userInfo.avatar || '',
    views: 0,
    likes: 0,
    createTime: new Date().toLocaleString()
  }

  postList.value.unshift(newPost)
  localStorage.setItem('communityPosts', JSON.stringify(postList.value))

  ElMessage.success('发布成功')
  publishDialogVisible.value = false
}

onMounted(() => {
  loadPostList()
})
</script>

<style scoped>
.community-container {
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
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.category-bar {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-list {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  font-size: 14px;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.post-list {
  margin-bottom: 20px;
}

.post-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-cover {
  width: 100%;
  padding-top: 100%; /* 1:1 比例 */
  position: relative;
  overflow: hidden;
}

.post-cover :deep(.el-image) {
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

.post-content {
  padding: 12px 0;
}

.post-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.post-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

@media (max-width: 768px) {
  .page-main {
    padding: 12px;
  }

  .header-content {
    padding: 0 12px;
  }

  .header-content h1 {
    font-size: 18px;
  }

  .category-list {
    padding: 4px;
  }

  .category-item {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
