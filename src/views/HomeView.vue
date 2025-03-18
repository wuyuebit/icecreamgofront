<template>
  <div>
    <!-- 欢迎标语 -->
    <h1>欢迎来到Web围棋</h1>

    <!-- 房间列表 -->
    <RoomList :rooms="rooms" @join-room="handleJoinRoom" />

    <!-- 创建房间按钮 -->
    <el-button type="primary" @click="showCreateRoomForm = true">
      创建房间
    </el-button>

    <!-- 创建房间表单 (对话框形式) -->
    <el-dialog
      v-model="showCreateRoomForm"
      title="创建房间"
      width="30%"
      @close="showCreateRoomForm = false"
    >
      <CreateRoomForm @create-room="handleCreateRoom" />
    </el-dialog>
  </div>
</template>

<script>
import RoomList from '../components/RoomList.vue';
import CreateRoomForm from '../components/CreateRoomForm.vue';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
export default {
  components: {
    RoomList,
    CreateRoomForm,
  },
  setup() {
    const rooms = ref([]); // 房间列表数据
    const showCreateRoomForm = ref(false); // 控制创建房间表单的显示

    // 模拟获取房间列表数据 (实际应从后端API获取)
    onMounted(() => {
      // 假设的房间数据
      rooms.value = [
        { id: 1, name: '房间1', players: 2, maxPlayers: 2 },
        { id: 2, name: '房间2', players: 1, maxPlayers: 2 },
      ];
    });

    const handleJoinRoom = (roomId) => {
      // 处理加入房间逻辑 (跳转到对弈页面，并传递房间ID)
      console.log(`Joining room: ${roomId}`);
    };

    const handleCreateRoom = (roomData) => {
      // 处理创建房间逻辑 (向后端API发送请求，创建房间)
      console.log('Creating room:', roomData);
      // 假设创建成功，关闭对话框并刷新房间列表
      showCreateRoomForm.value = false;
      ElMessage.success('房间创建成功！');
    };

    return {
      rooms,
      showCreateRoomForm,
      handleJoinRoom,
      handleCreateRoom,
    };
  },
};
</script>