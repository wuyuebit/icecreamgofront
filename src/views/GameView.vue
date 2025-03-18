<template>
  <div>
    <h1>对弈页面</h1>
    <!-- 这里将放置棋盘组件等 -->
    <GoBoard :roomId="roomId" />
  </div>
</template>

<script>
import GoBoard from '../components/GoBoard.vue';

export default {
  name: 'GameView',
  components: {
    GoBoard,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
/* 样式 (可选) */
</style>