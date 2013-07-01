var app = new window.engine.Application({

  /* get width and height of a window */
  width: window.innerWidth,
  height: window.innerHeight,

  /* for now we don't do anything on creation */
  oncreate: function() {
    this.loader.foo(2500);
    this.assets.addImage("horsie1.png");
    this.assets.addImage("horsie2.png");
    this.assets.addImage("horsie3.png");
    this.assets.addImage("horsie4.png");
    this.assets.addImage("knight.png");
    this.assets.addImage("arm.png");
    this.assets.addImage("grass.jpg");
    this.assets.addImage("ouch.png");
  },

  /* and when the assets are loaded select the game screen */
  onready: function() {
    this.selectScene(this.game);
  }

});
