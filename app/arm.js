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
    this.size = [30, 5];
    this.owner = args.owner;
    this.owner.arm = this;

    this.oncreate();
  };

  Arm.prototype = {
    type: 'arm',
    image: 'arm',
    blockType: 2,
    oncreate: function() {

      var image = app.assets.image('arm')
      var wrapper = cq(image).blend(this.color, "addition", 1.0).resizePixel(2);
      this.image = wrapper.canvas;
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

    render: function(delta) {
      var armPoint = this.owner.getArmPosition();
      this.x = armPoint[0];
      this.y = armPoint[1];
      app.layer
        .fillStyle(this.color)
        .save()
        .translate(this.x, this.y)
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
      return [ this.x + cosa * this.size[0] - sina * this.size[1] ,
               this.y + sina * this.size[0] + cosa * this.size[1]];
    },

    getDamageTo: function(knight) {
      var clashAngle = Math.abs(this.owner.getDirection() - knight.getDirection());
      var inertia = this.owner.getInertia();
      var damage =  Math.floor(10 * inertia * -1 * Math.cos(clashAngle));
      if(damage <= 0) {
        damage = 0;
      }
      return damage;
    }


  };

  window.entities.Arm = Arm;
})();
