<template>
  <div class="admin-shop-manage-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>商店管理</h1>
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterCategory" placeholder="商品分类" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="课程" value="course" />
          <el-option label="优惠券" value="coupon" />
          <el-option label="礼品" value="gift" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="上架状态" clearable @change="handleFilter">
          <el-option label="全部" value="" />
          <el-option label="已上架" value="online" />
          <el-option label="已下架" value="offline" />
        </el-select>
      </div>

      <div class="product-list">
        <el-card v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-cover" @click="viewProduct(product)">
            <el-image :src="product.cover" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon :size="40"><Goods /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="product-status" :class="'status-' + product.status">
              {{ product.status === 'online' ? '已上架' : '已下架' }}
            </div>
          </div>
          <div class="product-content">
            <h3 class="product-title" @click="viewProduct(product)">{{ product.title }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-meta">
              <div class="meta-item">
                <el-icon><Coin /></el-icon>
                <span class="price">{{ product.price }} 积分</span>
              </div>
              <div class="meta-item">
                <el-icon><ShoppingCart /></el-icon>
                <span>库存: {{ product.stock }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>已兑换: {{ product.sold || 0 }}</span>
              </div>
            </div>
            <div class="product-tags">
              <el-tag 
                v-for="tag in product.tags" 
                :key="tag" 
                size="small"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="product-actions">
              <el-button 
                v-if="product.status === 'offline'"
                type="success" 
                @click="onlineProduct(product)"
              >
                <el-icon><Top /></el-icon>
                上架
              </el-button>
              <el-button 
                v-if="product.status === 'online'"
                type="warning" 
                @click="offlineProduct(product)"
              >
                <el-icon><Bottom /></el-icon>
                下架
              </el-button>
              <el-button 
                type="primary" 
                link
                @click="editProduct(product)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                type="danger" 
                link
                @click="deleteProduct(product.id)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
        <el-empty v-if="filteredProducts.length === 0" description="暂无商品" />
      </div>
    </el-main>

    <!-- 创建/编辑商品对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="600px">
      <el-form :model="productForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input 
            v-model="productForm.title" 
            placeholder="请输入商品名称" 
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="productForm.category" placeholder="请选择分类">
            <el-option label="课程" value="course" />
            <el-option label="优惠券" value="coupon" />
            <el-option label="礼品" value="gift" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品封面">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            accept="image/*"
          >
            <img v-if="productForm.cover" :src="productForm.cover" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number 
            v-model="productForm.price" 
            :min="0" 
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number 
            v-model="productForm.stock" 
            :min="0" 
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="商品标签">
          <div class="tags-input">
            <el-tag
              v-for="tag in productForm.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="inputRef"
              v-model="inputValue"
              class="tag-input"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
              + 新标签
            </el-button>
          </div>
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search,
  Goods,
  Coin,
  ShoppingCart,
  User,
  Top,
  Bottom,
  Edit,
  Delete,
  Plus
} from '@element-plus/icons-vue'

interface Product {
  id: string
  title: string
  description: string
  cover: string
  category: string
  price: number
  stock: number
  sold?: number
  status: 'online' | 'offline'
  tags: string[]
}

const router = useRouter()
const productList = ref<Product[]>([])
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

const productForm = ref({
  id: '',
  title: '',
  category: '',
  cover: '',
  description: '',
  price: 0,
  stock: 100,
  tags: [] as string[]
})

// 根据搜索和筛选条件过滤商品
const filteredProducts = computed(() => {
  let result = productList.value

  if (searchKeyword.value) {
    result = result.filter(product => 
      product.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (filterCategory.value) {
    result = result.filter(product => product.category === filterCategory.value)
  }

  if (filterStatus.value) {
    result = result.filter(product => product.status === filterStatus.value)
  }

  return result
})

// 加载商品列表
const loadProducts = () => {
  const stored = localStorage.getItem('shopProducts')
  if (stored) {
    productList.value = JSON.parse(stored)
  } else {
    // 初始化示例数据
    productList.value = [
      {
        id: '1',
        title: '方言学习课程优惠券',
        description: '可用于兑换任意方言学习课程',
        cover: '',
        category: 'coupon',
        price: 500,
        stock: 100,
        status: 'online',
        tags: ['优惠券', '课程']
      },
      {
        id: '2',
        title: '线下课程体验券',
        description: '可用于兑换线下课程体验资格',
        cover: '',
        category: 'coupon',
        price: 800,
        stock: 50,
        status: 'online',
        tags: ['优惠券', '线下']
      },
      {
        id: '3',
        title: '方言学习资料包',
        description: '包含多种方言的学习资料',
        cover: '',
        category: 'gift',
        price: 300,
        stock: 200,
        status: 'online',
        tags: ['资料', '学习']
      }
    ]
    localStorage.setItem('shopProducts', JSON.stringify(productList.value))
  }
}

// 搜索
const handleSearch = () => {
  // 过滤逻辑由computed自动处理
}

// 筛选
const handleFilter = () => {
  // 过滤逻辑由computed自动处理
}

// 查看商品
const viewProduct = (product: Product) => {
  // 跳转到商品详情页（暂未实现）
  console.log('查看商品:', product)
}

// 上架商品
const onlineProduct = (product: Product) => {
  ElMessageBox.confirm(
    '确定要上架该商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      const index = productList.value.findIndex(p => p.id === product.id)
      if (index > -1) {
        productList.value[index].status = 'online'
        localStorage.setItem('shopProducts', JSON.stringify(productList.value))
        ElMessage.success('商品已上架')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 下架商品
const offlineProduct = (product: Product) => {
  ElMessageBox.confirm(
    '确定要下架该商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = productList.value.findIndex(p => p.id === product.id)
      if (index > -1) {
        productList.value[index].status = 'offline'
        localStorage.setItem('shopProducts', JSON.stringify(productList.value))
        ElMessage.success('商品已下架')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 编辑商品
const editProduct = (product: Product) => {
  isEdit.value = true
  productForm.value = {
    id: product.id,
    title: product.title,
    category: product.category,
    cover: product.cover,
    description: product.description,
    price: product.price,
    stock: product.stock,
    tags: [...product.tags]
  }
  dialogVisible.value = true
}

// 删除商品
const deleteProduct = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除该商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = productList.value.findIndex(p => p.id === id)
      if (index > -1) {
        productList.value.splice(index, 1)
        localStorage.setItem('shopProducts', JSON.stringify(productList.value))
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  productForm.value = {
    id: '',
    title: '',
    category: '',
    cover: '',
    description: '',
    price: 0,
    stock: 100,
    tags: []
  }
  dialogVisible.value = true
}

// 封面上传成功
const handleCoverSuccess = (response: any) => {
  productForm.value.cover = response.url
  ElMessage.success('封面上传成功')
}

// 封面上传前验证
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 显示标签输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}

// 确认添加标签
const handleInputConfirm = () => {
  if (inputValue.value) {
    if (productForm.value.tags.length >= 5) {
      ElMessage.warning('最多添加5个标签')
      return
    }
    if (productForm.value.tags.includes(inputValue.value)) {
      ElMessage.warning('标签已存在')
      return
    }
    productForm.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 移除标签
const removeTag = (tag: string) => {
  const index = productForm.value.tags.indexOf(tag)
  if (index > -1) {
    productForm.value.tags.splice(index, 1)
  }
}

// 处理提交
const handleSubmit = () => {
  if (!productForm.value.title || !productForm.value.category || !productForm.value.description) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const product: Product = {
    id: isEdit.value ? productForm.value.id : Date.now().toString(),
    title: productForm.value.title,
    description: productForm.value.description,
    cover: productForm.value.cover,
    category: productForm.value.category,
    price: productForm.value.price,
    stock: productForm.value.stock,
    status: 'online' as const,
    tags: productForm.value.tags
  }

  if (isEdit.value) {
    const index = productList.value.findIndex(p => p.id === product.id)
    if (index > -1) {
      productList.value[index] = product
    }
  } else {
    productList.value.unshift(product)
  }

  localStorage.setItem('shopProducts', JSON.stringify(productList.value))
  dialogVisible.value = false
  ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-shop-manage-container {
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar > * {
  flex: 1;
  min-width: 200px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  overflow: hidden;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  cursor: pointer;
}

.product-cover :deep(.el-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.product-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.status-online {
  background: #67C23A;
}

.status-offline {
  background: #909399;
}

.product-content {
  padding: 16px;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-title:hover {
  color: #409EFF;
}

.product-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.meta-item .price {
  color: #E6A23C;
  font-size: 16px;
  font-weight: 600;
}

.product-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag-item {
  margin-right: 0;
}

.product-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.cover-image {
  width: 200px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-input {
  width: 90px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 4px;
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

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar > * {
    width: 100%;
  }

  .product-list {
    grid-template-columns: 1fr;
  }
}
</style>
