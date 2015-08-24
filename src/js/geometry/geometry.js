'use strict';

var Vector3 = require( '../math/vector3' );

var Face3 = require( './face3' );
var Quad = require( './quad' );

// Temp vectors.
var cb = new Vector3();
var ab = new Vector3();

function Geometry() {
  this.vertices = [];
  this.faces = [];
}

/**
 * Appends the geometry defined by a flat array of vertex data and a 2D array
 * of face indices.
 *
 * faces is an array of vertex indices with the format:
 *
 *   [
 *     // Face.
 *     [ 0, 1, 2 ],
 *     // Quad.
 *     [ 3, 4, 5, 6 ]
 *     // Face.
 *     [ 7, 8, 9 ]
 *   ]
 *
 */
Geometry.prototype.push = function( vertices, faces ) {
  var offset = this.vertices.length;

  var i, il;
  for ( i = 0, il = vertices.length; i < il; i += 3 ) {
    this.vertices.push(
      new Vector3(
        vertices[ i     ],
        vertices[ i + 1 ],
        vertices[ i + 2 ]
      )
    );
  }

  var indices;
  var face;
  for ( i = 0, il = faces.length; i < il; i++ ) {
    indices = faces[i];

    if ( indices.length === 3 ) {
      face = new Face3(
         offset + indices[ 0 ],
         offset + indices[ 1 ],
         offset + indices[ 2 ]
      );
    } else if ( indices.length === 4 ) {
      face = new Quad(
         offset + indices[ 0 ],
         offset + indices[ 1 ],
         offset + indices[ 2 ],
         offset + indices[ 3 ]
      );
    } else {
      continue;
    }

    this.faces.push( face );
  }

  return this;
};

Geometry.prototype.computeFaceNormals = function() {
  var face;
  var vA, vB, vC;
  for ( var f = 0, fl = this.faces.length; f < fl; f++ ) {
    face = this.faces[f];

    vA = this.vertices[ face.a ];
    vB = this.vertices[ face.b ];
    vC = this.vertices[ face.c ];

    cb.subVectors( vC, vB );
    ab.subVectors( vA, vB );

    cb.cross( ab ).normalize();
    face.normal.copy( cb );
  }
};

module.exports = Geometry;
