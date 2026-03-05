<template>
  <div class="dialect-list-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>方言资源库</h1>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加方言
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="dialect in dialectList" :key="dialect.id">
          <el-card class="dialect-card" @click="viewDetail(dialect.id)">
            <template #header>
              <div class="card-header">
                <span class="dialect-name">{{ dialect.name }}</span>
                <el-tag :type="getTagType(dialect.region)" size="small">{{ dialect.region }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <p class="dialect-desc">{{ dialect.description }}</p>
              <div class="card-footer">
                <span class="resource-count">
                  <el-icon><Document /></el-icon>
                  {{ dialect.resourceCount }} 个资源
                </span>
                <el-button type="primary" link>
                  查看详情
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 添加方言对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加方言" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="方言名称">
          <el-input v-model="addForm.name" placeholder="请输入方言名称" />
        </el-form-item>
        <el-form-item label="所属地区">
          <el-select v-model="addForm.region" placeholder="请选择地区">
            <el-option label="华北" value="华北" />
            <el-option label="华东" value="华东" />
            <el-option label="华南" value="华南" />
            <el-option label="华中" value="华中" />
            <el-option label="西北" value="西北" />
            <el-option label="西南" value="西南" />
            <el-option label="东北" value="东北" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入方言描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Document, ArrowRight } from '@element-plus/icons-vue'

interface Dialect {
  id: string
  name: string
  region: string
  description: string
  resourceCount: number
}

const router = useRouter()
const dialectList = ref<Dialect[]>([])
const addDialogVisible = ref(false)
const addForm = ref({
  name: '',
  region: '',
  description: ''
})

// 从localStorage加载方言列表
const loadDialectList = () => {
  const stored = localStorage.getItem('dialectList')
  if (stored) {
    dialectList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    dialectList.value = [
      {
        id: '1',
        name: '北京话',
        region: '华北',
        description: '北京话是北京地区的方言，属于官话方言系统，是现代汉语标准语的基础方言。',
        resourceCount: 15
      },
      {
        id: '2',
        name: '上海话',
        region: '华东',
        description: '上海话是吴语的一种，主要流行于上海地区，是吴语太湖片苏沪嘉小片的代表方言。',
        resourceCount: 12
      },
      {
        id: '3',
        name: '广东话',
        region: '华南',
        description: '广东话即粤语，是汉语七大方言之一，主要流行于广东、广西、香港、澳门等地。',
        resourceCount: 20
      },
      {
        id: '4',
        name: '四川话',
        region: '西南',
        description: '四川话是流行于四川省、重庆市及周边地区的方言，属于西南官话系统。',
        resourceCount: 18
      }
    ]
    localStorage.setItem('dialectList', JSON.stringify(dialectList.value))
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

const viewDetail = (id: string) => {
  router.push(`/dialect/${id}`)
}

const showAddDialog = () => {
  addForm.value = {
    name: '',
    region: '',
    description: ''
  }
  addDialogVisible.value = true
}

const handleAdd = () => {
  if (!addForm.value.name || !addForm.value.region) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const newDialect: Dialect = {
    id: Date.now().toString(),
    name: addForm.value.name,
    region: addForm.value.region,
    description: addForm.value.description,
    resourceCount: 0
  }

  dialectList.value.unshift(newDialect)
  localStorage.setItem('dialectList', JSON.stringify(dialectList.value))

  ElMessage.success('添加成功')
  addDialogVisible.value = false
}

onMounted(() => {
  loadDialectList()
})
</script>

<style scoped>
.dialect-list-container {
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

.dialect-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.dialect-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialect-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  padding: 10px 0;
}

.dialect-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
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
}
</style>
