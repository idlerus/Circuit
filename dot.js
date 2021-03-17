/**
 * ======
 * CONFIG
 * ======
 */
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

const map = document.getElementById('map');
const lines = [];

const FPS = 60;
const SPS = .5; //Sparks per second
const tail = .02;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const dots = [];
const sparkSize = 10;
const sparkSpeed = 10;
const sparkColours = [
    //'#00d7f5', //light blue
    //'#0000ff',
    //'#dc44ff',
    '#00ff00', //green
    //'#ffbe49',
    //'#ff0000',
];
const renderPCB = true;
const PCBwidth = 2.5;
//const PCBcolour = '#005965'; //light blue
const PCBcolour = '#007700'; //green

/**
 * =========
 * Dot class
 * =========
 */
class Dot
{
    constructor(speed, canvas, path, tail, color, size)
    {
        this.size = size;
        this.isRunning = false;
        this.speed = speed;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.path = path;
        this.pathProgress = 0;
        this.color = color;
        this.x = parseFloat(this.path['x'][0]);
        this.y = parseFloat(this.path['y'][0]);
        this.setDirection();
        this.detectionRadius = this.speed + .1;
        this.die = false;
        this.dying = false;
        this.tail = tail;
        this.tailLife = 0;
        this.tailDead = false;
        this.interval = null;
    }

    setInterval(interval)
    {
        this.interval = interval;
    }

    clearInterval()
    {
        clearInterval(this.interval);
    }

    setDirection()
    {
        this.direction = Math.atan2(this.path['y'][this.pathProgress+1] - this.y, this.path['x'][this.pathProgress+1] - this.x);
    }

    updatePosition()
    {
        if(this.dying === false)
        {
            this.x = parseFloat(this.x + this.speed * (Math.cos(this.direction)));
            this.y = parseFloat(this.y + this.speed * (Math.sin(this.direction)));

            /**
             * finding point in a radius of another point as stated here, idk what am i doing.
             * https://www.geeksforgeeks.org/find-if-a-point-lies-inside-or-on-circle/
             */
            if ((this.x - this.path['x'][this.pathProgress+1]) * (this.x - this.path['x'][this.pathProgress+1]) + (this.y - this.path['y'][this.pathProgress+1]) * (this.y - this.path['y'][this.pathProgress+1]) <= this.detectionRadius * this.detectionRadius)
            {
                if (this.pathProgress+2 < this.path['x'].length)
                {
                    this.pathProgress++;
                    this.setDirection();
                }
                else
                {
                    this.dying = true;
                }
            }
        }
        else
        {
            if(this.tailLife >= 1)
                this.die = true;
            else
                this.tailLife = this.tailLife + this.tail;
        }
    }

    loop() {
        this.isRunning = true;
        this.updatePosition();

        if (this.dying === false)
        {
            // Draw the dot
            this.context.beginPath();
            this.context.fillStyle = this.color;
            this.context.moveTo(this.x, this.y);
            this.context.arc(this.x, this.y, this.size, 0, Math.PI*2, true);
            this.context.fill();
        }
    }

    isItme(dot) {
        return this === dot;
    }
}

/**
 * ==============
 * Rendering etc.
 * ==============
 */
init();

function init() {
    window.onresize = resizeCanvas;
    resizeCanvas();
    let polylines = map.getElementsByTagName('polyline');
    for (let i in polylines)
    {
        if (polylines[i] !== undefined && polylines[i].tagName === 'polyline')
        {
            let toPush = {
                x: [],
                y: []
            };
            let points = polylines[i].getAttribute('points').split(' ');
            for (let point in points)
            {
                let coords = points[point].split(',');
                toPush['x'].push(coords[0]);
                toPush['y'].push(coords[1]);
            }
            lines.push(toPush);
        }
    }

    if (canvas) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        setInterval(
            function() {
                context.fillStyle = 'rgba(0, 0, 0, ' + tail + ')';
                context.fillRect(0, 0, canvas.width, canvas.height);
            },
            1000 / FPS
        );

        if (renderPCB)
        {
            setInterval(
                function ()
                {

                    for (let line in lines)
                    {
                        context.lineWidth = PCBwidth;
                        let rngCol = Math.floor(Math.random() * (sparkColours.length - 0) + 0);
                        context.strokeStyle = PCBcolour;
                        context.beginPath();
                        for (let x in lines[line]['x'])
                        {
                            context.lineTo(lines[line]['x'][x], lines[line]['y'][x]);
                        }
                        context.stroke();
                    }

                },
                1000 / FPS
            );
        }

        setInterval(
            function() {
                createTrail();
                for (let dot in dots)
                {
                    loopDot(dot);
                }
            },
            1000 / SPS
        );
    }
}

function resizeCanvas() {
    let width = canvas.style.width;
    let height = canvas.style.height;
    let maxWidth = window.innerWidth;
    let maxHeight = window.innerHeight;

    let ratio = maxWidth / width;
    if(height * ratio > maxHeight) {
        ratio = maxHeight / height;
    }
    canvas.style.width = width * ratio + "px";
    canvas.style.height = height * ratio + "px";
}

function createTrail() {
    let rngCol = Math.floor(Math.random() * (sparkColours.length - 0) + 0);
    let rng = Math.floor(Math.random() * (lines.length - 0) + 0);
    let rngSpeed = Math.floor(Math.random() * (sparkSpeed - 1) + 1);
    dots.push(new Dot(3,canvas,lines[rng], tail, sparkColours[rngCol], sparkSize));
}

function loopDot(dot)
{
    if (dots[dot].isRunning === false)
    {
        var interval = setInterval(
            function(dot) {
                if (dots[dot] !== undefined)
                {
                    dots[dot].loop();
                }
            },
            1000 / FPS,
            dot
        );
        dots[dot].setInterval(interval);
    }
    if (dots[dot] !== undefined)
    {
        if (dots[dot].die)
        {
            if(dots[dot].isItme(dots[dot]))
            {
                dots[dot].clearInterval();
                dots.splice(dot, 1);
            }
        }
    }

}