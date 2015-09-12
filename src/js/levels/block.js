'use strict';

var _ = require( '../utils' );
var Color = require( '../math/color' );
var Geometry = require( '../geometry/geometry' );
var Mesh = require( '../objects/mesh' );
var LambertMaterial = require( '../materials/lambert-material' );
var addBoxGeometry = require( '../geometry/box-geometry' );

function sample( array ) {
  return array[ ( array.length * Math.random() ) | 0 ];
}

// Colors.
var blockColors = [
  // Red.
  [ 0.7, 0.3, 0.3 ],
  // Blue.
  [ 0.5, 0.7, 0.8 ],
  // Yellow.
  [ 0.9, 0.7, 0.5 ],
  // Pink.
  [ 0.8, 0.7, 0.8 ]
];

function Block( width, depth ) {
  Mesh.call( this, new Geometry(), new LambertMaterial({
    color: new Color().fromArray( sample( blockColors ) ),
    overdraw: 0.5
  }));

  this.width = width;
  this.height = Block.height;
  this.depth = depth;

  this.theta = 0;
  this.angularDistance = 0;

  addBoxGeometry( this.geometry, width, Block.height, depth );
  this.geometry.computeFaceNormals();
}

Block.height = 1 / 8;

_.inherits( Block, Mesh );

module.exports = Block;
