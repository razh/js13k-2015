'use strict';

var Vector3 = require( '../math/vector3' );
var Vector4 = require( '../math/vector4' );

function RenderableVertex() {
  this.position = new Vector3();
  this.positionWorld = new Vector3();
  this.positionScreen = new Vector4();

  this.visible = true;
}

RenderableVertex.prototype.copy = function( vertex ) {
  this.positionWorld.copy( vertex.positionWorld );
  this.positionScreen.copy( vertex.positionScreen );
};

module.exports = RenderableVertex;
