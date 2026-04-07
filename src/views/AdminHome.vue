<template>
  <div class="admin-home-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>平台管理后台</h1>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" class="user-avatar">
                {{ username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ username }}</span>
              <el-tag type="danger" size="small">管理员</el-tag>
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

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #409EFF">
                <el-icon :size="32"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalCourses }}</div>
                <div class="stat-label">待审核课程</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #67C23A">
                <el-icon :size="32"><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalPosts }}</div>
                <div class="stat-label">待审核帖子</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #E6A23C">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">平台用户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #F56C6C">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalBanned }}</div>
                <div class="stat-label">已封禁内容</div>
              </div>
            </div>
          </el-card>
          </el-col>
        </el-row>

      <el-row :gutter="20" class="action-cards">
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
          <el-card class="action-card" @click="goToCourseManage">
            <div class="card-content">
              <el-icon :size="48" color="#409EFF"><VideoPlay /></el-icon>
              <h3>课程管理</h3>
              <p>审核和管理平台课程</p>
              <el-button type="primary">进入管理</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
          <el-card class="action-card" @click="goToPostManage">
            <div class="card-content">
              <el-icon :size="48" color="#67C23A"><ChatDotRound /></el-icon>
              <h3>帖子管理</h3>
              <p>审核和管理社区帖子</p>
              <el-button type="success">进入管理</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
          <el-card class="action-card" @click="goToShopManage">
            <div class="card-content">
              <el-icon :size="48" color="#F56C6C"><ShoppingCart /></el-icon>
              <h3>商店管理</h3>
              <p>管理积分商店商品</p>
              <el-button type="danger">进入管理</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
          <el-card class="action-card" @click="goToUserManage">
            <div class="card-content">
              <el-icon :size="48" color="#909399"><User /></el-icon>
              <h3>账号管理</h3>
              <p>封禁和解封用户账号</p>
              <el-button type="info">进入管理</el-button>
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
  Document,
  CircleCheck,
  User,
  TrendCharts,
  VideoPlay,
  ChatDotRound
} from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('')
const totalCourses = ref(0)
const totalPosts = ref(0)
const totalUsers = ref(0)
const totalBanned = ref(0)

// 加载统计数据
const loadStats = () => {
  // 加载待审核课程数
  const onlineCourses = JSON.parse(localStorage.getItem('onlineCourses') || '[]')
  const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]')
  totalCourses.value = [...onlineCourses, ...offlineCourses].filter(
    (c: any) => c.status === 'published'
  ).length

  // 加载待审核帖子数
  const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  totalPosts.value = posts.filter((p: any) => p.status === 'published').length

  // 加载用户数（简化处理）
  totalUsers.value = 100

  // 加载封禁内容数
  const bannedCourses = [...onlineCourses, ...offlineCourses].filter(
    (c: any) => c.banned === true
  ).length
  const bannedPosts = posts.filter((p: any) => p.banned === true).length
  totalBanned.value = bannedCourses + bannedPosts
}

const goToCourseManage = () => {
  router.push('/admin/course-manage')
}

const goToPostManage = () => {
  router.push('/admin/post-manage')
}

const goToAnnounceManage = () => {
  router.push('/admin/announce-manage')
}

const goToShopManage = () => {
  router.push('/admin/shop-manage')
}

const goToUserManage = () => {
  router.push('/admin/user-manage')
}

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      router.push('/login')
      ElMessage.success('已退出登录')
    })
    .catch(() => {
      // 用户取消操作
    })
}

onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  username.value = userInfo.username || '管理员'
  loadStats()
})
</script>

<style scoped>
.admin-home-container {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: white;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
}

.username {
  font-size: 14px;
}

.page-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.action-cards {
  margin-top: 20px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  text-align: center;
  padding: 20px;
}

.card-content h3 {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.card-content p {
  margin: 0 0 20px 0;
  color: #606266;
  font-size: 14px;
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

  .stat-value {
    font-size: 24px;
  }

  .card-content {
    padding: 16px;
  }
}
</style>
