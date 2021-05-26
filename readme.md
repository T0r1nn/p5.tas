# P5.TAS

* [Getting Started](#Getting-Started)
* [Docs](#Docs)
* [Usage](#Usage)

P5.TAS is a library to add TAS tools to your P5js games. These tools include savestates, loading those savestates, game speed changer, pausing, and frame advance.

# Getting Started

To start, you need to add 1 line of code to each of 4 functions in your sketch. If you don't have any of these functions, define them. These calls need to be the last line of a function, or they may not work as intented.

```js
function preload(){
  TAS.preload();
}

function setup(){
  TAS.setup();
}

function draw(){
  TAS.update();
}

function keyPressed(){
  TAS.onKeyPressed();
}
```

Next, add the following two lines to the bottom of your draw loop.

```js
let inputs = {};
TAS.addInputs(inputs);
```

Then for each input in your game, add a property to the inputs object, like the following.

```js
inputs.mouseX = mouseX;
inputs.mouseY = mouseY;
inputs.mouseDown = mouseIsPressed;
inputs.wPressed = 87;
```

Copy everything that uses the inputs and replace the input in the copy with TAS.getInput(inputName), where inputName is that name of the input in string form(For example, mouseX, mouseY, mouseDown, or wPressed). Then, add if(!TAS.playback) surrounding the original so that people can only input if the TAS is not playing back.

Next, replace every frameCount with fc, and every random with TAS.rng.random. Finally, to make savestates and loadstates work, in the setup function, before TAS.setup(), add TAS.vars, and set it equal to a list of every variable that needs to be saved and loaded in savestates.

# Docs

* [keybinds](#keybinds)
* [settings](#settings)
* [vars](#vars)
* [addVar](#addVar)
* [onKeyPressed](#onKeyPressed)
* [savestate](#savestate)
* [loadstate](#loadstate)
* [preload](#preload)
* [setup](#setup)
* [update](#update)
* [addInputs](#addInputs)
* [getInput](#getInput)
* [rng](#rng)

### keybinds

All keybinds used by P5TAS can be changed using the TAS.keybinds object. To change a keybind, do TAS.keybinds.COMMAND = keyCode, where COMMAND is the name of the keybind and keyCode is the keycode of the key you want that keybind to be.

COMMAND can be one of the following: SAVESTATE, LOADSTATE, SLOWDOWN, SPEEDUP, PLAYBACK, PAUSE, FRAME_ADVANCE, SAVE_INPUTS

[This](https://keycode.info) is a very useful site for finding keycodes.

#### Examples:
```js
TAS.keybinds.SLOWDOWN = 188;
TAS.keybinds.SPEEDUP = 190;
```

### settings

### vars

### addVar

### onKeyPressed

### savestate

### loadstate

### preload

### setup

### update

### addInputs

### getInput

### rng

# Usage