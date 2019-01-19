// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function () {

  // game stats
  this.stats = {
    health: 100,
    fun: 100,
  }

};

// load asset files for our game
gameScene.preload = function () {

  // load assets
  this.load.image('backyard', 'assets/images/backyard.png');
  this.load.image('apple', 'assets/images/apple.png');
  this.load.image('candy', 'assets/images/candy.png');
  this.load.image('rotate', 'assets/images/rotate.png');
  this.load.image('toy', 'assets/images/rubber_duck.png');

  // load spritesheet
  this.load.spritesheet('pet', 'assets/images/pet.png', {

    // sprite properties
    frameWidth: 97,
    frameHeight: 83,
    margin: 1,
    spacing: 1,

  })

};

// executed once, after assets were loaded
gameScene.create = function () {

  // add game background
  this.bg = this.add.sprite(0, 0, 'backyard').setOrigin(0, 0).setInteractive()

  // add event listener for background
  this.bg.on('pointerdown', this.placeItem, this)

  // add pet
  this.pet = this.add.sprite(100, 200, 'pet', 0).setInteractive()

  // make pet draggable
  this.input.setDraggable(this.pet)

  // follow pointer (mouse/finger) when dragging
  this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

    // make sprite be located at the drag coordinates
    gameObject.x = dragX
    gameObject.y = dragY

  })

  // create ui
  this.createUI()

};

// create ui
gameScene.createUI = function () {

  // add apple button and set/define interactivity
  this.appleButton = this.add.sprite(72, 570, 'apple').setInteractive()
  this.appleButton.customStats = { health: 20, fun: 0 }
  this.appleButton.on('pointerdown', this.pickItem)

  // add candy button and set/define interactivity
  this.candyButton = this.add.sprite(144, 570, 'candy').setInteractive()
  this.candyButton.customStats = { health: -10, fun: 10 }
  this.candyButton.on('pointerdown', this.pickItem)

  // add toy button and set/define interactivity
  this.toyButton = this.add.sprite(216, 570, 'toy').setInteractive()
  this.toyButton.customStats = { health: 0, fun: 15 }
  this.toyButton.on('pointerdown', this.pickItem)

  // add rotate button and set/define interactivity
  this.rotateButton = this.add.sprite(288, 570, 'rotate').setInteractive()
  this.rotateButton.on('pointerdown', this.rotatePet)

  // array with all buttons
  this.buttons = [this.appleButton, this.candyButton, this.toyButton, this.rotateButton]

  // ui is not blocked
  this.uiBlocked = false

  // refresh ui
  this.uiReady()

}

// rotate pet
gameScene.rotatePet = function () {

  // check if the user interface is blocked
  // prevents sprite from rotating during actions
  if (this.scene.uiBlocked) return

  // make sure ui is ready
  this.scene.uiReady()

  // block the ui for rotation action
  this.scene.uiBlocked = true

  // dim the rotate icon
  this.alpha = 0.5

  let scene = this.scene

  setTimeout(function () {

    // set scene back to ready
    scene.uiReady()

  }, 2000)

}

// pick item
gameScene.pickItem = function () {

  // check if the user interface is blocked
  // prevents items from being picked during actions
  if (this.scene.uiBlocked) return

  // make sure the ui is ready
  this.scene.uiReady()

  // select item
  this.scene.selectedItem = this

  // change transparency of selected sprite
  this.alpha = 0.5

}

// set ui to ready
gameScene.uiReady = function () {

  // make sure nothing is being selected
  this.selectedItem = null

  // no transparency (alpha) on all buttons
  for (button in this.buttons) {

    this.buttons[button].alpha = 1

  }

  // scene must be unblocked
  this.uiBlocked = false

}

// place a new item in gamescene
gameScene.placeItem = function (pointer, localX, localY) {

  // check that an item was selected
  if (!this.selectedItem) return

  // create a new item at the click position
  let newItem = this.add.sprite(localX, localY, this.selectedItem.texture.key)

  // pet stats
  for (stat in this.selectedItem.customStats) {
    if (this.selectedItem.customStats.hasOwnProperty(stat)) {

      this.stats[stat] += this.selectedItem.customStats[stat]

    }
  }

  // clear UI
  this.uiReady()

}

// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Virtual Pet',
  pixelArt: false,
  backgroundColor: 'ffffff'
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
