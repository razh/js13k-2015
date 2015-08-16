'use strict';

var Color = require( '../math/color' );
var Vector3 = require( '../math/vector3' );
var RenderableVertex = require( './renderable-vertex' );

function RenderableFace() {
  this.v0 = new RenderableVertex();
  this.v1 = new RenderableVertex();
  this.v2 = new RenderableVertex();

  this.normalModel = new Vector3();

  this.color = new Color();
  this.material = null;

  this.z = 0;
}

module.exports = RenderableFace;
