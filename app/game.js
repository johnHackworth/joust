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
      var wrapper = cq(image).blend('#333333', "addition", 1.0).resize(0.8);
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
      this.getCenter();
      this.entities.step(delta, this.center);
      this.entities.call("step", delta, this.center);
    },

    getCenter: function() {
      var midY = app.canvasHeight / 2;
      var midX = app.canvasWidth / 2;
      this.deltaY = Math.floor(this.hero.y - midY);
      this.deltaX = Math.floor(this.hero.x - midX);
      this.center = [this.deltaX, this.deltaY];
    },
    onrender: function(delta) {
      this.getCenter();

      /* fill whole canvas layer with a black paint */
      app.layer
        .save()
        .drawImage(this.image, 0 - this.center[0], -250 - this.center[1])
        .drawImage(this.image, (-1)* this.image.width - this.center[0], -250 - this.center[1])
        .drawImage(this.image, this.image.width- this.center[0], -250- this.center[1])
      /* call render method of each entity in the collection */
      this.drawLimits();
      this.entities.call("render", delta, this.center);


      this.drawNames();
    },
    drawLimits: function() {
      app.layer.beginPath();
      app.layer.context.fillStyle = "rgba(100,50,0,0.9)";
      app.layer.context.strokeStyle = "#555555";
      app.layer.fillRect(
        0 - this.center[0],
        0 - 5 - this.center[1],
        2 * app.width,
        5);
      app.layer.fillRect(
        0 - this.center[0],
        app.height - this.center[1],
        2 * this.image.width,
        5);
      app.layer.fillRect(
        0 - 5 - this.center[0],
        0 - this.center[1],
        5,
        app.height);
      app.layer.fillRect(
        app.width - this.center[0],
        0 - this.center[1],
        5,
        app.height);
      app.layer.stroke();
      app.layer
        .restore();
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
    },
    onkeydown: function(key) {
      if(key === 'a' || key === 'left') {
        this.hero.intendedDirection = (2*Math.PI  + (this.hero.direction - (Math.PI / 45))) % (2*Math.PI);
      }
      if(key === 'd' || key === 'right') {
        this.hero.intendedDirection = (2*Math.PI  + (this.hero.direction + (Math.PI / 45))) % (2*Math.PI);
      }
      if(key === 'space' || key === ' ') {
        this.hero.spurHorse();
      }
    }

  });
}
