'use strict';

var Box3 = require( './box3' );
var Vector3 = require( './vector3' );

function Sphere( center, radius ) {
  this.center = center || new Vector3();
  this.radius = radius;
}

Sphere.prototype.contains = function( point ) {
  return point.distanceToSquared( this.center ) <= ( this.radius * this.radius );
};

Sphere.prototype.copy = function( sphere ) {
  this.center.copy( sphere.center );
  this.radius = sphere.radius;
  return this;
};

Sphere.prototype.setFromPoints = (function() {
  var box = new Box3();

  return function( points ) {
    var center = this.center;

    box.setFromPoints( points ).center( center );

    var maxRadiusSq = 0;
    for ( var i = 0, il = points.length; i < il; i++ ) {
      maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );
    }

    this.radius = Math.sqrt( maxRadiusSq );

    return this;
  };
})();

Sphere.prototype.applyMatrix4 = function( matrix ) {
  this.center.applyMatrix4( matrix );
  this.radius *= matrix.getMaxScaleOnAxis();
  return this;
};

module.exports = Sphere;
