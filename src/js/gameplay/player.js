'use strict';

var addBoxGeometry = require( '../geometry/box-geometry' );
var Color = require( '../math/color' );
var Geometry = require( '../geometry/geometry' );
var LambertMaterial = require( '../materials/lambert-material' );
var Mesh = require( '../objects/mesh' );
var Spring = require( '../math/spring' );
var Vector3 = require( '../math/vector3' );

var WIDTH = 0.15;
var HEIGHT = 0.5;

var material = new LambertMaterial({
  color: new Color( 0.7, 0.8, 1 ),
  overdraw: 0.5
});

function Player() {

  var geometry = addBoxGeometry( new Geometry(), WIDTH, HEIGHT, WIDTH );
  this.mesh = new Mesh( geometry, material );

  for ( var i = 0; i < 8; i++ ) {
    geometry.vertices[ i ].y += HEIGHT / 2;
  }

  this.spring = new Spring( 480, 12 );
  require( '../debug/dat' ).spring( this.spring );
  this.spring.set( this.mesh.position );
  this.target = new Vector3();

  this.mesh.geometry.computeFaceNormals();
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

module.exports = Player;
