app.game = new ENGINE.Scene({

  oncreate: function() {

    this.entities = new ENGINE.Collection(this);
  },

  onenter: function() {

    /* if we would add the hero in oncreate it would fail
       because image is not yet loaded at this state 
       the scene is entered in onready so it is safe   
    */

    this.hero = this.entities.add(ENGINE.Hero, {
      x: app.width / 2,
      y: app.height / 2
    });

    /* create gui */
    var gui = new dat.GUI();
    gui.add(app.game.hero.weapon, 'count', 1, 10).step(1);
    gui.add(app.game.hero.weapon, 'firerate', 50, 500);
    gui.add(app.game.hero.weapon, 'speed', 100, 1500);
    gui.add(app.game.hero.weapon, 'chaos', 0, 32);
    gui.add(app.game.hero.weapon, 'spacing', 0, 64);
    gui.add(app.game.hero.weapon, 'spread', 0, Math.PI).step(0.1);    
    gui.addColor(app.game.hero.weapon, 'color');
    gui.add(app.game.hero.weapon, 'shape', 0, 5).step(1);
  },

  onstep: function(delta) {

    this.entities.step(delta);   
    this.entities.call("step", delta);   
  },

  onrender: function(delta) {

    app.layer.clear("#023");
    this.entities.call("render", delta);   
  },

  onmousemove: function(x, y) {
    this.hero.direction = utils.atanxy(
      x - this.hero.x,
      y - this.hero.y
    );
  },

  onmousedown: function(x, y, button) {

    this.hero.firing = true;
  },

  onmouseup: function(x, y, button) {

    this.hero.firing = false;
  }

});
