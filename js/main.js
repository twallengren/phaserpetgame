// create a new scene
let gameScene = new Phaser.Scene("Game");

// some parameters for our scene
gameScene.init = function() {
  // game stats
  this.stats = {
    health: 100,
    fun: 100
  };

  // decay parameters
  this.decayRates = {
    health: -5,
    fun: -2
  };
};

// load asset files for our game
gameScene.preload = function() {
  // load assets
  this.load.image("backyard", "assets/images/backyard.png");
  this.load.image("apple", "assets/images/apple.png");
  this.load.image("candy", "assets/images/candy.png");
  this.load.image("rotate", "assets/images/rotate.png");
  this.load.image("toy", "assets/images/rubber_duck.png");

  // load spritesheet
  this.load.spritesheet("pet", "assets/images/pet.png", {
    // sprite properties
    frameWidth: 97,
    frameHeight: 83,
    margin: 1,
    spacing: 1
  });
};

// executed once, after assets were loaded
gameScene.create = function() {
  // add game background
  this.bg = this.add
    .sprite(0, 0, "backyard")
    .setOrigin(0, 0)
    .setInteractive();

  // add event listener for background
  this.bg.on("pointerdown", this.placeItem, this);

  // add pet
  this.pet = this.add.sprite(100, 200, "pet", 0).setInteractive();
  this.pet.depth = 1;

  // make pet draggable
  this.input.setDraggable(this.pet);

  // pet animation
  this.anims.create({
    key: "funnyfaces",
    frames: this.anims.generateFrameNames("pet", { frames: [1, 2, 3] }),
    frameRate: 7,
    yoyo: true,
    repeat: 0
  });

  // follow pointer (mouse/finger) when dragging
  this.input.on("drag", function(pointer, gameObject, dragX, dragY) {
    // make sprite be located at the drag coordinates
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // create ui
  this.createUI();

  // show stats to the user
  this.createHud();
  this.refreshHud();

  // decay of health and fun over time
  this.timedEventStats = this.time.addEvent({
    delay: 1000, // ms
    repeat: -1, // repeat forever
    callback: function() {
      // update stats
      this.updateStats(this.decayRates);
    },
    callbackScope: this
  });
};

// create ui
gameScene.createUI = function() {
  // add apple button and set/define interactivity
  this.appleButton = this.add.sprite(72, 570, "apple").setInteractive();
  this.appleButton.customStats = { health: 20, fun: 0 };
  this.appleButton.on("pointerdown", this.pickItem);

  // add candy button and set/define interactivity
  this.candyButton = this.add.sprite(144, 570, "candy").setInteractive();
  this.candyButton.customStats = { health: -10, fun: 10 };
  this.candyButton.on("pointerdown", this.pickItem);

  // add toy button and set/define interactivity
  this.toyButton = this.add.sprite(216, 570, "toy").setInteractive();
  this.toyButton.customStats = { health: 0, fun: 15 };
  this.toyButton.on("pointerdown", this.pickItem);

  // add rotate button and set/define interactivity
  this.rotateButton = this.add.sprite(288, 570, "rotate").setInteractive();
  this.rotateButton.customStats = { fun: 20 };
  this.rotateButton.on("pointerdown", this.rotatePet);

  // array with all buttons
  this.buttons = [
    this.appleButton,
    this.candyButton,
    this.toyButton,
    this.rotateButton
  ];

  // ui is not blocked
  this.uiBlocked = false;

  // refresh ui
  this.uiReady();
};

// rotate pet
gameScene.rotatePet = function() {
  // check if the user interface is blocked
  // prevents sprite from rotating during actions
  if (this.scene.uiBlocked) return;

  // make sure ui is ready
  this.scene.uiReady();

  // block the ui for rotation action
  this.scene.uiBlocked = true;

  // dim the rotate icon
  this.alpha = 0.5;

  // rotation tween
  let rotateTween = this.scene.tweens.add({
    targets: this.scene.pet,
    duration: 600,
    angle: 720,
    pause: false,
    callbackScope: this,
    onComplete: function(tween, sprites) {
      // update stats
      this.scene.updateStats(this.customStats);

      // set UI to ready
      this.scene.uiReady();
    }
  });
};

// pick item
gameScene.pickItem = function() {
  // check if the user interface is blocked
  // prevents items from being picked during actions
  if (this.scene.uiBlocked) return;

  // make sure the ui is ready
  this.scene.uiReady();

  // select item
  this.scene.selectedItem = this;

  // change transparency of selected sprite
  this.alpha = 0.5;
};

// set ui to ready
gameScene.uiReady = function() {
  // make sure nothing is being selected
  this.selectedItem = null;

  // no transparency (alpha) on all buttons
  for (button in this.buttons) {
    this.buttons[button].alpha = 1;
  }

  // scene must be unblocked
  this.uiBlocked = false;
};

// place a new item in gamescene
gameScene.placeItem = function(pointer, localX, localY) {
  // check that an item was selected
  if (!this.selectedItem) return;

  // ui must be unblocked
  if (this.uiBlocked) return;

  // create a new item at the click position
  let newItem = this.add.sprite(localX, localY, this.selectedItem.texture.key);

  // block UI
  this.uiBlocked = true;

  // pet movement (tween)
  let petTween = this.tweens.add({
    targets: this.pet,
    duration: 500,
    x: newItem.x,
    y: newItem.y,
    paused: false,
    callbackScope: this,
    onComplete: function(tween, sprites) {
      // destroy item
      newItem.destroy();

      // event listener for when spritesheet animation ends
      this.pet.on(
        "animationcomplete",
        function() {
          // set pet back to neutral face
          this.pet.setFrame(0);

          // clear ui
          this.uiReady();
        },
        this
      );

      // play spritesheet animation
      this.pet.play("funnyfaces");
    }
  });

  // update stats
  this.updateStats(this.selectedItem.customStats);
};

// create the text elements that will show the stats
gameScene.createHud = function() {
  // health stat
  this.healthText = this.add.text(20, 20, "Health: ", {
    font: "26px Arial",
    fill: "#ffffff"
  });

  // fun stat
  this.funText = this.add.text(170, 20, "Fun: ", {
    font: "26px Arial",
    fill: "#ffffff"
  });
};

// show the current value of health and fun
gameScene.refreshHud = function() {
  this.healthText.setText("Health: " + this.stats.health);
  this.funText.setText("Fun: " + this.stats.fun);
};

// stat updater
gameScene.updateStats = function(statDiff) {
  // flag to see if game over
  let isGameOver = false;

  // pet stats
  for (stat in statDiff) {
    if (statDiff.hasOwnProperty(stat)) {
      this.stats[stat] += statDiff[stat];

      // stats cannot be less than zero
      if (this.stats[stat] <= 0) {
        isGameOver = true;
        this.stats[stat] = 0;
      }
    }
  }

  // refresh HUD
  this.refreshHud();

  // check to see if game over
  if (isGameOver) this.gameOver();
};

gameScene.gameOver = function() {
  console.log("game over");
};

// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: "Virtual Pet",
  pixelArt: false,
  backgroundColor: "ffffff"
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
