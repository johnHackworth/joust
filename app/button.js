window.entities = window.entities || {};

(function() {

  var Button = function(args) {
    _.extend(this, {
      text: "" || args.text, // this is all upsidedown! fix!
      x: 0 || args.x,
      y: 0 || args.y,
      textSize: 40 || args.textSize,
      width: 100 || args.width,
      height: 50 || args.height,
      color: '#000000' || args.color,
      renderLevel: args.renderLevel || 0,
      zoomable: args.zoomable
    }, args);
    this.clicked = args.clicked;
  }

  Button.prototype = new window.engine.ClickableEntity();
  Button.prototype.render = function(delta, center) {
    var color = '#AA0000';
    if(this.mouseOver) {
      color ='#FFAA00'
    }
    var adjusmentX = 1;
    var adjusmentY = 1;
    var adjusmentText = 1;
    if(this.zoomable) {
      adjusmentX =  1/ app.game.currentZoom;
      adjusmentY =  1/ app.game.currentZoom;
      adjusmentText = 1/ app.game.currentZoom;
    }
    app.layer
      .save()
      .fillStyle(color)
      .scale(adjusmentX, adjusmentY)
      .font(' '+(this.textSize) +'px arial')
      .wrappedText(this.text,
        this.x,
        this.y  + this.textSize,
        this.width)
      .restore();
      // .save()
      // .fillStyle(this.color)
      //   .font('arial 24px normal')
      //   .wrappedText(this.text, this.x, this.y, this.width)
      //   .restore();
  }

  window.entities.Button = Button;
})()
