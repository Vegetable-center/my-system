<template>
  <div class="dialect-detail-container">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="dialect-title">{{ dialectInfo.name }}</span>
          <el-tag :type="getTagType(dialectInfo.region)" size="large">{{ dialectInfo.region }}</el-tag>
        </div>
      </template>
    </el-page-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>方言简介</span>
              </div>
            </template>
            <div class="card-content">
              <p>{{ dialectInfo.description }}</p>
              <el-divider />
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">使用人数：</span>
                  <span class="value">{{ '约 ' + dialectInfo.userNumber || '约 ' + Math.floor(Math.random() * 5000 + 1000) + ' 万' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">分布区域：</span>
                  <span class="value">{{ dialectInfo.distribution || dialectInfo.region }}</span>
                </div>
                <div class="info-item">
                  <span class="label">语言系属：</span>
                  <span class="value">{{ dialectInfo.languageFamily || '汉藏语系' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">资源数量：</span>
                  <span class="value">{{ dialectInfo.resourceCount }} 个</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="resource-card">
            <template #header>
              <div class="card-header">
                <span>方言资源</span>
                <el-button type="primary" size="small" @click="showAddResourceDialog">
                  <el-icon><Plus /></el-icon>
                  添加资源
                </el-button>
              </div>
            </template>
            <div class="resource-list">
              <div v-for="resource in resourceList" :key="resource.id" class="resource-item">
                <div class="resource-icon">
                  <el-icon :size="32" :color="getResourceIconColor('文档')">
                    <component :is="getResourceIcon('文档')" />
                  </el-icon>
                </div>
                <div class="resource-info">
                  <h4 class="resource-title">{{ resource.name }}</h4>
                  <div class="resource-meta">
                    <el-tag size="small" :type="getResourceTagType('文档')">文档</el-tag>
                    <span class="resource-date">{{ formatUploadTime(resource.uploadTime) || '1025-01-21' }}</span>
                  </div>
                </div>
                <div class="resource-action">
                  <el-button type="primary" link @click="viewResource(resource)">
                    查看
                  </el-button>
                </div>
              </div>
              <el-empty v-if="resourceList.length === 0" description="暂无资源" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <span>统计信息</span>
              </div>
            </template>
            <div class="stats-content">
              <div class="stat-item">
                <div class="stat-value">{{ dialectInfo.resourceCount }}</div>
                <div class="stat-label">资源总数</div>
              </div>
              <!-- <el-divider />
              <div class="stat-item">
                <div class="stat-value">{{ resourceList.filter(r => r.type === '音频').length }}</div>
                <div class="stat-label">音频资源</div>
              </div>
              <el-divider />
              <div class="stat-item">
                <div class="stat-value">{{ resourceList.filter(r => r.type === '视频').length }}</div>
                <div class="stat-label">视频资源</div>
              </div> -->
              <el-divider />
              <div class="stat-item">
                <div class="stat-value">{{ dialectInfo.resourceCount }}</div>
                <div class="stat-label">文档资源</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 添加资源对话框 -->
    <el-dialog v-model="addResourceDialogVisible" title="添加资源" width="500px">
      <el-form :model="addResourceForm" label-width="100px">
        <el-form-item label="资源类型">
          <el-select v-model="addResourceForm.sourceType" placeholder="请选择资源类型">
            <el-option label="音频" value="音频" />
            <el-option label="视频" value="视频" />
            <el-option label="文档" value="文档" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档上传">
          <el-upload
            ref="uploadRef"
            class="upload-document"
            :headers="uploadHeaders"
            method="post"
            drag
            :action="`/api/dialect/${dialectId}/upload`"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            name="document"
            :auto-upload="false"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件上传或者 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                jpg文件上传要小于650kb
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addResourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddResource">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看资源对话框 -->
    <el-dialog v-model="viewResourceDialogVisible" :title="currentResource?.name" width="600px">
      <div class="resource-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="资源类型">文档</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatUploadTime(currentResource?.uploadTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="资源描述">无</el-descriptions-item>
        </el-descriptions>
        <div class="resource-preview" v-if="currentResource">
          <el-icon :size="64" :color="getResourceIconColor('文档')">
            <component :is="getResourceIcon('文档')" />
          </el-icon>
          <p>资源预览功能开发中...</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElUpload } from 'element-plus'
import { Plus, VideoPlay, Headset, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'

interface Dialect {
  id: string
  name: string
  region: string
  description: string
  resourceCount: number
  userNumber?: string
  distribution?: string
  languageFamily?: string
}

interface Resource {
  id: string
  name: string,
  uploadTime: string,
}

const route = useRoute()
const router = useRouter()
const dialectId = computed(() => route.params.id as string)

const dialectInfo = ref<Dialect>({
  id: '',
  name: '',
  userNumber: '',
  languageFamily: '',
  region: '',
  description: '',
  resourceCount: 0
})

const resourceList = ref<Resource[]>([])
const addResourceDialogVisible = ref(false)
const viewResourceDialogVisible = ref(false)
const currentResource = ref<Resource | null>(null)


// 3. 上传请求头（携带 JWT Token）
const uploadHeaders = ref({
  Authorization: `Bearer ${localStorage.getItem('token')}` // 和之前的 Token 逻辑一致
});

// 5. 上传成功回调
const handleUploadSuccess = (res: any) => {
  ElMessage.success('方言信息和文档上传成功');
  console.log('res', res)
  resourceList.value = res.data.documents;
};

// 6. 上传失败回调
const handleUploadError = (error: any) => {
  ElMessage.error('上传失败，请重试');
  console.error('上传错误：', error);
};

const addResourceForm = ref({
  sourceType: '文档',
})

// 加载方言详情
const loadDialectDetail = async () => {
  const { data: dialectList } = await request.get('/dialect/list');
  const dialect = dialectList.find((d: Dialect) => d.id == dialectId.value)

  console.log(dialectList)


  if (dialect) {
    dialectInfo.value = dialect
    resourceList.value = dialect.documents
  } else {
    ElMessage.error('未找到该方言信息')
    // router.push('/dialect/list')
  }
}

const getTagType = (region: string) => {
  const typeMap: Record<string, any> = {
    '华北': 'danger',
    '华东': 'success',
    '华南': 'warning',
    '华中': 'info',
    '西北': '',
    '西南': 'primary',
    '东北': 'success'
  }
  return typeMap[region] || ''
}

const getResourceIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    '音频': Headset,
    '视频': VideoPlay,
    '文档': Document
  }
  return iconMap[type] || Document
}

const getResourceIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '音频': '#67C23A',
    '视频': '#409EFF',
    '文档': '#909399'
  }
  return colorMap[type] || '#909399'
}

const getResourceTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    '音频': 'success',
    '视频': 'primary',
    '文档': 'info'
  }
  return typeMap[type] || 'info'
}

const goBack = () => {
  router.push('/dialect/list')
}

const showAddResourceDialog = () => {
  addResourceForm.value = {
    sourceType: '文档',
  }
  addResourceDialogVisible.value = true
}

const uploadRef = ref<any>(null);

const handleAddResource = () => {
  if (!addResourceForm.value.sourceType) {
    ElMessage.warning('请填写完整信息')
    return
  }

  uploadRef.value!.submit()
  ElMessage.success('添加成功')

  addResourceDialogVisible.value = false
}

const viewResource = (resource: Resource) => {
  currentResource.value = resource
  viewResourceDialogVisible.value = true
}

onMounted(() => {
  loadDialectDetail()
})

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
.dialect-detail-container {
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

.dialect-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.page-main {
  padding: 24px;
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

.info-card,
.resource-card,
.stats-card {
  margin-bottom: 20px;
}

.card-content p {
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item .label {
  color: #909399;
  font-size: 14px;
}

.info-item .value {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.resource-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

.resource-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 8px;
}

.resource-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-title {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.resource-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.resource-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-date {
  color: #909399;
  font-size: 13px;
}

.resource-action {
  display: flex;
  align-items: center;
}

.stats-content {
  padding: 10px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.resource-detail {
  padding: 20px 0;
}

.resource-preview {
  margin-top: 20px;
  padding: 40px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 8px;
}

.resource-preview p {
  margin-top: 16px;
  color: #909399;
}

@media (max-width: 768px) {
  .page-main {
    padding: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .resource-item {
    flex-direction: column;
  }

  .resource-icon {
    width: 100%;
  }
}
</style>
