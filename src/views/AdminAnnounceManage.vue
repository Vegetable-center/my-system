<template>
  <div class="admin-announce-manage-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>公告管理</h1>
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          发布公告
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="announce-list">
        <el-card v-for="announce in announceList" :key="announce.id" class="announce-card">
          <div class="announce-content">
            <div class="announce-header">
              <h3 class="announce-title">{{ announce.title }}</h3>
              <div class="announce-meta">
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ announce.createTime }}
                </span>
                <el-tag :type="announce.type === 'important' ? 'danger' : 'info'" size="small">
                  {{ announce.type === 'important' ? '重要' : '普通' }}
                </el-tag>
                <el-tag v-if="announce.pinned" type="warning" size="small">
                  <el-icon><Top /></el-icon>
                  置顶
                </el-tag>
              </div>
            </div>
            <div class="announce-body">{{ announce.content }}</div>
            <div class="announce-actions">
              <el-button 
                v-if="!announce.pinned"
                type="warning" 
                size="small"
                @click="pinAnnounce(announce)"
              >
                <el-icon><Top /></el-icon>
                置顶
              </el-button>
              <el-button 
                v-if="announce.pinned"
                type="info" 
                size="small"
                @click="unpinAnnounce(announce)"
              >
                <el-icon><Bottom /></el-icon>
                取消置顶
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                @click="deleteAnnounce(announce.id)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
        <el-empty v-if="announceList.length === 0" description="暂无公告" />
      </div>
    </el-main>

    <!-- 创建/编辑公告对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '发布公告'" width="600px">
      <el-form :model="announceForm" label-width="100px">
        <el-form-item label="公告标题">
          <el-input 
            v-model="announceForm.title" 
            placeholder="请输入公告标题" 
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="公告类型">
          <el-radio-group v-model="announceForm.type">
            <el-radio label="normal">普通公告</el-radio>
            <el-radio label="important">重要公告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch v-model="announceForm.pinned" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input
            v-model="announceForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus,
  Calendar,
  Top,
  Bottom,
  Delete
} from '@element-plus/icons-vue'

interface Announce {
  id: string
  title: string
  content: string
  type: 'normal' | 'important'
  pinned: boolean
  createTime: string
}

const router = useRouter()
const announceList = ref<Announce[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const announceForm = ref({
  id: '',
  title: '',
  content: '',
  type: 'normal' as 'normal' | 'important',
  pinned: false
})

// 加载公告列表
const loadAnnounces = () => {
  const stored = localStorage.getItem('announcements')
  if (stored) {
    announceList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    announceList.value = [
      {
        id: '1',
        title: '欢迎使用学习平台',
        content: '欢迎来到方言学习平台，这里可以学习各种方言，参与社区互动，完成学习打卡。',
        type: 'important',
        pinned: true,
        createTime: new Date().toLocaleString()
      },
      {
        id: '2',
        title: '新功能上线通知',
        content: '平台新增了课程创建功能，支持线上和线下两种课程类型，欢迎体验！',
        type: 'normal',
        pinned: false,
        createTime: new Date().toLocaleString()
      }
    ]
    localStorage.setItem('announcements', JSON.stringify(announceList.value))
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  announceForm.value = {
    id: '',
    title: '',
    content: '',
    type: 'normal',
    pinned: false
  }
  dialogVisible.value = true
}

// 处理提交
const handleSubmit = () => {
  if (!announceForm.value.title || !announceForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const announce: Announce = {
    id: isEdit.value ? announceForm.value.id : Date.now().toString(),
    title: announceForm.value.title,
    content: announceForm.value.content,
    type: announceForm.value.type,
    pinned: announceForm.value.pinned,
    createTime: new Date().toLocaleString()
  }

  if (isEdit.value) {
    const index = announceList.value.findIndex(a => a.id === announce.id)
    if (index > -1) {
      announceList.value[index] = announce
    }
  } else {
    announceList.value.unshift(announce)
  }

  localStorage.setItem('announcements', JSON.stringify(announceList.value))
  dialogVisible.value = false
  ElMessage.success(isEdit.value ? '修改成功' : '发布成功')
}

// 置顶公告
const pinAnnounce = (announce: Announce) => {
  // 先取消其他置顶
  announceList.value.forEach(a => a.pinned = false)
  announce.pinned = true
  localStorage.setItem('announcements', JSON.stringify(announceList.value))
  ElMessage.success('已置顶')
}

// 取消置顶
const unpinAnnounce = (announce: Announce) => {
  announce.pinned = false
  localStorage.setItem('announcements', JSON.stringify(announceList.value))
  ElMessage.success('已取消置顶')
}

// 删除公告
const deleteAnnounce = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这条公告吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = announceList.value.findIndex(a => a.id === id)
      if (index > -1) {
        announceList.value.splice(index, 1)
        localStorage.setItem('announcements', JSON.stringify(announceList.value))
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

onMounted(() => {
  loadAnnounces()
})
</script>

<style scoped>
.admin-announce-manage-container {
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
  max-width: 1000px;
  margin: 0 auto;
}

.announce-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announce-card {
  transition: all 0.3s;
}

.announce-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.announce-content {
  padding: 20px;
}

.announce-header {
  margin-bottom: 16px;
}

.announce-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.announce-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.announce-body {
  font-size: 15px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.announce-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
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

  .announce-actions {
    flex-direction: column;
  }
}
</style>
