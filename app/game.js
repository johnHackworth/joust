app.game = new window.engine.Scene({

  /* this is actually called immediately as this object is created
     so no assets are ready - but since we are using rectangles
     we can execute everything at once
  */
  oncreate: function() {

    /* create new collection of entities */
    this.entities = new window.entities.GameObjects(this);

    for(var i = 0; i < 1; i++) {
      var horse = this.spawnHorse();
      this.spawnKnight(horse);
    }
    this.heroHorse = this.entities.add(window.entities.Horse, {
      x: app.width / 2,
      y: app.height / 2,
      player: true,
      color: '#FFFFFF',
      turning: 0.03
    });
    this.hero = this.entities.add(window.entities.Knight, {
      horse: this.heroHorse,
      player: true,
      color: '#330000'
    })

  },

  spawnHorse: function() {
    var posx = Math.floor(app.width - (Math.random() * app.width));
    var posy = Math.floor(app.height - (Math.random() * app.height));
    return this.entities.add(window.entities.Horse, {
      x: posx,
      y: posy,
      direction: Math.PI
    });
  },
  spawnKnight: function(horse) {
    return this.entities.add(window.entities.Knight, {
      horse: horse
    });
  },
  onstep: function(delta) {

    /* call the step method of entities collection
       so it can eventually remove unused entities */
    this.entities.step(delta);
    /* call step method of each entity in the pool */
    this.entities.call("step", delta);
  },

  onrender: function(delta) {

    /* fill whole canvas layer with a black paint */
    app.layer.clear("#000");

    /* call render method of each entity in the collection */
    this.entities.call("render", delta);
  },
  onmousemove: function(x, y) {
    this.hero.intendedDirection = utils.atanxy(
      x - this.hero.x,
      y - this.hero.y
    );
    this.intendedDirection = Math.round(this.intendedDirection * 100) / 100

  }

});
