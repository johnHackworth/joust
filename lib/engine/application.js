window.engine = window.engine || {};

(function() {
  var Application = function(args) {
    _.extend(this, args);

    /* create fullscreen canvas wrapper - we will draw on it */
    if(args.width && args.height) {
      this.layer = cq(args.canvasWidth, args.canvasHeight);
    } else {
      this.layer = cq();
    }

    this.layer.appendTo("body");

    /* bind events to the application using eveline library
         it checks if provided object has properties coresponding with
       events supported by the library like onmousemove, ongamepadup
       then if the property exists binds the callback to the proper DOM event
    */
    eveline(this);

    /* create loader and assets manager
       it is defined later in this article
    */
    this.loader = new window.engine.Loader();
    this.assets = new window.engine.Assets(this.loader);

    /* run a callback provided by the end-developer */
    this.oncreate();

    /* fire loader */
    this.loader.ready(this.onready.bind(this));

  };

  Application.prototype = {
    touchToMouse: false,
    width: 640,
    height: 480,
    /* calls the method in current scene with given arguments
       for example
       this.dispatch("onmousemove", 32, 64);
       will trigger onmousemove method in current scene (if it has one)
    */
    dispatch: function(method) {
      if (this.scene && this.scene[arguments[0]]) this.scene[arguments[0]].apply(this.scene, Array.prototype.slice.call(arguments, 1));
    },

    selectScene: function(scene) {
      /* tell the current scene that it is being closed */
      this.dispatch("onleave");
      /* swap current scene */
      this.scene = scene;
      /* say hello to the new scene */
      this.dispatch("onenter");
    },

    /* Now pass the events from eveline to the current scene.
       It could be done in many different ways - but seriously -
       there are not like 2000 events so let's do this by finger */

    /* game logic step (setInterval) */
    onstep: function(delta) {
      this.dispatch("onstep", delta);
    },

    /* rendering loop (requestAnimationFrame) */
    onrender: function(delta) {
      this.dispatch("onrender", delta);
    },

    onkeydown: function(key) {
      this.dispatch("onkeydown", key);
    },

    onkeyup: function(key) {
      this.dispatch("onkeyup", key);
    },

    onmousedown: function(x, y) {
      this.dispatch("onmousedown", x, y);
    },

    onmousemove: function(x, y) {
      this.dispatch("onmousemove", x, y);
    },

    ontouchmove: function(x, y) {
      this.dispatch("onmousemove", x, y);
    },

    onmouseup: function(x, y) {
      this.dispatch("onmouseup", x, y);
    },

    onclick: function(x, y) {
      this.dispatch("onclick", x, y);
    },


  };

  window.engine.Application = Application;
})()
