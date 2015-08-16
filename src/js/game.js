'use strict';

var Color = require( './math/color' );
var Object3D = require( './object3d' );
var Camera = require( './camera' );
var Renderer = require( './renderer/renderer' );

function Game( width, height ) {
  this.canvas = document.createElement( 'canvas' );
  this.ctx = this.canvas.getContext( '2d' );

  this.running = false;
  this.pt = 0;
  this.t = 0;

  this.camera = new Camera( 90 );
  this.setSize( width, height );

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
  var dt = this.t - this.pt;
  this.pt = this.t;

  if ( dt > 1e2 ) {
    dt = 1e2;
  }

  dt *= 1e-3;

  if ( this.onUpdate ) {
    this.onUpdate( dt );
  }

  this.scene.children.forEach(function( object ) {
    object.update( dt );
  });
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
