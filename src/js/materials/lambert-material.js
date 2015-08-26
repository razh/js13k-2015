'use strict';

var _ = require( '../utils' );
var Color = require( '../math/color' );
var Material = require( './material' );

function LambertMaterial( options ) {
  Material.call( this, options );

  this.ambient = options.ambient || new Color();
  this.diffuse = options.diffuse || new Color();
  this.emissive = options.emissive || new Color();
}

_.inherits( LambertMaterial, Material );

LambertMaterial.prototype.draw = function( ctx, color, alpha ) {
  ctx.fillStyle = color.toString();
  Material.prototype.draw.call( this, ctx, alpha );
};

module.exports = LambertMaterial;
