'use strict';

function Matrix3() {
  this.elements = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);
}

Matrix3.prototype.set = function (
  n11, n12, n13,
  n21, n22, n23,
  n31, n32, n33
) {
  var te = this.elements;

  te[ 0 ] = n11;
  te[ 3 ] = n12;
  te[ 6 ] = n13;

  te[ 1 ] = n21;
  te[ 4 ] = n22;
  te[ 7 ] = n23;

  te[ 2 ] = n31;
  te[ 5 ] = n32;
  te[ 8 ] = n33;

  return this;
};

Matrix3.prototype.identity = function() {
  this.set(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );

  return this;
};

Matrix3.prototype.multiplyScalar = function( s ) {
  var te = this.elements;

  te[ 0 ] *= s;
  te[ 3 ] *= s;
  te[ 6 ] *= s;

  te[ 1 ] *= s;
  te[ 4 ] *= s;
  te[ 7 ] *= s;

  te[ 2 ] *= s;
  te[ 5 ] *= s;
  te[ 8 ] *= s;

  return this;
};

Matrix3.prototype.getInverse = function( matrix ) {
  // input: Matrix4
  // ( based on http://code.google.com/p/webgl-mjs/ )
  var me = matrix.elements;
  var te = this.elements;

  te[ 0 ] =  me[ 10 ] * me[ 5 ] - me[ 6 ] * me[ 9 ];
  te[ 1 ] = -me[ 10 ] * me[ 1 ] + me[ 2 ] * me[ 9 ];
  te[ 2 ] =  me[  6 ] * me[ 1 ] - me[ 2 ] * me[ 5 ];
  te[ 3 ] = -me[ 10 ] * me[ 4 ] + me[ 6 ] * me[ 8 ];
  te[ 4 ] =  me[ 10 ] * me[ 0 ] - me[ 2 ] * me[ 8 ];
  te[ 5 ] = -me[  6 ] * me[ 0 ] + me[ 2 ] * me[ 4 ];
  te[ 6 ] =  me[  9 ] * me[ 4 ] - me[ 5 ] * me[ 8 ];
  te[ 7 ] = -me[  9 ] * me[ 0 ] + me[ 1 ] * me[ 8 ];
  te[ 8 ] =  me[  5 ] * me[ 0 ] - me[ 1 ] * me[ 4 ];

  var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

  // no inverse
  if ( !det ) {
    this.identity();
    return this;
  }

  this.multiplyScalar( 1 / det );
  return this;
};

Matrix3.prototype.transpose = function() {
  var tmp, m = this.elements;

  tmp = m[ 1 ];
  m[ 1 ] = m[ 3 ];
  m[ 3 ] = tmp;

  tmp = m[ 2 ];
  m[ 2 ] = m[ 6 ];
  m[ 6 ] = tmp;

  tmp = m[ 5 ];
  m[ 5 ] = m[ 7 ];
  m[ 7 ] = tmp;

  return this;
};


Matrix3.prototype.getNormalMatrix = function( m ) {
  // input: Matrix4.
  this.getInverse( m ).transpose();
  return this;
};

module.exports = Matrix3;
