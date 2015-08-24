'use strict';

var lerp = require( '../utils' ).lerp;

// RGB values are floats from [0, 1].
function Color( r, g, b ) {
  this.r = r || 0;
  this.g = g || 0;
  this.b = b || 0;
}

Color.prototype.setRGB = function( r, g, b ) {
  this.r = r;
  this.g = g;
  this.b = b;
  return this;
};

Color.prototype.toString = function() {
  return 'rgb(' +
    ( ( this.r * 255 ) | 0 ) + ', ' +
    ( ( this.g * 255 ) | 0 ) + ', ' +
    ( ( this.b * 255 ) | 0 ) +
  ')';
};

Color.prototype.add = function( color ) {
  this.r += color.r;
  this.g += color.g;
  this.b += color.b;
  return this;
};

Color.prototype.multiply = function( color ) {
  this.r *= color.r;
  this.g *= color.g;
  this.b *= color.b;
  return this;
};

Color.prototype.multiplyScalar = function( s ) {
  this.r *= s;
  this.g *= s;
  this.b *= s;
  return this;
};

Color.prototype.lerp = function( color, alpha ) {
  this.r = lerp( this.r, color.r, alpha );
  this.g = lerp( this.g, color.g, alpha );
  this.b = lerp( this.b, color.b, alpha );
  return this;
};

Color.prototype.copy = function( color ) {
  this.r = color.r;
  this.g = color.g;
  this.b = color.b;
  return this;
};

module.exports = Color;
