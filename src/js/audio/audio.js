'use strict';

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var sampleRate = audioContext.sampleRate;

// Lower sample rate for distortion effect.
// Detect lowest desired sample rate (Safari does not implement below 22050).
try {
  audioContext.createBuffer( 1, 1, sampleRate / 14 );
  sampleRate /= 14;
} catch (error) {
  sampleRate = 22050;
}

function toFreq( note ) {
  // A4 is 69.
  return Math.pow( 2, ( note - 69 ) / 12 ) * 440;
}

// delay is in seconds.
function playSound( sound, delay ) {
  var source = audioContext.createBufferSource();
  source.buffer = sound;
  source.connect( audioContext.destination );
  source.start( delay ? audioContext.currentTime + delay : 0 );
}

// duration is in seconds.
function generateAudioBuffer( freq, fn, duration, volume ) {
  var length = duration * sampleRate;

  var buffer = audioContext.createBuffer( 1, length, sampleRate );
  var channel = buffer.getChannelData(0);
  for ( var i = 0; i < length; i++ ) {
    channel[i] = fn( freq * i / sampleRate, i / length ) * volume;
  }

  return buffer;
}

var BPM = 90;
var NOTE = 2 * 60 / BPM * 1000;

var N = 1e-3 * NOTE;
var N2 = N / 2;
var N4 = N2 / 2;
var N8 = N4 / 2;

var B1 = N8;
var B2 = N4;
var B3 = N4 + N8;
var B4 = N2;
var B5 = N2 + N8;
var B6 = N2 + N4;
var B7 = N2 + N4 + N8;

function sine( sample ) {
  return Math.sin( sample * 2  * Math.PI );
}

function bass( sample, time ) {
  var wave = 0.5 * ( sine( sample ) + sine( 0.5 * sample ) );
  var env = Math.exp( -time * 8 );
  return wave * env;
}

var noteNames = [ 'c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b' ];

function toNoteString( note ) {
  var name = noteNames[ note % 12 ];
  var octave = Math.floor( note / 12 ) - 1;
  return name + octave;
}

function generateNotes( fn, duration, volume ) {
  var notes = {};

  function createNoteProperty( note ) {
    var sound;

    var descriptor = {
      get: function() {
        if ( !sound ) {
          sound = generateAudioBuffer( toFreq( note ), fn, duration, volume );
        }

        return sound;
      }
    };

    Object.defineProperty( notes, note, descriptor );
    Object.defineProperty( notes, toNoteString( note ), descriptor );
  }

  // From A1 (21) to A7 (105).
  for ( var i = 21; i <= 105; i++ ) {
    createNoteProperty( i );
  }

  return notes;
}

var synths = generateNotes( bass, N, 0.1 );

function playNotes( sounds, bars, barDuration ) {
  bars( sounds ).map(function( bar, barIndex ) {
    var barDelay = barIndex * barDuration;
    for ( var i = 0; i < bar.length; i += 2 ) {
      var note = bar[ i ];
      var delay = bar[ i + 1 ];
      playSound( note, barDelay + delay );
    }
  });
}

function playMaj7( _, note ) {
  var octave = note + 24;

  return [
    _[ note      ], 0,
    _[ note +  4 ], B1,
    _[ note +  7 ], B2,
    _[ note + 11 ], B3,
    _[ note + 12 ], B4,
    _[ note + 11 ], B5,
    _[ note +  7 ], B6,
    _[ note +  4 ], B7,

    _[ octave      ], 0,
    // _[ octave +  4 ], B1,
    _[ octave +  7 ], B2,
    // _[ octave + 11 ], B3,
    _[ octave + 12 ], B4,
    // _[ octave + 11 ], B5,
    _[ octave +  7 ], B6,
    // _[ octave +  4 ], B7
  ];
}

function playMin7( _, note ) {
  var octave = note + 24;

  return [
    _[ note      ], 0,
    _[ note +  3 ], B1,
    _[ note +  7 ], B2,
    _[ note + 10 ], B3,
    _[ note + 12 ], B4,
    _[ note + 10 ], B5,
    _[ note +  7 ], B6,
    _[ note +  3 ], B7,

    _[ octave      ], 0,
    // _[ octave +  3 ], B1,
    _[ octave +  7 ], B2,
    // _[ octave + 10 ], B3,
    _[ octave + 12 ], B4,
    // _[ octave + 10 ], B5,
    _[ octave +  7 ], B6,
    // _[ octave +  3 ], B7
  ];
}

function playMaj( _, note ) {
  var octave = note + 24;

  return [
    _[ note      ], 0,
    _[ note +  4 ], B1,
    _[ note +  7 ], B2,
    _[ note + 12 ], B3,
    _[ note + 16 ], B4,
    _[ note + 12 ], B5,
    _[ note + 12 ], B6,
    _[ note +  7 ], B7,

    _[ octave      ], 0,
    // _[ octave +  4 ], B1,
    _[ octave +  7 ], B2,
    // _[ octave + 12 ], B3,
    _[ octave + 16 ], B4,
    // _[ octave + 12 ], B5,
    _[ octave +  7 ], B6,
    // _[ octave +  4 ], B7
  ];
}

var bar = 0;

function playAll( ) {
  playNotes( synths, function( _ ) {
    return [
      [
        // C4.
        playMaj7( _, 60 ),
        playMaj7( _, 60 ),
        // A3.
        playMin7( _, 57 ),
        playMin7( _, 57 ),
        // F3.
        playMaj7( _, 53 ),
        playMaj7( _, 53 ),
        // D4.
        playMin7( _, 62 ),
        playMin7( _, 62 ),

        // C4.
        playMaj7( _, 60 ),
        playMaj7( _, 60 ),
        // F3.
        playMaj7( _, 53 ),
        playMaj7( _, 53 ),
        // D4.
        playMin7( _, 62 ),
        playMin7( _, 62 ),
        // G3.
        playMaj( _, 55 ),
        playMaj( _, 55 )
      ][ bar ]
    ];
  }, N );
}

var time = 0;

playAll();

module.exports = {
  update: function( dt ) {
    time += dt * 1e3;

    if ( time >= NOTE ) {
      bar = ( bar + 1 ) % 16;
      playAll();
      time = 0;
    }
  },

  reset: function() {
    bar = 0;
    time = 0;
  },

  playError: function() {
    playNotes( synths, function( _ ) {
      return [
        playMin7( _, 33 ),
      ];
    }, N );
  }
};
