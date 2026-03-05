<template>
  <div class="admin-user-manage-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>账号管理</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="账号状态" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="已封禁" value="banned" />
        </el-select>
      </div>

      <div class="user-list">
        <el-card v-for="user in filteredUsers" :key="user.id" class="user-card">
          <div class="user-cover" @click="viewUser(user)">
            <el-avatar :size="64" :src="user.avatar">
              {{ user.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div v-if="user.banned" class="user-status status-banned">
              <el-icon><Lock /></el-icon>
              已封禁
            </div>
            <div v-else class="user-status status-normal">
              <el-icon><CircleCheck /></el-icon>
              正常
            </div>
          </div>
          <div class="user-content">
            <h3 class="user-name" @click="viewUser(user)">{{ user.username }}</h3>
            <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
            <div class="user-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>注册时间: {{ user.createTime }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span>发帖数: {{ user.postCount || 0 }}</span>
              </div>
              <div class="meta-item">
                <el-icon><VideoPlay /></el-icon>
                <span>课程数: {{ user.courseCount || 0 }}</span>
              </div>
            </div>
            <div class="user-tags">
              <el-tag v-if="user.role === 'admin'" type="danger" size="small">管理员</el-tag>
              <el-tag v-else type="info" size="small">普通用户</el-tag>
            </div>
            <div class="user-actions">
              <el-button 
                v-if="!user.banned && user.role !== 'admin'"
                type="danger" 
                @click="banUser(user)"
              >
                <el-icon><Lock /></el-icon>
                封禁账号
              </el-button>
              <el-button 
                v-if="user.banned"
                type="success" 
                @click="unbanUser(user)"
              >
                <el-icon><Unlock /></el-icon>
                解封账号
              </el-button>
            </div>
          </div>
        </el-card>
        <el-empty v-if="filteredUsers.length === 0" description="暂无用户" />
      </div>
    </el-main>

    <!-- 封禁原因对话框 -->
    <el-dialog v-model="banDialogVisible" title="封禁账号" width="500px">
      <el-form :model="banForm" label-width="100px">
        <el-form-item label="封禁原因">
          <el-input
            v-model="banForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入封禁原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="封禁时长">
          <el-radio-group v-model="banForm.duration">
            <el-radio label="3">3天</el-radio>
            <el-radio label="7">7天</el-radio>
            <el-radio label="30">30天</el-radio>
            <el-radio label="permanent">永久</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search,
  Lock,
  Unlock,
  CircleCheck,
  Calendar,
  Document,
  VideoPlay
} from '@element-plus/icons-vue'

interface User {
  id: string
  username: string
  avatar: string
  bio: string
  role: string
  banned: boolean
  createTime: string
  postCount?: number
  courseCount?: number
}

const router = useRouter()
const userList = ref<User[]>([])
const searchKeyword = ref('')
const filterStatus = ref('')
const banDialogVisible = ref(false)
const selectedUser = ref<User | null>(null)
const banForm = ref({
  reason: '',
  duration: '7'
})

// 根据搜索和筛选条件过滤用户
const filteredUsers = computed(() => {
  let result = userList.value

  if (searchKeyword.value) {
    result = result.filter(user => 
      user.username.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (filterStatus.value) {
    if (filterStatus.value === 'normal') {
      result = result.filter(user => !user.banned)
    } else if (filterStatus.value === 'banned') {
      result = result.filter(user => user.banned)
    }
  }

  return result
})

// 加载用户列表
const loadUsers = () => {
  const stored = localStorage.getItem('allUsers')
  if (stored) {
    userList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    userList.value = [
      {
        id: '1',
        username: 'admin',
        avatar: '',
        bio: '平台管理员',
        role: 'admin',
        banned: false,
        createTime: new Date().toLocaleString(),
        postCount: 0,
        courseCount: 0
      },
      {
        id: '2',
        username: '张三',
        avatar: '',
        bio: '热爱方言学习',
        role: 'user',
        banned: false,
        createTime: new Date().toLocaleString(),
        postCount: 23,
        courseCount: 5
      },
      {
        id: '3',
        username: '李四',
        avatar: '',
        bio: '方言文化爱好者',
        role: 'user',
        banned: true,
        createTime: new Date().toLocaleString(),
        postCount: 45,
        courseCount: 8
      }
    ]
    localStorage.setItem('allUsers', JSON.stringify(userList.value))
  }
}

// 搜索
const handleSearch = () => {
  // 过滤逻辑由computed自动处理
}

// 筛选
const handleFilter = () => {
  // 过滤逻辑由computed自动处理
}

// 查看用户
const viewUser = (user: User) => {
  // 跳转到用户主页（暂未实现）
  console.log('查看用户:', user)
}

// 封禁用户
const banUser = (user: User) => {
  selectedUser.value = user
  banForm.value = {
    reason: '',
    duration: '7'
  }
  banDialogVisible.value = true
}

// 确认封禁
const confirmBan = () => {
  if (!banForm.value.reason) {
    ElMessage.warning('请输入封禁原因')
    return
  }

  if (!selectedUser.value) return

  const index = userList.value.findIndex(u => u.id === selectedUser.value.id)
  if (index > -1) {
    userList.value[index].banned = true
    userList.value[index].banReason = banForm.value.reason
    userList.value[index].banDuration = banForm.value.duration
    userList.value[index].banTime = new Date().toLocaleString()

    localStorage.setItem('allUsers', JSON.stringify(userList.value))
    banDialogVisible.value = false
    ElMessage.success('账号已封禁')
  }
}

// 解封用户
const unbanUser = (user: User) => {
  ElMessageBox.confirm(
    '确定要解封该账号吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      const index = userList.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        userList.value[index].banned = false
        delete userList.value[index].banReason
        delete userList.value[index].banDuration
        delete userList.value[index].banTime

        localStorage.setItem('allUsers', JSON.stringify(userList.value))
        ElMessage.success('账号已解封')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-user-manage-container {
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

.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.user-card {
  overflow: hidden;
  transition: all 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-cover {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  cursor: pointer;
}

.user-status {
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

.status-normal {
  background: #67C23A;
}

.status-banned {
  background: #F56C6C;
}

.user-content {
  padding: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  cursor: pointer;
}

.user-name:hover {
  color: #409EFF;
}

.user-bio {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.user-meta {
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

.user-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.user-actions {
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

  .user-list {
    grid-template-columns: 1fr;
  }
}
</style>
