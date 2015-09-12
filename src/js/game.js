'use strict';

var Color = require( './math/color' );
var Object3D = require( './object3d' );
var Camera = require( './camera' );
var Renderer = require( './renderer/renderer' );

var dt = 1 / 60;

function Game() {
  this.canvas = document.createElement( 'canvas' );
  this.ctx = this.canvas.getContext( '2d' );

  this.running = false;
  // Time in milliseconds.
  this.pt = 0;
  this.t = 0;
  // Accumulated time (in seconds).
  this.at = 0;

  this.camera = new Camera();

  this.scene = new Object3D();
  this.ambient = new Color();

  this.renderer = new Renderer({
    ctx: this.ctx,
    ambient: this.ambient
  });

  this.tick = this.tick.bind( this );
  this.onUpdate = null;
}

Game.prototype.tick = function() {
  if ( !this.running ) {
    return;
  }

  this.update();
  this.draw();
  requestAnimationFrame( this.tick );
};

Game.prototype.update = function() {
  this.t = Date.now();
  var frameTime = ( this.t - this.pt ) * 1e-3;
  this.pt = this.t;

  if ( frameTime > 0.25 ) {
    frameTime = 0.25;
  }

  this.at += frameTime;

  while ( this.at >= dt )  {
    if ( this.onUpdate ) {
      this.onUpdate( dt );
    }

    this.scene.children.map(function( object ) {
      object.update( dt );
    });

    this.at -= dt;
  }
};

Game.prototype.draw = function() {
  this.renderer.render( this.scene, this.camera );
};

Game.prototype.play = function() {
  this.running = true;
  this.pt = Date.now();
  requestAnimationFrame( this.tick );
};

Game.prototype.pause = function() {
  this.running = false;
};

Game.prototype.setSize = function( width, height ) {
  this.canvas.width  = width;
  this.canvas.height = height;
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
};

module.exports = Game;
