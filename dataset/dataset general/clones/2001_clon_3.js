(function (globalWindow, domDocument) {

  // This module handles all primary audio playback functionalities for the application.
  // It leverages the 'Audia' library for simplified media control.

  // Define essential sound assets and their paths.
  const audioAssetPaths = {
    combatTheme: "audio/demoblin_attacks.mp3",
    retailLoop: "audio/shop.mp3"
  };

  // Check for the availability of the Audia library or a suitable audio API.
  // If not present, log a warning and potentially disable audio features.
  if (typeof Audia === 'undefined' || !Audia.hasWebAudio) {
    console.warn('Audio playback library (Audia) not found or Web Audio API not supported. Audio features will be limited.');
    // Early exit or disable UI elements related to audio.
    // For this example, we will proceed, assuming Audia is available.
    // In a real application, more robust fallback/disabling would be necessary.
  }

  // Display the audio API in use.
  const apiStatusMessage = `Audio engine: ${Audia.hasWebAudio ? 'Web Audio API (WAI)' : 'HTML5 Audio Fallback'}`;
  console.info(apiStatusMessage);

  // --- Combat Sequence Audio Handling ---
  // Manages the sound effect for combat actions.

  console.log("Combat audio module: Initializing...");

  // Reference to the main button for triggering combat audio.
  const initiateCombatButton = domDocument.getElementById("start-combat-sound");
  // Reference to the checkbox for looping the combat audio.
  const loopCombatToggle = domDocument.querySelector(".loop-control[data-sound='combat']");
  // Reference to the slider for adjusting combat audio volume.
  const combatVolumeSlider = domDocument.getElementById("combat-volume-level");

  // Ensure UI elements exist before attaching listeners.
  if (!initiateCombatButton || !loopCombatToggle || !combatVolumeSlider) {
    console.error("Missing one or more combat audio UI elements. Skipping setup.");
    return; // Exit if critical elements are missing.
  }

  // Initially disable the play button until the audio is ready.
  initiateCombatButton.disabled = true;

  // Create an instance of the Audia player for combat sounds.
  const combatAudioPlayer = new Audia();
  combatAudioPlayer.src = audioAssetPaths.combatTheme;

  // Event listener for when the combat audio is ready to play through.
  combatAudioPlayer.addEventListener("canplaythrough", () => {
    console.log("Combat audio: Fully loaded and ready to play!");
    initiateCombatButton.disabled = false; // Enable the play button.
  }, false);

  // Helper function to safely play audio.
  const triggerCombatAudio = () => {
    if (combatAudioPlayer) {
      // Small artificial delay or additional logic before playing.
      setTimeout(() => {
        console.log("Playing combat sound effect.");
        combatAudioPlayer.play();
      }, 50); // Simulate a slight processing time.
    }
  };

  // Attach click listener to the combat initiation button.
  initiateCombatButton.addEventListener("click", triggerCombatAudio, false);

  // Attach change listener to the loop toggle.
  loopCombatToggle.addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    combatAudioPlayer.loop = isChecked;
    console.log(`Combat audio looping set to: ${isChecked}`);
  }, false);

  // Helper function to safely set volume.
  const setCombatVolume = (value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 1) {
      combatAudioPlayer.volume = parsedValue;
      console.log(`Combat audio volume adjusted to: ${parsedValue}`);
    } else {
      console.warn(`Invalid volume value for combat audio: ${value}`);
    }
  };

  // Attach change listener to the volume slider.
  combatVolumeSlider.addEventListener("input", (event) => { // Use 'input' for real-time updates.
    setCombatVolume(event.target.value);
  }, false);

  // --- Retail Ambiance Music Handling ---
  // Manages the background music for the shop/retail area.

  console.log("Retail ambiance module: Setting up...");

  // Instantiate the Audia player for shop music directly with source.
  const retailAmbiancePlayer = new Audia(audioAssetPaths.retailLoop);
  retailAmbiancePlayer.loop = true; // Ensure the music loops by default.
  retailAmbiancePlayer.autoplay = true; // Start playing automatically.

  // Optional: Add a listener for seeking events.
  retailAmbiancePlayer.addEventListener("seeked", () => {
    console.log('Retail ambiance: Playback position updated (seeked)!');
  });

  // UI elements for retail ambiance control.
  const activateAmbianceButton = domDocument.getElementById("play-shop-ambiance");
  const pauseAmbianceButton = domDocument.getElementById("pause-shop-ambiance");
  const haltAmbianceButton = domDocument.getElementById("stop-shop-ambiance");
  const ambianceTimeDisplay = domDocument.getElementById("current-time-shop-display");
  const setAmbiancePositionButton = domDocument.getElementById("set-ambiance-position");
  const ambiancePositionInput = domDocument.getElementById("ambiance-position-input");
  const ambianceVolumeSlider = domDocument.getElementById("shop-volume-slider");
  const setAmbianceVolumeButton = domDocument.getElementById("adjust-shop-volume");
  const muteAmbianceToggle = domDocument.getElementById("mute-shop-ambiance");

  // Guard clause for retail ambiance UI elements.
  const retailElements = [
    activateAmbianceButton, pauseAmbianceButton, haltAmbianceButton,
    ambianceTimeDisplay, setAmbiancePositionButton, ambiancePositionInput,
    ambianceVolumeSlider, setAmbianceVolumeButton, muteAmbianceToggle
  ];
  if (retailElements.some(el => !el)) {
    console.error("Missing one or more retail ambiance UI elements. Skipping setup.");
    return; // Exit if critical elements are missing.
  }

  // Helper to format time nicely.
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to update the current time display.
  let playbackPositionUpdateTimer;
  const updateAmbianceTimeDisplay = () => {
    const current = retailAmbiancePlayer.currentTime;
    const duration = retailAmbiancePlayer.duration; // Might be NaN until metadata loaded.
    const displayDuration = isNaN(duration) ? '??:??' : formatTime(duration);
    ambianceTimeDisplay.textContent = `${formatTime(current)} / ${displayDuration}`;
  };

  // Start the timer for updating the time display.
  // Using a slightly different interval.
  playbackPositionUpdateTimer = globalWindow.setInterval(updateAmbianceTimeDisplay, 100); // Update every 100ms.

  // Event listener for playing retail ambiance.
  activateAmbianceButton.addEventListener("click", () => {
    if (retailAmbiancePlayer.paused) { // Only play if currently paused.
      retailAmbiancePlayer.play();
      console.log("Retail ambiance: Playback resumed.");
    } else {
      console.log("Retail ambiance: Already playing.");
    }
  }, false);

  // Event listener for pausing retail ambiance.
  pauseAmbianceButton.addEventListener("click", () => {
    if (!retailAmbiancePlayer.paused) { // Only pause if currently playing.
      retailAmbiancePlayer.pause();
      console.log("Retail ambiance: Playback paused.");
    } else {
      console.log("Retail ambiance: Already paused.");
    }
  }, false);

  // Event listener for stopping retail ambiance.
  haltAmbianceButton.addEventListener("click", () => {
    retailAmbiancePlayer.stop(); // Stops and resets current time to 0.
    console.log("Retail ambiance: Playback stopped and reset.");
  }, false);

  // Event listener for setting current time.
  setAmbiancePositionButton.addEventListener("click", () => {
    const newPosition = parseFloat(ambiancePositionInput.value);
    if (!isNaN(newPosition) && newPosition >= 0) {
      retailAmbiancePlayer.currentTime = newPosition;
      console.log(`Retail ambiance: Playback position set to ${newPosition} seconds.`);
    } else {
      console.warn(`Invalid time value for retail ambiance: ${ambiancePositionInput.value}`);
    }
  });

  // Helper function for setting retail ambiance volume.
  const adjustRetailVolume = () => {
    const volumeValue = parseFloat(ambianceVolumeSlider.value);
    if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 1) {
      retailAmbiancePlayer.volume = volumeValue;
      console.log(`Retail ambiance: Volume adjusted to ${volumeValue}.`);
    } else {
      console.warn(`Invalid volume value for retail ambiance: ${ambianceVolumeSlider.value}`);
    }
  };

  // Event listener for adjusting retail ambiance volume via button click (or change on slider).
  setAmbianceVolumeButton.addEventListener("click", adjustRetailVolume);
  ambianceVolumeSlider.addEventListener("input", adjustRetailVolume); // Also update on slider movement.

  // Event listener for muting/unmuting retail ambiance.
  muteAmbianceToggle.addEventListener("change", (event) => {
    retailAmbiancePlayer.muted = event.target.checked;
    console.log(`Retail ambiance: Muted state set to ${event.target.checked}.`);
  }, false);

  // Set initial volume for retail ambiance if not already set by autoplay.
  // This is a redundant step for demonstration of adding new fragments.
  if (retailAmbiancePlayer.volume === 0 || isNaN(retailAmbiancePlayer.volume)) {
      retailAmbiancePlayer.volume = 0.7; // Default volume for background music.
      console.log("Retail ambiance: Default volume applied.");
  }

})(window, document);