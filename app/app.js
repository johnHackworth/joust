var app = new window.engine.Application({

  /* get width and height of a window */
  width: 2000,
  height: 900,
  canvasWidth: 800,
  canvasHeight: 600,
  zoom: 1,

  /* for now we don't do anything on creation */
  oncreate: function() {
    var self = this;
    $.ajax({
      url: './assets/data/knights.json',
      dataType: "JSON",
      success: function(res) {
        self.knightsData = res;
      }
    })
    this.loader.foo(2500);
    this.assets.addImage("horses2.png");
    this.assets.addImage("knight.png");
    this.assets.addImage("arm.png");
    this.assets.addImage("longsword.png");
    this.assets.addImage("grass.jpg");
    this.assets.addImage("ouch.png");
    this.assets.addImage("shields.png");
    this.assets.addImage("mark.png");
    this.assets.addImage("sparks.png");
    this.assets.addImage("intro.jpg");
    this.assets.addImage("star.png");
    this.assets.addImage("halfstar.png");
  },

  /* and when the assets are loaded select the game screen */
  onready: function() {
    var self = this;
    this.selectScene(self.presentation)
    self.game.setHeroName('knight');
    self.game.knightsData = self.knightsData;
    self.charCreation.knightsData = self.knightsData;
    this.presentation.next = function() {
      self.layer.clear();
      self.selectScene(self.game);
    }
    this.presentation.char = function() {
      self.layer.clear();
      self.selectScene(self.charCreation);
    }
    this.game.next = function() {
      self.selectScene(self.presentation);
      self.initializeLayer(self);
    }
    this.charCreation.next = function() {
      self.selectScene(self.presentation);
      self.initializeLayer(self);
    }
  },
  smallZoom: function() {
    // this.zoom = 0.8;
    this.layer.scale(0.75, 0.8);
  }

});
