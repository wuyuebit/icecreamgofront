<template>
  <el-table :data="rooms" style="width: 100%">
    <el-table-column prop="id" label="房间ID" width="180"></el-table-column>
    <el-table-column prop="name" label="房间名" width="180"></el-table-column>
    <el-table-column label="人数">
      <template #default="scope">
        {{ scope.row.players }}/{{ scope.row.maxPlayers }}
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button
          size="small"
          type="primary"
          :disabled="scope.row.players >= scope.row.maxPlayers"
          @click="joinRoom(scope.row.id)"
        >
          加入
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },
  emits: ['join-room'],
  setup(props, { emit }) {
    const joinRoom = (roomId) => {
      emit('join-room', roomId);
    };

    return {
      joinRoom,
    };
  },
};
</script>