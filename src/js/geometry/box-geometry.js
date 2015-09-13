'use strict';

module.exports = function addBoxGeometry( geometry, width, height, depth, dx, dy, dz ) {
  dx = dx || 0;
  dy = dy || 0;
  dz = dz || 0;

  var halfWidth  = width / 2;
  var halfHeight = height / 2;
  var halfDepth  = depth / 2;

  var vertices = [
    // Counterclockwise from far left.
    // Bottom.
    -halfWidth, -halfHeight, -halfDepth,
    -halfWidth, -halfHeight,  halfDepth,
    halfWidth,  -halfHeight,  halfDepth,
    halfWidth,  -halfHeight, -halfDepth,
    // Top.
    -halfWidth, halfHeight, -halfDepth,
    -halfWidth, halfHeight,  halfDepth,
    halfWidth,  halfHeight,  halfDepth,
    halfWidth,  halfHeight, -halfDepth
  ];

  for ( var i = 0; i < vertices.length; i += 3 ) {
    vertices[ i     ] += dx;
    vertices[ i + 1 ] += dy;
    vertices[ i + 2 ] += dz;
  }

  var faces = [
    // Sides.
    [ 0, 1, 5, 4 ],
    [ 1, 2, 6, 5 ],
    [ 2, 3, 7, 6 ],
    [ 3, 0, 4, 7 ],

    // Top.
    [ 4, 5, 6, 7 ],
    // Bottom.
    [ 0, 3, 2, 1 ]
  ];

  geometry
    .push( vertices, faces )
    .computeFaceNormals();

  return geometry;
};
