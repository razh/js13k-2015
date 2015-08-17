'use strict';

var Vector3 = require( '../math/vector3' );
var Vector4 = require( '../math/vector4' );
var Matrix3 = require( '../math/matrix3' );
var Matrix4 = require( '../math/matrix4' );
var Box3 = require( '../math/Box3' );

var Quad = require( '../geometry/quad' );

var DirectionalLight = require( '../lights/directional-light' );
var Material = require( '../materials/material' );

var Mesh = require( '../objects/mesh' );
var Sprite = require( '../objects/sprite' );

var RenderableObject = require( './renderable-object' );
var RenderableVertex = require( './renderable-vertex' );
var RenderableFace = require( './renderable-face' );
var RenderableQuad = require( './renderable-quad' );
var RenderableSprite = require( './renderable-sprite' );

function Projector() {
  var _object, _objectCount, _objectPool = [];
  var _vertex, _vertexCount = 0, _vertexPool = [];
  var _face, _faceCount = 0, _facePool = [];
  var _quadCount = 0, _quadPool = [];
  var _sprite, _spriteCount, _spritePool = [];

  var _renderData = { objects: [], lights: [], elements: [] };

  var _vector3 = new Vector3();
  var _vector4 = new Vector4();

  var _clipBox = new Box3(
    new Vector3( -1, -1, -1 ),
    new Vector3(  1,  1,  1 )
  );
  var _boundingBox = new Box3();
  var _points = [];

  var _viewMatrix = new Matrix4();
  var _viewProjectionMatrix = new Matrix4();

  var _modelMatrix;
  var _normalMatrix = new Matrix3();

  function RenderList() {

    function projectVertex( vertex ) {
      var position = vertex.position;
      var positionWorld = vertex.positionWorld;
      var positionScreen = vertex.positionScreen;

      positionWorld.copy( position ).applyMatrix4( _modelMatrix );
      positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

      var invW = 1 / positionScreen.w;

      positionScreen.x *= invW;
      positionScreen.y *= invW;
      positionScreen.z *= invW;

      vertex.visible = -1 <= positionScreen.x && positionScreen.x <= 1 &&
        -1 <= positionScreen.y && positionScreen.y <= 1 &&
        -1 <= positionScreen.z && positionScreen.z <= 1;
    }

    function pushVertex( x, y, z ) {
      _vertex = getNextVertexInPool();
      _vertex.position.set( x, y, z );
      projectVertex( _vertex );
    }

    function checkTriangleVisibility( v0, v1, v2, v3 ) {
      if ( v0.visible || v1.visible || v2.visible || ( v3 && v3.visible ) ) {
        return true;
      }

      _points.length = 0;
      _points[ 0 ] = v0.positionScreen;
      _points[ 1 ] = v1.positionScreen;
      _points[ 2 ] = v2.positionScreen;
      if ( v3 ) {
        _points[ 3 ] = v3.positionScreen;
      }

      return _clipBox.isIntersectionBox(
        _boundingBox.setFromPoints( _points )
      );
    }

    function checkBackfaceCulling( v0, v1, v2 ) {
      return (
        ( v2.positionScreen.x - v0.positionScreen.x ) *
        ( v1.positionScreen.y - v0.positionScreen.y ) -
        ( v2.positionScreen.y - v0.positionScreen.y ) *
        ( v1.positionScreen.x - v0.positionScreen.x )
      ) < 0;
    }

    return {
      pushVertex: pushVertex,
      checkTriangleVisibility: checkTriangleVisibility,
      checkBackfaceCulling: checkBackfaceCulling
    };
  }

  var renderList = new RenderList();

  this.projectScene = function( scene, camera ) {
    _faceCount = 0;
    _quadCount = 0;
    _spriteCount = 0;
    _objectCount = 0;

    camera.updateMatrix();
    _viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
    _viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

    _renderData.objects.length = 0;
    _renderData.elements.length = 0;
    _renderData.lights.length = 0;

    var object;
    var i, il;
    for ( i = 0, il = scene.children.length; i < il; i++ ) {
      object = scene.children[i];
      if ( !object.visible ) {
        continue;
      }

      object.updateMatrix();

      if ( object instanceof DirectionalLight ) {
        _renderData.lights.push( object );
        continue;
      }

      _object = getNextObjectInPool();
      _object.object = object;

      _vector3.setFromMatrixPosition( object.matrixWorld );
      _vector3.applyProjection( _viewProjectionMatrix );
      _object.z = _vector3.z;

      _renderData.objects.push( _object );
    }

    _renderData.objects.sort( painterSort );

    var geometry, material, side;
    var vertices, faces;
    var v, vl;
    var vertex;
    var f, fl;
    var face;
    var isQuad;
    var visible;
    var v0, v1, v2, v3;
    for ( i = 0, il = _renderData.objects.length; i < il; i++ ) {
      object = _renderData.objects[i].object;
      geometry = object.geometry;
      material = object.material;

      if ( !geometry || !material ) {
        continue;
      }

      renderList.setObject( object );
      _modelMatrix = object.matrixWorld;
      _vertexCount = 0;

      if ( object instanceof Mesh ) {
        vertices = geometry.vertices;
        faces = geometry.faces;

        _normalMatrix.getNormalMatrix( _modelMatrix );
        side = material.side;

        for ( v = 0, vl = vertices.length; v < vl; v++ ) {
          vertex = vertices[v];
          renderList.pushVertex( vertex.x, vertex.y, vertex.z );
        }

        for ( f = 0, fl = faces.length; f < fl; f++ ) {
          face = faces[f];
          isQuad = face instanceof Quad;

          v0 = _vertexPool[ face.a ];
          v1 = _vertexPool[ face.b ];
          v2 = _vertexPool[ face.c ];

          if ( isQuad ) {
            v3 = _vertexPool[ face.d ];
          }

          if ( !isQuad && !renderList.checkTriangleVisibility( v0, v1, v2 ) ||
                isQuad && !renderList.checkTriangleVisibility( v0, v1, v2, v3 ) ) {
            continue;
          }

          visible = renderList.checkBackfaceCulling( v0, v1, v2 );

          if ( side !== Material.DoubleSide ) {
            if ( side === Material.FrontSide && !visible ) continue;
            if ( side === Material.BackSide && visible ) continue;
          }

          _face = isQuad ? getNextQuadInPool() : getNextFaceInPool();

          _face.v0.copy( v0 );
          _face.v1.copy( v1 );
          _face.v2.copy( v2 );
          if ( isQuad ) {
            _face.v3.copy( v3 );
          }

          _face.normalModel.copy( face.normal );

          if ( !visible &&
              ( side === Material.BackSide || side === Material.DoubleSide ) ) {
            _face.normalModel.negate();
          }

          _face.normalModel.applyMatrix3( _normalMatrix )
            .normalize();

          _face.color = face.color;
          _face.material = material;

          if ( isQuad ) {
            _face.z = (
              v0.positionScreen.z +
              v1.positionScreen.z +
              v2.positionScreen.z +
              v3.positionScreen.z
            ) / 4;
          } else {
            _face.z = (
              v0.positionScreen.z +
              v1.positionScreen.z +
              v2.positionScreen.z
            ) / 3;
          }

          _renderData.elements.push( _face );
        }
      } else if ( object instanceof Sprite ) {
        _vector4.set(
          _modelMatrix.elements[ 12 ],
          _modelMatrix.elements[ 13 ],
          _modelMatrix.elements[ 14 ],
          1
        ).applyMatrix4( _viewProjectionMatrix );

        var invW = 1 / _vector4.w;

        _vector4.z *= invW;

        if ( -1 <= _vector4.z && _vector4.z <= 1 ) {
          _sprite = getNextSpriteInPool();
          _sprite.x = _vector4.x * invW;
          _sprite.y = _vector4.y * invW;
          _sprite.z = _vector4.z;
          _sprite.object = object;

          _sprite.rotation = object.rotation;

          _sprite.scale.x = object.scale.x *
            Math.abs(
              _sprite.x -
              ( _vector4.x + camera.projectionMatrix.elements[  0 ] ) /
              ( _vector4.w + camera.projectionMatrix.elements[ 12 ] )
            );
          _sprite.scale.y = object.scale.y *
            Math.abs(
              _sprite.y -
              ( _vector4.y + camera.projectionMatrix.elements[  5 ] ) /
              ( _vector4.w + camera.projectionMatrix.elements[ 13 ] )
            );

          _sprite.material = object.material;

          _renderData.elements.push( _sprite );
        }
      }
    }

    _renderData.elements.sort( painterSort );

    return _renderData;
  };

  function getNextObjectInPool() {
    if ( _objectCount === _objectPool.length ) {
      var object = new RenderableObject();
      _objectPool.push( object );
      _objectCount++;
      return object;
    }

    return _objectPool[ _objectCount++ ];
  }

  function getNextVertexInPool() {
    if ( _vertexCount === _vertexPool.length ) {
      var vertex = new RenderableVertex();
      _vertexPool.push( vertex );
      _vertexCount++;
      return vertex;
    }

    return _vertexPool[ _vertexCount++ ];
  }

  function getNextFaceInPool() {
    if ( _faceCount === _facePool.length ) {
      var face = new RenderableFace();
      _facePool.push( face );
      _faceCount++;
      return face;
    }

    return _facePool[ _faceCount++ ];
  }

  function getNextQuadInPool() {
    if ( _quadCount === _quadPool.length ) {
      var quad = new RenderableQuad();
      _quadPool.push( quad );
      _quadCount++;
      return quad;
    }

    return _quadPool[ _quadCount++ ];
  }

  function getNextSpriteInPool() {
    if ( _spriteCount === _spritePool.length ) {
      var sprite = new RenderableSprite();
      _spritePool.push( sprite );
      _spriteCount++;
      return sprite;
    }

    return _spritePool[ _spriteCount++ ];
  }

  function painterSort( a, b ) {
    return b.z - a.z;
  }
}

module.exports = Projector;
