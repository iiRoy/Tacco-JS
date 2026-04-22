const audioPitchData = {
  'C3': 130.81, 'CS3': 138.59, 'D3': 146.83, 'DS3': 155.56, 'E3': 164.81, 'F3': 174.61, 'FS3': 185.00,
  'G3': 196.00, 'GS3': 207.65, 'A3': 220.00, 'AS3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'CS4': 277.18, 'D4': 293.66, 'DS4': 311.13, 'E4': 329.63, 'F4': 349.23, 'FS4': 369.99,
  'G4': 392.00, 'GS4': 415.30, 'A4': 440.00, 'AS4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'CS5': 554.37, 'D5': 587.33, 'DS5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'CS6': 1108.73, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00,
  'C7': 2093.00, 'D7': 2349.32, 'E7': 2637.02, 'F7': 2793.83
};

jQuery(document).on('selectstart', () => false);


// --- Audio Processing Chain Configuration ---

class EchoProcessor {
    constructor(audioContextRef) {
        if (!audioContextRef || typeof audioContextRef.createGain !== 'function') {
            console.error("Invalid AudioContext provided to EchoProcessor.");
            throw new Error("AudioContext required for EchoProcessor.");
        }

        this.inputStage = audioContextRef.createGain();
        this.outputStage = audioContextRef.createGain();
        this.delayUnit = audioContextRef.createDelay();
        this.feedbackLoopGain = audioContextRef.createGain();
        this.wetSignalLevel = audioContextRef.createGain();

        this.delayUnit.delayTime.value = 0.35;
        this.feedbackLoopGain.gain.value = 0.12;
        this.wetSignalLevel.gain.value = 0.45;

        this.inputStage.connect(this.delayUnit);
        this.inputStage.connect(this.outputStage);
        this.delayUnit.connect(this.feedbackLoopGain);
        this.delayUnit.connect(this.wetSignalLevel);
        this.feedbackLoopGain.connect(this.delayUnit);
        this.wetSignalLevel.connect(this.outputStage);

        this.connectTo = (destinationNode) => {
           this.outputStage.connect(destinationNode);
        };
        this.getInput = () => this.inputStage;
    }

    setDelayDuration(durationInSeconds) {
        if (typeof durationInSeconds === 'number' && durationInSeconds >= 0) {
            this.delayUnit.delayTime.value = durationInSeconds;
        } else {
            console.warn("Invalid delay duration provided.");
        }
    }

    setFeedbackAmount(gainValue) {
        if (typeof gainValue === 'number' && gainValue >= 0 && gainValue <= 1) {
            this.feedbackLoopGain.gain.value = gainValue;
        } else {
            console.warn("Invalid feedback gain provided.");
        }
    }

    setWetMixLevel(levelValue) {
        if (typeof levelValue === 'number' && levelValue >= 0 && levelValue <= 1) {
            this.wetSignalLevel.gain.value = levelValue;
        } else {
            console.warn("Invalid wet mix level provided.");
        }
    }
}

const mainAudioContext = new (window.AudioContext || window.webkitAudioContext)();
if (!mainAudioContext) {
    alert("Web Audio API is not supported in this browser.");
    throw new Error("No AudioContext available.");
}

const primaryOscillator = mainAudioContext.createOscillator();
const primaryOscillatorAmplitude = mainAudioContext.createGain();

const secondaryOscillator = mainAudioContext.createOscillator();
const secondaryOscillatorAmplitude = mainAudioContext.createGain();

const toneFilter = mainAudioContext.createBiquadFilter();

const modulationOscillator = mainAudioContext.createOscillator();
const modulationDepthGain = mainAudioContext.createGain();

const amplitudeEnvelope = mainAudioContext.createGain();

const masterOutputVolume = mainAudioContext.createGain();

const spatialDelayUnit = new EchoProcessor(mainAudioContext);

primaryOscillator.type = "sine";
secondaryOscillator.type = "square";
primaryOscillatorAmplitude.gain.value = 0.7;
secondaryOscillatorAmplitude.gain.value = 0.7;

modulationOscillator.type = "triangle";
modulationOscillator.frequency.value = 1.2;
modulationDepthGain.gain.value = 800;

toneFilter.type = "bandpass";
toneFilter.frequency.value = 5500;
toneFilter.Q.value = 8;

amplitudeEnvelope.gain.value = 0.001;
masterOutputVolume.gain.value = 0.8;

primaryOscillator.connect(primaryOscillatorAmplitude);
primaryOscillatorAmplitude.connect(toneFilter);

secondaryOscillator.connect(secondaryOscillatorAmplitude);
secondaryOscillatorAmplitude.connect(toneFilter);

toneFilter.connect(amplitudeEnvelope);
amplitudeEnvelope.connect(spatialDelayUnit.getInput());
spatialDelayUnit.connectTo(masterOutputVolume);

modulationOscillator.connect(modulationDepthGain);
modulationDepthGain.connect(toneFilter.frequency);

masterOutputVolume.connect(mainAudioContext.destination);

primaryOscillator.start(0);
secondaryOscillator.start(0);
modulationOscillator.start(0);

// --- Musical Keyboard Interface Logic ---

const setSynthesizerFrequency = (targetFrequency) => {
    if (typeof targetFrequency !== 'number' || targetFrequency <= 0) {
        console.warn("Attempted to set invalid frequency:", targetFrequency);
        return;
    }
    primaryOscillator.frequency.setValueAtTime(targetFrequency, mainAudioContext.currentTime);
    secondaryOscillator.frequency.setValueAtTime(targetFrequency, mainAudioContext.currentTime);
};

let attackDuration = 0.002;
let releaseDuration = 0.003;

const initiateSoundEnvelope = () => {
    const nowMoment = mainAudioContext.currentTime;
    amplitudeEnvelope.gain.setTargetAtTime(1.0, nowMoment + 0.005, attackDuration + 0.002);
};

const terminateSoundEnvelope = () => {
    const nowMoment = mainAudioContext.currentTime;
    amplitudeEnvelope.gain.setTargetAtTime(0.001, nowMoment, releaseDuration + 0.002);
};


// --- User Interface Controls Initialization ---

jQuery(window).on('load', function() {

  // --- Oscillator Controls ---

  jQuery('#osc1_amplitude_control').knob({
    'change' : function(currentValue) {
      primaryOscillatorAmplitude.gain.value = currentValue * 0.01;
    }
  });

  jQuery('#osc1_detune_control').knob({
    'change' : function(detuneValue) {
      primaryOscillator.detune.value = detuneValue;
    }
  });

	jQuery("#osc1_waveform_selector").on('change', function () {
    primaryOscillator.type = jQuery(this).val();
  });

  jQuery('#osc2_amplitude_control').knob({
    'change' : function(currentValue) {
      secondaryOscillatorAmplitude.gain.value = currentValue * 0.01;
    }
  });

  jQuery('#osc2_detune_control').knob({
    'change' : function(detuneValue) {
      secondaryOscillator.detune.value = detuneValue;
    }
  });

  jQuery("#osc2_waveform_selector").on('change', function () {
    secondaryOscillator.type = jQuery(this).val();
  });

  // --- Filter Controls ---

  jQuery("#filter_type_selector").on('change', function () {
    toneFilter.type = jQuery(this).val();
  });

	jQuery('#filter_cutoff_control').knob({
		'change' : function(freqValue) {
			toneFilter.frequency.value = freqValue * 150;
		}
	});

	jQuery('#filter_resonance_control').knob({
		'change' : function(qValue) {
			toneFilter.Q.value = qValue * 0.2;
		}
	});

  // --- LFO Controls ---

  jQuery('#lfo_speed_control').knob({
    'change' : function(lfoFreq) {
      modulationOscillator.frequency.value = lfoFreq * 0.05;
    }
  });

  jQuery('#lfo_depth_control').knob({
    'change' : function(depthVal) {
      modulationDepthGain.gain.value = depthVal * 25;
    }
  });

  jQuery("#lfo_waveform_selector").on('change', function () {
    modulationOscillator.type = jQuery(this).val();
  });

  // --- Envelope Controls ---

  jQuery('#envelope_attack_control').knob({
    'change' : function(attValue) {
      attackDuration = attValue / 50;
    }
  });

  jQuery('#envelope_release_control').knob({
    'change' : function(relValue) {
      releaseDuration = relValue / 50;
    }
  });

  // --- Delay Controls ---

	jQuery('#delay_time_control').knob({
		'change' : function(timeVal) {
			spatialDelayUnit.setDelayDuration(timeVal * 0.015);
		}
	});

	jQuery('#delay_feedback_control').knob({
		'change' : function(fbValue) {
			spatialDelayUnit.setFeedbackAmount(fbValue * 0.01);
		}
	});

	jQuery('#delay_mix_control').knob({
		'change' : function(mixLevel) {
			spatialDelayUnit.setWetMixLevel(mixLevel * 0.01);
		}
	});

  // --- Master Volume Control ---

	jQuery('#master_volume_control').knob({
		'change' : function(volValue) {
			masterOutputVolume.gain.value = volValue * 0.01;
		}
	});

  // --- Keyboard Interaction Logic ---

  let currentOctaveFactor = 1.0;
  let sustainModeActive = false;
  let isMousePressed = false;

  const octaveMultipliers = new Map([
    ['-2', 0.25],
    ['-1', 0.5],
    ['+1', 2.0],
    ['+2', 4.0]
  ]);

  jQuery("#octave_range_selector").on('change', function () {
    const selectedOctave = jQuery(this).val();
    currentOctaveFactor = octaveMultipliers.get(selectedOctave) || 1.0;
  });

	jQuery('#sustain_toggle').on('change', function() {
    sustainModeActive = jQuery(this).is(":checked");
    if (!sustainModeActive) {
      terminateSoundEnvelope();
    }
  });

	jQuery(document).mousedown(function(){
		isMousePressed = true;
	});

	jQuery(document).mouseup(function(){
		isMousePressed = false;
	});

  const handleKeyPress = (keyElement) => {
    keyElement.addClass("active_key_style");
    const keyIdentifier = keyElement.attr('id');
    const baseFrequency = audioPitchData[keyIdentifier];

    if (baseFrequency) {
      setSynthesizerFrequency(baseFrequency * currentOctaveFactor);
      initiateSoundEnvelope();
    } else {
      console.warn("Unknown key identifier pressed:", keyIdentifier);
    }
  };

  const handleKeyRelease = (keyElement) => {
    keyElement.removeClass("active_key_style");
    if (!sustainModeActive) {
      terminateSoundEnvelope();
    }
  };

	jQuery('.synth_key').mousedown(function(){
		handleKeyPress(jQuery(this));
	});

	jQuery('.synth_key').mouseup(function(){
		handleKeyRelease(jQuery(this));
	});

	jQuery('.synth_key').mouseenter(function(){
		if (isMousePressed) {
			handleKeyPress(jQuery(this));
		}
	});

	jQuery('.synth_key').mouseleave(function(){
		handleKeyRelease(jQuery(this));
	});

});