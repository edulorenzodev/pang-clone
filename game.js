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

function preload() {
  this.load.image('bg', 'assets/maya-bg.png');

  this.load.spritesheet('player', 'assets/player-enemies-removebg-preview.png', {
    frameWidth: 30.2,
    frameHeight: 37
  });
}

function create() {
  bg = this.add.image(config.width / 2, config.height / 2, 'bg');
  bg.setDisplaySize(config.width, config.height);

  player = this.physics.add.sprite(50, 50, 'player').setOrigin(0.5, 1).setScale(3);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  bullets = this.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    runChildUpdate: true
  });

  // timerEvent = this.time.addEvent({
  //   delay: 10000, // 60 seconds
  //   callback: endGame,
  //   callbackScope: this,
  // });

  timerText = this.add.text(config.width - 30, 20, '60', {
    fontSize: '32px Arial',
    fill: '#000'
  }).setOrigin(1, 0);

  shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

  this.anims.create({
    key: 'shoot',
    frames: this.anims.generateFrameNumbers('player', { start: 67, end: 68 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'bullet_anim',
    frames: this.anims.generateFrameNumbers('player', { start: 67, end: 67 }),
    frameRate: 12,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  lastFired = 0;
  fireRate = 300;
}


function update() {
  if (gameOver) return; // Stop updating if the game is over

  // const timeLeft = Math.ceil((timerEvent.delay - timerEvent.getElapsed()) / 1000);
  // timerText.setText(timeLeft);

  // Update logic can go here
  if (cursors.left.isDown) {
    // Move left
    player.setVelocityX(-250);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    // Move right
    player.setVelocityX(250);
    player.anims.play('right', true);
  } else {
    // Stop movement
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    shootBullet(this);
  }

}

function shootBullet(scene) {
  const playerCenterX = player.x;
  const playerTopY = player.y - player.displayHeight;

  // const bullet = bullets.get(playerCenterX, playerTopY, 'player', 67);
  const distanceToTop = playerTopY;

  const hook = bullets.get(playerCenterX, playerTopY, 'player', 67);

  hook.setScale(1, 1); // Adjust size if needed
  hook.setOrigin(0.5, 1); // Centra el origen


  hook.anims.play('bullet_anim'); // Play shooting animation

  const growSpeed = 1200;
  const delta = scene.game.loop.delta; // Convert to seconds
  const crecimiento = distanceToTop / delta; // Calculate the growth speed

  console.log('crecimiento', crecimiento);

  hook.scaleY += crecimiento / hook.height;
  hook.y -= crecimiento / 2

  scene.tweens.add({
    targets: hook,
    scaleY: distanceToTop / hook.height, // Escala vertical hasta el borde superior
    duration: (distanceToTop / growSpeed) * 1000,
    ease: 'Linear',
    onComplete: () => {
      hook.destroy(); // Destroy the hook after it reaches the top
    }
  });

  setTimeout(() => {
    if (!gameOver) player.anims.play('turn');
  }, 200);

  // if (bullet) {
  //   bullet.setActive(true);
  //   bullet.setVisible(true);
  //   bullet.setScale(2); // Adjust size if needed
  //   bullet.setOrigin(0.5, -0.5); // Centra el origen
  //   bullet.body.velocity.y = -300; // Adjust speed as needed
  //   bullet.body.allowGravity = false; // Prevent gravity from affecting the bullet
  //   bullet.anims.play('bullet_anim'); // Play bullet animation

  //   setTimeout(() => {
  //     if (!gameOver) player.anims.play('turn'); // Reset to idle animation after shooting
  //   }, 200); // Hide the bullet after 1 second
  // }
}

function endGame() {
  gameOver = true;
  timerText.setText('Game Over');
  player.setVelocityX(0);
  player.setVelocityY(0);
  player.anims.stop();
  player.anims.play('dead');
  this.physics.pause(); // Pause the physics world
  this.input.keyboard.removeAllListeners(); // Remove all keyboard listeners
  this.input.on('pointerdown', () => {
    // Restart the game on pointer down
    location.reload(); // Reload the page to restart the game
  });
}

