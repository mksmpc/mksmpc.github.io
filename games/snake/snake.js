// Настройка холста
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

var width = canvas.width;
var height = canvas.height;

// Делим холст на ячейки
var blockSize = 5;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

var snake;
var apple;

var score = 0;
var gameInterval;

var speed = 0;
var initialSpeed = 150 // ms
var speedIncreaseStep = 12; //ms
var applesToNextSpeed = 5;

var keyActions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

// Функция отрисовки границ
function drawBorder() {
    ctx.fillStyle = "Gray";
    // Верхняя
    ctx.fillRect(0, 0, width, blockSize);
    // Нижняя
    ctx.fillRect(0, height - blockSize, width, blockSize);
    // Левая
    ctx.fillRect(0, 0, blockSize, height);
    // Правая
    ctx.fillRect(width - blockSize, 0, blockSize, height);
};

// Функция очистки холста
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
};


// Функция отображения текста текущего счёта
function drawScore() {
    ctx.font = "14px Courier";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = "Black";

    ctx.fillText("Score: " + score + " Speed: " + speed, blockSize, blockSize);
}

// Функция окончания игры (текст + остановка интервала)
function gameOver() {
    clearInterval(gameInterval);

    ctx.font = "50px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#933";

    ctx.fillText("Game Over", width / 2, height / 2);
    gameInterval = null;
}


// Рисование дуг и окружностей
var circle = function(x, y, radius, fill = false, part = 1) {
    ctx.beginPath();

    // ctx.arc(X, Y, RADIUS, START ANGLE, END ANGLE, Против часовой?(TRUE/FALSE));
    ctx.arc(x, y, radius, 0, Math.PI * 2 * part, false);

    // Заполнять, если истина
    if (fill) {
        // Рисуем линии через центр круга, если включена заливка
        // ctx.lineTo(x, y);
        // ctx.lineTo(x + radius, y);
        ctx.fill();
    } else ctx.stroke();
}






//  ===================

//  Создаём конструктор объекта Block и его методы

//  ===================





function Block(col, row) {
    this.col = col;
    this.row = row;
};


Block.prototype.drawSquare = function(color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};

Block.prototype.drawCircle = function(color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};

Block.prototype.equal = function(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};






//  ===================

//  Создаём конструктор объекта Snake и его методы

//  ===================





function Snake() {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];

    this.direction = "right";
    this.nextDirection = "right";
}

// Метод отрисовки змеи
Snake.prototype.draw = function() {
    // Рисуем голову другим цветом
    this.segments[0].drawSquare("#5af");

    // Рисуем остальные сегменты змеи
    for (var i = 1; i < this.segments.length; i++) {
        this.segments[i].drawSquare("#45f");
    }
};

// Метод передвижения змеи в указанном направлении
Snake.prototype.move = function() {
    var head = this.segments[0];
    var newHead;

    this.direction = this.nextDirection;
    switch (this.direction) {
        case "right":
            newHead = new Block(head.col + 1, head.row);
            break;
        case "left":
            newHead = new Block(head.col - 1, head.row);
            break;
        case "down":
            newHead = new Block(head.col, head.row + 1);
            break;
        case "up":
            newHead = new Block(head.col, head.row - 1);
            break;
    }

    if (this.checkCollision(newHead)) {
        gameOver();
        return;
    }

    this.segments.unshift(newHead);

    if (newHead.equal(apple.position)) {
        score++;
        this.updateSpeed();
        apple.move();
    } else {
        this.segments.pop();
    }
};

Snake.prototype.updateSpeed = function() {
    speed = this.segments.length - 3;
    speed = ~~(speed / applesToNextSpeed);
    clearInterval(gameInterval);
    updateGame();
}

Snake.prototype.checkCollision = function(head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === heightInBlocks - 1);

    var wallCollision = leftCollision || rightCollision ||
        topCollision || bottomCollision;

    var selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }

    return wallCollision || selfCollision;
};

Snake.prototype.setDirection = function(newDirection) {
    if (this.direction === "down" && newDirection === "up") {
        return;
    } else if (this.direction === "up" && newDirection === "down") {
        return;
    } else if (this.direction === "right" && newDirection === "left") {
        return;
    } else if (this.direction === "left" && newDirection === "right") {
        return;
    }

    this.nextDirection = newDirection;
};






//  ===================

//  Создаём конструктор объекта Apple и его методы

//  ===================





function Apple() {
    this.position = new Block(10, 10);
};

Apple.prototype.draw = function() {
    this.position.drawCircle("#3b4");
};

Apple.prototype.move = function() {
    do {
        var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        var appleInSnake = false;
        this.position = new Block(randomCol, randomRow);

        // Проверка на нахождение яблока в змейке
        for (var i = 0; i < snake.segments.length; i++) {
            if (snake.segments[i].equal(this.position)) {
                appleInSnake = true;
                console.log('appleInSnake', appleInSnake)
                break;
            }
        }
    } while (appleInSnake);

};








// Обработка нажатий клавиш
document.querySelector("body").onkeydown = function(event) {
    // console.log(event.keyCode);
    var newDirection = keyActions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
}

// Обработка нажатий кнопок

// Кнопка сброса
document.querySelector("#resetButton").onclick = function(event) {
    initializeGame();
}

// Settings button
var settingsForm = document.querySelector("#settingsForm");
document.querySelector("#settingsButton").onclick = function(event) {
    settingsForm.classList.toggle("hidden");
}

function hideSettings () {
    settingsForm.classList.add("hidden");
}

// Save button
document.querySelector("#saveSettingsButton").onclick = function(event) {
    initialSpeed = settingsForm.elements.initialSpeed.value;
    speedIncreaseStep = settingsForm.elements.speedIncreaseStep.value;
    applesToNextSpeed = settingsForm.elements.applesToNextSpeed.value;
    console.log(event);

    initializeGame();

    event.preventDefault();
}

var startButton = document.querySelector("#resetButton");
var controlButtons = document.querySelector("#controlButtons");
//Start(Reset) button
startButton.ontouchend = function(event) {
    controlButtons.classList.remove("hidden");
    startBtnToReset();
}
startButton.onclick = function(event) {
    startBtnToReset();
}

function startBtnToReset() {
    startButton.classList.remove("start");
    startButton.innerHTML = "Reset Game";
    initializeGame();
}


// Control Buttons
document.querySelector("#buttonUp").ontouchstart = function(event) {
    snake.setDirection("up");
}
document.querySelector("#buttonDown").ontouchstart = function(event) {
    snake.setDirection("down");
}
document.querySelector("#buttonLeft").ontouchstart = function(event) {
    snake.setDirection("left");
}
document.querySelector("#buttonRight").ontouchstart = function(event) {
    snake.setDirection("right");
}

var allButtons = document.body.querySelectorAll(".button");
disableSelection(allButtons);


function disableSelection(elements) {
    elements.forEach(function() {
        console.log(this);
        this.onselectstart = function() {
            return false;
        };
        this.unselectable = "on";
    });
}



//////


function updateGame() {

    gameInterval = setInterval(function() {
        clearCanvas();
        drawBorder();
        snake.move();
        snake.draw();
        apple.draw();
        drawScore();
    }, initialSpeed - (speed * speedIncreaseStep));
}

function initializeGame() {

    clearInterval(gameInterval);
    hideSettings();

    speed = 0;
    score = 0;
    snake = new Snake();
    apple = new Apple();

    updateGame();
}