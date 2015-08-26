'use strict';

var _ = require( '../utils' );
var Filter = require( '../math/filter' );
var Matrix4 = require( '../math/matrix4' );
var Object3D = require( '../object3d' );
var Ray = require( '../math/ray' );
var Sphere = require( '../math/sphere' );
var Vector3 = require( '../math/vector3' );

function Mesh( geometry, material ) {
  Object3D.call( this );

  this.geometry = geometry;
  this.material = material;

  this.filter = new Filter();
}

_.inherits( Mesh, Object3D );

Mesh.prototype.raycast = (function() {
  var inverseMatrix = new Matrix4();
  var ray = new Ray();
  var sphere = new Sphere();

  var vA = new Vector3();
  var vB = new Vector3();
  var vC = new Vector3();

  return function( raycaster, intersects ) {
    var geometry = this.geometry;

    if ( !geometry.boundingSphere ) {
      geometry.computeBoundingSphere();
    }

    sphere.copy( geometry.boundingSphere );
    sphere.applyMatrix4( this.matrixWorld );

    if ( !raycaster.ray.isIntersectionSphere( sphere ) ) {
      return;
    }

    var a, b, c;
    var vertices = geometry.vertices;
    var faces = geometry.faces;

    for ( var f = 0, fl = faces.length; f < fl; f++ ) {
      var face = geometry.faces[f];
    }
  }
})();

module.exports = Mesh;
