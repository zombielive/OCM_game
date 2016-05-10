require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"button":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'd0fdaRs70dKU4BCrYx9Rann', 'button');
// script/button.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene('game');
        });
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"enemy":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'd586aPFZo5KupJfrqUVLXK5', 'enemy');
// script/enemy.js

cc.Class({
    'extends': cc.Component,

    properties: {
        pickRadius: 0,
        speed: 0,
        atk: 0,
        hp: 0,
        exp: 0,
        crit: 0,
        dodge: 0,
        dropRate: 0,
        dieAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    onLoad: function onLoad() {
        this.isPicked = false;
        this.face = 'left';
    },

    getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked(dt) {
        var playerPos = this.game.player.getPosition();
        var anim = this.getComponent(cc.Animation);
        var directV = cc.pNormalize(cc.pSub(playerPos, this.node.position));
        if (directV.x > 0) {
            anim.play('enemyMoveRight');
            this.face = 'right';
        } else {
            anim.play('enemyMoveLeft');
            this.face = 'left';
        }
        this.node.x += this.speed * directV.x * dt * cc.random0To1();
        this.node.y += this.speed * directV.y * dt * cc.random0To1();
    },

    findSpears: function findSpears() {
        var Arr = this.game.spearArr;
        if (Arr.length > 0) {
            var enemyX = this.node.x;
            var enemyY = this.node.y;
            for (var sp in Arr) {
                var dx = Math.abs(enemyX - Arr[sp].x);
                var dy = Math.abs(enemyY - Arr[sp].y);
                if (dx < 50 && dy < 20) {
                    this.onAttack();
                    Arr[sp].destroy();
                    Arr.splice(sp, 1);
                }
            }
        }
    },

    onAttack: function onAttack() {
        this.isPicked = true;
        if (cc.random0To1() < this.dodge) {
            this.game.drawDamage(this.node, 'Miss', true);
        } else {
            var blink = cc.blink(0.6, 3);
            this.node.runAction(blink);
            var player = this.game.player.getComponent('player');
            var atk = player.atk * (1 + 0.1 * cc.randomMinus1To1());
            var damage = 0;
            if (cc.random0To1() < player.crit) {
                damage = Math.floor(atk * 1.5);
                this.game.drawDamage(this.node, damage, true);
            } else {
                damage = Math.floor(atk);
                this.game.drawDamage(this.node, damage, false);
            }
            this.hp -= damage;
            if (this.hp <= 0) {
                this.dead();
            }
        }
    },
    dead: function dead() {
        var fadeOut = cc.fadeOut(0.2);
        this.game.drawHeart(this.node);
        this.game.player.getComponent('player').getExp(this.exp);
        this.game.enemyNum -= 1;
        cc.audioEngine.playEffect(this.dieAudio, false);
        this.node.destroy();
    },
    atkPlayer: function atkPlayer() {
        var player = this.game.player;
        var playerRect = cc.rect(player.x, player.y, player.width, player.height);
        var enemyRect = cc.rect(this.node.x, this.node.y, this.node.width, this.node.height);
        var isAtk = cc.rectIntersectsRect(playerRect, enemyRect);
        if (isAtk && !player.getComponent('player').isOnAtk) {
            player.getComponent('player').isOnAtk = true;
            player.getComponent('player').onAttack(this.node);
        }
    },

    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.isPicked = true;
        }
        if (this.isPicked) {
            this.onPicked(dt);
        }
        this.findSpears();
        this.atkPlayer();
    }
});

cc._RFpop();
},{}],"game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '1cd81j4Q5VF9ocWR01PhxV4', 'game');
// script/game.js

cc.Class({
    'extends': cc.Component,

    properties: {
        enemyPrefab: {
            'default': null,
            type: cc.Prefab
        },
        ground: {
            'default': null,
            type: cc.Node
        },
        player: {
            'default': null,
            type: cc.Node
        },
        spearPrefab: {
            'default': null,
            type: cc.Prefab
        },
        damagePrefab: {
            'default': null,
            type: cc.Prefab
        },
        heartPrefab: {
            'default': null,
            type: cc.Prefab
        },
        soulBar: {
            'default': null,
            type: cc.ProgressBar
        },
        hpBar: {
            'default': null,
            type: cc.ProgressBar
        },
        level: {
            'default': null,
            type: cc.Label
        }
    },

    onLoad: function onLoad() {
        this.spearArr = [];
        this.enemyNum = 0;
        this.player.getComponent('player').game = this;
        this.drawEnemys();
    },

    update: function update() {
        if (this.enemyNum < 1) {
            this.drawEnemys();
        }
    },

    drawEnemys: function drawEnemys() {
        for (var i = 0; i < 5; i++) {
            var newEnemy = cc.instantiate(this.enemyPrefab);
            this.node.addChild(newEnemy);
            this.enemyNum += 1;
            newEnemy.setPosition(this.getEnemyPosition());
            newEnemy.getComponent('enemy').game = this;
        }
    },

    getEnemyPosition: function getEnemyPosition() {
        var maxX = this.node.width - 250;
        var maxY = this.ground.height / 2 - this.player.height / 2;
        var ranX = cc.random0To1() * maxX + 225 - this.node.width / 2;
        var ranY = cc.randomMinus1To1() * maxY;
        return cc.p(ranX, ranY);
    },
    drawSpear: function drawSpear() {
        var newSpear = cc.instantiate(this.spearPrefab);
        this.node.addChild(newSpear);
        this.spearArr.push(newSpear);
        newSpear.getComponent('spear').game = this;
        if (this.player.getComponent('player').face == 'left') {
            newSpear.setPosition(this.getSpPosition(true));
            newSpear.getComponent('spear').dr = 'left';
        } else if (this.player.getComponent('player').face == 'right') {
            newSpear.setPosition(this.getSpPosition(false));
            newSpear.getComponent('spear').dr = 'right';
        }
    },

    getSpPosition: function getSpPosition(isLeft) {
        var sx;
        var sy = this.player.y;
        if (isLeft) {
            sx = this.player.x - this.player.width;
        } else {
            sx = this.player.x + this.player.width;
        }
        return cc.p(sx, sy);
    },
    drawDamage: function drawDamage(theNode, num, isCrit) {
        var newDamage = cc.instantiate(this.damagePrefab);
        this.node.addChild(newDamage);
        newDamage.setPosition(this.getDamagePosition(theNode));
        newDamage.getComponent(cc.Label).string = num;
        if (isCrit) {
            newDamage.getComponent(cc.Label).fontSize = 20;
        } else {
            newDamage.getComponent(cc.Label).fontSize = 15;
        }
        var jump = cc.jumpBy(0.2, 0, 20, 20, 1);
        var fadeOut = cc.fadeOut(0.1);
        var finished = cc.callFunc(function () {
            newDamage.destroy();
        }, this);
        newDamage.runAction(cc.sequence(jump, fadeOut, finished));
    },
    getDamagePosition: function getDamagePosition(theNode) {
        var daX = theNode.x;
        var daY = theNode.y + theNode.height / 2;
        return cc.p(daX, daY);
    },
    drawHeart: function drawHeart(theNode) {
        var newHeart = cc.instantiate(this.heartPrefab);
        this.node.addChild(newHeart);
        newHeart.setPosition(cc.p(theNode.x, theNode.y));
        var jump = cc.jumpBy(0.2, 20, 0, 20, 1);
        newHeart.runAction(jump);
        newHeart.getComponent('heart').game = this;
    }
});

cc._RFpop();
},{}],"heart":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'e8bcby5UElBArcHTAHGJKDt', 'heart');
// script/heart.js

cc.Class({
    'extends': cc.Component,

    properties: {
        heal: 0,
        pickRadius: 0,
        jumpHeight: 0,
        jumpDuration: 0,
        pickAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },
    getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },
    onPicked: function onPicked() {
        cc.audioEngine.playEffect(this.pickAudio, false);
        var hp = this.game.player.getComponent('player').hp;
        var maxHp = this.game.player.getComponent('player').maxHp;
        var afterHp = hp + this.heal;
        if (afterHp > maxHp) {
            hp = maxHp;
        } else {
            this.game.player.getComponent('player').hp += this.heal;console.log('hp:' + hp + ' ;maxHp' + maxHp);
        }
        this.game.hpBar.progress = this.game.player.getComponent('player').hp / maxHp;
        this.node.destroy();
    },
    onLoad: function onLoad() {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        this.node.runAction(cc.repeatForever(cc.sequence(jumpUp, jumpDown)));
    },
    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }
    }

});

cc._RFpop();
},{}],"player":[function(require,module,exports){
"use strict";
cc._RFpush(module, '692d4GufVhF8ID8qoCvOnfH', 'player');
// script/player.js

cc.Class({
    'extends': cc.Component,

    properties: {
        speed: 0,
        atk: 0,
        maxHp: 0,
        hp: 0,
        exp: 0,
        needExp: 0,
        crit: 0,
        dodge: 0,
        level: 0,
        atkAudio: {
            'default': null,
            url: cc.AudioClip
        },
        levelUpAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },
    changeDirection: function changeDirection(dir) {
        this.getComponent(cc.Animation).playAdditive('playerMove' + dir);
    },

    setInputControl: function setInputControl() {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.left:
                        self.accLeft = true;
                        self.accRight = false;
                        self.face = 'left';
                        self.attackAnimPlaying = true;
                        break;
                    case cc.KEY.right:
                        self.accLeft = false;
                        self.accRight = true;
                        self.face = 'right';
                        self.attackAnimPlaying = true;
                        break;
                    case cc.KEY.up:
                        self.accUp = true;
                        self.accDown = false;
                        self.attackAnimPlaying = true;
                        break;
                    case cc.KEY.down:
                        self.accUp = false;
                        self.accDown = true;
                        self.attackAnimPlaying = true;
                        break;
                    case cc.KEY.space:
                        self.playerAttack = true;
                }
            },
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.left:
                        self.accLeft = false;
                        self.attackAnimPlaying = false;
                        break;
                    case cc.KEY.right:
                        self.accRight = false;
                        self.attackAnimPlaying = false;
                        break;
                    case cc.KEY.up:
                        self.accUp = false;
                        self.attackAnimPlaying = false;
                        break;
                    case cc.KEY.down:
                        self.accDown = false;
                        self.attackAnimPlaying = false;
                        break;
                    case cc.KEY.space:
                        self.playerAttack = false;
                }
            }
        }, self.node);
    },
    onAttackAnimCompleted: function onAttackAnimCompleted() {
        this.attackAnimPlaying = false;
    },
    onHandsUp: function onHandsUp() {
        this.game.drawSpear();
    },
    getExp: function getExp(expNum) {
        this.exp += expNum;
        if (this.exp > this.needExp) {
            this.levelUp();
        } else {
            this.game.soulBar.progress = this.exp / this.needExp;
        }
    },
    levelUp: function levelUp() {
        this.exp -= this.needExp;
        this.game.soulBar.progress = this.exp / this.needExp;
        this.level += 1;
        this.needExp = this.level * 100;
        this.maxHp += this.level * 50;
        this.hp = this.maxHp;
        this.game.hpBar.progress = this.hp / this.maxHp;
        this.game.level.string = 'Lv ' + this.level.toString();
        cc.audioEngine.playEffect(this.levelUpAudio, false);
    },
    onAttack: function onAttack(thisEnemy) {
        if (cc.random0To1() < this.dodge) {
            this.game.drawDamage(this.node, 'Miss', true);
            this.isOnAtk = false;
        } else {
            var enemy = thisEnemy.getComponent('enemy');
            var blink = cc.blink(0.6, 3);
            var jump;
            var finished = cc.callFunc(function () {
                this.isOnAtk = false;
            }, this);
            if (enemy.face == 'left' && this.node.x > -405) {
                jump = cc.jumpBy(0.2, -50, 0, 10, 1);
            }
            if (enemy.face == 'right' && this.node.x < 405) {
                jump = cc.jumpBy(0.2, 50, 0, 10, 1);
            }
            if (jump) {
                this.node.runAction(cc.sequence(jump, blink, finished));
            } else {
                this.node.runAction(cc.sequence(blink, finished));
            }
            var atk = enemy.atk * (1 + 0.1 * cc.randomMinus1To1());
            var damage = 0;
            if (cc.random0To1() < enemy.crit) {
                damage = Math.floor(atk * 1.5);
                this.game.drawDamage(this.node, damage, true);
            } else {
                damage = Math.floor(atk);
                this.game.drawDamage(this.node, damage, false);
            }
            this.hp -= damage;
            this.game.hpBar.progress = this.hp / this.maxHp;
            if (this.hp <= 0) {
                cc.director.loadScene('End');
            }
        }
    },
    // use this for initialization
    onLoad: function onLoad() {
        this.hp = this.maxHp;
        this.accLeft = false;
        this.accRight = false;
        this.accUp = false;
        this.accDown = false;
        this.face = 'right';
        this.playerAttack = false;
        this.attackAnimPlaying = false;
        this.isOnAtk = false;
        this.setInputControl();
    },
    update: function update(dt) {
        if (this.accLeft && this.node.x > -455) {
            this.node.x -= this.speed * dt;
            this.changeDirection('Left');
        } else if (this.accRight && this.node.x < 455) {
            this.node.x += this.speed * dt;
            this.changeDirection('Right');
        }
        if (this.accUp && this.node.y < 260) {
            this.node.y += this.speed * dt;
        } else if (this.accDown && this.node.y > -180) {
            this.node.y -= this.speed * dt;
        }
        var anim = this.getComponent(cc.Animation);
        if (this.playerAttack && !this.attackAnimPlaying) {
            this.attackAnimPlaying = true;
            cc.audioEngine.playEffect(this.atkAudio, false);
            if (this.face == 'left') {
                anim.play('playerAttackLeft');
            } else if (this.face == 'right') {
                anim.play('playerAttackRight');
            }
        }
    }

});

cc._RFpop();
},{}],"spear":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'fa146+erjhDgrqpRLpyJB/6', 'spear');
// script/spear.js

cc.Class({
    'extends': cc.Component,

    properties: {
        pickWidth: 0,
        speed: 0,
        duration: 0
    },

    onLoad: function onLoad() {
        this.timer = 0;
    },

    update: function update(dt) {
        // var anim = this.getComponent(cc.Animation);
        if (this.dr == 'left') {
            this.node.x -= this.speed * dt;
            // anim.playAdditive('spearMoveLeft');
        } else if (this.dr == 'right') {
                this.node.x += this.speed * dt;
                // anim.playAdditive('spearMoveRight');
            }
        if (this.timer > this.duration) {
            var Arr = this.game.spearArr;
            var index = Arr.indexOf(this.node);
            if (this.node) {
                Arr.splice(index, 1);
                this.node.destroy();
                return;
            }
        }
        this.timer += dt;
    }
});

cc._RFpop();
},{}]},{},["game","player","button","enemy","heart","spear"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL0NvY29zQ3JlYXRvci5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHQvYnV0dG9uLmpzIiwic2NyaXB0L2VuZW15LmpzIiwic2NyaXB0L2dhbWUuanMiLCJzY3JpcHQvaGVhcnQuanMiLCJzY3JpcHQvcGxheWVyLmpzIiwic2NyaXB0L3NwZWFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2QwZmRhUnM3MGRLVTRCQ3JZeDlSYW5uJywgJ2J1dHRvbicpO1xuLy8gc2NyaXB0L2J1dHRvbi5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnZ2FtZScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdkNTg2YVBGWm81S3VwSmZycVVWTFhLNScsICdlbmVteScpO1xuLy8gc2NyaXB0L2VuZW15LmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgcGlja1JhZGl1czogMCxcbiAgICAgICAgc3BlZWQ6IDAsXG4gICAgICAgIGF0azogMCxcbiAgICAgICAgaHA6IDAsXG4gICAgICAgIGV4cDogMCxcbiAgICAgICAgY3JpdDogMCxcbiAgICAgICAgZG9kZ2U6IDAsXG4gICAgICAgIGRyb3BSYXRlOiAwLFxuICAgICAgICBkaWVBdWRpbzoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5pc1BpY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZhY2UgPSAnbGVmdCc7XG4gICAgfSxcblxuICAgIGdldFBsYXllckRpc3RhbmNlOiBmdW5jdGlvbiBnZXRQbGF5ZXJEaXN0YW5jZSgpIHtcbiAgICAgICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xuICAgICAgICByZXR1cm4gZGlzdDtcbiAgICB9LFxuXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uIG9uUGlja2VkKGR0KSB7XG4gICAgICAgIHZhciBwbGF5ZXJQb3MgPSB0aGlzLmdhbWUucGxheWVyLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIHZhciBhbmltID0gdGhpcy5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKTtcbiAgICAgICAgdmFyIGRpcmVjdFYgPSBjYy5wTm9ybWFsaXplKGNjLnBTdWIocGxheWVyUG9zLCB0aGlzLm5vZGUucG9zaXRpb24pKTtcbiAgICAgICAgaWYgKGRpcmVjdFYueCA+IDApIHtcbiAgICAgICAgICAgIGFuaW0ucGxheSgnZW5lbXlNb3ZlUmlnaHQnKTtcbiAgICAgICAgICAgIHRoaXMuZmFjZSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmltLnBsYXkoJ2VuZW15TW92ZUxlZnQnKTtcbiAgICAgICAgICAgIHRoaXMuZmFjZSA9ICdsZWZ0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnNwZWVkICogZGlyZWN0Vi54ICogZHQgKiBjYy5yYW5kb20wVG8xKCk7XG4gICAgICAgIHRoaXMubm9kZS55ICs9IHRoaXMuc3BlZWQgKiBkaXJlY3RWLnkgKiBkdCAqIGNjLnJhbmRvbTBUbzEoKTtcbiAgICB9LFxuXG4gICAgZmluZFNwZWFyczogZnVuY3Rpb24gZmluZFNwZWFycygpIHtcbiAgICAgICAgdmFyIEFyciA9IHRoaXMuZ2FtZS5zcGVhckFycjtcbiAgICAgICAgaWYgKEFyci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZW5lbXlYID0gdGhpcy5ub2RlLng7XG4gICAgICAgICAgICB2YXIgZW5lbXlZID0gdGhpcy5ub2RlLnk7XG4gICAgICAgICAgICBmb3IgKHZhciBzcCBpbiBBcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyhlbmVteVggLSBBcnJbc3BdLngpO1xuICAgICAgICAgICAgICAgIHZhciBkeSA9IE1hdGguYWJzKGVuZW15WSAtIEFycltzcF0ueSk7XG4gICAgICAgICAgICAgICAgaWYgKGR4IDwgNTAgJiYgZHkgPCAyMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQXR0YWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIEFycltzcF0uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICBBcnIuc3BsaWNlKHNwLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25BdHRhY2s6IGZ1bmN0aW9uIG9uQXR0YWNrKCkge1xuICAgICAgICB0aGlzLmlzUGlja2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNjLnJhbmRvbTBUbzEoKSA8IHRoaXMuZG9kZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5kcmF3RGFtYWdlKHRoaXMubm9kZSwgJ01pc3MnLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBibGluayA9IGNjLmJsaW5rKDAuNiwgMyk7XG4gICAgICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKGJsaW5rKTtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLmdhbWUucGxheWVyLmdldENvbXBvbmVudCgncGxheWVyJyk7XG4gICAgICAgICAgICB2YXIgYXRrID0gcGxheWVyLmF0ayAqICgxICsgMC4xICogY2MucmFuZG9tTWludXMxVG8xKCkpO1xuICAgICAgICAgICAgdmFyIGRhbWFnZSA9IDA7XG4gICAgICAgICAgICBpZiAoY2MucmFuZG9tMFRvMSgpIDwgcGxheWVyLmNyaXQpIHtcbiAgICAgICAgICAgICAgICBkYW1hZ2UgPSBNYXRoLmZsb29yKGF0ayAqIDEuNSk7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLmRyYXdEYW1hZ2UodGhpcy5ub2RlLCBkYW1hZ2UsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYW1hZ2UgPSBNYXRoLmZsb29yKGF0ayk7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLmRyYXdEYW1hZ2UodGhpcy5ub2RlLCBkYW1hZ2UsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaHAgLT0gZGFtYWdlO1xuICAgICAgICAgICAgaWYgKHRoaXMuaHAgPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVhZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkZWFkOiBmdW5jdGlvbiBkZWFkKCkge1xuICAgICAgICB2YXIgZmFkZU91dCA9IGNjLmZhZGVPdXQoMC4yKTtcbiAgICAgICAgdGhpcy5nYW1lLmRyYXdIZWFydCh0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLmdhbWUucGxheWVyLmdldENvbXBvbmVudCgncGxheWVyJykuZ2V0RXhwKHRoaXMuZXhwKTtcbiAgICAgICAgdGhpcy5nYW1lLmVuZW15TnVtIC09IDE7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5kaWVBdWRpbywgZmFsc2UpO1xuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgIH0sXG4gICAgYXRrUGxheWVyOiBmdW5jdGlvbiBhdGtQbGF5ZXIoKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLmdhbWUucGxheWVyO1xuICAgICAgICB2YXIgcGxheWVyUmVjdCA9IGNjLnJlY3QocGxheWVyLngsIHBsYXllci55LCBwbGF5ZXIud2lkdGgsIHBsYXllci5oZWlnaHQpO1xuICAgICAgICB2YXIgZW5lbXlSZWN0ID0gY2MucmVjdCh0aGlzLm5vZGUueCwgdGhpcy5ub2RlLnksIHRoaXMubm9kZS53aWR0aCwgdGhpcy5ub2RlLmhlaWdodCk7XG4gICAgICAgIHZhciBpc0F0ayA9IGNjLnJlY3RJbnRlcnNlY3RzUmVjdChwbGF5ZXJSZWN0LCBlbmVteVJlY3QpO1xuICAgICAgICBpZiAoaXNBdGsgJiYgIXBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLmlzT25BdGspIHtcbiAgICAgICAgICAgIHBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLmlzT25BdGsgPSB0cnVlO1xuICAgICAgICAgICAgcGxheWVyLmdldENvbXBvbmVudCgncGxheWVyJykub25BdHRhY2sodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGlja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1BpY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5vblBpY2tlZChkdCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maW5kU3BlYXJzKCk7XG4gICAgICAgIHRoaXMuYXRrUGxheWVyKCk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcxY2Q4MWo0UTVWRjlvY1dSMDFQaHhWNCcsICdnYW1lJyk7XG4vLyBzY3JpcHQvZ2FtZS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGVuZW15UHJlZmFiOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgZ3JvdW5kOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIHBsYXllcjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBzcGVhclByZWZhYjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIGRhbWFnZVByZWZhYjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIGhlYXJ0UHJlZmFiOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgc291bEJhcjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJvZ3Jlc3NCYXJcbiAgICAgICAgfSxcbiAgICAgICAgaHBCYXI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByb2dyZXNzQmFyXG4gICAgICAgIH0sXG4gICAgICAgIGxldmVsOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB0aGlzLnNwZWFyQXJyID0gW107XG4gICAgICAgIHRoaXMuZW5lbXlOdW0gPSAwO1xuICAgICAgICB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLmdhbWUgPSB0aGlzO1xuICAgICAgICB0aGlzLmRyYXdFbmVteXMoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW15TnVtIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3RW5lbXlzKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZHJhd0VuZW15czogZnVuY3Rpb24gZHJhd0VuZW15cygpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdFbmVteSA9IGNjLmluc3RhbnRpYXRlKHRoaXMuZW5lbXlQcmVmYWIpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKG5ld0VuZW15KTtcbiAgICAgICAgICAgIHRoaXMuZW5lbXlOdW0gKz0gMTtcbiAgICAgICAgICAgIG5ld0VuZW15LnNldFBvc2l0aW9uKHRoaXMuZ2V0RW5lbXlQb3NpdGlvbigpKTtcbiAgICAgICAgICAgIG5ld0VuZW15LmdldENvbXBvbmVudCgnZW5lbXknKS5nYW1lID0gdGhpcztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRFbmVteVBvc2l0aW9uOiBmdW5jdGlvbiBnZXRFbmVteVBvc2l0aW9uKCkge1xuICAgICAgICB2YXIgbWF4WCA9IHRoaXMubm9kZS53aWR0aCAtIDI1MDtcbiAgICAgICAgdmFyIG1heFkgPSB0aGlzLmdyb3VuZC5oZWlnaHQgLyAyIC0gdGhpcy5wbGF5ZXIuaGVpZ2h0IC8gMjtcbiAgICAgICAgdmFyIHJhblggPSBjYy5yYW5kb20wVG8xKCkgKiBtYXhYICsgMjI1IC0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHJhblkgPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFk7XG4gICAgICAgIHJldHVybiBjYy5wKHJhblgsIHJhblkpO1xuICAgIH0sXG4gICAgZHJhd1NwZWFyOiBmdW5jdGlvbiBkcmF3U3BlYXIoKSB7XG4gICAgICAgIHZhciBuZXdTcGVhciA9IGNjLmluc3RhbnRpYXRlKHRoaXMuc3BlYXJQcmVmYWIpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobmV3U3BlYXIpO1xuICAgICAgICB0aGlzLnNwZWFyQXJyLnB1c2gobmV3U3BlYXIpO1xuICAgICAgICBuZXdTcGVhci5nZXRDb21wb25lbnQoJ3NwZWFyJykuZ2FtZSA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLmZhY2UgPT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICBuZXdTcGVhci5zZXRQb3NpdGlvbih0aGlzLmdldFNwUG9zaXRpb24odHJ1ZSkpO1xuICAgICAgICAgICAgbmV3U3BlYXIuZ2V0Q29tcG9uZW50KCdzcGVhcicpLmRyID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGxheWVyLmdldENvbXBvbmVudCgncGxheWVyJykuZmFjZSA9PSAncmlnaHQnKSB7XG4gICAgICAgICAgICBuZXdTcGVhci5zZXRQb3NpdGlvbih0aGlzLmdldFNwUG9zaXRpb24oZmFsc2UpKTtcbiAgICAgICAgICAgIG5ld1NwZWFyLmdldENvbXBvbmVudCgnc3BlYXInKS5kciA9ICdyaWdodCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0U3BQb3NpdGlvbjogZnVuY3Rpb24gZ2V0U3BQb3NpdGlvbihpc0xlZnQpIHtcbiAgICAgICAgdmFyIHN4O1xuICAgICAgICB2YXIgc3kgPSB0aGlzLnBsYXllci55O1xuICAgICAgICBpZiAoaXNMZWZ0KSB7XG4gICAgICAgICAgICBzeCA9IHRoaXMucGxheWVyLnggLSB0aGlzLnBsYXllci53aWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN4ID0gdGhpcy5wbGF5ZXIueCArIHRoaXMucGxheWVyLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYy5wKHN4LCBzeSk7XG4gICAgfSxcbiAgICBkcmF3RGFtYWdlOiBmdW5jdGlvbiBkcmF3RGFtYWdlKHRoZU5vZGUsIG51bSwgaXNDcml0KSB7XG4gICAgICAgIHZhciBuZXdEYW1hZ2UgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmRhbWFnZVByZWZhYik7XG4gICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChuZXdEYW1hZ2UpO1xuICAgICAgICBuZXdEYW1hZ2Uuc2V0UG9zaXRpb24odGhpcy5nZXREYW1hZ2VQb3NpdGlvbih0aGVOb2RlKSk7XG4gICAgICAgIG5ld0RhbWFnZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IG51bTtcbiAgICAgICAgaWYgKGlzQ3JpdCkge1xuICAgICAgICAgICAgbmV3RGFtYWdlLmdldENvbXBvbmVudChjYy5MYWJlbCkuZm9udFNpemUgPSAyMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0RhbWFnZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLmZvbnRTaXplID0gMTU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGp1bXAgPSBjYy5qdW1wQnkoMC4yLCAwLCAyMCwgMjAsIDEpO1xuICAgICAgICB2YXIgZmFkZU91dCA9IGNjLmZhZGVPdXQoMC4xKTtcbiAgICAgICAgdmFyIGZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbmV3RGFtYWdlLmRlc3Ryb3koKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIG5ld0RhbWFnZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UoanVtcCwgZmFkZU91dCwgZmluaXNoZWQpKTtcbiAgICB9LFxuICAgIGdldERhbWFnZVBvc2l0aW9uOiBmdW5jdGlvbiBnZXREYW1hZ2VQb3NpdGlvbih0aGVOb2RlKSB7XG4gICAgICAgIHZhciBkYVggPSB0aGVOb2RlLng7XG4gICAgICAgIHZhciBkYVkgPSB0aGVOb2RlLnkgKyB0aGVOb2RlLmhlaWdodCAvIDI7XG4gICAgICAgIHJldHVybiBjYy5wKGRhWCwgZGFZKTtcbiAgICB9LFxuICAgIGRyYXdIZWFydDogZnVuY3Rpb24gZHJhd0hlYXJ0KHRoZU5vZGUpIHtcbiAgICAgICAgdmFyIG5ld0hlYXJ0ID0gY2MuaW5zdGFudGlhdGUodGhpcy5oZWFydFByZWZhYik7XG4gICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChuZXdIZWFydCk7XG4gICAgICAgIG5ld0hlYXJ0LnNldFBvc2l0aW9uKGNjLnAodGhlTm9kZS54LCB0aGVOb2RlLnkpKTtcbiAgICAgICAgdmFyIGp1bXAgPSBjYy5qdW1wQnkoMC4yLCAyMCwgMCwgMjAsIDEpO1xuICAgICAgICBuZXdIZWFydC5ydW5BY3Rpb24oanVtcCk7XG4gICAgICAgIG5ld0hlYXJ0LmdldENvbXBvbmVudCgnaGVhcnQnKS5nYW1lID0gdGhpcztcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2U4YmNieTVVRWxCQXJjSFRBSEdKS0R0JywgJ2hlYXJ0Jyk7XG4vLyBzY3JpcHQvaGVhcnQuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBoZWFsOiAwLFxuICAgICAgICBwaWNrUmFkaXVzOiAwLFxuICAgICAgICBqdW1wSGVpZ2h0OiAwLFxuICAgICAgICBqdW1wRHVyYXRpb246IDAsXG4gICAgICAgIHBpY2tBdWRpbzoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uIGdldFBsYXllckRpc3RhbmNlKCkge1xuICAgICAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uIG9uUGlja2VkKCkge1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMucGlja0F1ZGlvLCBmYWxzZSk7XG4gICAgICAgIHZhciBocCA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdwbGF5ZXInKS5ocDtcbiAgICAgICAgdmFyIG1heEhwID0gdGhpcy5nYW1lLnBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLm1heEhwO1xuICAgICAgICB2YXIgYWZ0ZXJIcCA9IGhwICsgdGhpcy5oZWFsO1xuICAgICAgICBpZiAoYWZ0ZXJIcCA+IG1heEhwKSB7XG4gICAgICAgICAgICBocCA9IG1heEhwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nYW1lLnBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLmhwICs9IHRoaXMuaGVhbDtjb25zb2xlLmxvZygnaHA6JyArIGhwICsgJyA7bWF4SHAnICsgbWF4SHApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2FtZS5ocEJhci5wcm9ncmVzcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdwbGF5ZXInKS5ocCAvIG1heEhwO1xuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgIH0sXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHZhciBqdW1wVXAgPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbk91dCgpKTtcbiAgICAgICAgdmFyIGp1bXBEb3duID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIC10aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24oY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duKSkpO1xuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGxheWVyRGlzdGFuY2UoKSA8IHRoaXMucGlja1JhZGl1cykge1xuICAgICAgICAgICAgdGhpcy5vblBpY2tlZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzY5MmQ0R3VmVmhGOElEOHFvQ3ZPbmZIJywgJ3BsYXllcicpO1xuLy8gc2NyaXB0L3BsYXllci5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHNwZWVkOiAwLFxuICAgICAgICBhdGs6IDAsXG4gICAgICAgIG1heEhwOiAwLFxuICAgICAgICBocDogMCxcbiAgICAgICAgZXhwOiAwLFxuICAgICAgICBuZWVkRXhwOiAwLFxuICAgICAgICBjcml0OiAwLFxuICAgICAgICBkb2RnZTogMCxcbiAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgIGF0a0F1ZGlvOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9LFxuICAgICAgICBsZXZlbFVwQXVkaW86IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNoYW5nZURpcmVjdGlvbjogZnVuY3Rpb24gY2hhbmdlRGlyZWN0aW9uKGRpcikge1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXlBZGRpdGl2ZSgncGxheWVyTW92ZScgKyBkaXIpO1xuICAgIH0sXG5cbiAgICBzZXRJbnB1dENvbnRyb2w6IGZ1bmN0aW9uIHNldElucHV0Q29udHJvbCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuS0VZQk9BUkQsXG4gICAgICAgICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uIG9uS2V5UHJlc3NlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmFjZSA9ICdsZWZ0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNrQW5pbVBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmFjZSA9ICdyaWdodCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFja0FuaW1QbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS51cDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjVXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NEb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFja0FuaW1QbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kb3duOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNrQW5pbVBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnNwYWNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5wbGF5ZXJBdHRhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbktleVJlbGVhc2VkOiBmdW5jdGlvbiBvbktleVJlbGVhc2VkKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmxlZnQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNrQW5pbVBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5yaWdodDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNrQW5pbVBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS51cDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjVXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNrQW5pbVBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kb3duOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NEb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dGFja0FuaW1QbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuc3BhY2U6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnBsYXllckF0dGFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgc2VsZi5ub2RlKTtcbiAgICB9LFxuICAgIG9uQXR0YWNrQW5pbUNvbXBsZXRlZDogZnVuY3Rpb24gb25BdHRhY2tBbmltQ29tcGxldGVkKCkge1xuICAgICAgICB0aGlzLmF0dGFja0FuaW1QbGF5aW5nID0gZmFsc2U7XG4gICAgfSxcbiAgICBvbkhhbmRzVXA6IGZ1bmN0aW9uIG9uSGFuZHNVcCgpIHtcbiAgICAgICAgdGhpcy5nYW1lLmRyYXdTcGVhcigpO1xuICAgIH0sXG4gICAgZ2V0RXhwOiBmdW5jdGlvbiBnZXRFeHAoZXhwTnVtKSB7XG4gICAgICAgIHRoaXMuZXhwICs9IGV4cE51bTtcbiAgICAgICAgaWYgKHRoaXMuZXhwID4gdGhpcy5uZWVkRXhwKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VsQmFyLnByb2dyZXNzID0gdGhpcy5leHAgLyB0aGlzLm5lZWRFeHA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGxldmVsVXA6IGZ1bmN0aW9uIGxldmVsVXAoKSB7XG4gICAgICAgIHRoaXMuZXhwIC09IHRoaXMubmVlZEV4cDtcbiAgICAgICAgdGhpcy5nYW1lLnNvdWxCYXIucHJvZ3Jlc3MgPSB0aGlzLmV4cCAvIHRoaXMubmVlZEV4cDtcbiAgICAgICAgdGhpcy5sZXZlbCArPSAxO1xuICAgICAgICB0aGlzLm5lZWRFeHAgPSB0aGlzLmxldmVsICogMTAwO1xuICAgICAgICB0aGlzLm1heEhwICs9IHRoaXMubGV2ZWwgKiA1MDtcbiAgICAgICAgdGhpcy5ocCA9IHRoaXMubWF4SHA7XG4gICAgICAgIHRoaXMuZ2FtZS5ocEJhci5wcm9ncmVzcyA9IHRoaXMuaHAgLyB0aGlzLm1heEhwO1xuICAgICAgICB0aGlzLmdhbWUubGV2ZWwuc3RyaW5nID0gJ0x2ICcgKyB0aGlzLmxldmVsLnRvU3RyaW5nKCk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5sZXZlbFVwQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuICAgIG9uQXR0YWNrOiBmdW5jdGlvbiBvbkF0dGFjayh0aGlzRW5lbXkpIHtcbiAgICAgICAgaWYgKGNjLnJhbmRvbTBUbzEoKSA8IHRoaXMuZG9kZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5kcmF3RGFtYWdlKHRoaXMubm9kZSwgJ01pc3MnLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuaXNPbkF0ayA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGVuZW15ID0gdGhpc0VuZW15LmdldENvbXBvbmVudCgnZW5lbXknKTtcbiAgICAgICAgICAgIHZhciBibGluayA9IGNjLmJsaW5rKDAuNiwgMyk7XG4gICAgICAgICAgICB2YXIganVtcDtcbiAgICAgICAgICAgIHZhciBmaW5pc2hlZCA9IGNjLmNhbGxGdW5jKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzT25BdGsgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgaWYgKGVuZW15LmZhY2UgPT0gJ2xlZnQnICYmIHRoaXMubm9kZS54ID4gLTQwNSkge1xuICAgICAgICAgICAgICAgIGp1bXAgPSBjYy5qdW1wQnkoMC4yLCAtNTAsIDAsIDEwLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbmVteS5mYWNlID09ICdyaWdodCcgJiYgdGhpcy5ub2RlLnggPCA0MDUpIHtcbiAgICAgICAgICAgICAgICBqdW1wID0gY2MuanVtcEJ5KDAuMiwgNTAsIDAsIDEwLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqdW1wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5zZXF1ZW5jZShqdW1wLCBibGluaywgZmluaXNoZWQpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5zZXF1ZW5jZShibGluaywgZmluaXNoZWQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhdGsgPSBlbmVteS5hdGsgKiAoMSArIDAuMSAqIGNjLnJhbmRvbU1pbnVzMVRvMSgpKTtcbiAgICAgICAgICAgIHZhciBkYW1hZ2UgPSAwO1xuICAgICAgICAgICAgaWYgKGNjLnJhbmRvbTBUbzEoKSA8IGVuZW15LmNyaXQpIHtcbiAgICAgICAgICAgICAgICBkYW1hZ2UgPSBNYXRoLmZsb29yKGF0ayAqIDEuNSk7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLmRyYXdEYW1hZ2UodGhpcy5ub2RlLCBkYW1hZ2UsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYW1hZ2UgPSBNYXRoLmZsb29yKGF0ayk7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLmRyYXdEYW1hZ2UodGhpcy5ub2RlLCBkYW1hZ2UsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaHAgLT0gZGFtYWdlO1xuICAgICAgICAgICAgdGhpcy5nYW1lLmhwQmFyLnByb2dyZXNzID0gdGhpcy5ocCAvIHRoaXMubWF4SHA7XG4gICAgICAgICAgICBpZiAodGhpcy5ocCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdFbmQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMuaHAgPSB0aGlzLm1heEhwO1xuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFjY1VwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWNjRG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZhY2UgPSAncmlnaHQnO1xuICAgICAgICB0aGlzLnBsYXllckF0dGFjayA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF0dGFja0FuaW1QbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNPbkF0ayA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCAmJiB0aGlzLm5vZGUueCA+IC00NTUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54IC09IHRoaXMuc3BlZWQgKiBkdDtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlRGlyZWN0aW9uKCdMZWZ0Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY2NSaWdodCAmJiB0aGlzLm5vZGUueCA8IDQ1NSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy5zcGVlZCAqIGR0O1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VEaXJlY3Rpb24oJ1JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWNjVXAgJiYgdGhpcy5ub2RlLnkgPCAyNjApIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS55ICs9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFjY0Rvd24gJiYgdGhpcy5ub2RlLnkgPiAtMTgwKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueSAtPSB0aGlzLnNwZWVkICogZHQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFuaW0gPSB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuICAgICAgICBpZiAodGhpcy5wbGF5ZXJBdHRhY2sgJiYgIXRoaXMuYXR0YWNrQW5pbVBsYXlpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNrQW5pbVBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLmF0a0F1ZGlvLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5mYWNlID09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgIGFuaW0ucGxheSgncGxheWVyQXR0YWNrTGVmdCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZhY2UgPT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgIGFuaW0ucGxheSgncGxheWVyQXR0YWNrUmlnaHQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdmYTE0NitlcmpoRGdycXBSTHB5SkIvNicsICdzcGVhcicpO1xuLy8gc2NyaXB0L3NwZWFyLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgcGlja1dpZHRoOiAwLFxuICAgICAgICBzcGVlZDogMCxcbiAgICAgICAgZHVyYXRpb246IDBcbiAgICB9LFxuXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICAvLyB2YXIgYW5pbSA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLkFuaW1hdGlvbik7XG4gICAgICAgIGlmICh0aGlzLmRyID09ICdsZWZ0Jykge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggLT0gdGhpcy5zcGVlZCAqIGR0O1xuICAgICAgICAgICAgLy8gYW5pbS5wbGF5QWRkaXRpdmUoJ3NwZWFyTW92ZUxlZnQnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRyID09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnNwZWVkICogZHQ7XG4gICAgICAgICAgICAgICAgLy8gYW5pbS5wbGF5QWRkaXRpdmUoJ3NwZWFyTW92ZVJpZ2h0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRpbWVyID4gdGhpcy5kdXJhdGlvbikge1xuICAgICAgICAgICAgdmFyIEFyciA9IHRoaXMuZ2FtZS5zcGVhckFycjtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IEFyci5pbmRleE9mKHRoaXMubm9kZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgQXJyLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lciArPSBkdDtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7Il19
