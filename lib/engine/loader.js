window.engine = window.engine || {};

(function() {
  var Loader = function() {
    /* all items to load */
    this.total = 0;
    /* items in queue */
    this.count = 0;
    /* convenient progress from 0 to 1 */
    this.progress = 0;

    /* all callbacks that should be fired when the loading is over */
    this.callbacks = []

    this.loading = false;
  };

  Loader.prototype = {

    /* tell the loader that we are adding some item */
    add: function() {
      this.loading = true;
      this.count++;
      this.total++;
    },

    image: function(image) {
      var loader = this;

      /* listen to when the image is ready */
      image.addEventListener("load", function() {
        loader.onItemReady();
      });

      /* if the image could not be loaded call error handler */
      image.addEventListener("error", function() {
        loader.onItemError(this.src);
      });

      /* increase items count */
      this.add();
    },

    /* sometimes it is convinient to simulate loading by using timeout
         usage:
         loader.foo(1000);
       this will simulate that some asset is being loaded for 1 second
    */
    foo: function(duration) {
      var loader = this;

      /* simulate loading using timeout */
      setTimeout(function() {
        loader.onItemReady();
      }, duration);

      /* increase items count */
      this.add();
    },

    /* what should happen when the loading is done */
    ready: function(callback) {
      if (!this.loading) {

        /* if nothing to load just fire the callback right away */
        callback();
      } else {

        /* if loading add the callback to the pool for later execution */
        this.callbacks.push(callback);
      }

    },

    /* called when one item finished loading */
    onItemReady: function() {

        /* decrease count of items in queue */
      this.count--;

      /* update the progress which can be accessed from outside
         to for example visualise progress bar */

      this.progress = (this.total - this.count) / this.total;

      /* if there are no more items in queue execute all callbacks
         and reset the loader */
      if (this.count <= 0) {
        this.loading = false;

        /* run all the callbacks */
        for (var i = 0; i < this.callbacks.length; i++) {
          this.callbacks[i]();
        }

        /* remove all callbacks so they won't be fired
           on the next loading */

        this.callbacks = [];
        this.total = 0;
        this.count = 0;
      }
    },

    /* called when some item failed */
    onItemError: function(source) {

      /* just output the source to the console */
      console.log("unable to load ", source);
    }
  };

  window.engine.Loader = Loader;

})()
