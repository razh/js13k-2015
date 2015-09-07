'use strict';

var Block = require( './block' );

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
