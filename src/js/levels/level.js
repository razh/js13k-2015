'use strict';

var Block = require( './block' );
var fbm = require( '../math/fbm' );

module.exports = function( scene, radius, radialSegments ) {
  radialSegments = radialSegments || 1;

  var blocks = [];

  for ( var i = 0; i < radialSegments; i++ ) {
    var theta = 2 * Math.PI * ( i / radialSegments );

    var x = radius * Math.sin( theta );
    var z = radius * Math.cos( theta );

    var block = new Block( 1.4, 1 );
    var y = 2 * fbm( x, z );
    block.position.set( x, y, z );
    block.y = y;
    block.rotation.y = theta;
    block.theta = theta;
    block.updateQuaternion();

    scene.add( block );
    blocks.push( block );
  }

  return blocks;
};
