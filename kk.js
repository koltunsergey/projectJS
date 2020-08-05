const CIRCLE = Math.PI * 2;

let canvas = document.getElementById("canvas"); // получаем холст
let context = canvas.getContext("2d"); // получаем контекст
let timer = 0;
let imgW = 348; // размер спрайта корабля
let imgH = 145; // размер спрайта корабля
let step = 1024 / 8 // размеры одного астероида
let step2 = 900 / 9 // размеры одного взрыва


function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

// подстраиваемся под ширину окна браузера
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

let asteroids = [];
let rockets = [];
let exploz = [];

// навешиваем листенер события движеня мыши и перемещаем туда игрока
canvas.addEventListener("mousemove", function (EO) {
    player.x = EO.offsetX - imgW / 4;
    player.y = EO.offsetY - imgH / 4;

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
        x: player.x + imgW / 2 - 45,
        y: player.y - 5,
        s: -2
    });
}

player = {
    shipW: 348, // размер спрайта корабля
    shipH: 145, // размер спрайта корабля
    x: w/2 - 150, // начальные точки корабля
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

// canvas.addEventListener('keyup', function (EO) {
//     player.stop();
// });

// if (player.dx || player.dy) {
//     player.move();
// };


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

// отрисовываем игровое поле
function render() {
    context.clearRect(0, 0, w, h);
        // загружаем все спрайты циклом по имени ключа
    for (let key in sprites) {
        sprites[key] = new Image();
        sprites[key].src = "" + key + ".png";
    };

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
        context.drawImage(sprites.rocket, element.x + 15, element.y - 5);
    });

    // рисуем игрока
    context.drawImage(sprites.player, 0, 0, imgW / 2, imgH, player.x, player.y, imgW / 2, imgH);

    // рисуем огонь тягу
    context.drawImage(sprites.player, imgW / 2, 0, imgW, imgH, player.x, player.y, imgW, imgH);

    asteroids.forEach(element => {
        // рисуем астероид
        context.drawImage(sprites.aster, element.zx, element.zy, step, step, element.x, element.y, step/1.5, step/1.5);
    });

    exploz.forEach(element => {
        // рисуем взрыв
        context.drawImage(sprites.expl, step2*Math.floor(element.ax), step2*Math.floor(element.ay), step2, step2, element.x, element.y, step2, step2);
    });

    // выводим на экран счёт
    context.fillStyle = "white";
    context.font='24px sans-serif';
    context.fillText("SCORE: " + player.score, 50, 50, 200);
    context.fillText("LIVES: " + player.lives, 50, 100, 200);
    
}

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

function arrExpl(arr) {
    arr.forEach(function (element, index, object) {
            if (((player.y - element.y + 50) <= (imgH/2+step/2)) && (Math.abs(element.x - player.x+100) <= (imgW/2+step/2))) {
                object.splice(index, 1);
                player.lives = player.lives - 1; // уменьшаем жизни
            };
        });
    return player.lives;
};

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


    // вводим таймер, который срабатывает через определённое обновление фреймов и добавляем новые звёзды с верхней части экрана
    timer++;
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
}

function oop() {
    render();
    update();
    RAF(oop);
}


oop();


// подстраиваемся под ресайз окна
window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
})