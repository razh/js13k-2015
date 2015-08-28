'use strict';

var dat = require( 'dat-gui' );
var gui = new dat.GUI();

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
      color.r = value[0] / 255;
      color.g = value[1] / 255;
      color.b = value[2] / 255;
    });
};
