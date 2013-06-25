var app = new window.engine.Application({

  /* get width and height of a window */
  width: window.innerWidth,
  height: window.innerHeight,

  /* for now we don't do anything on creation */
  oncreate: function() {
    this.loader.foo(500);
    this.assets.addImage("horsie.png");
    this.assets.addImage("knight.png");
  },

  /* and when the assets are loaded select the game screen */
  onready: function() {
    this.selectScene(this.game);
  }

});
