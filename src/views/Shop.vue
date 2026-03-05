<template>
  <div class="shop-container">
    <el-header class="page-header">
      <div class="header-content">
        <h1>积分商城</h1>
        <div class="coins-display">
          <el-icon :size="24" color="#E6A23C"><Coin /></el-icon>
          <span class="coins-value">{{ totalCoins }}</span>
        </div>
      </div>
    </el-header>

    <el-main class="page-main">
      <div class="category-bar">
        <el-scrollbar>
          <div class="category-list">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              :class="{ active: currentCategory === category.id }"
              @click="changeCategory(category.id)"
            >
              <el-icon :size="20">
                <component :is="category.icon" />
              </el-icon>
              <span>{{ category.name }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <el-row :gutter="20" class="product-list">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="product in filteredProducts" :key="product.id">
          <el-card class="product-card">
            <div class="product-cover">
              <el-image :src="product.cover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="product-content">
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-footer">
                <div class="price">
                  <el-icon :size="16" color="#E6A23C"><Coin /></el-icon>
                  <span class="value">{{ product.price }}</span>
                </div>
                <el-button 
                  type="primary" 
                  size="small"
                  @click="handleExchange(product)"
                  :disabled="totalCoins < product.price"
                >
                  {{ totalCoins >= product.price ? '立即兑换' : '积分不足' }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="filteredProducts.length === 0" description="暂无商品" />
    </el-main>

    <!-- 兑换确认对话框 -->
    <el-dialog v-model="exchangeDialogVisible" title="确认兑换" width="500px">
      <div class="exchange-content">
        <el-image :src="selectedProduct?.cover" fit="cover" class="product-preview">
          <template #error>
            <div class="image-slot">
              <el-icon :size="60"><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="product-info">
          <h3>{{ selectedProduct?.title }}</h3>
          <p>{{ selectedProduct?.description }}</p>
          <div class="exchange-price">
            <el-icon :size="20" color="#E6A23C"><Coin /></el-icon>
            <span>{{ selectedProduct?.price }} 积分</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="exchangeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExchange">确认兑换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Coin, 
  Picture,
  Goods,
  Ticket,
  Present,
  Reading
} from '@element-plus/icons-vue'

interface Product {
  id: string
  title: string
  description: string
  price: number
  cover: string
  category: string
  stock: number
}

interface Category {
  id: string
  name: string
  icon: any
}

const router = useRouter()
const totalCoins = ref(0)
const currentCategory = ref('all')
const productList = ref<Product[]>([])
const exchangeDialogVisible = ref(false)
const selectedProduct = ref<Product | null>(null)

const categories = ref<Category[]>([
  { id: 'all', name: '全部', icon: Goods },
  { id: 'course', name: '课程', icon: Reading },
  { id: 'coupon', name: '优惠券', icon: Ticket },
  { id: 'gift', name: '礼品', icon: Present }
])

// 根据分类过滤商品
const filteredProducts = computed(() => {
  if (currentCategory.value === 'all') {
    return productList.value
  }
  return productList.value.filter(p => p.category === currentCategory.value)
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
        price: 500,
        cover: '',
        category: 'coupon',
        stock: 100
      },
      {
        id: '2',
        title: '线下课程体验券',
        description: '可用于兑换线下课程体验资格',
        price: 800,
        cover: '',
        category: 'coupon',
        stock: 50
      },
      {
        id: '3',
        title: '方言学习资料包',
        description: '包含多种方言的学习资料',
        price: 300,
        cover: '',
        category: 'gift',
        stock: 200
      },
      {
        id: '4',
        title: '定制方言学习计划',
        description: '专业老师为您定制学习计划',
        price: 1000,
        cover: '',
        category: 'course',
        stock: 20
      },
      {
        id: '5',
        title: '方言文化书籍',
        description: '精选方言文化相关书籍',
        price: 400,
        cover: '',
        category: 'gift',
        stock: 150
      },
      {
        id: '6',
        title: '一对一辅导课时',
        description: '专业老师一对一辅导',
        price: 1500,
        cover: '',
        category: 'course',
        stock: 30
      }
    ]
    localStorage.setItem('shopProducts', JSON.stringify(productList.value))
  }
}

// 加载用户积分
const loadUserCoins = () => {
  totalCoins.value = parseInt(localStorage.getItem('totalCoins') || '0')
}

// 切换分类
const changeCategory = (categoryId: string) => {
  currentCategory.value = categoryId
}

// 兑换商品
const handleExchange = (product: Product) => {
  if (totalCoins.value < product.price) {
    ElMessage.warning('积分不足')
    return
  }

  selectedProduct.value = product
  exchangeDialogVisible.value = true
}

// 确认兑换
const confirmExchange = () => {
  if (!selectedProduct.value) return

  // 扣除积分
  totalCoins.value -= selectedProduct.value.price
  localStorage.setItem('totalCoins', String(totalCoins.value))

  // 添加兑换记录
  const exchangeRecords = JSON.parse(localStorage.getItem('exchangeRecords') || '[]')
  exchangeRecords.unshift({
    id: Date.now().toString(),
    productId: selectedProduct.value.id,
    productName: selectedProduct.value.title,
    price: selectedProduct.value.price,
    time: new Date().toLocaleString()
  })
  localStorage.setItem('exchangeRecords', JSON.stringify(exchangeRecords))

  // 更新商品库存
  const productIndex = productList.value.findIndex(p => p.id === selectedProduct.value?.id)
  if (productIndex > -1) {
    productList.value[productIndex].stock--
    localStorage.setItem('shopProducts', JSON.stringify(productList.value))
  }

  ElMessage.success('兑换成功！')
  exchangeDialogVisible.value = false
}

onMounted(() => {
  loadUserCoins()
  loadProducts()
})
</script>

<style scoped>
.shop-container {
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

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
}

.coins-value {
  font-size: 18px;
  font-weight: 600;
}

.page-main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.category-bar {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-list {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  font-size: 14px;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.product-list {
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-cover {
  width: 100%;
  padding-top: 100%; /* 1:1 比例 */
  position: relative;
  overflow: hidden;
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

.product-content {
  padding: 16px 0;
}

.product-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price .value {
  color: #E6A23C;
  font-size: 18px;
  font-weight: 600;
}

.exchange-content {
  display: flex;
  gap: 20px;
}

.product-preview {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #303133;
}

.product-info p {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
}

.exchange-price {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #E6A23C;
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

  .exchange-content {
    flex-direction: column;
  }

  .product-preview {
    width: 100%;
  }
}
</style>
