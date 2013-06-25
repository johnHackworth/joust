window.entities = window.entities || {};

(function() {

  var GameObjects = function(args) {

  }

  GameObjects.prototype = new window.engine.Collection();
  GameObjects.prototype.notifyNear = function() {
    for(var i = 0, l = this.length; i < l; i++) {
      for(var j = 0, ll = this.length; j < ll; j++) {
        if(i != j) {
          if(this[i].isNear(this[j].getPosition()) &&
             this[i].isFront(this[j].getPosition())
          ) {
            this[i].notifyNear(this[j]);
            this[i].notifyFront(this[j]);
          }

        }

      }
    }
  };
  GameObjects.prototype.step = function(delta) {
    this.notifyNear();
    return window.engine.Collection.prototype.step.call(this, delta);
  }

  window.entities.GameObjects = GameObjects;
})()
