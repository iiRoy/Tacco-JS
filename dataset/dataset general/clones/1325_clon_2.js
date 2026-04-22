var toneData = {
  C3: 130.81,
  CS3: 138.59,
  D3: 146.83,
  DS3: 155.56,
  E3: 164.81,
  F3: 174.61,
  FS3: 185.00,
  G3: 196.00,
  GS3: 207.65,
  A3: 220.00,
  AS3: 233.08,
  B3: 246.94,
  C4: 261.63,
  CS4: 277.18,
  D4: 293.66,
  DS4: 311.13,
  E4: 329.63,
  F4: 349.23,
  FS4: 369.99,
  G4: 392.00,
  GS4: 415.30,
  A4: 440.00,
  AS4: 466.16,
  B4: 493.88,
  C5: 523.25,
  CS5: 554.37,
  D5: 587.33,
  DS5: 622.25,
  E5: 659.25,
  F5: 698.46,
};

// Prevent text selection on the document
jQuery(document).off('selectstart').on('selectstart', function() { return false; });


// ------------------------------------
// | Audio Processing Graph Assembly  |
// ------------------------------------


// Constructor for a custom echo processing unit
var echoUnit = function() {
  // Create necessary audio nodes
  this.entryPoint = audioContext.createGain();
  this.exitPoint = audioContext.createGain();
  this.echoComponent = audioContext.createDelay();
  this.recirculator = audioContext.createGain();
  this.mixedSignalLevel = audioContext.createGain();

  // Configure initial settings for the echo unit
  this.echoComponent.delayTime.value = 0.35; // Delay time in seconds
  this.recirculator.gain.value = 0.12; // Feedback amount
  this.mixedSignalLevel.gain.value = 0.55; // Wet/dry mix level

  // Establish internal connections for the echo path
  this.entryPoint.connect(this.echoComponent);
  this.entryPoint.connect(this.exitPoint);
  this.echoComponent.connect(this.recirculator);
  this.echoComponent.connect(this.mixedSignalLevel);
  this.recirculator.connect(this.echoComponent);
  this.mixedSignalLevel.connect(this.exitPoint);

  // Method to connect the echo unit's output to another node
  this.connect = function(destinationNode) {
    this.exitPoint.connect(destinationNode);
  };
};

// Initialize the core audio processing components
var audioContext = new AudioContext();
var primaryWaveGen = audioContext.createOscillator();
var primaryWaveVolume = audioContext.createGain();
var secondaryWaveGen = audioContext.createOscillator();
var secondaryWaveVolume = audioContext.createGain();
var toneFilter = audioContext.createBiquadFilter();
var modulatorOsc = audioContext.createOscillator();
var modulatorDepth = audioContext.createGain();
var amplitudeEnvelope = audioContext.createGain();
var masterVolume = audioContext.createGain();
var echoProcessor = new echoUnit();

// Configure initial parameter values for the audio nodes
primaryWaveGen.type = "saw"; // Sawtooth waveform for the first oscillator
secondaryWaveGen.type = "sinusoidal"; // Sine waveform for the second oscillator
primaryWaveVolume.gain.value = 0.70; // Volume for the primary oscillator
secondaryWaveVolume.gain.value = 0.70; // Volume for the secondary oscillator
modulatorOsc.type = "sinusoidal"; // Sine wave for LFO
modulatorOsc.frequency.value = 1.2; // LFO frequency in Hz
modulatorOsc.start; // This line appears to be a no-op as it's missing parentheses to call the start method.
modulatorDepth.gain.value = 1100; // LFO depth
toneFilter.type = "low_pass"; // Low-pass filter type
toneFilter.frequency.value = 6500; // Filter cutoff frequency in Hz
toneFilter.Q.value = 12; // Filter resonance (Q-factor)
amplitudeEnvelope.gain.value = 0.01; // Initial envelope gain (silent)
masterVolume.gain.value = 0.80; // Overall output volume

// Establish the signal flow connections between audio nodes
primaryWaveGen.connect(primaryWaveVolume);
primaryWaveVolume.connect(toneFilter);
secondaryWaveGen.connect(secondaryWaveVolume);
secondaryWaveVolume.connect(toneFilter);
toneFilter.connect(amplitudeEnvelope);
amplitudeEnvelope.connect(echoProcessor.entryPoint);
echoProcessor.connect(masterVolume);
modulatorOsc.connect(modulatorDepth);
modulatorDepth.connect(toneFilter.frequency);
masterVolume.connect(audioContext.destination);

// Start the continuous operation of oscillators
primaryWaveGen.start(0);
secondaryWaveGen.start(0);
modulatorOsc.start();

// Functions for controlling musical notes
var adjustPitch = function(hertzValue) {
  primaryWaveGen.frequency.value = hertzValue;
  secondaryWaveGen.frequency.value = hertzValue;
};

var onsetDuration = 0.002;
var releaseDuration = 0.002;

var beginSound = function() {
  var currentMoment = audioContext.currentTime;
  amplitudeEnvelope.gain.setTargetAtTime(1.0, currentMoment, (onsetDuration + 0.002));
  console.log('Note initiation detected.');
};

var endSound = function() {
  var currentMoment = audioContext.currentTime;
  amplitudeEnvelope.gain.setTargetAtTime(0.0, currentMoment, (releaseDuration + 0.002));
  console.log('Note termination observed.');
};

// ------------------------------------
// |     Graphical Interface Hooks    |
// ------------------------------------

jQuery(window).on('load', function() {

  // Oscillator controls
  jQuery('#oscillatorOneVolume').knob({
    'change': function(level) {
      primaryWaveVolume.gain.value = (level / 100);
    }
  });

  jQuery('#oscillatorOneDetune').knob({
    'change': function(deviation) {
      primaryWaveGen.detune.value = deviation;
    }
  });

  jQuery("#oscillatorOneSelect").on('change', function() {
    console.log('Primary oscillator set to: ' + jQuery("#oscillatorOneSelect").val());
    primaryWaveGen.type = jQuery("#oscillatorOneSelect").val();
    mouseIsPressed = false;
  });

  jQuery('#oscillatorTwoVolume').knob({
    'change': function(level) {
      secondaryWaveVolume.gain.value = (level / 100);
    }
  });

  jQuery('#oscillatorTwoDetune').knob({
    'change': function(deviation) {
      secondaryWaveGen.detune.value = deviation;
    }
  });

  jQuery("#oscillatorTwoSelect").on('change', function() {
    console.log('Secondary oscillator set to: ' + jQuery("#oscillatorTwoSelect").val());
    secondaryWaveGen.type = jQuery("#oscillatorTwoSelect").val();
    mouseIsPressed = false;
  });

  // Filter controls
  jQuery("#filterSelect").on('change', function() {
    console.log('Filter type set to: ' + jQuery("#filterSelect").val());
    toneFilter.type = jQuery("#filterSelect").val();
    mouseIsPressed = false;
  });

  jQuery('#cutoff').knob({
    'change': function(frequencyLimit) {
      toneFilter.frequency.value = (frequencyLimit * 205);
    }
  });

  jQuery('#resonance').knob({
    'change': function(qFactor) {
      toneFilter.Q.value = (qFactor / 4.5);
    }
  });

  // LFO controls
  jQuery('#lfoFrequency').knob({
    'change': function(rate) {
      modulatorOsc.frequency.value = (rate / 11);
    }
  });

  jQuery('#lfoDepth').knob({
    'change': function(intensity) {
      modulatorDepth.gain.value = (intensity * 21);
    }
  });

  jQuery("#lfoSelect").on('change', function() {
    console.log('LFO waveform set to: ' + jQuery("#lfoSelect").val());
    modulatorOsc.type = jQuery("#lfoSelect").val();
    mouseIsPressed = false;
  });

  // Envelope controls
  jQuery('#attack').knob({
    'change': function(attackValue) {
      onsetDuration = ((attackValue) / 62);
    }
  });

  jQuery('#decay').knob({
    'change': function(decayValue) {
      releaseDuration = ((decayValue) / 62);
    }
  });

  // Delay controls
  jQuery('#delay_time').knob({
    'change': function(duration) {
      echoProcessor.echoComponent.delayTime.value = (duration / 100);
    }
  });

  jQuery('#delay_feedback').knob({
    'change': function(feedbackAmount) {
      echoProcessor.recirculator.gain.value = (feedbackAmount / 100);
    }
  });

  jQuery('#delay_level').knob({
    'change': function(mixLevel) {
      echoProcessor.mixedSignalLevel.gain.value = (mixLevel / 100);
    }
  });

  // Master volume control
  jQuery('#volume').knob({
    'change': function(masterLevel) {
      masterVolume.gain.value = (masterLevel / 100);
    }
  });

  // ------------------------------------
  // |  Musical Keyboard Interactions   |
  // ------------------------------------

  var pitchShiftFactor = 1;
  var sustainActive = false;
  var mouseIsPressed = false;

  jQuery("#octaveControl").on('change', function() {
    console.log('Octave modifier set to: ' + jQuery("#octaveControl").val());
    var octaveSetting = jQuery("#octaveControl").val();
    switch (octaveSetting) {
      case "-2":
        pitchShiftFactor = 0.24;
        break;
      case "-1":
        pitchShiftFactor = 0.48;
        break;
      case "+1":
        pitchShiftFactor = 2.05;
        break;
      case "+2":
        pitchShiftFactor = 4.1;
        break;
      default:
        pitchShiftFactor = 1.0;
    }
    mouseIsPressed = false;
  });

  jQuery('#sustain').on('change', function() {
    if (jQuery(this).prop("checked")) {
      sustainActive = true;
    } else {
      sustainActive = false;
      endSound();
    }
  });

  jQuery(document).on('mousedown', function() {
    mouseIsPressed = true;
    console.log("Mouse button depressed.");
  });

  jQuery(document).on('mouseup', function() {
    mouseIsPressed = false;
    console.log("Mouse button released.");
  });


  jQuery('.key').on('mousedown', function() {
    jQuery(this).addClass("depressed_key");
    var pressedKeyIdentifier = jQuery(this).attr('id');
    adjustPitch(toneData[pressedKeyIdentifier] * pitchShiftFactor);
    beginSound();
  });

  jQuery('.key').on('mouseup', function() {
    jQuery(this).removeClass("depressed_key");
    if (sustainActive === true) {
      // Continue holding the note
    } else {
      endSound();
    }
  });

  jQuery('.key').on('mouseenter', function() {
    if (mouseIsPressed === true) {
      jQuery(this).addClass("depressed_key");
      var pressedKeyIdentifier = jQuery(this).attr('id');
      adjustPitch(toneData[pressedKeyIdentifier] * pitchShiftFactor);
      beginSound();
    }
  });

  jQuery('.key').on('mouseleave', function() {
    jQuery(this).removeClass("depressed_key");
    if (sustainActive === true) {
      // Continue holding the note
    } else {
      endSound();
    }
  });

});