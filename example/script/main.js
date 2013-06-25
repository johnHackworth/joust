var app = new ENGINE.Application({

  width: window.innerWidth,
  height: window.innerHeight,

  oncreate: function() {      
    
    this.assets.addImage("hero.png");
    this.assets.addImage("bullets.png");
  },

  onready: function() {

    this.selectScene(this.game);
  }

});
