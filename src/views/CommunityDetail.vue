<template>
  <div class="community-detail-container">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="post-title">{{ postInfo.title }}</span>
        </div>
      </template>
    </el-page-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="post-card">
            <div class="post-cover" v-if="postInfo.cover">
              <el-image :src="postInfo.cover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="post-content">
              <div class="post-meta">
                <el-tag :type="getCategoryType(postInfo.category)" size="small">
                  {{ getCategoryName(postInfo.category) }}
                </el-tag>
                <span class="post-time">{{ postInfo.createTime }}</span>
              </div>
              <div class="post-text">{{ postInfo.content }}</div>
              <div class="post-author">
                <el-avatar :size="40" :src="postInfo.authorAvatar">
                  {{ postInfo.author.charAt(0) }}
                </el-avatar>
                <div class="author-info">
                  <div class="author-name">{{ postInfo.author }}</div>
                  <div class="author-role">学习者</div>
                </div>
              </div>
              <el-divider />
              <div class="post-actions">
                <el-button 
                  type="primary" 
                  :icon="isLiked ? Star : StarFilled" 
                  @click="toggleLike"
                >
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ postInfo.likes }})
                </el-button>
                <el-button :icon="ChatDotRound">
                  评论 ({{ commentList.length }})
                </el-button>
                <el-button :icon="Share">
                  分享
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 评论区 -->
          <el-card class="comment-card">
            <template #header>
              <div class="card-header">
                <span>评论列表</span>
                <span class="comment-count">{{ commentList.length }} 条评论</span>
              </div>
            </template>
            <div class="comment-input">
              <el-input
                v-model="commentText"
                type="textarea"
                :rows="3"
                placeholder="发表你的评论..."
              />
              <el-button 
                type="primary" 
                size="small" 
                class="submit-comment"
                @click="submitComment"
              >
                发表评论
              </el-button>
            </div>
            <div class="comment-list">
              <div v-for="comment in commentList" :key="comment.id" class="comment-item">
                <el-avatar :size="36" :src="comment.authorAvatar">
                  {{ comment.author.charAt(0) }}
                </el-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-time">{{ comment.createTime }}</span>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                </div>
              </div>
              <el-empty v-if="commentList.length === 0" description="暂无评论" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <span>帖子统计</span>
              </div>
            </template>
            <div class="stats-content">
              <div class="stat-item">
                <el-icon :size="24" color="#409EFF"><View /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ postInfo.views }}</div>
                  <div class="stat-label">浏览量</div>
                </div>
              </div>
              <el-divider />
              <div class="stat-item">
                <el-icon :size="24" color="#F56C6C"><StarFilled /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ postInfo.likes }}</div>
                  <div class="stat-label">点赞数</div>
                </div>
              </div>
              <el-divider />
              <div class="stat-item">
                <el-icon :size="24" color="#67C23A"><ChatDotRound /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ commentList.length }}</div>
                  <div class="stat-label">评论数</div>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="related-card">
            <template #header>
              <div class="card-header">
                <span>相关推荐</span>
              </div>
            </template>
            <div class="related-list">
              <div 
                v-for="post in relatedPosts" 
                :key="post.id"
                class="related-item"
                @click="viewDetail(post.id)"
              >
                <el-image :src="post.cover" fit="cover" class="related-cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon :size="24"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="related-info">
                  <h4 class="related-title">{{ post.title }}</h4>
                  <div class="related-meta">
                    <span class="meta-item">
                      <el-icon><View /></el-icon>
                      {{ post.views }}
                    </span>
                    <span class="meta-item">
                      <el-icon><Star /></el-icon>
                      {{ post.likes }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Picture, 
  View, 
  Star, 
  StarFilled,
  ChatDotRound,
  Share
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

interface Comment {
  id: string
  postId: string
  author: string
  authorAvatar: string
  content: string
  createTime: string
}

const route = useRoute()
const router = useRouter()
const postId = computed(() => route.params.id as string)

const postInfo = ref<Post>({
  id: '',
  title: '',
  content: '',
  cover: '',
  category: '',
  author: '',
  authorAvatar: '',
  views: 0,
  likes: 0,
  createTime: ''
})

const commentList = ref<Comment[]>([])
const commentText = ref('')
const isLiked = ref(false)

// 获取相关帖子
const relatedPosts = computed(() => {
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  return allPosts
    .filter((p: Post) => p.id !== postId.value && p.category === postInfo.value.category)
    .slice(0, 4)
})

// 加载帖子详情
const loadPostDetail = () => {
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  const post = allPosts.find((p: Post) => p.id === postId.value)

  if (post) {
    postInfo.value = post
    // 增加浏览量
    post.views += 1
    localStorage.setItem('communityPosts', JSON.stringify(allPosts))
    loadComments()
    checkLikeStatus()
  } else {
    ElMessage.error('未找到该帖子')
    router.push('/community/list')
  }
}

// 加载评论列表
const loadComments = () => {
  const allComments = JSON.parse(localStorage.getItem('communityComments') || '[]')
  commentList.value = allComments.filter((c: Comment) => c.postId === postId.value)
}

// 检查点赞状态
const checkLikeStatus = () => {
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
  isLiked.value = likedPosts.includes(postId.value)
}

const getCategoryName = (categoryId: string) => {
  const categoryMap: Record<string, string> = {
    'share': '经验分享',
    'question': '问题求助',
    'resource': '资源推荐',
    'achievement': '学习成果'
  }
  return categoryMap[categoryId] || '其他'
}

const getCategoryType = (categoryId: string) => {
  const typeMap: Record<string, any> = {
    'share': 'success',
    'question': 'warning',
    'resource': 'primary',
    'achievement': 'danger'
  }
  return typeMap[categoryId] || 'info'
}

const toggleLike = () => {
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')

  if (isLiked.value) {
    // 取消点赞
    const index = likedPosts.indexOf(postId.value)
    if (index > -1) {
      likedPosts.splice(index, 1)
    }
    postInfo.value.likes -= 1
    isLiked.value = false
    ElMessage.success('已取消点赞')
  } else {
    // 点赞
    likedPosts.push(postId.value)
    postInfo.value.likes += 1
    isLiked.value = true
    ElMessage.success('点赞成功')
  }

  localStorage.setItem('likedPosts', JSON.stringify(likedPosts))

  // 更新帖子数据
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  const postIndex = allPosts.findIndex((p: Post) => p.id === postId.value)
  if (postIndex !== -1) {
    allPosts[postIndex].likes = postInfo.value.likes
    localStorage.setItem('communityPosts', JSON.stringify(allPosts))
  }
}

const submitComment = () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const newComment: Comment = {
    id: Date.now().toString(),
    postId: postId.value,
    author: userInfo.username || '匿名用户',
    authorAvatar: userInfo.avatar || '',
    content: commentText.value,
    createTime: new Date().toLocaleString()
  }

  const allComments = JSON.parse(localStorage.getItem('communityComments') || '[]')
  allComments.unshift(newComment)
  localStorage.setItem('communityComments', JSON.stringify(allComments))

  commentList.value.unshift(newComment)
  commentText.value = ''
  ElMessage.success('评论成功')
}

const goBack = () => {
  router.push('/community/list')
}

const viewDetail = (id: string) => {
  router.push(`/community/post/${id}`)
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.community-detail-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.page-main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.post-card {
  margin-bottom: 20px;
}

.post-cover {
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
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
  padding: 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.post-time {
  color: #909399;
  font-size: 13px;
}

.post-text {
  color: #303133;
  line-height: 1.8;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.author-role {
  font-size: 13px;
  color: #909399;
}

.post-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.comment-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.comment-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.comment-input {
  margin-bottom: 20px;
}

.submit-comment {
  margin-top: 8px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.comment-time {
  font-size: 13px;
  color: #909399;
}

.comment-text {
  color: #606266;
  line-height: 1.6;
}

.stats-card,
.related-card {
  margin-bottom: 20px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  transform: translateX(5px);
}

.related-cover {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.related-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .page-main {
    padding: 12px;
  }

  .post-actions {
    flex-wrap: wrap;
  }

  .post-actions .el-button {
    flex: 1;
  }
}
</style>
