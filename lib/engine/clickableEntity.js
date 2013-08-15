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
    events: {},
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
    on: function(eventName, handler) {
      if(!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(handler);
      return this.events[eventName].length - 1;
    },
    off: function(eventName, pos) {
      if(pos) {
        this.events[eventName][pos] = null;
      } else {
        this.events[eventName] = [];
      }
    },
    trigger: function(eventName, data) {
      for(var i = this.events[eventName].length - 1; i >= 0; i--) {
        if(this.events[eventName][i] && typeof this.events[eventName][i] === 'function') {
          this.events[eventName][i](data);
        }
      }
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
