"use strict";

const CIRCLE = Math.PI * 2;
let canvas = document.getElementById("canvas"); // получаем холст
let context = canvas.getContext("2d"); // получаем контекст
let timer = 0;
let imgW = 340; // размер спрайта корабля
let imgH = 170; // размер спрайта корабля
let step = 1024 / 8 // размеры одного астероида
let step2 = 900 / 9 // размеры одного взрыва
let asterSize = 128;
let explSize = 100;
let rocketSize = 30;

let clickAudio = new Audio("sound.wav");
// подстраиваемся под ширину окна браузера
let w = window.innerWidth;
let h = window.innerHeight;

canvas.setAttribute('width', w);
canvas.setAttribute('height', h);

imgW = Math.round((w * 0.2 / 340)*  imgW);
imgH = imgW/2;
asterSize = Math.round((h * 0.15 / 128)*asterSize);
explSize = Math.round((h * 0.15 / 100)*explSize);
rocketSize = Math.round((h * 0.03 / 30)*rocketSize);

function resizeGame() {
    h = window.innerHeight;
    w = window.innerWidth;
    canvas.setAttribute("height", h);
    canvas.setAttribute("width", w);
    imgW = Math.round((w * 0.2 / 340)*  340);
    imgH = imgW/2;
    // imgH = Math.round((h * 0.2 / 170) *170 );
    asterSize = Math.round((h * 0.15 / 128)*asterSize);
    explSize = Math.round((h * 0.15 / 100)*explSize);
    rocketSize = Math.round((h * 0.05 / 30)*rocketSize);
};

// подстраиваемся под ресайз окна
window.addEventListener("resize", resizeGame)

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}



let asteroids = [];
let rockets = [];
let exploz = [];

// объект игрока
let player = {
    shipW: 340, // размер спрайта корабля
    shipH: 170, // размер спрайта корабля
    x: w / 2 - 150, // начальные точки корабля
    y: h - 100,   // начальные точки корабля
    dx: 0,
    dy: 0,
    vx: 10,
    vy: 10,
    // move: function () {
    //     this.x += this.dx;
    //     this.y += this.dy;
    // },
    // stop: function () {
    //     this.dx = 0;
    //     this.dy = 0;
    // },
    lives: 3,
    score: 0,
};

// события touch
canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.targetTouches.length == 1) {
        fire() /*Ваш код*/
    }
}, false);
canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.targetTouches.length == 1) {
        var touch = event.targetTouches[0];
        player.x = touch.pageX - imgW / 4;
        player.y = touch.pageY - imgH / 2;
    }
}, false);
// canvas.addEventListener('touchend', function (event) {
//     event.preventDefault();
//     event.stopPropagation();
//     player.x = touch.pageX - player.shipW / 4;
//     player.y = touch.pageY + player.shipH / 4;
// }, false);

// навешиваем листенер события движеня мыши и перемещаем туда игрока
canvas.addEventListener("mousemove", function (EO) {
    player.x = EO.offsetX - imgW / 4;
    player.y = EO.offsetY - imgH / 2;
});

canvas.addEventListener("click", fire);
// добавляем координаты выстрелов при клике мышью
function fire() {
    rockets.push({
        x: player.x,
        y: player.y,
        s: -2
    });
    rockets.push({
        x: player.x + imgW/3,
        y: player.y,
        s: -2
    });
    clickSound();
}

// двигаем игрока с помощью клавиатуры
document.addEventListener('keydown', function (EO) {
    switch (EO.keyCode) {
        case 39:
            player.x = player.x + 10;
            break;
        case 40:
            player.y = player.y + 10;
            break;
        case 37:
            player.x = player.x - 10;
            break;
        case 38:
            player.y = player.y - 10;
            break;
        case 32:
            fire();
            break;
    }
});

// кросбраузерность для requestAnimationFrame
let RAF = (function () {
    // находим, какой метод доступен
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        // ни один не доступен
        // будем работать просто по таймеру
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// далее нужно создать звёзды, наполнить ими небо и заставить их двигаться в будущем плавно вниз, что будет создавать видимость движения вперёд
// создаём массив из объектов с координатами и радиусом и скоростью перемещения - выбираются рандомно и заполняем его
let stars = new Array(300).fill().map(() => {
    return {
        x: random(0, w),
        y: random(0, h),
        r: random(0, 3),
        p: 0,
        a: CIRCLE,
        s: random(0.1, 1)
    };
});

let sprites = {
    player: undefined,
    rocket: undefined,
    aster: undefined,
    expl: undefined,
};

function clickSoundInit() {
    clickAudio.play(); // запускаем звук
    clickAudio.pause(); // и сразу останавливаем
}

function clickSound() {
    clickAudio.currentTime = 0; // в секундах
    clickAudio.play();
}

for (let key in sprites) {
    sprites[key] = new Image();
    sprites[key].src = "" + key + ".png";
};

// отрисовываем игровое поле
function render() {
    context.clearRect(0, 0, w, h);
    // загружаем все спрайты циклом по имени ключа
    // рисуем подобие космического неба в нашем канвасе
    let grad = context.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#000000");
    grad.addColorStop(1, "#212121");
    context.fillStyle = grad;
    context.fillRect(0, 0, w, h);

    // выводим наше звёздное небо
    stars.forEach(element => {
        context.beginPath();
        context.arc(element.x, element.y, element.r, element.p, element.a);
        context.fillStyle = "white";
        context.fill();
        context.closePath();
    });

    rockets.forEach(element => {
        context.drawImage(sprites.rocket, element.x + 9, element.y - 5, rocketSize, rocketSize*2);
    });

    // рисуем игрока
    context.drawImage(sprites.player, 0, 0, 340 / 2, 170, player.x, player.y, imgW / 2, imgH);

    // рисуем огонь тягу
    context.drawImage(sprites.player, 340 / 2, 0, 340, 170, player.x, player.y, imgW, imgH);

    asteroids.forEach(element => {
        // рисуем астероид
        context.drawImage(sprites.aster, element.zx, element.zy, step, step, element.x, element.y, asterSize, asterSize);
    });

    exploz.forEach(element => {
        // рисуем взрыв
        context.drawImage(sprites.expl, step2 * Math.floor(element.ax), step2 * Math.floor(element.ay), step2, step2, element.x, element.y, explSize, explSize);
    });

    // выводим на экран счёт
    context.fillStyle = "white";
    context.font = '24px sans-serif';
    context.fillText("SCORE: " + player.score, 25, 25, 100);
    context.fillText("LIVES: " + player.lives, 25,50, 100);

}

// все обновления будут происходить тут

function update() {

    arrMove(stars);
    arrMove(rockets);
    arrMove(asteroids);
    arrExpl(asteroids);
    arrRemove(rockets, asteroids, exploz);

    // анимируем взрыв
    exploz.forEach(function (element, index, object) {
        element.ax = element.ax + 2;
        if (element.ax > 9) {
            element.ay++;
            element.ax = 0;
        }
        if (element.ay > 9) {
            object.splice(index, 1);
        }
    });

    // заставляем звёзды двигаться по игрику вниз и удаляем из массива улетевшие
    // будем использовать эту же функцию и для ракет
    function arrMove(arr) {
        arr.forEach(function (element, index, object) {
            element.y = element.y + element.s;
            if (element.y >= h || element.y <= 0) {
                object.splice(index, 1);    // почистим массив из улетехших звёзд
            }
        });
    }

    function arrExpl(arr) {
        arr.forEach(function (element, index, object) {
            if (((player.y - element.y + 10) <= (imgH / 2 + asterSize / 2)) && ((Math.abs(element.x - player.x + 10)) <= (imgW/2 + asterSize/2))) {
                object.splice(index, 1);
                player.lives = player.lives - 1; // уменьшаем жизни
                vibrate(500);
            };
        });
        return player.lives;
    };

    function arrRemove(arr1, arr2, arr3) {
        arr1.forEach(function (element1, index1, object1) {
            arr2.forEach(function (element2, index2, object2) {
                if (((element1.y - element2.y) <= (step - 50)) && (Math.abs(element1.x - element2.x) <= (step / 2))) {
                    arr3.push({ // пушим взрыв в 3ий массив
                        x: element2.x,
                        y: element2.y,
                        ax: 0,
                        ay: 0,
                    });
                    object1.splice(index1, 1);
                    object2.splice(index2, 1);    // почистим массив из улетехших пуль и астероид
                    player.score = player.score + 1; // увеличиваем счёт
                };
            });
        });
        return player.score;
    };

    // вводим таймер, который срабатывает через определённое обновление фреймов и добавляем новые звёзды с верхней части экрана
    timer++;
    if (timer > 500) timer = 0;
    if (timer % 10 == 0) {
        stars.push({
            x: random(0, w),
            y: random(0, h / 100),
            r: random(0, 3),
            p: 0,
            a: CIRCLE,
            s: random(0.1, 1)
        });
    }

    // вибрация при столкновении
    function vibrate(val) {
        if ("vibrate" in navigator) return navigator.vibrate(val);
        if ("oVibrate" in navigator) return navigator.oVibrate(val);
        if ("mozVibrate" in navigator) return navigator.mozVibrate(val);
        if ("webkitVibrate" in navigator) return navigator.webkitVibrate(val);
    }
    function infiniteVibrate(val, interval) {
        stopVibrate();
        vInterval = setInterval(function () {
            vibrate(val);
        }, interval);
    }
    function stopVibrate() {
        if (typeof (vInterval) !== "undefined") clearInterval(vInterval);
        vibrate(0);
    }


    if (timer % 30 == 0) {
        asteroids.push({
            x: random(0, w),
            y: random(0, h / 100),
            s: random(0.1, 3),
            zx: random(0, 8) * step,
            zy: random(0, 8) * step,
            expl: 0, // взорван ли астероид
        });
    }

    if (player.lives == 0) {
        gameOver();
    }
}

let requestId = 0;

function gameLoop() {
    if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = 0;
    }
    render();
    update();
    requestId = requestAnimationFrame(gameLoop);
}

window.onload = startDocument;

window.onhashchange = switchURLHash;

let isPlaying = false;


function switchURLHash(EO){
    EO = EO || window.event;
    let toClose;
    // узнаемм заначение закладки
    let URLHash = window.location.hash;
    // удаляем первый символ
    let stateStr = URLHash.substr(1);
    switch (stateStr) {
        case "menu":
            // если переход в меню из запущеной игры
            if (isPlaying) {
                toClose = confirm("В случае перезагрузки страницы прогресс игры будет утрачен!");
                if (toClose) {
                    startMenu();
                    isPlaying = false;
                }
                else location.hash = "game";
            }
            // если game over
            else startMenu();
            break;
        // если закладка игры
        case "game":
            startGame();
            break;
    }
}

function startDocument() {
    location.hash = "menu";
}

let wrapper = document.querySelector(".menu");
let gameWrapper = document.querySelector(".game");
let gameOverWrapper = document.querySelector(".gameOver");

function startHash() {
    location.hash = "game";
};

function startMenuHash() {
    location.hash = "menu";
};

// запускаем игру
function startGame() {
    isPlaying = true;
    location.hash = "game";
    wrapper.style.display = "none";
    gameWrapper.style.display = "block";
    gameLoop();
}

// главное меню
function startMenu() {
    timer = 0;
    location.hash = "menu";
    wrapper.style.display = "block";
    gameWrapper.style.display = "none";
    gameOverWrapper.style.display = "none";
    asteroids.length = 0;
    rockets.length = 0;
    player.lives = 3;
    player.score = 0;
    if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = 0;
    }
}

function gameOver() {
    timer = 0;
    gameWrapper.style.display = "none";
    gameOverWrapper.style.display = "block";
    isPlaying = false;
    if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = 0;
    }
}
