'use strict';

var _ = require( '../utils' );

// Assume a default order of 'XYZ'.
function Euler( x, y, z ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Euler.prototype.setFromQuaternion = function( q ) {
  // q is assumed to be normalized
  // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
  var sqx = q.x * q.x;
  var sqy = q.y * q.y;
  var sqz = q.z * q.z;
  var sqw = q.w * q.w;

  this.x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
  this.y = Math.asin( _.clamp( 2 * ( q.x * q.z + q.y * q.w ), - 1, 1 ) );
  this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );

  return this;
};

module.exports = Euler;
