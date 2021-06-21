var score = 0;
let highscore = 0;

let show = true;
let curr = 0;

var len = 3;
var x = [];
var y = [];
var overlap = 0;
let size = 60;
var mouseDown = false;

let minY = 50;
let maxY = 500;
let minX = 0;
let maxX = 600;

function setup() {
  if(getItem("chimpHS")!=undefined&&getItem("chimpHS")!=null){
    highscore = getItem("chimpHS");
  }
  
  createCanvas(1200, 500);
  for(i=0;i<len;i++){
  x.push(random(minX+size/2,width-size/2-(width-maxX)));
  y.push(random(minY+size/2,height-size/2-(height-maxY)));
  }
}

function gameOver(){
  show = true;
  score = 0;
  curr = 0;
  len = 3;
  x = [];
  y = [];
  overlap = 0;
  size = 60;
  mouseDown = false;
  for(i=0;i<len;i++){
  x.push(random(minX+size/2,width-size/2-(width-maxX)));
  y.push(random(minY+size/2,height-size/2-(height-maxY)));
  }
}

function draw() {
  storeItem("chimpHS",highscore);
  if(score>highscore){
    highscore = score;
  }
  rectMode(CENTER);
  textAlign(CENTER);
  textSize(20);
  background(120,170,230);
  for(i=0;i<len;i++){
    rect(x[i],y[i],size,size,10);
    if(show){
    text(i+1,x[i],y[i]+size/10);
    }
    if(!TAS.playback){
      if(mouseX>x[i]-size/2&&mouseX<x[i]+size/2&&mouseY>y[i]-size/2&&mouseY<y[i]+size/2){
        overlap = i;
      }
    }else{
      if(TAS.getInput("mouseX")>x[i]-size/2&&TAS.getInput("mouseX")<x[i]+size/2&&TAS.getInput("mouseY")>y[i]-size/2&&TAS.getInput("mouseY")<y[i]+size/2){
        overlap = i;
      }
    }
  }
  
  if(((mouseIsPressed && !TAS.playback) || TAS.getInput('mouseIsPressed'))&&!mouseDown){
    if(!TAS.playback){
      if(mouseX>x[overlap]-size/2&&mouseX<x[overlap]+size/2&&mouseY>y[overlap]-size/2&&mouseY<y[overlap]+size/2){
        if(overlap == curr){
          score++;
        x[overlap] = Infinity;
        show = false;
          curr++;
        }else{
          gameOver();
        }
      }
    }else{
      if(TAS.getInput("mouseX")>x[overlap]-size/2&&TAS.getInput("mouseX")<x[overlap]+size/2&&TAS.getInput("mouseY")>y[overlap]-size/2&&TAS.getInput("mouseY")<y[overlap]+size/2){
        if(overlap == curr){
          score++;
          x[overlap] = Infinity;
          show = false;
          curr++;
        }else{
          gameOver();
        }
      }
    }
    mouseDown = true;
    }else if(!((mouseIsPressed && !TAS.playback) || TAS.getInput('mouseIsPressed'))){
      mouseDown = false;
    }
  
  rect(x[overlap],y[overlap],size,size,10);
  if(show){
  text(overlap+1,x[overlap],y[overlap]+size/10);
  }
  
  if(curr>=len){
    len++;
    show = true;
    x = [];
    y = [];
    curr = 0;
    for(i=0;i<len;i++){
  x.push(random(minX+size/2,width-size/2-(width-maxX)));
  y.push(random(minY+size/2,height-size/2-(height-maxY)));
  }
  }
  
  text("Score: "+score,530,30);
  text("Highscore: "+highscore,90,30);
  rectMode(CORNER);
}