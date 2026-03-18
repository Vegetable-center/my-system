<template>
  <div class="community-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1 style="cursor: pointer;" @click="goHome">社区互动</h1>
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
              <!-- 这里应该是coverimg -->
              <el-image :src="post.coverImg" fit="cover" lazy>
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
                  <el-avatar :size="24" :src="post.avatar"></el-avatar>
                  <span>{{ post.userName }}</span>
                </div>
                <div class="post-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ post.viewCount }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    {{ post.likeCount }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="filteredPosts.length === 0" description="暂无帖子" />
    </el-main>
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
import request from '@/utils/request'

interface Post {
  id: string
  title: string
  content: string
  coverImg: string
  category: string
  userName: string
  avatar: string
  viewCount: number
  likeCount: number
  createdAt: string
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
  if (!Array.isArray(postList.value)) {
    console.error('postList 不是数组！当前值：', postList.value);
    return [];
  }
  if (currentCategory.value === 'all') {
    console.log(postList.value,'1111')
    return postList.value
  }
  console.log(postList.value,'2222')
  return postList.value.filter(post => post.category === currentCategory.value)
})

// 从localStorage加载帖子列表
const loadPostList = async () => {
  try {
    const listData = await request.get('/content/list');
    console.log('listData res', listData);

    postList.value = listData.data.list || [];
  } catch(err){
    ElMessage.error('获取帖子列表失败');
    console.log('获取帖子列表err',err)
  } finally {

  }
}

const changeCategory = (categoryId: string) => {
  console.log('category', categoryId);
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
    coverImg: publishForm.value.cover || 'https://via.placeholder.com/400x300?text=Post',
    category: publishForm.value.category,
    userName: userInfo.username || '匿名用户',
    avatar: userInfo.avatar || '',
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date().toLocaleString()
  }

  postList.value.unshift(newPost)
  localStorage.setItem('communityPosts', JSON.stringify(postList.value))

  ElMessage.success('发布成功')
  publishDialogVisible.value = false
}

onMounted(() => {
  loadPostList()
})

const goHome = ()=> {
  router.push('/');
}
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
