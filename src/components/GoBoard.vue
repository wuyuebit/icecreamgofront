<template>
  <!-- 根容器样式调整 - 内边距/尺寸由 props 通过 SVG 控制 -->
  <div class="go-board-container">
    <!-- 仅在 size prop 有效时渲染 SVG -->
    <svg
      v-if="svgWidth > 0 && svgHeight > 0"
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      :width="svgWidth"
      :height="svgHeight"
      class="go-board-svg"
      @click="handleBoardClick"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- 棋盘背景 -->
      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="#e3c16f" />

      <!-- 坐标文本 (使用来自 props 的计算出的 padding/gridSize) -->
      <g fill="#6a3906" :font-size="gridSize * 0.4" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">
         <!-- 顶部字母 -->
         <text v-for="(letter, i) in coordinateLetters" :key="'top'+letter" :x="padding + i * gridSize" :y="padding * 0.5">{{ letter }}</text>
         <!-- 底部字母 -->
         <text v-for="(letter, i) in coordinateLetters" :key="'bottom'+letter" :x="padding + i * gridSize" :y="svgHeight - padding * 0.4">{{ letter }}</text>
         <!-- 左侧数字 -->
         <text v-for="i in boardSize" :key="'left'+i" :x="padding * 0.5" :y="padding + (i - 1) * gridSize">{{ boardSize - i + 1 }}</text>
         <!-- 右侧数字 -->
         <text v-for="i in boardSize" :key="'right'+i" :x="svgWidth - padding * 0.4" :y="padding + (i - 1) * gridSize">{{ boardSize - i + 1 }}</text>
      </g>

      <!-- 网格线 (使用来自 props 的计算出的 padding/gridSize) -->
       <g :stroke="gridLineColor" :stroke-width="gridLineWidth">
         <!-- 水平线 -->
         <line v-for="i in boardSize" :key="'h' + i" :x1="padding" :y1="padding + (i - 1) * gridSize" :x2="svgWidth - padding" :y2="padding + (i - 1) * gridSize"/>
         <!-- 垂直线 -->
         <line v-for="i in boardSize" :key="'v' + i" :x1="padding + (i - 1) * gridSize" :y1="padding" :x2="padding + (i - 1) * gridSize" :y2="svgHeight - padding"/>
       </g>

       <!-- 星位点 (使用来自 props 的计算出的 padding/gridSize) -->
       <circle v-for="(point, index) in starPoints" :key="'star' + index" :cx="padding + point.x * gridSize" :cy="padding + point.y * gridSize" :r="gridSize * 0.12" :fill="gridLineColor"/>

      <!-- 棋子 (使用来自 props 的计算出的 padding/gridSize) -->
      <g>
        <circle
          v-for="(stone, index) in flatStones"
          :key="`stone-${stone.r}-${stone.c}`"
          :cx="padding + stone.c * gridSize"
          :cy="padding + stone.r * gridSize"
          :r="stoneRadius"
          :fill="stone.player === 1 ? 'black' : 'white'"
          :stroke="stone.player === 1 ? '#222' : '#ccc'"
          :stroke-width="gridSize * 0.02"
          class="stone"
        />
      </g>

       <!-- 最后落子标记 (使用来自 props 的计算出的 padding/gridSize) -->
       <g v-if="lastMove && boardState[lastMove.row]?.[lastMove.col] !== 0">
            <circle :cx="padding + lastMove.col * gridSize" :cy="padding + lastMove.row * gridSize" :r="stoneRadius * 0.35" :fill="boardState[lastMove.row][lastMove.col] === 1 ? 'white' : 'red'" pointer-events="none" class="last-move-marker"/>
       </g>

       <!-- 悬停指示器 (使用来自 props 的计算出的 padding/gridSize) -->
       <circle v-if="hoverPos && isHoverValid" :cx="padding + hoverPos.col * gridSize" :cy="padding + hoverPos.row * gridSize" :r="stoneRadius" :fill="currentPlayerForHover === 1 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'" pointer-events="none" class="hover-stone"/>

    </svg>
    <div v-else class="placeholder-loading">正在计算棋盘尺寸...</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
     boardState: { type: Array, required: true },
     lastMove: { type: Object, default: null },
     currentPlayerForHover: { type: Number, default: 1 },
     // 用于尺寸的新 props，由父组件计算
     containerWidth: { type: Number, default: 0 }, // 默认值避免了未使用 v-if 时的警告
     containerHeight: { type: Number, default: 0 },
});

const emit = defineEmits(['place-stone']);

const boardSize = 19;
const coordinateLetters = 'ABCDEFGHJKLMNOPQRST'.split('');

// --- 基于 Props 计算尺寸 ---
// 这些现在是基于从 GameView 传递过来的容器尺寸的计算属性
const padding = computed(() => {
    const size = Math.min(props.containerWidth, props.containerHeight);
    return Math.max(15, size * 0.06); // 使用较小容器维度的百分比
});

const gridSize = computed(() => {
    const size = Math.min(props.containerWidth, props.containerHeight);
    if (size <= 30) return 0; // 如果容器太小，阻止负的 grid size
    const effectiveBoardRatio = 0.95; // 用于棋盘+坐标的容器比例
    const totalEffectiveSize = size * effectiveBoardRatio;
    const gridArea = totalEffectiveSize - 2 * padding.value; // padding 在上面已计算
    const divisor = boardSize > 1 ? boardSize - 1 : 1; // 防止除以零
    return gridArea > 0 ? gridArea / divisor : 0;
});

const svgWidth = computed(() => {
     if (gridSize.value <= 0) return 0;
     const divisor = boardSize > 1 ? boardSize - 1 : 1;
     return divisor * gridSize.value + 2 * padding.value;
});
// 使 SVG 基于计算出的宽度维度成为正方形
const svgHeight = computed(() => svgWidth.value);

const stoneRadius = computed(() => gridSize.value * 0.47);
const gridLineColor = ref("#8b4513");
const gridLineWidth = computed(() => Math.max(1, Math.round(gridSize.value / 35))); // 动态线宽


// --- 星位点 (静态) ---
const starPoints = ref([
  { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
  { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
  { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
]);

// --- 交互状态 ---
const hoverPos = ref(null);
const isHoverValid = ref(false);

// --- 用于高效渲染棋子的计算属性 ---
const flatStones = computed(() => {
    // ... (与之前相同) ...
     const stones = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            // 检查 props.boardState[r] 是否存在
            if (props.boardState[r]?.[c] !== 0) {
                stones.push({ r, c, player: props.boardState[r][c] });
            }
        }
    }
    return stones;
});


// --- 事件处理 (更简单：仅计算并触发事件) ---
function handleBoardClick(event) {
    if (gridSize.value <= 0) return; // 如果未调整大小，则不处理点击

    const coords = getBoardCoordinatesFromEvent(event);
    if (!coords) return;

    // 触发坐标事件，GameView 处理验证/更新
    emit('place-stone', { row: coords.row, col: coords.col });
}

function getBoardCoordinatesFromEvent(event) {
    if (!event.currentTarget) return null;
    const svgRect = event.currentTarget.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return null; // 防止除以零

    const scaleX = svgWidth.value / svgRect.width; // 计算缩放差异
    const scaleY = svgHeight.value / svgRect.height;

    const clickX = (event.clientX - svgRect.left) * scaleX; // 按比例调整点击
    const clickY = (event.clientY - svgRect.top) * scaleY;

    if (gridSize.value <= 0) return null;

    const colRaw = (clickX - padding.value) / gridSize.value;
    const rowRaw = (clickY - padding.value) / gridSize.value;
    const col = Math.round(colRaw);
    const row = Math.round(rowRaw);

    const threshold = 0.45;
     if (Math.abs(colRaw - col) > threshold || Math.abs(rowRaw - row) > threshold) return null;
     if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return null;

    return { row, col };
}

// --- 悬停逻辑 ---
function handleMouseMove(event) {
     if (gridSize.value <= 0) return;
    const coords = getBoardCoordinatesFromEvent(event);
    if (coords) {
        hoverPos.value = { row: coords.row, col: coords.col };
        // 检查 props.boardState[coords.row] 是否存在
        isHoverValid.value = props.boardState[coords.row]?.[coords.col] === 0;
    } else {
        hoverPos.value = null;
        isHoverValid.value = false;
    }
}

function handleMouseLeave() {
    hoverPos.value = null;
    isHoverValid.value = false;
}

// --- 调试：观察 props 变化 ---
watch(() => [props.containerWidth, props.containerHeight], (newVal) => {
    console.log(`GoBoard received container dims: W=${newVal[0]}, H=${newVal[1]}`);
    console.log(`GoBoard computed: Padding=${padding.value}, GridSize=${gridSize.value}, SvgSize=${svgWidth.value}`);
});

</script>

<style scoped>
.go-board-container {
  /* 容器占据父级给予的空间，居中其子元素 (SVG) */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden; /* 重要：包含 SVG */
}

.go-board-svg {
  display: block;
  /* 让 width/height 属性处理尺寸，遵守 viewBox */
  /* 如果容器非正方形，max-width/max-height 可能产生干扰 */
}
.placeholder-loading {
    color: #888;
    font-style: italic;
}

/* ... (stone, hover-stone, last-move-marker 样式保持不变) ... */
.stone { }
.hover-stone { pointer-events: none; opacity: 0.8; }
.last-move-marker { pointer-events: none; }
</style>