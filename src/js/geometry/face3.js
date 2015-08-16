'use strict';

var Color = require( '../math/color' );
var Vector3 = require( '../math/vector3' );

function Face3( a, b, c ) {
  this.a = a;
  this.b = b;
  this.c = c;

  this.normal = new Vector3();
  this.color = new Color();
}

module.exports = Face3;
