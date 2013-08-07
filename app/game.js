window.onload = function() {
  app.game = new window.engine.Scene({
    playerName: 'knight',
    texts: [],
    gameLog: [],
    step: 0,
    lastZoomSet:0,
    currentZoom: 1,
    textAntiScale: 1,
    gameEnded: false,
    onenter: function() {
      this.knights = [];
      this.zoomLevel = app.zoom;
      this.gameEnded = false;
      this.entities = new window.entities.GameObjects(this);
      this.texts = [];
      this.gameLog = [];
      this.step = 0;
      this.lastZoomSet = 0;
      this.currentZoom = 1;
      this.zoomObjetive = 1;
      this.textAntiScale = 1;
      for(var i = 0; i < 8; i++) {
        var horse = this.spawnHorse();
        var pos = Math.floor(Math.random() * this.knightsData.length)
        var knightData = this.knightsData.splice(pos, 1)[0] ;
        knightData.horse = horse;
        var knight = this.spawnKnight(knightData);
        knight.shield = cq(this.spriteShields).blend(knight.color1, "addition", 1.0).canvas;
        this.knights.push(knight);
        this.spawnArm(knight, Math.floor(Math.random() * 1.6));
        knight.announceDeath = this.announceDeath.bind(this);
      }
      this.heroHorse = this.entities.add(window.entities.Horse, {
        x: 40,
        y: app.height / 2,
        direction: 0,
        player: true,
        color: '#FF6600',
        turning: 0.03
      });
      this.hero = this.entities.add(window.entities.Knight, {
        horse: this.heroHorse,
        name: this.playerName,
        player: true,
        turning: 0.3,
        color1: '#113388',
        color2: '#113388',
        strength: 10,
        horsemanship: 10,
        hability: 10,
        shield: 1
      })
      this.hero.shield = cq(this.spriteShields).blend(this.hero.color1, "addition", 1.0).canvas;

      this.hero.name = this.playerName;
      this.hero.onDeath = this.gameOver.bind(this);
      this.focusedKnight = this.hero;
      this.spawnArm(this.hero, 0)

    },
    oncreate: function() {

      this.prepareImage();
      /* create new collection of entities */
      this.entities = new window.entities.GameObjects(this);
      this.spriteShields = app.assets.image("shields");
      // this.addText("FIGHT!", [-81 + app.canvasWidth / 2 , 99], "41pt", 80, '50, 50, 50')
      this.addText("FIGHT!", [-80 + app.canvasWidth / 2 , 100], 80, 80, '255, 255, 100')
    },
    prepareImage: function() {
      var image = app.assets.image('grass')
      var wrapper = cq(image).resize(1 * app.zoom);
      this.image = wrapper.canvas;
      var wrapperSmall = cq(image).resize(1 * app.zoom * 0.8);
      this.imageSmall = wrapperSmall.canvas;
      this.imageNormal = wrapper.canvas;
      this.imageSize = 'normal';
      this.star = cq(app.assets.image('star')).canvas;
      this.halfStar = cq(app.assets.image('halfstar')).canvas;
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
    getAliveKnightsNumber: function() {
      var n = 0;
      for(var i = 0, l = this.knights.length; i < l; i++) {
        if(!this.knights[i].dead) {
          n++;
        }
      }
      if(!this.hero.dead) {
        n++;
      }
      return n;
    },
    spawnKnight: function(knightData) {
      return this.entities.add(window.entities.Knight,knightData);
    },
    spawnArm: function(knight, type) {
      if(!type) {
        type = 0;
      }
      var armsFactory = {
        0: window.entities.Lance,
        1: window.entities.LongSword
      }
      return this.entities.add(armsFactory[type], {
        owner: knight,
        color: knight.color2
      });
    },
    onstep: function(delta) {
      this.step++;
      this.getCenter();
      this.selectZoomLevel();
      this.zoomStep();
      this.entities.step(delta, this.center);
      this.entities.call("step", delta, this.center);
      if(this.getAliveKnightsNumber() <= 1 && !this.gameEnded) {
        this.gameEnded = true;
        this.showWinner();
      }
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
      if(this.deltaY < -100) {
        this.deltaY = -100;
      } else if(this.deltaY > 450) {
        this.deltaY = 450;
      }
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
      this.drawEntities(delta);
      this.drawLimits();
      this.drawTexts();
      this.drawGameLog();
      this.drawNames();
      this.drawStars();

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
        var alpha = 1;
        var yPos = this.texts[i].position[1];
        if(this.texts[i].time < 30) {
          alpha = this.texts[i].time / 30
          yPos = yPos -  (30 - this.texts[i].time)
        }
        app.layer
          .save()
          .scale(this.textAntiScale, this.textAntiScale)
          .fillStyle("rgba("+this.texts[i].color+","+alpha+")")
          .font(this.texts[i].size + 'px Arial')
          .wrappedText(this.texts[i].text, this.texts[i].position[0],yPos, 800)
          // .scale(this.textAntiScale, this.textAntiScale)
          .restore();

        if(this.texts[i].time > 0) {
          newTexts.push(this.texts[i]);
        }
      }
      this.texts = newTexts;
    },
    drawGameLog: function() {
      var newTexts = [];
      for(var i = 0, l = this.gameLog.length; i < l; i++) {
        this.gameLog[i].time--;
        var alpha = 0.90;
        var yPos = Math.floor(app.canvasHeight - app.canvasHeight / 8) + 15 * i;
        if(this.gameLog[i].time < 30) {
          alpha = this.gameLog[i].time / 30
          yPos = yPos -  (30 - this.gameLog[i].time)
        }
        app.layer
          .save()
          .scale(this.textAntiScale, this.textAntiScale)
          .fillStyle("rgba(255,255,255,"+alpha+")")
          .font('12px Arial')
          .wrappedText(this.gameLog[i].text, 200,yPos, 400)
          .restore();

        if(this.gameLog[i].time > 0) {
          newTexts.push(this.gameLog[i]);
        }
      }
      this.gameLog = newTexts;
    },

    drawLimits: function() {
      app.layer.beginPath();
      app.layer.context.fillStyle = "rgba(50,50,50,0.3)";
      app.layer.context.strokeStyle = "#555555";

      // shadows
      app.layer.fillRect(
        (-30 - this.center[0]) * app.zoom,
        (0 - this.center[1]) * app.zoom,
        1 * app.width * app.zoom + 30,
        10 * app.zoom);
      app.layer.fillRect(
        (-30 - this.center[0]) * app.zoom,
        (app.height + 5 - this.center[1]) * app.zoom,
        (1 * this.image.width )* app.zoom + 120,
        10 * app.zoom);
      app.layer.fillRect(
        (0 - this.center[0]) * app.zoom,
        (0 - this.center[1]) * app.zoom,
        10 * app.zoom,
        app.height * app.zoom);
      app.layer.fillRect(
        (app.width  - this.center[0]) * app.zoom,
        (0 - this.center[1]) * app.zoom,
        10 * app.zoom,
        app.height * app.zoom);
      app.layer.stroke();
      app.layer
        .restore();


      app.layer.beginPath();
      app.layer.context.fillStyle = "rgba(100,50,0,0.9)";
      app.layer.context.strokeStyle = "#555555";
      // wood
      app.layer.fillRect(
        (-30 - this.center[0]) * app.zoom,
        (- 5 - this.center[1]) * app.zoom,
        1 * app.width * app.zoom + 30,
        5 * app.zoom);
      app.layer.fillRect(
        (-30 - this.center[0]) * app.zoom,
        (app.height - this.center[1]) * app.zoom,
        1 * this.image.width * app.zoom + 120,
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
        .scale(this.textAntiScale, this.textAntiScale)
        .fillStyle('#FFFFFF')
        .font('arial 24px #000000')
        .wrappedText(this.hero.name, 30,30, 200)
        .restore();
      app.layer
        .save()
        .fillStyle('#FFFFFF')
        .scale(this.textAntiScale, this.textAntiScale)
        .drawImage(
          this.hero.shield,
          0,
          20 * (this.hero.shieldType-1),
          20,
          20,
          5,
          30 + 0 * 30,
          20,
          20
        )
        .restore();
      this.heroHealth = app.layer
        .save()
        .scale(this.textAntiScale, this.textAntiScale)
        .fillStyle('#FFFFFF')
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
            : 'Knocked'
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
    drawStars: function() {
      for(var i = 0, l = this.knights.length; i < l; i++) {
        var points = this.knights[i].fame + this.knights[i].honor;
        var stars = Math.floor(points / 40)
        var halfStar = (points % 40 > 20)
        for(var j = 0; j < stars; j++) {
          app.layer
            .save()
            .scale(this.textAntiScale, this.textAntiScale)
            .drawImage(
              this.star,
              75 + 10 * j,
              67 + 30 * i
            )
            .restore();
        }
        if(halfStar) {
          app.layer
            .save()
            .scale(this.textAntiScale, this.textAntiScale)
            .drawImage(
              this.halfStar,
              75 + 10 * stars,
              67 + 30 * i
            )
            .restore();
        }
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
    onclick: function(x,y) {
      this.hero.specialAction();
      this.entities.click([x,y])
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
        this.hero.specialAction();
      }
    },
    addText: function(text, position, size, time, color) {
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
    addGameLog: function(text) {
      var color = "255,255,255";
      var time = 400;
      for(var i = 0, l = this.gameLog.length; i < l; i++) {
        if(this.gameLog[i].text === text) {
          return;
        }
      }
      this.gameLog.push({
        text: text,
        time: time,
        color: color
      })
    },
    gameOver: function(knight) {
      if(knight.player) {
        this.addText("You have been",
          [350, 50],
          30,
          300,
          '255,50,50'
          )

        this.addText("Knocked out!!",
          // [app.width / 2 + this.center[0])* this.currentZoom , 160*this.currentZoom- 1/this.center[1]],
          [260,100],
          60,
          300,
          '255,0,0'
          )
      }
      this.showBackButton();
    },
    announceDeath: function(knight, killer) {
      if(killer.player === true) {
        this.addText("You have Knocked out",
          [330, 50],
          20,
          300,
          '55,200,50'
          )

        this.addText(knight.name,
          [330, 90],
          30,
          300,
          '30,30,0'
          )
      } else {
        this.addGameLog(killer.name + ' has knocked out ' + knight.name)
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
      "smaller": 0.50,
      "small": 0.80,
      "normal": 1.1,
      "big": 1.30,
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

    },
    showWinner: function() {
      var self = this;
      var winner = {name:''};
      if(!this.hero.dead) {
        winner = this.hero;
      } else {
        for(var i = 0, l = this.knights.length; i < l; i++) {
          if(!this.knights[i].dead) {
            winner = this.knights[i];
          }
        }
      }
      this.addText("Glory to the winner",
        [150, 150],
        60,
        800,
        '255,250,50'
        )

      this.addText("Glory to " + winner.name,
        [150,250],
        80,
        800,
        '255,255,0'
        )

        this.showBackButton();
    },
    showBackButton: function() {
      var backButton = new window.entities.Button({
        x: 270,
        y: 500,
        zoomable: true,
        width: 500,
        height: 50,
        text: "back to menu",
        color: '#000000',
        clicked: function() {
          self.next();
        }
      })
      this.entities.push(backButton)
    },
    armsTest: function(x, y) {
      this.hero.horse.step = function() { this.speed=0; this.direction = 0;}
      this.hero.horse.x = 20;
      this.hero.horse.y = 20;
      this.hero.health = 50;
      this.knights[0].horse.step = function() { this.direction = Math.PI; this.rider.direction = this.direction;}
      this.knights[0].horse.x = x || 30;
      this.knights[0].horse.y = y || 30;
      this.knights[0].health = 50;
    }

  });
}
