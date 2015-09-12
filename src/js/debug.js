'use strict';

var dat = require( 'dat-gui' );
var gui = new dat.GUI();

// Prevent collision with Chrome Dev Tools FPS Meter.
var style = gui.domElement.style;
style.left = 0;
style.right = 'initial';
style.float = 'left';

function round( value, precision ) {
  return parseFloat( value.toFixed( precision ) );
}

exports.color = function( color, name ) {
  name = name || 'color';

  var options = {};

  options[ name ] = [
    color.r * 255,
    color.g * 255,
    color.b * 255
  ];

  gui.addColor( options, name )
    .listen()
    .onChange(function( value ) {
      color.setRGB(
        value[0] / 255,
        value[1] / 255,
        value[2] / 255
      );

      console.log(
        round( color.r, 2 ) + ', ' +
        round( color.g, 2 ) + ', ' +
        round( color.b, 2 )
      );
    });
};

exports.material = function( material ) {
  exports.color( material.color, 'color' );
  exports.color( material.emissive, 'emissive' );
};

exports.vector3 = function( vector, range ) {
  var halfRange = 0.5 * range;
  gui.add( vector, 'x', -halfRange, halfRange );
  gui.add( vector, 'y', -halfRange, halfRange );
  gui.add( vector, 'z', -halfRange, halfRange );
};

exports.light = function( light ) {
  exports.color( light.color, 'color' );
  gui.add( light, 'intensity', 0, 8 );
  exports.vector3( light.position, 16 );
};

exports.spring = function( spring ) {
  gui.add( spring, 'k', 10, 640, 10 );
  gui.add( spring, 'b', 1, 48 );
};

exports.camera = function( camera ) {
  gui.add( camera, 'fov', 10, 120, 10 )
    .listen()
    .onChange(function() {
      camera.updateProjectionMatrix();
    });

  exports.vector3( camera.position, 32 );
};
