'use strict';

var _ = require( '../utils' );
var Sprite = require( '../objects/sprite' );
var SpriteCanvasMaterial = require( '../materials/sprite-canvas-material' );

var spriteMaterial = new SpriteCanvasMaterial();

spriteMaterial.program = function program( ctx ) {
  ctx.fillStyle = '#fff';
  ctx.fillRect( 0, 0, 1, 1 );
};

function createSprite() {
  var sprite = new Sprite( spriteMaterial );

  var theta = 2 * Math.PI * Math.random();
  var u = 2 * Math.random() - 1;
  var v = Math.sqrt( 1 - u * u );

  var radius = 32;

  sprite.position.set(
    radius * v * Math.cos( theta ),
    radius * v * Math.sin( theta ),
    ( radius + _.randFloatSpread( 4 ) ) * u
  );

  sprite.scale.set( 0.2, 0.2, 0.2 );

  return sprite;
}

module.exports = function createSkybox( scene ) {
  var sprites = [];

  for ( var i = 0; i < 96; i++ ) {
    var sprite = createSprite();
    sprites.push( sprite );
    scene.add( sprite );
  }

  return sprites;
};
