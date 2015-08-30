'use strict';

var EPSILON = 1e-4;

function update( dt, x, v, to, k, b ) {
  var a = k * ( to - x ) - b * v;

  var vf = v + a  * dt;
  var xf = x + vf * dt;

  if ( Math.abs( vf - v ) < EPSILON &&
       Math.abs( xf - x ) < EPSILON ) {
    return [ to, 0 ];
  }

  return [ xf, vf ];
}

// Spring for shallow objects.
function Spring( k, b ) {
  this.k = k;
  this.b = b;

  this.state = {};
  this.to = {};
}

Spring.prototype.update = function( dt ) {
  Object.keys( this.state ).map(function( key ) {
    if ( this.to[ key ] !== undefined ) {
      this.state[ key ] = update(
        dt,
        this.state[ key ][ 0 ],
        this.state[ key ][ 1 ],
        this.to[ key ],
        this.k,
        this.b
      );
    }
  }, this );
};

Spring.prototype.set = function( source ) {
  this.state = Object.keys( source ).reduce(function( object, key ) {
    var value = source[ key ];
    if ( isFinite( value ) ) {
      object[ key ] = [ value, 0 ];
    }

    return object;
  }, {} );

  return this;
};

Spring.prototype.getValues = function() {
  var state = this.state;

  return Object.keys( this.to ).reduce(function( object, key ) {
    if ( state[ key ] ) {
      object[ key ] = state[ key ][ 0 ];
    }

    return object;
  }, {} );
};

module.exports = Spring;
