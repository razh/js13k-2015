'use strict';

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

var $ = document.querySelector.bind( document );

function on( el, type, listener ) {
  el.addEventListener( type, listener );
}

function append( parent, el ) {
  parent.appendChild( el );
}

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
    diffuse: new Color( 0.5, 0.5, 0.5 ),
    overdraw: 0.5
  });

  var mesh = new Mesh( buildings, material );
  mesh.position.y = 1.25;
  scene.add( mesh );

  var cylinder = createCylinderGeometry( 0, 1, 2.5, 4, 1 );
  var cylinderMesh = new Mesh( cylinder, material );
  cylinderMesh.position.x = 2;
  cylinderMesh.position.y = 1.25;
  scene.add( cylinderMesh );

  var planeGeometry = createPlaneGeometry( 16, 16, 16, 16 );
  planeGeometry.vertices.map(function( vertex ) {
    vertex.y = Math.random();
  });
  planeGeometry.computeFaceNormals();

  var planeMaterial = new LambertMaterial({
    color: new Color( 0.5, 0.5, 0.5 ),
    diffuse: new Color( 0.5, 0.5, 0.5 ),
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
}

reset();
game.play();

on( window, 'resize', function() {
  game.setSize( window.innerWidth, window.innerHeight );
});
