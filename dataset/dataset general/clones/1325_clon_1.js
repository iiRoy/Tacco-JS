/*
 * This file contains definitions for musical notes and their frequencies,
 * along with the setup for a Web Audio API synthesizer.
 * It also includes UI and keyboard interaction logic.
 */

// Define fundamental frequencies for musical notes.
// These values represent the standard equal temperament tuning.
var notes = {

	C3 : 130.81 , /* C3 Note */
	CS3 : 138.59 , // C#3 (C sharp 3)
	D3 : 146.83 ,  /* D3 Note */
	DS3 : 155.56 , // D#3
	E3 : 164.81 ,  // E3
	F3 : 174.61 ,  // F3
	FS3 : 185.00 , // F#3
	G3 : 196.00 ,  // G3
	GS3 : 207.65 , // G#3
	A3 : 220.00 ,  // A3 Standard reference
	AS3 : 233.08 , // A#3
	B3 : 246.94 ,  // B3
	C4 : 261.63 ,  // C4 Middle C
	CS4 : 277.18 , // C#4
	D4 : 293.66 ,  // D4
	DS4 : 311.13 , // D#4
	E4 : 329.63 ,  // E4
	F4 : 349.23 ,  // F4
	FS4 : 369.99 , // F#4
	G4 : 392.00 ,  // G4
	GS4 : 415.30 , // G#4
	A4 : 440.00 ,  // A4 Reference
	AS4 : 466.16 , // A#4
	B4 : 493.88 ,  // B4
	C5 : 523.25 ,  // C5
	CS5 : 554.37 , // C#5
	D5 : 587.33 ,  // D5
	DS5 : 622.25 , // D#5
	E5 : 659.25 ,  // E5
	F5 : 698.46    // F5
};

// Prevent text selection on the document, useful for UI interactions.
$( document ) . disableSelection ( ) ;


/*
|-------------------------------------|
|  Web Audio API Signal Chain Setup   |
|-------------------------------------|
*/


// custom node creation for a delay effect
var delayEffectNode = function ( ) {

    // Initialize required Web Audio API nodes for the delay effect
    this . input = context . createGain ( ) ;
    this . output = context . createGain ( ) ;
    this . delay = context . createDelay ( ) ;
    this . feedback = context . createGain ( ) ;
    this . wetLevel = context . createGain ( ) ;

    // Set some initial default values for the delay parameters
    this . delay . delayTime . value = 0.30 ; // Delay time in seconds
    this . feedback . gain . value = 0.10 ;   // Feedback amount (0-1)
    this . wetLevel . gain . value = 0.5 ;    // Mix level of the delayed signal

    // Configure the internal routing for the delay effect
    this . input . connect ( this . delay ) ;        // Input to delay line
    this . input . connect ( this . output ) ;       // Input to dry signal path (parallel to delay)
    this . delay . connect ( this . feedback ) ;     // Delay output to feedback gain
    this . delay . connect ( this . wetLevel ) ;     // Delay output to wet level gain
    this . feedback . connect ( this . delay ) ;     // Feedback path (feedback gain output back to delay input)
    this . wetLevel . connect ( this . output ) ;    // Wet level output to main output

    // Define a 'connect' method for the custom delay node,
    // allowing it to be connected to other Web Audio nodes.
    this . connect = function ( target ) {
       this . output . connect ( target ) ; // Connects the delay's output to a target node
    };
};

// Initialize all necessary Web Audio API nodes for the synthesizer
var context = new webkitAudioContext ( ) ; // Create a new audio context

var oscillatorOneNode = context . createOscillator ( ) ;    // Primary oscillator
var oscillatorOneGainNode = context . createGain ( ) ;      // Gain node for oscillator one

var oscillatorTwoNode = context . createOscillator ( ) ;    // Secondary oscillator
var oscillatorTwoGainNode = context . createGain ( ) ;      // Gain node for oscillator two

var filterNode = context . createBiquadFilter ( ) ;         // Biquad filter for tone shaping

var lfoNode = context . createOscillator ( ) ;              // Low Frequency Oscillator
var lfoGainNode = context . createGain ( ) ;                // Gain node for LFO depth

var envelopeNode = context . createGain ( ) ;               // ADSR envelope controlled gain
var volumeNode = context . createGain ( ) ;                 // Master volume control

var delayNode = new delayEffectNode ( ) ;                   // Custom delay effect node


// Set initial values and types for the audio nodes
oscillatorOneNode . type = "sawtooth" ; // Oscillator one waveform: sawtooth
oscillatorTwoNode . type = "sine" ;     // Oscillator two waveform: sine

oscillatorOneGainNode . gain . value = 0.75 ; // Initial gain for oscillator one
oscillatorTwoGainNode . gain . value = 0.75 ; // Initial gain for oscillator two

lfoNode . type = "sine" ;                   // LFO waveform: sine
lfoNode . frequency . value = 1 ;           // LFO frequency: 1 Hz
lfoNode . start ;                           // Start the LFO (needs a time parameter, but this implicitly starts it immediately)

lfoGainNode . gain . value = 1000 ;         // LFO gain (depth of modulation)

filterNode . type = "lowpass" ;             // Filter type: lowpass
filterNode . frequency . value = 6666 ;     // Filter cutoff frequency
filterNode . Q . value = 10 ;               // Filter Q (resonance)

envelopeNode . gain . value = 0.0 ;         // Envelope initially closed (silent)
volumeNode . gain . value = 0.75 ;          // Master volume


// Connect the audio nodes to form the signal chain
oscillatorOneNode . connect ( oscillatorOneGainNode ) ; // Osc 1 -> Osc 1 Gain
oscillatorOneGainNode . connect ( filterNode ) ;        // Osc 1 Gain -> Filter

oscillatorTwoNode . connect ( oscillatorTwoGainNode ) ; // Osc 2 -> Osc 2 Gain
oscillatorTwoGainNode . connect ( filterNode ) ;        // Osc 2 Gain -> Filter

filterNode . connect ( envelopeNode ) ;                 // Filter -> Envelope
envelopeNode . connect ( delayNode . input ) ;          // Envelope -> Delay Input
delayNode . connect ( volumeNode ) ;                    // Delay Output -> Master Volume

lfoNode . connect ( lfoGainNode ) ;                     // LFO -> LFO Gain
lfoGainNode . connect ( filterNode . frequency ) ;      // LFO Gain -> Filter Frequency (LFO modulates filter cutoff)

volumeNode . connect ( context . destination ) ;        // Master Volume -> Audio Output (speakers)

// Start the oscillators and LFO immediately
oscillatorOneNode . start ( 0 ) ;
oscillatorTwoNode . start ( 0 ) ;
lfoNode . start ( ) ;


// Functions for keyboard interfacing and note control
var updateFrequency = function ( frequency ) {
	oscillatorOneNode . frequency . value = frequency ; // Set frequency for oscillator one
	oscillatorTwoNode . frequency . value = frequency ; // Set frequency for oscillator two
};

var attackTime = 0.001 ; // Initial attack time for the envelope
var decayTime = 0.001 ;  // Initial decay time for the envelope

var startAttack = function ( ) {
	var now = context . currentTime ; // Get current audio context time
	// Ramp the envelope gain to 1.0 (full volume) over the attack time
	envelopeNode . gain . setTargetAtTime ( 1.0 , now , ( attackTime + .001 ) ) ;
	console . log ( 'start note' ) ; // Log note start for debugging
};

var startDecay = function ( ) {
	var now = context . currentTime ; // Get current audio context time
	// Ramp the envelope gain to 0.0 (silent) over the decay time
	envelopeNode . gain . setTargetAtTime ( 0.0 , now , ( decayTime + .001 ) ) ;
	console . log ( 'end note' ) ;   // Log note end for debugging
};


/*
|----------------------------|
|      UI Controls Setup     |
|----------------------------|
*/


// Execute this code once the entire window content has loaded
$( window ) . load ( function ( ) {

  // Oscillators control section
  // ---------------------------

  // Knob for Oscillator One Volume
  $( '#oscillatorOneVolume' ) . knob ( {
    'change' : function ( volume ) {
      // Update oscillator one's gain based on knob value (0-100 mapped to 0-1)
      oscillatorOneGainNode . gain . value = ( volume / 100 ) ;
    }
  } ) ;

  // Knob for Oscillator One Detune
  $( '#oscillatorOneDetune' ) . knob ( {
    'change' : function ( detune ) {
      // Update oscillator one's detune value
      oscillatorOneNode . detune . value = detune ;
    }
  } ) ;

	// Dropdown for Oscillator One Waveform Selection
	$( "#oscillatorOneSelect" ) . change ( function ( ) {
    console . log ( 'Set oscillator one to ' + $( "#oscillatorOneSelect" ) . val ( ) ) ;
    // Set oscillator one's type (e.g., 'sine', 'sawtooth', 'square', 'triangle')
    oscillatorOneNode . type = $( "#oscillatorOneSelect" ) . val ( ) ;
    leftButtonDown = false ; // Reset mouse state
  } ) ;

  // Knob for Oscillator Two Volume
  $( '#oscillatorTwoVolume' ) . knob ( {
    'change' : function ( volume ) {
      // Update oscillator two's gain
      oscillatorTwoGainNode . gain . value = ( volume / 100 ) ;
    }
  } ) ;

  // Knob for Oscillator Two Detune
  $( '#oscillatorTwoDetune' ) . knob ( {
    'change' : function ( detune ) {
      // Update oscillator two's detune value
      oscillatorTwoNode . detune . value = detune ;
    }
  } ) ;

  // Dropdown for Oscillator Two Waveform Selection
  $( "#oscillatorTwoSelect" ) . change ( function ( ) {
    console . log ( 'Set oscillator two to ' + $( "#oscillatorTwoSelect" ) . val ( ) ) ;
    // Set oscillator two's type
    oscillatorTwoNode . type = $( "#oscillatorTwoSelect" ) . val ( ) ;
    leftButtonDown = false ; // Reset mouse state
  } ) ;

  // Filter control section
  // ---------------------

  // Dropdown for Filter Type Selection
  $( "#filterSelect" ) . change ( function ( ) {
    console . log ( 'Set filter to ' + $( "#filterSelect" ) . val ( ) ) ;
    // Set the filter type (e.g., 'lowpass', 'highpass', 'bandpass')
    filterNode . type = $( "#filterSelect" ) . val ( ) ;
    leftButtonDown = false ; // Reset mouse state
  } ) ;

	// Knob for Filter Cutoff Frequency
	$( '#cutoff' ) . knob ( {
		'change' : function ( cutoff ) {
			// Update filter frequency, scaling the knob value
			filterNode . frequency . value = ( cutoff * 200 ) ;
		}
	} ) ;

	// Knob for Filter Resonance (Q)
	$( '#resonance' ) . knob ( {
		'change' : function ( resonance ) {
			// Update filter Q value, scaling the knob value
			filterNode . Q . value = ( resonance / 5 ) ;
		}
	} ) ;

  // LFO (Low Frequency Oscillator) control section
  // ---------------------------------------------

  // Knob for LFO Frequency
  $( '#lfoFrequency' ) . knob ( {
    'change' : function ( frequency ) {
      // Update LFO frequency, scaling the knob value
      lfoNode . frequency . value = ( frequency / 10 ) ;
    }
  } ) ;

  // Knob for LFO Depth (modulation amount)
  $( '#lfoDepth' ) . knob ( {
    'change' : function ( lfoDepth ) {
      // Update LFO gain, scaling the knob value
      lfoGainNode . gain . value = ( lfoDepth * 20 ) ;
    }
  } ) ;

  // Dropdown for LFO Waveform Selection
  $( "#lfoSelect" ) . change ( function ( ) {
    console . log ( 'Set lfo to ' + $( "#lfoSelect" ) . val ( ) ) ;
    // Set LFO waveform type
    lfoNode . type = $( "#lfoSelect" ) . val ( ) ;
    leftButtonDown = false ; // Reset mouse state
  } ) ;

  // Envelope (ADSR) control section
  // -------------------------------

  // Knob for Attack Time
  $( '#attack' ) . knob ( {
    'change' : function ( attack ) {
      // Update attackTime variable, scaling the knob value
      attackTime = ( ( attack ) / 60 ) ;
    }
  } ) ;

  // Knob for Decay Time
  $( '#decay' ) . knob ( {
    'change' : function ( decay ) {
      // Update decayTime variable, scaling the knob value
      decayTime = ( ( decay ) / 60 ) ;
    }
  } ) ;

  // Delay effect control section
  // ----------------------------

	// Knob for Delay Time
	$( '#delay_time' ) . knob ( {
		'change' : function ( time ) {
			// Update delay node's delay time
			delayNode . delay . delayTime . value = ( time / 100 ) ;
		}
	} ) ;

	// Knob for Delay Feedback
	$( '#delay_feedback' ) . knob ( {
		'change' : function ( feedback ) {
			// Update delay node's feedback gain
			delayNode . feedback . gain . value = ( feedback / 100 ) ;
		}
	} ) ;

	// Knob for Delay Wet/Dry Mix Level
	$( '#delay_level' ) . knob ( {
		'change' : function ( level ) {
			// Update delay node's wet level gain
			delayNode . wetLevel . gain . value = ( level / 100 ) ;
		}
	} ) ;

  // Master Volume control section
  // -----------------------------

	// Knob for Master Volume
	$( '#volume' ) . knob ( {
		'change' : function ( volume ) {
			// Update master volume node's gain
			volumeNode . gain . value = ( volume / 100 ) ;
		}
	} ) ;

/*
|------------------------------------|
|       Keyboard Controls Logic      |
|------------------------------------|
*/

  // Variables for keyboard interaction state
  var octaveMultiplier = 1 ;    // Default octave multiplier
  var hold = false ;            // Flag for note sustain
  var leftButtonDown = false ;  // Flag to track if the left mouse button is pressed

  // Dropdown for Octave Control
  $( "#octaveControl" ) . change ( function ( ) {
    console . log ( 'Set lfo to ' + $( "#octaveControl" ) . val ( ) ) ; // Log change
    var octave = $( "#octaveControl" ) . val ( ) ; // Get selected octave value

    // Determine octave multiplier based on selection
    switch ( octave ) {
    case "-2" :
      octaveMultiplier = 0.25 ;
      break ;
    case "-1" :
      octaveMultiplier = 0.5 ;
      break ;
    case "+1" :
      octaveMultiplier = 2 ;
      break ;
    case "+2" :
      octaveMultiplier = 4 ;
      break ;
    default : // Default case for "0" or any other unexpected value
      octaveMultiplier = 1 ;
    }
    leftButtonDown = false ; // Reset mouse state after changing octave
  } ) ;

	// Checkbox for Note Hold/Sustain
	$( '#hold' ) . change ( function ( ) {
    if ( $( this ) . is ( ":checked" ) ) { // If checkbox is checked
      hold = true ; // Enable hold
    } else {
      hold = false ; // Disable hold
      startDecay ( ) ; // Immediately decay any active notes if hold is released
    }
  } ) ;

	// Global mouse down event listener
	$( document ) . mousedown ( function ( ) {
		leftButtonDown = true ; // Set flag when mouse button is pressed
		console . log ( "Mouse down." ) ;
	} ) ;

	// Global mouse up event listener
	$( document ) . mouseup ( function ( ) {
		leftButtonDown = false ; // Clear flag when mouse button is released
		console . log ( "Mouse up." ) ;
	} ) ;


	// Event handler for pressing a 'key' element (simulated piano key)
	$( '.key' ) . mousedown ( function ( ) {
		$( this ) . addClass ( "key_press" ) ; // Add visual 'pressed' style
		var keyID = $( this ) . attr ( 'id' ) ; // Get the ID of the pressed key (e.g., 'C3')
		updateFrequency ( notes [ keyID ] * octaveMultiplier ) ; // Update oscillator frequency
		startAttack ( ) ; // Start the envelope attack phase
	} ) ;

	// Event handler for releasing a 'key' element
	$( '.key' ) . mouseup ( function ( ) {
		$( this ) . removeClass ( "key_press" ) ; // Remove 'pressed' style
		if ( hold == true ) {
			// If hold is active, maintain the note (do nothing)
		} else {
		  startDecay ( ) ; // If hold is off, start the envelope decay phase
		}
	} ) ;

	// Event handler for mouse entering a 'key' element while mouse button is down
	$( '.key' ) . mouseenter ( function ( ) {
		if ( leftButtonDown == true ) { // Only trigger if mouse is currently down
			$( this ) . addClass ( "key_press" ) ; // Add 'pressed' style
			var keyID = $( this ) . attr ( 'id' ) ; // Get key ID
			updateFrequency ( notes [ keyID ] * octaveMultiplier ) ; // Update frequency
			startAttack ( ) ; // Start attack
		};
	} ) ;

	// Event handler for mouse leaving a 'key' element
	$( '.key' ) . mouseleave ( function ( ) {
		$( this ) . removeClass ( "key_press" ) ; // Remove 'pressed' style
		if ( hold == true ) {
			// If hold is active, maintain note
		} else {
		  startDecay ( ) ; // If hold is off, start decay
		}
	} ) ;

} ) ;