ENGINE.Bullet = function(args) {
  
  _.extend(this, {
    x: 0,
    y: 0,
    direction: 0,
    speed: 256,
    color: "#cccccc"
  }, args);

  /* check if we have properly colored image in our set */
  if (!this.images[this.color]) {

    /* get raw image from assets */
    var image = app.assets.image("bullets");

    /* wrap canvas query around it - it will create new canvas and copy the image to it */
    var wrapper = cq(image).blend(this.color, "color", 1.0);

    /* you can use either image or canvas with drawImage function,
       so we will get pure canvas out of the wrapper */
    this.images[this.color] = wrapper.canvas;
  }

  this.image = this.images[this.color];
  this.sprite = this.sprites[this.shape];
};

ENGINE.Bullet.prototype = {

  images: { }, 

  sprites: [

 /* [x,  y,  w,  h] */
    [17,  0, 15, 15],
    [19, 16, 13, 7 ],
    [9,  24, 23, 7 ],
    [13, 32, 19, 3 ],
    [16, 36, 16, 2 ],
    [0,  39, 32, 4 ]
  ],
  
  remove: function() {

    /* mark for removal */
    this._remove = true;

    /* tell the collection that there are some bullets which could hurt
       some innocent people out of screen */
    this.collection.dirty = true;
  },

  step: function(delta) {
  
  	/* everything is measure in pixels per second but in order to do that 
       we need this delta / 1000 factor 
       md stands for miliDelta   
    */
    var md = delta / 1000;
  
  	/* move the bullet in certain direction 
       learn this formula and repeat it as mantra
    */
    this.x += Math.cos(this.direction) * this.speed * md;
    this.y += Math.sin(this.direction) * this.speed * md;
    
    /* remove the bullet if it is out of screen - or it can
       get outside your monitor and kill someone
    */
    if (this.x < 0 || this.y < 0 || this.x > app.width || this.y > app.height) {
      this.remove();    
    }
  },
  
  render: function() {
  
    app.layer.save()
      app.layer.translate(this.x, this.y)
      app.layer.rotate(this.direction)
      app.layer.drawImage(
        this.image,
        this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],  
        -this.sprite[2] / 2, -this.sprite[3] / 2, this.sprite[2], this.sprite[3]
      )
    .restore();
  }

};
