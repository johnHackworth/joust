window.entities = window.entities || {};

(function() {

  var LongSword = function(args) {

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
    this.size = [120, 30];
    this.owner = args.owner;
    this.owner.arm = this;
    this.oncreate();
  };

  LongSword.prototype = _.extend({}, window.entities.Arm.prototype);
  _.extend(LongSword.prototype, {
    cooldown: 30,
    armtype: 'longsword',
    prepareImage: function() {
      var image = app.assets.image('longsword')
      var wrapper = cq(image);//.blend(this.color, "addition", 1.0);
      this.image = wrapper.canvas;
    },
    getSwingSpritePosition: function() {
      if(this.swinging) {
        return 7 - Math.floor(this.swinging/2);
      } else {
        return 0;
      }
    },
    render: function(delta, center) {
      var armPoint = this.owner.getArmPosition();
      var spriteX = this.getSwingSpritePosition();
      if(spriteX === 0) {
        this.size = [5, 5]
      } else if(spriteX === 1) {
        this.size = [-10, 10]
      } else if(spriteX === 2) {
        this.size = [-5, 20]
      } else if(spriteX === 3) {
        this.size = [10, 40]
      } else if(spriteX === 4) {
        this.size = [20, 35]
      } else if(spriteX === 5) {
        this.size = [30, 10]
      } else if(spriteX === 6) {
        this.size = [15, -10]
      }

      var armPoint = this.owner.getArmPosition();
      this.x = armPoint[0];
      this.y = armPoint[1];
      app.layer
        .save()
        .translate(this.x- center[0], this.y- center[1])
        .rotate(this.direction)
        .drawImage(this.image,
          spriteX * 30 * app.zoom,
          0,
          30 * app.zoom,
          90 * app.zoom,
          -12,
          -45,
          30 * app.zoom,
          90 * app.zoom)
        .restore();
    },

    getDamageTo: function(knight) {
      if(!this.swinging) {
        return 0;
      }
      var inertia = this.owner.getInertia();
      var forceModifier = this.owner.strength / 10
      var damage =  Math.floor(3 * forceModifier * (1 + inertia));
      if(damage <= 0) {
        damage = 0;
      }
      return damage;
    },
    isHitting: function(knight) {
        this.getFrontPosition()[0]
        return (Math.abs(this.getFrontPosition()[0] - knight.horse.getSaddlePosition()[0]) < 10) &&
          (Math.abs(this.getFrontPosition()[1] - knight.horse.getSaddlePosition()[1]) < 10);
    },
    getFrontPosition: function() {
      var angle_rad = this.direction; //angle_degrees * Math.PI / 180;
      var cosa = Math.cos(angle_rad);
      var sina = Math.sin(angle_rad);
      return [ this.x + cosa * this.size[0] * app.zoom/2 - sina * this.size[1] * app.zoom/2 ,
               this.y + sina * this.size[0] * app.zoom/2 + cosa * this.size[1] * app.zoom/2];
    },

  });

  window.entities.LongSword = LongSword;
})();
