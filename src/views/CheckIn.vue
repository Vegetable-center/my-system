<template>
  <div class="checkin-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>学习打卡</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <!-- 打卡卡片 -->
          <el-card class="checkin-card">
            <template #header>
              <div class="card-header">
                <span>每日打卡</span>
                <el-tag :type="isCheckedIn ? 'success' : 'info'">
                  {{ isCheckedIn ? '已打卡' : '未打卡' }}
                </el-tag>
              </div>
            </template>
            <div class="checkin-content">
              <div class="checkin-info">
                <div class="info-item">
                  <el-icon :size="24" color="#409EFF"><Calendar /></el-icon>
                  <div class="info-text">
                    <div class="label">今日日期</div>
                    <div class="value">{{ currentDate }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <el-icon :size="24" color="#67C23A"><CircleCheck /></el-icon>
                  <div class="info-text">
                    <div class="label">连续打卡</div>
                    <div class="value">{{ checkInDays }} 天</div>
                  </div>
                </div>
                <div class="info-item">
                  <el-icon :size="24" color="#E6A23C"><Coin /></el-icon>
                  <div class="info-text">
                    <div class="label">今日获得</div>
                    <div class="value">+{{ todayCoins }} 积分</div>
                  </div>
                </div>
              </div>
              <el-button 
                type="primary" 
                size="large" 
                class="checkin-button"
                :disabled="isCheckedIn"
                @click="handleCheckIn"
              >
                <el-icon><Check /></el-icon>
                {{ isCheckedIn ? '今日已打卡' : '立即打卡' }}
              </el-button>
            </div>
          </el-card>

          <!-- 打卡日历 -->
          <el-card class="calendar-card">
            <template #header>
              <div class="card-header">
                <span>打卡日历</span>
                <el-button-group>
                  <el-button size="small" @click="changeMonth(-1)">
                    <el-icon><ArrowLeft /></el-icon>
                  </el-button>
                  <el-button size="small">{{ currentMonth }}</el-button>
                  <el-button size="small" @click="changeMonth(1)">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
            </template>
            <div class="calendar-content">
              <div class="calendar-weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">
                  {{ day }}
                </div>
              </div>
              <div class="calendar-days">
                <div 
                  v-for="day in calendarDays" 
                  :key="day.date"
                  class="calendar-day"
                  :class="{ 
                    'is-checked': day.checked,
                    'is-today': day.isToday,
                    'is-other-month': day.isOtherMonth
                  }"
                >
                  {{ day.day }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <!-- 积分信息 -->
          <el-card class="coins-card">
            <template #header>
              <div class="card-header">
                <span>我的积分</span>
                <el-button type="primary" link @click="goToShop">
                  <el-icon><ShoppingCart /></el-icon>
                  积分商城
                </el-button>
              </div>
            </template>
            <div class="coins-content">
              <div class="coins-display">
                <el-icon :size="48" color="#E6A23C"><Coin /></el-icon>
                <div class="coins-value">{{ totalCoins }}</div>
              </div>
              <el-divider />
              <div class="coins-history">
                <h4>最近获得</h4>
                <div class="history-list">
                  <div v-for="record in recentCoins" :key="record.id" class="history-item">
                    <div class="history-info">
                      <div class="history-title">{{ record.title }}</div>
                      <div class="history-time">{{ record.time }}</div>
                    </div>
                    <div class="history-value">+{{ record.coins }}</div>
                  </div>
                  <el-empty v-if="recentCoins.length === 0" description="暂无记录" />
                </div>
              </div>
            </div>
          </el-card>

          <!-- 排行榜 -->
          <el-card class="rank-card">
            <template #header>
              <div class="card-header">
                <span>打卡排行榜</span>
                <el-button type="primary" link @click="goToRank">
                  <el-icon><Trophy /></el-icon>
                  查看全部
                </el-button>
              </div>
            </template>
            <div class="rank-list">
              <div v-for="(user, index) in topUsers" :key="user.id" class="rank-item">
                <div class="rank-number" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <el-avatar :size="40" :src="user.avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-info">
                  <div class="username">{{ user.username }}</div>
                  <div class="checkin-days">连续打卡 {{ user.days }} 天</div>
                </div>
                <div class="rank-coins">{{ user.coins }} 积分</div>
              </div>
              <el-empty v-if="topUsers.length === 0" description="暂无数据" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Calendar, 
  CircleCheck, 
  Coin,
  Check,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Trophy
} from '@element-plus/icons-vue'

interface CoinRecord {
  id: string
  title: string
  coins: number
  time: string
}

interface RankUser {
  id: string
  username: string
  avatar: string
  days: number
  coins: number
}

const router = useRouter()
const isCheckedIn = ref(false)
const checkInDays = ref(0)
const totalCoins = ref(0)
const todayCoins = ref(10)
const currentDate = ref('')
const currentMonth = ref('')
const currentYear = ref(new Date().getFullYear())
const currentMonthNum = ref(new Date().getMonth() + 1)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const recentCoins = ref<CoinRecord[]>([])
const topUsers = ref<RankUser[]>([])

// 获取当前日期
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${year}-${month}-${day}`
  currentMonth.value = `${year}年${month}月`
}

// 计算日历天数
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonthNum.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonthNum.value, 0)

  // 上个月的日期
  const firstDayWeek = firstDay.getDay()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonthNum.value - 1, -i)
    days.push({
      day: date.getDate(),
      date: formatDate(date),
      checked: isDateChecked(date),
      isToday: false,
      isOtherMonth: true
    })
  }

  // 当前月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonthNum.value - 1, i)
    days.push({
      day: i,
      date: formatDate(date),
      checked: isDateChecked(date),
      isToday: isToday(date),
      isOtherMonth: false
    })
  }

  // 下个月的日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonthNum.value, i)
    days.push({
      day: i,
      date: formatDate(date),
      checked: isDateChecked(date),
      isToday: false,
      isOtherMonth: true
    })
  }

  return days
})

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 判断是否是今天
const isToday = (date: Date) => {
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate()
}

// 判断日期是否已打卡
const isDateChecked = (date: Date) => {
  const checkInRecords = JSON.parse(localStorage.getItem('checkInRecords') || '[]')
  const dateStr = formatDate(date)
  return checkInRecords.includes(dateStr)
}

// 切换月份
const changeMonth = (delta: number) => {
  currentMonthNum.value += delta
  if (currentMonthNum.value > 12) {
    currentMonthNum.value = 1
    currentYear.value++
  } else if (currentMonthNum.value < 1) {
    currentMonthNum.value = 12
    currentYear.value--
  }
  currentMonth.value = `${currentYear.value}年${String(currentMonthNum.value).padStart(2, '0')}月`
}

// 打卡
const handleCheckIn = () => {
  if (isCheckedIn.value) {
    ElMessage.warning('今日已打卡')
    return
  }

  // 保存打卡记录
  const checkInRecords = JSON.parse(localStorage.getItem('checkInRecords') || '[]')
  checkInRecords.push(currentDate.value)
  localStorage.setItem('checkInRecords', JSON.stringify(checkInRecords))

  // 更新连续打卡天数
  checkInDays.value++
  localStorage.setItem('checkInDays', String(checkInDays.value))

  // 更新积分
  totalCoins.value += todayCoins.value
  localStorage.setItem('totalCoins', String(totalCoins.value))

  // 添加积分记录
  const coinRecords = JSON.parse(localStorage.getItem('coinRecords') || '[]')
  coinRecords.unshift({
    id: Date.now().toString(),
    title: '每日打卡',
    coins: todayCoins.value,
    time: new Date().toLocaleString()
  })
  localStorage.setItem('coinRecords', JSON.stringify(coinRecords))

  isCheckedIn.value = true
  ElMessage.success(`打卡成功！获得 ${todayCoins.value} 积分`)
}

// 加载打卡数据
const loadCheckInData = () => {
  const checkInRecords = JSON.parse(localStorage.getItem('checkInRecords') || '[]')
  isCheckedIn.value = checkInRecords.includes(currentDate.value)

  checkInDays.value = parseInt(localStorage.getItem('checkInDays') || '0')
  totalCoins.value = parseInt(localStorage.getItem('totalCoins') || '0')
}

// 加载积分记录
const loadCoinRecords = () => {
  const records = JSON.parse(localStorage.getItem('coinRecords') || '[]')
  recentCoins.value = records.slice(0, 5)
}

// 加载排行榜数据
const loadRankData = () => {
  const stored = localStorage.getItem('rankUsers')
  if (stored) {
    topUsers.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    topUsers.value = [
      {
        id: '1',
        username: '张三',
        avatar: '',
        days: 30,
        coins: 300
      },
      {
        id: '2',
        username: '李四',
        avatar: '',
        days: 25,
        coins: 250
      },
      {
        id: '3',
        username: '王五',
        avatar: '',
        days: 20,
        coins: 200
      }
    ]
    localStorage.setItem('rankUsers', JSON.stringify(topUsers.value))
  }
}

const goToShop = () => {
  router.push('/checkin/shop')
}

const goToRank = () => {
  router.push('/checkin/rank')
}

onMounted(() => {
  getCurrentDate()
  loadCheckInData()
  loadCoinRecords()
  loadRankData()
})
</script>

<style scoped>
.checkin-container {
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
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.checkin-card,
.calendar-card,
.coins-card,
.rank-card {
  margin-bottom: 20px;
}

.checkin-content {
  padding: 20px 0;
}

.checkin-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-text .label {
  color: #909399;
  font-size: 13px;
}

.info-text .value {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.checkin-button {
  width: 100%;
  font-size: 16px;
}

.calendar-content {
  padding: 10px 0;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  text-align: center;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  cursor: default;
  transition: all 0.3s;
  background: #f5f7fa;
  color: #606266;
}

.calendar-day.is-checked {
  background: #67C23A;
  color: white;
}

.calendar-day.is-today {
  border: 2px solid #409EFF;
}

.calendar-day.is-other-month {
  opacity: 0.4;
}

.coins-content {
  padding: 0;
}

.coins-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

.coins-value {
  font-size: 36px;
  font-weight: 600;
  color: #E6A23C;
}

.coins-history h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  flex: 1;
}

.history-title {
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.history-time {
  color: #909399;
  font-size: 12px;
}

.history-value {
  color: #67C23A;
  font-weight: 600;
  font-size: 16px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #909399;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.rank-number.rank-1 {
  background: #F56C6C;
}

.rank-number.rank-2 {
  background: #E6A23C;
}

.rank-number.rank-3 {
  background: #F56C6C;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info .username {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info .checkin-days {
  color: #909399;
  font-size: 12px;
}

.rank-coins {
  color: #E6A23C;
  font-weight: 600;
  font-size: 14px;
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

  .checkin-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
