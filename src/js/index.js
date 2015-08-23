'use strict';

var Game = require( './game' );
var Object3D = require( './object3d' );
var Geometry = require( './geometry/geometry' );
var Mesh = require( './objects/mesh' );
var Color = require( './math/color' );
var DirectionalLight = require( './lights/directional-light' );
var LambertGlowMaterial = require( './materials/lambert-glow-material' );
var addBoxGeometry = require( './geometry/box-geometry' );
var OrbitControls = require( './controls/orbit-controls' );

var $ = document.querySelector.bind( document );

var WIDTH = 852;
var HEIGHT = 480;

function append( parent, el ) {
  parent.appendChild( el );
}

var game = new Game(
  Math.min( window.innerWidth,  WIDTH  ),
  Math.min( window.innerHeight, HEIGHT )
);

var container = $( '#g' );
append( container, game.canvas );

var scene;

function reset() {
  scene = game.scene = new Object3D();

  var buildings = new Geometry();
  addBoxGeometry( buildings, 1, 2.5, 1 );
  buildings.computeFaceNormals();

  var material = new LambertGlowMaterial({
    color: new Color( 0.9, 0.9, 0.9 ),
    ambient: new Color( 0.5, 0.5, 0.5 ),
    diffuse: new Color( 0.5, 0.5, 0.5 ),
    overdraw: 1
  });

  var mesh = new Mesh( buildings, material );
  scene.add( mesh );

  var light = new DirectionalLight( new Color( 0.5, 0.5, 0.5 ) );
  light.position.set( -10, 0, 5 );
  scene.add( light );

  game.ambient.setRGB( 0.2, 0.2, 0.2 );

  game.camera.position.set( -2, 5, -2 );
  game.camera.lookAt( mesh.position );
  game.camera.updateProjectionMatrix();

  new OrbitControls( game.camera );
}

reset();
game.play();
