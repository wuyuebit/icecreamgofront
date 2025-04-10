const BOARD_SIZE = 19; // 棋盘大小
const EMPTY = 0;       // 空
const BLACK = 1;       // 黑棋
const WHITE = 2;       // 白棋

/**
 * 获取给定点的有效相邻点坐标。
 * @param {number} r - 行索引。
 * @param {number} c - 列索引。
 * @returns {Array<{r: number, c: number}>} 有效相邻点坐标列表。
 */
function getNeighbors(r, c) {
  const neighbors = [];
  const deltas = [-1, 1, 0, 0]; // 行/列的变化，对应上、下、左、右

  for (let i = 0; i < 4; i++) {
    const nr = r + deltas[i];
    const nc = c + deltas[3 - i]; // 对应的列变化

    // 检查边界
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      neighbors.push({ r: nr, c: nc });
    }
  }
  return neighbors;
}

/**
 * 使用深度优先搜索（DFS）查找相连的棋子组及其气。
 * @param {number} r - 起始行。
 * @param {number} c - 起始列。
 * @param {Array<Array<number>>} board - 当前棋盘状态。
 * @param {number} player - 要查找的棋子组的颜色（1 或 2）。
 * @returns {{ group: Set<string>, liberties: Set<string> } | null} - 包含棋子组（'r,c' 字符串）和气（'r,c' 字符串）的对象，如果起始点为空或玩家错误则返回 null。
 */
function findGroupAndLiberties(r, c, board, player) {
  if (board[r]?.[c] !== player) {
    return null; // 起始点不是目标玩家的棋子
  }

  const group = new Set(); // 棋子组中的棋子 ('r,c')
  const liberties = new Set(); // 棋子组的气 ('r,c')
  const visited = new Set(); // DFS 过程中访问过的棋子 ('r,c')
  const stack = [{ r, c }]; // DFS 用的栈

  while (stack.length > 0) {
    const current = stack.pop();
    const key = `${current.r},${current.c}`;

    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (board[current.r]?.[current.c] === player) {
      // 这是棋子组的一部分
      group.add(key);
      // 探索相邻点
      for (const neighbor of getNeighbors(current.r, current.c)) {
        const neighborKey = `${neighbor.r},${neighbor.c}`;
        const neighborState = board[neighbor.r]?.[neighbor.c];

        if (neighborState === player && !visited.has(neighborKey)) {
          stack.push(neighbor); // 添加同色相邻子进行探索
        } else if (neighborState === EMPTY) {
          liberties.add(neighborKey); // 找到一个气
        }
        // 查找棋子组/计算气时忽略对方棋子
      }
    }
  }

  return { group, liberties };
}


/**
 * 检查落子有效性，计算提子，并确定下一个棋盘状态。
 * @param {number} r - 落子行。
 * @param {number} c - 落子列。
 * @param {number} player - 落子玩家（1 或 2）。
 * @param {Array<Array<number>>} currentBoard - 落子*前*的棋盘状态。
 * @returns {{ isValid: boolean, nextBoardState: Array<Array<number>> | null, capturedStones: Array<{r: number, c: number}> | null, error?: string }}
 *          返回对象包含：是否有效(isValid)，下一个棋盘状态(nextBoardState)，被提的子(capturedStones)，错误信息(error, 可选)
 */
export function calculateBoardStateAfterMove(r, c, player, currentBoard) {
  // 1. 边界检查
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
    return { isValid: false, nextBoardState: null, capturedStones: null, error: "无效位置：超出棋盘范围。" };
  }

  // 2. 占用检查
  if (currentBoard[r]?.[c] !== EMPTY) {
    return { isValid: false, nextBoardState: null, capturedStones: null, error: "无效位置：此处已有棋子。" };
  }

  // 3. 模拟落子
  // 深拷贝棋盘以避免过早修改原始状态
  const tempBoard = currentBoard.map(row => [...row]);
  tempBoard[r][c] = player;

  const opponent = player === BLACK ? WHITE : BLACK;
  let capturedStones = []; // 存储被提子的 {r, c}

  // 4. 检查是否提掉对方相邻的子
  for (const neighbor of getNeighbors(r, c)) {
    if (tempBoard[neighbor.r]?.[neighbor.c] === opponent) {
      const result = findGroupAndLiberties(neighbor.r, neighbor.c, tempBoard, opponent);
      if (result && result.liberties.size === 0) {
        // 发生提子！
        result.group.forEach(stoneKey => {
          const [stoneR, stoneC] = stoneKey.split(',').map(Number);
          tempBoard[stoneR][stoneC] = EMPTY; // 从临时棋盘移除棋子
          capturedStones.push({ r: stoneR, c: stoneC });
        });
      }
    }
  }

  // 5. 检查自杀（禁着点）
  // 在处理完提子*后*，检查*落下的*棋子所在组的气
  const moveGroupResult = findGroupAndLiberties(r, c, tempBoard, player);
  if (!moveGroupResult || moveGroupResult.liberties.size === 0) {
    // 如果落下的棋子所在组没有气，则为自杀
    return { isValid: false, nextBoardState: null, capturedStones: null, error: "无效位置：禁止自杀。" };
  }

  // --- 打劫检查（简单版本 - 可选）---
  // 我们需要传入*上一个*棋盘状态或在别处管理它。
  // 目前，我们将在前端跳过打劫检查。在后端完成更可靠。
  // if (isKoViolation(tempBoard, previousBoardState)) {
  //    return { isValid: false, ..., error: "无效位置：违反打劫规则。" };
  // }

  // 6. 落子有效
  return {
    isValid: true,
    nextBoardState: tempBoard, // 落子和提子后的棋盘状态
    capturedStones: capturedStones
  };
}

// 辅助函数：将 'r,c' 字符串转换回对象（如果其他地方需要）
export function parseKey(key) {
    const [r, c] = key.split(',').map(Number);
    return { r, c };
}

