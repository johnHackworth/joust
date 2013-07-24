window.entities = window.entities || {};

(function() {

  var GameObjects = function(args) {

  }

  GameObjects.prototype = new window.engine.Collection();
  GameObjects.prototype.notifyNear = function() {
    for(var i = 0, l = this.length; i < l; i++) {
      for(var j = 0, ll = this.length; j < ll; j++) {
        if(i != j) {
          if(this[i].isNear && this[i].blockType === this[j].blockType &&
              this[i].isNear(this[j].getPosition()) &&
             this[i].isFront(this[j].getPosition())
          ) {
            this[i].notifyNear(this[j]);
            this[i].notifyFront(this[j]);
          }

        }

      }
    }
  };
  GameObjects.prototype.notifyHits = function() {
    for(var i = 0, l = this.length; i < l; i++) {
      for(var j = 0, ll = this.length; j < ll; j++) {
        if(this[i].type == 'arm' && this[j].type=='knight') {
          if(
            this[i].owner != this[j] &&
            this[i].isHitting(this[j])

          ) {
            this[j].hitBy(this[i]);
          }
        }

      }
    }
  }
  GameObjects.prototype.step = function(delta) {
    this.notifyNear();
    this.notifyHits();
    return window.engine.Collection.prototype.step.call(this, delta);
  }

  window.entities.GameObjects = GameObjects;
})()
