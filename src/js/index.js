'use strict';

var _ = require( './utils' );
var Game = require( './game' );
var Object3D = require( './object3d' );
var Geometry = require( './geometry/geometry' );
var Mesh = require( './objects/mesh' );
var Color = require( './math/color' );
var DirectionalLight = require( './lights/directional-light' );
var LambertMaterial = require( './materials/lambert-material' );
var addBoxGeometry = require( './geometry/box-geometry' );
var createCylinderGeometry = require( './geometry/cylinder-geometry' );
var OrbitControls = require( './controls/orbit-controls' );
var Spring = require( './math/spring' );
var createLevel = require( './levels/level' );
var Player = require( './gameplay/player' );
var fbm = require( './math/fbm' );

require( './audio/audio' );

var TWO_PI = 2 * Math.PI;

var $ = document.querySelector.bind( document );

function on( el, type, listener ) {
  el.addEventListener( type, listener );
}

function append( parent, el ) {
  parent.appendChild( el );
}

function create( type ) {
  return document.createElement( type || 'div' );
}

function modulo( n, d ) {
  return ( ( n % d ) + d ) % d;
}

function angularDistance( a, b ) {
  return Math.abs( modulo( b - a + Math.PI, TWO_PI ) - Math.PI );
}

var keys = [];
var game = new Game();
game.setSize( window.innerWidth, window.innerHeight );

var container = $( '#g' );
append( container, game.canvas );

var blocks;
var levelRotation = 0;
var levelRadius = 8;
var blockCount = 32;

function createControls() {
  var minAngle = Infinity;
  var min;

  blocks.map(function( block ) {
    var theta = ( block.theta + levelRotation ) % TWO_PI;
    block.position.x = levelRadius * Math.sin( theta );
    block.position.z = levelRadius * Math.cos( theta );
    block.rotation.y = theta;
    block.updateQuaternion();

    block.material.emissive.setRGB( 0, 0, 0 );

    var angle = angularDistance( theta, 0 );
    block.angularDistance = angle;

    if ( angle < minAngle ) {
      minAngle = angle;
      min = block;
    }
  });

  if ( min ) {
    min.material.emissive.setRGB( 0.3, 0.3, 0.3 );
  }
}

var scene;

function reset() {
  scene = game.scene = new Object3D();
  scene.fogDensity = 0.04;

  blocks = createLevel( scene, levelRadius, blockCount );

  var buildings = new Geometry();
  addBoxGeometry( buildings, 1, 2.5, 1 );
  buildings.computeFaceNormals();

  var material = new LambertMaterial({
    color: new Color( 0.8, 0.8, 0.8 ),
    overdraw: 0.5
  });

  var mesh = new Mesh( buildings, material );
  mesh.position.y = 1.25;
  scene.add( mesh );

  var cylinder = createCylinderGeometry( 0, 1, 2.5, 4, 1 );
  var cylinderMesh = new Mesh( cylinder, material );
  cylinderMesh.position.y = 1.25;
  scene.add( cylinderMesh );

  var light = new DirectionalLight( new Color( 1, 0.8, 0.8 ) );
  light.position.set( -4, 4, 5 );
  scene.add( light );

  game.ambient.setRGB( 0.1, 0.3, 0.4 );

  game.camera.position.set( 0, 2, 12 );
  game.camera.lookAt( mesh.position );
  game.camera.position.y = 5;
  game.camera.updateProjectionMatrix();

  new OrbitControls( game.camera );

  var player = new Player();
  player.mesh.position.z = 8.1;
  scene.add( player );
  scene.add( player.mesh );
  game.onUpdate = function( dt ) {
    player.mesh.position.y = (
      Math.max( 2 * Math.cos( game.t / 200 ), 0 ) +
      2 * ( fbm( 0, 8 ) + 1 ) +
      0.01
    );

    levelRotation += dt * 0.8;
    createControls();
  };

  var spring = new Spring( 170, 26 );
  spring.set( cylinderMesh.position );
  scene.add( spring );

  cylinderMesh.update = function() {
    _.assign( cylinderMesh.position, spring.getValues() );
  };

  setInterval(function() {
    spring.to = {
      x: _.randFloatSpread( 16 ),
      z: _.randFloatSpread( 16 )
    };
  }, 1000 );
}

reset();
game.play();

on( window, 'resize', function() {
  game.setSize( window.innerWidth, window.innerHeight );
});

on( document, 'keydown', function( event ) {
  keys[ event.keyCode ] = true;
});

on( document, 'keyup', function( event ) {
  keys[ event.keyCode ] = false;
});
