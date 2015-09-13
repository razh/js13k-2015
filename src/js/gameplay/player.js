'use strict';

var _ = require( '../utils' );
var colors = require( './colors' );
var addBoxGeometry = require( '../geometry/box-geometry' );
var Color = require( '../math/color' );
var Geometry = require( '../geometry/geometry' );
var LambertMaterial = require( '../materials/lambert-material' );
var Mesh = require( '../objects/mesh' );
var Spring = require( '../math/spring' );
var Vector3 = require( '../math/vector3' );

var WIDTH = 0.25;
var HEIGHT = 0.7;

function Player() {
  var geometry = addBoxGeometry(
    new Geometry(),
    WIDTH, HEIGHT, WIDTH,
    0, HEIGHT / 2, 0
  );

  this.mesh = new Mesh( geometry, new LambertMaterial({
    color: new Color().fromArray( _.sample( colors ) ),
    wireframe: true,
    lineWidth: 2
  }));

  this.spring = new Spring( 480, 12 );

  this.spring.set( this.mesh.position );
  this.target = new Vector3();

  // Y velocity.
  this.velocity = 0;
}

Player.prototype.update = function( dt ) {
  this.target.copy( this.mesh.position );
  this.target.y += HEIGHT;
  this.spring.to = this.target;

  this.spring.update( dt );

  var y = ( this.spring.getValues().y - this.mesh.position.y ) / HEIGHT;
  var x = Math.sqrt( ( WIDTH * WIDTH * HEIGHT ) / y ) / WIDTH;

  this.mesh.scale.set( x, y, x );
};

Player.prototype.color = function( index ) {
  this.mesh.material.color.fromArray(
    index !== undefined ? colors[ index ] : _.sample( colors )
  );
};

module.exports = Player;
