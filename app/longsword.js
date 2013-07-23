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
    this.size = [50, 30];
    this.owner = args.owner;
    this.owner.arm = this;

    this.oncreate();
  };

  LongSword.prototype = _.extend({}, window.entities.Arm.prototype);
  _.extend(LongSword.prototype, {
    prepareImage: function() {
      var image = app.assets.image('longsword')
      var wrapper = cq(image).resizePixel(1* app.zoom);
      this.image = wrapper.canvas;
    },
    render: function(delta, center) {
      var armPoint = this.owner.getArmPosition();
      this.x = armPoint[0];
      this.y = armPoint[1];
      app.layer
        .save()
        .translate(this.x- center[0], this.y- center[1])
        .rotate(this.direction)
        .drawImage(this.image, -this.image.width / 2, 8)
        .restore();
    },

    getDamageTo: function(knight) {
      var inertia = this.owner.getInertia();
      var forceModifier = this.owner.strength / 10
      var damage =  Math.floor(3 * forceModifier * inertia);
      if(damage <= 0) {
        damage = 0;
      }
      return damage;
    }
  });

  window.entities.LongSword = LongSword;
})();
