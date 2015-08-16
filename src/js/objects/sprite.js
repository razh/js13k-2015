'use strict';

var _ = require( '../utils' );
var Object3D = require( '../object3d' );
var Geometry = require( '../geometry/geometry' );

var geometry = new Geometry().push([
  -0.5, -0.5, 0,
  0.5, -0.5, 0,
  0.5, 0.5, 0
], [] );

function Sprite( material ) {
  Object3D.call( this );

  this.geometry = geometry;
  this.material = material;
}

_.extends( Sprite, Object3D );

module.exports = Sprite;
