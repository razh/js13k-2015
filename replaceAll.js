'use strict';

const through = require('through2');

// Map to avoid duplicate keys.
const substitutions = {
  '.aPM': '.applyProjectionMatrix',
  '.aP': '.applyProjection',
  '.uPM': '.updateProjectionMatrix',
  '.m4': '.applyMatrix4',
  '.m3': '.applyMatrix3',
  '.ps': '.positionScreen',
  '.pw': '.positionWorld',
  '.ra': '.rotateOnAxis',
  '.rx': '.rotateX',
  '.ry': '.rotateY',
  '.rz': '.rotateZ',
  '.ta': '.translateOnAxis',
  '.tx': '.translateX',
  '.ty': '.translateY',
  '.tz': '.translateZ',
  '.lA': '.lookAt',
  '.dTS': '.distanceToSquared',
  '.dT': '.distanceTo',
  '.nM': '.getNormalMatrix',
  '.mM': '.multiplyMatrices',
  '.nz': '.normalize',
  '.aa': '.setFromAxisAngle',
  '.gI': '.getInverse',
  '.tr': '.transpose',
  '.cV': '.crossVectors',
  '.mWI': '.matrixWorldInverse',
  '.mW': '.matrixWorld',
  '.mP': '.setFromMatrixPosition',
  '.mRQ': '.makeRotationFromQuaternion',
  '.mQ': '.multiplyQuaternions',
  '.qu': /\.quaternion(?!\w+)/g,
  '.sR': '.setFromRotationMatrix',
  '.sQ': '.setFromQuaternion',
  '.sE': '.setFromEuler',
  '.aQ': '.applyQuaternion',
  '.uQ': '.updateQuaternion',
  '.uR': '.updateRotation',
  '.nm': '.normalModel',
  '.nr': '.normal',
  '.id': '.identity',
  '.mt': '.material',
  '.po': '.position',
  '.ro': '.rotation',
  '.aS': '.addScalar',
  '.mS': '.multiplyScalar',
  '.uM': '.updateMatrix',
  '.rgb': '.setRGB',
  '.fA': '.fromArray',
  '.sV': '.subVectors',
  '.pM': '.projectionMatrix',
  '.mx': /\.matrix(?!\w+)/g,
  '.cFN': '.computeFaceNormals',
  '.ds': /\.distance(?!\w+)/g,
  // Camera.
  '.ca': '.camera',
  '.as': '.aspect',
  // Render data.
  'ls': /lights(?!\w+)/g,
  'os': /objects(?!\w+)/g,
  // Render list.
  'sO': 'setObject',
  'cTV': 'checkTriangleVisibility',
  'cBC': 'checkBackfaceCulling',
  'pV': 'pushVertex',
  // Bounding box.
  '.sFP': '.setFromPoints',
  '.sFO': '.setFromObject',
  '.eP': '.expandByPoint',
  '.iB': '.isIntersectionBox',
  '.eS': '.expandByScalar',
  '.mE': '.makeEmpty',
  '.vi': '.visible',
  '.ge': '.geometry',
  '.ve': '.vertices',
  '.fa': '.faces',
  '.qd': '.quads',
  'el': 'elements',
  '.se': '.scene',
  '.ch': '.children',
  '.rr': '.renderer',
  '.rg': '.running',
  '.ud': /\.update(?!\w+)/g,
  '.cp': '.copy',
  '.mul': /\.multiply(?!\w+)/g,
  '.sP': /\.setPosition(?!\w+)/g,
  '.pS': '.projectScene',
  // Filter properties.
  '.fi': '.filter',
  '.cB': '.categoryBits',
  '.mB': '.maskBits',
  '.grI': '.groupIndex',
  // Material properties.
  'wf': 'wireframe',
  'op': 'opacity',
  'bl': 'blending',
  'ov': 'overdraw',
  // Material sides.
  '.DS': '.DoubleSide',
  '.FS': '.FrontSide',
  '.BS': '.BackSide',
  // Color properties.
  'am': 'ambient',
  'em': 'emissive',
  'tC': 'strokeColor',
  'cr': 'color',
  // Utils.
  '.i': '.inherits',
  // Browserify.
  'NF': 'MODULE_NOT_FOUND',
  'N': 'Cannot find module '
};

// Only for reference rigt now.
const exclude = [
  'fillStyle',
  'strokeStyle',
  'lineWidth',
  'shadowColor',
  'shadowBlur',
  'beginPath',
  'moveTo',
  'lineTo',
  'setTransform',
  'translate',
  'scale',
  'fill',
  'stroke',
  'innerWidth',
  'innerHeight',
  'remove'
];

module.exports = function() {

  function replaceAll(file, encoding, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    try {
      let contents = String(file.contents);

      Object.keys(substitutions).forEach(function(key) {
        const value = substitutions[key];
        const regex = value instanceof RegExp ? value
         : new RegExp(value.replace('.', '\\.'), 'g');
        contents = contents.replace(regex, key);
      });

      file.contents = new Buffer(contents);
    } catch (e) {
      throw new Error();
    }

    this.push(file);
    callback();
  }

  return through.obj(replaceAll);
};
