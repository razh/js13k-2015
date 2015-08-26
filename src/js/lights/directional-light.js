'use strict';

var _ = require( '../utils' );
var Object3D = require( '../object3d' );
var Filter = require( '../math/filter' );

function DirectionalLight( color, intensity ) {
  Object3D.call( this );

  this.color = color;
  this.intensity = ( intensity !== undefined ) ? intensity : 1;

  this.filter = new Filter();
}

_.inherits( DirectionalLight, Object3D );

module.exports = DirectionalLight;
