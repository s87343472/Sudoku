// GameState.js - 管理数独游戏的状态
class GameState {
    constructor() {
        // 初始化游戏状态
        this.currentBoard = null;        // 当前游戏板
        this.solution = null;            // 完整解决方案
        this.difficulty = 'medium';      // 默认难度
        this.score = 0;                  // 当前分数
        this.timeElapsed = 0;           // 已用时间（秒）
        this.isGameActive = false;      // 游戏是否进行中
        this.selectedCell = null;       // 当前选中的单元格
        this.mistakes = 0;              // 错误次数
        this.history = [];              // 操作历史
        this.hints = 3;                 // 剩余提示次数
        
        // 计时器引用
        this.timer = null;
    }

    // 初始化新游戏
    initNewGame(difficulty) {
        this.difficulty = difficulty;
        this.score = 0;
        this.timeElapsed = 0;
        this.mistakes = 0;
        this.hints = 3;
        this.isGameActive = true;
        this.history = [];
        this.startTimer();
    }

    // 开始计时器
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.timeElapsed++;
            this.updateDisplay();
        }, 1000);
    }

    // 暂停计时器
    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 更新显示
    updateDisplay() {
        // 更新时间显示
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            const minutes = Math.floor(this.timeElapsed / 60);
            const seconds = this.timeElapsed % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // 更新分数显示
        const scoreDisplay = document.getElementById('current-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
    }

    // 记录移动历史
    recordMove(row, col, value, previousValue) {
        this.history.push({
            row,
            col,
            newValue: value,
            oldValue: previousValue,
            timestamp: Date.now()
        });
    }

    // 撤销最后一步
    undo() {
        if (this.history.length === 0) return false;
        
        const lastMove = this.history.pop();
        if (lastMove) {
            this.currentBoard[lastMove.row][lastMove.col] = lastMove.oldValue;
            return true;
        }
        return false;
    }

    // 检查是否完成
    checkCompletion() {
        if (!this.currentBoard) return false;
        
        // 检查是否所有单元格都已填写
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.currentBoard[i][j] === 0) return false;
            }
        }

        // 检查是否所有填写都正确
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.currentBoard[i][j] !== this.solution[i][j]) return false;
            }
        }

        return true;
    }

    // 使用提示
    useHint() {
        if (this.hints <= 0 || !this.selectedCell) return false;
        
        const [row, col] = this.selectedCell;
        if (this.currentBoard[row][col] === this.solution[row][col]) return false;
        
        this.hints--;
        this.currentBoard[row][col] = this.solution[row][col];
        return true;
    }

    // 验证移动是否有效
    validateMove(row, col, value) {
        if (!this.solution) return false;
        return this.solution[row][col] === value;
    }

    // 计算当前分数
    calculateScore() {
        const baseScore = 1000;
        const timeDeduction = Math.floor(this.timeElapsed / 60) * 10;
        const mistakeDeduction = this.mistakes * 50;
        const hintDeduction = (3 - this.hints) * 100;
        
        return Math.max(0, baseScore - timeDeduction - mistakeDeduction - hintDeduction);
    }

    // 保存游戏状态
    saveGame() {
        const gameState = {
            currentBoard: this.currentBoard,
            solution: this.solution,
            difficulty: this.difficulty,
            score: this.score,
            timeElapsed: this.timeElapsed,
            mistakes: this.mistakes,
            hints: this.hints,
            history: this.history
        };

        localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
    }

    // 加载游戏状态
    loadGame() {
        const savedState = localStorage.getItem('sudokuGameState');
        if (!savedState) return false;

        try {
            const gameState = JSON.parse(savedState);
            Object.assign(this, gameState);
            this.isGameActive = true;
            this.startTimer();
            return true;
        } catch (e) {
            console.error('Failed to load saved game:', e);
            return false;
        }
    }

    // 清理游戏状态
    cleanup() {
        this.pauseTimer();
        this.isGameActive = false;
        this.selectedCell = null;
    }
}

// 导出 GameState 类
export default GameState;
