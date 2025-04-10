<template>
  <div class="game-view-container">
    <el-row :gutter="10" class="main-layout-row">

      <!-- ======== BOARD COLUMN ======== -->
      <el-col :xs="24" :sm="16" :md="17" :lg="18" class="board-column">
        <!-- This div grows and holds/centers the GoBoard -->
        <div class="board-wrapper" ref="boardWrapperRef">
          <GoBoard
            v-if="boardContainerWidth > 0 && boardContainerHeight > 0"
            :board-state="board"
            :last-move="lastMoveCoords"
            :current-player-for-hover="currentPlayer"
            :container-width="boardContainerWidth"
            :container-height="boardContainerHeight"
            @place-stone="handleBoardClick"
            class="go-board-component" 
          />
          <!-- Placeholder while waiting for dimensions -->
          <div v-else class="loading-placeholder">
            Initializing Board...
          </div>
        </div>

        <!-- Actions Bar below the board wrapper -->
        <div class="actions-bar">
           <el-button :icon="ZoomIn" disabled>领地</el-button>
           <el-button :icon="Cpu" disabled>支招</el-button>
           <el-button :icon="Share" disabled>变化图</el-button>
           <el-button :icon="RefreshLeft" disabled>悔棋</el-button>
           <el-button :icon="Finished" disabled>数子</el-button>
           <el-button :icon="Delete" disabled>放弃</el-button>
           <el-button :icon="ArrowRightBold" disabled></el-button>
        </div>
      </el-col>

      <!-- ======== INFO COLUMN ======== -->
      <el-col :xs="24" :sm="8" :md="7" :lg="6" class="info-column">
        <div class="info-panel">
          <!-- Player 1 Info -->
          <el-card class="player-card" shadow="never">
             <!-- ... (content same as before) ... -->
              <div class="player-info-header">
                 <el-avatar :size="60" src="/placeholder-pig.png" />
                 <div class="player-name-rank">
                     <span class="player-name">星萌猪</span>
                     <span class="player-rank">准 7段</span>
                 </div>
                 <div class="stone-indicator black"></div>
             </div>
          </el-card>

          <!-- Game Status -->
          <el-card class="status-card" shadow="never">
             <!-- ... (content same as before) ... -->
             <div class="status-grid">
                 <span>黑贴 3又3/4子</span><span>{{ moveCount > 0 ? `第 ${moveCount} 手` : '未开始' }}</span>
                 <span>{{ blackCaptures }} 提子 {{ whiteCaptures }}</span><span>不计时</span>
             </div>
              <div class="turn-indicator" :class="currentPlayer === 1 ? 'black-turn' : 'white-turn'">
                  轮到: {{ currentPlayer === 1 ? '黑方' : '白方' }}
              </div>
          </el-card>

          <!-- Player 2 Info -->
           <el-card class="player-card" shadow="never">
             <!-- ... (content same as before) ... -->
              <div class="player-info-header">
                 <el-avatar :size="60" src="/placeholder-ternura.png" />
                 <div class="player-name-rank">
                     <span class="player-name">Ternura</span>
                     <span class="player-rank">准 1段</span>
                 </div>
                 <div class="stone-indicator white"></div>
             </div>
          </el-card>

          <!-- Spacer / Log Area -->
           <div class="right-panel-spacer">
              <p style="text-align: center; color: #888; margin-top: 20px;">(功能区域)</p>
           </div>
        </div>
      </el-col>

    </el-row>
  </div>
</template>

<script setup>
// Imports remain the same
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElRow, ElCol, ElCard, ElAvatar, ElButton, ElMessage } from 'element-plus';
import GoBoard from '../components/GoBoard.vue';
import { ZoomIn, Cpu, Share, RefreshLeft, Finished, Delete, ArrowRightBold } from '@element-plus/icons-vue';
import { calculateBoardStateAfterMove } from '../utils/goLogic.js';

// Game state refs remain the same
const board = ref(Array(19).fill(null).map(() => Array(19).fill(0)));
const moveHistory = ref([]);
const currentPlayer = ref(1);
const blackCaptures = ref(0);
const whiteCaptures = ref(0);

// Measurement refs remain the same
const boardWrapperRef = ref(null); // Ref for the element to measure
const boardContainerWidth = ref(0);
const boardContainerHeight = ref(0);
let resizeObserver = null;

// Computed properties remain the same
// --- 计算属性 ---
const moveCount = computed(() => moveHistory.value.length);

// --- 修正后的计算属性 ---
const lastMoveCoords = computed(() => {
  if (moveHistory.value.length === 0) {
    return null;
  }
  // 使用正确的属性名 'row' 和 'col' 进行解构
  const moveData = moveHistory.value[moveHistory.value.length - 1];

  // 确保 moveData 存在且包含 row 和 col
  if (!moveData || typeof moveData.row === 'undefined' || typeof moveData.col === 'undefined') {
      console.error("Invalid data found in moveHistory for last move:", moveData); // 在手数历史中发现无效的最后一步棋数据：...
      return null; // 如果数据无效则返回 null
  }

  const { row, col } = moveData;


  // 在返回前确保 row 和 col 是有效的数字
  if (typeof row === 'number' && typeof col === 'number') {
     console.log("GameView computed lastMoveCoords:", { row, col }); // 添加日志：GameView 计算出的 lastMoveCoords：...
     return { row, col };
  } else {
     // 理论上，如果上面的检查通过了，这里不应该执行，但作为保险
     console.error("Invalid types for row/col after destructuring:", moveData); // 解构后 row/col 类型无效：...
     return null;
  }
});
// Measurement logic remains the same
const updateBoardContainerSize = () => {
  if (boardWrapperRef.value) {
    const width = boardWrapperRef.value.clientWidth;
    const height = boardWrapperRef.value.clientHeight;
     if (width !== boardContainerWidth.value || height !== boardContainerHeight.value) {
         // Only update if size actually changed to avoid potential infinite loops
         console.log(`GameView updating board container size: W=${width}, H=${height}`);
         boardContainerWidth.value = width;
         boardContainerHeight.value = height;
     }
  } else {
     console.warn("updateBoardContainerSize called but boardWrapperRef is null");
  }
};

// Mount/Unmount logic remains the same (using nextTick)
onMounted(() => {
  nextTick(() => {
    if (boardWrapperRef.value) {
      updateBoardContainerSize(); // Initial measure
      resizeObserver = new ResizeObserver(updateBoardContainerSize); // Update on resize
      resizeObserver.observe(boardWrapperRef.value);
      console.log("GameView ResizeObserver attached to boardWrapperRef.");
    } else {
      console.error("boardWrapperRef not available in onMounted/nextTick");
    }
  });
});

onBeforeUnmount(() => {
  if (resizeObserver && boardWrapperRef.value) {
    resizeObserver.unobserve(boardWrapperRef.value);
    console.log("GameView ResizeObserver detached.");
  }
  resizeObserver = null;
});

// Methods (handleBoardClick, resetGame) remain the same


function handleBoardClick(payload) {
  // 直接记录接收到的负载
  console.log(`GameView received click payload:`, payload); // GameView 接收到点击负载：...

  // 检查负载是否有效且具有预期的属性
  if (!payload || typeof payload.row === 'undefined' || typeof payload.col === 'undefined') {
      console.error("Invalid payload received in handleBoardClick:", payload); // handleBoardClick 中接收到无效负载：...
      ElMessage.error('内部错误：无法获取落子坐标！');
      return;
  }

  // 从负载对象中提取 row 和 col
  const r = payload.row;
  const c = payload.col;

  console.log(`Extracted coords: R${r}, C${c}. Current Player: ${currentPlayer.value}`); // 提取出的坐标：R..., C...。当前玩家：...


  // --- 开始调试日志 ---
  try {
    const valueAtClick = board.value[r]?.[c]; // 使用提取出的 r, c
    console.log(`Value at board.value[${r}][${c}] BEFORE check:`, valueAtClick, typeof valueAtClick); // 检查前 board.value[...] 的值：...
    if (moveHistory.value.length === 0) {
        // ... (空棋盘检查保持不变) ...
         let isEmpty = true;
        for (let i = 0; i < 19; i++) {
            for (let j = 0; j < 19; j++) {
                if (board.value[i][j] !== 0) {
                    isEmpty = false;
                    console.error(`Board NOT empty at [${i}][${j}], value:`, board.value[i][j]); // 棋盘在 [...] 不为空，值：...
                    break;
                }
            }
            if (!isEmpty) break;
        }
        if (isEmpty) {
            console.log("Confirmed: board.value IS empty before first move check."); // 确认：在第一次落子检查前 board.value 是空的。
        }
    }
  } catch (e) {
      console.error("Error during pre-check logging:", e); // 预检查日志记录期间出错：...
  }
  // --- 结束调试日志 ---


  // 1. 使用逻辑模块计算潜在的下一个状态（使用提取出的 r, c）
  const result = calculateBoardStateAfterMove(r, c, currentPlayer.value, board.value);

  // 2. 检查有效性
  if (!result.isValid) {
    ElMessage.warning(result.error || '无效落子！');
    console.log("Invalid move:", result.error); // 无效落子：...
    return;
  }

  // 3. 更新棋盘状态
  board.value = result.nextBoardState;

  // 4. 更新手数历史
  moveHistory.value.push({ r, c, player: currentPlayer.value }); // 使用提取出的 r, c

  // 5. 更新提子数
  if (result.capturedStones && result.capturedStones.length > 0) {
     const count = result.capturedStones.length;
    if (currentPlayer.value === 1) { blackCaptures.value += count; } else { whiteCaptures.value += count; }
    ElMessage.success(`提子 ${count} !`);
  }

  // 6. 切换玩家
  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;

  console.log("Move successful. Next player:", currentPlayer.value); // 落子成功。下一位玩家：...
}



function resetGame() {
   board.value = Array(19).fill(null).map(() => Array(19).fill(0));
   moveHistory.value = [];
   currentPlayer.value = 1;
   blackCaptures.value = 0;
   whiteCaptures.value = 0;
   ElMessage.success('棋盘已重置 (本地)');
}
</script>

<style scoped>
.game-view-container {
  height: calc(100vh - 60px); /* Adjust 60px if header height is different */
  overflow: hidden;
  padding: 10px;
  background-color: #f0f2f5;
}

.main-layout-row {
  height: 100%;
}

/* BOARD COLUMN: Use flex to position board wrapper above actions bar */
.board-column {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 5px; /* Optional spacing */
}

/* BOARD WRAPPER: This takes the main space and centers the GoBoard */
.board-wrapper {
  flex-grow: 1; /* Takes all available vertical space */
  min-height: 0; /* VERY IMPORTANT for flex-grow in column */
  position: relative; /* Optional, but often useful */
  display: flex; /* Center the GoBoard component */
  justify-content: center;
  align-items: center;
  padding: 16px; /* Padding around the board */
  box-sizing: border-box;
  overflow: hidden; /* Prevent board from spilling out */
}

/* Loading placeholder style */
.loading-placeholder {
  color: #888;
  font-style: italic;
}

/* ACTIONS BAR: Fixed height, at the bottom */
.actions-bar {
  flex-shrink: 0; /* Prevent shrinking */
  padding: 8px 0; /* Slightly less padding */
  background-color: #303133;
  display: flex;
  justify-content: center;
  gap: 8px;
  border-radius: 4px;
  margin-top: 10px; /* Space above the action bar */
}
.actions-bar .el-button {
  background-color: #505153; border-color: #666; color: #eee; margin: 0; /* Remove default margins */
}
.actions-bar .el-button:hover { background-color: #656668; border-color: #777; }
.actions-bar .el-button:disabled { background-color: #404143; border-color: #555; color: #888; }


/* INFO COLUMN: Use flex to position elements */
.info-column {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-left: 5px; /* Optional spacing */
}

.info-panel {
  background-color: #e9eef3;
  padding: 15px;
  border-radius: 4px;
  height: 100%; /* Fill column */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Allow scrolling if needed */
}

.player-card, .status-card {
  margin-bottom: 15px;
  border: none;
  background-color: #fff;
  flex-shrink: 0; /* Prevent cards from shrinking */
}
/* ... (player-card, status-card inner styles remain same) ... */
 .player-card :deep(.el-card__body), .status-card :deep(.el-card__body) { padding: 12px; }
 .player-info-header { display: flex; align-items: center; justify-content: space-between; }
 .player-name-rank { display: flex; flex-direction: column; align-items: center; margin: 0 15px; flex-grow: 1; }
 .player-name { font-weight: bold; font-size: 1.1em; margin-bottom: 2px; }
 .player-rank { font-size: 0.9em; color: #606266; }
 .stone-indicator { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc; }
 .stone-indicator.black { background-color: #000; } .stone-indicator.white { background-color: #fff; border-color: #999;}
 .status-card { font-size: 0.9em; color: #303133; }
 .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 15px; margin-bottom: 10px; text-align: center; }
 .turn-indicator { font-weight: bold; text-align: center; padding: 5px; border-radius: 4px; margin-top: 5px; }
 .turn-indicator.black-turn { color: #fff; background-color: #555; } .turn-indicator.white-turn { color: #000; background-color: #ddd; }


/* SPACER: Takes remaining space in the info column */
.right-panel-spacer {
  flex-grow: 1; /* Takes all remaining vertical space */
  min-height: 50px; /* Ensure it has some minimum height */
  background-color: #fdfdfd;
  border-radius: 4px;
  border: 1px dashed #ccc;
  margin-top: 5px;
  display: flex; /* For centering placeholder text */
  justify-content: center;
  align-items: center;
}

</style>