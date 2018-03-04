/**
 * Created by Jerome on 04-10-17.
 */
var Player = new Phaser.Class({

    Extends: Moving,

    initialize: function Player () {
        // Using call(), the called method will be executed while having 'this' pointing to the first argumentof call()
        //Moving.call(this,data.x,data.y,'hero',data.id);
        Moving.call(this,0,0);

        this.setTexture('hero');
        this.setFrame(33);
        this.setOrigin(0.4,0.9);
        this.firstUpdate = true;

        this.bubbleOffsetX = 55;
        this.bubbleOffsetY = 75;
        // TODO: use pool of bubbles
        this.bubble = new Bubble(this.x-this.bubbleOffsetX,this.y-this.bubbleOffsetY);
        this.walkAnimPrefix = 'player';

        this.restingFrames = {
            up: 20,
            down: 33,
            left: 52,
            right: 7
        };

        this.destinationAction = null;
    },

    setUp: function(data){
        this.id = data.id;
        Engine.players[this.id] = this;
        Engine.displayedPlayers.add(this.id);

        this.name = 'Player '+this.id;
        this.setPosition(data.x,data.y);
    },

    update: function(data){
        if(data.path && !this.isHero) this.move(data.path);
        if(data.inBuilding > -1) {
            if(!this.isHero) this.setVisible(false);
            this.inBuilding = data.inBuilding;
        }
        if(data.inBuilding == -1){
            if(!this.isHero) this.setVisible(true);
            this.inBuilding = data.inBuilding;
        }
        if(data.settlement) this.settlement = settlement;
        Engine.handleBattleUpdates(this,data);
        if(data.dead == true) this.die(!this.firstUpdate);
        if(data.dead == false) this.respawn();
        if(!this.isHero && data.chat) this.talk(data.chat);
        if(data.x >= 0 && data.y >= 0) this.teleport(data.x,data.y);
        this.firstUpdate = false;
    },

    remove: function(){
        Engine.displayedPlayers.delete(this.id);
        delete Engine.players[this.id];
        this.destroy();
    },

    move: function(path){
        if(this.isHero){
            if(this.destinationAction) path.pop();
            Client.sendPath(path,this.destinationAction);
        }
        Moving.prototype.move.call(this,path);
    },

    endMovement: function() {
        Moving.prototype.endMovement.call(this);
        if(BattleManager.inBattle) BattleManager.onEndOfMovement();
        if(this.isHero){
            if(this.destinationAction && this.destinationAction.type == 1){
                Engine.enterBuilding(this.destinationAction.id);
            }
        }
    },

    talk: function(text){
        this.bubble.update(text);
        this.bubble.display();
    },

    die: function(showAnim){
        if(showAnim) Engine.deathAnimation(this);
        if(this.bubble) this.bubble.hide();
        this.setVisible(false);
    },

    respawn: function(){
        Engine.deathAnimation(this);
        this.setVisible(true);
    },

    // ### SETTERS ####

    setDestinationAction: function(type,id){
        if(type == 0){
            this.destinationAction = null;
            return;
        }
        this.destinationAction = {
            type: type,
            id: id
        }
        console.log('action set to',this.destinationAction);
    },

    // ### GETTERS ####

    getEquipped: function(slot,subSlot){
        return this.equipment[slot][subSlot];
    },

    isAmmoEquipped: function(slot){
        return this.equipment[slot][0] > -1;
    },

    getContainerID: function(slot){
        return this.equipment[slot][0];
    },

    getNbInContainer: function(slot){
        return this.equipment.containers[slot];
    },

    getStat: function(stat){
        return this.stats[stat];
    },

    getStatValue: function(stat){
        return this.getStat(stat).getValue();
    }
});