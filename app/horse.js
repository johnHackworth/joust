window.entities = window.entities || {};

(function() {

  var Horse = function(args) {

    _.extend(this, {

      /* direction the ant is facing (in radians) */
      direction: 0,
      speed: 6,
      maxSpeed: 95,
      turning: 0.02,
      /* brain cooldown - AI will be called in random periods of time
         so can ants move more naturally */
      brainDelta: 0,
      player: false,
      spurred: false,
      color: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
    }, args);
    this.size = [20, 5];

    this.oncreate();
  };

  Horse.prototype = {
    blockType: 1,
    oncreate: function() {

      var image = app.assets.image("horsie")
      var wrapper = cq(image).blend(this.color, "addition", 1.0).resizePixel(2);
      this.image = wrapper.canvas;
    },

    step: function(delta) {
      if(this.spurredLeft) {
        this.spurredLeft--;
        this.spurred = true;
      } else {
        this.spurred = false;
      }

      /* decrease brain cooldown  */
      this.brainDelta -= delta;

      /* if cooldown goes below zero - think ant, think! */
      if (this.brainDelta < 0) {

        // /* take some random direction (in radians) */
        // if(!this.player) {
        //   this.intendedDirection = Math.random() * Math.PI * 2;
        //   this.intendedDirection = Math.round(this.intendedDirection * 100) / 100;
        // }
        /* delay next ai invocation */
        this.brainDelta = Math.random() * 2000;
      }

      this.speed += 30 * delta / 5000;
      if(this.speed > this.maxSpeed) {
        this.speed = this.maxSpeed * ( (0.10 * Math.random()) + 0.90);
      }
      if(this.spurred) {
        this.speed = this.speed * 1.5;
      }
      // this.speed = 0


      this.turn();
      // this.direction = 1
      /* move the ant towards its current direction */
      var newX = this.x + Math.cos(this.direction) * this.speed * delta / 1000;
      var newY = this.y + Math.sin(this.direction) * this.speed * delta / 1000;
      if(newX > 0 && newX <= app.width) {
        this.x = newX;
      } else {
        this.speed = 0;
        this.intendedDirection *= -1;
      }
      if(newY > 0 && newY <= app.height) {
        this.y = newY;
      } else {
        this.speed = 0;
        this.intendedDirection *= -1;
      }
    },

    turn: function() {
      this.checkBorders();
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
      if(this.direction < 0) {
        this.direction = 2 * Math.PI + this.direction;
      }
      if(this.direction > 2 * Math.PI) {
        this.direction = this.direction % (2 * Math.PI);
      }

    },

    render: function(delta) {

      app.layer
        .fillStyle(this.color)
        .save()
        .translate(this.x, this.y)
        .rotate(this.direction)
        .drawImage(this.image, -this.image.width / 2, -this.image.height / 2)
        .restore();
    },

    checkBorders: function() {
      if(this.x > (7 * app.width/8)) {
        this.intendedDirection = Math.PI
      }
      if(this.x < (app.width/8)) {
        this.intendedDirection = 0;
      }
      if(this.y > (7 * app.height/8)) {
        this.intendedDirection = 3 * Math.PI / 2;
      }
      if(this.y < (app.height/8)) {
        this.intendedDirection = 1 * Math.PI / 2;
      }

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

    DeprecatedgetSaddlePosition: function() {
      var middlePointX = this.size[0] / 1;
      var middlePointY = this.size[1] / 1;
      var displacementX = Math.abs(Math.cos(this.direction) * middlePointX);
      var x = Math.floor(this.x - displacementX);
      var displacementY = Math.abs(Math.sin(this.direction) * middlePointY);
      var y = Math.floor(this.y - displacementY);
      return [x,y];
    },
    getSaddlePosition: function() {
      var angle_rad = this.direction; //angle_degrees * Math.PI / 180;
      var cosa = Math.cos(angle_rad);
      var sina = Math.sin(angle_rad);
      return [ this.x + cosa - sina ,
               this.y + sina + cosa ];
    },
    notifyFront: function(otherHorse) {
      if(this.spurred) {

      } else {
        if(this.isFront(otherHorse.getPosition()) > 0) {
         this.intendedDirection += Math.PI;
        } else {
          this.intendedDirection -= Math.PI;
        }
      }
    },

    notifyNear: function(otherHorse) {
      if(this.spurred) {
        this.speed = Math.floor(this.speed / 2);
      } else {
        this.speed = Math.floor(this.speed / 3);
      }
    },

    spur: function() {
      this.spurred = true;
      this.spurredLeft = 100;
    }

  };

  window.entities.Horse = Horse;
})();
