'use strict';

var Vector3 = require( './vector3' );

// Temp Vector3.
var vt = new Vector3();

function Box3( min, max ) {
  this.min = min || new Vector3(  Infinity,  Infinity,  Infinity );
  this.max = max || new Vector3( -Infinity, -Infinity, -Infinity );
}

Box3.prototype.contains = function( point ) {
  return !( this.min.x > point.x || point.x > this.max.x ||
            this.min.y > point.y || point.y > this.max.y ||
            this.min.z > point.z || point.z > this.max.z );
};

Box3.prototype.isIntersectionBox = function( box ) {
  // using 6 splitting planes to rule out intersections.
  return !( box.max.x < this.min.x || this.max.x < box.min.x ||
            box.max.y < this.min.y || this.max.y < box.min.y ||
            box.max.z < this.min.z || this.max.z < box.min.z );
};

Box3.prototype.expandByPoint = function( point ) {
  this.min.min( point );
  this.max.max( point );
  return this;
};

Box3.prototype.expandByScalar = function( scalar ) {
  this.min.addScalar( -scalar );
  this.max.addScalar( scalar );
  return this;
};

Box3.prototype.makeEmpty = function() {
  this.min.x = this.min.y = this.min.z =  Infinity;
  this.max.x = this.max.y = this.max.z = -Infinity;
  return this;
};

Box3.prototype.setFromPoints = function( points ) {
  this.makeEmpty();

  for ( var i = 0, il = points.length; i < il; i++ ) {
    this.expandByPoint( points[i] );
  }

  return this;
};

// Assumes that the object world matrix has been updated.
Box3.prototype.setFromObject = function( object ) {
  this.makeEmpty();

  var vertices = object.geometry.vertices;
  for ( var i = 0, il = vertices.length; i < il; i++ ) {
    vt.copy( vertices[i] )
      .applyMatrix4( object.matrixWorld );

    this.expandByPoint( vt );
  }

  return this;
};

module.exports = Box3;
