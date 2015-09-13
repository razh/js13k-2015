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
var addDiamondGeometry = require( './geometry/diamond-geometry' );
var OrbitControls = require( './controls/orbit-controls' );
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

function prepend( parent, el ) {
  parent.insertBefore( el, parent.firstChild );
}

function create( type ) {
  return document.createElement( type || 'div' );
}

function textContent( el, text ) {
  el.textContent = text;
}

function addClass( el, className ) {
  el.classList.add( className );
}

function removeClass( el, className ) {
  el.classList.remove( className );
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

function createDiamond( scene, x, y, z, radius, top, bottom, rotation ) {
  var mesh = new Mesh(
    addDiamondGeometry( new Geometry(), radius, top, bottom, 4 ),
    material
  );

  mesh.position.set( x, y, z );
  mesh.rotation.y = rotation;
  mesh.updateQuaternion();

  scene.add( mesh );

  return mesh;
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
  createDiamond( scene, 0, -2, 0.5, 1.8, 5, 6, 0.2 );
  createDiamond( scene, -2.7, -1.8, -2, 1.5, 2.8, 4, 0.3 );
  createDiamond( scene, 2.3, -2.4, -2.5, 1.7, 4.3, 5, 0.1 );

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

function createButton( el, id, text, action ) {
  var button = create( 'button' );
  button.id = id;
  textContent( button, text );
  on( button, 'click', action );
  prepend( el, button );
  return button;
}

// Create menu.
var menu = create();
menu.id = 'm';
addClass( menu, 'c' );
append( document.body, menu );

function play() {
  game.play();
  addClass( menu, 'h' );
}

function pause() {
  if ( game.running ) {
    game.pause();
    textContent( playButton, 'Continue' );
    removeClass( menu, 'h' );
  }
}

function end() {
  game.pause();
  reset();
}

var playButton = createButton( menu, 'p', 'Play', play );

reset();
play();
removeClass( menu, 'h' );

on( window, 'resize', function() {
  game.setSize( window.innerWidth, window.innerHeight );
});

on( document, 'keydown', function( event ) {
  keys[ event.keyCode ] = true;
});

on( document, 'keyup', function( event ) {
  keys[ event.keyCode ] = false;
});
