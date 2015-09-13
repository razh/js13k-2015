'use strict';

var _ = require( '../utils' );

function numericSort( a, b ) {
  return a - b;
}

function removeIndices( array, indices ) {
  indices.sort( numericSort );
  var i = indices.length;
  while ( i-- ) {
    array.splice( indices[i], 1 );
  }
}

var animations = [];

function animate( fn, duration, done ) {
  animations.push( [ fn, duration || 0, 0, done ] );
  return animate;
}

function update( dt ) {
  var removedIndices = [];

  /**
   * Animations are stored as a 4-element array:
   *
   *   [ fn, duration, time, done ]
   *
   * Where:
   *   fn - animation callback function. Receives time as a parameter.
   *   duration - animation duration.
   *   time - elapsed time.
   *   done - done callback.
   */
  var animation;
  var doneCallbacks = [];
  var fn, duration, time, done;
  var i, il;
  for ( i = 0, il = animations.length; i < il; i++ ) {
    animation = animations[i];

    fn = animation[0];
    duration = animation[1];
    time = animation[2] += dt;

    if ( time >= duration ) {
      removedIndices.push( i );

      done = animation[3];
      if ( done ) {
        doneCallbacks.push( done );
      }
    }

    fn( _.clamp( time / duration, 0, 1 ) );
  }

  removeIndices( animations, removedIndices );
  for ( i = 0, il = doneCallbacks.length; i < il; i++ ) {
    doneCallbacks[i]();
  }
}

function reset() {
  animations = [];
}

animate.update = update;
animate.reset = reset;

module.exports = animate;
