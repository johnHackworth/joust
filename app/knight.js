window.entities = window.entities || {};

(function() {

  var Knight = function(args) {
    this.horse = args.horse;
    this.horse.knightRide(this);
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
      hability: args.hability || 5,
      knightType: args.knightType || Math.floor(Math.random() * 2)
    }, args);
    if(this.color1) {
      this.color = this.color1;
    }

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
    _MOD_IMAGE: 0.85,
    blockType: 3,
    renderLevel: 4,
    oncreate: function() {
      this.texts = [];
      this.stepNumber = 0;
      this.prepareImage();
    },
    prepareImage: function() {
      var image = app.assets.image("knight")
      var wrapper = cq(image).blend(this.color, "softLight", 1.0);
      this.image = wrapper.canvas;
      var wrapperSmall = cq(image).resize(1 * app.zoom * 0.8);
      this.imageSmall = wrapperSmall.canvas;
      this.imageNormal = wrapper.canvas;

      var imageOuch = app.assets.image("ouch")
      var wrapperOuch = cq(imageOuch).resizePixel(2 * app.zoom);
      this.imageOuch = wrapperOuch.canvas;
      var wrapperOuchSmall = cq(imageOuch).resize(1 * app.zoom * 0.8);
      this.imageOuchSmall = wrapperOuchSmall.canvas;
      this.imageOuchNormal = wrapperOuch.canvas;

      var markerImage = app.assets.image('mark');
      var wrapperMark = cq(markerImage).blend(this.color, "addition", 1.0).resizePixel(1 * app.zoom);
      this.markImage = wrapperMark.canvas;
      var wrapperMarkerSmall = cq(markerImage).resize(1 * app.zoom * 0.8);
      this.imageMarkerSmall = wrapperMarkerSmall.canvas;
      this.imageMarkerNormal = wrapperMark.canvas;

      var sparksImage = app.assets.image("sparks")
      var wrapperSparks = cq(sparksImage).resize(1 * app.zoom);
      this.sparksImage = wrapperSparks.canvas;

      this.imageSize = 'normal';
    },
    changeImageSize: function() {
      if(this.imageSize === 'normal') {
        this.image = this.imageSmall;
        this.markImage = this.imageMarkerSmall;
        this.imageOuch = this.imageOuchSmall;
        this.imageSize = 'small'
      } else {
        this.image = this.imageNormal;
        this.markImage = this.imageMarkerNormal;
        this.imageOuch = this.imageOuchNormal;
        this.imageSize = 'normal'
      }
    },

    step: function(delta) {
      this.stepNumber++;
      if(this.ouchTime) {
        this.ouchTime--;
      }
      if(this.lastSpurred) {
        this.lastSpurred--;
      }
      if(this.dead) {
        return;
      }
      /* decrease brain cooldown  */
      this.brainDelta -= delta;


      if (this.brainDelta < 0) {

        /* take some random direction (in radians) */
        if(!this.player) {
          this.intendedDirection = Math.random() * Math.PI * 2;
          this.intendedDirection = Math.round(this.intendedDirection * 100) / 100;
        }

        /* delay next ai invocation */
        this.brainDelta = Math.random() * 1500;
      }

      if(!this.player) {
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
            this.specialAction();
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
      }
      if(this.horse) {
        this.horse.intendedDirection = this.intendedDirection;
        if(!this.player &&
          this.horse.speed < this.horse.cruisingSpeed &&
          10 * Math.random() > (12 - this.horsemanship)
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
      var type = this.knightType || 0;
      var orientation = 0;
      if(this.direction > 0 && this.direction <=  Math.PI) {
        orientation = 1;
      }
      var round = 1;
      if(this.stepNumber % 5 === 0) {
        this.currentPosition = Math.floor(Math.random() * 3);
      }
      if(this.dead) {
        this.currentPosition = 3;
      }
      this.drawTexts(center)

      if(this.ouchTime || this.dead) {
        this.drawOuch(center);
      }
      // if(this.player) {
      //   console.log(orientation * 21 *  app.zoom * this._MOD_IMAGE);
      // }
      var xPos =
          (((2*type) + orientation) * 21) *  app.zoom * this._MOD_IMAGE;
      app.layer
        .fillStyle(this.color)
        .save()
        .translate(this.x - center[0], this.y - center[1])
        .rotate(this.direction)
        // .scale(2,2)
        .drawImage(
          this.image,
          xPos,
          30* app.zoom  * this.currentPosition * this._MOD_IMAGE,
          21* app.zoom * this._MOD_IMAGE,
          30* app.zoom * this._MOD_IMAGE,
          - 21* app.zoom / 2 * this._MOD_IMAGE,
          - 30* app.zoom / 2 * this._MOD_IMAGE,
          21* app.zoom * this._MOD_IMAGE,
          30* app.zoom * this._MOD_IMAGE
        )
      app.layer
        .restore();

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
    testOuch: function() {
      this.ouchTime = 20;
      this.ouchDirection = 0;
      this.currentDamage = 1;
    },
    drawOuch: function(center) {
      if(!this.dead) {
        app.layer
          .fillStyle('#AA0000')
          .font('arial 24px #000000')
          .wrappedText("" + this.currentDamage,
            this.x - center[0] - 3,
            this.y - center[1] - 10,
            20)
      }
      if(this.dead) {
        this.deathlyDamage(center);
      } else if(this.currentDamage > 0 && this.currentDamage <= 6) {
        this.smallDamage(center);
      } else if(this.currentDamage > 0 && this.currentDamage <= 12) {
        this.bigDamage(center);
      } else if(this.currentDamage > 0) {
        this.deathlyDamage(center);
      }
    },
    bigDamage: function(center) {
      var x = this.x - center[0] + Math.cos(this.ouchDirection) * 5 * (20 - this.ouchTime);
      var y = this.y - center[1] + Math.sin(this.ouchDirection) * 5 * (20 - this.ouchTime);

      var phase = Math.floor((20 - this.ouchTime) / 4)
      app.layer
        .drawImage(
          this.sparksImage,
          55 * app.zoom * phase,
          0 * app.zoom,
          55* app.zoom,
          45* app.zoom,
          x,
          y,
          55* app.zoom,
          45* app.zoom)
    },
    smallDamage: function(center) {
      var x = this.x - center[0] + Math.cos(this.ouchDirection) * 1 * (20 - this.ouchTime);
      var y = this.y - center[1] + Math.sin(this.ouchDirection) * 1 * (20 - this.ouchTime);

      var phase = Math.floor((20 - this.ouchTime) / 4)
      app.layer
        .drawImage(
          this.sparksImage,
          30 * app.zoom * phase,
          45 * app.zoom,
          30 * app.zoom,
          30* app.zoom,
          x,
          y,
          30 * app.zoom,
          30 * app.zoom)
    },
    deathlyDamage: function(center) {
      var x = this.x - center[0] + Math.cos(this.ouchDirection) * 1 * (20 - this.ouchTime);
      var y = this.y - center[1] + Math.sin(this.ouchDirection) * 1 * (20 - this.ouchTime);

      var phase = this.bloodStain || Math.floor((20 - this.ouchTime) / 4)
      if(!this.ouchTime && this.dead && !this.bloodStain) {
        this.bloodStain = Math.floor(Math.random() * 6);
      }
      app.layer
        .drawImage(
          this.sparksImage,
          55 * app.zoom * phase,
          75 * app.zoom,
          55 * app.zoom,
          45* app.zoom,
          x,
          y,
          55 * app.zoom,
          45 * app.zoom)
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
      var posX = center[0] > this.x? 10 : (app.canvasWidth - 10) * 1 / app.game.currentZoom;
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
        // this.spurHorse();
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
      if(amount) {
        this.honor += amount;
        this.adText('+honor!', 10, 100, '255,225,105')
      }
    },
    adFame: function(amount) {
      if(amount) {
        this.fame += amount;
        app.game.hero.adText('+fame!', 10, 100, '255,105,155');
      }
    },
    hitBy: function(arm) {
      var damage = arm.getDamageTo(this);
      if(this.ouchTime > 0) {
        if(this.currentDamage < damage) {
          this.ouchTime = 20;
          this.ouchDirection = arm.direction;
          this.health -= damage - this.currentDamage;
          this.currentDamage = damage;
          arm.owner.adHonor(damage);
        }
      } else {
        if(this.health === this.maxHealth) {
          arm.owner.adHonor(5);
        }
        this.ouchTime = 10;
        this.ouchDirection = arm.direction;
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
        // if(arm.owner.player) {
          this.announceDeath(this, arm.owner);
        // }
      }
    },
    announceDeath: function() {

    },
    die: function() {
      if(this.dead) return;
      this.speed = 20;
      this.dead = true;
      setTimeout((function() { this.renderLevel = 1}).bind(this), 1000);
      this.onDeath(this);
      this.direction = (Math.random() * 2 * Math.PI)
      this.deathDamageTime = 20
    },
    onDeath: function() {

    },
    getInertia: function() {
      var angle = Math.abs(this.arm.direction - this.horse.direction)
      var speed = Math.cos(angle) * this.horse.speed;
      return speed / 100;
    },
    getDirection: function() {
      return this.horse.direction;
    },
    drawTexts: function(center) {
      var newTexts = [];
      for(var i = 0, l = this.texts.length; i < l; i++) {
        this.texts[i].time--;
        app.layer
          .save()
        var alpha = 1;
        var yPos = this.y  - center[1] - 12 * (i+1) * 1 / app.game.currentZoom;
        if(this.texts[i].time < 100) {
          alpha = this.texts[i].time / 100
          yPos = yPos -  (100 - this.texts[i].time)
        }

        // app.layer
        //   .font(' '+this.texts[i].size *1/app.game.currentZoom+'px MS UI Gothic')
        //   .gradientText(this.texts[i].text,
        //     this.x  - center[0] - 40 * 1 / app.game.currentZoom,
        //     yPos,
        //     100,
        //     [
        //       0.05, "#FFFFCC",
        //       0.50, "#FF9900",
        //       0.85, "#AAAA33"
        //     ]
        //     )

        app.layer
          .strokeStyle = "rgba(30,30,30,"+alpha+")";
        app.layer
          .lineWidth = 8;
        app.layer
          .fillStyle("rgba("+this.texts[i].color+","+alpha+")")
          .font(' '+this.texts[i].size *1/app.game.currentZoom+'px MS UI Gothic')

        app.layer
          .fillText(this.texts[i].text,
            this.x  - center[0] - 40 * 1 / app.game.currentZoom,
            yPos)
          // .strokeText(this.texts[i].text, this.x  - center[0] - 40 * 1 / app.game.currentZoom,
          // yPos)
          .restore()

        if(this.texts[i].time > 0) {
          newTexts.push(this.texts[i]);
        }
      }
      this.texts = newTexts;
    },
    adText: function(text, size, time, color) {
      color = color || "255,255,255";
      time = time || 100;
      var existing = false;
      for(var i = 0, l = this.texts.length; i < l; i++) {
        if(this.texts[i].text ===  text) {
          existing = true;
        }
      }
      if(!existing) {
        this.texts.push({
          text: text,
          size: size,
          time: time,
          color: color
        })
      }
    },
    specialAction: function() {
      if(this.arm.armtype === 'lance') {
        this.spurHorse();
      } else if(this.arm.armtype = 'longsword') {
        if(this.horse.awareness < 5) {
          this.spurHorse();
        }
        this.arm.swing();
      }
    }

  };

  window.entities.Knight = Knight;
})();
