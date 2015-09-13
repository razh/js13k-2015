'use strict';

module.exports = function addDiamondGeometry(
  geometry,
  radius,
  top,
  bottom,
  sides
) {
  sides = sides || 4;

  var vertices = [
    0, top, 0,
    0, -bottom, 0
  ];

  var faces = [];

  // Reverse order.
  var angle = -2 * Math.PI / sides;
  var offset = 2;

  // Current and previous vertex indices.
  var curr, next;
  for ( var i = 0; i < sides; i++ ) {
    vertices.push( radius * Math.cos( i * angle ) );
    vertices.push( 0 );
    vertices.push( radius * Math.sin( i * angle ) );

    curr = offset + i;
    next = offset + ( ( i + 1 ) % sides );

    // Top.
    faces.push( [ 0, curr, next ] );
    // Bottom.
    faces.push( [ 1, next, curr ] );
  }

  geometry
    .push( vertices, faces )
    .computeFaceNormals();

  return geometry;
};
