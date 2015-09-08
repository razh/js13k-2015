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
var createPlaneGeometry = require( './geometry/plane-geometry' );
var OrbitControls = require( './controls/orbit-controls' );
var Spring = require( './math/spring' );

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

var keys = [];
var game = new Game();
game.setSize( window.innerWidth, window.innerHeight );

var container = $( '#g' );
append( container, game.canvas );

var scene;

function reset() {
  scene = game.scene = new Object3D();

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

  var planeGeometry = createPlaneGeometry( 16, 16, 16, 16 );
  planeGeometry.vertices.map(function( vertex ) {
    vertex.y = Math.random();
  });
  planeGeometry.computeFaceNormals();

  var planeMaterial = new LambertMaterial({
    color: new Color( 0.5, 0.5, 0.5 ),
    overdraw: 0.5
  });
  var planeMesh = new Mesh( planeGeometry, planeMaterial );

  scene.add( planeMesh );

  var light = new DirectionalLight( new Color( 1, 0.8, 0.8 ) );
  light.position.set( -4, 4, 5 );
  scene.add( light );

  game.ambient.setRGB( 0.2, 0.2, 0.2 );

  game.camera.position.set( -2, 5, -2 );
  game.camera.lookAt( mesh.position );
  game.camera.updateProjectionMatrix();

  new OrbitControls( game.camera );

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
