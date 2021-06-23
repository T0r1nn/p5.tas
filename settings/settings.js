function setup(){
  createCanvas(windowWidth,windowHeight);
  keybinds = getItem("TAS_Keybinds")||keybinds;
  theme = getItem("TAS_Theme")||theme;
}

let theme = [[255,255,255],[0,0,0,255],[125,125,125,255]];
let keybinds = {
  SAVESTATE: 75,
  LOADSTATE: 76,
  SLOWDOWN: 188,
  SPEEDUP: 190,
  PLAYBACK: 79,
  PAUSE: 80,
  FRAME_ADVANCE: 186,
  SAVE_INPUTS: 191,
  UNDO: 73,
  SETTINGS: 77,
  LOAD_INPUTS: 78
};
let selectedKeybind = -1;

function draw(){
  storeItem("TAS_Keybinds",keybinds);
  background(theme[0]);
  let size = width/Object.keys(keybinds).length;
  rect(0,0,width,size/3);
  let keys = Object.keys(keybinds);
  textAlign(CENTER,CENTER);
  textSize(size/15);
  for(let i = 0; i < keys.length; i++){
    if(selectedKeybind === i){
      fill(0);
    }else{
      fill(255);
    }
    rect(i*size,0,size/3,size/3);
    rect(i*size+size/3,0,2*size/3,size/3);
    if(selectedKeybind === i){
      fill(255);
    }else{
      fill(0);
    }
    if(mouseIsPressed && mouseX > i*size && mouseX < i*size+size && mouseY > 0 && mouseY < size/3){
      selectedKeybind = i;
    }
    text(keybinds[keys[i]],i*size,0,size/3,size/3)
    text(keys[i],i*size+size/3,0,2*size/3,size/3)
  }
  if(keyIsPressed && selectedKeybind !== -1){
    keybinds[keys[selectedKeybind]] = keyCode;
    selectedKeybind = -1;
  }
}