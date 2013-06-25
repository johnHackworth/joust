window.onload = function() {
  app.game = new window.engine.Scene({
    oncreate: function() {

      var image = app.assets.image('grass')
      var wrapper = cq(image).blend('#333333', "addition", 1.0);
      this.image = wrapper.canvas;
      /* create new collection of entities */
      this.entities = new window.entities.GameObjects(this);

      for(var i = 0; i < 1; i++) {
        var horse = this.spawnHorse();
        var knight = this.spawnKnight(horse);
        this.spawnArm(knight);
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
      this.spawnArm(this.hero)

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
    spawnArm: function(knight) {
      return this.entities.add(window.entities.Arm, {
        owner: knight
      });
    },
    onstep: function(delta) {
      this.entities.step(delta);
      this.entities.call("step", delta);
    },

    onrender: function(delta) {

      /* fill whole canvas layer with a black paint */
      app.layer
        .save()
        .drawImage(this.image, 0, 0)
        .drawImage(this.image, this.image.width, 0)
        .restore();
      /* call render method of each entity in the collection */
      this.entities.call("render", delta);
    },
    onmousemove: function(x, y) {
      this.hero.intendedDirection = utils.atanxy(
        x - this.hero.horse.x,
        y - this.hero.horse.y
      );
      this.intendedDirection = Math.round(this.intendedDirection * 100) / 100

    }

  });
}
