var utils = {
  atanxy: function(x, y) {
    var angle = Math.atan2(y, x);
    if (angle < 0) angle = Math.PI * 2 + angle;
    return angle;
  }
}
