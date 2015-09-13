'use strict';

var _ = require( './utils' );
var Game = require( './game' );
var Object3D = require( './object3d' );
var Geometry = require( './geometry/geometry' );
var Mesh = require( './objects/mesh' );
var Color = require( './math/color' );
var Vector3 = require( './math/vector3' );
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

var material = new LambertMaterial({
  color: new Color( 0.8, 0.8, 0.8 ),
  overdraw: 0.5
});

function addDiamond( scene, x, y, z, width, height, rotation ) {
  rotation = rotation || 0;

  var geometry = createCylinderGeometry( 0, width, height, 4, 1, true );
  var halfHeight = height / 2;

  var topMesh = new Mesh( geometry, material );
  // Add epsilon to avoid rendering errors.
  topMesh.position.set( x, y + halfHeight + 1e-3, z );
  topMesh.rotation.y = rotation;
  topMesh.updateQuaternion();
  scene.add( topMesh );

  var bottomMesh = new Mesh( geometry, material );
  bottomMesh.position.set( x, y - halfHeight, z );
  bottomMesh.rotation.y = rotation;
  bottomMesh.rotation.z = Math.PI;
  bottomMesh.updateQuaternion();
  scene.add( bottomMesh );

  return [ topMesh, bottomMesh ];
}

var scene;

function reset() {
  scene = game.scene = new Object3D();
  scene.fogDensity = 0.005;

  blocks = createLevel( scene, levelRadius, blockCount );

  // Lights.
  var light = new DirectionalLight( new Color( 1, 0.8, 0.8 ) );
  light.position.set( -4, 4, 5 );
  scene.add( light );

  game.ambient.setRGB( 0.1, 0.3, 0.4 );

  // Camera.
  var camera = game.camera;
  camera.fov = 10;
  camera.position.set( 0, 1, 32 );
  camera.up.x = 0.05;
  camera.lookAt( new Vector3( 0, 1, 0 ) );
  camera.updateProjectionMatrix();

  // Diamonds.
  addDiamond( scene, 0, -2, 0.5, 1.8, 5, 0.2 );
  addDiamond( scene, -2.7, -1.8, -2, 1.5, 2.8, 0.3 );
  addDiamond( scene, 2.3, -2.4, -2.5, 1.7, 4.3, 0.1 );

  var player = new Player();
  player.mesh.position.z = 8.1;
  scene.add( player );
  scene.add( player.mesh );
  game.onUpdate = function( dt ) {
    player.mesh.position.y = (
      Math.max( 2 * Math.cos( game.t / 200 ), 0 ) +
      2 * fbm( 0, 8 ) +
      0.01
    );

    levelRotation -= dt * 0.8;
    createControls();
  };
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
