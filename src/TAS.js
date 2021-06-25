class tas {
  constructor() {
    this.inputs = [];
    this.slowdown = 2;
    this.pslowdown = 2;
    this.prevState = {};
    this.keybinds = p5.prototype.getItem("TAS_keybinds")||{
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
    this.settings = {
      READ_FILE: false
    }
    this.setSlowdown = ((s) => (frameRate(60 / s)));
    this.minSlowdown = 1;
    this.maxSlowdown = 60;
    this.playback = false;
    this.states = [];
    this.menuOpen = false;
    this.vars = [];
    this.paused = false;
    this.config = {};
  }
  configureInput(inputName, settings) {
    this.config[inputName] = settings;
  }
  input(input, inputName) {
    if (this.playback) {
      return TAS.getInput(inputName);
    } else {
      return input;
    }
  }
  addVar(name) {
    if (typeof name === 'string') {
      if (window[name] !== undefined) {
        this.vars.push(name);
      } else {
        throw "TasNameError, variable " + name + " is not defined correctly.";
      }
    } else if (typeof name === 'object' && name.length !== undefined) {
      for (let n of name) {
        if (window[n] !== undefined) {
          this.vars.push(n);
        } else {
          throw "TasNameError, variable " + n + " is not defined correctly.";
        }
      }
    } else {
      throw "TasNameError, " + name + " is not an array or a string.";
    }
  }
  onKeyPressed() {
    if (keyIsDown(this.keybinds.SAVESTATE, true)) {
      this.states.push(this.savestate());
      if (this.menuOpen) {
        this.loadstateMenu(false);
        this.loadstateMenu(true);
      }
    }
    if (keyIsDown(this.keybinds.LOADSTATE, true)) {
      this.loadstateMenu(!this.menuOpen);
      this.menuOpen = !this.menuOpen;
    }
    if (keyIsDown(this.keybinds.SLOWDOWN, true)) {
      this.slowdown *= 1.5;
      this.slowdown = min(this.maxSlowdown, this.slowdown);
    }
    if (keyIsDown(this.keybinds.SPEEDUP, true)) {
      this.slowdown /= 1.5;
      this.slowdown = max(this.minSlowdown, this.slowdown);
    }
    if (keyIsDown(this.keybinds.PLAYBACK, true)) {
      this.endState = this.savestate(false, 'End_State');
      this.loadstate(this.initialState, ['inputs']);
      this.pslowdown = this.slowdown;
      this.slowdown = 1;
      this.playback = true;
    }
    if (keyIsDown(this.keybinds.PAUSE,true)) {
      if (this.paused) {
        this.paused = false;
        this.resume();
      } else {
        this.paused = true;
        this.stop();
      }
    }
    if (keyIsDown(this.keybinds.FRAME_ADVANCE,true) && this.paused) {
      this.resume();
    }
    if (keyIsDown(this.keybinds.SAVE_INPUTS,true)) {
      let str = `${seed}\n`
      this.inputs.forEach((v) => (str += v + "\n"));
      saveStrings([str], 'inputs', 'tas');
    }
    if (keyIsDown(this.keybinds.UNDO,true)) {
      if (this.inputs.length > 1) {
        this.loadstate(this.prevState);
      }
    }
    if(keyIsDown(this.keybinds.SETTINGS,true)){
      window.open("https://p5tas.awesomeness278.repl.co/settings/settings.html","_blank");
    }
    if(keyIsDown(this.keybinds.LOAD_INPUTS,true)){
      if(document.getElementById('states').innerHTML === ""){
        let inp = document.createElement('input');
        inp.setAttribute('id','inp');
        inp.setAttribute('type','file');
        inp.oninput = function(){
          document.getElementById('inp').files[0].text().then((a)=>(TAS.text = a));
        }
        document.getElementById('states').appendChild(inp);
      }else{
        document.getElementById('states').innerHTML = "";
      }
    }
  }
  savestate(load, name) {
    let state = deepClone(window);
    state.rng = new this.prng(this.rng.mw, this.rng.mz);
    state.fc = fc;
    state.inputs = JSON.parse(JSON.stringify(this.inputs)).slice(0, fc - 1);
    if (load) {
      this.loadstate(state);
    }
    if (name !== undefined) {
      state.name = name;
    } else {
      state.name = prompt("Enter a name for the savestate").replace(/\s/g, "_");
    }
    return state;
  }
  loadstate(state, exclusions) {
    if (exclusions === undefined) {
      exclusions = [];
    }
    if (typeof state === 'string') {
      for (let i = 0; i < this.states.length; i++) {
        if (this.states[i].name === state) {
          state = this.states[i];
          break;
        }
      }
    }
    for (let k in (state)) {
      if (k !== 'rng' && k !== 'name' && k !== 'inputs' && exclusions.indexOf(k) === -1 && k !== "document" && k !== "customElements" && k !== "history" && k !== "closed" && k !== "frameElement" && k !== "p5" && k !== "performance" && !p5.instance[k]) {
        try {
          if (typeof state[k] === 'object' || typeof state[k] === "function") {
            window[k] = deepClone(state[k]);
          } else {
            window[k] = state[k];
          }
        } catch (e) { }
      }
    }
    if (exclusions.indexOf('inputs') == -1) {
      this.inputs = JSON.parse(JSON.stringify(state.inputs));
    }
    this.rng.mw = state.rng.mw;
    this.rng.mz = state.rng.mz;
  }
  loadstateMenu(show) {
    if (show) {
      let elements = `<ul id="states">`
      for (let i = 0; i < this.states.length; i++) {
        elements += `<li class="state"><button onclick=TAS.loadstate("${this.states[i].name}")>${this.states[i].name}</button><button onclick=TAS.deletestate("${this.states[i].name}")>delete</button></li>`;
      }
      document.getElementById('states').innerHTML += elements + "</ul>";
    } else {
      document.getElementById('states').innerHTML = '';
    }
  }
  deletestate(state) {
    if (state === 'Initial') {
      return;
    }
    for (let i = 0; i < this.states.length; i++) {
      if (this.states[i].name === state) {
        this.states.splice(i, 1);
        this.loadstateMenu(false);
        this.loadstateMenu(true);
        return;
      }
    }
  }
  loadFile(file) {
    if (this.settings.READ_FILE) {
      this.inputs = loadStrings(file);
      this.rng.random.mw = 1 * this.inputs[0];
    }
  }
  setup() {
    this.cursor = loadImage("https://p5tas.awesomeness278.repl.co/src/assets/cursor.png")
    if (this.settings.READ_FILE) {
      this.inputs.splice(this.inputs.length - 2, 2);
      this.playback = true;
    }
    this.stop = () => (noLoop());
    this.resume = () => (loop());
  }
  update() {
    push();
    if (!this.initialState) {
      this.initialState = this.savestate(true, '');
      this.prevState = this.savestate(true, '');
      this.states[0] = this.savestate(true, 'Initial');
    }
    fc++;
    this.getInputs();
    this.setSlowdown(this.slowdown);
    if (this.playback && !this.inputs[fc]) {
      this.playback = false;
      this.slowdown = this.pslowdown;
    }
    if (this.paused) {
      this.stop();
    }
    if(this.text){
      this.text = this.text.split('\n');
      this.rng.mw = this.text[0]*1;
      this.inputs = this.text.slice(1,this.text.length);
      this.playback = true;
      this.pslowdown = this.slowdown;
      this.paused = false;
      this.slowdown = 1;
      this.loadstate(this.initialState,['inputs']);
      this.text = undefined;
    }
    drawKeyboard(width/5*4,height-(width/5)/16 * 5,width/5);
    if(this.playback){
      //turn off mouse, draw fake mouse pointer
      noCursor();
      //495x897
      let ratio = 20/897;
      image(this.cursor,this.getInput("mouseX"),this.getInput("mouseY"),ratio*495,20);
    }else{
      //turn on mouse
      cursor();
    }
    pop();
  }
  getInputs() {
    let inputs = JSON.parse(JSON.stringify(p5.instance._downKeys));
    inputs["mouseX"] = mouseX;
    inputs["mouseY"] = mouseY;
    inputs["mousePressed"] = mouseIsPressed;
    this.addInputs(inputs);
  }
  addInputs(inputs) {
    if (!this.playback) {
      this.prevState = this.savestate(false, 'Input ' + fc);
      this.inputs.push(JSON.stringify(inputs));
    }
  }
  getInput(input) {
    if (this.inputs[fc] && this.playback) {
      let val = JSON.parse(this.inputs[fc])[input];
      if(val === undefined){
        return false;
      }
      return val;
    } else {
      return false;
    }
  }
}

let TAS = new tas();

TAS.prng = class {
  constructor(seed, mz) {
    this.mz = 1234567890;
    if (mz) {
      this.mz = mz;
    }
    this.mw = seed;
  }
  random(m1, m2) {
    let mz = this.mz;
    let mw = this.mw;
    mz = ((mz & 0xffff) * 36969 + (mz >> 16)) & 0xffffffff;
    mw = ((mw & 0xffff) * 18000 + (mw >> 16)) & 0xffffffff;

    this.mz = mz;
    this.mw = mw;

    const x = (((mz << 16) + mw) & 0xffffffff) / 0x100000000;
    let result = 0.5 + x;
    if (m1 !== undefined && m2 === undefined) {
      if (typeof m1 === 'object') {
        return m1[Math.floor(result * m1.length)];
      } else {
        return result * m1;
      }
    } else if (m1 !== undefined && m2 !== undefined) {
      return result * (m2 - m1) + m1;
    } else if (m1 == undefined && m2 == undefined) {
      return result;
    }
  }
  update() {
    let mz = this.mz;
    let mw = this.mw;
    mz = ((mz & 0xffff) * 36969 + (mz >> 16)) & 0xffffffff;
    mw = ((mw & 0xffff) * 18000 + (mw >> 16)) & 0xffffffff;

    this.mz = mz;
    this.mw = mw;
  }
}


var fc = 0;
let seed = prompt("Input any number") * 1;
if (isNaN(seed)) {
  seed = Math.round(Math.random() * 10000000);
}
TAS.rng = new TAS.prng(seed);

let stateDiv = document.createElement("div");
stateDiv.id = "states";

setTimeout(() => document.body.appendChild(stateDiv), 1);

Math.random = function(){
  return TAS.rng.random.apply(TAS.rng,arguments);
}

function bind() {
  p5.prototype.random = function () { return TAS.rng.random.apply(TAS.rng, arguments) };
  if (p5.instance) {
    if (window.draw) {
      let temp = draw.toString();
      temp = temp.replace(/function draw.*(.*).*{.*\n/, "mouseIsPressed = (TAS.getInput('mousePressed') && TAS.playback)||(mouseIsPressed && !TAS.playback);\n");
      temp = "if(TAS.playback){mouseX = TAS.getInput('mouseX');mouseY = TAS.getInput('mouseY');mouseIsPressed = TAS.getInput('mousePressed');if(TAS.getInput('mousePressed')&&!JSON.parse(TAS.inputs[fc-1]).mousePressed){try{mousePressed()}catch(e){}}}\n  frameCount = fc;"+temp;
      temp = temp.slice(0, temp.length - 2);
      temp += "\n  TAS.update();";
      draw = function () {
        eval(temp);
      }
    }
    if (window.keyPressed) {
      let temp = keyPressed.toString();
      temp = temp.replace(/function keyPressed.*(.*).*{.*\n/, "");
      temp = temp.slice(0, temp.length - 2);
      temp += "\n  TAS.onKeyPressed();\n}";
      keyPressed = function () {
        eval(temp);
      }
    } else {
      window.keyPressed = function () {
        TAS.onKeyPressed();
      }
    }
    TAS.setup();
    keyIsDown = function (code, bypass) {
      if (!TAS.playback || bypass) {
        p5._validateParameters('keyIsDown', arguments);
        return p5.instance._downKeys[code] || false;
      } else {
        p5._validateParameters('keyIsDown', arguments);
        return TAS.getInput(code);
      }
    }
  } else {
    setTimeout(bind, 1);
  }
}

function replacer(key, value) {
  if (key === "window" || key === "self" || key === "frames" || key === "top" || key === "parent" || key === "_preloadMethods" || key === "_curElement" || key === "_elements" || key === "_renderer") return undefined;
  if (Object.getOwnPropertyDescriptor(window, key)) {
    if (!Object.getOwnPropertyDescriptor(window, key)['writable']) {
      return undefined;
    }
  }
  return value;
}

bind();

function deepClone(obj) {
  var visitedNodes = [];
  var clonedCopy = [];
  function clone(item) {
    if (typeof item === "object" && !Array.isArray(item)) {
      if (visitedNodes.indexOf(item) === -1) {
        visitedNodes.push(item);
        var cloneObject = {};
        clonedCopy.push(cloneObject);
        for (var i in item) {
          if (item.hasOwnProperty(i)) {
            cloneObject[i] = clone(item[i]);
          }
        }
        try{
        if(item.__proto__){
          cloneObject["__proto__"] = item.__proto__;
        }
        }catch(e){}
        return cloneObject;
      } else {
        return clonedCopy[visitedNodes.indexOf(item)];
      }
    }
    else if (typeof item === "object" && Array.isArray(item)) {
      if (visitedNodes.indexOf(item) === -1) {
        var cloneArray = [];
        visitedNodes.push(item);
        clonedCopy.push(cloneArray);
        for (var j = 0; j < item.length; j++) {
          cloneArray.push(clone(item[j]));
        }
        return cloneArray;
      } else {
        return clonedCopy[visitedNodes.indexOf(item)];
      }
    }

    return item; // not object, not array, therefore primitive
  }
  return clone(obj);
}

p5.prototype._updateNextMouseCoords = function(e) {
  const mousePos = getMousePos(
    this._curElement.elt,
    this.width,
    this.height,
    e
  );
  if(!TAS.playback){
    this._setProperty('movedX', mousePos.x-this.pmouseX);
    this._setProperty('movedY', mousePos.y-this.pmouseY);
    this._setProperty('mouseX', mousePos.x);
    this._setProperty('mouseY', mousePos.y);
    this._setProperty('winMouseX', mousePos.winX);
    this._setProperty('winMouseY', mousePos.winY);
  }else{
    this._setProperty('movedX', TAS.getInput("mouseX")-this.pmouseX);
    this._setProperty('movedY', TAS.getInput("mouseY")-this.pmouseY);
    this._setProperty('mouseX', TAS.getInput("mouseX"));
    this._setProperty('mouseY', TAS.getInput("mouseY"));
    this._setProperty('winMouseX', TAS.getInput("mouseX"));
    this._setProperty('winMouseY', TAS.getInput("mouseY"));
  }
  // For first draw, make previous and next equal
  this._updateMouseCoords();
  this._setProperty('_hasMouseInteracted', true);
};

function getMousePos(canvas, w, h, evt) {
  if (evt && !evt.clientX) {
    // use touches if touch and not mouse
    if (evt.touches) {
      evt = evt.touches[0];
    } else if (evt.changedTouches) {
      evt = evt.changedTouches[0];
    }
  }
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.scrollWidth / w || 1;
  const sy = canvas.scrollHeight / h || 1;
  return {
    x: (evt.clientX - rect.left) / sx,
    y: (evt.clientY - rect.top) / sy,
    winX: evt.clientX,
    winY: evt.clientY,
    id: evt.identifier
  };
}

function drawKeyboard(x,y,w){
  let keys = _downKeys;
  let posKeys = Object.keys(keyEnum);
  let size = w/16;
  push();
  textSize(size/3)
  for(let i = 0; i < posKeys.length; i++){
    let item = keyEnum[posKeys[i]];
    fill(255-(!!keyIsDown(posKeys[i]))*255)
    rect(x+item.x*size,y+item.y*size,size*item.w,size*item.h);
    textAlign(CENTER,CENTER);
    fill((!!keyIsDown(posKeys[i]))*255);
    text(item.key,x+item.x*size,y+item.y*size,size*item.w,size*item.h);
  }
  pop();
}

let keyEnum = {
  "192":{key:"`",x:0,y:0,w:1,h:1},
  "9":{key:"TAB",x:0,y:1,w:1.25,h:1},
  "20":{key:"CAPS",x:0,y:2,w:1.5,h:1},
  "16":{key:"SHIFT",x:0,y:3,w:2,h:1},
  "17":{key:"CTRL",x:0,y:4,w:1.25,h:1},
  "??":{key:"FN",x:1.25,y:4,w:0.75,h:1},
  "49":{key:"1",x:1,y:0,w:1,h:1},
  "50":{key:"2",x:2,y:0,w:1,h:1},
  "51":{key:"3",x:3,y:0,w:1,h:1},
  "52":{key:"4",x:4,y:0,w:1,h:1},
  "53":{key:"5",x:5,y:0,w:1,h:1},
  "54":{key:"6",x:6,y:0,w:1,h:1},
  "55":{key:"7",x:7,y:0,w:1,h:1},
  "56":{key:"8",x:8,y:0,w:1,h:1},
  "57":{key:"9",x:9,y:0,w:1,h:1},
  "48":{key:"0",x:10,y:0,w:1,h:1},
  "189":{key:"-",x:11,y:0,w:1,h:1},
  "187":{key:"=",x:12,y:0,w:1,h:1},
  "8":{key:"BACK",x:13,y:0,w:2,h:1},
  "36":{key:"HM",x:15,y:0,w:1,h:1},
  "65":{key:"a",x:1.5,y:2,w:1,h:1},
  "66":{key:"b",x:6,y:3,w:1,h:1},
  "67":{key:"c",x:4,y:3,w:1,h:1},
  "68":{key:"d",x:3.5,y:2,w:1,h:1},
  "69":{key:"e",x:3.25,y:1,w:1,h:1},
  "70":{key:"f",x:4.5,y:2,w:1,h:1},
  "71":{key:"g",x:5.5,y:2,w:1,h:1},
  "72":{key:"h",x:6.5,y:2,w:1,h:1},
  "73":{key:"i",x:8.25,y:1,w:1,h:1},
  "74":{key:"j",x:7.5,y:2,w:1,h:1},
  "75":{key:"k",x:8.5,y:2,w:1,h:1},
  "76":{key:"l",x:9.5,y:2,w:1,h:1},
  "77":{key:"m",x:8,y:3,w:1,h:1},
  "78":{key:"n",x:7,y:3,w:1,h:1},
  "79":{key:"o",x:9.25,y:1,w:1,h:1},
  "80":{key:"p",x:10.25,y:1,w:1,h:1},
  "81":{key:"q",x:1.25,y:1,w:1,h:1},
  "82":{key:"r",x:4.25,y:1,w:1,h:1},
  "83":{key:"s",x:2.5,y:2,w:1,h:1},
  "84":{key:"t",x:5.25,y:1,w:1,h:1},
  "85":{key:"u",x:7.25,y:1,w:1,h:1},
  "86":{key:"v",x:5,y:3,w:1,h:1},
  "87":{key:"w",x:2.25,y:1,w:1,h:1},
  "88":{key:"x",x:3,y:3,w:1,h:1},
  "89":{key:"y",x:6.25,y:1,w:1,h:1},
  "90":{key:"z",x:2,y:3,w:1,h:1},
  "91":{key:"WIN",x:2,y:4,w:1,h:1},
  "18":{key:"ALT",x:3,y:4,w:1,h:1},
  "32":{key:"SPACE",x:4,y:4,w:5,h:1},
  "18,2":{key:"ALT",x:9,y:4,w:1,h:1},
  "188":{key:",",x:9,y:3,w:1,h:1},
  "190":{key:".",x:10,y:3,w:1,h:1},
  "191":{key:"/",x:11,y:3,w:1,h:1},
  "rightFn":{key:"FN",x:10,y:4,w:1,h:1},
  "rightCtrl":{key:"CTL",x:11,y:4,w:1,h:1},
  "37":{key:"",x:12,y:4,w:1,h:1},
  "38":{key:"",x:13,y:4,w:1,h:0.5},
  "40":{key:"",x:13,y:4.5,w:1,h:0.5},
  "39":{key:"",x:14,y:4,w:1,h:1},
  "rightShift":{key:"SHIFT",x:12,y:3,w:3,h:1},
  "186":{key:";",x:10.5,y:2,w:1,h:1},
  "222":{key:"'",x:11.5,y:2,w:1,h:1},
  "13":{key:"ENTER",x:12.5,y:2,w:2.5,h:1},
  "219":{key:"[",x:11.25,y:1,w:1,h:1},
  "221":{key:"]",x:12.25,y:1,w:1,h:1},
  "220":{key:"\\",x:13.25,y:1,w:1.75,h:1},
  "33":{key:"PGU",x:15,y:1,w:1,h:1},
  "34":{key:"PGD",x:15,y:2,w:1,h:1},
  "35":{key:"END",x:15,y:3,w:1,h:1},
  "44":{key:"PRT",x:15,y:4,w:1,h:1}
}