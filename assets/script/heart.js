cc.Class({
    extends: cc.Component,

    properties: {
        heal: 0,
        pickRadius: 0,
        jumpHeight: 0,
        jumpDuration: 0,
        pickAudio:{
            default:null,
            url: cc.AudioClip
        }
    },
    getPlayerDistance: function () {
        var playerPos = this.game.player.getPosition();
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },
    onPicked: function() {
        cc.audioEngine.playEffect(this.pickAudio, false);
        var hp = this.game.player.getComponent('player').hp;
        var maxHp = this.game.player.getComponent('player').maxHp;
        var afterHp = hp + this.heal;
        if(afterHp > maxHp){
            hp = maxHp;
        }else{
            this.game.player.getComponent('player').hp += this.heal;
        }
        this.game.hpBar.progress = this.game.player.getComponent('player').hp/this.game.player.getComponent('player').maxHp;
        this.node.destroy();
    },
    onLoad: function () {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        this.node.runAction(cc.repeatForever(cc.sequence(jumpUp, jumpDown)));
    },
    update: function (dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }
    },

});
