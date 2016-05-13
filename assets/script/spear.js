cc.Class({
    extends: cc.Component,

    properties: {
        pickWidth:0,
        speed: 0,
        duration: 0
    },

    onLoad: function () {
        this.timer = 0;
    },
    
    update:function(dt){
        // var anim = this.getComponent(cc.Animation);
        if(this.dr=='left'){
            this.node.x -= this.speed * dt;
            // anim.playAdditive('spearMoveLeft');
        }else if(this.dr =='right'){
            this.node.x += this.speed * dt;
            // anim.playAdditive('spearMoveRight');
        }
        if(this.timer > this.duration){
            var Arr = this.game.spearArr;
            var index = Arr.indexOf(this.node);
            if(this.node){
                Arr.splice(index,1);
                this.node.destroy();
                return;
            }
        }
        this.timer += dt;
    }
});