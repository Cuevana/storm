# Cuevana Storm

Cuevana Storm desktop app based in peerflix module, packaged with node-webkit

#### Build

- Install dependencies.

`npm install`

- Install NodeWebkit. It is not listed as a dependency since you might already have installed it globally.

`npm install nodewebkit@0.9.2`

- You'll also need to use a version of ffmpegsumo that can play videos/audio correctly. There's one packed in the repository, under `ffmpegsumo/**/*`. Pick the one corresponding to your platform and copy to nodewebkit's folder.

`cp ffmpegsumo/YOUR_PLATFORM/* node_modules/nodewebkit/nodewebkit/`

- Optionally, and only if you plan on modifying the code, you have to run `gulp`. It will watch for file changes and automatically compile less into css, and some other stuff. **Not neccessary nor recommended for testers.**

#### Run

`/path/to/nodewebkit . --debug`

For instance, if you followed Build steps to the letter:

`node_modules/nodewebkit/nodewebkit/nw . --debug`

#### Comments

Inspired by Popcorn Time's use of peerflix module. Expanded on their idea.
