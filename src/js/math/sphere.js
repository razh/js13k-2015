'use strict';

var Vector3 = require( './vector3' );

function Sphere( center, radius ) {
  this.center = center || new Vector3();
  this.radius = radius;
}

Sphere.prototype.contains = function( point ) {
  return point.distanceToSquared( this.center ) <= ( this.radius * this.radius );
};

module.exports = Sphere;
