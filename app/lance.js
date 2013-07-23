window.entities = window.entities || {};

(function() {

  var Lance = function(args) {

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

  Lance.prototype = _.extend({}, window.entities.Arm.prototype);
  _.extend(Lance.prototype, {
  });

  window.entities.Lance = Lance;
})();
