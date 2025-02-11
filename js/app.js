"use strict";
class Ball {
    constructor(id, points, color) {
        this.id = id;
        this.original = points;
        this.points = points;
        this.velocity = { x: 0, y: 0 };
        this.color = color;
    }
    changeColor(color) {
        this.color = color;
    }
    setPoints() {
        this.points = {
            x: this.points.x + this.velocity.x,
            y: this.points.y + this.velocity.y,
        };
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas'); //dangerous only for demonstration purposes
    if (!canvas) {
        console.log('no canvas');
        return 'oopsy no canvas found!';
    }
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    const green = '#17BC91';
    const orange = '#f95b1c';
    let agents = [];
    const dotDiameter = 5;
    const acceptedDistance = 100;
    const context = canvas.getContext('2d');
    let rect = canvas.getBoundingClientRect();
    let mousePos = undefined;
    if (!context) {
        console.log('no context found');
        return 'oopsy no context found!';
    }
    const init = () => {
        context.clearRect(0, 0, width, height);
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);
    };
    const printText = (text) => {
        context.font = '130px white-rabbit';
        context.fillStyle = 'white';
        const textMetrics = context.measureText(text);
        const textWidth = textMetrics.width;
        //tricky but works
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        // console.log(textMetrics.hangingBaseline)
        const startingPointX = (width - textWidth) / 2;
        const startingPointY = (height / 2) + (textHeight / 2);
        context.fillText(text, startingPointX, startingPointY);
    };
    const createMiddleLine = () => {
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.strokeStyle = 'yellow';
        context.stroke();
    };
    const createBall = (points, color) => {
        context.beginPath();
        context.arc(points.x, points.y, dotDiameter, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
    };
    const distance = (x, y, mouseX, mouseY) => {
        //A² + B² = C² pythagorian
        return Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);
    };
    const createAgents = () => {
        // have to go through pixels and if's white assign a ball
        let counter = 0;
        let agents = [];
        for (let xIndex = dotDiameter * 3; xIndex < width; xIndex += dotDiameter * 3) {
            for (let yIndex = dotDiameter * 3; yIndex < height; yIndex += dotDiameter * 3) {
                const currentPixels = context.getImageData(xIndex, yIndex, dotDiameter, dotDiameter).data;
                let pixelSum = 0;
                currentPixels.forEach((pix) => {
                    pixelSum += pix;
                });
                const checkPixels = pixelSum / currentPixels.length;
                // console.log(checkPixels)
                if (checkPixels !== 63.75) { //because I console found it of course. not a psychic
                    let x = xIndex;
                    let y = yIndex;
                    let points = { x: x, y: y };
                    agents.push(new Ball(counter, points, green));
                    counter += 1;
                }
            }
        }
        return agents;
    };
    const sketch = () => {
        init();
        agents.forEach((agent) => {
            //mouse over canvas
            if (mousePos) {
                const dist = distance(agent.points.x, agent.points.y, mousePos.x, mousePos.y);
                //mouse close enough to interact with the balls
                if (dist < acceptedDistance) {
                    //move away
                    const directionX = agent.points.x - mousePos.x;
                    const directionY = agent.points.y - mousePos.y;
                    // normalized
                    const magnitude = dist;
                    const normalizedX = directionX / (magnitude / 3);
                    const normalizedY = directionY / (magnitude / 3); //mitigate the normalization effects
                    agent.velocity = { x: normalizedX, y: normalizedY };
                    // non normalized
                    // agent.velocity = { x: directionX * 0.05, y: directionY * 0.05}; //with correction
                    // agent.velocity = { x: directionX, y: directionY };  //without
                    agent.setPoints();
                }
                else {
                    //move back
                    const directionX = agent.original.x - agent.points.x;
                    const directionY = agent.original.y - agent.points.y;
                    agent.velocity = { x: directionX * 0.05, y: directionY * 0.05 };
                    agent.setPoints();
                }
            }
            else { //mouse is NOT over the canvas
                const directionX = agent.original.x - agent.points.x;
                const directionY = agent.original.y - agent.points.y;
                agent.velocity = { x: directionX * 0.05, y: directionY * 0.05 };
                agent.setPoints();
            }
            //not a fair coin
            let coinFlip = (Math.random() < 0.05) ? agent.changeColor(orange) : agent.changeColor(green);
            createBall(agent.points, agent.color);
        });
        // createMiddleLine();
        window.requestAnimationFrame(sketch);
    };
    //event listener for mouse
    canvas.addEventListener('mousemove', (ev) => {
        rect = canvas.getBoundingClientRect();
        mousePos = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    });
    canvas.addEventListener('mouseout', (ev) => {
        mousePos = undefined;
    });
    //need to have the font first 
    document.fonts.load("130px white-rabbit").then((loadedFonts) => {
        if (loadedFonts.length > 0) {
            init();
            printText('5cript');
            // createMiddleLine();
            agents = createAgents();
            agents.forEach((agent) => {
                createBall(agent.points, green);
            });
            sketch();
        }
        else {
            console.error("Font did not load");
        }
    });
});
