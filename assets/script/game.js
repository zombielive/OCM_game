cc.Class({
    extends: cc.Component,

    properties: {
        enemyPrefab:{
            default: null,
            type: cc.Prefab
        },
        ground:{
            default: null,
            type: cc.Node
        },
        player:{
            default: null,
            type: cc.Node
        },
        spearPrefab:{
            default: null,
            type: cc.Prefab
        },
        damagePrefab:{
            default: null,
            type: cc.Prefab
        },
        heartPrefab:{
            default: null,
            type: cc.Prefab
        },
        soulBar:{
            default: null,
            type:cc.ProgressBar
        },
        hpBar:{
            default: null,
            type:cc.ProgressBar
        },
        level: {
            default: null,
            type:cc.Label
        }
    },

    onLoad: function () {
        this.spearArr = [];
        this.enemyNum = 0;
        this.player.getComponent('player').game = this;
        this.drawEnemys();
    },
    
    update: function(){
       if(this.enemyNum < 1){
           this.drawEnemys();
       }
    },
    
    drawEnemys:function(){
        for(var i = 0;i<5;i++){
            var newEnemy = cc.instantiate(this.enemyPrefab);
            this.node.addChild(newEnemy);
            this.enemyNum +=1;
            newEnemy.setPosition(this.getEnemyPosition());
            newEnemy.getComponent('enemy').game = this;
        }
    },

    getEnemyPosition: function(){
        var maxX = this.node.width - 250;
        var maxY = this.ground.height/2 -this.player.height/2;
        var ranX = cc.random0To1() * maxX + 225 - this.node.width/2;
        var ranY = cc.randomMinus1To1() * maxY;
        return cc.p(ranX,ranY);
    },
    drawSpear:function(){
        var newSpear = cc.instantiate(this.spearPrefab);
        this.node.addChild(newSpear);
        this.spearArr.push(newSpear);
        newSpear.getComponent('spear').game = this;
        if(this.player.getComponent('player').face == 'left'){
            newSpear.setPosition(this.getSpPosition(true));
            newSpear.getComponent('spear').dr = 'left';
        }else if(this.player.getComponent('player').face == 'right'){
            newSpear.setPosition(this.getSpPosition(false));
            newSpear.getComponent('spear').dr = 'right';
        }
    },

    getSpPosition: function(isLeft){
        var sx;
        var sy = this.player.y;
        if(isLeft){
            sx = this.player.x - this.player.width;
        }else{
            sx = this.player.x + this.player.width;
        }
        return cc.p(sx,sy);
    },
    drawDamage: function(theNode,num,isCrit){
        var newDamage = cc.instantiate(this.damagePrefab);
        this.node.addChild(newDamage);
        newDamage.setPosition(this.getDamagePosition(theNode));
        newDamage.getComponent(cc.Label).string = num;
        if(isCrit){
            newDamage.getComponent(cc.Label).fontSize = 20;
        }else{
            newDamage.getComponent(cc.Label).fontSize = 15;
        }
        var jump = cc.jumpBy(0.2, 0, 20, 20, 1);
        var fadeOut = cc.fadeOut(0.1);
        var finished = cc.callFunc(function(){
            newDamage.destroy();
        }, this);
        newDamage.runAction(cc.sequence(jump,fadeOut,finished));
    },
    getDamagePosition: function (theNode) {
        var daX = theNode.x;
        var daY = theNode.y +theNode.height/2;
        return cc.p(daX, daY);
    },
    drawHeart:function(theNode){
        var newHeart = cc.instantiate(this.heartPrefab);
        this.node.addChild(newHeart);
        newHeart.setPosition(cc.p(theNode.x,theNode.y));
        var jump = cc.jumpBy(0.2, 20, 0, 20, 1);
        newHeart.runAction(jump);
        newHeart.getComponent('heart').game = this;
    },
});
