'use strict';

var EPSILON = 1e-4;

function Spring( k, b ) {
  this.k = k;
  this.b = b;

  this.x = 0;
  this.v = 0;
  this.to = 0;
}

Spring.prototype.update = function( dt ) {
  var a = this.k * ( this.to - this.x ) - this.b * this.v;

  var v = this.v + a * dt;
  var x = this.x + v * dt;

  if ( Math.abs( v - this.v ) < EPSILON &&
       Math.abs( x - this.x ) < EPSILON ) {
    this.x = this.to;
    this.v = 0;
  }

  this.x = x;
  this.v = v;
};

module.exports = Spring;
