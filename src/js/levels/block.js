'use strict';

var _ = require( '../utils' );
var Color = require( '../math/color' );
var Geometry = require( '../geometry/geometry' );
var Mesh = require( '../objects/mesh' );
var LambertMaterial = require( '../materials/lambert-material' );
var createBoxGeometry = require( '../geometry/box-geometry' );

var material = new LambertMaterial({
  color: new Color( 1, 1, 1 ),
  overdraw: 0.5
});

function Block( width, depth ) {
  Mesh.call( this, new Geometry(), material );

  this.width = width;
  this.height = Block.height;
  this.depth = depth;

  createBoxGeometry( this.geometry, width, Block.height, depth );
  this.geometry.computeFaceNormals();
}

Block.height = 1 / 8;

_.inherits( Block, Mesh );

module.exports = Block;
