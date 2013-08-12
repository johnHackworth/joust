$(document).ready(function() {
  app.charCreation = new window.engine.Scene({
    step: 0,
    onenter: function() {
      var self = this;
      this.prepareImage();
      // if(!this.nameInput) {
      this.nameInput = new CanvasInput({
        canvas: document.getElementsByTagName('canvas')[0],
        fontSize: 18,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 150,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 3,
        boxShadow: '1px 1px 0px #fff',
        innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
        placeHolder: 'Enter message here...',
        x: 150,
        y: 20,
        value: this.knightsData.name,
        onkeyup: function() {
          self.knightsData.name = self.nameInput.value();
        }
      });
      this.entities.push(this.nameInput);
      this.loadShields();
      this.shieldSelector = new window.entities.Selector({
        x: 20,
        y: 100,
        options: this.shields
      })
      this.entities.push(this.shieldSelector);
      // }
    },
    oncreate: function() {
      var self = this;
      this.knightName = '';

      this.entities = new window.entities.GameObjects(this);
      var backButton = new window.entities.Button({
        x: 305,
        y: 300,
        width: 250,
        height: 50,

        textSize: 30,
        text: "Back to menu",
        color: '#FFFFFF',
        clicked: function() {
          self.next();
        }
      })
      this.entities.push(backButton)
    },
    loadShields: function() {
      this.spriteShields = app.assets.image("shields");
      this.shields = [];
      for(var i = 0; i < 4; i++) {

        this.shields.push({
          img: cq(this.spriteShields).crop(
            0,
            20 * i,
            20,
            20
            )
          .resizePixel(2)
          .canvas
          }
        )
      }

    },
    onselect: function() {
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
      // app.layer
      //   .save()
      //   .drawImage(this.image, 0,0)
        app.layer
          .save()
          .fillStyle('#333333')
          .font('normal 20px arial')
          .fillText('Player name', 25,40)
        .restore();
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
      app.layer.rect(290, 300, 250, 100);
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
