'use strict';

var _ = require( '../utils' );
var colors = require( '../gameplay/colors' );
var Color = require( '../math/color' );
var Geometry = require( '../geometry/geometry' );
var Mesh = require( '../objects/mesh' );
var LambertMaterial = require( '../materials/lambert-material' );
var addBoxGeometry = require( '../geometry/box-geometry' );

var HEIGHT = 1 / 8;

var color = new Color();

function Block( width, depth ) {
  Mesh.call( this, new Geometry(), new LambertMaterial({
    color: new Color().fromArray( _.sample( colors ) ),
    wireframe: true,
    lineWidth: 0.5
  }));

  this.width = width;
  this.height = HEIGHT;
  this.depth = depth;

  this.theta = 0;
  this.angularDistance = 0;

  addBoxGeometry( this.geometry, width, HEIGHT, depth, 0 -HEIGHT / 2, 0 );
}

_.inherits( Block, Mesh );

Block.prototype.colorIndex = function() {
  for ( var i = 0; i < colors.length; i++ ) {
    if ( this.material.color.equals( color.fromArray( colors[i] ) ) ) {
      return i;
    }
  }

  return -1;
};

module.exports = Block;
