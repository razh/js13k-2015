'use strict';

var _ = require( '../utils' );
var LambertMaterial = require( './lambert-material' );
var Filter = require( '../math/filter' );

function LambertGlowMaterial( options ) {
  options = options || {};
  LambertMaterial.call( this, options );
  this.filter = new Filter();
}

_.extends( LambertGlowMaterial, LambertMaterial );

LambertGlowMaterial.prototype.draw = function( ctx, color, alpha, intensity ) {
  ctx.shadowBlur = this.shadowBlur * intensity;
  LambertMaterial.prototype.draw.call( this, ctx, color, alpha );
};

module.exports = LambertGlowMaterial;
