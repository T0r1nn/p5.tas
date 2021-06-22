function setup() {
  createCanvas(windowWidth, windowHeight);
  px = width/2;
  py = 3*height/4;
}

var deleted = [];
let moveSpeed = 3;
var a = 1;
var px = innerWidth/4;
var py = 3*innerHeight/4;
var e = [];
var score = 0;
var diff = 30;

function draw() {
  let up = (keyIsDown(87));
  score+=round(30/diff).toFixed(0)*(up?3:1);
  background(220);
  noStroke();
  if(fc%diff === 0){
    e.push({x:random()*width,y:-10});
  }
  if(fc%900 === 0 && fc !== 0){
    print("Diff is going from "+diff+" to "+round(diff/2));
    diff/=2;
    diff = round(diff);
  }
  if((keyIsDown(65))){
    px-=moveSpeed;
  }
  if((keyIsDown(68))){
    px+=moveSpeed;
  }
  px = max(width/60,min(px,width-width/60))
  fill(0,255,0);
  circle(px,py,width/30);
  for(let i = 0; i < e.length; i++){
    let enemy = e[i];
    enemy.y+=2*(((keyIsDown(87)))?2:1);
    if(enemy.y>=height){
      deleted.push(i);
    }
    fill(255,0,0);
    circle(enemy.x,enemy.y,width/30);
    e[i] = enemy;
    if(dist(enemy.x,enemy.y,px,py)<width/30){
      e = [];
      px = width/2;
      score = 0;
      diff = 30;
      break;
    }
  }
  for(let i = deleted.length-1; i >= 0; i--){
    e.splice(deleted[i],1);
  }
  deleted = [];
  fill(0);
  textAlign(LEFT,TOP);
  text(score,0,0);
}