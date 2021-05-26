class tas{
  constructor(){
    this.inputs = [];
    this.slowdown = 2;
    this.pslowdown = 2;
    this.keybinds = {
      SAVESTATE:75,
      LOADSTATE:76,
      SLOWDOWN:188,
      SPEEDUP:190,
      PLAYBACK:79,
      PAUSE:80,
      FRAME_ADVANCE:186,
      SAVE_INPUTS:191
    }
    this.settings = {
      TYPE:"FRAME",
      READ_FILE:false,
      PIANO_ROLL:false
    }
    this.playback = false;
    this.state = {};
    this.vars = [];
    this.paused = false;
  }
  addVar(name){
    if(window[name]!==undefined){
      this.vars.push(name);
    }else{
      throw "TasNameError, variable "+name+" is not defined correctly.";
    }
  }
  onKeyPressed(){
    if(keyIsDown(this.keybinds.SAVESTATE)){
      this.state = this.savestate(this.vars);
    }
    if(keyIsDown(this.keybinds.LOADSTATE)){
      this.loadstate(this.state);
    }
    if(keyIsDown(this.keybinds.SLOWDOWN)){
      this.slowdown *= 1.5;
      this.slowdown = min(60,this.slowdown);
    }
    if(keyIsDown(this.keybinds.SPEEDUP)){
      this.slowdown /= 1.5;
      this.slowdown = max(1,this.slowdown);
    }
    if(keyIsDown(this.keybinds.PLAYBACK)){
      this.endState = this.savestate(this.vars);
      this.loadstate(this.initialState,['inputs']);
      print(TAS.rng);
      this.pslowdown = this.slowdown;
      this.slowdown = 1;
      this.playback = true;
    }
    if(keyIsDown(this.keybinds.PAUSE)){
      if(this.paused){
        this.paused = false;
        this.resume();
      }else{
        this.paused = true;
        this.stop();
      }
    }
    if(keyIsDown(this.keybinds.FRAME_ADVANCE) && this.paused){
      this.resume();
    }
    if(keyIsDown(this.keybinds.SAVE_INPUTS)){
      let str = ""
      this.inputs.forEach((v)=>(str+=v+"\n"));
      saveStrings([str],'inputs','tas');
    }
  }
  savestate(vars,load){
    let state = {};
    for(let i = 0; i < vars.length; i++){
      if(typeof window[vars[i]] === "object"){
        state[vars[i]] = JSON.parse(JSON.stringify(window[vars[i]]));
      }else{
        state[vars[i]] = window[vars[i]];
      }
    }
    state.rng = new this.prng(this.rng.a,this.rng.b,this.rng.n);
    state.fc = fc;
    state.inputs = JSON.parse(JSON.stringify(this.inputs));
    print(state);
    if(load){
      this.loadstate(state);
    }
    return state;
  }
  loadstate(state,exclusions){
    if(exclusions === undefined){
      exclusions = [];
    }
    for(let k of Object.keys(state)){
      if(k !== 'rng' && k !== 'inputs' && exclusions.indexOf(k)===-1){
        if(typeof state[k] === 'object'){
          window[k] = JSON.parse(JSON.stringify(state[k]))
        }else{
          window[k] = state[k];
        }
      }
    }
    if(exclusions.indexOf('inputs')==-1){
      this.inputs = JSON.parse(JSON.stringify(state.inputs));
    }
    this.rng.a = state.rng.a;
    this.rng.b = state.rng.b;
    this.rng.n = state.rng.n;
    print("State Loaded!");
  }
  preload(){
    if(this.settings.READ_FILE){
      this.inputs = loadStrings('inputs.tas');
    }
  }
  setup(){
    if(this.settings.PIANO_ROLL){
      width/=2;
    }
    if(this.settings.READ_FILE){
      this.inputs.splice(this.inputs.length-2,2);
      this.playback = true;
    }
    this.stop = ()=>(noLoop());
    this.resume = ()=>(loop());
  }
  update(){
    if(!this.initialState){
      this.initialState = this.savestate(this.vars,true);
      this.state = this.savestate(this.vars,true);
    }
    fc++;
    if(this.settings.PIANO_ROLL){
      fill(0);
      rect(width,0,width,height);
      fill(255);
      rect(width,height-height/10,width,height/10);
      fill(0);
      textAlign(CENTER,CENTER);
      let i = 0;
      if(this.inputs[0]){
        for(let k of Object.keys(JSON.parse(this.inputs[0]))){
          noStroke();
          text(k,width+i*width/(Object.keys(JSON.parse(this.inputs[0])).length)+width/(2*(Object.keys(JSON.parse(this.inputs[0])).length)),height-height/20);
          stroke(0);
          line(width + i*width/(Object.keys(JSON.parse(this.inputs[0])).length),0,width + i*width/(Object.keys(JSON.parse(this.inputs[0])).length),height);
          stroke(255);
          line(width + i*width/(Object.keys(JSON.parse(this.inputs[0])).length),0,width + i*width/(Object.keys(JSON.parse(this.inputs[0])).length),height-height/10);
          i++;
        }
      }
      stroke(0);
      if(this.playback){
        for(let i = 0; i < min((9*height/10)/(width/16),this.inputs.length-fc); i++){
          stroke(255);
          line(width,height-i*width/16-width/16-height/10,width*2,height-i*width/16-width/16-height/10);
          noStroke();
          fill(0,0,255);
          if(this.inputs[i+fc]){
            let obj = JSON.parse(this.inputs[i+fc]);
            let ks = 0;
            for(let k of Object.keys(obj)){
              if(obj[k]){
                rect(width+ks*width/Object.keys(obj).length,height-i*width/16-height/10-width/16,width/Object.keys(obj).length,width/16);
              }
              ks++;
            }
          }
        }
      }else{
        for(let i = this.inputs.length-1; i >= max(this.inputs.length-(9*height/10)/(width/16)-1,0); i--){
          stroke(255);
          line(width,height-(this.inputs.length-i-1)*width/16-width/16-height/10,width*2,height-(this.inputs.length-i-1)*width/16-width/16-height/10);
          noStroke();
          fill(0,0,255);
          if(this.inputs[i]){
            let obj = JSON.parse(this.inputs[i]);
            let ks = 0;
            for(let k of Object.keys(obj)){
              if(obj[k]){
                rect(width+ks*width/Object.keys(obj).length,height-(this.inputs.length-i-1)*width/16-height/10-width/16,width/Object.keys(obj).length,width/16);
              }
              ks++;
            }
          }
        }
      }
      noStroke();
    }
    if(this.settings.TYPE === "FRAME"){
      frameRate(60/this.slowdown);
    }
    if(this.playback && !this.inputs[fc]){
      this.playback = false;
      this.slowdown = this.pslowdown;
    }
    if(this.paused){
      this.stop();
    }
  }
  addInputs(inputs){
    if(!this.playback){
      this.inputs.push(JSON.stringify(inputs));
    }
  }
  getInput(input){
    if(this.inputs[fc] && this.playback){
      return JSON.parse(this.inputs[fc])[input];
    }else{
      return false;
    }
  }
}

let TAS = new tas();

TAS.prng = class{
  constructor(a,b,n){
    this.m = 0b11111111111111111111111111111111
    this.b = b;
    this.a = a;
    this.n = n
  }
  random(){
    this.n = (this.a*this.n+this.b)%this.m;
    return this.n/this.m;
  }
  update(){
    this.n = (this.a*this.n+this.b)%this.m;
  }
}

var fc = 0;

TAS.rng = new TAS.prng(8493752097,3425792826,6254627752);