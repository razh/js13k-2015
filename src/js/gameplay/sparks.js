'use strict';

var Sprite = require( '../objects/sprite' );
var SpriteCanvasMaterial = require( '../materials/sprite-canvas-material' );

var material = new SpriteCanvasMaterial();

material.program = function program( ctx ) {
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#fff';
  ctx.fillRect( 0, 0, 1, 1 );
};

function createSpark() {
  var spark = new Sprite( material );
  spark.scale.set( 0.1, 1, 0.1 );
}

module.exports = function createSparks( scene ) {
  var sparks = [];

  for ( var i = 0; i < 24; i++ ) {
    var spark = createSpark();
    sparks.push( spark );
    scene.add( spark );
  }

  return sparks;
};
