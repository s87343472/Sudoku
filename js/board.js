class SudokuBoard {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.difficultyLevels = {
            easy: { 
                min: 45, 
                max: 50,
                symmetric: true,    // 简单模式保持对称
                pattern: 'even'     // 均匀分布
            },
            medium: { 
                min: 36, 
                max: 44,
                symmetric: true,    // 中等模式保持对称
                pattern: 'random'   // 随机分布
            },
            hard: { 
                min: 32, 
                max: 35,
                symmetric: false,   // 困难模式不需要对称
                pattern: 'sparse'   // 稀疏分布
            },
            expert: { 
                min: 28, 
                max: 31,
                symmetric: false,   // 专家模式不需要对称
                pattern: 'minimal'  // 最小提示
            }
        };
    }

    // 生成新的数独谜题
    generate(difficulty = 'easy') {
        // 首先生成完整的解决方案
        this.generateSolution();
        
        // 复制解决方案
        this.board = this.solution.map(row => [...row]);
        
        // 根据难度移除数字
        const difficultyConfig = this.difficultyLevels[difficulty];
        const numbersToKeep = Math.floor(Math.random() * (difficultyConfig.max - difficultyConfig.min + 1)) + difficultyConfig.min;
        
        if (difficultyConfig.symmetric) {
            this.removeNumbersSymmetrically(81 - numbersToKeep);
        } else {
            this.removeNumbersByPattern(81 - numbersToKeep, difficultyConfig.pattern);
        }

        // 验证谜题是否有唯一解
        if (!this.hasUniqueSolution()) {
            // 如果没有唯一解，重新生成
            return this.generate(difficulty);
        }
    }

    // 对称地移除数字
    removeNumbersSymmetrically(numbersToRemove) {
        let removed = 0;
        while (removed < numbersToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            // 计算对称位置
            const symRow = 8 - row;
            const symCol = 8 - col;
            
            if (this.board[row][col] !== 0 && this.board[symRow][symCol] !== 0) {
                this.board[row][col] = 0;
                this.board[symRow][symCol] = 0;
                removed += 2;
            }
        }
    }

    // 根据不同模式移除数字
    removeNumbersByPattern(numbersToRemove, pattern) {
        switch (pattern) {
            case 'even':
                this.removeNumbersEvenly(numbersToRemove);
                break;
            case 'sparse':
                this.removeNumbersSparse(numbersToRemove);
                break;
            case 'minimal':
                this.removeNumbersMinimal(numbersToRemove);
                break;
            default:
                this.removeNumbersRandomly(numbersToRemove);
        }
    }

    // 均匀移除数字
    removeNumbersEvenly(numbersToRemove) {
        const sectors = Array(9).fill().map(() => []);
        // 将棋盘分成9个3x3区域
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const sector = Math.floor(i/3) * 3 + Math.floor(j/3);
                sectors[sector].push({row: i, col: j});
            }
        }
        
        // 从每个区域移除大致相等的数字
        const perSector = Math.floor(numbersToRemove / 9);
        sectors.forEach(sector => {
            this.shuffleArray(sector);
            for (let i = 0; i < perSector; i++) {
                if (sector[i] && this.board[sector[i].row][sector[i].col] !== 0) {
                    this.board[sector[i].row][sector[i].col] = 0;
                }
            }
        });
    }

    // 稀疏分布（某些区域特别空）
    removeNumbersSparse(numbersToRemove) {
        // 随机选择2-3个3x3区域，从这些区域移除更多的数字
        const sectors = [0,1,2,3,4,5,6,7,8];
        this.shuffleArray(sectors);
        const sparseAreas = sectors.slice(0, 3);
        
        let removed = 0;
        while (removed < numbersToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            const sector = Math.floor(row/3) * 3 + Math.floor(col/3);
            
            if (this.board[row][col] !== 0) {
                // 在稀疏区域有更高的移除概率
                if (sparseAreas.includes(sector) || Math.random() < 0.3) {
                    this.board[row][col] = 0;
                    removed++;
                }
            }
        }
    }

    // 最小提示分布（尽可能少的提示数）
    removeNumbersMinimal(numbersToRemove) {
        // 首先尝试移除对角线上的数字
        for (let i = 0; i < 9; i++) {
            if (numbersToRemove > 0 && this.board[i][i] !== 0) {
                this.board[i][i] = 0;
                numbersToRemove--;
            }
        }
        
        // 然后随机移除剩余的数字，但保持一定的最小提示
        while (numbersToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.board[row][col] !== 0) {
                const temp = this.board[row][col];
                this.board[row][col] = 0;
                
                // 确保每个空白格至少有一个相邻的提示数
                if (this.hasAdjacentHint(row, col)) {
                    numbersToRemove--;
                } else {
                    this.board[row][col] = temp;
                }
            }
        }
    }

    // 随机移除数字
    removeNumbersRandomly(numbersToRemove) {
        let removed = 0;
        while (removed < numbersToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                removed++;
            }
        }
    }

    // 检查是否有相邻的提示数
    hasAdjacentHint(row, col) {
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        return directions.some(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            return newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9 && 
                   this.board[newRow][newCol] !== 0;
        });
    }

    // 验证谜题是否有唯一解
    hasUniqueSolution() {
        const tempBoard = this.board.map(row => [...row]);
        let solutions = 0;
        
        const findSolutions = (board) => {
            if (solutions > 1) return; // 如果已经找到多个解，停止搜索
            
            let row = -1;
            let col = -1;
            let isEmpty = false;
            
            // 找到一个空格
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (board[i][j] === 0) {
                        row = i;
                        col = j;
                        isEmpty = true;
                        break;
                    }
                }
                if (isEmpty) break;
            }
            
            // 如果没有空格，找到一个解
            if (!isEmpty) {
                solutions++;
                return;
            }
            
            // 尝试填充数字
            for (let num = 1; num <= 9; num++) {
                if (this.isValid(board, row, col, num)) {
                    board[row][col] = num;
                    findSolutions(board);
                    board[row][col] = 0;
                }
            }
        };
        
        findSolutions(tempBoard);
        return solutions === 1;
    }

    // 生成完整的解决方案
    generateSolution() {
        // 清空棋盘
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        
        // 填充对角线上的3个3x3方块
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
        
        // 填充剩余的单元格
        this.solveSudoku(this.solution);
    }

    // 填充3x3的方块
    fillBox(row, col) {
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(nums);
        let index = 0;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.solution[row + i][col + j] = nums[index++];
            }
        }
    }

    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 检查数字在当前位置是否有效
    isValid(board, row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }
        
        // 检查列
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }
        
        // 检查3x3方块
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        
        return true;
    }

    // 解数独
    solveSudoku(board) {
        let row = 0;
        let col = 0;
        let isEmpty = false;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    row = i;
                    col = j;
                    isEmpty = true;
                    break;
                }
            }
            if (isEmpty) break;
        }
        
        if (!isEmpty) return true;
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                if (this.solveSudoku(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    // 检查当前填写是否正确
    checkSolution(currentBoard) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (currentBoard[i][j] !== 0 && currentBoard[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // 获取初始谜题
    getBoard() {
        return this.board.map(row => [...row]);
    }

    // 获取完整解答
    getSolution() {
        return this.solution.map(row => [...row]);
    }
}
