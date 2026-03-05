<template>
  <div class="message-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>私信</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
          <el-card class="message-list-card">
            <template #header>
              <div class="card-header">
                <span>消息列表</span>
                <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge">
                  <el-icon :size="20"><Bell /></el-icon>
                </el-badge>
              </div>
            </template>
            <div class="message-list">
              <div 
                v-for="conversation in conversations" 
                :key="conversation.id"
                class="message-item"
                :class="{ active: currentConversationId === conversation.id }"
                @click="selectConversation(conversation)"
              >
                <div class="user-avatar">
                  <el-badge :value="conversation.unread" :hidden="conversation.unread === 0">
                    <el-avatar :size="48" :src="conversation.avatar">
                      {{ conversation.username.charAt(0).toUpperCase() }}
                    </el-avatar>
                  </el-badge>
                </div>
                <div class="message-info">
                  <div class="message-header">
                    <span class="username">{{ conversation.username }}</span>
                    <span class="time">{{ conversation.lastTime }}</span>
                  </div>
                  <div class="message-preview">{{ conversation.lastMessage }}</div>
                </div>
              </div>
              <el-empty v-if="conversations.length === 0" description="暂无消息" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
          <el-card class="chat-card">
            <template #header v-if="currentConversation">
              <div class="chat-header">
                <div class="user-info">
                  <el-avatar :size="40" :src="currentConversation.avatar">
                    {{ currentConversation.username.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <div class="user-detail">
                    <span class="username">{{ currentConversation.username }}</span>
                    <span class="status">{{ currentConversation.online ? '在线' : '离线' }}</span>
                  </div>
                </div>
              </div>
            </template>

            <div class="chat-content" v-if="currentConversation">
              <div class="message-contain" ref="messageContainer">
                <div 
                  v-for="message in messages" 
                  :key="message.id"
                  class="message-item"
                  :class="{ 'is-self': message.isSelf }"
                >
                  <el-avatar :size="36" :src="message.avatar">
                    {{ message.username.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <div class="message-bubble">
                    <div class="message-sender" v-if="!message.isSelf">{{ message.username }}</div>
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                </div>
                <el-empty v-if="messages.length === 0" description="暂无消息记录" />
              </div>
            </div>

            <div class="chat-input" v-if="currentConversation">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="输入消息..."
                @keyup.ctrl.enter="sendMessage"
              />
              <div class="input-actions">
                <span class="tip">按 Ctrl + Enter 发送</span>
                <el-button type="primary" @click="sendMessage">发送</el-button>
              </div>
            </div>

            <div class="empty-state" v-else>
              <el-empty description="选择一个会话开始聊天" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'

interface Conversation {
  id: string
  username: string
  avatar: string
  lastMessage: string
  lastTime: string
  unread: number
  online: boolean
}

interface Message {
  id: string
  conversationId: string
  username: string
  avatar: string
  content: string
  time: string
  isSelf: boolean
}

const conversations = ref<Conversation[]>([])
const messages = ref<Message[]>([])
const currentConversationId = ref('')
const inputMessage = ref('')
const messageContainer = ref<HTMLElement | null>(null)

const currentConversation = computed(() => {
  return conversations.value.find(c => c.id === currentConversationId.value)
})

const unreadCount = computed(() => {
  return conversations.value.reduce((sum, c) => sum + c.unread, 0)
})

// 加载会话列表
const loadConversations = () => {
  const stored = localStorage.getItem('conversations')
  if (stored) {
    conversations.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    conversations.value = [
      {
        id: '1',
        username: '张三',
        avatar: '',
        lastMessage: '好的，我明白了',
        lastTime: '10:30',
        unread: 2,
        online: true
      },
      {
        id: '2',
        username: '李四',
        avatar: '',
        lastMessage: '请问方言学习有什么建议吗？',
        lastTime: '昨天',
        unread: 0,
        online: false
      },
      {
        id: '3',
        username: '王五',
        avatar: '',
        lastMessage: '谢谢你的分享！',
        lastTime: '前天',
        unread: 1,
        online: true
      }
    ]
    localStorage.setItem('conversations', JSON.stringify(conversations.value))
  }
}

// 加载消息列表
const loadMessages = (conversationId: string) => {
  const allMessages = JSON.parse(localStorage.getItem('messages') || '[]')
  messages.value = allMessages.filter((m: Message) => m.conversationId === conversationId)
}

// 选择会话
const selectConversation = (conversation: Conversation) => {
  currentConversationId.value = conversation.id
  loadMessages(conversation.id)

  // 清除未读数
  conversation.unread = 0
  localStorage.setItem('conversations', JSON.stringify(conversations.value))

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const newMessage: Message = {
    id: Date.now().toString(),
    conversationId: currentConversationId.value,
    username: userInfo.username || '我',
    avatar: userInfo.avatar || '',
    content: inputMessage.value,
    time: new Date().toLocaleTimeString(),
    isSelf: true
  }

  // 保存消息
  const allMessages = JSON.parse(localStorage.getItem('messages') || '[]')
  allMessages.push(newMessage)
  localStorage.setItem('messages', JSON.stringify(allMessages))

  // 更新会话的最后一条消息
  const conversation = conversations.value.find(c => c.id === currentConversationId.value)
  if (conversation) {
    conversation.lastMessage = inputMessage.value
    conversation.lastTime = newMessage.time
    localStorage.setItem('conversations', JSON.stringify(conversations.value))
  }

  messages.value.push(newMessage)
  inputMessage.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

onMounted(() => {
  loadConversations()
})
</script>

<style scoped>
.message-container {
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
  width: 1400px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.message-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.message-list {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
  margin-bottom: 8px;
}

.message-item:hover {
  background: #f5f7fa;
}

.message-item.active {
  background: #ecf5ff;
}

.user-avatar {
  flex-shrink: 0;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.time {
  color: #909399;
  font-size: 12px;
}

.message-preview {
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-detail .username {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.user-detail .status {
  font-size: 12px;
  color: #909399;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.message-contain {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
}

.message-item.is-self {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.message-text {
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-item.is-self .message-text {
  background: #409EFF;
  color: white;
}

.message-time {
  font-size: 11px;
  color: #909399;
  text-align: right;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.tip {
  color: #909399;
  font-size: 12px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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
}
</style>
