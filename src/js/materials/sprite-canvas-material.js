'use strict';

var _ = require( '../utils' );
var Material = require( './material' );

function SpriteCanvasMaterial( options ) {
  Material.call( this, options );

  // Canvas rendering context as parameter.
  this.program = function() {};
}

_.inherits( SpriteCanvasMaterial, Material );

SpriteCanvasMaterial.prototype.draw = function( ctx ) {
  this.program.call( this, ctx );
};

module.exports = SpriteCanvasMaterial;
