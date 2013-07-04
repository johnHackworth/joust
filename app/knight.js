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
    this.shieldType = args.shield || 1;
    this.name = args.name || this._DEFAULT_NAME;
    this.size = [5, 5];
    this.health = args.health || this._DEFAULT_HEALTH;
    this.maxHealth = this.health;
    this.x = this.horse.x;
    this.y = this.horse.y;
    this.oncreate();
  };

  Knight.prototype = {
    type: 'knight',
    MAX_TURN: Math.PI / 4,
    _DEFAULT_HEALTH: 10,
    _DEFAULT_NAME: 'knight',
    blockType: 3,
    oncreate: function() {

      var image = app.assets.image("knight")
      var wrapper = cq(image).blend(this.color, "addition", 1.0).resizePixel(2);
      this.image = wrapper.canvas;
      var imageOuch = app.assets.image("ouch")
      var wrapperOuch = cq(imageOuch).resizePixel(2);
      this.imageOuch = wrapperOuch.canvas;

    },

    step: function(delta) {
      if(this.dead) return;
      /* decrease brain cooldown  */
      this.brainDelta -= delta;
      if(this.ouchTime) {
        this.ouchTime--;
      }

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

      if(this.horse) {
        this.horse.intendedDirection = this.intendedDirection;
      }
      if(this.arm) {
        this.arm.intendedDirection = this.direction;
      }

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
      if(this.dead) return;
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
        (angHorse - angRider < Math.PI) &&
        (angHorse - angRider > this.MAX_TURN)
      ) {
        changed = true;
        this.direction = angHorse - this.MAX_TURN;
      } else if(
        (angHorse - angRider > 0) &&
        (angHorse - angRider >= Math.PI) &&
        (angHorse - angRider > this.MAX_TURN)
      ) {
        /** fallo aquí **/
        changed = true;
        this.direction = angHorse + this.MAX_TURN;
      }
    },

    render: function(delta) {
      if(!this.dead && this.horse && this.horse.getSaddlePosition) {
        var saddlePoint = this.horse.getSaddlePosition();
        this.x = saddlePoint[0];
        this.y = saddlePoint[1];
      }
      app.layer
        .fillStyle(this.color)
        .save()
        .translate(this.x, this.y)
        .rotate(this.direction)
        .drawImage(this.image, -this.image.width / 2, -this.image.height / 2)
      if(this.ouchTime) {
        app.layer
          .drawImage(this.imageOuch, -this.imageOuch.width / 4, -this.imageOuch.height / 4);
      }
      app.layer
        .restore();

      if(this.ouchTime) {
        app.layer
          .fillStyle('#AA0000')
          .font('arial 24px #000000')
          .wrappedText("" + this.currentDamage,
            this.x - 3,
            this.y - 10,
            20)
      }

      if(!this.dead) {
        app.layer.beginPath();
        var xEnergy = this.health / this.maxHealth;
        app.layer.context.fillStyle = "rgba(" +
          (200 - (200*xEnergy)) +
          ", " +
          (200 * xEnergy) +
          ", 0, 0.6)";
        app.layer.context.strokeStyle = "#555555";
        app.layer.fillRect(
          this.x - 15,
          this.y - 20,
          30 * xEnergy,
          5);
        app.layer.moveTo(this.x - 15, this.y - 20);
        app.layer.lineTo(this.x - 15 + 30 * xEnergy, this.y - 20);
        app.layer.lineTo(this.x - 15 + 30 * xEnergy, this.y - 16);
        app.layer.lineTo(this.x - 15, this.y - 16);
        app.layer.lineTo(this.x - 15, this.y - 20);
        app.layer.stroke();
        app.layer
          .restore();
      }
    },

    remove: function() {

      /* mark for removal */
      this._remove = true;

      /* tell the collection that there are some dead animals in the ventilation */
      this.collection.dirty = true;
    },
    getArmPosition: function() {
      var angle_rad = this.direction; //angle_degrees * Math.PI / 180;
      var cosa = Math.cos(angle_rad);
      var sina = Math.sin(angle_rad);
      return [ this.horse.x + cosa - sina ,
               this.horse.y + sina + cosa ];
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
      if(otherHorse.knight) {
        if(!this.knight.player) {
          this.arm.intendedDirection = otherHorse.getSaddlePosition();
          this.spurHorse();
          console.log('yeeeha')
        }
      } else {
        if(this.isFront(otherHorse.getPosition()) > 0) {
         this.intendedDirection += Math.PI;
        } else {
          this.intendedDirection -= Math.PI;
        }

      }
    },

    notifyNear: function(otherHorse) {
      this.speed = Math.floor(this.speed / 3);
    },

    spurHorse: function() {
      this.horse.spur();
    },

    hitBy: function(arm) {
      var damage = arm.getDamageTo(this);
      if(this.ouchTime > 0) {
        if(this.currentDamage < damage) {
          this.ouchTime = 10;
          this.health -= damage - this.currentDamage;
          this.currentDamage = damage;
        }
      } else {
        this.ouchTime = 10;
        this.currentDamage = damage;
        this.health -= this.currentDamage;
      }

      if(this.health < 0) {
        this.arm.remove();
        this.horse.knight = false;
        // this.horse = false;
        this.dead = true;
      }
    },
    getInertia: function() {
      var angle = Math.abs(this.arm.direction - this.horse.direction)
      var speed = Math.cos(angle) * this.horse.speed;
      return speed / 100;
    },
    getDirection: function() {
      return this.horse.direction;º
    }

  };

  window.entities.Knight = Knight;
})();
