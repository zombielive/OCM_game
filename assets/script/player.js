cc.Class({
    extends: cc.Component,

    properties: {
        speed:0,
        atk: 0,
        maxHp: 0,
        hp: 0,
        exp: 0,
        needExp: 0,
        crit: 0,
        dodge: 0,
        level: 0,
        atkAudio:{
            default:null,
            url: cc.AudioClip
        },
        levelUpAudio:{
            default:null,
            url:cc.AudioClip
        }
    },
    changeDirection: function(dir){
        this.getComponent(cc.Animation).playAdditive('playerMove' + dir);
    },
    
    setInputControl: function(){
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                switch(keyCode) {
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
            onKeyReleased: function(keyCode, event) {
                switch(keyCode) {
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
            },
        }, self.node);
    },
    onAttackAnimCompleted: function(){
        this.attackAnimPlaying = false;
    },
    onHandsUp:function(){
        this.game.drawSpear();
    },
    getExp: function(expNum){
        this.exp += expNum;
        if(this.exp > this.needExp){
            this.levelUp();
        }else{
            this.game.soulBar.progress = this.exp/this.needExp;
        }
    },
    levelUp: function(){
        this.exp -= this.needExp;
        this.game.soulBar.progress = this.exp/this.needExp;
        this.level += 1;
        this.needExp = this.level * 100;
        this.maxHp += this.level * 50;
        this.game.enemyPrefab.atk += this.level * 10;
        this.hp = this.maxHp;
        this.game.hpBar.progress = this.hp/this.maxHp;
        this.game.level.string = 'Lv ' + this.level.toString();
        cc.audioEngine.playEffect(this.levelUpAudio, false);
    },
    onAttack: function(thisEnemy){
        if(cc.random0To1() < this.dodge){
            this.game.drawDamage(this.node,'Miss',true);
            this.isOnAtk = false;
        }else{
            var enemy = thisEnemy.getComponent('enemy');
            var blink = cc.blink(0.6,3);
            var jump;
            var finished = cc.callFunc(function(){
                this.isOnAtk = false;
            },this);
            if(enemy.face == 'left' && this.node.x > -405){
                jump = cc.jumpBy(0.2,-50,0,10,1);
            }
            if(enemy.face == 'right' && this.node.x < 405){
                jump = cc.jumpBy(0.2, 50, 0, 10, 1);
            }
            if(jump){
                this.node.runAction(cc.sequence(jump,blink,finished));
            }else{
                this.node.runAction(cc.sequence(blink,finished));
            }
            var atk = enemy.atk *(1 + 0.1 * cc.randomMinus1To1());
            var damage = 0;
            if(cc.random0To1() < enemy.crit){
                damage = Math.floor(atk * 1.5);
                this.game.drawDamage(this.node,damage,true);
            }else{
                damage = Math.floor(atk);
                this.game.drawDamage(this.node,damage,false);
            }
            this.hp -= damage;
            this.game.hpBar.progress = this.hp/this.maxHp;
            if(this.hp <= 0){
                cc.director.loadScene('End');
            }
        }
    },
    // use this for initialization
    onLoad: function () {
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
    update: function(dt){
        if(this.accLeft&&this.node.x > -455){
            this.node.x -= this.speed * dt;
            this.changeDirection('Left');
        }else if(this.accRight&&this.node.x < 455){
            this.node.x += this.speed * dt;
            this.changeDirection('Right');
        }
        if(this.accUp&&this.node.y < 260){
            this.node.y += this.speed *dt;
        }else if(this.accDown&& this.node.y > -180){
            this.node.y -= this.speed *dt;
        }
        var anim = this.getComponent(cc.Animation);
        if(this.playerAttack&&!(this.attackAnimPlaying)){
            this.attackAnimPlaying = true;
            cc.audioEngine.playEffect(this.atkAudio, false);
            if(this.face =='left'){
                anim.play('playerAttackLeft');
            }else if(this.face =='right'){
                anim.play('playerAttackRight');
            }
        }
    },


});
