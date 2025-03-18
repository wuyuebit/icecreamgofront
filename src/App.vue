<template>
  <el-container>
    <el-header>
      <!-- 顶部Logo和导航 -->
      <div class="logo">
        <img src="./assets/logo.png" alt="围棋Logo">
        <span>Web围棋</span>
      </div>
      <!-- 简化的顶部导航 -->
      <el-menu mode="horizontal" :ellipsis="false">
        <el-menu-item index="1">对弈</el-menu-item>
        <el-menu-item index="2">研究</el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <!-- 左侧菜单 -->
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
        >
          <el-menu-item index="1">
            <el-icon><i class="el-icon-s-grid"></i></el-icon>
            <span>对弈</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><i class="el-icon-s-data"></i></el-icon>
            <span>研究</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><i class="el-icon-video-camera"></i></el-icon>
            <span>直播</span>
          </el-menu-item>
           <!--省略的其他选项-->
          <el-sub-menu index="4">
             <template #title>
                <el-icon><setting /></el-icon>
                <span>设置</span>
              </template>
          </el-sub-menu>
          <el-menu-item index="5">
            <el-icon><user /></el-icon>
            <span>登录/注册</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 主要内容区域，根据路由显示不同内容 -->
        <router-view></router-view>
      </el-main>
    </el-container>
    <el-footer>
      <!-- 底部版权信息 -->
      © 2024 Web围棋
    </el-footer>
  </el-container>
</template>

<script>
import { Setting, User, } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'App',
components: {
    Setting,
    User,
  },
  setup() {
    const router = useRouter()
    const handleMenuSelect = (index) => {
      console.log(`Menu selected: ${index}`);
      // 根据菜单项跳转到不同路由
      switch (index) {
        case '1':
          router.push('/'); // 首页/游戏大厅
          break;
        case '2':
          // 示例：跳转到研究页面（如果存在）
          ElMessage.warning("功能开发中")
          //router.push('/research');
          break;
        case '5':
          router.push('/login'); // 登录页面
          break;
        // ...其他路由
        default:
          ElMessage.warning("功能开发中")
      }
    };
    
    return{
        handleMenuSelect
    }
  }
}
</script>
<style scoped>
/* 样式可以根据需要调整 */
.el-header {
  background-color: #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

.el-aside {
  background-color: #f0f2f5;
}

.el-main {
  padding: 20px;
}

.el-footer {
  text-align: center;
  padding: 20px;
  background-color: #f0f2f5;
}
</style>