'use strict';

var Color = require( '../math/color' );
var Vector3 = require( '../math/vector3' );
var _ = require( '../utils' );

var RenderableFace = require( './renderable-face' );
var RenderableQuad = require( './renderable-quad' );
var RenderableSprite = require( './renderable-sprite' );

var Projector = require( './projector' );

var LambertMaterial = require( '../materials/lambert-material' );

function Renderer( options ) {
  options = options || {};

  var _this = this;
  var _renderData, _elements, _lights;
  var _projector = new Projector();

  var _ctx = options.ctx;

  var _canvasWidth;
  var _canvasHeight;
  var _canvasWidthHalf;
  var _canvasHeightHalf;

  var _v0, _v1, _v2, _v3;

  var _v0x, _v0y;
  var _v1x, _v1y;
  var _v2x, _v2y;
  var _v3x, _v3y;

  var _color = new Color();
  var _diffuseColor = new Color();
  var _emissiveColor = new Color();
  var _lightColor = new Color();

  var _ambientLight = options.ambient || new Color();
  var _intensity = 0;
  var _fogDensity;

  var _vector3 = new Vector3();

  if ( !_ctx ) {
    return;
  }

  // Set default line attributes to avoid miters.
  _ctx.lineCap = _ctx.lineJoin = 'round';

  this.info = {
    render: {
      vertices: 0,
      faces: 0,
      quads: 0
    }
  };

  this.clear = function( width, height ) {
    _ctx.clearRect( 0, 0, width, height );
  };

  this.render = function( scene, camera ) {
    _this.info.render.vertices = 0;
    _this.info.render.faces = 0;
    _this.info.render.quads = 0;

    _canvasWidth  = _ctx.canvas.width;
    _canvasHeight = _ctx.canvas.height;
    _canvasWidthHalf = _canvasWidth / 2;
    _canvasHeightHalf = _canvasHeight / 2;

    this.clear( _canvasWidth, _canvasHeight );

    _ctx.save();

    _ctx.setTransform( 1, 0, 0, -1, 0, _canvasHeight );
    _ctx.translate( _canvasWidthHalf, _canvasHeightHalf );

    _renderData = _projector.projectScene( scene, camera );
    _elements = _renderData.elements;
    _lights = _renderData.lights;

    _fogDensity = scene.fogDensity;

    var element, material, overdraw;
    var isQuad;
    for ( var e = 0; e < _elements.length; e++ ) {
      element = _elements[e];
      material = element.material;

      if ( !material || !material.opacity ) {
        continue;
      }

      if ( element instanceof RenderableSprite ) {
        element.x *= _canvasWidthHalf;
        element.y *= _canvasHeightHalf;

        renderSprite( element, material );

      } else if ( element instanceof RenderableFace ) {
        isQuad = element instanceof RenderableQuad;

        _v0 = element.v0;
        _v1 = element.v1;
        _v2 = element.v2;
        if ( isQuad ) {
          _v3 = element.v3;
        }

        if ( -1 > _v0.positionScreen.z || _v0.positionScreen.z > 1 ) { continue; }
        if ( -1 > _v1.positionScreen.z || _v1.positionScreen.z > 1 ) { continue; }
        if ( -1 > _v2.positionScreen.z || _v2.positionScreen.z > 1 ) { continue; }
        if ( isQuad &&
             ( -1 > _v3.positionScreen.z || _v3.positionScreen.z > 1 ) ) {
          continue;
        }

        _v0.positionScreen.x *= _canvasWidthHalf;
        _v0.positionScreen.y *= _canvasHeightHalf;
        _v1.positionScreen.x *= _canvasWidthHalf;
        _v1.positionScreen.y *= _canvasHeightHalf;
        _v2.positionScreen.x *= _canvasWidthHalf;
        _v2.positionScreen.y *= _canvasHeightHalf;

        overdraw = material.overdraw;
        if ( overdraw ) {
          expand( _v0.positionScreen, _v1.positionScreen, overdraw );
          expand( _v1.positionScreen, _v2.positionScreen, overdraw );
          expand( _v2.positionScreen, _v0.positionScreen, overdraw );
        }

        if ( isQuad ) {
          _v3.positionScreen.x *= _canvasWidthHalf;
          _v3.positionScreen.y *= _canvasHeightHalf;

          renderFace( element, material, isQuad, _v0, _v1, _v2, _v3 );
        } else {
          renderFace( element, material, isQuad, _v0, _v1, _v2 );
        }
      }
    }

    _ctx.restore();
  };

  function calculateLight( element, material, color ) {
    var normal = element.normalModel;
    // Cumulative blur intensity of directional lights.
    var intensity = 0;
    var light;
    var amount;
    for ( var l = 0; l < _lights.length; l++ ) {
      light = _lights[l];
      _lightColor.copy( light.color );

      _vector3
        .setFromMatrixPosition( light.matrixWorld )
        .normalize();

      amount = normal.dot( _vector3 );
      if ( amount <= 0 ) {
        continue;
      }

      amount *= light.intensity;

      // Blur filter.
      if ( !material.filter || material.filter.collides( light.filter ) ) {
        intensity += amount;
      }

      color.add( _lightColor.multiplyScalar( amount ) );
    }

    return intensity;
  }

  function renderSprite( element, material ) {
    material.set( _ctx );
    _ctx.beginPath();

    var scaleX = element.scale.x * _canvasWidthHalf;
    var scaleY = element.scale.y * _canvasHeightHalf;

    _ctx.save();

    _ctx.translate( element.x, element.y );
    if ( material.rotation ) {
      _ctx.rotate( material.rotation );
    }
    _ctx.scale( scaleX, scaleY );

    material.draw( _ctx );

    _ctx.restore();
  }

  function renderFace( element, material, isQuad, v0, v1, v2, v3 ) {
    // Set basic properties.
    material.set( _ctx );
    _ctx.beginPath();

    _v0x = v0.positionScreen.x;
    _v0y = v0.positionScreen.y;
    _v1x = v1.positionScreen.x;
    _v1y = v1.positionScreen.y;
    _v2x = v2.positionScreen.x;
    _v2y = v2.positionScreen.y;

    var fogAlpha = 1;
    // Compute fogAlpha.
    if ( _fogDensity ) {
      var w = v0.positionScreen.w + v1.positionScreen.w + v2.positionScreen.w;
      w = isQuad ? ( ( w + v3.positionScreen.w ) / 4 ) : w / 3;
      // w here is clip.w, where gl_FragCoord.w = 1 / clip.w.
      var depth = element.z * w;

      fogAlpha = _.clamp(
        Math.pow( 2, -_fogDensity * _fogDensity * depth * depth / Math.LN2 ),
        0, 1
      );

      if ( !fogAlpha ) {
        return;
      }
    }

    _this.info.render.vertices += isQuad ? 4 : 3;

    if ( isQuad ) {
      _v3x = v3.positionScreen.x;
      _v3y = v3.positionScreen.y;

      drawQuad( _v0x, _v0y, _v1x, _v1y, _v2x, _v2y, _v3x, _v3y );
      _this.info.render.quads++;
    } else {
      drawTriangle( _v0x, _v0y, _v1x, _v1y, _v2x, _v2y );
      _this.info.render.faces++;
    }

    if ( material instanceof LambertMaterial ) {
      _diffuseColor.copy( material.color );
      _emissiveColor.copy( material.emissive );
      _color.copy( _ambientLight );

      _intensity = calculateLight( element, material, _color );

      _color.multiply( _diffuseColor ).add( _emissiveColor );
      material.draw( _ctx, _color, fogAlpha, _intensity );
    } else {
      material.draw( _ctx, fogAlpha );
    }
  }

  function drawTriangle( x0, y0, x1, y1, x2, y2 ) {
    _ctx.moveTo( x0, y0 );
    _ctx.lineTo( x1, y1 );
    _ctx.lineTo( x2, y2 );
    _ctx.lineTo( x0, y0 );
  }

  function drawQuad( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    _ctx.moveTo( x0, y0 );
    _ctx.lineTo( x1, y1 );
    _ctx.lineTo( x2, y2 );
    _ctx.lineTo( x3, y3 );
    _ctx.lineTo( x0, y0 );
  }

  function expand( v0, v1, pixels ) {
    var x = v1.x - v0.x;
    var y = v1.y - v0.y;

    var det = x * x + y * y;
    var idet;

    if ( !det ) {
      return;
    }

    idet = pixels / Math.sqrt( det );

    x *= idet;
    y *= idet;

    v0.x -= x;
    v0.y -= y;
    v1.x += x;
    v1.y += y;
  }
}

module.exports = Renderer;
