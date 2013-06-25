window.entities = window.entities || {};

(function() {

  var Knight = function(args) {
    this.horse = args.horse;
    _.extend(this, {

      /* direction the ant is facing (in radians) */
      direction: 0,
      /* brain cooldown - AI will be called in random periods of time
         so can ants move more naturally */
      brainDelta: 0,
      player: false,

      turning: 0.1,
      color: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
    }, args);
    this.size = [5, 5];
    this.x = this.horse.x;
    this.y = this.horse.y;
    this.oncreate();
  };

  Knight.prototype = {
    MAX_TURN: Math.PI / 4,
    oncreate: function() {

      var image = app.assets.image("knight")
      var wrapper = cq(image).blend(this.color, "addition", 1.0).resizePixel(2);
      this.image = wrapper.canvas;
    },

    step: function(delta) {
      /* decrease brain cooldown  */
      this.brainDelta -= delta;

      /* if cooldown goes below zero - think ant, think! */
      if (this.brainDelta < 0) {

        /* take some random direction (in radians) */
        if(!this.player) {
          this.intendedDirection = Math.random() * Math.PI * 2;
          this.intendedDirection = Math.round(this.intendedDirection * 100) / 100;
        }

        /* delay next ai invocation */
        this.brainDelta = Math.random() * 2000;
      }


      this.horse.intendedDirection = this.intendedDirection;

      this.turn();

    },

    turn: function() {
      if(
          Math.abs(this.intendedDirection - this.direction) <= Math.PI
        ) {
        if(this.direction < this.intendedDirection) {
          if(this.intendedDirection - this.direction <= this.turning) {
            this.direction = this.intendedDirection;
          } else {
            this.direction = this.direction + this.turning;
          }
        } else {
          if(this.direction - this.intendedDirection <= this.turning) {
            this.direction = this.intendedDirection;
          } else {
            this.direction = this.direction - this.turning;
          }
        }
      } else {
        if(this.direction < this.intendedDirection) {
          this.direction = this.direction - this.turning;
        } else {
          this.direction = this.direction + this.turning;
        }

      }

      this.maxTurn();


      if(this.direction < 0) {
        this.direction = 2 * Math.PI + this.direction;
      }
      if(this.direction > 2 * Math.PI) {
        this.direction = this.direction % (2 * Math.PI);
      }

    },

    maxTurn: function() {
      var angRider = this.direction;
      var angHorse = this.horse.direction;
      var changed = false;
      if(
        (angRider - angHorse > 0) &&
        (angRider - angHorse > this.MAX_TURN)
      ) {
        changed = true;
        this.direction = angHorse + this.MAX_TURN;
      } else if(
        (angHorse - angRider > 0) &&
        (angHorse - angRider > this.MAX_TURN)
      ) {
        changed = true;
        this.direction = angHorse - this.MAX_TURN;
      }
    },

    render: function(delta) {
      var saddlePoint = this.horse.getSaddlePosition();
      app.layer
        .fillStyle(this.color)
        .save()
        .translate(saddlePoint[0], saddlePoint[1])
        .rotate(this.direction)
        .drawImage(this.image, -this.image.width / 2, -this.image.height / 2)
        .restore();
    },

    remove: function() {

      /* mark for removal */
      this._remove = true;

      /* tell the collection that there are some dead animals in the ventilation */
      this.collection.dirty = true;
    },

    isFront: function(point) {
      var angle = utils.atanxy(point[0] - this.x, point[1] - this.y);
      return Math.abs(angle - this.direction) < (Math.PI / 4)
    },

    isNear: function(point) {
      if(Math.abs(point[0] - this.x) <= this.size[0]) {
        if(Math.abs(point[1] - this.y) <= this.size[0]) {
          return true;
        }
      }
      return false;
    },

    getPosition: function() {
      return [this.x, this.y];
    },

    notifyFront: function(otherHorse) {
      if(this.isFront(otherHorse.getPosition()) > 0) {
       this.intendedDirection += Math.PI;
      } else {
        this.intendedDirection -= Math.PI;
      }
    },

    notifyNear: function(otherHorse) {
      this.speed = Math.floor(this.speed / 3);
    }

  };

  window.entities.Knight = Knight;
})();
