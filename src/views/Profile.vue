<template>
  <div class="profile-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>个人中心</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <!-- 左侧个人信息卡片 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
          <el-card class="user-card">
            <div class="user-info">
              <div class="avatar-wrapper">
                <el-avatar :size="100" :src="userInfo.avatar">
                  {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
                </el-avatar>
                <el-button type="primary" size="small" circle @click="showEditDialog">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </div>
              <h3 class="username">{{ userInfo.username }}</h3>
              <p class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没留下...' }}</p>
            </div>
            <el-divider />
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ myPosts.length }}</div>
                <div class="stat-label">帖子</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ followingList.length }}</div>
                <div class="stat-label">关注</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ followersList.length }}</div>
                <div class="stat-label">粉丝</div>
              </div>
            </div>
          </el-card>

          <el-card class="menu-card">
            <el-menu
              :default-active="activeTab"
              mode="vertical"
              @select="handleMenuSelect"
            >
              <el-menu-item index="posts">
                <el-icon><Document /></el-icon>
                <span>我的帖子</span>
              </el-menu-item>
              <el-menu-item index="following">
                <el-icon><UserFilled /></el-icon>
                <span>我的关注</span>
              </el-menu-item>
              <el-menu-item index="followers">
                <el-icon><User /></el-icon>
                <span>我的粉丝</span>
              </el-menu-item>
              <el-menu-item index="stats">
                <el-icon><TrendCharts /></el-icon>
                <span>数据看板</span>
              </el-menu-item>
              <el-menu-item index="settings">
                <el-icon><Setting /></el-icon>
                <span>账号设置</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧内容区域 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
          <!-- 我的帖子 -->
          <el-card v-if="activeTab === 'posts'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>我的帖子</span>
              </div>
            </template>
            <div class="post-list">
              <div v-for="post in myPosts" :key="post.id" class="post-item">
                <el-image :src="post.cover" fit="cover" class="post-cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon :size="40"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="post-info">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <p class="post-desc">{{ post.content }}</p>
                  <div class="post-meta">
                    <span class="meta-item">
                      <el-icon><View /></el-icon>
                      {{ post.views }}
                    </span>
                    <span class="meta-item">
                      <el-icon><Star /></el-icon>
                      {{ post.likes }}
                    </span>
                    <span class="meta-item">{{ post.createTime }}</span>
                  </div>
                </div>
                <div class="post-actions">
                  <el-button type="primary" link @click="viewPost(post.id)">
                    查看
                  </el-button>
                  <el-button type="danger" link @click="deletePost(post.id)">
                    删除
                  </el-button>
                </div>
              </div>
              <el-empty v-if="myPosts.length === 0" description="暂无帖子" />
            </div>
          </el-card>

          <!-- 我的关注 -->
          <el-card v-if="activeTab === 'following'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>我的关注</span>
                <el-button type="primary" size="small" @click="showFollowDialog">
                  <el-icon><Plus /></el-icon>
                  添加关注
                </el-button>
              </div>
            </template>
            <div class="user-list">
              <div v-for="user in followingList" :key="user.id" class="user-item">
                <el-avatar :size="48" :src="user.avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-detail">
                  <h4 class="user-name">{{ user.username }}</h4>
                  <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                </div>
                <el-button type="danger" link @click="unfollow(user.id)">
                  取消关注
                </el-button>
              </div>
              <el-empty v-if="followingList.length === 0" description="暂无关注" />
            </div>
          </el-card>

          <!-- 我的粉丝 -->
          <el-card v-if="activeTab === 'followers'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>我的粉丝</span>
              </div>
            </template>
            <div class="user-list">
              <div v-for="user in followersList" :key="user.id" class="user-item">
                <el-avatar :size="48" :src="user.avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-detail">
                  <h4 class="user-name">{{ user.username }}</h4>
                  <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                </div>
                <el-button 
                  type="primary" 
                  link 
                  @click="followUser(user)"
                  :disabled="isFollowing(user.id)"
                >
                  {{ isFollowing(user.id) ? '已关注' : '关注' }}
                </el-button>
              </div>
              <el-empty v-if="followersList.length === 0" description="暂无粉丝" />
            </div>
          </el-card>

          <!-- 账号设置 -->
          <el-card v-if="activeTab === 'settings'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>账号设置</span>
              </div>
            </template>
            <el-form :model="settingsForm" label-width="120px">
              <el-form-item label="用户名">
                <el-input v-model="settingsForm.username" disabled />
              </el-form-item>
              <el-form-item label="个性签名">
                <el-input
                  v-model="settingsForm.bio"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入个性签名"
                />
              </el-form-item>
              <el-form-item label="头像URL">
                <el-input v-model="settingsForm.avatar" placeholder="请输入头像URL" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 数据看板 -->
          <el-card v-if="activeTab === 'stats'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>创作数据</span>
                <el-button type="primary" link @click="goToStats">
                  查看详情
                </el-button>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item">
                  <div class="stat-value">{{ myPosts.length }}</div>
                  <div class="stat-label">发布帖子</div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item">
                  <div class="stat-value">{{ totalViews }}</div>
                  <div class="stat-label">总浏览量</div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item">
                  <div class="stat-value">{{ totalLikes }}</div>
                  <div class="stat-label">总点赞数</div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item">
                  <div class="stat-value">{{ totalComments }}</div>
                  <div class="stat-label">总评论数</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 编辑个人信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑个人信息" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个性签名"
          />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar" placeholder="请输入头像URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加关注对话框 -->
    <el-dialog v-model="followDialogVisible" title="添加关注" width="500px">
      <el-form :model="followForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="followForm.username" placeholder="请输入要关注的用户名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFollow">关注</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  Document, 
  UserFilled, 
  User, 
  Setting,
  Plus,
  Picture,
  View,
  Star
} from '@element-plus/icons-vue'

interface UserInfo {
  username: string
  avatar: string
  bio: string
}

interface Post {
  id: string
  title: string
  content: string
  cover: string
  views: number
  likes: number
  createTime: string
}

interface FollowUser {
  id: string
  username: string
  avatar: string
  bio: string
}

const router = useRouter()
const activeTab = ref('posts')
const userInfo = ref<UserInfo>({
  username: '',
  avatar: '',
  bio: ''
})

const myPosts = ref<any>([])
const followingList = ref<FollowUser[]>([])
const followersList = ref<FollowUser[]>([])

const editDialogVisible = ref(false)
const followDialogVisible = ref(false)

const editForm = ref({
  username: '',
  bio: '',
  avatar: ''
})

const settingsForm = ref({
  username: '',
  bio: '',
  avatar: ''
})

const followForm = ref({
  username: ''
})

// 加载用户信息
const loadUserInfo = () => {
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    userInfo.value = JSON.parse(stored)
    editForm.value = {
      username: userInfo.value.username,
      bio: userInfo.value.bio || '',
      avatar: userInfo.value.avatar || ''
    }
    settingsForm.value = {
      username: userInfo.value.username,
      bio: userInfo.value.bio || '',
      avatar: userInfo.value.avatar || ''
    }
  }
}

// 加载我的帖子
const loadMyPosts = () => {
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
  myPosts.value = allPosts.filter((post: any) => post.author === currentUser.username)
}

// 加载关注列表
const loadFollowing = () => {
  const stored = localStorage.getItem('following')
  if (stored) {
    followingList.value = JSON.parse(stored)
  }
}

// 加载粉丝列表
const loadFollowers = () => {
  const stored = localStorage.getItem('followers')
  if (stored) {
    followersList.value = JSON.parse(stored)
  }
}

const handleMenuSelect = (index: string) => {
  activeTab.value = index
}

const showEditDialog = () => {
  editDialogVisible.value = true
}

const saveEdit = () => {
  const updatedInfo = {
    ...userInfo.value,
    bio: editForm.value.bio,
    avatar: editForm.value.avatar
  }

  localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
  userInfo.value = updatedInfo

  ElMessage.success('保存成功')
  editDialogVisible.value = false
}

const saveSettings = () => {
  const updatedInfo = {
    ...userInfo.value,
    bio: settingsForm.value.bio,
    avatar: settingsForm.value.avatar
  }

  localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
  userInfo.value = updatedInfo

  ElMessage.success('保存成功')
}

const viewPost = (id: string) => {
  router.push(`/community/post/${id}`)
}

const deletePost = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这条帖子吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
      const filtered = allPosts.filter((post: any) => post.id !== id)
      localStorage.setItem('communityPosts', JSON.stringify(filtered))
      loadMyPosts()
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 用户取消操作
    })
}

const showFollowDialog = () => {
  followDialogVisible.value = true
}

const handleFollow = () => {
  if (!followForm.value.username) {
    ElMessage.warning('请输入用户名')
    return
  }

  const newUser: FollowUser = {
    id: Date.now().toString(),
    username: followForm.value.username,
    avatar: '',
    bio: ''
  }

  followingList.value.unshift(newUser)
  localStorage.setItem('following', JSON.stringify(followingList.value))

  ElMessage.success('关注成功')
  followDialogVisible.value = false
  followForm.value.username = ''
}

const unfollow = (id: string) => {
  ElMessageBox.confirm(
    '确定要取消关注吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      followingList.value = followingList.value.filter(user => user.id !== id)
      localStorage.setItem('following', JSON.stringify(followingList.value))
      ElMessage.success('已取消关注')
    })
    .catch(() => {
      // 用户取消操作
    })
}

const followUser = (user: FollowUser) => {
  followingList.value.unshift(user)
  localStorage.setItem('following', JSON.stringify(followingList.value))
  ElMessage.success('关注成功')
}

const isFollowing = (userId: string) => {
  return followingList.value.some(user => user.id === userId)
}

// 计算总数据
const totalViews = computed(() => {
  return myPosts.value.reduce((sum: any, p: any) => sum + p.views, 0)
})

const totalLikes = computed(() => {
  return myPosts.value.reduce((sum: any, p: any) => sum + p.likes, 0)
})

const totalComments = computed(() => {
  return myPosts.value.reduce((sum: any, p: any) => sum + (p.comments || 0), 0)
})

const goToStats = () => {
  router.push('/post-stats')
}

onMounted(() => {
  loadUserInfo()
  loadMyPosts()
  loadFollowing()
  loadFollowers()
})
</script>

<style scoped>
.profile-container {
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

.user-card,
.menu-card {
  margin-bottom: 20px;
}

.user-info {
  text-align: center;
  padding: 20px 0;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar-wrapper .el-button {
  position: absolute;
  bottom: 0;
  right: 0;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.user-bio {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.menu-card :deep(.el-menu) {
  border: none;
}

.menu-card :deep(.el-menu-item) {
  margin-bottom: 4px;
  border-radius: 4px;
}

.content-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.post-list,
.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item,
.user-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  align-items: flex-start;
}

.post-cover {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  color: #909399;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-desc {
  color: #606266;
  font-size: 14px;
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
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
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

  .post-item,
  .user-item {
    flex-direction: column;
  }

  .post-cover {
    width: 100%;
    height: 200px;
  }

  .post-actions {
    flex-direction: row;
    width: 100%;
  }
}
</style>
