'use strict';

var Block = require( './block' );
var fbm = require( '../math/fbm' );

/*
  Blocks have the format:

    [ x, y, z, width, depth ]
 */
module.exports = function createLevel( scene, blocks ) {
  blocks.map(function( block ) {
    var blockMesh = new Block( block[3], block[4] );
    blockMesh.position.set( block[0], block[1], block[2] );
    scene.add( blockMesh );
  });
};


module.exports.createCircularLevel = function createCircularLevel( scene, radius, radialSegments ) {
  radialSegments = radialSegments || 1;

  for ( var i = 0; i <= radialSegments; i++ ) {
    var theta = 2 * Math.PI * ( i / radialSegments );

    var x = radius * Math.sin( theta );
    var z = radius * Math.cos( theta );

    var block = new Block( 1, 1 );
    block.position.set( x, 2 * ( fbm( x / 4, z / 4 ) + 1 ), z );
    block.rotation.y = theta;
    block.updateQuaternion();
    scene.add( block );
  }
};
