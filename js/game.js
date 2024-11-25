class SudokuGame {
    constructor() {
        this.board = new SudokuBoard();
        this.currentBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.score = 100;
        this.timer = null;
        this.gameActive = false;
        this.timeElapsed = 0;  
        this.currentDifficulty = 'easy';
        this.difficultyLabels = {
            en: {
                easy: 'Easy',
                medium: 'Medium',
                hard: 'Hard',
                expert: 'Expert'
            },
            zh: {
                easy: '简单',
                medium: '中等',
                hard: '困难',
                expert: '专家'
            },
            ja: {
                easy: '簡単',
                medium: '普通',
                hard: '難しい',
                expert: 'エキスパート'
            }
        };
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        const difficultySelect = document.getElementById('difficulty-select');
        this.currentDifficulty = difficultySelect.value;
        
        this.board.generate(this.currentDifficulty);
        this.initialBoard = this.board.getBoard();
        this.currentBoard = this.initialBoard.map(row => [...row]);
        
        switch(this.currentDifficulty) {
            case 'easy':
                this.score = 100;
                break;
            case 'medium':
                this.score = 150;
                break;
            case 'hard':
                this.score = 200;
                break;
            case 'expert':
                this.score = 300;
                break;
            default:
                this.score = 100;
        }
        
        this.timeElapsed = 0;
        this.updateScoreDisplay();
        this.gameActive = true;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.startTimer();
        this.renderBoard();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.gameActive) {
                this.timeElapsed++;
                this.updateTimeDisplay();
                
                if (this.timeElapsed % 30 === 0) {
                    let penalty = 5;
                    switch(this.currentDifficulty) {
                        case 'easy':
                            penalty = 5;
                            break;
                        case 'medium':
                            penalty = 4;
                            break;
                        case 'hard':
                            penalty = 3;
                            break;
                        case 'expert':
                            penalty = 2;
                            break;
                    }
                    this.score = Math.max(0, this.score - penalty);
                    this.updateScoreDisplay();
                    
                    if (this.score <= 0) {
                        this.checkGameOver();
                    }
                }
            }
        }, 1000);
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('time-display').textContent = timeString;
    }

    updateScoreDisplay() {
        document.getElementById('current-score').textContent = this.score;
    }

    setupEventListeners() {
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => {
                if (this.selectedCell && this.gameActive) {
                    const number = parseInt(button.dataset.number);
                    this.setNumber(number);
                }
            });
        });

        document.getElementById('erase').addEventListener('click', () => {
            if (this.selectedCell && this.gameActive) {
                this.setNumber(0);
            }
        });

        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.initializeGame();
        });

        document.getElementById('new-game').addEventListener('click', () => {
            this.initializeGame();
        });

        document.getElementById('check-solution').addEventListener('click', () => {
            if (this.gameActive) {
                this.checkSolution();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.selectedCell && this.gameActive) {
                if (e.key >= '1' && e.key <= '9') {
                    this.setNumber(parseInt(e.key));
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    this.setNumber(0);
                }
            }
        });

        document.getElementById('show-leaderboard').addEventListener('click', () => {
            this.showLeaderboard();
        });

        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });

        document.getElementById('submit-score').addEventListener('click', () => {
            this.submitScore();
        });
    }

    checkGameOver() {
        if (this.score <= 0) {
            this.gameActive = false;
            clearInterval(this.timer);
            this.showGameOver('Game Over! Your score reached 0.');
        }
    }

    setNumber(number) {
        if (!this.selectedCell || !this.gameActive) return;

        const { row, col } = this.selectedCell;
        
        if (this.initialBoard[row][col] !== 0) return;

        const previousNumber = this.currentBoard[row][col];
        this.currentBoard[row][col] = number;
        this.selectedCell.element.textContent = number !== 0 ? number : '';

        this.selectedCell.element.classList.remove('invalid', 'correct');

        if (number !== 0) {
            const isCorrectNumber = number === this.board.getSolution()[row][col];
            
            const isValidMove = this.board.isValid(this.currentBoard, row, col, number);

            this.currentBoard[row][col] = 0;
            const isValidPosition = this.board.isValid(this.currentBoard, row, col, number);
            this.currentBoard[row][col] = number;

            if (isCorrectNumber) {
                this.selectedCell.element.classList.add('correct');
                this.score += 1; 
            } else {
                this.selectedCell.element.classList.add('invalid');
                this.score -= 1; 
            }

            this.updateScoreDisplay();
            this.checkGameOver();
        }
    }

    showGameOver(message) {
        const modal = document.getElementById('username-modal');
        document.getElementById('final-score-display').textContent = 
            `${message}\nFinal Score: ${this.score}`;
        modal.style.display = 'block';
    }

    submitScore() {
        const username = document.getElementById('username').value.trim();
        if (!username) {
            alert('Please enter your name');
            return;
        }

        let leaderboard = JSON.parse(localStorage.getItem('sudokuLeaderboard') || '[]');
        
        leaderboard.push({
            name: username,
            score: this.score,
            date: new Date().toISOString()
        });

        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem('sudokuLeaderboard', JSON.stringify(leaderboard));

        document.getElementById('username-modal').style.display = 'none';
        this.showLeaderboard();
    }

    showLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('sudokuLeaderboard') || '[]');
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'entry';
            entryElement.innerHTML = `
                <span>#${index + 1} ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardList.appendChild(entryElement);
        });

        document.getElementById('leaderboard-modal').style.display = 'block';
    }

    checkSolution() {
        if (!this.board) return;
        
        const isCorrect = this.board.checkSolution(this.currentBoard);
        const currentScore = this.score;
        
        // 显示完整解决方案
        this.showSolution();
        
        if (isCorrect) {
            // 5秒后询问是否记录成绩
            setTimeout(() => {
                const wantToRecord = confirm("恭喜完成！是否要记录您的成绩到排行榜？");
                if (wantToRecord) {
                    this.showLeaderboardModal(currentScore);
                }
            }, 5000);
        } else {
            alert("解答不正确，请继续尝试！");
        }
    }

    showSolution() {
        const solution = this.board.getSolution();
        const currentBoard = this.currentBoard;
        const boardElement = document.getElementById('board');
        const cells = boardElement.getElementsByClassName('cell');
        
        // 遍历所有单元格
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cellIndex = i * 9 + j;
                const cell = cells[cellIndex];
                const currentValue = currentBoard[i][j];
                const correctValue = solution[i][j];
                
                // 移除之前的类
                cell.classList.remove('solution-display', 'incorrect', 'correct');
                
                if (currentValue === 0 || currentValue !== correctValue) {
                    // 显示正确答案，使用不同样式
                    cell.textContent = correctValue;
                    cell.classList.add('solution-display');
                    if (currentValue !== 0 && currentValue !== correctValue) {
                        cell.classList.add('incorrect');
                    }
                } else {
                    cell.classList.add('correct');
                }
            }
        }
    }

    showLeaderboardModal(score) {
        const modal = document.getElementById('leaderboard-modal');
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        // 添加用户名输入表单
        const inputForm = document.createElement('div');
        inputForm.className = 'input-form';
        inputForm.innerHTML = `
            <div class="input-group">
                <label for="player-name">请输入您的名字：</label>
                <input type="text" id="player-name" maxlength="20" placeholder="请输入名字">
                <button id="submit-score" class="submit-btn">提交成绩</button>
            </div>
        `;
        leaderboardList.appendChild(inputForm);

        // 显示现有排行榜
        let leaderboard = JSON.parse(localStorage.getItem('sudokuLeaderboard') || '[]');
        
        // 显示排行榜标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'leaderboard-title';
        titleDiv.textContent = '排行榜';
        leaderboardList.appendChild(titleDiv);

        // 显示现有记录
        leaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'entry';
            entryElement.innerHTML = `
                <span>#${index + 1} ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardList.appendChild(entryElement);
        });

        // 添加提交事件处理
        document.getElementById('submit-score').addEventListener('click', () => {
            const playerName = document.getElementById('player-name').value.trim();
            if (!playerName) {
                alert('请输入您的名字！');
                return;
            }

            // 添加新记录
            leaderboard.push({
                name: playerName,
                score: score,
                date: new Date().toISOString()
            });

            // 按分数排序并保留前10名
            leaderboard.sort((a, b) => b.score - a.score);
            leaderboard = leaderboard.slice(0, 10);

            // 保存到localStorage
            localStorage.setItem('sudokuLeaderboard', JSON.stringify(leaderboard));

            // 刷新显示
            this.showLeaderboardModal(score);
            
            // 禁用提交按钮和输入框
            document.getElementById('submit-score').disabled = true;
            document.getElementById('player-name').disabled = true;
        });

        modal.style.display = 'block';
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                const value = this.currentBoard[i][j];
                cell.textContent = value !== 0 ? value : '';

                if (this.initialBoard[i][j] !== 0) {
                    cell.classList.add('fixed');
                }

                cell.addEventListener('click', () => {
                    if (this.initialBoard[i][j] === 0) {
                        this.selectCell(i, j, cell);
                    }
                });

                boardElement.appendChild(cell);
            }
        }
    }

    selectCell(row, col, cellElement) {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        this.selectedCell = {
            row,
            col,
            element: cellElement
        };

        cellElement.classList.add('selected');
    }

    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        const lang = document.documentElement.lang || 'en';
        document.getElementById('current-difficulty').textContent = 
            this.difficultyLabels[lang][difficulty];
        this.initializeGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
