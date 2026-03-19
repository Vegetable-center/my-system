<template>
  <div class="profile-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1 style="cursor: pointer;" @click="goHome">个人中心</h1>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <!-- 左侧个人信息卡片 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
          <el-card class="user-card">
            <div class="user-info">
              <div class="avatar-wrapper">
                <el-avatar :size="100" :src="userInfo.avatar">
                  {{ userInfo.userName ? userInfo.userName.charAt(0).toUpperCase() : 'U' }}
                </el-avatar>
                <el-button type="primary" size="small" circle @click="showEditDialog" v-if="isSelf">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </div>
              <h3 class="username">{{ userInfo.userName }}</h3>
              <p class="user-bio">{{ userInfo.signature || '这个人很懒，什么都没留下...' }}</p>
              <el-button type="primary" style="margin-top: 20px; width: 160px;" @click="followUser" v-if="!isSelf">{{ isFollowing ? '取消关注' : '关注'}}</el-button>
            </div>
            <el-divider />
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ myPosts.length }}</div>
                <div class="stat-label">帖子</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.followings.length }}</div>
                <div class="stat-label">关注</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.followers.length }}</div>
                <div class="stat-label">粉丝</div>
              </div>
            </div>
          </el-card>

          <el-card class="menu-card">
            <el-menu
              :default-active="activeTab"
              mode="vertical"
              @select="handleMenuSelect"
            >
              <el-menu-item index="posts">
                <el-icon><Document /></el-icon>
                <span>我的帖子</span>
              </el-menu-item>
              <el-menu-item index="following">
                <el-icon><UserFilled /></el-icon>
                <span>我的关注</span>
              </el-menu-item>
              <el-menu-item index="followers">
                <el-icon><User /></el-icon>
                <span>我的粉丝</span>
              </el-menu-item>
              <el-menu-item index="goods" v-if="isSelf">
                <el-icon><Star /></el-icon>
                <span>商品兑换记录</span>
              </el-menu-item>
              <el-menu-item index="settings" v-if="isSelf">
                <el-icon><Setting /></el-icon>
                <span>账号设置</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧内容区域 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
          <!-- 我的帖子 -->
          <el-card v-if="activeTab === 'posts'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>我的帖子</span>
              </div>
            </template>
            <div class="post-list">
              <div v-for="post in myPosts" :key="post.id" class="post-item">
                <el-image :src="post.cover" fit="cover" class="post-cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon :size="40"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="post-info">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <p class="post-desc">{{ post.content }}</p>
                  <div class="post-meta">
                    <span class="meta-item">
                      <el-icon><View /></el-icon>
                      {{ post.viewCount }}
                    </span>
                    <span class="meta-item">
                      <el-icon><Star /></el-icon>
                      {{ post.likeCount }}
                    </span>
                    <span class="meta-item">{{formatUploadTime(post.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-actions">
                  <el-button type="primary" link @click="viewPost(post.id)">
                    查看
                  </el-button>
                  <el-button type="danger" link @click="deletePost(post.id)" v-if="isSelf">
                    删除
                  </el-button>
                </div>
              </div>
              <el-empty v-if="myPosts.length === 0" description="暂无帖子" />
            </div>
          </el-card>

          <!-- 我的帖子 -->
          <el-card v-if="activeTab === 'goods'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>商品兑换记录</span>
              </div>
            </template>
            <div class="post-list">
              <div v-for="good in myGoods" :key="good.id" class="post-item">
                <el-image :src="good.image" fit="cover" class="post-cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon :size="40"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="post-info">
                  <h4 class="post-title">{{ good.goodsName }}</h4>
                  <p class="post-desc">{{ good.description }}</p>
                  <div class="post-meta">
                    <span class="meta-item">兑换价格：{{ good.points }} 积分</span>
                    <span class="meta-item">{{formatUploadTime(good.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="myGoods.length === 0" description="暂无帖子" />
            </div>
          </el-card>

          <!-- 我的关注 -->
          <el-card v-if="activeTab === 'following'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>我的关注</span>
                <el-button type="primary" size="small" @click="showFollowDialog">
                  <el-icon><Plus /></el-icon>
                  添加关注
                </el-button>
              </div>
            </template>
            <div class="user-list">
              <div v-for="user in followingList" :key="user.id" class="user-item" style="cursor: pointer;" @click="goOther(user.id)">
                <el-avatar :size="48" :src="user.avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-detail">
                  <h4 class="user-name">{{ user.username }}</h4>
                  <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                </div>
                <el-button type="danger" link @click="unfollow(user.id)">
                  取消关注
                </el-button>
              </div>
              <el-empty v-if="followingList.length === 0" description="暂无关注" />
            </div>
          </el-card>

          <!-- 我的粉丝 -->
          <el-card v-if="activeTab === 'followers'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>我的粉丝</span>
              </div>
            </template>
            <div class="user-list">
              <div v-for="user in followersList" :key="user.id" class="user-item"  style="cursor: pointer;" @click="goOther(user.id)">
                <el-avatar :size="48" :src="user.avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-detail">
                  <h4 class="user-name">{{ user.username }}</h4>
                  <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                </div>
                <!-- <el-button 
                  type="primary" 
                  link 
                  @click="followUser(user)"
                  :disabled="isFollowing(user.id)"
                >
                  {{ isFollowing(user.id) ? '已关注' : '关注' }}
                </el-button> -->
              </div>
              <el-empty v-if="followersList.length === 0" description="暂无粉丝" />
            </div>
          </el-card>

          <!-- 账号设置 -->
          <el-card v-if="activeTab === 'settings'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>账号设置</span>
              </div>
            </template>
            <el-form :model="settingsForm" label-width="120px">
              <el-form-item label="用户名">
                <el-input v-model="settingsForm.username" disabled />
              </el-form-item>
              <el-form-item label="个性签名">
                <el-input
                  v-model="settingsForm.signature"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入个性签名"
                />
              </el-form-item>
              <el-form-item label="头像URL">
                <el-input v-model="settingsForm.avatar" placeholder="请输入头像URL" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

        </el-col>
      </el-row>
    </el-main>

    <!-- 编辑个人信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑个人信息" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input
            v-model="editForm.signature"
            type="textarea"
            :rows="3"
            placeholder="请输入个性签名"
          />
        </el-form-item>
        <!-- <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar" placeholder="请输入头像URL" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加关注对话框 -->
    <el-dialog v-model="followDialogVisible" title="添加关注" width="500px">
      <el-form :model="followForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="followForm.username" placeholder="请输入要关注的用户名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFollow">关注</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  Document, 
  UserFilled, 
  User, 
  Setting,
  Plus,
  Picture,
  View,
  Star
} from '@element-plus/icons-vue'
import request from '@/utils/request'

interface UserInfo {
  userName: string
  avatar: string
  signature: string
  followers: any[]
  followings: any[]
}

interface FollowUser {
  id: string
  username: string
  avatar: string
  bio: string
}
const route = useRoute();
const router = useRouter()
const activeTab = ref('posts')
const userInfo = ref<UserInfo>({
  userName: '',
  avatar: '',
  signature: '',
  followers: [],
  followings: []
})

const myPosts = ref<any>([])
const myGoods = ref<any>([])
const followingList = ref<FollowUser[]>([])
const followersList = ref<FollowUser[]>([])

const editDialogVisible = ref(false)
const followDialogVisible = ref(false)

const editForm = ref({
  username: '',
  signature: '',
  avatar: ''
})

const settingsForm = ref({
  username: '',
  signature: '',
  avatar: ''
})

const followForm = ref({
  username: ''
})

const id = ref(route.params.id || localStorage.getItem('userId'));
const isSelf = computed(() => {
  const userId = localStorage.getItem('userId');
  return userId === id.value;
})
const isFollowing = computed(() => {
  return userInfo.value.followers.some((follower: any) => follower.id == localStorage.getItem('userId'));
})
// 加载用户信息
const loadUserInfo = async () => {
  try {
    id.value = route.params.id || localStorage.getItem('userId')
    const res: any = await request.get(`/user/userInfo/${id.value}`);
    if(res.code === 200) {
      console.log('getuser res', res);
      userInfo.value.userName = res.data.userName;
      userInfo.value.signature = res.data.signature;
      userInfo.value.followers = res.data.followers;
      userInfo.value.followings = res.data.followings;

      myPosts.value = res.data.posts;
      followingList.value = res.data.followings;
      followersList.value = res.data.followers;
      

      // 设置编辑对话框中用户名的默认值
      editForm.value.username = res.data.userName;
    } else {
      ElMessage.error('获取用户信息失败,请稍后重试');
    }
  } catch {
    ElMessage.error('获取用户信息失败，系统错误，请稍后重试');
  }
}

const loadMyGoods = async () => {
  try {
    const res: any = await request.get(`/mall/exchangeRecords`);
    console.log('get goods res', res);
    myGoods.value = res.list;
  } catch (error){
    ElMessage.error('获取用户兑换记录失败,请稍后重试');
    console.log("get goods error", error);
  }
}

const handleMenuSelect = (index: string) => {
  activeTab.value = index
}

const showEditDialog = () => {
  editDialogVisible.value = true
}

const saveEdit = async () => {
  const updatedInfo = {
    signature: editForm.value.signature,
    // avatar: editForm.value.avatar
  }

  try {
    const res: any = await request.post('/user/profile', updatedInfo);
    if(res.code === 200) {
      ElMessage.success('保存成功');
      loadUserInfo();
    } else {
      ElMessage.error('保存失败,请稍后重试');
    }
  } catch(err) {
    ElMessage.error('保存失败,请稍后重试');
  } finally {
    editDialogVisible.value = false
  }
}

const saveSettings = () => {
  const updatedInfo = {
    ...userInfo.value,
    signature: settingsForm.value.signature,
    avatar: settingsForm.value.avatar
  }

  localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
  userInfo.value = updatedInfo

  ElMessage.success('保存成功')
}

const viewPost = (id: string) => {
  router.push(`/community/post/${id}`)
}

const deletePost = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这条帖子吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]')
      const filtered = allPosts.filter((post: any) => post.id !== id)
      localStorage.setItem('communityPosts', JSON.stringify(filtered))
      // loadMyPosts()
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 用户取消操作
    })
}

const showFollowDialog = () => {
  followDialogVisible.value = true
}

const handleFollow = () => {
  if (!followForm.value.username) {
    ElMessage.warning('请输入用户名')
    return
  }

  const newUser: FollowUser = {
    id: Date.now().toString(),
    username: followForm.value.username,
    avatar: '',
    bio: ''
  }

  followingList.value.unshift(newUser)
  localStorage.setItem('following', JSON.stringify(followingList.value))

  ElMessage.success('关注成功')
  followDialogVisible.value = false
  followForm.value.username = ''
}

// 取消关注方法 
const unfollow = (id: string) => {
  ElMessageBox.confirm(
    '确定要取消关注吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const res: any = await request.post(`/user/follow`,{
          targetUserId: id,
          action: 'unfollow',
        })
        if(res.code === 200) {
          console.log('follow res', res);
          loadUserInfo();
        } else {
          ElMessage.error('取消失败');
          console.log('Error', res.message);
        }

      } catch(error) {
        ElMessage.error('取消失败');
        console.log('Error', error);
      } 
    })
    .catch(() => {
      // 用户取消操作
    })
}
// 关注方法
const followUser = async() => {
  const action = isFollowing.value ? 'unfollow' : 'follow';
  try {
    const res: any = await request.post(`/user/follow`,{
      targetUserId: id.value,
      action,
    })
    if(res.code === 200) {
      console.log('follow res', res);
      loadUserInfo();
      action === 'follow' ? ElMessage.success('关注成功') : ElMessage.success('取消关注成功');
    } else {
      ElMessage.error('关注失败');
      console.log('Error', res.message);
    }
    
  } catch(error) {
    ElMessage.error('关注失败');
    console.log('Error', error);
  } finally {

  }
}

onMounted(() => {
  loadUserInfo()
  loadMyGoods()
})
const goHome = () => {
  router.push('/');
}
const goOther = (id: string) => {
  activeTab.value = 'posts';
  router.push(`/profile/${id}`);
}
watch(
  () => route.params.id, // 监听id参数
  (newId, oldId) => {
    if (newId !== oldId) { // 避免初始加载重复请求
      loadUserInfo();
    }
  },
  { immediate: false } // 关闭立即执行（onMounted已执行）
);
function formatUploadTime(isoTime: any): string {
  const date = new Date(isoTime);
  // 转换为本地时间，补零处理
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 返回格式：YYYY-MM-DD HH:mm:ss
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>

<style scoped>
.profile-container {
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

.user-card,
.menu-card {
  margin-bottom: 20px;
}

.user-info {
  text-align: center;
  padding: 20px 0 0;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar-wrapper .el-button {
  position: absolute;
  bottom: 0;
  right: 0;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.user-bio {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.menu-card :deep(.el-menu) {
  border: none;
}

.menu-card :deep(.el-menu-item) {
  margin-bottom: 4px;
  border-radius: 4px;
}

.content-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.post-list,
.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item,
.user-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  align-items: flex-start;
}

.post-cover {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  color: #909399;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
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

  .post-item,
  .user-item {
    flex-direction: column;
  }

  .post-cover {
    width: 100%;
    height: 200px;
  }

  .post-actions {
    flex-direction: row;
    width: 100%;
  }
}
</style>
