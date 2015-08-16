'use strict';

/**
 * Based heavily off of the three.js Vector3 class.
 * https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js
 */
function Vector3( x, y, z ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector3.prototype.set = function( x, y, z ) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

Vector3.prototype.add = function( v ) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
};

Vector3.prototype.subVectors = function( a, b ) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  return this;
};

Vector3.prototype.addScalar = function( scalar ) {
  this.x += scalar;
  this.y += scalar;
  this.z += scalar;
  return this;
};

Vector3.prototype.multiplyScalar = function( scalar ) {
  this.x *= scalar;
  this.y *= scalar;
  this.z *= scalar;
  return this;
};

Vector3.prototype.min = function( v ) {
  if ( this.x > v.x ) { this.x = v.x; }
  if ( this.y > v.y ) { this.y = v.y; }
  if ( this.z > v.z ) { this.z = v.z; }
  return this;
};

Vector3.prototype.max = function( v ) {
  if ( this.x < v.x ) { this.x = v.x; }
  if ( this.y < v.y ) { this.y = v.y; }
  if ( this.z < v.z ) { this.z = v.z; }
  return this;
};

Vector3.prototype.negate = function() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z;
  return this;
};

Vector3.prototype.copy = function( v ) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  return this;
};

Vector3.prototype.cross = function( v ) {
  var x = this.x,
      y = this.y,
      z = this.z;

  this.x = y * v.z - z * v.y;
  this.y = z * v.x - x * v.z;
  this.z = x * v.y - y * v.x;

  return this;
};

Vector3.prototype.crossVectors = function( a, b ) {
  var ax = a.x, ay = a.y, az = a.z;
  var bx = b.x, by = b.y, bz = b.z;

  this.x = ay * bz - az * by;
  this.y = az * bx - ax * bz;
  this.z = ax * by - ay * bx;

  return this;
};

Vector3.prototype.dot = function( v ) {
  return this.x * v.x + this.y * v.y + this.z * v.z;
};

Vector3.prototype.lengthSq = function() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
};

Vector3.prototype.length = function() {
  return Math.sqrt( this.lengthSq() );
};

Vector3.prototype.distanceToSquared = function( v ) {
  var dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;

  return dx * dx + dy * dy + dz * dz;
};

Vector3.prototype.distanceTo = function( v ) {
  return Math.sqrt( this.distanceToSquared( v ) );
};

Vector3.prototype.normalize = function() {
  var length = this.length();
  return this.multiplyScalar( length ? 1 / length : 0 );
};

Vector3.prototype.lerp = function( v, alpha ) {
  this.x += ( v.x - this.x ) * alpha;
  this.y += ( v.y - this.y ) * alpha;
  this.z += ( v.z - this.z ) * alpha;

  return this;
};

Vector3.prototype.applyMatrix3 = function( m ) {
  var x = this.x,
      y = this.y,
      z = this.z;

  var e = m.elements;

  this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
  this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
  this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

  return this;
};

Vector3.prototype.applyMatrix4 = function( m ) {
  // input: Matrix4 affine matrix
  var x = this.x,
      y = this.y,
      z = this.z;

  var e = m.elements;

  this.x = e[ 0 ] * x + e[ 4 ] * y + e[  8 ] * z + e[ 12 ];
  this.y = e[ 1 ] * x + e[ 5 ] * y + e[  9 ] * z + e[ 13 ];
  this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];

  return this;
};

Vector3.prototype.applyProjection = function( m ) {
  var x = this.x,
      y = this.y,
      z = this.z;

  var e = m.elements;
  // Perspective divide.
  var d = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

  this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[  8 ] * z + e[ 12 ] ) * d;
  this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[  9 ] * z + e[ 13 ] ) * d;
  this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * d;

  return this;
};

Vector3.prototype.setFromMatrixPosition = function( m ) {
  var e = m.elements;
  this.x = e[ 12 ];
  this.y = e[ 13 ];
  this.z = e[ 14 ];
  return this;
};

Vector3.prototype.applyQuaternion = function( q ) {
  var x = this.x;
  var y = this.y;
  var z = this.z;

  var qx = q.x;
  var qy = q.y;
  var qz = q.z;
  var qw = q.w;

  // calculate quat * vector
  var ix =  qw * x + qy * z - qz * y;
  var iy =  qw * y + qz * x - qx * z;
  var iz =  qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;

  // calculate result * inverse quat
  this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

  return this;
};

Vector3.X = new Vector3( 1, 0, 0 );
Vector3.Y = new Vector3( 0, 1, 0 );
Vector3.Z = new Vector3( 0, 0, 1 );

module.exports = Vector3;
