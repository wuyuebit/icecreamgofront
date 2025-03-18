<template>
  <el-form :model="form" label-width="80px">
    <el-form-item label="房间名">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="createRoom">创建</el-button>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { reactive } from 'vue';
export default {
  emits: ['create-room'],
  setup(props, { emit }) {
    const form = reactive({
      name: '',
      password: '',
    });

    const createRoom = () => {
      // 表单验证 (可选)
      // ...

      // 触发 create-room 事件，将表单数据传递给父组件
      emit('create-room', form);
    };

    return {
      form,
      createRoom,
    };
  },
};
</script>