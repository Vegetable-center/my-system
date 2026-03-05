<template>
  <div class="admin-post-manage-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>帖子管理</h1>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帖子"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="审核状态" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已封禁" value="banned" />
        </el-select>
      </div>

      <div class="post-list">
        <el-card v-for="post in filteredPosts" :key="post.id" class="post-card">
          <div class="post-cover" @click="viewPost(post)">
            <el-image :src="post.cover" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon :size="40"><Document /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-if="post.banned" class="post-status status-banned">
              <el-icon><Lock /></el-icon>
              已封禁
            </div>
            <div v-else-if="!post.approved" class="post-status status-pending">
              <el-icon><Clock /></el-icon>
              待审核
            </div>
            <div v-else class="post-status status-approved">
              <el-icon><CircleCheck /></el-icon>
              已通过
            </div>
          </div>
          <div class="post-content">
            <h3 class="post-title" @click="viewPost(post)">{{ post.title }}</h3>
            <p class="post-desc">{{ post.content }}</p>
            <div class="post-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ post.author || '未知' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ post.createTime }}</span>
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ post.views || 0 }} 浏览</span>
              </div>
              <div class="meta-item">
                <el-icon><Star /></el-icon>
                <span>{{ post.likes || 0 }} 点赞</span>
              </div>
            </div>
            <div class="post-tags">
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
              <el-button 
                v-if="!post.approved && !post.banned"
                type="success" 
                @click="approvePost(post)"
              >
                <el-icon><Select /></el-icon>
                通过审核
              </el-button>
              <el-button 
                v-if="!post.banned"
                type="danger" 
                @click="banPost(post)"
              >
                <el-icon><Lock /></el-icon>
                封禁帖子
              </el-button>
              <el-button 
                v-if="post.banned"
                type="success" 
                @click="unbanPost(post)"
              >
                <el-icon><Unlock /></el-icon>
                解封帖子
              </el-button>
            </div>
          </div>
        </el-card>
        <el-empty v-if="filteredPosts.length === 0" description="暂无帖子" />
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search,
  Document,
  User,
  Calendar,
  View,
  Star,
  Lock,
  Clock,
  CircleCheck,
  Select,
  Unlock
} from '@element-plus/icons-vue'

interface Post {
  id: string
  title: string
  content: string
  cover: string
  category: string
  status: 'draft' | 'published'
  approved?: boolean
  banned?: boolean
  author: string
  authorAvatar: string
  views: number
  likes: number
  comments?: number
  tags: string[]
  createTime: string
}

const router = useRouter()
const postList = ref<Post[]>([])
const searchKeyword = ref('')
const filterStatus = ref('')

// 根据搜索和筛选条件过滤帖子
const filteredPosts = computed(() => {
  let result = postList.value

  if (searchKeyword.value) {
    result = result.filter(post => 
      post.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      post.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (filterStatus.value) {
    if (filterStatus.value === 'pending') {
      result = result.filter(post => !post.approved && !post.banned)
    } else if (filterStatus.value === 'approved') {
      result = result.filter(post => post.approved && !post.banned)
    } else if (filterStatus.value === 'banned') {
      result = result.filter(post => post.banned)
    }
  }

  return result
})

// 加载帖子列表
const loadPosts = () => {
  const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  // 为所有帖子添加审核和封禁状态
  postList.value = posts.map((p: any) => ({
    ...p,
    approved: p.approved !== false,
    banned: p.banned || false
  }))
}

// 搜索
const handleSearch = () => {
  // 过滤逻辑由computed自动处理
}

// 筛选
const handleFilter = () => {
  // 过滤逻辑由computed自动处理
}

// 查看帖子
const viewPost = (post: Post) => {
  router.push(`/community/post/${post.id}`)
}

// 通过审核
const approvePost = (post: Post) => {
  ElMessageBox.confirm(
    '确定通过该帖子的审核吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
      const index = posts.findIndex((p: any) => p.id === post.id)
      if (index > -1) {
        posts[index].approved = true
        localStorage.setItem('communityPosts', JSON.stringify(posts))
        loadPosts()
        ElMessage.success('审核通过')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 封禁帖子
const banPost = (post: Post) => {
  ElMessageBox.confirm(
    '确定封禁该帖子吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
      const index = posts.findIndex((p: any) => p.id === post.id)
      if (index > -1) {
        posts[index].banned = true
        localStorage.setItem('communityPosts', JSON.stringify(posts))
        loadPosts()
        ElMessage.success('已封禁帖子')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 解封帖子
const unbanPost = (post: Post) => {
  ElMessageBox.confirm(
    '确定解封该帖子吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
      const index = posts.findIndex((p: any) => p.id === post.id)
      if (index > -1) {
        posts[index].banned = false
        localStorage.setItem('communityPosts', JSON.stringify(posts))
        loadPosts()
        ElMessage.success('已解封帖子')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.admin-post-manage-container {
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

.post-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-pending {
  background: #E6A23C;
}

.status-approved {
  background: #67C23A;
}

.status-banned {
  background: #F56C6C;
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
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
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
  gap: 12px;
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

  .post-list {
    grid-template-columns: 1fr;
  }
}
</style>
