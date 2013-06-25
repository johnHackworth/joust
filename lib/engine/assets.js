window.engine = window.engine || {};

(function() {
  var Assets = function(loader) {

    /* make use of the loader that we already have */
    this.loader = loader;

    /* lookup directories so we don't have to provide full paths everytime */
    this.paths = {
      images: "assets/images/"
    };

    /* here we will hold the raw assets */
    this.data = {
      images: []
    };
  };

  Assets.prototype = {

    /* get image by key - key is created by removing extension from filename for example
               units/tank.png
       becomes units/tank
    */
    image: function(key) {
      return this.data.images[key];
    },

    /* add many images */
    addImages: function(filenames) {
      for (var i = 0; i < filenames.length; i++) {
        this.addImage(filenames[i]);
      }
    },

    /* add one image */
    addImage: function(filename) {
      var image = new Image;

      /* pass the image to the loader */
      this.loader.image(image);

      /* we gonna rip off extension */
      var key = filename.match(/(.*)\..*/)[1];

      /* add image to the assets */
      this.data.images[key] = image;

      /* lets search for image in defined path */
      image.src = this.paths.images + filename;
    }
  };

  window.engine.Assets = Assets;
})()
