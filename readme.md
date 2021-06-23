# P5.TAS

* [Getting Started](#Getting-Started)
* [Usage](#Usage)

P5.TAS is a library to add TAS tools to your P5js games. These tools include savestates, loading those savestates, game speed changer, pausing, and frame advance.

# Getting Started

The newest version of p5.tas is extremely easy to add. Just add the TAS.js to your project and link it with a script tag in the head of your html file. It will bind itself to the current p5 instance and attach to the draw and keyPress functions. It will also overwrite the random and Math.random functions to manipulate rng for playback.

# Usage

## Default Keybinds:

O: Playback current recording.

P: Pause/Play the game.

K: Savestate

L: Loadstate

;: Frame advance

,: Lower play speed

.: Higher play speed

/: Save .tas input file.

I: Undo previous input(only works once in succession, saving a state each frame takes too many resources. If someone finds a better way, please open an issue and tell me, I would love it.)

M: upload an input file and play it back

N: TODO - Open settings page to change keybinds and the style of the loadstate menu(using CSS).

## Creating a TAS

#### Not all games will work with this library. If a certain game doesn't work, open an issue and give me a link to the game as well as a description of which part didn't work, and I will try to fix it. If pausing or slowdown don't work, the game probably has a fixed update rate and will need a custom slowdown and/or pause/play function to work.

First, find the game you want to TAS. It can be any game, but having access to the source code is a must. Add the TAS.js file to the sourcecode and reference it through the HTML file. Once you have done that, upload the files to a web editor like [replit](https://replit.com) or host it on your device. Because of limitations with p5.js, TAS.js doesn't work well if ran on a file:// webpage. Enter the RNG seed when prompted. If you want to play frame perfect, press the p key as soon as the canvas shows. Then, hold down all keys you want pressed and press the semicolon key to advance one frame. If you made a mistake, press I to rewind. When you are finished or want to see your progress thus far, press O to playback your inputs. When you are finished, press / to download the input file. If you want to share, open an issue with a link to the input file(could be pastebin or drive or some other file sharing website) and a link to the game and I would love to watch it. Have fun, and open an issue for any problems or suggestions you have!

## Contributing to a TAS

To contribute to a TAS, you first need a .tas file. This file will have all of the inputs currently used to make the TAS. Open the file with a text editor like notepad and copy the number on the first line. Open the game, and when prompted to enter the rng seed, paste that number. Then, press N, click on the file input, and upload the .tas file. Wait until the playback finishes, then you can continue TASing.