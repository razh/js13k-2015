'use strict';

var Vector3 = require( './vector3' );

function Ray( origin, direction ) {
  this.origin = origin || new Vector3();
  this.direction = direction || new Vector3();
}

Ray.prototype.at = function( t, optionalTarget ) {
  var result = optionalTarget || new Vector3();
  return result.copy( this.direction )
    .multiplyScalar( t )
    .add( this.origin );
};

Ray.prototype.distanceToPoint = (function() {
  var vector = new Vector3();

  return function( point ) {
    var directionDistance = vector
      .subVectors( point, this.origin )
      .dot( this.direction );

    // Point is behind the ray.
    if ( directionDistance < 0 ) {
      return this.origin.distanceTo( point );
    }

    vector
      .copy( this.direction )
      .multiplyScalar( directionDistance )
      .add( this.origin );

    return vector.distanceTo( point );
  };
})();

Ray.prototype.isIntersectionSphere = function( sphere ) {
  return this.distanceToPoint( sphere.center ) <= sphere.radius;
};

Ray.prototype.intersectTriangle = function() {
  // Compute the offset origin, edges, and normal.
  var diff = new Vector3();
  var edge1 = new Vector3();
  var edge2 = new Vector3();
  var normal = new Vector3();

  return function ( a, b, c, backfaceCulling, optionalTarget ) {
    // From http://www.geometrictools.com/LibMathematics/Intersection/Wm5IntrRay3Triangle3.cpp.
    edge1.subVectors( b, a );
    edge2.subVectors( c, a );
    normal.crossVectors( edge1, edge2 );

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
    var DdN = this.direction.dot( normal );
    var sign;

    if ( DdN > 0 ) {
      if ( backfaceCulling ) {
        return null;
      }
      sign = 1;

    } else if ( DdN < 0 ) {
      sign = -1;
      DdN = -DdN;

    } else {
      return null;
    }

    diff.subVectors( this.origin, a );

    var DdQxE2 = sign * this.direction.dot( edge2.crossVectors( diff, edge2 ) );
    // b1 < 0, no intersection.
    if ( DdQxE2 < 0 ) {
      return null;
    }

    var DdE1xQ = sign * this.direction.dot( edge1.crossVectors( edge1, diff ) );

    // b2 < 0, no intersection/
    if ( DdE1xQ < 0 ) {
      return null;
    }

    // b1 + b2 > 1, no intersection/
    if ( DdQxE2 + DdE1xQ > DdN ) {
      return null;
    }

    // Line intersects triangle, check if ray does.
    var QdN = -sign * diff.dot( normal );
    // t < 0, no intersection.
    if ( QdN < 0 ) {
      return null;
    }

    // Ray intersects triangle.
    return this.at( QdN / DdN, optionalTarget );
  };
}();

Ray.prototype.applyMatrix4 = function( matrix4 ) {
  var origin = this.origin;
  var direction = this.direction;

  direction
    .add( origin )
    .applyMatrix4( matrix4 );

  origin.applyMatrix4( matrix4 );

  direction
    .subVectors( direction, origin )
    .normalize();

  return this;
};

module.exports = Ray;
