window.onload = function() {
  app.game = new window.engine.Scene({
    playerName: 'knight',
    onenter: function() {
      this.knights = [];
      for(var i = 0; i < 8; i++) {
        var horse = this.spawnHorse();
        var pos = Math.floor(Math.random() * this.knightsData.length)
        var knightData = this.knightsData.splice(pos, 1)[0] ;
        knightData.horse = horse;
        knightData.color = knightData.color1;
        var knight = this.spawnKnight(knightData);
        knight.shield = cq(this.spriteShields).blend(knight.color1, "addition", 1.0).canvas;
        this.knights.push(knight);
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
        name: this.playerName,
        player: true,
        color: '#330000'
      })
      this.hero.name = this.playerName;
      this.spawnArm(this.hero)

    },
    oncreate: function() {

      var image = app.assets.image('grass')
      var wrapper = cq(image).blend('#333333', "addition", 1.0);
      this.image = wrapper.canvas;
      /* create new collection of entities */
      this.entities = new window.entities.GameObjects(this);


      this.spriteShields = app.assets.image("shields");


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
    setHeroName: function(name) {
      this.playerName = name;
      this.heroHame = name;
    },
    spawnKnight: function(knightData) {
      return this.entities.add(window.entities.Knight,knightData);
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
      /* call render method of each entity in the collection */
      this.entities.call("render", delta);

      this.drawNames();


    },
    drawNames: function() {
      app.layer
        .save()
        .fillStyle('#FFFFFF')
        .font('arial 24px #000000')
        .wrappedText(this.hero.name, 30,30, 200)
        .restore();

      app.layer
        .save()
        .fillStyle('#FFFFFF')
        .font('arial 24px #000000')
        .wrappedText('( ' + this.hero.health +' / ' + this.hero.maxHealth + ')', 30,45, 200)
        .restore();
      for(var i = 0, l = this.knights.length; i < l; i++) {
        var color = '#FFFFFF';
        if(this.knights[i].ouchTime) {
          color = '#FF7777';
        }
        if(this.knights[i].dead) {
          color = '#333333';
        }
        app.layer
          .save()
          .fillStyle(color)
          .font('arial 24px #000000')
          .wrappedText(this.knights[i].name, 30,30+(i+1)*30, 200)
          .restore();

        app.layer
          .save()
          .fillStyle(color)
          .font('arial 24px #000000')
          .wrappedText(this.knights[i].health > 0?
            '( ' + this.knights[i].health  +' / ' + this.knights[i].maxHealth + ')' :
            'out of combat'
            , 30,45+ (i+1) * 30, 200)
          .restore();
        app.layer
          .save()
          .fillStyle('#FFFFFF')
          .drawImage(
            this.knights[i].shield,
            0,
            20 * (this.knights[i].shieldType-1),
            20,
            20,
            5,
            60 + i * 30,
            20,
            20
          ).restore();
      }


    },
    onmousemove: function(x, y) {
      this.hero.intendedDirection = utils.atanxy(
        x - this.hero.horse.x,
        y - this.hero.horse.y
      );
      this.intendedDirection = Math.round(this.intendedDirection * 100) / 100
    },
    ontouchmove: function(x, y) {
      this.hero.intendedDirection = utils.atanxy(
        x - this.hero.horse.x,
        y - this.hero.horse.y
      );
      this.intendedDirection = Math.round(this.intendedDirection * 100) / 100
    },
    onclick: function() {
      this.hero.spurHorse();
    }

  });
}
