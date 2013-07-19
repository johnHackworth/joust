window.onload = function() {
  app.game = new window.engine.Scene({
    playerName: 'knight',
    texts: [],
    step: 0,
    lastZoomSet:0,
    currentZoom: 1,
    textAntiScale: 1,
    onenter: function() {
      this.knights = [];
      this.zoomLevel = app.zoom;
      for(var i = 0; i < 8; i++) {
        var horse = this.spawnHorse();
        var pos = Math.floor(Math.random() * this.knightsData.length)
        var knightData = this.knightsData.splice(pos, 1)[0] ;
        knightData.horse = horse;
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
        color1: '#CCCCCC',
        color2: '#113388',
        strength: 10,
        horsemanship: 10,
        hability: 10
      })
      this.hero.name = this.playerName;
      this.hero.onDeath = this.gameOver.bind(this);
      this.focusedKnight = this.hero;
      this.spawnArm(this.hero)

    },
    oncreate: function() {

      this.prepareImage();
      /* create new collection of entities */
      this.entities = new window.entities.GameObjects(this);
      this.spriteShields = app.assets.image("shields");
      // this.adText("FIGHT!", [-81 + app.canvasWidth / 2 , 99], "41pt", 80, '50, 50, 50')
      this.adText("FIGHT!", [-80 + app.canvasWidth / 2 , 100], 80, 80, '255, 255, 100')
    },
    prepareImage: function() {
      var image = app.assets.image('grass')
      var wrapper = cq(image).resize(1 * app.zoom);
      this.image = wrapper.canvas;
      var wrapperSmall = cq(image).resize(1 * app.zoom * 0.8);
      this.imageSmall = wrapperSmall.canvas;
      this.imageNormal = wrapper.canvas;
      this.imageSize = 'normal';
    },
    changeImageSize: function() {
      if(this.imageSize === 'normal') {
        this.image = this.imageSmall;
        this.imageSize = 'small'
      } else {
        this.image = this.imageNormal;
        this.imageSize = 'normal'
      }
    },
    spawnHorse: function() {
      var posy = app.height * app.zoom - 20;
      var direction = 3 * Math.PI / 2;
      if(Math.random() > 0.5) {
        posy = 20 * app.zoom;
        direction = Math.PI / 2;
      }
      var posx = Math.floor(app.width * app.zoom - (Math.random() * app.width * app.zoom));
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
        owner: knight,
        color: knight.color2
      });
    },
    onstep: function(delta) {
      this.step++;
      this.getCenter();
      this.zoomStep();
      this.entities.step(delta, this.center);
      this.entities.call("step", delta, this.center);
      this.selectZoomLevel();
    },
    heroDistance: function() {
      var heroPos = [this.hero.x, this.hero.y];
      var minDistance = 10000;
      for(var i=0,l=this.entities.length; i < l; i++) {
        if(this.entities[i].type=='knight' &&
          !this.entities[i].dead &&
          !this.entities[i].player
        ) {
          var knight = this.entities[i];
          var distance = Math.abs(heroPos[0] - knight.x) +
            Math.abs(heroPos[1] - knight.y);
          if(distance < minDistance) {
            minDistance = distance;
          }
        }
      }
      return minDistance;
    },
    getCenter: function() {
      var midY = (app.canvasHeight / 2) * 1 / app.game.currentZoom;
      var midX = (app.canvasWidth / 2) * 1 / app.game.currentZoom;
      this.deltaY = Math.floor(this.focusedKnight.y - midY);
      this.deltaX = Math.floor(this.focusedKnight.x - midX);
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
        var yPos = this.texts[i].position[1] * 1 / this.currentZoom;
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
          .font(' '+this.texts[i].size *1/this.currentZoom+'px MS UI Gothic')

        app.layer
          .fillText(this.texts[i].text,
            this.texts[i].position[0] * 1 / this.currentZoom,
            yPos)
          .strokeText(this.texts[i].text, this.texts[i].position[0] * 1 / this.currentZoom,
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
        (-10 - this.center[0]) * app.zoom,
        (- 5 - this.center[1]) * app.zoom,
        2 * app.width * app.zoom,
        5 * app.zoom);
      app.layer.fillRect(
        (0 - this.center[0]) * app.zoom,
        (app.height - this.center[1]) * app.zoom,
        2 * this.image.width * app.zoom,
        5 * app.zoom);
      app.layer.fillRect(
        (0 - 5 - this.center[0]) * app.zoom,
        (0 - this.center[1]) * app.zoom,
        5 * app.zoom,
        app.height * app.zoom);
      app.layer.fillRect(
        (app.width - this.center[0]) * app.zoom,
        (0 - this.center[1]) * app.zoom,
        5 * app.zoom,
        app.height * app.zoom);
      app.layer.stroke();
      app.layer
        .restore();
    },
    drawNames: function() {
      this.heroNames = app.layer
        .save()
        .fillStyle('#FFFFFF')
        .scale(this.textAntiScale, this.textAntiScale)
        .font('arial 24px #000000')
        .wrappedText(this.hero.name, 30,30, 200)
        .restore();

      this.heroHealth = app.layer
        .save()
        .fillStyle('#FFFFFF')
        .scale(this.textAntiScale, this.textAntiScale)
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
          .scale(this.textAntiScale, this.textAntiScale)
          .font('arial 24px #000000')
          .wrappedText(this.knights[i].name, 30,30+(i+1)*30, 200)

          .restore();

        app.layer
          .save()
          .fillStyle(color)
          .scale(this.textAntiScale, this.textAntiScale)
          .font('arial 24px #000000')
          .wrappedText(this.knights[i].health > 0?
            '( ' + this.knights[i].health  +' / ' + this.knights[i].maxHealth + ') '
            //+ this.knights[i].honor + ' honor, ' + this.knights[i].fame + ' fame'
            : 'out of combat'
            , 30,45+ (i+1) * 30, 200)
          .restore();
        app.layer
          .save()
          .fillStyle('#FFFFFF')
          .scale(this.textAntiScale, this.textAntiScale)
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
          )
          .restore();
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
        this.hero.direction = this.hero.intendedDirection;
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
          [350, 50],
          30,
          300,
          '255,50,50'
          )

        this.adText("Knocked out!!",
          // [app.width / 2 + this.center[0])* this.currentZoom , 160*this.currentZoom- 1/this.center[1]],
          [260,100],
          60,
          300,
          '255,0,0'
          )
      }
    },
    announceDeath: function(knight, killer) {
      if(killer.player === true) {
        this.adText("You have Knocked out",
          [320- this.center[0], 50- this.center[1]],
          20,
          300,
          '55,200,50'
          )

        this.adText(knight.name,
          [330- this.center[0], 90- this.center[1]],
          30,
          300,
          '30,30,0'
          )
      }
    },
    zoomStep: function() {
      if(this.zoomObjetive &&
        this.zoomObjetive < this.currentZoom &&
        this.currentZoom - this.zoomObjetive > 0.02
      ) {
        var nextZoom = 0.99; //Math.floor((this.currentZoom - 0.005)*1000) / 1000;
        app.layer.scale(nextZoom, nextZoom);
        this.textAntiScale = 1/ this.currentZoom;
        this.currentZoom = this.currentZoom * nextZoom;
      }
      if(this.zoomObjetive &&
        this.zoomObjetive > this.currentZoom &&
        this.zoomObjetive - this.currentZoom > 0.02
      ) {
        var nextZoom = 1.01; //Math.floor((this.currentZoom + 0.005)*1000) / 1000;
        app.layer.scale(nextZoom, nextZoom);
        this.textAntiScale = 1/ this.currentZoom;
        this.currentZoom = this.currentZoom * nextZoom;
      }
    },
    zoomLevels: {
      "smaller": 0.60,
      "small": 0.80,
      "normal": 1,
      "big": 1.20,
      "bigger": 1.50
    },
    setZoom: function(level) {
      if(this.step - this.lastZoomSet > 50) {
        this.lastZoomSte = this.step;
        this.zoomObjetive = this.zoomLevels[level];
      } else {
        return;
      }

    },
    selectZoomLevel: function() {
      if(this.hero.horse.speed < this.hero.horse.maxSpeed / 4) {
        if(this.heroDistance() > 500) {
          this.setZoom('normal');
        } else if(this.heroDistance() < 100) {
          this.setZoom('bigger');
        } else {
          this.setZoom('big');
        }
      } else if(this.hero.horse.speed < 3* this.hero.horse.maxSpeed / 4) {
        if(this.heroDistance() > 600) {
          this.setZoom('smaller');
        } else if(this.heroDistance() > 400) {
          this.setZoom('small');
        } else if(this.heroDistance() < 100) {
          this.setZoom('big');
        } else {
          this.setZoom('normal');
        }
      } else {
        if(this.heroDistance() > 500) {
          this.setZoom('smaller');
        } else if(this.heroDistance() < 100) {
          this.setZoom('normal');
        } else {
          this.setZoom('small');
        }
      }

    }

  });
}
