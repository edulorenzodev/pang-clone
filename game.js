/* global Phaser */
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 700,
  backgroundColor: '#fff',
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  },
};

new Phaser.Game(config);

let gameOver = false;
let harpoonsGroup;

function preload() {
  this.load.image('bg', 'assets/maya-bg.png');

  this.load.spritesheet('player', 'assets/player-enemies-removebg-preview.png', {
    frameWidth: 30.2,
    frameHeight: 37
  });

  this.load.spritesheet('harpoons', 'assets/harpoons.png', {
    frameWidth: 4,
    frameHeight: 20
  });
}

function create() {
  bg = this.add.image(config.width / 2, config.height / 2, 'bg');
  bg.setDisplaySize(config.width, config.height);

  player = this.physics.add.sprite(50, 50, 'player').setOrigin(0.5, 1).setScale(3);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  timerText = this.add.text(config.width - 30, 20, '60', {
    fontSize: '32px Arial',
    fill: '#000'
  }).setOrigin(1, 0);

  shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  harpoonsGroup = this.physics.add.group();
  this.anims.create({
    key: 'harpoons_anim',
    frames: this.anims.generateFrameNumbers('harpoons', { start: 2, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'player', frame: 0 }],
    frameRate: 10
  });

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 6, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'dead',
    frames: this.anims.generateFrameNumbers('player', { frames: [12] }),
    frameRate: 10,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}


function update() {
  if (gameOver) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-250);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(250);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    shootHarpooon(this, player);
  }

  if (harpoonsGroup) {
    harpoonsGroup.getChildren().forEach(harpoon => {
      if (harpoon.update) harpoon.update();
    });
  }
}

function shootHarpooon(scene, player) {
  if (gameOver) return;

  const harpoon = scene.physics.add.sprite(player.x, player.y, 'harpoons', 0).setOrigin(0.5, 1).setScale(3);
  harpoon.anims.play('harpoons_anim', true);
  harpoon.body.setAllowGravity(false);
  harpoon.setVelocityY(-200);

  harpoon.displayHeight = harpoon.height * harpoon.scaleY;

  harpoonsGroup.add(harpoon);

  const maxHeight = player.y;
  const growSpeed = 20;


  harpoon.update = function () {
    if (harpoon.height < maxHeight) {
      const grow = Math.min(growSpeed, maxHeight - harpoon.displayHeight);
      harpoon.height += grow;
      harpoon.y -= grow;

    } else {
      harpoon.height = maxHeight;
      harpoon.destroy();
    }

    if (this.y < 0 || this.y > config.height) {
      harpoon.destroy();
    }
  };
}

function endGame() {
  gameOver = true;
  timerText.setText('Game Over');
  player.setVelocityX(0);
  player.setVelocityY(0);
  player.anims.stop();
  player.anims.play('dead');
  this.physics.pause();
  this.input.keyboard.removeAllListeners();
  this.input.on('pointerdown', () => {
    location.reload();
  });
}

