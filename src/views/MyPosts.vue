<template>
  <div class="my-posts-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>我的创作</h1>
        <el-button type="primary" @click="createPost">
          <el-icon><Edit /></el-icon>
          发布新帖
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="filter-bar">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane label="已发布" name="published" />
          <el-tab-pane label="草稿箱" name="draft" />
        </el-tabs>
      </div>

      <div class="posts-list">
        <el-card v-for="post in filteredPosts" :key="post.id" class="post-card">
          <div class="post-cover" @click="viewPost(post.id)">
            <el-image :src="post.cover" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon :size="40"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="post-status" :class="getStatusClass(post.status)">
              {{ getStatusText(post.status) }}
            </div>
          </div>
          <div class="post-content">
            <h3 class="post-title" @click="viewPost(post.id)">{{ post.title }}</h3>
            <p class="post-desc">{{ post.content }}</p>
            <div class="post-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ post.views }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Star /></el-icon>
                <span>{{ post.likes }}</span>
              </div>
              <div class="meta-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ post.comments || 0 }}</span>
              </div>
              <div class="meta-item time">
                <el-icon><Clock /></el-icon>
                <span>{{ post.createTime }}</span>
              </div>
            </div>
            <div class="post-tags" v-if="post.tags && post.tags.length">
              <el-tag 
                v-for="tag in post.tags" 
                :key="tag" 
                size="small" 
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="post-actions">
              <el-button type="primary" link @click="editPost(post)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="deletePost(post.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
        <el-empty v-if="filteredPosts.length === 0" description="暂无内容" />
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  Picture, 
  View, 
  Star, 
  ChatDotRound,
  Clock,
  Delete
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
  comments?: number
  tags: string[]
  status: 'published' | 'draft'
  createTime: string
}

const router = useRouter()
const activeTab = ref('all')
const posts = ref<Post[]>([])

// 根据标签过滤帖子
const filteredPosts = computed(() => {
  if (activeTab.value === 'all') {
    return posts.value
  }
  return posts.value.filter(post => post.status === activeTab.value)
})

// 加载帖子列表
const loadPosts = () => {
  const publishedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  const drafts = JSON.parse(localStorage.getItem('postDrafts') || '[]')

  // 为已发布的帖子添加状态标记
  const publishedWithStatus = publishedPosts.map((post: Post) => ({
    ...post,
    status: 'published' as const
  }))

  // 为草稿添加状态标记
  const draftsWithStatus = drafts.map((post: Post) => ({
    ...post,
    status: 'draft' as const
  }))

  posts.value = [...publishedWithStatus, ...draftsWithStatus]
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'published': '已发布',
    'draft': '草稿'
  }
  return statusMap[status] || ''
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'published': 'status-published',
    'draft': 'status-draft'
  }
  return classMap[status] || ''
}

// 切换标签
const handleTabChange = () => {
  // 过滤逻辑由computed自动处理
}

// 查看帖子
const viewPost = (id: string) => {
  router.push(`/community/post/${id}`)
}

// 编辑帖子
const editPost = (post: Post) => {
  if (post.status === 'draft') {
    // 编辑草稿
    localStorage.setItem('postDraft', JSON.stringify(post))
  } else {
    // 编辑已发布帖子，先保存为草稿
    const draft = {
      ...post,
      id: Date.now().toString(),
      status: 'draft' as const
    }
    localStorage.setItem('postDraft', JSON.stringify(draft))
  }
  router.push('/create')
}

// 删除帖子
const deletePost = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这条内容吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 从已发布列表中删除
      const publishedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
      const publishedIndex = publishedPosts.findIndex((p: Post) => p.id === id)
      if (publishedIndex > -1) {
        publishedPosts.splice(publishedIndex, 1)
        localStorage.setItem('communityPosts', JSON.stringify(publishedPosts))
      }

      // 从草稿列表中删除
      const drafts = JSON.parse(localStorage.getItem('postDrafts') || '[]')
      const draftIndex = drafts.findIndex((p: Post) => p.id === id)
      if (draftIndex > -1) {
        drafts.splice(draftIndex, 1)
        localStorage.setItem('postDrafts', JSON.stringify(drafts))
      }

      loadPosts()
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 创建新帖子
const createPost = () => {
  localStorage.removeItem('postDraft')
  router.push('/create')
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.my-posts-container {
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
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-bar :deep(.el-tabs__header) {
  margin: 0;
}

.posts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  overflow: hidden;
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  cursor: pointer;
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

.post-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.status-published {
  background: #67C23A;
}

.status-draft {
  background: #909399;
}

.post-content {
  padding: 16px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-title:hover {
  color: #409EFF;
}

.post-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
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

.meta-item.time {
  margin-left: auto;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag-item {
  margin-right: 0;
}

.post-actions {
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

  .posts-list {
    grid-template-columns: 1fr;
  }
}
</style>
