<template>
  <div class="rank-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>打卡排行榜</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-tabs v-model="activeTab" class="rank-tabs">
        <el-tab-pane label="连续打卡榜" name="continuous">
          <div class="rank-list">
            <div v-for="(user, index) in continuousRank" :key="user.id" class="rank-item">
              <div class="rank-number" :class="'rank-' + (index + 1)">
                {{ index + 1 }}
              </div>
              <el-avatar :size="48" :src="user.avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="user-desc">连续打卡 {{ user.days }} 天</div>
              </div>
              <div class="rank-value">{{ user.days }} 天</div>
            </div>
            <el-empty v-if="continuousRank.length === 0" description="暂无数据" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="积分排行榜" name="coins">
          <div class="rank-list">
            <div v-for="(user, index) in coinsRank" :key="user.id" class="rank-item">
              <div class="rank-number" :class="'rank-' + (index + 1)">
                {{ index + 1 }}
              </div>
              <el-avatar :size="48" :src="user.avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="user-desc">累计获得 {{ user.coins }} 积分</div>
              </div>
              <div class="rank-value">{{ user.coins }} 积分</div>
            </div>
            <el-empty v-if="coinsRank.length === 0" description="暂无数据" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="总打卡天数" name="total">
          <div class="rank-list">
            <div v-for="(user, index) in totalRank" :key="user.id" class="rank-item">
              <div class="rank-number" :class="'rank-' + (index + 1)">
                {{ index + 1 }}
              </div>
              <el-avatar :size="48" :src="user.avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="user-desc">累计打卡 {{ user.totalDays }} 天</div>
              </div>
              <div class="rank-value">{{ user.totalDays }} 天</div>
            </div>
            <el-empty v-if="totalRank.length === 0" description="暂无数据" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface RankUser {
  id: string
  username: string
  avatar: string
  days: number
  coins: number
  totalDays: number
}

const activeTab = ref('continuous')
const continuousRank = ref<RankUser[]>([])
const coinsRank = ref<RankUser[]>([])
const totalRank = ref<RankUser[]>([])

// 加载排行榜数据
const loadRankData = () => {
  const stored = localStorage.getItem('rankUsers')
  if (stored) {
    const users: RankUser[] = JSON.parse(stored)

    // 连续打卡榜
    continuousRank.value = [...users].sort((a, b) => b.days - a.days)

    // 积分排行榜
    coinsRank.value = [...users].sort((a, b) => b.coins - a.coins)

    // 总打卡天数榜
    totalRank.value = [...users].sort((a, b) => b.totalDays - a.totalDays)
  } else {
    // 初始化示例数据
    const mockUsers: RankUser[] = [
      {
        id: '1',
        username: '张三',
        avatar: '',
        days: 30,
        coins: 300,
        totalDays: 45
      },
      {
        id: '2',
        username: '李四',
        avatar: '',
        days: 25,
        coins: 250,
        totalDays: 40
      },
      {
        id: '3',
        username: '王五',
        avatar: '',
        days: 20,
        coins: 200,
        totalDays: 35
      },
      {
        id: '4',
        username: '赵六',
        avatar: '',
        days: 18,
        coins: 180,
        totalDays: 30
      },
      {
        id: '5',
        username: '钱七',
        avatar: '',
        days: 15,
        coins: 150,
        totalDays: 28
      },
      {
        id: '6',
        username: '孙八',
        avatar: '',
        days: 12,
        coins: 120,
        totalDays: 25
      },
      {
        id: '7',
        username: '周九',
        avatar: '',
        days: 10,
        coins: 100,
        totalDays: 22
      },
      {
        id: '8',
        username: '吴十',
        avatar: '',
        days: 8,
        coins: 80,
        totalDays: 20
      },
      {
        id: '9',
        username: '郑十一',
        avatar: '',
        days: 5,
        coins: 50,
        totalDays: 15
      },
      {
        id: '10',
        username: '王十二',
        avatar: '',
        days: 3,
        coins: 30,
        totalDays: 10
      }
    ]

    continuousRank.value = [...mockUsers].sort((a, b) => b.days - a.days)
    coinsRank.value = [...mockUsers].sort((a, b) => b.coins - a.coins)
    totalRank.value = [...mockUsers].sort((a, b) => b.totalDays - a.totalDays)

    localStorage.setItem('rankUsers', JSON.stringify(mockUsers))
  }
}

onMounted(() => {
  loadRankData()
})
</script>

<style scoped>
.rank-container {
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
  max-width: 1000px;
  margin: 0 auto;
}

.rank-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  transition: all 0.3s;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item:hover {
  background: #f5f7fa;
}

.rank-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #909399;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.rank-number.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.rank-number.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-number.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-desc {
  font-size: 13px;
  color: #909399;
}

.rank-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
  flex-shrink: 0;
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

  .rank-item {
    padding: 12px;
  }

  .rank-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .rank-value {
    font-size: 16px;
  }
}
</style>
