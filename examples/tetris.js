function preload(){
  TAS.settings.PIANO_ROLL = true;
  TAS.preload();
}

function setup() {
  TAS.vars = vars;
  createCanvas(windowWidth, windowHeight);
  size = min(width/w,height/h);
  tetronimos.push(new tetronimo(possible[Math.floor(TAS.rng.random()*(possible.length))]));
  print('from line 10.');
  let order = [0,1,2,3,4,5,6];
  for(let i = 0; i < 10; i++){
    let o0 = Math.floor(TAS.rng.random()*possible.length);
    print('from line 14');
    let o1 = Math.floor(TAS.rng.random()*possible.length);
    print('from line 16');
    if(o0 === o1){
      o1+=1;
      o1%=7;
    }
    let temp = order[o0];
    order[o0] = order[o1];
    order[o1] = temp;
  }
  for(let i = 0; i < order.length; i++){
    stored.push(possible[order[i]]);
  }
  TAS.setup();
}

let size;
let speeds = [0.01667,0.021017,0.026977,0.035256,0.04693,0.06361,0.0879,0.1236,0.1775,0.2598,0.388,0.59,0.92,1.46,2.36];
var speed = speeds[0];
let spacePressed = false;
let w = 10;
var totalLines = 0;
let h = 20;
var l = 0;
var score = 0;
let scores = [40,100,300,1200];
var tetronimos = [];
let possible = [[{x:-2,y:0},{x:-1,y:0},{x:0,y:0},{x:1,y:0}],[{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:1,y:1}],[{x:-1,y:1},{x:0,y:0},{x:1,y:0},{x:-1,y:0}],[{x:-1,y:0},{x:0,y:0},{x:0,y:1},{x:1,y:1}],[{x:-1,y:1},{x:0,y:0},{x:0,y:1},{x:1,y:0}],[{x:-1,y:1},{x:-1,y:0},{x:0,y:1},{x:0,y:0}],[{x:-1,y:0},{x:0,y:0},{x:0,y:1},{x:1,y:0}]];
var stored = [];
let vars = ['speed','l','score','tetronimos','stored','totalLines'];

function draw() {
  if(tetronimos.length === 0 || (tetronimos[0].down === true && tetronimos.length === 1)){
    tetronimos.push(new tetronimo(stored[0]));
    stored.splice(0,1);
    if(stored.length === 0){
      let order = [0,1,2,3,4,5,6];
      for(let i = 0; i < 10; i++){
        let o0 = Math.floor(TAS.rng.random()*possible.length);
        print('from line 54');
        let o1 = Math.floor(TAS.rng.random()*possible.length);
        print('from line 57');
        if(o0 === o1){
          o1+=1;
          o1%=7;
        }
        let temp = order[o0];
        order[o0] = order[o1];
        order[o1] = temp;
      }
      for(let i = 0; i < order.length; i++){
        stored.push(possible[order[i]]);
      }
    }
  }
  background(100);
  push();
  translate(width/2,height);
  for(let x = 0; x < w; x++){
    for(let y = 0; y < h; y++){
      fill(0);
      stroke(100);
      rect(-5*size+x*size,-y*size-size,size+0.5);
    }
  }
  for(let i = 0; i < tetronimos.length; i++){
    if(!tetronimos[i].update){
      tetronimos[i].update = new tetronimo([],true).update;
      tetronimos[i].combine = new tetronimo([],true).combine;
      tetronimos[i].checkRow = new tetronimo([],true).checkRow;
      tetronimos[i].checkCollision = new tetronimo([],true).checkCollision;
      tetronimos[i].checkLeft = new tetronimo([],true).checkLeft;
      tetronimos[i].checkRight = new tetronimo([],true).checkRight;
      tetronimos[i].checkRotate = new tetronimo([],true).checkRotate;
      tetronimos[i].rotate = new tetronimo([],true).rotate;
    }
    tetronimos[i].update();
  }
  for(let i = 0; i < stored[0].length; i++){
    fill(255);
    rect(stored[0][i].x*size+9*size,-stored[0][i].y*size-10*size,size);
  }
  pop();
  textAlign(LEFT,TOP);
  fill(0);
  text("Score: "+score+"\nLevel: "+l,0,0);
  TAS.update();
}

function keyPressed(){
  TAS.onKeyPressed();
}

class tetronimo{
  constructor(rects,skipCol){
    this.rects = [];
    let col = [255,255,255];
    if(!skipCol){
      col = [TAS.rng.random()*255,TAS.rng.random()*255,TAS.rng.random()*255];
      print('from line 112'); 
    }
    for(let i = 0; i < rects.length; i++){
      this.rects.push({x:rects[i].x,y:rects[i].y,col:col});
    }
    this.x = 5;
    this.y = 20;
    this.delete = [];
    this.leftPressed = false;
    this.rightPressed = false;
    this.upPressed = false;
    this.down = false;
    this.time = 0;
  }
  checkRow(){
    let rows = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    if(this.down){
      for(let i = 0; i < this.rects.length; i++){
        try{
          rows[this.rects[i].y+this.y].push(this.rects[i]);
        }catch(e){
          print(rows,this.rects[i].y+this.y);
          throw e;
        }
      }
      let deletedRows = 0;
      for(let i = 0; i < rows.length; i++){
        if(rows[i].length === 10){
          for(let r = 0; r < rows[i].length; r++){
            this.delete.push(this.rects.indexOf(rows[i][r]));
          }
          deletedRows++;
        }else{
          for(let r = 0; r < rows[i].length; r++){
            if(this.rects.indexOf(rows[i][r])===-1){
              print("Bad",rows,rows[i],rows[i][r],i,r);
            }
            this.rects[this.rects.indexOf(rows[i][r])].y-=deletedRows;
          }
        }
      }
      if(deletedRows!==0){
        totalLines+=deletedRows
        score+=scores[deletedRows-1]*(l+1);
        l = (totalLines-totalLines%10)/10;
        speed = speeds[l];
      }
    }
  }
  update(){
    if(!this.down){
      let inputs = {};
      inputs.left = keyIsDown(65);
      inputs.right = keyIsDown(68);
      inputs.rotate = keyIsDown(87);
      inputs.down = keyIsDown(83);
      inputs.space = keyIsDown(32);
      inputs.n = TAS.rng.n;
      inputs.a = TAS.rng.a;
      inputs.b = TAS.rng.b;
      TAS.addInputs(inputs);
    }
    if(TAS.playback){
      if(TAS.getInput('n') !== TAS.rng.n){
        print('Desync! Expected rng value '+TAS.getInput('n')+', got rng value '+TAS.rng.n+".",TAS.rng,'n:'+TAS.getInput('b'),'a:'+TAS.getInput('a'),'b:'+TAS.getInput('b'));
      }
    }
    if(this.delete.length!==0){
      sort(this.delete);
      print(this.delete);
      for(let i = this.delete.length-1; i >= 0; i--){
        this.rects.splice(this.delete[i],1);
      }
    }
    let down = (keyIsDown(83)&&!TAS.playback)||TAS.getInput('down');
    this.time += (down?max(0.5,speed):speed);
    this.delete = [];
    while(this.time>1&&!this.down){
      this.checkCollision();
      if(!this.down){
        this.y --;
        if(down){
          score++;
        }
      }
      this.time-=1;
    }
    let space = ((keyIsDown(32)&&!TAS.playback)||TAS.getInput("space"));
    if(space && !spacePressed && !this.down){
      spacePressed = true;
      while(!this.down){
        this.checkCollision();
        if(!this.down){
          this.y --;
        }
      }
    }else if(!space && !this.down){
      spacePressed = false;
    }
    this.checkRow();
    let left = ((keyIsDown(65)&&!TAS.playback)||TAS.getInput("left"));
    if(left && !this.down && !this.leftPressed){
      if(this.checkLeft()){
        this.x--;
        this.leftPressed = true;
      }
    }else if(!left){
      this.leftPressed = false;
    }
    let right = ((keyIsDown(68)&&!TAS.playback)||TAS.getInput("right"))
    if(right && !this.down && !this.rightPressed){
      if(this.checkRight()){
        this.x++;
        this.rightPressed = true;
      }
    }else if(!right){
      this.rightPressed = false;
    }
    let rotate = ((keyIsDown(87)&&!TAS.playback)||TAS.getInput('rotate'));
    if(rotate && !this.down && !this.upPressed){
      if(this.checkRotate()){
        this.rotate();
        this.upPressed = true;
      }
    }else if(!rotate){
      this.upPressed = false;
    }
    for(let i = 0; i < this.rects.length; i++){
      fill(this.rects[i].col);
      noStroke();
      rect((this.x+this.rects[i].x)*size-5*size,-(this.y+this.rects[i].y)*size-size,size);
    }
  }
  combine(other){
    for(let i = 0; i < other.rects.length; i++){
      this.rects.push({x:other.rects[i].x+(other.x-this.x),y:other.rects[i].y+(other.y-this.y),col:other.rects[i].col});
    }
  }
  checkCollision(){
    for(let i = 0; i < this.rects.length; i++){
      if(this.rects[i].y+this.y==0){
        this.down = true;
        if(tetronimos[0]!==this){
          tetronimos[0].combine(this);
          tetronimos.splice(tetronimos.indexOf(this),1);
        }
        break;
      }
    }
    for(let i = 0; i < 1 && !this.down; i++){
      if(tetronimos[i]!==this){
        for(let r = 0; r < this.rects.length && !this.down; r++){
          for(let o = 0; o < tetronimos[i].rects.length && !this.down; o++){
            if(this.rects[r].x+this.x===tetronimos[i].rects[o].x+tetronimos[i].x&&this.rects[r].y-1+this.y===tetronimos[i].rects[o].y+tetronimos[i].y){
              this.down = true;
              if(this.y >= 20){
                l = 0;
                totalLines = 0;
                score = 0;
                tetronimos = [];
                return;
              }
              if(tetronimos[0]!==this){
                tetronimos[0].combine(this);
                tetronimos.splice(tetronimos.indexOf(this),1);
              }
            }
          }
        }
      }
    }
  }
  checkRotate(){
    let newRects = [];
    for(let i = 0; i < this.rects.length; i++){
      newRects.push({x:this.rects[i].x*cos(PI/2)-this.rects[i].y*sin(PI/2),y:this.rects[i].x*sin(PI/2)+this.rects[i].y*cos(PI/2)});
    }
    for(let i = 0; i < 1 && !this.down; i++){
      if(tetronimos[i]!==this){
        for(let r = 0; r < newRects.length && !this.down; r++){
          for(let o = 0; o < tetronimos[i].rects.length && !this.down; o++){
            if(newRects[r].x+this.x===tetronimos[i].rects[o].x+tetronimos[i].x&&newRects[r].y+this.y===tetronimos[i].rects[o].y+tetronimos[i].y){
              return false;
            }
          }
        }
      }
    }
    for(let i = 0; i < newRects.length; i++){
      if(newRects[i].y+this.y < 0 || newRects[i].y + this.y >= 24 || newRects[i].x+this.x < 0 || newRects[i].x+this.x>=10){
        return false;
      }
    }
    return true;
  }
  checkRight(){
    let newRects = [];
    for(let i = 0; i < this.rects.length; i++){
      newRects.push({x:this.rects[i].x+1,y:this.rects[i].y});
    }
    for(let i = 0; i < 1 && !this.down; i++){
      if(tetronimos[i]!==this){
        for(let r = 0; r < newRects.length && !this.down; r++){
          for(let o = 0; o < tetronimos[i].rects.length && !this.down; o++){
            if(newRects[r].x+this.x===tetronimos[i].rects[o].x+tetronimos[i].x&&newRects[r].y+this.y===tetronimos[i].rects[o].y+tetronimos[i].y){
              return false;
            }
          }
        }
      }
    }
    for(let i = 0; i < newRects.length; i++){
      if(newRects[i].y+this.y < 0 || newRects[i].y + this.y >= 24 || newRects[i].x+this.x < 0 || newRects[i].x+this.x>=10){
        return false;
      }
    }
    return true;
  }
  checkLeft(){
    let newRects = [];
    for(let i = 0; i < this.rects.length; i++){
      newRects.push({x:this.rects[i].x-1,y:this.rects[i].y});
    }
    for(let i = 0; i < 1 && !this.down; i++){
      if(tetronimos[i]!==this){
        for(let r = 0; r < newRects.length && !this.down; r++){
          for(let o = 0; o < tetronimos[i].rects.length && !this.down; o++){
            if(newRects[r].x+this.x===tetronimos[i].rects[o].x+tetronimos[i].x&&newRects[r].y+this.y===tetronimos[i].rects[o].y+tetronimos[i].y){
              return false;
            }
          }
        }
      }
    }
    for(let i = 0; i < newRects.length; i++){
      if(newRects[i].y+this.y < 0 || newRects[i].y + this.y >= 24 || newRects[i].x+this.x < 0 || newRects[i].x+this.x>=10){
        return false;
      }
    }
    return true;
  }
  rotate(){
    for(let i = 0; i < this.rects.length; i++){
      let x = this.rects[i].x;
      let y = this.rects[i].y;
      this.rects[i] = {x:1*(x*cos(PI/2)-y*sin(PI/2)).toFixed(0),y:1*(x*sin(PI/2)+y*cos(PI/2)).toFixed(0),col:this.rects[i].col};
    }
  }
}