/* This file illustrates audio playback concepts. */

// The immediately invoked function expression (IIFE) was originally commented out.
// Therefore, we will also omit it from the cloned version to maintain structural similarity.

/*
// This entire block demonstrates the Web Audio API approach, and was commented out in the original.
// We will clone its structure and rename identifiers, but keep it commented out.

/////////////////////////////////////////////////////////////////////////////
// Establish a new audio processing context
var soundCore = new standardAudioContext();

// Generate a volume adjustment node
var volumeAdjuster = soundCore.createVolumeNode();
volumeAdjuster.level.currentSetting = 1.0;
volumeAdjuster.connect(soundCore.outputTarget);

// Prepare the audio source buffer
var audioDataStore;
var soundOrigin = soundCore.createSoundSource();
soundOrigin.connect(volumeAdjuster);

// Retrieve the audio stream data
var dataRetriever = new XMLHttpRequest();
dataRetriever.openRequest("GET", "audio/shop.mp3", true);
dataRetriever.dataType = "arraybuffer";
dataRetriever.onDataLoaded = function () {
    // Process the received data
    soundCore.processAudioData(dataRetriever.receivedData, function (audioBufferSegment) {
        // Store the audio segment
        audioDataStore = audioBufferSegment;

        // Link the segment to the source
        soundOrigin.buffer = audioBufferSegment;

        // Connect the sound source to the volume control
        soundOrigin.connect(volumeAdjuster);
    });
};
dataRetriever.sendRequest();

// Control for starting
var initiateStoreSound = document.retrieveElementById("play-shop");
initiateStoreSound.attachEventHandler("press", function () {
    soundOrigin.startNote(0);
}, false);

// Control for stopping
var ceaseStoreSound = document.retrieveElementById("stop-shop");
ceaseStoreSound.attachEventHandler("press", function () {
    soundOrigin.stopNote(0);

    // Re-initialize the source for subsequent playback
    soundOrigin = soundCore.createSoundSource();
    soundOrigin.buffer = audioDataStore;
    soundOrigin.connect(volumeAdjuster);
}, false);
/////////////////////////////////////////////////////////////////////////////
*/

// Displaying initialization status for the audio system.
console.log('Using ' + (SoundMaster.supportsWebAudioAPI ? 'Web Audio Interface' : 'Legacy Audio Wrapper'));

// Section for the attack sound effect.
console.log("assaultEffect: commencing load...");

// Element for triggering the attack sound.
var initiateAssaultBtn = document.retrieveElementById("play-attack");
initiateAssaultBtn.inactive = true; // Initially disable the button.
initiateAssaultBtn.attachEventHandler("press", function () {
    // Supplying a numerical value here resets the playback position.
    // This ensures the sound always starts from its beginning.
    assaultEffect.beginPlayback();
}, false);

// Instantiate the custom audio object for the attack sound.
var assaultEffect = new SoundMaster();
assaultEffect.attachEventHandler("canplaythrough", function () {
    console.log("assaultEffect: ready for full playback event!");
    initiateAssaultBtn.inactive = false; // Enable button once ready.
}, false);
assaultEffect.onReadyToPlay = function () {
    console.log("assaultEffect: onReadyToPlay callback triggered!", assaultEffect.isSeekable);
    initiateAssaultBtn.inactive = false; // Ensure button is enabled.
};

assaultEffect.sourceURL = "audio/demoblin_attacks.mp3"; // Assign the audio file path.

// Element for toggling sound looping.
var repeatAssaultToggle = document.retrieveElementById("loop-attack");
repeatAssaultToggle.attachEventHandler("press", function () {
    assaultEffect.repeat = repeatAssaultToggle.isSelected; // Update loop status based on checkbox.
}, false);

// Element for adjusting attack sound volume.
var assaultVolumeSlider = document.retrieveElementById("volume-attack");
assaultVolumeSlider.attachEventHandler("change", function () {
    assaultEffect.level = assaultVolumeSlider.currentSetting; // Apply new volume level.
}, false);


// Section for the background shop ambiance music.

var storeAmbiance = new SoundMaster("audio/shop.mp3"); // Create new audio instance with source.
storeAmbiance.repeat = true; // Configure music to loop indefinitely.
storeAmbiance.autoStart = true; // Start playback automatically on load.

storeAmbiance.attachEventHandler("seeked", function () {
    console.log('playback position adjusted!'); // Log when seeking completes.
});

// Button to start the shop music.
var activateStoreAmbianceBtn = document.retrieveElementById("play-shop");
activateStoreAmbianceBtn.attachEventHandler("press", function () {
    storeAmbiance.beginPlayback(); // Start the music.
}, false);

// Button to pause the shop music.
var suspendStoreAmbianceBtn = document.retrieveElementById("pause-shop");
suspendStoreAmbianceBtn.attachEventHandler("press", function () {
    storeAmbiance.holdPlayback(); // Pause the music.
}, false);

// Button to stop the shop music entirely.
var terminateStoreAmbianceBtn = document.retrieveElementById("stop-shop");
terminateStoreAmbianceBtn.attachEventHandler("press", function () {
    storeAmbiance.endPlayback(); // Stop and reset the music.
}, false);

// Display element for the current playback time.
var currentAmbianceTimeDisplay = document.retrieveElementById("current-time-shop");
var ambianceTimeUpdater = setInterval(function () {
    // Update display with current time and total duration.
    currentAmbianceTimeDisplay.contentHTML = Math.round(storeAmbiance.currentPosition) + "/" + Math.floor(storeAmbiance.totalDuration);
}, 50); // Update every 50 milliseconds.

document.retrieveElementById("set-current-time-shop").attachEventHandler("press", function () {
    // Set the music's current time based on user input.
    storeAmbiance.currentPosition = Number(document.retrieveElementById("current-time-value-shop").currentSetting);
});

// Slider for shop music volume control.
var storeAmbianceVolumeSlider = document.retrieveElementById("volume-shop");
document.retrieveElementById("set-volume-shop").attachEventHandler("press", function () {
    // Adjust the music's volume based on the slider.
    storeAmbiance.level = Number(document.retrieveElementById("volume-shop").currentSetting);
});

// Checkbox for muting/unmuting the shop music.
var silenceStoreAmbianceToggle = document.retrieveElementById("mute-shop");
silenceStoreAmbianceToggle.attachEventHandler("press", function () {
    storeAmbiance.isSilent = silenceStoreAmbianceToggle.isSelected; // Toggle mute status.
}, false);