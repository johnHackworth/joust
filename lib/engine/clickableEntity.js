window.clickableEntity = window.clickableEntity || {};

(function() {
  var ClickableEntity = function(loader) {
    this.initialize();
  };

  ClickableEntity.prototype = {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    initialize: function() {},
    isInside: function(point) {
      if(
        this.x + this.width >= point[0] &&
        this.x <= point[0] &&
        this.y + this.height >= point[1] &&
        this.y <= point[1]
      ) {
        return true;
      }
      return false;
    },
    click: function(point) {
      if(this.isInside(point)) {
        this.clicked(point);
      }
    },
    clicked: function(point) {

    }

  }

  window.engine.ClickableEntity = ClickableEntity;
})()
