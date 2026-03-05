<template>
  <div class="follow-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>关注</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-tabs v-model="activeTab" class="follow-tabs">
        <el-tab-pane label="我的关注" name="following">
          <div class="user-list">
            <div v-for="user in followingList" :key="user.id" class="user-item">
              <el-avatar :size="64" :src="user.avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="user-header">
                  <h3 class="username">{{ user.username }}</h3>
                  <el-tag v-if="user.online" type="success" size="small">在线</el-tag>
                </div>
                <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="value">{{ user.postsCount }}</span>
                    <span class="label">帖子</span>
                  </div>
                  <div class="stat-item">
                    <span class="value">{{ user.followersCount }}</span>
                    <span class="label">粉丝</span>
                  </div>
                  <div class="stat-item">
                    <span class="value">{{ user.followingCount }}</span>
                    <span class="label">关注</span>
                  </div>
                </div>
              </div>
              <div class="user-actions">
                <el-button type="primary" @click="viewProfile(user.id)">查看主页</el-button>
                <el-button @click="sendMessage(user)">发消息</el-button>
                <el-button type="danger" @click="unfollow(user.id)">取消关注</el-button>
              </div>
            </div>
            <el-empty v-if="followingList.length === 0" description="暂无关注" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的粉丝" name="followers">
          <div class="user-list">
            <div v-for="user in followersList" :key="user.id" class="user-item">
              <el-avatar :size="64" :src="user.avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="user-header">
                  <h3 class="username">{{ user.username }}</h3>
                  <el-tag v-if="user.online" type="success" size="small">在线</el-tag>
                </div>
                <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="value">{{ user.postsCount }}</span>
                    <span class="label">帖子</span>
                  </div>
                  <div class="stat-item">
                    <span class="value">{{ user.followersCount }}</span>
                    <span class="label">粉丝</span>
                  </div>
                  <div class="stat-item">
                    <span class="value">{{ user.followingCount }}</span>
                    <span class="label">关注</span>
                  </div>
                </div>
              </div>
              <div class="user-actions">
                <el-button type="primary" @click="viewProfile(user.id)">查看主页</el-button>
                <el-button @click="sendMessage(user)">发消息</el-button>
                <el-button 
                  :type="isFollowing(user.id) ? 'danger' : 'primary'"
                  @click="toggleFollow(user)"
                >
                  {{ isFollowing(user.id) ? '取消关注' : '关注' }}
                </el-button>
              </div>
            </div>
            <el-empty v-if="followersList.length === 0" description="暂无粉丝" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="推荐关注" name="recommend">
          <div class="user-list">
            <div v-for="user in recommendList" :key="user.id" class="user-item">
              <el-avatar :size="64" :src="user.avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="user-header">
                  <h3 class="username">{{ user.username }}</h3>
                  <el-tag v-if="user.online" type="success" size="small">在线</el-tag>
                </div>
                <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="value">{{ user.postsCount }}</span>
                    <span class="label">帖子</span>
                  </div>
                  <div class="stat-item">
                    <span class="value">{{ user.followersCount }}</span>
                    <span class="label">粉丝</span>
                  </div>
                  <div class="stat-item">
                    <span class="value">{{ user.followingCount }}</span>
                    <span class="label">关注</span>
                  </div>
                </div>
              </div>
              <div class="user-actions">
                <el-button type="primary" @click="viewProfile(user.id)">查看主页</el-button>
                <el-button @click="sendMessage(user)">发消息</el-button>
                <el-button 
                  :type="isFollowing(user.id) ? 'danger' : 'primary'"
                  @click="toggleFollow(user)"
                >
                  {{ isFollowing(user.id) ? '取消关注' : '关注' }}
                </el-button>
              </div>
            </div>
            <el-empty v-if="recommendList.length === 0" description="暂无推荐" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <!-- 发送消息对话框 -->
    <el-dialog v-model="messageDialogVisible" title="发送消息" width="500px">
      <el-form :model="messageForm" label-width="100px">
        <el-form-item label="接收人">
          <el-input v-model="messageForm.toUsername" disabled />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="messageForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendMessage">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface User {
  id: string
  username: string
  avatar: string
  bio: string
  online: boolean
  postsCount: number
  followersCount: number
  followingCount: number
}

const router = useRouter()
const activeTab = ref('following')
const followingList = ref<User[]>([])
const followersList = ref<User[]>([])
const recommendList = ref<User[]>([])
const messageDialogVisible = ref(false)
const messageForm = ref({
  toUserId: '',
  toUsername: '',
  content: ''
})

// 加载关注列表
const loadFollowing = () => {
  const stored = localStorage.getItem('following')
  if (stored) {
    followingList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    followingList.value = [
      {
        id: '1',
        username: '张三',
        avatar: '',
        bio: '热爱方言学习，分享学习心得',
        online: true,
        postsCount: 23,
        followersCount: 156,
        followingCount: 89
      },
      {
        id: '2',
        username: '李四',
        avatar: '',
        bio: '方言文化爱好者',
        online: false,
        postsCount: 45,
        followersCount: 234,
        followingCount: 123
      }
    ]
    localStorage.setItem('following', JSON.stringify(followingList.value))
  }
}

// 加载粉丝列表
const loadFollowers = () => {
  const stored = localStorage.getItem('followers')
  if (stored) {
    followersList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    followersList.value = [
      {
        id: '3',
        username: '王五',
        avatar: '',
        bio: '方言学习者',
        online: true,
        postsCount: 12,
        followersCount: 45,
        followingCount: 67
      },
      {
        id: '4',
        username: '赵六',
        avatar: '',
        bio: '喜欢研究方言文化',
        online: false,
        postsCount: 34,
        followersCount: 89,
        followingCount: 56
      }
    ]
    localStorage.setItem('followers', JSON.stringify(followersList.value))
  }
}

// 加载推荐列表
const loadRecommend = () => {
  const stored = localStorage.getItem('recommendUsers')
  if (stored) {
    recommendList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    recommendList.value = [
      {
        id: '5',
        username: '钱七',
        avatar: '',
        bio: '方言研究专家',
        online: true,
        postsCount: 67,
        followersCount: 345,
        followingCount: 234
      },
      {
        id: '6',
        username: '孙八',
        avatar: '',
        bio: '方言文化推广者',
        online: false,
        postsCount: 89,
        followersCount: 456,
        followingCount: 345
      }
    ]
    localStorage.setItem('recommendUsers', JSON.stringify(recommendList.value))
  }
}

const isFollowing = (userId: string) => {
  return followingList.value.some(u => u.id === userId)
}

const viewProfile = (userId: string) => {
  // 跳转到用户主页（这里暂时跳转到个人中心）
  router.push('/profile')
}

const sendMessage = (user: User) => {
  messageForm.value = {
    toUserId: user.id,
    toUsername: user.username,
    content: ''
  }
  messageDialogVisible.value = true
}

const handleSendMessage = () => {
  if (!messageForm.value.content.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  // 创建新会话
  const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
  let conversation = conversations.find((c: any) => 
    c.username === messageForm.value.toUsername
  )

  if (!conversation) {
    conversation = {
      id: Date.now().toString(),
      username: messageForm.value.toUsername,
      avatar: '',
      lastMessage: messageForm.value.content,
      lastTime: new Date().toLocaleTimeString(),
      unread: 0,
      online: true
    }
    conversations.unshift(conversation)
  } else {
    conversation.lastMessage = messageForm.value.content
    conversation.lastTime = new Date().toLocaleTimeString()
  }

  localStorage.setItem('conversations', JSON.stringify(conversations))

  // 发送消息
  const messages = JSON.parse(localStorage.getItem('messages') || '[]')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  messages.push({
    id: Date.now().toString(),
    conversationId: conversation.id,
    username: userInfo.username || '我',
    avatar: userInfo.avatar || '',
    content: messageForm.value.content,
    time: new Date().toLocaleTimeString(),
    isSelf: true
  })

  localStorage.setItem('messages', JSON.stringify(messages))

  ElMessage.success('消息已发送')
  messageDialogVisible.value = false
}

const unfollow = (userId: string) => {
  const index = followingList.value.findIndex(u => u.id === userId)
  if (index > -1) {
    followingList.value.splice(index, 1)
    localStorage.setItem('following', JSON.stringify(followingList.value))
    ElMessage.success('已取消关注')
  }
}

const toggleFollow = (user: User) => {
  if (isFollowing(user.id)) {
    unfollow(user.id)
  } else {
    followingList.value.push(user)
    localStorage.setItem('following', JSON.stringify(followingList.value))
    ElMessage.success('关注成功')
  }
}

onMounted(() => {
  loadFollowing()
  loadFollowers()
  loadRecommend()
})
</script>

<style scoped>
.follow-container {
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
  max-width: 1200px;
  margin: 0 auto;
}

.follow-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-bio {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.user-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stat-item .label {
  font-size: 13px;
  color: #909399;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
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

  .user-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-stats {
    justify-content: center;
  }

  .user-actions {
    width: 100%;
  }

  .user-actions button {
    width: 100%;
  }
}
</style>
