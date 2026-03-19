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
                    <div class="label">累计打卡天数</div>
                    <div class="value">{{ checkInDays }} 天</div>
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
              <div class="calendar-days">
                <div 
                  v-for="(day, index) in calendarDays" 
                  :key="index"
                  class="calendar-day"
                  :class="{ 
                    'is-checked': day.checked,
                    'is-today': day.isToday
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
                      <div class="history-title">每日打卡</div>
                      <div class="history-time">{{ record.checkinDate }}</div>
                    </div>
                    <div class="history-value">+{{ record.points }}</div>
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
                <!-- <el-button type="primary" link @click="goToRank">
                  <el-icon><Trophy /></el-icon>
                  查看全部
                </el-button> -->
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
                  <div class="checkin-days">连续打卡 {{ user.currentContinuousDays }} 天</div>
                </div>
                <div class="rank-coins">{{ user.totalPoints }} 积分</div>
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
import request from '@/utils/request'

interface CoinRecord {
  id: string
  points: string
  checkinDate: string
}

interface RankUser {
  id: string
  userId: string
  username: string
  avatar: string
  currentContinuousDays: number
  totalPoints: number
}

const router = useRouter()
const isCheckedIn = ref(false)
const checkInDays = ref(0)
const maxInDays = ref(0)
const totalCoins = ref(0)
const todayCoins = ref(10)
const currentMonth = ref('')
const currentYear = ref(new Date().getFullYear())
const currentMonthNum = ref(new Date().getMonth() + 1)

const recentCoins = ref<CoinRecord[]>([])
const topUsers = ref<RankUser[]>([])

// 获取当前日期
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentMonth.value = `${year}年${month}月`
}

// 计算日历天数
const calendarDays = ref<any []>([]);

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 判断是否是今天（适配字符串格式：'YYYY-MM-DD'）
const isToday = (dateStr: string) => {
  // 1. 将字符串日期转为Date对象（关键步骤）
  const date = new Date(dateStr);
  // 2. 获取今日日期（本地时间）
  const today = new Date();
  
  // 3. 沿用原逻辑：对比年、月、日
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
};

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
const handleCheckIn = async () => {
  if (isCheckedIn.value) {
    ElMessage.warning('今日已打卡')
    return
  }

  try {
    const res: any = await request.post('/checkin/get');
    console.log('checkin res', res);  

    if (res.code === 200) {
      await loadDateData();
      await loadPointData();
      ElMessage.success(`打卡成功！获得 ${todayCoins.value} 积分`)
    } else {
      ElMessage.error('打卡失败'+ res.message);
    }
  } catch (error) {
    ElMessage.error('打卡失败');
    console.log("Error checkin", error);
  } finally {

  }
}

// 加载日期数据
const loadDateData = async () => {
  const res = await request.get('/checkin/calendar', { params: { year: currentYear.value, month: currentMonthNum.value} });
  console.log('res',res)
  const newDays = Array.from(res.data.calendar.days).map((day: any) => ({
    day: day.day,
    date: day.date,
    checked: day.isCheckin,
    isToday: isToday(day.date),
  }));
  calendarDays.value = newDays;
}

// 加载今日是否打卡成功
const loadCheckInToday = async () => {
  try {
    const res:any = await request.get('/checkin/today');
    console.log('getToday res',res)

    if(res.code === 200) {
      isCheckedIn.value = res.data.isCheckin;
    } else {
      console.log("Error checkin today !200", res.message)
    }


  } catch (error) {
    console.log('Error checkin today', error)
  }
}

// 加载打卡数据
const loadCheckInData = async() => {
  try{
    const res: any = await request.get('/checkin/continuousStats');
    console.log('getContinu res',res)
    if(res.code === 200) {
      checkInDays.value = res.data.stats.currentContinuousDays;
      maxInDays.value = res.data.stats.totalCheckinDays;

      recentCoins.value = res.data.stats.recentCheckins;

    } else {
      console.log('Error getContinue data !200', res.message);
    }
  } catch (error){
    console.log('Error getContinue data', error)
  }
}

// 加载用户的积分数据
const loadPointData = async () => {
  try {
    const res: any = await request.get('/checkin/points');
    console.log('getPoint res',res)
    if(res.code === 200) {
      totalCoins.value = res.data.points.totalPoints;
    } else {
      console.log('Error getPoint data !200', res.message);
    }
  } catch(error){
    console.log('Error getPoint data', error)
  }
}

// 加载排行榜数据
const loadRankData = async () => {

  try{
    const res: any = await request.get('/checkin/ranking');
    console.log('get checkin ranking res', res);
    
    topUsers.value = res.data.ranking.list;
  } catch (error) {
    console.log('Error getRank data', error)
  }
}

const goToShop = () => {
  router.push('/checkin/shop')
}

const goToRank = () => {
  router.push('/checkin/rank')
}

onMounted(() => {
  loadDateData()
  loadPointData()
  loadCheckInToday()
  getCurrentDate()
  loadCheckInData()
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
