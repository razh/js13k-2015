'use strict';

var _ = require( '../utils' );
var Object3D = require( '../object3d' );
var Filter = require( '../math/filter' );

function Mesh( geometry, material ) {
  Object3D.call( this );

  this.geometry = geometry;
  this.material = material;

  this.filter = new Filter();
}

_.inherits( Mesh, Object3D );

module.exports = Mesh;
