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
      color: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6),
      honor: args.honor || 0,
      fame: args.honor || 0,
      strength:  args.strength || 5,
      horsemanship: args.horsemanship || 5,
      hability: args.hability || 5
    }, args);
    this.lastFollowingDistance = 1000;
    this.turning = 1 * this.horsemanship / 10;
    this.health = 5 + this.strength;
    this.shieldType = args.shield || 1;
    this.name = args.name || this._DEFAULT_NAME;
    this.size = [5, 5];
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
    renderLevel: 4,
    oncreate: function() {

      this.stepNumber = 0;
      this.prepareImage();
    },
    prepareImage: function() {
      var image = app.assets.image("knight")
      var wrapper = cq(image).blend(this.color, "addition", 1.0).resizePixel(0.8 * app.zoom);
      this.image = wrapper.canvas;
      var imageOuch = app.assets.image("ouch")
      var wrapperOuch = cq(imageOuch).resizePixel(2 * app.zoom);
      this.imageOuch = wrapperOuch.canvas;
      var markerImage = app.assets.image('mark');
      var wrapperMark = cq(markerImage).blend(this.color, "addition", 1.0).resizePixel(1 * app.zoom);
      this.markImage = wrapperMark.canvas;
    },

    step: function(delta) {
      this.stepNumber++;
      if(this.lastSpurred) {
        this.lastSpurred--;
      }
      if(this.dead) {
        return;
      }
      /* decrease brain cooldown  */
      this.brainDelta -= delta;
      if(this.ouchTime) {
        this.ouchTime--;
      }

      if (this.brainDelta < 0) {

        /* take some random direction (in radians) */
        if(!this.player) {
          this.intendedDirection = Math.random() * Math.PI * 2;
          this.intendedDirection = Math.round(this.intendedDirection * 100) / 100;
        }

        /* delay next ai invocation */
        this.brainDelta = Math.random() * 1500;
      }

      if(this.following && this.followingRounds) {
        var lastFollowingDistance = this.followingDistance;
        this.followingDistance = this.getDistanceTo(this.following);
        if(this.followingDistance - lastFollowingDistance <= -1) {
          this.stopFollowing();
        }
      }
      if(this.following && this.followingRounds) {
        if(this.isFront([this.following.x, this.following.y])) {
          this.intendedDirection = this.getCollisionCourse(this.following);
          this.spurHorse();
          if(this.name === 'Jon Umber') console.log('Umber following '+this.following.name + ' at ' + this.getDistanceTo(this.following));
        } else { // our target is escaping
          if(Math.random() > 0.80) {
            // let him go
            if(this.name === 'Jon Umber') console.log('Umber let go '+this.following.name);
            this.stopFollowing();
          } else {
            // he won't go very far!!!
            this.intendedDirection = this.getCollisionCourse(this.following);
            if(this.name === 'Jon Umber') console.log('Umber INSISTS '+this.following.name);
          }

        }
      }

      if(this.horse) {
        this.horse.intendedDirection = this.intendedDirection;
        if(this.horse.speed < this.horse.cruisingSpeed &&
          Math.random() > 0.10
        ) {
          this.spurHorse();
        }
      }
      if(this.arm) {
        this.arm.intendedDirection = this.direction;
      }

      this.turn();

      if(!this.dead && this.horse && this.horse.getSaddlePosition) {
        var saddlePoint = this.horse.getSaddlePosition();
        this.x = saddlePoint[0];
        this.y = saddlePoint[1];
      } else {
        if(this.stepNumber % 30 === 0) {
          this.x = this.x + Math.cos(this.direction) * this.speed * delta / 1000;
          this.y = this.y + Math.sin(this.direction) * this.speed * delta / 1000;
        }
      }

    },

    stopFollowing: function() {
      this.following = undefined;
      this.followingRounds = 0;
      this.lastFollowingDistance = 1000;
    },

    getCollisionCourse: function(other) {
      if(this.getDistanceTo(other) < (2 * this.arm.size[0] * app.zoom)) {
        return angle = this.getDirectionTo(other.x, other.y);
      } else {
        var angle = this.getDirectionTo(other.x, other.y);
        var otherDirection = other.direction;
        return (angle + otherDirection) / 2;
      }
    },
    getDistanceTo: function(other) {
      var dX = Math.abs(this.x - other.x);
      var dY = Math.abs(this.y - other.y);
      return Math.sqrt(dX*dX + dY*dY);
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
        angHorse - angRider > Math.PI
      ) {
        if(2*Math.PI + angRider - angHorse > this.MAX_TURN) {
          this.direction = (this.MAX_TURN + angHorse) % (2*Math.PI );
        }
      } else if(
        angRider - angHorse > Math.PI
      ){
        if(2*Math.PI + angHorse - angRider > this.MAX_TURN) {
          this.direction = (angHorse - this.MAX_TURN) % (2*Math.PI );
        }
      } else {
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
      }


    },

    render: function(delta, center) {
      var round = 1;
      if(this.stepNumber % 5 === 0) {
        this.currentPosition = Math.floor(Math.random() * 3);
      }
      if(this.dead) {
        this.currentPosition = 3;
      }

      app.layer
        .fillStyle(this.color)
        .save()
        .translate(this.x - center[0], this.y - center[1])
        .rotate(this.direction)
        .drawImage(
          this.image,
          0* app.zoom,
          23* app.zoom  * this.currentPosition,
          15* app.zoom,
          21* app.zoom,
          -15* app.zoom / 2,
          -21* app.zoom / 2,
          15* app.zoom,
          21* app.zoom)
      if(this.ouchTime && !this.dead) {
        app.layer
          .drawImage(
            this.imageOuch,
            -this.imageOuch.width / 4,
            -this.imageOuch.height / 4
          );
      }
      app.layer
        .restore();

      if(this.ouchTime && !this.dead) {
        app.layer
          .fillStyle('#AA0000')
          .font('arial 24px #000000')
          .wrappedText("" + this.currentDamage,
            this.x - center[0] - 3,
            this.y - center[1] - 10,
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
          this.x - center[0] - 15,
          this.y - center[1] - 20,
          30 * xEnergy,
          5);
        app.layer.moveTo(this.x - center[0]- 15, this.y- center[1] - 20);
        app.layer.lineTo(this.x - center[0]- 15 + 30 * xEnergy, this.y- center[1] - 20);
        app.layer.lineTo(this.x - center[0]- 15 + 30 * xEnergy, this.y- center[1] - 16);
        app.layer.lineTo(this.x - center[0]- 15, this.y- center[1] - 16);
        app.layer.lineTo(this.x - center[0]- 15, this.y- center[1] - 20);
        app.layer.stroke();
        app.layer
          .restore();
      }
      if(this.outOfCanvas(center) && !this.dead) {
        this.drawMark(center)
      }
    },

    outOfCanvas: function(center) {
      var outY = false;
      var outX = false;
      if(
        this.x < (center[0] ) ||
        this.x > (center[0] + app.canvasWidth)
      ) {
        outX = true;
      }
      if(
        this.y < (center[1]) ||
        this.y > (center[1] + app.canvasHeight)
      ) {
        outY = true;
      }
      return outX || outY;
    },
    drawMark: function(center) {
      var posX = center[0] > this.x? 10 : app.canvasWidth - 10;
      var posY = this.y- center[1];
      if(posY > app.canvasHeight - 10) {
        posY = app.canvasHeight - 10;
      }
      if(posY < 5) {
        posY = 5;
      }
      app.layer
        .save()
        .translate(posX , posY)
        .rotate(this.direction)
        .drawImage(this.markImage, -this.markImage.width / 2, -this.markImage.height / 2)
        .restore();
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
      var angle = this.getDirectionTo(point[0], point[1])
      return Math.abs(angle - this.direction) < (Math.PI / 4)
    },
    getDirectionTo: function(point0, point1) {
      return utils.atanxy(point0 - this.x, point1 - this.y);
    },

    isNear: function(point) {
      if(Math.abs(point[0] - this.x) <= 100 * this.size[0] * app.zoom) {
        if(Math.abs(point[1] - this.y) <= 100 * this.size[0] * app.zoom) {
          return true;
        }
      }
      return false;
    },

    getPosition: function() {
      return [this.x, this.y];
    },

    notifyFront: function(other) {
      if(!this.player && Math.random() < 0.05 &&
        !this.followingRounds &&
        !this.following &&
        this.getDistanceTo(other) < 500
      ) {
        console.log('locked');
        this.following = other;
        this.followingRounds = 100;
        var angle = this.getDirectionTo(other.x, other.y);
        this.arm.intendedDirection = angle;
        this.spurHorse();
      }

    },

    notifyNear: function(otherHorse) {
      this.speed = Math.floor(this.speed / 3);
    },

    spurHorse: function() {
      if(!this.lastSpurred) {
        this.lastSpurred = 30;
        this.horse.spur();
      }
    },
    adHonor: function(amount) {
      this.honor += amount;
    },
    adFame: function(amount) {
      this.fame += amount;
    },

    hitBy: function(arm) {
      var damage = arm.getDamageTo(this);
      if(this.ouchTime > 0) {
        if(this.currentDamage < damage) {

          this.ouchTime = 10;
          this.health -= damage - this.currentDamage;
          this.currentDamage = damage;
          arm.owner.adHonor(damage);

        }
      } else {
        if(this.health === this.maxHealth) {
          arm.owner.adHonor(5);
        }
        this.ouchTime = 10;
        this.currentDamage = damage;
        if(damage > this.maxHealth) {
          arm.owner.adHonor(10);
          arm.owner.adFame(20);
        }
        this.health -= this.currentDamage;
      }
      if(arm.owner.name === 'Jon Umber') console.log('Umber hits '+this.name + ' with ' + damage);
      if(this.health <= 0) {
        arm.owner.adFame(10);
        this.adFame(-5);
        this.arm.remove();
        this.horse.knight = false;
        // this.horse = false;
        this.die();
        if(arm.owner.player) {
          this.announceDeath(this, arm.owner);
        }
      }
    },
    announceDeath: function() {

    },
    die: function() {
      this.speed = 20;
      this.dead = true;
      setTimeout((function() { this.renderLevel = 1}).bind(this), 1000);
      this.onDeath(this);
      this.direction = (Math.random() * 2 * Math.PI)
    },
    onDeath: function() {

    },
    getInertia: function() {
      var angle = Math.abs(this.arm.direction - this.horse.direction)
      var speed = Math.cos(angle) * this.horse.speed;
      return this.strength * speed / 1000;
    },
    getDirection: function() {
      return this.horse.direction;
    }

  };

  window.entities.Knight = Knight;
})();
