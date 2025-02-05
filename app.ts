interface Vector {
    //obsiouly not fully a vector even if called so
    //the ball interface is more of a vector since the magnitude of the vector can be defined
    x: number,
    y: number
}

interface BallInterface{
    id: number,
    original: Vector,
    points: Vector,
    velocity: Vector,
    color: string,
}

class Ball implements BallInterface {
    // abstract representation, not creating visual element
    //it requires context which is not available yet here
    id: number;
    original: Vector;
    points: Vector;
    velocity: Vector;
    color: string;

    constructor(id:number, points:Vector, color:string){
        this.id = id;
        this.original = points;
        this.points = points;
        this.velocity = {x:0, y:0};
        this.color = color;
    }

    changeColor(color:string):void{  
        this.color = color;
    }

    setPoints():void{
        this.points = {
            x: this.points.x + this.velocity.x,
            y: this.points.y + this.velocity.y,
        };
    }


    ///BAAAAAAAAADDDDD POINTS NO USE
    // setPoints():void{
    //     this.points = {
    //         x: Math.round(this.points.x + this.velocity.x),
    //         y: Math.round(this.points.y + this.velocity.y),
    //     };
    // }




    
}


document.addEventListener('DOMContentLoaded', () => {

    const canvas:HTMLCanvasElement | null = document.querySelector('canvas'); //dangerous only for demonstration purposes
    
    if(!canvas){
        console.log('no canvas');
        return 'oopsy no canvas found!';
    }
    
    const width:number = 800;
    const height:number = 450;
    canvas.width = width;
    canvas.height = height;
    const green:string = '#17BC91';
    const orange:string = '#f95b1c';
    let agents:Ball[] = [];
    const dotDiameter:number =  5;
    const acceptedDistance:number = 100;

    const context:CanvasRenderingContext2D | null = canvas.getContext('2d');
    let rect:DOMRect = canvas.getBoundingClientRect();

    let mousePos: Vector | undefined = undefined;

    if(!context){
        console.log('no context found');
        return 'oopsy no context found!';
    }

    const init = ():void => {
        context.clearRect(0, 0, width, height);
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);
    }

    const printText = ( text:string ):void => { 
        context.font = '130px white-rabbit'; 
        context.fillStyle = 'white';

        const textMetrics:TextMetrics = context.measureText(text);
        const textWidth:number = textMetrics.width;
        //tricky but works
        const textHeight:number = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  
        // console.log(textMetrics.hangingBaseline)
        const startingPointX:number = (width - textWidth) / 2;
        const startingPointY:number = (height / 2) + (textHeight / 2); 
        
        context.fillText(text, startingPointX, startingPointY);
    }

    const createMiddleLine = ():void => {
        context.beginPath();
        context.moveTo(0, height/2);
        context.lineTo(width, height/2);
        context.strokeStyle = 'yellow';
        context.stroke();
    }
    
    const createBall = (points:Vector, color: string):void => {
        context.beginPath();
        context.arc(points.x, points.y, dotDiameter, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
    }
    
    const distance = (x:number, y:number, mouseX:number, mouseY:number):number => {
        //A² + B² = C² pythagorian
        return Math.sqrt( (x - mouseX)**2 + (y - mouseY)**2 );
    }

    const createAgents = (): Ball[] => {
        // have to go through pixels and if's white assign a ball
        let counter:number = 0;
        let agents:Ball[] = [];
        for(let xIndex:number = dotDiameter * 3; xIndex < width ; xIndex += dotDiameter * 3){
            for(let yIndex:number = dotDiameter * 3; yIndex < height ; yIndex += dotDiameter * 3){
                const currentPixels = context.getImageData(xIndex, yIndex, dotDiameter, dotDiameter).data;
                let pixelSum:number = 0;
                currentPixels.forEach((pix:number):void=>{
                    pixelSum += pix;
                });
                const checkPixels:number = pixelSum / currentPixels.length ;
                // console.log(checkPixels)

                if(checkPixels !== 63.75){    //because I console found it of course. not a psychic
                    let x:number = xIndex;
                    let y:number = yIndex;
                    let points:Vector = {x: x, y: y};

                    agents.push(new Ball(counter, points, green));
                    counter +=1; 

                }
                
            }
        }
        return agents;

    }
    
    const sketch = (): void => { 
        init();
    
        agents.forEach((agent:Ball):void => {
            //mouse over canvas
            if (mousePos) {
                const dist:number = distance(agent.points.x, agent.points.y, mousePos.x, mousePos.y);

                //mouse close enough to interact with the balls
                if (dist < acceptedDistance) {
                    //move away
                    const directionX:number = agent.points.x - mousePos.x;
                    const directionY:number = agent.points.y - mousePos.y;
    
                    // normalized
                    const magnitude:number = dist;
                    const normalizedX:number = directionX / magnitude;
                    const normalizedY:number = directionY / magnitude;
                    agent.velocity = { x: normalizedX * 3, y: normalizedY * 3 };
                    
                    // non normalized
                    // agent.velocity = { x: directionX / 0.05, y: directionY / 0.05}; //with correction
                    // agent.velocity = { x: directionX, y: directionY };  //without


                    agent.setPoints();
                } else {
                    //move back
                    const directionX:number = agent.original.x - agent.points.x;
                    const directionY:number = agent.original.y - agent.points.y;
    
                    agent.velocity = { x: directionX * 0.05, y: directionY * 0.05 };
                    agent.setPoints();
                }
            } else { //mouse is NOT over the canvas
                const directionX:number = agent.original.x - agent.points.x;
                const directionY:number = agent.original.y - agent.points.y;
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
    canvas.addEventListener('mousemove', (ev:any):void => {
        rect = canvas.getBoundingClientRect();
        mousePos = { x: ev.clientX - rect.left, y: ev.clientY - rect.top};
    });
    canvas.addEventListener('mouseout', (ev:any):void => {
        mousePos = undefined;
    });

    //need to have the font first 
    document.fonts.load("130px white-rabbit").then((loadedFonts) => {
        if (loadedFonts.length > 0) {
            init();
            printText('5cript');
            // createMiddleLine();

            agents = createAgents();
            agents.forEach( (agent:Ball):void => {
                createBall(agent.points, green);
            });
            sketch();

        } else {
            console.error("Font did not load");
        }
    });

});