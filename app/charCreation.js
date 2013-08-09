$(document).ready(function() {
  app.charCreation = new window.engine.Scene({
    step: 0,
    onenter: function() {
      this.prepareImage();
    },
    oncreate: function() {
      var self = this;
      this.entities = new window.entities.GameObjects(this);

      var playButton = new window.entities.Button({
        x: 375,
        y: 300,
        width: 250,
        height: 50,
        text: "Play",
        color: '#FFFFFF',
        clicked: function() {
          self.next();
        }
      })
      this.entities.push(playButton)
    },
    prepareImage: function() {
      var image = app.assets.image('intro')
      var wrapper = cq(image).resize(1 * app.zoom);
      this.image = wrapper.canvas;
    },
    onstep: function(delta) {
      this.step++;
      // this.entities.call("step", delta, this.center);
    },
    onrender: function(delta) {
      app.layer
        .save()
        .drawImage(this.image, 0,0)
      this.drawButtonsBackground();
      for(var i=0, l = this.entities.length; i < l; i++) {
        this.entities[i].render(delta)
      }
    },
    onmousemove: function(x, y) {
      for(var i=0, l = this.entities.length; i < l; i++) {
        if(this.entities[i].isInside &&
          this.entities[i].isInside([x,y])
        ) {
          this.entities[i].mouseOver = true;
        } else {
          this.entities[i].mouseOver = false;
        }
      }
    },
    drawButtonsBackground: function() {
      app.layer.beginPath();
      app.layer.rect(310, 300, 200, 100);
      app.layer.fillStyle('rgba(222,222,222,0.8)');
      app.layer.fill();
    },
    ontouchmove: function(x, y) {
    },
    onclick: function(x,y) {
      // this.click([x,y]);
      this.entities.click([x,y])
    },
    onkeydown: function(key) {
    }
  });
})
