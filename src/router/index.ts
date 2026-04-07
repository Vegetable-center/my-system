import { createRouter, createWebHistory, } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dialect',
    name: 'Dialect',
    redirect: '/dialect/list',
    meta: { requiresAuth: true }
  },
  {
    path: '/dialect/list',
    name: 'DialectList',
    component: () => import('@/views/DialectList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dialect/:id',
    name: 'DialectDetail',
    component: () => import('@/views/DialectDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/course',
    name: 'Course',
    redirect: '/course/list',
    meta: { requiresAuth: true }
  },
  {
    path: '/course/list',
    name: 'CourseList',
    component: () => import('@/views/CourseList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/course/:id',
    name: 'CourseDetail',
    component: () => import('@/views/CourseDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/course/manage',
    name: 'CourseManage',
    component: () => import('@/views/CourseManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/course/create',
    name: 'CourseEdit',
    component: () => import('@/views/CourseEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/course/online/create',
    name: 'OnlineCourseCreate',
    component: () => import('@/views/OnlineCourseEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    redirect: '/community/list',
    meta: { requiresAuth: true }
  },
  {
    path: '/community/list',
    name: 'CommunityList',
    component: () => import('@/views/CommunityList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community/post/:id',
    name: 'CommunityDetail',
    component: () => import('@/views/CommunityDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'ProfileSelf',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'ProfileOther',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/message',
    name: 'Message',
    redirect: '/message/list',
    meta: { requiresAuth: true }
  },
  {
    path: '/message/list',
    name: 'MessageList',
    component: () => import('@/views/MessageList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkin',
    name: 'CheckIn',
    redirect: '/checkin/main',
    meta: { requiresAuth: true }
  },
  {
    path: '/checkin/main',
    name: 'CheckInMain',
    component: () => import('@/views/CheckIn.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkin/shop',
    name: 'Shop',
    component: () => import('@/views/Shop.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkin/rank',
    name: 'Rank',
    component: () => import('@/views/Rank.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'CreatePost',
    component: () => import('@/views/CreatePost.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-posts',
    name: 'MyPosts',
    component: () => import('@/views/MyPosts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminHome',
    component: () => import('@/views/AdminHome.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/course-manage',
    name: 'AdminCourseManage',
    component: () => import('@/views/AdminCourseManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/post-manage',
    name: 'AdminPostManage',
    component: () => import('@/views/AdminPostManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/announce-manage',
    name: 'AdminAnnounceManage',
    component: () => import('@/views/AdminAnnounceManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/shop-manage',
    name: 'AdminShopManage',
    component: () => import('@/views/AdminShopManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user-manage',
    name: 'AdminUserManage',
    component: () => import('@/views/AdminUserManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/video-player/:courseId/:id',
    name: 'VideoPlayer',
    component: () => import('@/views/VideoPlayer.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  const token = localStorage.getItem('token')
  // const userInfo = localStorage.getItem('userInfo')
  const isAuthenticated = token

  // 需要登录的页面但未登录，跳转到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // 已登录用户访问登录/注册页，跳转到首页
  else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/')
  } 
  // 其他情况正常访问
  else {
    next()
  }
})

export default router
