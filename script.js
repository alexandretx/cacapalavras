// Game configuration
const config = {
    gridSize: 10,
    wordCount: 8,  // Increased from 6 to 8 for more challenge
    timeLimit: 120,  // Increased from 60 to 120 seconds for better gameplay
    directions: [
        [0, 1],   // right
        [1, 0],   // down
        [1, 1],   // diagonal down-right
        [1, -1],  // diagonal down-left
        [0, -1],  // left
        [-1, 0],  // up
        [-1, 1],  // diagonal up-right
        [-1, -1]  // diagonal up-left
    ]
};

// Word list to choose from
const wordPool = [
    "ELEFANTE", "GATO", "CACHORRO", "PAPAGAIO", "JACARE", "GOLFINHO", "CORUJA", "FORMIGA", "CAVALO", "LEAO",
    "ABACAXI", "LARANJA", "MELANCIA", "MORANGO", "PERA", "UVA", "MAMAO", "CEREJA", "BANANA", "GOIABA",
    "VERMELHO", "AZUL", "AMARELO", "VERDE", "ROXO", "LARANJA", "PRETO", "BRANCO", "CINZA", "ROSA",
    "BRASIL", "ARGENTINA", "PORTUGAL", "CANADA", "JAPAO", "AUSTRALIA", "FRANCA", "ALEMANHA", "MEXICO", "ITALIA",
    "RELOGIO", "TELEFONE", "COMPUTADOR", "MOCHILA", "LAPIS", "ESPELHO", "CHAVE", "JANELA", "CADEIRA", "GUARDA-CHUVA",
    "FUTEBOL", "BASQUETE", "VOLEI", "NATACAO", "CORRIDA", "TENIS", "HANDEBOL", "SURFE", "SKATE", "CICLISMO",
    "MEDICO", "PROFESSOR", "BOMBEIRO", "ENGENHEIRO", "ARQUITETO", "POLICIAL", "ADVOGADO", "CIENTISTA", "JORNALISTA", "ELETRICISTA",
    "MONTANHA", "FLORESTA", "OCEANO", "CACHOEIRA", "LAGOA", "DESERTO", "ILHA", "CAVERNA", "PLANETA", "NUVEM",
    "PIZZA", "HAMBURGUER", "CHOCOLATE", "MACARRAO", "ARROZ", "FEIJAO", "QUEIJO", "BATATA", "SORVETE", "SALADA",
    "ALEGRIA", "TRISTEZA", "RAIVA", "AMOR", "MEDO", "ESPERANCA", "CORAGEM", "GRATIDAO", "PAZ", "ANSIEDADE"
];

// Game state
let gameState = {
    grid: [],
    words: [],
    foundWords: [],
    score: 0,
    timeRemaining: config.timeLimit,
    timerInterval: null,
    selectedCells: [],
    isSelecting: false,
    gameStatus: 'ready'  // New property to track game status
};

// Additional DOM elements
const gridElement = document.getElementById('grid');
const wordListElement = document.getElementById('wordList');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const timerProgressElement = document.getElementById('timerProgress');
const gameStatusElement = document.getElementById('gameStatus');
const newGameButton = document.getElementById('newGameBtn');

// Initialize the game
function initGame() {
    resetGameState();
    createEmptyGrid();
    selectRandomWords();
    placeWordsInGrid();
    fillEmptySpaces();
    renderGrid();
    renderWordList();
    updateGameStatus('Encontre todas as palavras!');
    startTimer();
}

// Reset game state with enhanced properties
function resetGameState() {
    clearInterval(gameState.timerInterval);
    gameState = {
        grid: [],
        words: [],
        foundWords: [],
        score: 0,
        timeRemaining: config.timeLimit,
        timerInterval: null,
        selectedCells: [],
        isSelecting: false,
        gameStatus: 'playing'
    };
    updateScore();
    updateTimer();
}

// Create empty grid
function createEmptyGrid() {
    gameState.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
}

// Select random words from the pool
function selectRandomWords() {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    gameState.words = shuffled.slice(0, config.wordCount);
}

// Place words in the grid
function placeWordsInGrid() {
    gameState.words.forEach(word => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            attempts++;
            
            // Random starting position
            const row = Math.floor(Math.random() * config.gridSize);
            const col = Math.floor(Math.random() * config.gridSize);
            
            // Random direction
            const dirIndex = Math.floor(Math.random() * config.directions.length);
            const [dRow, dCol] = config.directions[dirIndex];
            
            // Check if word fits
            if (wordFits(word, row, col, dRow, dCol)) {
                placeWord(word, row, col, dRow, dCol);
                placed = true;
            }
        }
        
        // If we couldn't place the word after 100 attempts, remove it from the list
        if (!placed) {
            gameState.words = gameState.words.filter(w => w !== word);
        }
    });
}

// Check if a word fits in the grid at the given position and direction
function wordFits(word, row, col, dRow, dCol) {
    const length = word.length;
    
    // Check if word goes out of bounds
    if (
        row + dRow * (length - 1) < 0 || 
        row + dRow * (length - 1) >= config.gridSize ||
        col + dCol * (length - 1) < 0 || 
        col + dCol * (length - 1) >= config.gridSize
    ) {
        return false;
    }
    
    // Check if the cells are empty or have the same letter
    for (let i = 0; i < length; i++) {
        const currentRow = row + dRow * i;
        const currentCol = col + dCol * i;
        const currentCell = gameState.grid[currentRow][currentCol];
        
        if (currentCell !== '' && currentCell !== word[i]) {
            return false;
        }
    }
    
    return true;
}

// Place a word in the grid
function placeWord(word, row, col, dRow, dCol) {
    for (let i = 0; i < word.length; i++) {
        const currentRow = row + dRow * i;
        const currentCol = col + dCol * i;
        gameState.grid[currentRow][currentCol] = word[i];
    }
}

// Fill empty spaces with random letters
function fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let row = 0; row < config.gridSize; row++) {
        for (let col = 0; col < config.gridSize; col++) {
            if (gameState.grid[row][col] === '') {
                const randomIndex = Math.floor(Math.random() * letters.length);
                gameState.grid[row][col] = letters[randomIndex];
            }
        }
    }
}

// Render the grid on the page
function renderGrid() {
    gridElement.innerHTML = '';
    
    for (let row = 0; row < config.gridSize; row++) {
        for (let col = 0; col < config.gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = gameState.grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add event listeners for selection
            cell.addEventListener('mousedown', startSelection);
            cell.addEventListener('mouseover', continueSelection);
            cell.addEventListener('mouseup', endSelection);
            cell.addEventListener('touchstart', handleTouchStart);
            cell.addEventListener('touchmove', handleTouchMove);
            cell.addEventListener('touchend', handleTouchEnd);
            
            gridElement.appendChild(cell);
        }
    }
    
    // Add event listener to handle selection cancellation
    document.addEventListener('mouseup', endSelection);
}

// Enhanced renderWordList with better word display
function renderWordList() {
    wordListElement.innerHTML = '';
    
    gameState.words.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        if (gameState.foundWords.includes(word)) {
            wordItem.classList.add('word-found');
        }
        wordItem.textContent = word;
        wordItem.dataset.word = word;
        wordListElement.appendChild(wordItem);
    });
}

// Enhanced timer with progress bar
function startTimer() {
    updateTimer();
    updateTimerProgress();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimer();
        updateTimerProgress();
        
        if (gameState.timeRemaining <= 0) {
            endGame();
        } else if (gameState.timeRemaining <= 10) {
            // Visual indication when time is running out
            timerElement.style.color = 'red';
            updateGameStatus('Tempo acabando!');
        }
    }, 1000);
}

// Update the timer display
function updateTimer() {
    timerElement.textContent = gameState.timeRemaining;
}

// New function to update timer progress bar
function updateTimerProgress() {
    const percentage = (gameState.timeRemaining / config.timeLimit) * 100;
    timerProgressElement.style.width = `${percentage}%`;
    
    // Change color based on time remaining
    if (percentage <= 20) {
        timerProgressElement.style.backgroundColor = '#f44336'; // Red
    } else if (percentage <= 50) {
        timerProgressElement.style.backgroundColor = '#ff9800'; // Orange
    } else {
        timerProgressElement.style.backgroundColor = '#4CAF50'; // Green
    }
}

// Update the score display with animation
function updateScore() {
    // Animate score change
    scoreElement.classList.add('celebrate');
    setTimeout(() => {
        scoreElement.classList.remove('celebrate');
    }, 500);
    
    scoreElement.textContent = gameState.score;
}

// New function to update game status message
function updateGameStatus(message) {
    gameStatusElement.textContent = message;
}

// Start selection
function startSelection(event) {
    if (gameState.timeRemaining <= 0) return;
    
    gameState.isSelecting = true;
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    gameState.selectedCells = [{row, col, element: cell}];
    cell.classList.add('selected');
}

// Continue selection
function continueSelection(event) {
    if (!gameState.isSelecting || gameState.timeRemaining <= 0) return;
    
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Check if this is a valid next cell (adjacent to the last selected cell)
    const lastCell = gameState.selectedCells[gameState.selectedCells.length - 1];
    
    // Check if the cell is already selected
    if (gameState.selectedCells.some(c => c.row === row && c.col === col)) {
        // If it's the second-to-last cell, we're going backwards
        if (gameState.selectedCells.length > 1 && 
            gameState.selectedCells[gameState.selectedCells.length - 2].row === row && 
            gameState.selectedCells[gameState.selectedCells.length - 2].col === col) {
            
            // Remove the last cell
            const removedCell = gameState.selectedCells.pop();
            removedCell.element.classList.remove('selected');
        }
        return;
    }
    
    // Check if it's a valid direction (straight line)
    if (gameState.selectedCells.length > 1) {
        const firstCell = gameState.selectedCells[0];
        const secondCell = gameState.selectedCells[1];
        
        // Calculate direction
        const dRow = secondCell.row - firstCell.row;
        const dCol = secondCell.col - firstCell.col;
        
        // Check if new cell follows the same direction
        const expectedRow = lastCell.row + dRow;
        const expectedCol = lastCell.col + dCol;
        
        if (row !== expectedRow || col !== expectedCol) {
            return;
        }
    }
    
    // Add the cell to selected cells
    gameState.selectedCells.push({row, col, element: cell});
    cell.classList.add('selected');
}

// End selection
function endSelection() {
    if (!gameState.isSelecting) return;
    
    gameState.isSelecting = false;
    
    // Check if a word was found
    const selectedWord = getSelectedWord();
    checkSelectedWord(selectedWord);
    
    // Clear selection
    gameState.selectedCells.forEach(cell => {
        cell.element.classList.remove('selected');
    });
    gameState.selectedCells = [];
}

// Get the word from selected cells
function getSelectedWord() {
    return gameState.selectedCells.map(cell => {
        return gameState.grid[cell.row][cell.col];
    }).join('');
}

// Check if the selected word is in the word list
function checkSelectedWord(word) {
    // Check forward
    if (gameState.words.includes(word) && !gameState.foundWords.includes(word)) {
        wordFound(word);
        return;
    }
    
    // Check backward
    const reversedWord = word.split('').reverse().join('');
    if (gameState.words.includes(reversedWord) && !gameState.foundWords.includes(reversedWord)) {
        wordFound(reversedWord);
        return;
    }
}

// Handle when a word is found
function wordFound(word) {
    gameState.foundWords.push(word);
    gameState.score += word.length * 10;
    updateScore();
    
    // Mark cells as correct with animation
    gameState.selectedCells.forEach(cell => {
        cell.element.classList.add('correct');
        cell.element.classList.add('celebrate');
        setTimeout(() => {
            cell.element.classList.remove('celebrate');
        }, 500);
    });
    
    // Update word list
    const wordItem = document.querySelector(`.word-item[data-word="${word}"]`);
    if (wordItem) {
        wordItem.classList.add('word-found');
        wordItem.classList.add('celebrate');
        setTimeout(() => {
            wordItem.classList.remove('celebrate');
        }, 500);
    }
    
    // Update game status
    updateGameStatus(`Você encontrou "${word}"!`);
    
    // Check if all words are found
    if (gameState.foundWords.length === gameState.words.length) {
        endGame(true);
    } else {
        // Encourage player
        setTimeout(() => {
            updateGameStatus(`Encontre mais ${gameState.words.length - gameState.foundWords.length} palavras!`);
        }, 1500);
    }
}

// Handle touch events
function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-cell')) {
        startSelection({target: element});
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-cell')) {
        continueSelection({target: element});
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    endSelection();
}

// End the game
function endGame(allWordsFound = false) {
    clearInterval(gameState.timerInterval);
    gameState.gameStatus = 'ended';
    
    if (allWordsFound) {
        // Bonus for finding all words
        const timeBonus = gameState.timeRemaining * 5;
        gameState.score += timeBonus;
        updateScore();
        
        updateGameStatus(`Parabéns! Você encontrou todas as palavras!`);
        
        setTimeout(() => {
            alert(`Parabéns! Você encontrou todas as palavras!\nBônus de tempo: ${timeBonus}\nPontuação final: ${gameState.score}`);
        }, 500);
    } else {
        updateGameStatus(`Tempo esgotado!`);
        
        setTimeout(() => {
            alert(`Tempo esgotado!\nVocê encontrou ${gameState.foundWords.length} de ${gameState.words.length} palavras.\nPontuação final: ${gameState.score}`);
        }, 500);
    }
    
    // Highlight unfound words
    gameState.words.forEach(word => {
        if (!gameState.foundWords.includes(word)) {
            const wordItem = document.querySelector(`.word-item[data-word="${word}"]`);
            if (wordItem) {
                wordItem.style.backgroundColor = '#f44336';
                wordItem.style.color = 'white';
            }
        }
    });
}

// Event listeners
newGameButton.addEventListener('click', initGame);

// Start the game when the page loads
window.addEventListener('load', initGame);
