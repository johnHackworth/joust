window.onload = function() {
  app.game = new window.engine.Scene({
    playerName: 'knight',
    texts: [],
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
        knight.announceDeath = this.announceDeath.bind(this);
      }
      this.heroHorse = this.entities.add(window.entities.Horse, {
        x: 20,
        y: app.height / 2,
        direction: 0,
        player: true,
        color: '#FFFFFF',
        turning: 0.03
      });
      this.hero = this.entities.add(window.entities.Knight, {
        horse: this.heroHorse,
        name: this.playerName,
        player: true,
        turning: 0.3,
        color: '#330000'
      })
      this.hero.name = this.playerName;
      this.hero.onDeath = this.gameOver.bind(this);
      this.spawnArm(this.hero)

    },
    oncreate: function() {

      var image = app.assets.image('grass')
      var wrapper = cq(image).resize(1);
      this.image = wrapper.canvas;
      /* create new collection of entities */
      this.entities = new window.entities.GameObjects(this);
      this.spriteShields = app.assets.image("shields");
      // this.adText("FIGHT!", [-81 + app.canvasWidth / 2 , 99], "41pt", 80, '50, 50, 50')
      this.adText("FIGHT!", [-80 + app.canvasWidth / 2 , 100], "40pt", 80, '255, 255, 100')
    },
    spawnHorse: function() {
      var posy = app.height - 20;
      var direction = 3 * Math.PI / 2;
      if(Math.random > 0.5) {
        posy = 20;
        direction = Math.PI / 2;
      }
      var posx = Math.floor(app.width - (Math.random() * app.width));
      return this.entities.add(window.entities.Horse, {
        x: posx,
        y: posy,
        direction: direction
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
      this.drawEntities(delta);
      this.drawTexts();
      this.drawNames();
    },
    drawEntities: function(delta) {
      for(var i=0; i <= 4; i++) {
        for(var j = 0, l = this.entities.length; j < l; j++) {
          if(this.entities[j].renderLevel === i) {
            this.entities[j].render(delta, this.center)
          }
        }
      }
    },
    drawTexts: function() {
      var newTexts = [];
      for(var i = 0, l = this.texts.length; i < l; i++) {
        this.texts[i].time--;
        app.layer
          .save()
        var alpha = 1;
        var yPos = this.texts[i].position[1];
        if(this.texts[i].time < 30) {
          alpha = this.texts[i].time / 30
          yPos = yPos -  (30 - this.texts[i].time)
        }
        app.layer
          .strokeStyle = "rgba(30,30,30,"+alpha+")";
        app.layer
          .lineWidth = 8;
        app.layer
          .fillStyle("rgba("+this.texts[i].color+","+alpha+")")
          .font(' '+this.texts[i].size+' MS UI Gothic')

        app.layer
          .fillText(this.texts[i].text,
            this.texts[i].position[0],
            yPos)
          .strokeText(this.texts[i].text, this.texts[i].position[0],
          yPos)
          .restore()

        if(this.texts[i].time > 0) {
          newTexts.push(this.texts[i]);
        }
      }
      this.texts = newTexts;
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
        .wrappedText('( ' + this.hero.health +' / ' + this.hero.maxHealth + ') ' +
         this.hero.honor + ' honor, ' + this.hero.fame + ' fame', 30,45, 200)
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
            '( ' + this.knights[i].health  +' / ' + this.knights[i].maxHealth + ') ' +
         this.knights[i].honor + ' honor, ' + this.knights[i].fame + ' fame' :
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
        this.hero.intendedDirection = (2*Math.PI  + (this.hero.direction - (Math.PI / 25))) % (2*Math.PI);
      }
      if(key === 'd' || key === 'right') {
        this.hero.intendedDirection = (2*Math.PI  + (this.hero.direction + (Math.PI / 25))) % (2*Math.PI);
      }
      if(key === 'space' || key === ' ') {
        this.hero.spurHorse();
      }
    },
    adText: function(text, position, size, time, color) {
      color = color || "255,255,255";
      time = time || 100;
      this.texts.push({
        text: text,
        position: position,
        size: size,
        time: time,
        color: color
      })
    },
    gameOver: function(knight) {
      if(knight.player) {
        this.adText("You have been",
          [320, 110],
          "30px",
          300,
          '255,50,50'
          )

        this.adText("Knocked out!!",
          [250, 160],
          "60px",
          300,
          '255,0,0'
          )
      }
    },
    announceDeath: function(knight, killer) {
      if(killer.player === true) {
        this.adText("You have Knocked out",
          [320, 50],
          "20px",
          300,
          '55,200,50'
          )

        this.adText(knight.name,
          [330, 90],
          "30px",
          300,
          '30,30,0'
          )
      }
    }
  });
}
