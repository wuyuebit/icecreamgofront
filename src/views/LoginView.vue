<template>
  <div class="login-container">
    <LoginForm @login="handleLogin" />
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue';

export default {
  components: {
    LoginForm,
  },
  setup() {
    const handleLogin = (userData) => {
      // 处理登录逻辑 (向后端API发送请求，验证用户)
      console.log('Logging in:', userData);
      // 假设登录成功，跳转到首页
      this.$router.push('/');
    };

    return {
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh; /* 占满屏幕高度 */
}
</style>