cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius:0,
        speed: 0,
        atk: 0,
        hp: 0,
        exp: 0,
        crit: 0,
        dodge: 0,
        dropRate: 0,
        dieAudio:{
            default:null,
            url: cc.AudioClip
        }
    },

    onLoad: function () {
        this.isPicked = false;
        this.face = 'left';
    },

    getPlayerDistance:function(){
        var playerPos = this.game.player.getPosition();
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },
    
    onPicked:function(dt){
        var playerPos = this.game.player.getPosition();
        var anim = this.getComponent(cc.Animation);
        var directV = cc.pNormalize(cc.pSub(playerPos, this.node.position));
        if(directV.x > 0){
            anim.play('enemyMoveRight');
            this.face = 'right';
        }else{
            anim.play('enemyMoveLeft');
            this.face = 'left';
        }
        this.node.x += this.speed * directV.x * dt * cc.random0To1();
        this.node.y += this.speed * directV.y * dt * cc.random0To1();
        
    },
    
    findSpears: function(){
        var Arr = this.game.spearArr;
        if(Arr.length > 0){
            var enemyX = this.node.x;
            var enemyY = this.node.y;
            for(var sp in Arr){
                var dx = Math.abs(enemyX - Arr[sp].x);
                var dy = Math.abs(enemyY - Arr[sp].y);
                if(dx < 50 && dy < 20){
                    this.onAttack();
                    Arr[sp].destroy();
                    Arr.splice(sp,1);
                }
            }
        }
    },
    
    onAttack: function(){
        this.isPicked = true;
        if(cc.random0To1() < this.dodge){
            this.game.drawDamage(this.node,'Miss',true);
        }else{
            var blink = cc.blink(0.2,2);
            this.node.runAction(blink);
            var player = this.game.player.getComponent('player');
            var atk = player.atk *(1 + 0.1 * cc.randomMinus1To1());
            var damage = 0;
            if(cc.random0To1() < player.crit){
                damage = Math.floor(atk * 1.5);
                this.game.drawDamage(this.node,damage,true);
            }else{
                damage = Math.floor(atk);
                this.game.drawDamage(this.node,damage,false);
            }
            this.hp -= damage;
            if(this.hp <= 0){
                this.dead();
            }
        }
    },
    dead: function(){
        var fadeOut = cc.fadeOut(0.2);
        if(cc.random0To1() < this.dropRate){
            this.game.drawHeart(this.node);
        }
        this.game.player.getComponent('player').getExp(this.exp);
        this.game.enemyNum -=1;
        cc.audioEngine.playEffect(this.dieAudio, false);
        this.node.destroy();
    },
    atkPlayer: function(){
        var player = this.game.player;
        var playerRect = cc.rect(player.x, player.y, player.width, player.height);
        var enemyRect = cc.rect(this.node.x, this.node.y, this.node.width, this.node.height);
        var isAtk = cc.rectIntersectsRect(playerRect, enemyRect);
        if(isAtk && !player.getComponent('player').isOnAtk){
            player.getComponent('player').isOnAtk = true;
            player.getComponent('player').onAttack(this.node);
        }
    },
    
    update:function(dt){
        if(this.getPlayerDistance() < this.pickRadius){
            this.isPicked = true;
        }
        if(this.isPicked){
            this.onPicked(dt);
        }
        this.findSpears();
        this.atkPlayer();            
    }
});
