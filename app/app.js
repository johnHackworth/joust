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
    this.goToPresentation();
    self.game.setHeroName('knight');
    self.game.knightsData = self.knightsData;
    self.charCreation.knightsData = self.knightsData;
    self.presentation.next = self.goToGame.bind(self);
    self.presentation.char = self.goToCharCreation.bind(self);
    self.game.next = self.goToPresentation.bind(self);
    self.charCreation.next = self.goToPresentation.bind(self);
  },
  smallZoom: function() {
    // this.zoom = 0.8;
    this.layer.scale(0.75, 0.8);
  },
  playMusic: function() {
    var currentFile = "./assets/sounds/MedievalC64.mp3";
    if(!this.song) {
      this.song = new Audio(currentFile);
      this.song.volume = 0.3;
    }
    this.song.play();
  },
  stopMusic: function() {
    if(this.song) {
      this.song.pause();
    }
  },
  goToCharCreation: function() {
    this.layer.clear();
    this.selectScene(this.charCreation);
    this.stopMusic();
    this.playMusic();
  },
  goToPresentation: function() {
    this.selectScene(this.presentation);
    this.initializeLayer(this);
    this.stopMusic();
    this.playMusic();
  },
  goToGame: function() {
    this.selectScene(this.game);
    this.initializeLayer(this);
    this.stopMusic();
  }
});
