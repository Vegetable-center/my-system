<template>
  <div class="community-detail-container">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="post-title">{{ postInfo.title }}</span>
        </div>
      </template>
    </el-page-header>

    <el-main class="page-main" v-if="postInfo.id !== ''">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="post-card">
            <div class="post-cover">
              <!-- 这里的图片可以考虑使用v-if去做区分图文显示 -->
              <el-image :src="'https://via.placeholder.com/400x300?text=Beijing'" fit="cover">
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
                <span class="post-time">{{ postInfo.createdAt }}</span>
              </div>
              <div class="post-text">{{ postInfo.content }}</div>
              <div class="post-author">
                <el-avatar :size="40" :src="postInfo.avatar"></el-avatar>
                <div class="author-info">
                  <div class="author-name">{{ postInfo.userName }}</div>
                  <div class="author-role">学习者</div>
                </div>
              </div>
              <el-divider />
              <div class="post-actions">
                <el-button 
                  type="primary" 
                  :icon="isLiked ? StarFilled : Star" 
                  @click="toggleLike"
                >
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ likeNum }})
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
                ref="inputText"
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
                <el-avatar :size="36" :src="comment.user.avatar"></el-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">
                      {{ comment.user.userName }}&nbsp;&nbsp;&nbsp;
                      <el-text class="mx-1" type="primary" style="cursor: pointer;" @click="getRepeatId(comment.id,comment.user.id)">回复</el-text>
                    </span>
                    <span class="comment-time">{{ formatUploadTime(comment.createdAt) }}</span>
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
                  <div class="stat-value">{{ postInfo.viewCount }}</div>
                  <div class="stat-label">浏览量</div>
                </div>
              </div>
              <el-divider />
              <div class="stat-item">
                <el-icon :size="24" color="#F56C6C"><StarFilled /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ likeNum }}</div>
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
                <el-image :src="post.coverImage" fit="cover" class="related-cover">
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
                      {{ post.viewCount }}
                    </span>
                    <span class="meta-item">
                      <el-icon><Star /></el-icon>
                      {{ post.likeCount }}
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
import { ref, onMounted, computed, watch } from 'vue'
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
import request from '@/utils/request'

interface Post {
  id: string
  title: string
  content: string
  coverImage: string
  category: string
  userName: string
  avatar: string
  viewCount: number
  likeCount: number
  createdAt: string
}

interface Comment {
  id: string
  postId: string
  user: {
    id: string
    userName: string
    avatar: string,
  }
  content: string
  createdAt: string
}

const route = useRoute()
const router = useRouter()
const postId = computed(() => route.params.id as string)

const postInfo = ref<Post>({
  id: '',
  title: '',
  content: '',
  coverImage: '',
  category: '',
  userName: '',
  avatar: '',
  viewCount: 0,
  likeCount: 0,
  createdAt: ''
})

const commentList = ref<Comment[]>([])
const commentText = ref('')
const isLiked = ref(false)
const likeNum = ref(0);

// 获取相关帖子
const relatedPosts = ref<any[]>([])

// 加载相关帖子列表
const loadRelatedPosts = async () => {
  const res = await request.get(`/content/list/same/${postId.value}`);
  console.log("same res", res);
  relatedPosts.value = res.data.list;
}

// 加载帖子详情
const loadPostDetail = async () => {
  try {
    const res = await request.get(`/content/list/${postId.value}`);
    console.log('detial res', res.data);

    postInfo.value = res.data.detail;
    likeNum.value = postInfo.value.likeCount;

    await loadComments();
    await checkLikeStatus();
    await loadRelatedPosts();
  } catch(err){
    ElMessage.error('未找到该帖子');
  } finally {

  }
}

// 加载评论列表
const loadComments = async () => {
  try {
    const res: any = await request.get(`/comment/post/${postId.value}`);
    console.log('res', res.data);
    if(res.code === 200) {
      commentList.value = res.data.list;
    }
  }catch(err) {
    ElMessage.error('获取评论列表失败')
    console.log(err);
  } finally {
    
  }
}

// 检查点赞状态
const checkLikeStatus = async () => {
  const rescheck: any = await request.get(`/like/check/${postId.value}`);
  isLiked.value = rescheck.data.isLiked;
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

const toggleLike = async () => {

  try { 
    const res: any = isLiked.value ? await request.delete(`/like/${postId.value}`) : await request.post(`/like/${postId.value}`);
    console.log('like res', res.data);
    const rescheck: any = await request.get(`/like/check/${postId.value}`);
    console.log('check res', rescheck.data);

    if(res.code === 200 || rescheck.code === 200) {
      rescheck.data.isLiked ? ElMessage.success('点赞成功') : ElMessage.success('取消点赞成功');
      isLiked.value = rescheck.data.isLiked;
      rescheck.data.isLiked ? likeNum.value += 1 : likeNum.value -= 1;

    } else {
      ElMessage.error('点赞失败,请稍后重试');
    }

  } catch(err) {
    ElMessage.error('点赞失败');
  } finally {

  }
}

const inputText = ref<any>(null);
// 回复的目标评论ID和用户ID
const replyCommentId = ref(null);
const replyToUserId = ref(null);

const getRepeatId = (commentId: any, userId: any) => {
  console.log('获取回复评论ID');
  replyCommentId.value = commentId;
  replyToUserId.value = userId;
  commentText.value = `@${commentList.value.find(item => item.id === commentId)?.user.userName} `;
  // 聚焦输入框
  inputText.value.focus();
}

const submitComment = async() => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    const res = await request.post('/comment/create', {
      postId: postId.value,
      content: commentText.value,
      replyCommentId: replyCommentId.value,
      replyToUserId: replyToUserId.value,
    });
    console.log('comment res', res);
    ElMessage.success('评论成功');
    // 重置状态
    commentText.value = '';
    replyCommentId.value = null;
    replyToUserId.value = null;
    // 重新加载评论
    await loadComments()
  } catch (err) {
    ElMessage.error('评论失败');
  }


  // const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  // const newComment: Comment = {
  //   id: Date.now().toString(),
  //   postId: postId.value,
  //   author: userInfo.username || '匿名用户',
  //   authorAvatar: userInfo.avatar || '',
  //   content: commentText.value,
  //   createTime: new Date().toLocaleString()
  // }

  // const allComments = JSON.parse(localStorage.getItem('communityComments') || '[]')
  // allComments.unshift(newComment)
  // localStorage.setItem('communityComments', JSON.stringify(allComments))

  // commentList.value.unshift(newComment)
  // commentText.value = ''
  // ElMessage.success('评论成功')
}

const goBack = () => {
  router.push('/community/list')
}

const viewDetail = (id: string) => {
  router.push(`/community/post/${id}`);
}

onMounted(() => {
  loadPostDetail()
})

watch(
  () => route.params.id, // 监听id参数
  (newId, oldId) => {
    if (newId !== oldId) { // 避免初始加载重复请求
      loadPostDetail();
    }
  },
  { immediate: false } // 关闭立即执行（onMounted已执行）
);

function formatUploadTime(isoTime: any): string {
  const date = new Date(isoTime);
  // 转换为本地时间，补零处理
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 返回格式：YYYY-MM-DD HH:mm:ss
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
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
