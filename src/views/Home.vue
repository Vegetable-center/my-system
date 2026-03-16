<template>
  <div class="home-container">
    <el-header class="home-header">
      <div class="header-content">
        <div class="header-left">
          <el-icon :size="24" class="logo-icon">
            <Reading />
          </el-icon>
          <h1 class="app-title" @click="test">Study Plant</h1>
        </div>
        <div class="header-right">
          <el-button type="primary" link @click="goToMessageList">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0">
              <el-icon :size="24"><Message /></el-icon>
            </el-badge>
          </el-button>
          <el-dropdown trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" class="user-avatar">
                {{ username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ username }}</span>
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="goToFollowList">
                  <el-icon><UserFilled /></el-icon>
                  关注管理
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-main class="home-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="welcome-card">
            <template #header>
              <div class="card-header">
                <span>欢迎使用 Study Plant</span>
              </div>
            </template>
            <div class="card-content">
              <p>这是一个基于 Vue 3、TypeScript 和 Element Plus 的学习管理系统</p>
              <el-divider />
              <div class="feature-list">
                <div class="feature-item">
                  <el-icon :size="20" color="#67C23A"><CircleCheck /></el-icon>
                  <span>现代化的用户界面</span>
                </div>
                <div class="feature-item">
                  <el-icon :size="20" color="#67C23A"><CircleCheck /></el-icon>
                  <span>完整的认证系统</span>
                </div>
                <div class="feature-item">
                  <el-icon :size="20" color="#67C23A"><CircleCheck /></el-icon>
                  <span>响应式设计</span>
                </div>
                <div class="feature-item">
                  <el-icon :size="20" color="#67C23A"><CircleCheck /></el-icon>
                  <span>活跃的社区互动</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>快速开始</span>
              </div>
            </template>
            <div class="info-content">
              <el-button type="primary" class="action-button" @click="goToDialectList">
                <el-icon><Reading /></el-icon>
                方言资源库
              </el-button>
              <el-button type="success" class="action-button" @click="goToCourseList">
                <el-icon><Document /></el-icon>
                课程学习
              </el-button>
              <el-button type="warning" class="action-button" @click="goToCommunityList">
                <el-icon><ChatDotRound /></el-icon>
                社区互动
              </el-button>
              <el-button type="danger" class="action-button" @click="goToOfflineList">
                <el-icon><Location /></el-icon>
                线下课程
              </el-button>
              <el-button type="info" class="action-button" @click="goToCheckIn">
                <el-icon><Calendar /></el-icon>
                学习打卡
              </el-button>
              <el-divider>创建课程</el-divider>
              <el-button type="success" class="action-button" @click="createOnlineCourse">
                <el-icon><VideoPlay /></el-icon>
                创建线上课程
              </el-button>
              <el-button type="warning" class="action-button" @click="createOfflineCourse">
                <el-icon><Location /></el-icon>
                创建线下课程
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Reading, 
  ArrowDown, 
  SwitchButton, 
  CircleCheck, 
  Edit, 
  Document 
} from '@element-plus/icons-vue'
import request from '@/utils/request'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const userInfo = ref<any>(null)
const unreadCount = ref(0)

onMounted(() => {
  // 从localStorage获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
    username.value = userInfo.value.username || '用户'
    loadUnreadCount()
  } else {
    // 如果没有用户信息，跳转到登录页
    router.push('/login')
  }
})

// 加载未读消息数
const loadUnreadCount = () => {
  const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
  unreadCount.value = conversations.reduce((sum: number, c: any) => sum + c.unread, 0)
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async() => {
      await request.post('/user/logout');

      // 清除所有用户相关的localStorage数据
      // localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      // localStorage.removeItem('username')

      ElMessage.success('已退出登录')
      router.push('/login')
    })
    .catch(() => {
      // 用户取消操作
    })
}

const showMessage = () => {
  ElMessage.info('功能开发中...')
}

const goToDialectList = () => {
  router.push('/dialect/list')
}

const goToCourseList = () => {
  router.push('/course/list')
}

const goToCommunityList = () => {
  router.push('/community/list')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToOfflineList = () => {
  router.push('/offline/list')
}

const goToMessageList = () => {
  router.push('/message/list')
}

const goToFollowList = () => {
  router.push('/follow/list')
}

const goToCheckIn = () => {
  router.push('/checkin/main')
}

const createOnlineCourse = () => {
  router.push('/course/online/create')
}

const createOfflineCourse = () => {
  router.push('/offline/create')
}

const test = async () => {
  const { data } = await axios.get('/api/hello');
  console.log('res', data);
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.home-header {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: white;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
}

.home-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-content p {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.info-card {
  height: fit-content;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  width: 100%;
  justify-content: flex-start;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5568d3 0%, #653d8f 100%);
}

@media (max-width: 768px) {
  .home-main {
    padding: 16px;
  }

  .header-content {
    padding: 0 12px;
  }

  .app-title {
    font-size: 18px;
  }

  .username {
    display: none;
  }
}
</style>
