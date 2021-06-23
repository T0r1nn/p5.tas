//Flatted for circular JSON stringifying and parsing
self.Flatted=function(n){"use strict";
/*! (c) 2020 Andrea Giammarchi */var t=JSON.parse,r=JSON.stringify,e=Object.keys,a=String,u="string",f={},i="object",c=function(n,t){return t},l=function(n){return n instanceof a?a(n):n},o=function(n,t){return typeof t===u?new a(t):t},s=function(n,t,r){var e=a(t.push(r)-1);return n.set(r,e),e};return n.parse=function(n,r){var u=t(n,o).map(l),s=u[0],p=r||c,v=typeof s===i&&s?function n(t,r,u,c){for(var l=[],o=e(u),s=o.length,p=0;p<s;p++){var v=o[p],y=u[v];if(y instanceof a){var g=t[y];typeof g!==i||r.has(g)?u[v]=c.call(u,v,g):(r.add(g),u[v]=f,l.push({k:v,a:[t,r,g,c]}))}else u[v]!==f&&(u[v]=c.call(u,v,y))}for(var h=l.length,d=0;d<h;d++){var w=l[d],O=w.k,S=w.a;u[O]=c.call(u,O,n.apply(null,S))}return u}(u,new Set,s,p):s;return p.call({"":v},"",v)},n.stringify=function(n,t,e){for(var a=t&&typeof t===i?function(n,r){return""===n||-1<t.indexOf(n)?r:void 0}:t||c,f=new Map,l=[],o=[],p=+s(f,l,a.call({"":n},"",n)),v=!p;p<l.length;)v=!0,o[p]=r(l[p++],y,e);return"["+o.join(",")+"]";function y(n,t){if(v)return v=!v,t;var r=a.call(this,n,t);switch(typeof r){case i:if(null===r)return r;case u:return f.get(r)||s(f,l,r)}return r}},n}({});

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
      window.open("https://p5tas.tylerbalota.repl.co/settings/settings.html","_blank");
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
  preload() {
    this.loadFile('inputs.tas');
  }
  setup() {
    if (this.settings.READ_FILE) {
      this.inputs.splice(this.inputs.length - 2, 2);
      this.playback = true;
    }
    this.stop = () => (noLoop());
    this.resume = () => (loop());
  }
  update() {
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

let keys = {

}