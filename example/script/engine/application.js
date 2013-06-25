ENGINE.Application = function(args) {

  var app = this;

  _.extend(this, args);

  /* create fullscreen canvas wrapper - we will draw on it */
  this.layer = cq();

  /* add it to the document */
  this.layer.appendTo("body");

  /* bind events to the application - you will understand it later */
  eveline(this);

  /* create loader and assets manager */  
  this.loader = new ENGINE.Loader();
  this.assets = new ENGINE.Assets(this.loader); 

  this.oncreate();

  /* fire loader */
  this.loader.ready(function() {
    app.onready();
  });

};

ENGINE.Application.prototype = { 

  /* call the method in current scene with given arguments 
       use to pass the event to the current scene
  */
  dispatch: function(method) {

    if (this.scene && this.scene[arguments[0]]) this.scene[arguments[0]].apply(this.scene, Array.prototype.slice.call(arguments, 1));
  },

  selectScene: function(scene) {

    /* say bye bye to the current scene */
    this.dispatch("onleave");

    /* swap current scene */
    this.scene = scene;

    /* say hello to the new scene */
    this.dispatch("onenter");
  },

  /* Now pass the events from eveline to the current scene.
     It could be done in many different ways - but seriously -
     there are not like 2000 events so let's do this by finger */


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

  onmouseup: function(x, y) {
    this.dispatch("onmouseup", x, y);
  },

  onclick: function(x, y) {
    this.dispatch("onclick", x, y);
  },

  ongamepaddown: function(button, gamepad) {
    this.dispatch("ongamepaddown", button, gamepad);
  },

  ongamepadup: function(button, gamepad) {
    this.dispatch("ongamepadup", button, gamepad);
  },

  ongamepadmove: function(x, y, gamepad) {
    this.dispatch("ongamepadmove", x, y, gamepad);
  },

  onrender: function(delta) {
    this.dispatch("onrender", delta);
  },

  onstep: function(delta) {
    this.dispatch("onstep", delta);
  },

  onresize: function() {
    this.dispatch("onresize");
  }

};
