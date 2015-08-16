'use strict';

var Vector3 = require( '../math/vector3' );

function RenderableSprite() {
  this.object = null;

  this.x = 0;
  this.y = 0;
  this.z = 0;

  this.rotation = 0;
  // Only need a Vector2, but this will work as well.
  this.scale = new Vector3();

  this.material = null;
}

module.exports = RenderableSprite;
