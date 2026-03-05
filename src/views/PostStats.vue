<template>
  <div class="post-stats-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>数据看板</h1>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
      </div>
    </el-header>

    <el-main class="page-main">
      <!-- 数据概览 -->
      <el-row :gutter="20" class="stats-overview">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #409EFF">
                <el-icon :size="32"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalPosts }}</div>
                <div class="stat-label">发布帖子</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #67C23A">
                <el-icon :size="32"><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalViews }}</div>
                <div class="stat-label">总浏览量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #E6A23C">
                <el-icon :size="32"><Star /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalLikes }}</div>
                <div class="stat-label">总点赞数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #F56C6C">
                <el-icon :size="32"><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalComments }}</div>
                <div class="stat-label">总评论数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 数据趋势 -->
      <el-row :gutter="20" class="stats-trend">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card class="trend-card">
            <template #header>
              <div class="card-header">
                <span>浏览趋势</span>
              </div>
            </template>
            <div class="trend-chart">
              <div class="chart-placeholder">
                <el-icon :size="64" color="#409EFF"><TrendCharts /></el-icon>
                <p>浏览量趋势图</p>
                <p class="chart-data">本周平均浏览: {{ avgViews }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card class="trend-card">
            <template #header>
              <div class="card-header">
                <span>互动趋势</span>
              </div>
            </template>
            <div class="trend-chart">
              <div class="chart-placeholder">
                <el-icon :size="64" color="#67C23A"><DataLine /></el-icon>
                <p>点赞评论趋势图</p>
                <p class="chart-data">本周平均互动: {{ avgInteractions }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 热门内容 -->
      <el-row :gutter="20" class="stats-content">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>热门帖子</span>
                <el-button type="primary" link @click="goToMyPosts">
                  查看全部
                </el-button>
              </div>
            </template>
            <div class="hot-posts">
              <div v-for="(post, index) in hotPosts" :key="post.id" class="hot-post-item">
                <div class="post-rank">{{ index + 1 }}</div>
                <div class="post-info">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <div class="post-stats">
                    <span class="stat-item">
                      <el-icon><View /></el-icon>
                      {{ post.views }}
                    </span>
                    <span class="stat-item">
                      <el-icon><Star /></el-icon>
                      {{ post.likes }}
                    </span>
                  </div>
                </div>
              </div>
              <el-empty v-if="hotPosts.length === 0" description="暂无数据" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>热门标签</span>
              </div>
            </template>
            <div class="hot-tags">
              <el-tag
                v-for="(tag, index) in hotTags"
                :key="tag.name"
                :type="getTagType(index)"
                class="tag-item"
              >
                {{ tag.name }} ({{ tag.count }})
              </el-tag>
              <el-empty v-if="hotTags.length === 0" description="暂无数据" />
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
import { 
  Document,
  View,
  Star,
  ChatDotRound,
  TrendCharts,
  DataLine
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
  comments?: number
  tags: string[]
  createTime: string
}

interface Tag {
  name: string
  count: number
}

const router = useRouter()
const dateRange = ref<[Date, Date] | null>(null)
const posts = ref<Post[]>([])

// 计算总数据
const totalPosts = computed(() => posts.value.length)
const totalViews = computed(() => posts.value.reduce((sum, p) => sum + p.views, 0))
const totalLikes = computed(() => posts.value.reduce((sum, p) => sum + p.likes, 0))
const totalComments = computed(() => posts.value.reduce((sum, p) => sum + (p.comments || 0), 0))

// 计算平均值
const avgViews = computed(() => {
  if (posts.value.length === 0) return 0
  return Math.round(totalViews.value / posts.value.length)
})

const avgInteractions = computed(() => {
  if (posts.value.length === 0) return 0
  return Math.round((totalLikes.value + totalComments.value) / posts.value.length)
})

// 热门帖子（按浏览量排序）
const hotPosts = computed(() => {
  return [...posts.value]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
})

// 热门标签
const hotTags = computed(() => {
  const tagMap = new Map<string, number>()

  posts.value.forEach(post => {
    post.tags?.forEach(tag => {
      const count = tagMap.get(tag) || 0
      tagMap.set(tag, count + 1)
    })
  })

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

// 获取标签样式
const getTagType = (index: number) => {
  if (index < 3) return 'danger'
  if (index < 6) return 'warning'
  return 'info'
}

// 加载帖子数据
const loadPosts = () => {
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  // 筛选当前用户的帖子
  posts.value = allPosts.filter((post: Post) => post.author === userInfo.username)
}

// 日期范围变化
const handleDateChange = () => {
  // TODO: 根据日期范围筛选数据
  loadPosts()
}

// 跳转到我的帖子
const goToMyPosts = () => {
  router.push('/my-posts')
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.post-stats-container {
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

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
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

.stats-trend {
  margin-bottom: 20px;
}

.trend-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.trend-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 12px 0;
  font-size: 14px;
}

.chart-data {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.stats-content {
  margin-bottom: 20px;
}

.content-card {
  margin-bottom: 20px;
}

.hot-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-post-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.hot-post-item:hover {
  background: #ecf5ff;
}

.post-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409EFF;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  margin-right: 0;
}

@media (max-width: 768px) {
  .page-main {
    padding: 16px;
  }

  .header-content {
    padding: 0 12px;
    flex-direction: column;
    height: auto;
    padding-top: 12px;
    padding-bottom: 12px;
    gap: 12px;
  }

  .header-content h1 {
    font-size: 18px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-placeholder {
    padding: 20px;
  }
}
</style>
