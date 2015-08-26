'use strict';

var _ = require( '../utils' );
var Vector3 = require( '../math/vector3' );
var Quaternion = require( '../math/quaternion' );

Quaternion.prototype.length = function() {
  return Math.sqrt(
    this.x * this.x +
    this.y * this.y +
    this.z * this.z +
    this.w * this.w
  );
};

Quaternion.prototype.normalize = function() {
  var l = this.length();

  if ( !l ) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
  } else {
    l = 1 / l;
    this.x = this.x * l;
    this.y = this.y * l;
    this.z = this.z * l;
    this.w = this.w * l;
  }

  return this;
};

Quaternion.prototype.setFromUnitVector = function( vector ) {
  // http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final
  // assumes direction vectors vFrom and vTo are normalized
  var v1 = new Vector3(), r;

  r = vector.dot( vector ) + 1;
  v1.crossVectors( vector, vector );

  this.x = v1.x;
  this.y = v1.y;
  this.z = v1.z;
  this.w = r;

  this.normalize();

  return this;
};

Quaternion.prototype.clone = function() {
  return new Quaternion( this.x, this.y, this.z, this.w );
};

Quaternion.prototype.conjugate = function() {
  this.x *= -1;
  this.y *= -1;
  this.z *= -1;
  return this;
};

Quaternion.prototype.inverse = function() {
  this.conjugate().normalize();
  return this;
};


function OrbitControls( object ) {
  this.object = object;
  this.target = new Vector3();

  var rotateSpeed = 1;

  var offset = new Vector3();

  var mouse = {
    x: 0,
    y: 0,

    down: false
  };

  var phiDelta = 0;
  var thetaDelta = 0;
  var scale = 1;
  var dollyRate = 0.98;

  var EPSILON = 1e-6;

  // so camera.up is the orbit axis.
  var quat = new Quaternion().setFromUnitVector( Vector3.Y );
  var quatInverse = quat.clone().inverse();

  this.update = function() {
    var position = this.object.position;

    offset.subVectors( position, this.target );

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion( quat );

    // angle from z-axis around y-axis
    var theta = Math.atan2( offset.x, offset.z );

    // angle from y-axis
    var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

    theta += thetaDelta;
    phi += phiDelta;

    // restrict phi to be betwee EPS and PI-EPS
    phi = _.clamp( phi, EPSILON, Math.PI - EPSILON );

    var radius = offset.length() * scale;

    offset.x = radius * Math.sin( phi ) * Math.sin( theta );
    offset.y = radius * Math.cos( phi );
    offset.z = radius * Math.sin( phi ) * Math.cos( theta );

    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion( quatInverse );

    position.copy( this.target ).add( offset );

    this.object.lookAt( this.target );

    thetaDelta = 0;
    phiDelta = 0;
    scale = 1;
  };

  function rotateX( angle ) {
    thetaDelta -= angle;
  }

  function rotateY( angle ) {
    phiDelta -= angle;
  }

  this.onMouseDown = function( event ) {
    mouse.down = true;

    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }.bind( this );

  this.onMouseMove = function( event ) {
    if ( !mouse.down ) {
      return;
    }

    var x = event.clientX;
    var y = event.clientY;

    var dx = x - mouse.x;
    var dy = y - mouse.y;

    mouse.x = x;
    mouse.y = y;

    // rotating across whole screen goes 360 degrees around
    rotateX( 2 * Math.PI * dx / window.innerWidth  * rotateSpeed );

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    rotateY( 2 * Math.PI * dy / window.innerHeight * rotateSpeed );

    this.update();
  }.bind( this );

  this.onMouseUp = function() {
    mouse.down = false;
  }.bind( this );

  this.onScroll = function( event ) {
    var deltaY = event.deltaY;
    if ( !deltaY ) {
      return;
    }

    event.preventDefault();

    if ( deltaY > 0 ) {
      scale /= dollyRate;
    } else {
      scale *= dollyRate;
    }

    this.update();
  }.bind( this );

  document.addEventListener( 'mousedown', this.onMouseDown );
  document.addEventListener( 'mousemove', this.onMouseMove );
  document.addEventListener( 'mouseup', this.onMouseUp );
  window.addEventListener( 'wheel', this.onScroll );

  this.update();
}

module.exports = OrbitControls;
