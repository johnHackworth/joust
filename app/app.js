var app = new window.engine.Application({

  /* get width and height of a window */
  width: 2000,
  height: 900,
  canvasWidth: 800,
  canvasHeight: 600,

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
    this.assets.addImage("horses.png");
    this.assets.addImage("knight.png");
    this.assets.addImage("arm.png");
    this.assets.addImage("grass.jpg");
    this.assets.addImage("ouch.png");
    this.assets.addImage("shields.png");
    this.assets.addImage("mark.png");
  },

  /* and when the assets are loaded select the game screen */
  onready: function() {
    var self = this;
    document.getElementById('fightButton').addEventListener('click', function(ev) {
      var playerName = document.getElementById('name').value;
      self.game.setHeroName(playerName);
      document.getElementById('presentation').setAttribute('class','hidden');
      self.game.knightsData = self.knightsData;
      self.selectScene(self.game);
    })
    // this.selectScene(this.game);
  }

});
