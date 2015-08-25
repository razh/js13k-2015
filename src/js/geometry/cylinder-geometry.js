'use strict';

var Face3 = require( './Face3' );
var Geometry = require( './geometry' );
var Vector3 = require( './../math/vector3' );

module.exports = function createCylinderGeometry(
  radiusTop,
  radiusBottom,
  height,
  radialSegments,
  heightSegments,
  openEnded
) {
  radiusTop = radiusTop !== undefined ? radiusTop : 20;
  radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
  height = height !== undefined ? height: 100;

  radialSegments = radialSegments || 8;
  heightSegments = heightSegments || 1;

  openEnded = openEnded || false;

  var halfHeight = height / 2;

  var x;
  var y;
  var vertices = [];
  var geometry = new Geometry();

  for ( y = 0; y <= heightSegments; y++ ) {
    var verticesRow = [];

    var v = y / heightSegments;
    var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

    for ( x = 0; x <= radialSegments; x++ ) {
      var u = x / radialSegments;

      var vertex = new Vector3(
        radius * Math.sin( 2 * Math.PI * u ),
        -v * height + halfHeight,
        radius * Math.cos( 2 * Math.PI * u )
      );

      var index = geometry.vertices.push( vertex ) - 1;
      verticesRow.push( index );
    }

    vertices.push( verticesRow );
  }

  var v0, v1, v2, v3;

  for ( x = 0; x < radialSegments; x++ ) {
    for ( y = 0; y < heightSegments; y++ ) {
      v0 = vertices[ y     ][ x     ];
      v1 = vertices[ y + 1 ][ x     ];
      v2 = vertices[ y + 1 ][ x + 1 ];
      v3 = vertices[ y     ][ x + 1 ];

      geometry.faces.push( new Face3( v0, v1, v3 ) );
      geometry.faces.push( new Face3( v1, v2, v3 ) );
    }
  }

  // Top cap.
  if ( !openEnded && radiusTop ) {
    geometry.vertices.push( new Vector3( 0, halfHeight, 0 ) );

    for ( x = 0; x < radialSegments; x++ ) {
      v0 = vertices[ 0 ][ x     ];
      v1 = vertices[ 0 ][ x + 1 ];
      v2 = geometry.vertices.length - 1;

      geometry.faces.push( new Face3( v0, v1, v2 ) );
    }
  }

  // Bottom cap.
  if ( !openEnded && radiusBottom ) {
    geometry.vertices.push( new Vector3( 0, -halfHeight, 0 ) );

    for ( x = 0; x < radialSegments; x++ ) {
      v0 = vertices[ heightSegments ][ x + 1 ];
      v1 = vertices[ heightSegments ][ x     ];
      v2 = geometry.vertices.length - 1;

      geometry.faces.push( new Face3( v0, v1, v2 ) );
    }
  }

  geometry.computeFaceNormals();

  return geometry;
};
