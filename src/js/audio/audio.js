'use strict';

var _ = require( '../utils' );

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var sampleRate = audioContext.sampleRate;

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

var BPM = 140;
var NOTE = 2 * 60 / BPM * 1000;

var N = 1e-3 * NOTE;
var N2 = N / 2;
var N4 = N2 / 2;
var N8 = N4 / 2;

function sine( sample ) {
  return Math.sin( sample * 2  * Math.PI );
}

function createWaveform( noise, decay ) {
  return function waveform( sample, time ) {
    var wave = _.clamp( sine( sample ) + _.randFloatSpread( noise ), -1, 1 );
    var env = Math.exp( -time * decay );
    return wave * env;
  };
}

function bass( sample, time ) {
  var wave = 0.5 * ( sine( sample ) + sine( 0.5 * sample ) );
  var env = Math.exp( -time * 8 );
  return wave * env;
}

var kick = createWaveform( 0.05, 24 );
var snare = createWaveform( 0.8, 16 );

var E3 = toFreq( 52 );

var snareNote = generateAudioBuffer( E3, snare, N2, 0.5 );
// playSound( snareNote );

var kickNote = generateAudioBuffer( toFreq( 28 ), kick, N2 + N8, 1 );
playSound( kickNote );

var bassNote = generateAudioBuffer( toFreq( 32 ), bass, N, 0.5 );
// playSound( bassNote );

var noteNames = [ 'c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b' ];

function toNoteString( note ) {
  var name = noteNames[ note % 12 ];
  var octave = Math.floor( note / 12 ) - 1;
  return name + octave;
}

function generateNotes( fn, duration, volume ) {
  var notes = {};

  // From A1 (21) to A6 (93).
  for ( var i = 21; i <= 93; i++ ) {
    notes[ toNoteString( i ) ] = generateAudioBuffer( toFreq( i ), fn, duration, volume );
  }

  return notes;
}

console.time( 'generate' );
var snares = generateNotes( snare, N4, 0.5 );
var basses = generateNotes( bass, N2, 0.5 );
console.timeEnd( 'generate' );
