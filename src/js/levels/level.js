'use strict';

var Block = require( './block' );
var fbm = require( '../math/fbm' );

module.exports = function( scene, radius, radialSegments ) {
  radialSegments = radialSegments || 1;

  for ( var i = 0; i <= radialSegments; i++ ) {
    var theta = 2 * Math.PI * ( i / radialSegments );

    var x = radius * Math.sin( theta );
    var z = radius * Math.cos( theta );

    var block = new Block( 1, 1 );
    block.position.set( x, 2 * ( fbm( x / 4, z / 4 ) + 1 ), z );
    block.rotation.y = theta;
    block.theta = theta;
    block.updateQuaternion();

    scene.add( block );
  }
};
