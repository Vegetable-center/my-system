<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="card-header">
          <h2>登录</h2>
        </div>
      </template>

      <el-form 
        ref="loginFormRef"
        :model="loginForm" 
        :rules="loginRules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            class="auth-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import  request  from '../utils/request';

const router = useRouter()
const loginFormRef = ref<any>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return

  loginFormRef.value.validate(async (valid: any) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        if(res.code === 200) {
          console.log('login res', res);

          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userId', res.data.userId);
          ElMessage.success('登录成功');
          router.push('/')
        } else {
          ElMessage.error('系统错误',res.msg)
        }
      } catch (error) {
        ElMessage.error('系统错误，请稍后重试');
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.error('请填写正确的登录信息')
      return false
    }
  })
}

function login(data: any) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.auth-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  margin-top: 10px;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
}

.auth-footer a:hover {
  text-decoration: underline;
}

:deep(.el-card__header) {
  padding: 25px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 30px 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
