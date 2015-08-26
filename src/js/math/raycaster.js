'use strict';

var Ray = require( './ray' );

function distanceSort( a, b ) {
  return a.distance - b.distance;
}

function intersectObject( object, raycaster, intersects, recursive ) {
  object.raycast( raycaster, intersects );

  if ( recursive ) {
    var children = object.children;
    for ( var i = 0, l = children.length; i < l; i++ ) {
      intersectObject( children[i], raycaster, intersects, recursive );
    }
  }
}

function Raycaster( origin, direction ) {
  this.ray = new Ray( origin, direction );
}

Raycaster.prototype.intersectObject = function( object, recursive ) {
  var intersects = [];
  intersectObject( object, this, intersects, recursive );
  intersects.sort( distanceSort );
  return intersects;
};

module.exports = Raycaster;
