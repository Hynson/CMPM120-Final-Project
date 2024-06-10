let game;

// global game options
let gameOptions = {

    // platform speed range, in pixels per second
    platformSpeedRange: [300, 300],

    // mountain speed, in pixels per second
    mountainSpeed: 80,

    // spawn range, how far should be the rightmost platform from the right edge
    // before next platform spawns, in pixels
    spawnRange: [80, 300],

    // platform width range, in pixels
    platformSizeRange: [90, 300],

    // a height range between rightmost platform and next platform to be spawned
    platformHeightRange: [-5, 5],

    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 20,

    // platform max and min height, as screen height ratio
    platformVerticalLimit: [0.4, 0.8],

    // player gravity
    playerGravity: 900,

    // player jump force
    jumpForce: 400,

    // player starting X position
    playerStartPosition: 200,

    // consecutive jumps allowed
    jumps: 2,

    // % of probability a coin appears on the platform
    coinPercent: 25,

    // % of probability a fire appears on the platform
    firePercent: 25,
}

window.onload = function() {

    // object containing configuration options
    let gameConfig = {
        type: Phaser.AUTO,
        width: 1334,
        height: 750,
        scene: [gameStart, preloadGame, playGame, gameEnd],

        // physics settings
        physics: {
            default: "arcade"
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

class gameStart extends Phaser.Scene {
    constructor(){
        super("gameStart");
        this.my = {sprite: {}, text: {}};
        
    }

    preload(){
        this.load.setPath("./assets/");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.image("bg","bg.png");
    }

    create(){
        let my = this.my;
        this.bg = this.add.tileSprite(0,0,game.config.width,game.config.height,"bg").setScale(2);
        const name = this.add.bitmapText(180, 180, "rocketSquare", "The (Legally Distinct) Finals", 50);
        
        const objective = this.add.bitmapText(370, 300, "rocketSquare", "Run for your life in this deadly game show!", 20);
        const controls = this.add.bitmapText(370, 360, "rocketSquare", "Press SPACE to jump (DOUBLE JUMP POSSIBLE!)", 20);
        
        const controlsTwo = this.add.bitmapText(370, 380, "rocketSquare", "Pick up coins to get a chance of gaining a shield", 20);
        const controlsThree = this.add.bitmapText(370, 400, "rocketSquare", "Shields destroy fire (which kill if you touch them without a shield)", 20);
        const start = this.add.bitmapText(370, 450, "rocketSquare", "Press SPACE to start your run!",25);
        const data = this.add.bitmapText(370, 700, "rocketSquare", "Press P to clear high score data",25);
        name.setBlendMode(Phaser.BlendModes.ADD);
        objective.setBlendMode(Phaser.BlendModes.ADD);
        controls.setBlendMode(Phaser.BlendModes.ADD);
        controlsTwo.setBlendMode(Phaser.BlendModes.ADD);
        controlsThree.setBlendMode(Phaser.BlendModes.ADD);
        start.setBlendMode(Phaser.BlendModes.ADD);
        data.setBlendMode(Phaser.BlendModes.ADD);
        this.input.keyboard.on("keydown_SPACE", this.nextScene, this);
        this.input.keyboard.on("keydown_P", this.clearData, this);
    }

    clearData(){
        localStorage.removeItem("this.myHighScore");
    }

    nextScene(){
      this.scene.start("PreloadGame");
    }

    update(){
        
    }
    
}

// preloadGame scene
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.setPath("./assets/");

        this.load.image("platform", "platform.png");
        
        this.load.image("bg","bg.png");

        this.load.image("shield", "shield3.png",);

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.audio("coinCollect","confirmation_003.ogg");

        this.load.audio("playerBurnt","explosionCrunch_001.ogg");

        this.load.audio("crowdShock","crowdShock.ogg");

        this.load.audio("crowdShock2","crowdShock2.ogg");

        this.load.audio("crowdCheer","crowdCheer.ogg");

        this.load.audio("playerDeath","BodyImpact1.wav");

        this.load.audio("crowdSad","crowdSad.mp3");

        this.load.audio("runStart","runStart.ogg");

        this.load.audio("newHighScore","newHighScore.ogg");

        this.load.audio("shieldUp","shieldUp.ogg");

        this.load.audio("shieldDown","shieldDown.ogg");

        this.load.audio("musicBurnt","musicBurnt.ogg");

        this.load.audio("musicLoss","musicLoss.ogg");

        this.load.audio("jump","jump.ogg");

        this.load.audio("walk","footstep_concrete_004.ogg")
        
      
        // player is a sprite sheet made by 24x48 pixels
        this.load.spritesheet("player", "player.png", {
            frameWidth: 24,
            frameHeight: 48
        });

        // the coin is a sprite sheet made by 20x20 pixels
        this.load.spritesheet("coin", "coin.png", {
            frameWidth: 20,
            frameHeight: 20
        });

        // the firecamp is a sprite sheet made by 32x58 pixels
        this.load.spritesheet("fire", "fire.png", {
            frameWidth: 40,
            frameHeight: 70
        });

        // mountains are a sprite sheet made by 512x512 pixels
        this.load.spritesheet("mountain", "mountain.png", {
            frameWidth: 512,
            frameHeight: 512
        });

        
    }
    create(){

        // setting player animation
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
        });

        // setting coin animation
        this.anims.create({
            key: "rotate",
            frames: this.anims.generateFrameNumbers("coin", {
                start: 0,
                end: 5
            }),
            frameRate: 15,
            yoyo: true,
            repeat: -1
        });

        // setting fire animation
        this.anims.create({
            key: "burn",
            frames: this.anims.generateFrameNumbers("fire", {
                start: 0,
                end: 4
            }),
            frameRate: 15,
            repeat: -1
        });
        this.sound.play("runStart", {
            volume: 0.5
          });
        this.scene.start("PlayGame");
    }
}

// playGame scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
        this.my = {sprite: {}, text: {}};
        
        this.coinCounter =  0;

        this.shieldCounter =  0;
    }
    create(){

        //Creates green checkered bg layer
        this.bg = this.add.tileSprite(0,0,game.config.width,game.config.height,"bg").setScale(2);

        //HUD
        this.myScore = 0;
        this.displayScore = 0;
        this.myHighScore = 0;
        this.my.text.score = this.add.bitmapText(50, 40, "rocketSquare", "Score: " + this.myScore);
        this.my.text.highScoreText = this.add.bitmapText(50, 80, "rocketSquare", 'High Score: ' + localStorage.getItem("this.myHighScore"));

        this.walkCounter = 0;

        this.distanceScore = 0;
        // group with all active mountains.
        this.mountainGroup = this.add.group();

        // group with all active platforms.
        this.platformGroup = this.add.group({

            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        // platform pool
        this.platformPool = this.add.group({

            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

        // group with all active coins.
        this.coinGroup = this.add.group({

            // once a coin is removed, it's added to the pool
            removeCallback: function(coin){
                coin.scene.coinPool.add(coin)
            }
        });

        // coin pool
        this.coinPool = this.add.group({

            // once a coin is removed from the pool, it's added to the active coins group
            removeCallback: function(coin){
                coin.scene.coinGroup.add(coin)
            }
        });

        // group with all active firecamps.
        this.fireGroup = this.add.group({

            // once a firecamp is removed, it's added to the pool
            removeCallback: function(fire){
                fire.scene.firePool.add(fire)
            }
        });

        // fire pool
        this.firePool = this.add.group({

            // once a fire is removed from the pool, it's added to the active fire group
            removeCallback: function(fire){
                fire.scene.fireGroup.add(fire)
            }
        });

        // adding a mountain
        this.addMountains()

        // keeping track of added platforms
        this.addedPlatforms = 0;

        // number of consecutive jumps made by the player so far
        this.playerJumps = 0;

        // adding a platform to the game, the arguments are platform width, x position and y position
        this.addPlatform(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.7, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);

        this.shield = this.physics.add.sprite(this.player.x, this.player.y, 'shield');
        this.shield.setScale(0.70);
        this.shield.setDepth(2);
        this.shield.visible = false;

        // the player is not dying
        this.dying = false;

        // setting collisions between the player and the platform group
        this.platformCollider = this.physics.add.collider(this.player, this.platformGroup, function(){
            this.walkCounter += 1
            if(this.walkCounter == 10){
            this.sound.play("walk", {
                volume: 0.5
            });
            this.walkCounter -= this.walkCounter; 
            }
            // play "run" animation if the player is on a platform
            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this);

        // setting collisions between the player and the coin group
        this.physics.add.overlap(this.player, this.coinGroup, function(player, coin){
            this.sound.play("coinCollect", {
                volume: 0.5
            });
            
            this.myScore += 1;
            this.updateScore(this.myScore);
            this.coinCounter += 1;
            this.tweens.add({
                targets: coin,
                y: coin.y - 100,
                alpha: 0,
                duration: 500,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function(){
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);
                }
            });

        }, null, this);


        // setting collisions between the shield and the fire group
        this.physics.add.overlap(this.shield, this.fireGroup, function(shield, fire){
            this.sound.play("playerBurnt", {
                volume: 0.5
            });
            this.sound.play("shieldDown", {
                volume: 0.5
            });
            this.sound.play("crowdShock2", {
                volume: 0.8
            });
            this.coinCounter -= this.coinCounter;
            this.shieldCounter -= this.shieldCounter;

            this.fireGroup.killAndHide(fire);
            this.fireGroup.remove(fire);

        }, null, this);

        // setting collisions between the player and the fire group
        this.physics.add.overlap(this.player, this.fireGroup, function(player, fire){
            this.sound.play("playerBurnt", {
                volume: 0.5
            });
            this.sound.play("musicBurnt", {
                volume: 0.5
            });
            this.sound.play("crowdShock", {
                volume: 0.5
            });
            this.dying = true;
            this.player.anims.stop();
            this.player.setFrame(2);
            this.player.body.setVelocityY(-200);
            this.physics.world.removeCollider(this.platformCollider);

        }, null, this);

        
        
        // checking for input
        this.input.keyboard.on("keydown_SPACE", this.jump, this);
    }

    // adding mountains
    addMountains(){
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain");
            mountain.setOrigin(0.5, 1);
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1)
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(1);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3))
            this.addMountains()
        }
    }

    // getting rightmost mountain x position
    getRightmostMountain(){
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        })
        return rightmostMountain;
    }

    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(platformWidth, posX, posY){
        this.addedPlatforms ++;
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            let newRatio =  platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        }
        else{
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            platform.setDepth(2);
            this.platformGroup.add(platform);
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);

        // if this is not the starting platform...
        if(this.addedPlatforms > 1){

            // is there a coin over the platform?
            if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
                if(this.coinPool.getLength()){
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                }
                else{
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("rotate");
                    coin.setDepth(2);
                    this.coinGroup.add(coin);
                }
            }

            // is there a fire over the platform?
            if(Phaser.Math.Between(1, 100) <= gameOptions.firePercent){
                if(this.firePool.getLength()){
                    let fire = this.firePool.getFirst();
                    fire.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
                    fire.y = posY - 46;
                    fire.alpha = 1;
                    fire.active = true;
                    fire.visible = true;
                    this.firePool.remove(fire);
                }
                else{
                    let fire = this.physics.add.sprite(posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth), posY - 46, "fire");
                    fire.setImmovable(true);
                    fire.setVelocityX(platform.body.velocity.x);
                    fire.setSize(8, 2, true)
                    fire.anims.play("burn");
                    fire.setDepth(2);
                    this.fireGroup.add(fire);
                }
            }
        }

    }

    // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
    // and obviously if the player is not dying
    jump(){
        if((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
            this.sound.play("jump", {
                volume: 0.5
            });
            // stops animation
            this.player.anims.stop();
        }
    }

    update(){
        this.distanceScore += 1 

        if (this.distanceScore >= 100) {
            this.myScore += 1;
            this.updateScore(this.myScore);
            this.distanceScore -= this.distanceScore;
        }
        this.bg.tilePositionX += 0.05;
        // game over
        if(this.player.y > game.config.height){
            this.sound.play("playerDeath", {
                volume: 0.5
            });
            this.displayScore = this.myScore;
            this.displayHighScore = this.myHighScore;
            this.coinCounter -= this.coinCounter;
            this.shieldCounter -= this.shieldCounter;
            this.scene.start("GameEnd", { myScore: this.displayScore});
        }

        this.player.x = gameOptions.playerStartPosition;

        //Shield power-up via coin pickup
        if(this.coinCounter >= 5 && this.shieldCounter <= 0){
            this.shieldCounter += 1;
            this.sound.play("shieldUp", {
                volume: 0.5
            });
            this.coinCounter -= this.coinCounter;
        }

        if(this.shieldCounter >= 1){
            this.shield.x = this.player.x;
            this.shield.y = this.player.y;
            this.shield.visible = true;
        } else {
            this.shield.x = -1000;
            this.shield.y = -1000;
            this.shield.visible = false;
        }

  
        if (this.myScore > localStorage.getItem("this.myHighScore")) 
        { 
            localStorage.setItem("this.myHighScore", this.myScore);
            this.updateHighScore();
        }


        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // recycling coins
        this.coinGroup.getChildren().forEach(function(coin){
            if(coin.x < - coin.displayWidth / 2){
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);

        // recycling fire
        this.fireGroup.getChildren().forEach(function(fire){
            if(fire.x < - fire.displayWidth / 2){
                this.fireGroup.killAndHide(fire);
                this.fireGroup.remove(fire);
            }
        }, this);

        // recycling mountains
        this.mountainGroup.getChildren().forEach(function(mountain){
            if(mountain.x < - mountain.displayWidth){
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height + Phaser.Math.Between(0, 100);
                mountain.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);

        // adding new platforms
        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    updateHighScore() {
        let my = this.my;
        my.text.highScoreText.setText("High Score " + localStorage.getItem("this.myHighScore")); 
    }
}

class gameEnd extends Phaser.Scene {
    constructor(){
        super("GameEnd");
        this.my = {sprite: {}, text: {}};
    }
    preload(){
        this.load.setPath("./assets/");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.image("bg","bg.png");
    }
    init (data)
    {
        console.log('init', data);

        this.finalScore = data.myScore;
    }
    create(){
        this.bg = this.add.tileSprite(0,0,game.config.width,game.config.height,"bg").setScale(2);
        //this.scene.stop("volitaireGame");
        const gameover = this.add.bitmapText(370, 200, "rocketSquare", "Your Run is Done!", 50);
        const restart = this.add.bitmapText(370, 450, "rocketSquare", "Press SPACE to restart your run!",25);
        const score = this.add.bitmapText(370, 250, "rocketSquare", "Final Score: " + this.finalScore);
        const highscore = this.add.bitmapText(370, 290, "rocketSquare", 'High Score: ' + localStorage.getItem("this.myHighScore"));
        gameover.setBlendMode(Phaser.BlendModes.ADD);
        restart.setBlendMode(Phaser.BlendModes.ADD);
        score.setBlendMode(Phaser.BlendModes.ADD);
        highscore.setBlendMode(Phaser.BlendModes.ADD);
        this.input.keyboard.on("keydown_SPACE", this.nextScene, this);

        if (localStorage.getItem("this.myHighScore") <= this.finalScore){
            this.sound.play("newHighScore", {
                volume: 0.5
            });

            this.sound.play("crowdCheer", {
                volume: 0.5
            });
        } else {
            this.sound.play("musicLoss", {
                volume: 0.5
            });
            
            this.sound.play("crowdSad", {
                volume: 0.5
            });
        }
    }

    nextScene(){

        this.scene.start("PreloadGame");
      }

    update(){

    }
}
function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
};



