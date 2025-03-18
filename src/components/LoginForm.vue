<template>
  <el-form :model="form" label-width="80px" class="login-form">
    <el-form-item label="用户名">
      <el-input v-model="form.username"></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="login">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { reactive } from 'vue';

export default {
  emits: ['login'],
  setup(props, { emit }) {
    const form = reactive({
      username: '',
      password: '',
    });

    const login = () => {
      // 表单验证 (可选)
      // ...

      // 触发 login 事件，将表单数据传递给父组件
      emit('login', form);
    };

    return {
      form,
      login,
    };
  },
};
</script>

<style scoped>
.login-form {
  width: 350px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>