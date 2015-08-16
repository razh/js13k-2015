'use strict';

var Vector3 = require( './math/vector3' );
var Matrix4 = require( './math/matrix4' );
var Euler = require( './math/euler' );
var Quaternion = require( './math/quaternion' );

// Temp Vector3.
var vt = new Vector3();

// Temp Quaternion.
var qt = new Quaternion();

// Temp Matrix4.
var mt = new Matrix4();

function Object3D() {
  this.children = [];

  this.position = new Vector3();
  this.rotation = new Euler();
  this.quaternion = new Quaternion();
  this.scale = new Vector3( 1, 1, 1 );

  this.matrix = new Matrix4();
  this.matrixWorld = new Matrix4();

  this.visible = true;
}

Object3D.prototype.add = function( object ) {
  this.children.push( object );
  return this;
};

Object3D.prototype.remove = function( object ) {
  var index = this.children.indexOf( object );
  if ( index > -1 ) {
    this.children.splice( index, 1 );
  }

  return this;
};

Object3D.prototype.update = function() {};

Object3D.prototype.updateMatrix = function() {
  this.matrix.makeRotationFromQuaternion( this.quaternion );
  this.matrix.scale( this.scale );
  this.matrix.setPosition( this.position );
  this.matrixWorld.copy( this.matrix );
  return this;
};

Object3D.prototype.updateQuaternion = function() {
  this.quaternion.setFromEuler( this.rotation );
};

Object3D.prototype.updateRotation = function() {
  this.rotation.setFromQuaternion( this.quaternion );
};

Object3D.prototype.rotateOnAxis = function ( axis, angle ) {
  // rotate object on axis in object space
  // axis is assumed to be normalized
  qt.setFromAxisAngle( axis, angle );
  this.quaternion.multiply( qt );
  return this;
};

Object3D.prototype.rotateX = function( angle ) {
  return this.rotateOnAxis( Vector3.X, angle );
};

Object3D.prototype.rotateY = function( angle ) {
  return this.rotateOnAxis( Vector3.Y, angle );
};

Object3D.prototype.rotateZ = function( angle ) {
  return this.rotateOnAxis( Vector3.Z, angle );
};

Object3D.prototype.translateOnAxis = function( axis, distance ) {
  vt.copy( axis ).applyQuaternion( this.quaternion );
  this.position.add( vt.multiplyScalar( distance ) );
  return this;
};

Object3D.prototype.translateX = function( distance ) {
  return this.translateOnAxis( Vector3.X, distance );
};

Object3D.prototype.translateY = function( distance ) {
  return this.translateOnAxis( Vector3.Y, distance );
};

Object3D.prototype.translateZ = function( distance ) {
  return this.translateOnAxis( Vector3.Z, distance );
};

Object3D.prototype.lookAt = function( vector ) {
  mt.lookAt( vector, this.position, Vector3.Y );
  this.quaternion.setFromRotationMatrix( mt );
};

module.exports = Object3D;
