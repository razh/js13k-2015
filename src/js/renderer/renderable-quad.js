'use strict';

var _ = require( '../utils' );
var RenderableVertex = require( './renderable-vertex' );
var RenderableFace = require( './renderable-face' );

function RenderableQuad() {
  RenderableFace.call( this );
  this.v3 = new RenderableVertex();
}

_.inherits( RenderableQuad, RenderableFace );

module.exports = RenderableQuad;
