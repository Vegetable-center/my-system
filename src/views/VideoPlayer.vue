<template>
  <div class="course-detail-container">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <div class="header-content">
            <span class="course-title">{{ currentVideo.lessonName || 'caixin' }}</span>
          </div>
        </template>
      </el-page-header>

      <el-main class="page-main">
        <div class="video-container" ref="videoContainer">
          <div 
          class="video-player-wrapper" 
          ref="videoPlayerWrapper"
          :style="{ top: playerPosition.y + 'px', left: playerPosition.x + 'px' }"
        >
          <div class="video-header">
            <h3>{{ currentVideo.lessonName }}</h3>
            <button class="control-btn" @click="toggleMinimize">
              {{ isMinimized ? '□' : '−' }}
            </button>
          </div>

          <div class="video-content" v-show="!isMinimized">
            <video 
              ref="videoPlayer"
              :key="currentVideo.id"
              :src="currentVideo.videoUrl" 
              controls
              @loadedmetadata="onVideoLoaded"
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
            ></video>
          </div>
          </div>

          <div class="video-list">
          <h3>视频列表</h3>
          <ul>
            <li 
              v-for="(video, index) in videoList" 
              :key="index" 
              :class="{ active: currentVideoIndex === index }"
              @click="switchVideo(video,index)"
            >
              <div class="video-item">
                <div class="video-thumbnail">
                  <img :src="video.coverImageUrl" :alt="video.lessonName">
                </div>
                <div class="video-info">
                  <h4>{{ video.lessonName }}</h4>
                  <p>第{{ video.lessonNum }}课时</p>
                </div>
              </div>
            </li>
          </ul>
          </div>
      </div>
      </el-main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import request from '@/utils/request'

// 定义视频列表类型
interface Video {
  lessonName: string
  coverImageUrl: string
  lessonNum: string
}

// 定义位置类型
interface Position {
  x: number
  y: number
}

// 响应式数据
const videoList = ref<Video[]>([])

const currentVideoIndex = ref(0)
const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const isMinimized = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const playerPosition = ref<Position>({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref<Position>({ x: 0, y: 0 })
const playerStart = ref<Position>({ x: 0, y: 0 })

// 引用 DOM 元素
const videoPlayer = ref<HTMLVideoElement | null>(null)
const videoPlayerWrapper = ref<HTMLElement | null>(null)

const route = useRoute();
const router = useRouter();
const lessonId = computed(() => route.params.id as string)
const courseId = computed(() => route.params.courseId as string)


// 计算属性
const currentVideo = ref<any>({
  lessonId: '',
  lessonName: '',
  lessonNum: '',
  videoUrl: '',
  coverImageUrl: '',
  courseId: ''
})


const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const onVideoLoaded = () => {
  const video = videoPlayer.value
  if (video) {
    duration.value = video.duration
  }
}

const onTimeUpdate = () => {
  const video = videoPlayer.value
  if (video) {
    currentTime.value = video.currentTime
    progress.value = (currentTime.value / duration.value) * 100
  }
}

const onVideoEnded = () => {
  isPlaying.value = false
  console.log('Video ended')
  // 自动播放下一个视频
  if (currentVideoIndex.value < videoList.value.length - 1) {
    switchVideo(videoList.value[currentVideoIndex.value + 1], currentVideoIndex.value + 1)
    console.log('current', currentVideo.value)
  }
}

const switchVideo = (CurrentVideo: any ,index: number) => {
  console.log('index', CurrentVideo);
  currentVideo.value = CurrentVideo;

  currentVideoIndex.value = index
  currentTime.value = 0
  progress.value = 0
  isPlaying.value = false

  // 重置视频状态
  const video = videoPlayer.value
  if (video) {
    video.load()
  }
}


const initDrag = () => {
  const wrapper = videoPlayerWrapper.value
  if (!wrapper) return
  
  const header = wrapper.querySelector('.video-header')
  if (!header) return

  header.addEventListener('mousedown', (e: any) => {
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    playerStart.value = { ...playerPosition.value }

    // 添加全局鼠标事件
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  })
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return

  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y

  playerPosition.value = {
    x: playerStart.value.x + dx,
    y: playerStart.value.y + dy
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const loadList = async () => {
  const res: any = await request.get(`/course/${courseId.value}/lessons`)
  videoList.value = res.list;

  // 通过ID查找视频
  const found = videoList.value.find((video: any) => video.id === lessonId.value)

  currentVideo.value = found;

  console.log('lessons res', res)
}

// 生命周期钩子
onMounted(() => {
  loadList();
  // 初始化拖拽功能
  nextTick(() => {
    initDrag()
  })
})

onBeforeUnmount(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

const goBack = () => {
  router.push(`/course/${courseId.value}`)
}
</script>


<style scoped>
.course-detail-container {
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

.course-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.page-main {
  padding: 24px;
  height: 800px;
  max-width: 1400px;
  margin: 0 auto;
}
.video-container {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.video-player-wrapper {
  flex: 1;
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  cursor: move;
}

.video-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.video-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #000;
}
.video-player-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：保持比例，填满容器，裁剪超出部分 */
}

.video-controls {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  margin: 0 8px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-container {
  flex: 1;
  margin: 0 15px;
}

.progress-bar {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-filled {
  height: 100%;
  background-color: #409eff;
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
}

.time-display {
  font-size: 14px;
  margin: 0 10px;
}

.video-list {
  width: 350px;
  margin-left: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.video-list h3 {
  padding: 15px 20px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  color: #303133;
}

.video-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.video-list li {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.video-list li:hover {
  background-color: #f5f7fa;
}

.video-list li.active {
  background-color: #ecf5ff;
}

.video-item {
  display: flex;
}

.video-thumbnail {
  width: 120px;
  height: 70px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  flex: 1;
}

.video-info h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* 全屏样式 */
.video-player-wrapper:fullscreen {
  width: 100%;
  height: 100%;
}

.video-player-wrapper:fullscreen .video-content {
  height: 100%;
}

.video-player-wrapper:fullscreen video {
  max-height: none;
  height: calc(100% - 60px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-container {
    flex-direction: column;
  }

  .video-list {
    width: 100%;
    margin-left: 0;
    margin-top: 20px;
  }
}
</style>
