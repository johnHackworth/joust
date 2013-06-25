ENGINE.Hero = function(args) {

  _.extend(this, {
    x: 0,
    y: 0,
    direction: 0,
    image: app.assets.image("hero"),
    firing: false,
    cooldown: 0
  }, args);  

  
  this.weapon = {
    count: 1,
    chaos: 16,
    spread: 0.1,
    spacing: 0,
    speed: 800,
    color: "#88ff00",
    shape: 3,
    firerate: 100
  };

};

ENGINE.Hero.prototype = {
   fire: function() {

    /* leftmost values for spacing and spread */

    /* | | | < this is spacing */

    /* \ | / < this is spread */

    if(this.weapon.count > 1) {

      var spreadStart = -this.weapon.spread / 2;
      var spacingStart = this.weapon.spacing / 2;   
      var spreadStep = this.weapon.spread / (this.weapon.count - 1);
      var spacingStep = this.weapon.spacing / (this.weapon.count -1);
    } else {
      var spreadStart = 0;
      var spacingStart = 0;   
      var spreadStep = 0;
      var spacingStep = 0;  
    }

    /* first of all we need to give them proper starting position so they 
       spawn from the end of a gun - not out of the middle of a hero */

    /* to achieve this we rotate the gun end point around sprite rotation point
       using offset between hero rotation center and the end of his gun
       which I gimped out with result of x = 34, y = 5 */


    var gunX = this.x + Math.cos(this.direction) * 34 - Math.sin(this.direction) * 5;
    var gunY = this.y + Math.sin(this.direction) * 34 + Math.cos(this.direction) * 5;
  
    /* it is still not 100% accurate because the gun has also 
       yOffset - but fair enough for the tutorial */          

    for(var i = 0; i < this.weapon.count; i++) {

      /* spacing is tricky thing - it needs to be aligned on an
         axis perpendicular to the gun */

      var spacingOffsetX = Math.cos(this.direction - Math.PI / 2) * (spacingStart - i * spacingStep);
      var spacingOffsetY = Math.sin(this.direction - Math.PI / 2) * (spacingStart - i * spacingStep);

      this.collection.add(ENGINE.Bullet, {
        direction: this.direction + spreadStart + i * spreadStep,
        x: gunX + spacingOffsetX + Math.random() * this.weapon.chaos - this.weapon.chaos / 2,
        y: gunY + spacingOffsetY + Math.random() * this.weapon.chaos - this.weapon.chaos / 2,        
        color: this.weapon.color,
        shape: this.weapon.shape,
        speed: this.weapon.speed
      });

    }

  },

  step: function(delta) { 

    this.cooldown -= delta;

    if(this.firing) {
      if(this.cooldown <= 0) {
        this.fire();
        this.cooldown = this.weapon.firerate;
      }
    }
  },

  render: function(delta) { 

    app.layer
      .save()
      .translate(this.x, this.y)
      .rotate(this.direction)
      .drawImage(this.image, -this.image.width / 2 + 10, -this.image.height / 2)
      .restore();    

    /* we have added +10 to the x position because the rotation point 
       is on the head not in the middle of a sprite */ 
  }

};
