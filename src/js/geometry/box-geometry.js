'use strict';

module.exports = function addBoxGeometry( geometry, width, height, depth, dx, dy, dz ) {
  // Generate building geometry.
  // Origin is at the center of the bottom face.
  dx = dx || 0;
  dy = dy || 0;
  dz = dz || 0;

  var halfWidth = width / 2;
  var halfDepth = depth / 2;

  var vertices = [
    // Counterclockwise from far left.
    // Bottom.
    -halfWidth, 0, -halfDepth,
    -halfWidth, 0,  halfDepth,
    halfWidth,  0,  halfDepth,
    halfWidth,  0, -halfDepth,
    // Top.
    -halfWidth, height, -halfDepth,
    -halfWidth, height,  halfDepth,
    halfWidth,  height,  halfDepth,
    halfWidth,  height, -halfDepth
  ];

  for ( var i = 0, il = vertices.length; i < il; i += 3 ) {
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
    [ 4, 5, 6, 7 ]
  ];

  return geometry.push( vertices, faces );
};
