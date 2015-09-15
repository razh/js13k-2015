'use strict';

var _ = require( './utils' );
var Game = require( './game' );
var Object3D = require( './object3d' );
var Geometry = require( './geometry/geometry' );
var Mesh = require( './objects/mesh' );
var Color = require( './math/color' );
var Vector3 = require( './math/vector3' );
var DirectionalLight = require( './lights/directional-light' );
var LambertMaterial = require( './materials/lambert-material' );
var addDiamondGeometry = require( './geometry/diamond-geometry' );
var createLevel = require( './levels/level' );
var Player = require( './gameplay/player' );
var fbm = require( './math/fbm' );
var colors = require( './gameplay/colors' );
var createSkybox = require( './gameplay/skybox' );
var animate = require( './gameplay/animate' );

var Audio = require( './audio/audio' );

var TWO_PI = 2 * Math.PI;

var $ = document.querySelector.bind( document );

function noop() {}

var _vector = new Vector3();
var _color = new Color();

function on( el, type, listener ) {
  el.addEventListener( type, listener );
}

function off( el, type, listener ) {
  el.removeEventListener( type, listener );
}

function append( parent, el ) {
  parent.appendChild( el );
}

function prepend( parent, el ) {
  parent.insertBefore( el, parent.firstChild );
}

function create( type ) {
  return document.createElement( type || 'div' );
}

function innerHTML( el, html ) {
  el.innerHTML = html;
}

function textContent( el, text ) {
  el.textContent = text;
}

function addClass( el, className ) {
  el.classList.add( className );
}

function removeClass( el, className ) {
  el.classList.remove( className );
}

function modulo( n, d ) {
  return ( ( n % d ) + d ) % d;
}

function angularDistance( a, b ) {
  return Math.abs( modulo( b - a + Math.PI, TWO_PI ) - Math.PI );
}

var keys = [];
var game = new Game();
game.setSize( window.innerWidth, window.innerHeight );

var container = $( '#g' );
append( container, game.canvas );

var blocks;
var levelRotation = 0;
var levelRadius = 8;
var blockCount = 32;

var cameraStartFOV = 10;
var cameraEndFOV = 60;
var cameraStartZ = 32;
var cameraEndZ = 12;
var cameraTarget = new Vector3().copy( Vector3.Y );

var rotationSpeed = Math.PI / 2;
var touchRotationSpeed = 48 * rotationSpeed;
var levelAngularVelocity = 0;
var levelAngularDamping = 3 * Math.PI;

// State.
var lives;
var isFirstPlay = true;
var isCheckingCollisions = false;
var shouldUpdateColor = false;

function createControls() {
  var down = false;
  var px;

  function getX( event ) {
    return ( event.touches && event.touches.length ) ?
      event.touches[0].clientX :
      event.clientX;
  }

  function start( event ) {
    if ( game.running && isCheckingCollisions ) {
      event.preventDefault();
    }

    px = getX( event );
    down = true;
  }

  function move( event ) {
    if ( !down ) {
      return;
    }

    event.preventDefault();

    if ( !isCheckingCollisions ) {
      return;
    }

    var x = getX( event );
    var dx = x - px;
    px = x;
    levelAngularVelocity = dx / window.innerWidth * touchRotationSpeed;
  }

  function end() {
    if ( game.running &&isCheckingCollisions ) {
      event.preventDefault();
    }

    down = false;
  }


  on( document, 'touchstart', start );
  on( document, 'touchmove', move );
  on( document, 'touchend', end );
  on( document, 'mousedown', start );
  on( document, 'mousemove', move );
  on( document, 'mouseup', end );
}

function getClosestBlockAtAngle( angle ) {
  angle = angle || 0;

  var minAngle = Infinity;
  var min;

  blocks.map(function( block ) {
    var theta = ( block.theta + levelRotation ) % TWO_PI;
    block.position.x = levelRadius * Math.sin( theta );
    block.position.z = levelRadius * Math.cos( theta );
    block.rotation.y = theta;
    block.updateQuaternion();

    block.material.emissive.setRGB( 0, 0, 0 );

    var angle = angularDistance( theta, 0 );
    block.angularDistance = angle;

    if ( angle < minAngle ) {
      minAngle = angle;
      min = block;
    }
  });

  return min;
}

function updateBlocks() {
  var min = getClosestBlockAtAngle();

  if ( min ) {
    min.material.emissive.setRGB( 0.3, 0.3, 0.3 );
  }
}

var material = new LambertMaterial({
  color: new Color( 0.8, 0.8, 0.8 ),
  overdraw: 0.5
});

function createDiamond( scene, x, y, z, radius, top, bottom, rotation ) {
  var mesh = new Mesh(
    addDiamondGeometry( new Geometry(), radius, top, bottom, 4 ),
    material
  );

  mesh.position.set( x, y, z );
  mesh.rotation.y = rotation;
  mesh.updateQuaternion();

  scene.add( mesh );

  return mesh;
}

var renderLives = (function() {
  var hearts = create();
  addClass( hearts, 'hts' );
  append( document.body, hearts );

  return function( count ) {
    innerHTML( hearts, '' );

    for ( var i = 0; i < count; i++ ) {
      var heart = create();
      addClass( heart, 'ht' );
      textContent( heart, '\u2665' );
      append( hearts, heart );
    }
  };
})();

var scene;
var player;

createControls();

function reset() {
  lives = 5;
  isCheckingCollisions = !isFirstPlay;
  animate.reset();

  scene = game.scene = new Object3D();
  scene.fogDensity = 0.005;

  blocks = createLevel( scene, levelRadius, blockCount );
  levelRotation = 0;

  // Lights.
  var light = new DirectionalLight( new Color( 1, 0.8, 0.8 ) );
  light.position.set( -4, 4, 5 );
  scene.add( light );

  game.ambient.setRGB( 0.1, 0.3, 0.4 );

  // Camera.
  var camera = game.camera;
  camera.fov = isFirstPlay ? cameraStartFOV : cameraEndFOV;
  camera.position.set( 0, 1, isFirstPlay ? cameraStartZ : cameraEndZ );
  camera.up.x = 0.05;
  cameraTarget.copy( Vector3.Y );
  camera.lookAt( cameraTarget );
  camera.updateProjectionMatrix();

  // Diamonds.
  var diamondCenterY = -2;
  var diamondLeftY = -1.8;
  var diamondRightY = -2.4;
  var diamondCenter = createDiamond( scene, 0, diamondCenterY, 0.5, 1.8, 5, 6, 0.2 );
  var diamondLeft = createDiamond( scene, -2.7, diamondLeftY, -2, 1.5, 2.8, 4, 0.3 );
  var diamondRight = createDiamond( scene, 2.3, diamondRightY, -2.5, 1.7, 4.3, 5, 0.1 );

  // Skybox.
  createSkybox( scene );

  player = new Player();
  player.t = 0;
  player.mesh.position.y = 2 * fbm( 0, 8 ) + 0.01;
  player.mesh.position.z = 8.1;
  scene.add( player );
  scene.add( player.mesh );

  var closestBlock = getClosestBlockAtAngle();
  if ( closestBlock ) {
    player.color( closestBlock.colorIndex() );
  }

  game.onUpdate = function( dt ) {
    animate.update( dt );

    if ( isCheckingCollisions ) {
      if ( keys[ 37 ] || keys[ 65 ] ) {
        levelAngularVelocity = rotationSpeed;
      } else if ( keys[ 39 ] || keys[ 68 ] ) {
        levelAngularVelocity = -rotationSpeed;
      }
    }

    levelRotation += levelAngularVelocity * dt;
    levelAngularVelocity *= 1 - ( levelAngularDamping * dt );

    // Update camera target.
    _vector.copy( cameraTarget );
    _vector.x = -levelAngularVelocity;

    cameraTarget.lerp( _vector, dt );
    camera.lookAt( cameraTarget );

    updateBlocks();
    var closestBlock = getClosestBlockAtAngle();

    player.mesh.position.y += player.velocity * dt;
    player.velocity -= 4 * dt;

    player.mesh.position.y = Math.max(
      player.mesh.position.y,
      closestBlock.y + 0.01
    );

    var isColliding = player.mesh.position.y - 0.02 <= closestBlock.y;

    if ( isColliding ) {
      player.velocity = 4;
    }

    // Check for collisions.
    if ( isCheckingCollisions ) {
      // Check if the right color.
      if ( isColliding ) {
        shouldUpdateColor = true;

        if ( !player.mesh.material.color.equals( closestBlock.material.color ) ) {
          Audio.playError();
          lives--;
        } else {
          var newColorIndex;
          do {
            newColorIndex = _.randInt( 0, colors.length - 1 );
          } while (
            _color
              .fromArray( colors[ newColorIndex ] )
              .equals( closestBlock.material.color )
          );
        }
      }

      if ( shouldUpdateColor && player.velocity < 0 ) {
        player.color( newColorIndex );
        shouldUpdateColor = false;
      }
    }

    var diamondTime = game.t / 1000;
    diamondCenter.position.y = diamondCenterY + 0.2 * Math.cos( diamondTime );
    diamondLeft.position.y = diamondLeftY + 0.1 * Math.cos( 0.8 * diamondTime + 1 );
    diamondRight.position.y = diamondRightY + 0.2 * Math.cos( 0.4 * diamondTime );

    Audio.update( dt );

    renderLives( lives );

    if ( lives <= 0 ) {
      end();
    }
  };
}

function createButton( el, id, text, action ) {
  var button = create( 'button' );
  button.id = id;
  textContent( button, text );
  on( button, 'click', action );
  prepend( el, button );
  return button;
}

// Create menu.
var menu = create();
menu.id = 'm';
addClass( menu, 'c' );
append( document.body, menu );

function start() {
  play();

  if ( !isFirstPlay ) {
    reset();
    animate(function( t ) {
      var emissive = ( ( Math.floor( t * 16 ) % 2 ) < 1 ) ? 0 : 0.5;
      player.mesh.material.emissive.setRGB( emissive, emissive, emissive );
      player.mesh.material.opacity = Math.max( emissive + 0.5, 0.8 );
    }, 3,  function startCollisions() {
      isCheckingCollisions = true;
      shouldUpdateColor = true;
    });
    return;
  }

  animate(function( t ) {
    t = _.smootherstep( t, 0, 1 );

    var camera = game.camera;
    camera.fov = _.lerp( cameraStartFOV, cameraEndFOV, t * t * t );
    camera.position.z = _.lerp( cameraStartZ, cameraEndZ, t );
    camera.updateProjectionMatrix();
  }, 1, function() {
    isFirstPlay = false;
    isCheckingCollisions = true;
    shouldUpdateColor = true;
  });
}

function play() {
  game.play();
  addClass( menu, 'h' );
}

function pause() {
  if ( game.running ) {
    game.pause();
    textContent( playButton, 'Continue' );
    off( playButton, 'click', start );
    on( playButton, 'click', play );
    removeClass( menu, 'h' );
  }
}

function end() {
  game.pause();
  textContent( playButton, 'Restart' );
  off( playButton, 'click', play );
  on( playButton, 'click', start );
  removeClass( menu, 'h' );
  isCheckingCollisions = false;
}

var playButton = createButton( menu, 'p', 'Play', start );

reset();
game.play();

on( window, 'blur', pause );

on( window, 'resize', function() {
  game.setSize( window.innerWidth, window.innerHeight );
  game.draw();
});

on( document, 'keydown', function( event ) {
  keys[ event.keyCode ] = true;
});

on( document, 'keyup', function( event ) {
  keys[ event.keyCode ] = false;

  // Space. Resume.
  if ( event.keyCode === 32 && !isCheckingCollisions ) {
    start();
  }
});
