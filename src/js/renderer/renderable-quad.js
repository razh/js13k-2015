'use strict';

var _ = require( '../utils' );
var RenderableVertex = require( './renderable-vertex' );
var RenderableFace = require( './renderable-Face' );

function RenderableQuad() {
  RenderableFace.call( this );
  this.v3 = new RenderableVertex();
}

_.extends( RenderableQuad, RenderableFace );

module.exports = RenderableQuad;
