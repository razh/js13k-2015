'use strict';

var _ = require( '../utils' );
var Color = require( '../math/color' );
var Geometry = require( '../geometry/geometry' );
var Mesh = require( '../objects/mesh' );
var LambertMaterial = require( '../materials/lambert-material' );
var addBoxGeometry = require( '../geometry/box-geometry' );

var HEIGHT = 1 / 8;

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
  // Green.
  [ 0.7, 0.8, 0.5 ]
];

function Block( width, depth ) {
  Mesh.call( this, new Geometry(), new LambertMaterial({
    color: new Color().fromArray( sample( blockColors ) ),
    wireframe: true,
    lineWidth: 0.5
  }));

  this.width = width;
  this.height = HEIGHT;
  this.depth = depth;

  this.theta = 0;
  this.angularDistance = 0;

  addBoxGeometry( this.geometry, width, HEIGHT, depth, 0 -HEIGHT / 2, 0 );
  this.geometry.computeFaceNormals();
}

_.inherits( Block, Mesh );

module.exports = Block;
