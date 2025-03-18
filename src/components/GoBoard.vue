<template>
  <div>
    <!-- 棋盘的HTML结构将在这里 -->
  </div>
</template>

<script>
export default {
  name: 'GoBoard',
  props: {
    roomId: {  //可能用不上，因为房间的信息可以从vuex或者其他地方获取
        type: String,
        required: false
    }
  }
};
</script>

<style scoped>
/* 棋盘样式 */
</style>