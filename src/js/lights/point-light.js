'use strict';

var _ = require( '../utils' );
var DirectionalLight = require( './directional-light' );

function PointLight( color, intensity, distance ) {
  DirectionalLight.call( this, color, intensity );

  this.distance = distance || 0;
}

_.inherits( PointLight, DirectionalLight );

module.exports = PointLight;
