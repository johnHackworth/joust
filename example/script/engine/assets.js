ENGINE.Assets = function(loader) {

  this.loader = loader;

  this.paths = {
    images: "assets/images/"
  };

  this.data = {
    images: []
  };
};

ENGINE.Assets.prototype = {

  /* get image */
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

