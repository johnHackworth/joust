window.entities = window.entities || {};

(function() {

  var Arm = function(args) {

    _.extend(this, {

      /* direction the ant is facing (in radians) */
      direction: 0,
      intendedDirection: 0,
      turning: 0.04,
      x: 0,
      y: 0,
      player: false,
      color: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
    }, args);
    this.size = [70, 18];
    this.owner = args.owner;
    this.owner.arm = this;

    this.oncreate();
  };

  Arm.prototype = {
    type: 'arm',
    image: 'arm',
    blockType: 2,
    renderLevel: 3,
    oncreate: function() {
      this.prepareImage();
    },
    prepareImage: function() {
      var image = app.assets.image('arm')
      var wrapper = cq(image).blend(this.color, "addition", 1.0).resizePixel(1* app.zoom);
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
      this.turn();
    },

    turn: function() {
      this.direction = this.intendedDirection;
      this.maxTurn();


      if(this.direction < 0) {
        this.direction = 2 * Math.PI + this.direction;
      }
      if(this.direction > 2 * Math.PI) {
        this.direction = this.direction % (2 * Math.PI);
      }

    },

    maxTurn: function() {
      var angArm = this.direction;
      var angKnight = this.owner.direction;
      var changed = false;
      if(
        (angArm - angKnight > 0) &&
        (angArm - angKnight > this.MAX_TURN)
      ) {
        changed = true;
        this.direction = angKnight + this.MAX_TURN;
      } else if(
        (angKnight - angArm > 0) &&
        (angKnight - angArm > this.MAX_TURN)
      ) {
        changed = true;
        this.direction = angKnight - this.MAX_TURN;
      }
    },

    render: function(delta, center) {
      var armPoint = this.owner.getArmPosition();
      this.x = armPoint[0];
      this.y = armPoint[1];
      app.layer
        .fillStyle(this.color)
        .save()
        .translate(this.x- center[0], this.y- center[1])
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

    getPosition: function() {
      return [this.x, this.y];
    },

    isNear: function() {
      return false;
    },

    isFront: function() {
      return false;
    },

    getFrontPosition: function() {
      var angle_rad = this.direction; //angle_degrees * Math.PI / 180;
      var cosa = Math.cos(angle_rad);
      var sina = Math.sin(angle_rad);
      return [ this.x + cosa * this.size[0] * app.zoom/2 - sina * this.size[1] * app.zoom/2 ,
               this.y + sina * this.size[0] * app.zoom/2 + cosa * this.size[1] * app.zoom/2];
    },

    getDamageTo: function(knight) {
      var clashAngle = Math.abs(this.owner.getDirection() - knight.getDirection());
      var inertia = this.owner.getInertia();
      var forceModifier = this.owner.strength / 10
      var damage =  Math.floor(15 * forceModifier * inertia * -1 * Math.cos(clashAngle));
      if(damage <= 0) {
        damage = 0;
      }
      return damage;
    }


  };

  window.entities.Arm = Arm;
})();
