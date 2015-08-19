'use strict';

var Game = require( './game' );
var Object3D = require( './object3d' );

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
}

reset();
game.play();
