window.entities = window.entities || {};

(function() {

  var Horse = function(args) {

    _.extend(this, {
      direction: 0,
      speed: -10,
      maxSpeed: 250,
      currentMaxSpeed: 250,
      turning: 0.03,
      /* brain cooldown */
      brainDelta: 0,
      player: false,
      spurred: false,
      color: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
    }, args);
    this.size = [30, 10];
    this.awareness = 5;
    this.cruisingSpeed = Math.floor(0.60 * this.currentMaxSpeed);
    this.walkingSpeed = Math.floor(0.30 * this.currentMaxSpeed);
    this.baseTurning = this.turning;
    this.oncreate();
  };

  Horse.prototype = {
    blockType: 1,
    renderLevel: 2,
    energy: 5,
    oncreate: function() {
      this.stepNumber = 0;
      this.stepRound = 0;
      this.prepareImage();
    },
    knightRide: function(knight) {
      this.rider = knight;
    },
    prepareImage: function() {
      var image = app.assets.image("horses2")
      var wrapper = cq(image).resizePixel(1.5 * app.zoom);
      this.image = wrapper.canvas;
      var wrapperSmall = cq(image).resize(1 * app.zoom * 0.8);
      this.imageSmall = wrapperSmall.canvas;
      this.imageNormal = wrapper.canvas;
      this.imageSize = 'normal';
    },
    changeImageSize: function() {
      if(this.imageSize === 'normal') {
        this.image = this.imageSmall;
        this.imageSize = 'small'
      } else {
        this.image = this.imageNormal;
        this.imageSize = 'normal'
      }
    },
    step: function(delta) {
      this.stepNumber++;
      if(this.spurredLeft) {
        this.spurredLeft--;
        this.spurred = true;
        if(this.spurredLeft > 15) {
          this.turning = this.baseTurning / 2;
        } else {
          this.turning = 2* this.baseTurning / 3;
        }
      } else {
        this.spurred = false;
        this.turning = this.baseTurning;
      }

      /* decrease brain cooldown  */
      this.brainDelta -= delta;

      /* if cooldown goes below zero - think ant, think! */
      if (this.brainDelta < 0) {

        // /* take some random direction (in radians) */
        if(!this.knight) {
          this.intendedDirection = Math.random() * Math.PI * 2;
          this.intendedDirection = Math.round(this.intendedDirection * 100) / 100;
        }
        /* delay next ai invocation */
        this.brainDelta = Math.random() * 2000;
      }

      // NAtural horse speed increase
      if(this.speed < this.walkingSpeed) {
        this.speed += 40 * delta / 5000;
      }
      // horse-ridden speed increase
      if(this.awareness > 5 && this.speed < this.cruisingSpeed) {
        this.speed += 40 * delta / 5000;
      } else {
        if(this.speed > this.walkingSpeed) {
          this.speed -= 20 * delta / 5000;
        }
      }

      if(this.spurred) {
        this.speed = this.speed + 50 * delta / 5000;
      } else {
        this.awareness -= 0.01;
      }

      if(this.speed > this.currentMaxSpeed) {
        this.speed = this.currentMaxSpeed * ( (0.10 * Math.random()) + 0.90);
      }

      if(this.energy <= 0 && !this.exahusted) {
        this.maxSpeed = 2 * this.maxSpeed / 3
        this.currentMaxSpeed = 2 * this.currentMaxSpeed / 3;
        this.exahusted = true;
      }
      // this.speed = 0


      this.turn();

      // this.direction = 1
      /* move the ant towards its current direction */
      var newX = this.x + (Math.cos(this.direction) * this.speed * delta / 1000)* app.zoom;
      var newY = this.y + (Math.sin(this.direction) * this.speed * delta / 1000)* app.zoom;
      if(newX > 0 && newX <= app.width* app.zoom) {
        this.x = newX;
      } else {
        this.speed = 0;
        this.intendedDirection *= -1;
      }
      if(newY > 0 && newY <= app.height* app.zoom) {
        this.y = newY;
      } else {
        this.speed = 0;
        this.intendedDirection *= -1;
      }
    },
    getTurningHability: function() {
      var riderHability = this.rider? this.rider.horsemanship : 1;
      if(this.speed < this.maxSpeed /4) {
        return 4 * this.turning * (riderHability / 5);
      } else if(this.speed < 2 * this.maxSpeed / 4) {
        return 2 * this.turning * (riderHability / 5);
      } else if(this.speed < 3 * this.maxSpeed / 4) {
        return this.turning * (riderHability / 5);
      } else {
        return 2/3 * this.turning * (riderHability/5)
      }
    },
    turn: function() {
      this.checkBorders();
      if(
          Math.abs(this.intendedDirection - this.direction) <= Math.PI
        ) {
        if(this.direction < this.intendedDirection) {
          if(this.intendedDirection - this.direction <= this.getTurningHability()) {
            this.direction = this.intendedDirection;
          } else {
            this.direction = this.direction + this.getTurningHability();
          }
        } else {
          if(this.direction - this.intendedDirection <= this.getTurningHability()) {
            this.direction = this.intendedDirection;
          } else {
            this.direction = this.direction - this.getTurningHability();
          }
        }
      } else {
        if(this.direction < this.intendedDirection) {
          this.direction = this.direction - this.getTurningHability();
        } else {
          this.direction = this.direction + this.getTurningHability();
        }

      }
      if(this.direction < 0) {
        this.direction = 2 * Math.PI + this.direction;
      }
      if(this.direction > 2 * Math.PI) {
        this.direction = this.direction % (2 * Math.PI);
      }

    },

    render: function(delta, center) {
      // this.speed = 0;
      var round = 1;
      if(this.speed < 25) {
        round = (Math.floor(this.stepNumber / 15) % 4);
      } else if(this.speed < 50) {
        round = (Math.floor(this.stepNumber / 10) % 4);
      } else if(this.speed < 75) {
        round = (Math.floor(this.stepNumber / 5) % 4);
      } else {
        round = (Math.floor(this.stepNumber / 4) % 4);
      }
      var orientation = 1;
      if(this.direction > 0 && this.direction <=  Math.PI) {
        orientation = 0;
      // }
      // if(this.direction > 3 * Math.PI /4 && this.direction <= 5 * Math.PI /4) {
      //   orientation = 2;
      }
      // if(this.direction > 5 * Math.PI /4 && this.direction <= 7 * Math.PI /4) {
      //   orientation = 1;
      // }
      app.layer
        .fillStyle(this.color)
        .save()
        .scale(app.zoom, app.zoom)
        .translate(this.x - center[0], this.y - center[1])
        .rotate(-1 * Math.PI /2 + this.direction)
        .drawImage(this['image'],
          60 * round * app.zoom,
          orientation * 60 * app.zoom,
          60 * app.zoom,
          60 * app.zoom,
         -60* app.zoom / 2,
         -60* app.zoom / 2,
          60* app.zoom,
          60* app.zoom
        )
        .restore();
    },

    checkBorders: function() {
      if(
        this.x > (7 * app.width * app.zoom/8) ||
        this.x < (app.width* app.zoom/8 ) ||
        this.y > (7 * app.height/8 * app.zoom) ||
        this.y < (app.height/8 * app.zoom)) {
        this.currentMaxSpeed = this.maxSpeed / 2;
        this.currentMaxSpeed = this.walkingSpeed > this.currentMaxSpeed? this.walkingSpeed : this.currentMaxSpeed;
      } else {
        this.currentMaxSpeed = this.maxSpeed;
      }

      if(this.x > (7 * app.zoom * app.width/8)) {
        this.intendedDirection = Math.PI
      }
      if(this.x < (app.width * app.zoom /8)) {
        this.intendedDirection = 0;
      }
      if(this.y > (7 * app.height * app.zoom /8)) {
        this.intendedDirection = 3 * Math.PI / 2;
      }
      if(this.y < (app.height * app.zoom /8)) {
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
      if(Math.abs(point[0] - this.x) <= this.size[0] * app.zoom * 1 / app.game.currentZoom) {
        if(Math.abs(point[1] - this.y) <= this.size[0] * app.zoom * 1 / app.game.currentZoom) {
          return true;
        }
      }
      return false;
    },

    getPosition: function() {
      return [this.x, this.y];
    },

    DeprecatedgetSaddlePosition: function() {
      var middlePointX = this.size[0] * app.zoom / 1;
      var middlePointY = this.size[1] * app.zoom / 1;
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
        var angle = utils.atanxy(otherHorse.x - this.x, otherHorse.y - this.y);
        if(this.isFront(otherHorse.getPosition()) > 0) {
          this.intendedDirection = angle;
        } else {
          this.intendedDirection = angle;
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
      this.speed = this.speed * 1.50;
      this.energy--;
      this.awareness = 10;
      this.spurredLeft = 100;
    }

  };

  window.entities.Horse = Horse;
})();
