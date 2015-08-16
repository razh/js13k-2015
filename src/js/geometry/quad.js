'use strict';

var Color = require( '../math/color' );
var Vector3 = require( '../math/vector3' );

function Quad( a, b, c, d ) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;

  this.normal = new Vector3();
  this.color = new Color();
}

module.exports = Quad;
