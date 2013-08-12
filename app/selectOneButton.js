window.entities = window.entities || {};

(function() {
  /* options format:
    {
      name: "img name",
      img: "img object"
    }
  */
  var Selector = function(args) {
    _.extend(this, {
      x:  args.x || 0,
      y: args.y || 0,
      options: args.options || [],
      selected: args.selected || null,
      margin: args.margin || 5,
      zoom: args.zoom || 1
    }, args);
    for(var i = 0, l = this.options.length; i < l; i++) {
      if(this.options[i].name) {
        var image = app.assets.image(this.options[i].name)
        var wrapper = cq(image).resize(1 * app.zoom);
        this.options[i].img = wrapper.canvas;
      }
    }

    this.clicked = args.clicked;
  }

  Selector.prototype = new window.engine.ClickableEntity();
  Selector.prototype.render = function(delta, center) {
    var xPos = this.x;
    for(var i = 0, l = this.options.length; i < l; i++) {
      app.layer
        .save()
        // .scale(this.zoom, this.zoom)
        .drawImage(this.options[i].img, xPos, this.y)
        .restore();
      xPos += this.options[i].img.width + this.margin
    }
  }

  window.entities.Selector = Selector;
})()
