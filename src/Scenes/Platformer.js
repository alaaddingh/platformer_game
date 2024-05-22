class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 200;    
        this.DRAG = 10000;           
        this.physics.world.gravity.y = 1600; 
        this.JUMP_VELOCITY = -900;

        this.my = {
            audio: {},
            vfx: {},
        };
    }


    preload() {
        this.load.setPath("./assets/");
        this.load.image("burger", "burger_img.png");
        this.load.image("background", "background.png");
        this.load.image("fog", "fog.png");
        this.load.image("foreground", "foreground.png");
        this.load.image("tree", "trees.png");

        this.load.audio("background", "bg_music.m4a");
        this.load.audio("jump sound", "jump_sound.m4a");
        this.load.audio("coin collect", "coin_collect.m4a");

        this.load.atlas('smoke', 'kenny-particles-2.png', 'kenny-particles.json');

    }

    create() {

        let my = this.my;
        
        my.audio.BACKGROUND = this.sound.add("background");

        my.audio.BACKGROUND.play(
            {
                loop: true
            }
        );
        my.audio.JUMP_SOUND = this.sound.add("jump sound");
        my.audio.COIN_COLLECT = this.sound.add("coin collect");

        //JUICE
        my.vfx.walking = this.add.particles(0, 0, "smoke", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: { start: 0.03, end: 0.1 },
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -400,
            alpha: { start: 1, end: 0.1 },
        });

        my.vfx.walking.stop();

        this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "background").setScale(4.5);
        this.tree = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "tree").setScale(4.5);
        this.fog = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "fog");

        this.map = this.add.tilemap("platformer-level-1", 18, 18, 200, 200);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.cameras.main.setBounds(0, 0, 3200, this.map.heightInPixels);

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);

        this.sprite = {};
        this.collected = [];

        this.collectibles = [
            this.add.sprite(1403, 58, "burger").setScale(1.3),
            this.add.sprite(230, 275, "burger").setScale(1.3),
            this.add.sprite(1115, 492, "burger").setScale(1.3),
            this.add.sprite(505, 165, "burger").setScale(1.3),
            this.add.sprite(2109, 346, "burger").setScale(1.3),
            this.add.sprite(2450, 202, "burger").setScale(1.3),
            this.add.sprite(2793, 94, "burger").setScale(1.3)
        ];
        this.groundLayer.setCollisionByProperty({ collides: true, drowning: false });

        this.sprite.player = this.physics.add.sprite(this.game.config.width / 8, this.game.config.height / 2 + 110, "platformer_characters", "tile_0000.png").setScale(SCALE);

        this.last_player_pos = this.sprite.player.x;
        this.cameras.main.startFollow(this.sprite.player);
        this.cameras.main.setZoom(1.2);

        this.physics.add.collider(this.sprite.player, this.groundLayer, null, null, this, { separateY: true, tolerance: 100 })
        this.cursors = this.input.keyboard.createCursorKeys();

        this.lower = true;
        this.higher = false;

        this.active_particles = this.add.particles(this.sprite.player.x + 20, this.sprite.player.y + 20, 'smoke', {
            scale: 0.03,
            duration: 1,
            lifespan: 100
        }).setScale(1.7);

        this.collectMessage = this.add.text(this.game.config.width / 4 + 200, this.game.config.height / 2, "Collect all the burgers!", {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Roboto',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: 'blue',
            padding: { x: 20, y: 10 },
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.collectMessage.setVisible(false);
        });

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);


    
    }

    update() {
      
        this.active_particles.stop();
       
        let my = this.my;

        
        this.background.tilePositionX += 0.04;
        this.fog.tilePositionX += 2;

        if (this.sprite.player.x > this.last_player_pos) {
            this.tree.tilePositionX += 0.07;
            this.last_player_pos = this.sprite.player.x;
        }
        if (this.sprite.player.x < this.last_player_pos) {
            this.tree.tilePositionX -= 0.07;
            this.last_player_pos = this.sprite.player.x;
        }

        if (this.sprite.player.y <= 264 && this.lower === true) {
            this.cameras.main.y += 10;
            if (this.cameras.main.y >= 200) {
                this.lower = false;
                this.higher = true;
            }
        }

        if (this.sprite.player.y > 450 && this.higher === true) {
            this.cameras.main.y -= 10;
            if (this.cameras.main.y <= 10) {
                this.lower = true;
                this.higher = false;
            }
        }

        if (this.cursors.left.isDown) {
            this.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            this.sprite.player.resetFlip();
            this.sprite.player.anims.play('walk', true);
            

          this.active_particles =   this.add.particles(this.sprite.player.x + 20, this.sprite.player.y + 20, 'smoke', {
                scale: 0.03,
                duration: 1,
                lifespan: 100
            }).setScale(1.7);


           
        } else if (this.cursors.right.isDown) {

            this.sprite.player.body.setAccelerationX(this.ACCELERATION);
            this.sprite.player.setFlip(true, false);
            this.sprite.player.anims.play('walk', true);

            
            this.active_particles =   this.add.particles(this.sprite.player.x - 20, this.sprite.player.y + 20, 'smoke', {
                scale: 0.03,
                duration: 1,
                lifespan: 100
            }).setScale(1.7);
        } else {
            
            this.sprite.player.body.setAccelerationX(0);
            this.sprite.player.body.setDragX(this.DRAG);
            this.sprite.player.anims.play('idle');
        
        }

        if (!this.sprite.player.body.blocked.down) {
            this.sprite.player.anims.play('jump');
            
            this.active_particles.stop();
         
           
        }
        if (this.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.audio.JUMP_SOUND.play();
            this.active_particles.stop();
          
               
                
        }

        for (let collectible of this.collectibles) {
            if (this.collides(this.sprite.player, collectible) && collectible.visible === true) {
                my.audio.COIN_COLLECT.play();
                collectible.visible = false;
                console.log(collectible);
                this.collected.push(collectible);
            }
        }

        if (this.sprite.player.y >= 800) {
            this.sprite.player.x = this.game.config.width / 8;
            this.sprite.player.y = this.game.config.height / 2;

            this.sprite.player.body.setAccelerationX(0);
            this.sprite.player.body.setDragX(this.DRAG);
            this.sprite.player.anims.play('idle');

            this.collected.forEach(collectedItem => {
                collectedItem.visible = true;
            });
            this.collected = [];
        }

        if (this.sprite.player.x >= 2975 && this.collected.length === 7) {

            my.audio.BACKGROUND.stop();
            this.collectMessage = this.add.text(2575, 300, "Level Cleared!", {
                fontSize: '64px',
                fill: '#ffffff',
                fontFamily: 'Roboto',
                stroke: '#000000',
                strokeThickness: 4,
                backgroundColor: 'blue',
                padding: { x: 20, y: 10 },
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
            }).setOrigin(0.5);
            this.time.delayedCall(3000, () => {
                this.scene.restart();
            });
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }
}