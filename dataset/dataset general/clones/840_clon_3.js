/*
 * Enhanced Multimedia Player Module
 * Project: Viget Labs - Dynamic Media Interface
 *
 * Copyright (c) 2023 [Your Name/Company Name] (based on original work by Trevor Davis)
 * Licensed under the MIT License and GPL v3.0.
 * For license details, please visit:
 *   - https://opensource.org/licenses/MIT
 *   - https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @version 1.0.0
 *
 * This script provides a jQuery plugin for embedding and controlling
 * YouTube videos with a custom chromeless interface, offering
 * playback, volume, and seeking capabilities.
 */

(function(externalJQuery) {

  // Global callback for the YouTube API.
  // This function name MUST remain as 'onYouTubePlayerReady' for the API to function.
  // It is called by the YouTube Flash/HTML5 player once it has finished loading.
  window.onYouTubePlayerReady = function(playerIdentifier) {
    const targetElement = document.getElementById(playerIdentifier);
    if (!targetElement) {
      console.warn("YouTube player ready callback received for non-existent element:", playerIdentifier);
      return;
    }

    const $playerContainer = externalJQuery(targetElement).parent();

    // Set up a periodic check for player status updates.
    // This interval controls the responsiveness of the progress bar and status.
    const updateIntervalMs = 200; // Original was 250ms
    const statusUpdateTimer = setInterval(function() {
      if ($playerContainer.length) { // Ensure the element still exists
        $playerContainer.trigger('playerStateRefresh');
      } else {
        clearInterval(statusUpdateTimer); // Clean up if container is removed
      }
    }, updateIntervalMs);

    // Initial cueing of the video after the player is ready.
    // This prepares the video for playback without starting it immediately.
    $playerContainer.trigger('queueMedia');
  };

  // Define the jQuery plugin for media control.
  externalJQuery.fn.mediaControl = function(componentOptions) {

    // Default configuration for the video player component.
    const baseConfiguration = {
      playerWidth: 640, // Default width for the embedded video player.
      playerHeight: 360, // Default height for the embedded video player.
      uniquePlayerBaseId: 'mediaHost', // Base string for generating unique player IDs.
      embedParameters: { // Parameters passed to the SWFObject for embedding.
        allowScriptAccess: 'always', // Essential for JavaScript interaction.
        wmode: 'transparent', // Allows elements behind the player to be visible.
        fs: 1 // Enable fullscreen button (if not overridden by chromeless).
      },
      // New: Additional class to add to the main wrapper element.
      wrapperClass: 'custom-video-wrapper'
    };

    // Iterate over each selected element to apply the plugin.
    return this.each(function(itemIndex) {

      // Merge default configuration with user-provided options.
      const componentSettings = externalJQuery.extend(true, {}, baseConfiguration, componentOptions);

      // Cache the current jQuery object for the source link.
      const $sourceLinkElement = externalJQuery(this);

      // Extract video URL and generate unique IDs.
      const mediaSourceUrl = $sourceLinkElement.attr('href');
      const generatedPlayerId = $sourceLinkElement.attr('id') || `${componentSettings.uniquePlayerBaseId}-${itemIndex}`;

      // New: Validate the media source URL.
      if (!mediaSourceUrl || !mediaSourceUrl.includes('youtube.com/watch?v=')) {
        console.error("Invalid YouTube video URL found for element:", $sourceLinkElement[0]);
        // Instead of stopping, we can disable the link or skip this instance.
        $sourceLinkElement.addClass('media-error').attr('title', 'Invalid video source');
        return true; // Continue to the next element in .each()
      }

      // Extract the YouTube video ID from the URL.
      const youtubeVideoContentId = mediaSourceUrl.split('v=')[1].split('&')[0]; // More robust extraction.

      // Create and structure new DOM elements for the player interface.
      const $playerWrapper = externalJQuery('<div/>', {
        'class': componentSettings.wrapperClass
      }).insertAfter($sourceLinkElement); // Insert wrapper after the link, not wrap it.

      $sourceLinkElement.appendTo($playerWrapper).addClass('source-link-hidden').hide(); // Move link inside wrapper and hide it.

      const $mediaDisplayArea = externalJQuery('<div/>', {
        'class': 'media-frame',
        'id': generatedPlayerId
      }).prependTo($playerWrapper);

      const $uiControlPanel = externalJQuery('<div/>', {
        'class': 'media-controls-panel'
      }).appendTo($playerWrapper);

      // Declare control element variables.
      let $playbackToggleBtn,
        $volumeToggleBtn,
        $seekControlBar,
        $playbackProgressIndicator,
        $bufferProgressFill,
        $progressBarBase;

      // Variable to hold the YouTube player API object.
      let ytPlayerApiObject;

      // Bind custom events to the player wrapper for interaction.
      // These events abstract the actual player API calls.
      $playerWrapper.on({
        'performTogglePlay': function() {
          $playerWrapper._togglePlaybackState();
        },
        'startPlayback': function() {
          $playerWrapper._initiatePlayback();
        },
        'pausePlayback': function() {
          $playerWrapper._haltPlayback();
        },
        'performToggleMute': function() {
          $playerWrapper._toggleVolumeState();
        },
        'muteAudio': function() {
          $playerWrapper._silenceAudio();
        },
        'unmuteAudio': function() {
          $playerWrapper._restoreAudio();
        },
        'seekToPosition': function(event, relativePosition) {
          $playerWrapper._adjustMediaPosition(relativePosition);
        },
        'playerStateRefresh': function() {
          $playerWrapper._updatePlayerDisplay();
        },
        'queueMedia': function() {
          if (ytPlayerApiObject && typeof ytPlayerApiObject.cueVideoById === 'function') {
            ytPlayerApiObject.cueVideoById(youtubeVideoContentId);
          } else {
            console.warn("YouTube API object not ready to cue video:", youtubeVideoContentId);
          }
        }
      });


      // --- Internal Control Methods ---

      // Toggles between play and pause states.
      $playerWrapper._togglePlaybackState = function() {
        if ($playbackToggleBtn.hasClass('is-playing')) {
          $playerWrapper.trigger('pausePlayback');
        } else {
          $playerWrapper.trigger('startPlayback');
        }
        return false; // Prevent default link behavior.
      };

      // Initiates video playback.
      $playerWrapper._initiatePlayback = function() {
        if (ytPlayerApiObject && typeof ytPlayerApiObject.playVideo === 'function') {
          ytPlayerApiObject.playVideo();
          $playbackToggleBtn.removeClass('is-paused').addClass('is-playing').attr('title', 'Pause Video');
        } else {
          console.warn("Player API not ready to play.");
        }
      };

      // Pauses video playback.
      $playerWrapper._haltPlayback = function() {
        if (ytPlayerApiObject && typeof ytPlayerApiObject.pauseVideo === 'function') {
          ytPlayerApiObject.pauseVideo();
          $playbackToggleBtn.removeClass('is-playing').addClass('is-paused').attr('title', 'Play Video');
        } else {
          console.warn("Player API not ready to pause.");
        }
      };

      // Toggles between muted and unmuted states.
      $playerWrapper._toggleVolumeState = function() {
        if ($volumeToggleBtn.hasClass('is-muted')) {
          $playerWrapper.trigger('unmuteAudio');
        } else {
          $playerWrapper.trigger('muteAudio');
        }
        return false; // Prevent default link behavior.
      };

      // Mutes the video audio.
      $playerWrapper._silenceAudio = function() {
        if (ytPlayerApiObject && typeof ytPlayerApiObject.mute === 'function') {
          ytPlayerApiObject.mute();
          $volumeToggleBtn.addClass('is-muted').attr('title', 'Unmute Audio');
        }
      };

      // Unmutes the video audio.
      $playerWrapper._restoreAudio = function() {
        if (ytPlayerApiObject && typeof ytPlayerApiObject.unMute === 'function') {
          ytPlayerApiObject.unMute();
          $volumeToggleBtn.removeClass('is-muted').attr('title', 'Mute Audio');
        }
      };

      // Adjusts the video playback position.
      $playerWrapper._adjustMediaPosition = function(progressRatio) {
        if (!ytPlayerApiObject || typeof ytPlayerApiObject.getDuration !== 'function') {
          console.warn("Player API not ready for seeking.");
          return;
        }
        const totalDuration = ytPlayerApiObject.getDuration();
        if (isNaN(totalDuration) || totalDuration <= 0) {
          console.warn("Cannot seek: Video duration is unavailable or zero.");
          return;
        }
        const seekTargetTime = Math.max(0, Math.min(totalDuration, Math.round(totalDuration * progressRatio))); // Ensure value is within bounds.
        ytPlayerApiObject.seekTo(seekTargetTime, true); // Second param: allow seek ahead.
      };


      // --- Player Initialization and Update Methods ---

      // Updates the visual status of the player controls.
      $playerWrapper._updatePlayerDisplay = function() {

        if (!ytPlayerApiObject || typeof ytPlayerApiObject.getDuration !== 'function') {
          // Player object not fully initialized or methods not available yet.
          return;
        }

        const currentDuration = ytPlayerApiObject.getDuration();
        if (isNaN(currentDuration) || currentDuration <= 0) {
          // Duration not yet available, cannot update progress.
          return;
        }

        const playerState = ytPlayerApiObject.getPlayerState();

        // Update playback button state.
        if (playerState === YT.PlayerState.PLAYING) { // YT.PlayerState.PLAYING (1)
          if (!$playbackToggleBtn.hasClass('is-playing')) { // Only update if state actually changed.
            $playerWrapper.trigger('startPlayback');
          }
        } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED) { // YT.PlayerState.PAUSED (2), YT.PlayerState.ENDED (0)
          if (!$playbackToggleBtn.hasClass('is-paused')) { // Only update if state actually changed.
            $playerWrapper.trigger('pausePlayback');
          }
        } else if (playerState === YT.PlayerState.BUFFERING) { // YT.PlayerState.BUFFERING (3)
          $playbackToggleBtn.removeClass('is-playing is-paused').addClass('is-buffering').attr('title', 'Buffering...');
        } else {
          $playbackToggleBtn.removeClass('is-playing is-paused is-buffering'); // Clear other states
        }

        // Update loaded (buffered) progress bar.
        const bufferedFraction = ytPlayerApiObject.getVideoLoadedFraction();
        if (bufferedFraction > 0) {
          const loadedPercentage = Math.round(Math.min(bufferedFraction, 1) * 100);
          $bufferProgressFill.css('width', loadedPercentage + '%');
        }

        // Update current playback position indicator.
        const currentTime = ytPlayerApiObject.getCurrentTime();
        if (currentTime > 0) {
          const playbackPositionPercentage = (currentTime / currentDuration) * 100;
          $playbackProgressIndicator.css('left', playbackPositionPercentage + '%');
        }
      };


      // --- Core Initialization Functions ---

      // Embeds the YouTube player using SWFObject.
      $playerWrapper._initializeComponent = function() {

        if (typeof swfobject === 'undefined') {
          console.error("SWFObject library not found. Cannot embed YouTube player.");
          return;
        }

        // Construct the API player URL.
        const apiPlayerSource = `http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=${generatedPlayerId}`;

        // Embed the SWF object (Flash player). If Flash is not available, YouTube API
        // will attempt to load an HTML5 player if the browser supports it.
        swfobject.embedSWF(
          apiPlayerSource,
          generatedPlayerId,
          componentSettings.playerWidth.toString(), // Ensure string type for SWFObject.
          componentSettings.playerHeight.toString(),
          '8', // Minimum Flash player version.
          null, // Express install SWF URL (not used here).
          null, // Flashvars (not used here).
          componentSettings.embedParameters,
          {
            id: generatedPlayerId,
            name: generatedPlayerId, // New: Add name attribute for better accessibility/scripting.
            allowFullScreen: 'true' // New: Allow fullscreen.
          },
          function(embedResult) {
            if (embedResult.success) {
              ytPlayerApiObject = document.getElementById(generatedPlayerId);
              console.log("YouTube player embedded successfully:", generatedPlayerId);
            } else {
              console.error("Failed to embed YouTube player for ID:", generatedPlayerId, embedResult);
              // Fallback: Show original link or a message.
              $mediaDisplayArea.html('<p class="embed-error">Failed to load video player. <a href="' + mediaSourceUrl + '" target="_blank">Watch on YouTube</a></p>');
            }
          }
        );

        $playerWrapper._constructUserInterface(); // Build controls after embedding.
      };

      // Creates and appends all user interface control elements.
      $playerWrapper._constructUserInterface = function() {

        // Helper function for creating common anchor buttons
        const createControlBtn = (cssClass, defaultTitle, btnText, clickHandler) => {
          return externalJQuery('<a/>', {
            href: '#',
            'class': cssClass,
            text: btnText,
            title: defaultTitle,
            click: clickHandler
          }).appendTo($uiControlPanel);
        };

        // Play/Pause button.
        $playbackToggleBtn = createControlBtn(
          'playback-toggle is-paused', // Initial state: paused
          'Play Video',
          'Play/Pause',
          function() {
            $playerWrapper.trigger('performTogglePlay');
            return false;
          }
        );

        // Mute/Unmute button.
        $volumeToggleBtn = createControlBtn(
          'volume-toggle',
          'Mute Audio',
          'Volume',
          function() {
            $playerWrapper.trigger('performToggleMute');
            return false;
          }
        );

        // New: A simple duration display (initially empty).
        const $durationDisplay = externalJQuery('<span/>', {
          'class': 'media-duration',
          text: '--:-- / --:--'
        }).appendTo($uiControlPanel);

        // Progress/Seek bar.
        $seekControlBar = externalJQuery('<div/>', {
          'class': 'seek-bar-area',
          click: function(interactionEvent) {
            // Calculate the click position relative to the seek bar.
            const clickOffset = interactionEvent.pageX - $seekControlBar.offset().left;
            const barWidth = $seekControlBar.width();
            const relativeSeekPosition = clickOffset / barWidth;
            $playerWrapper.trigger('seekToPosition', [relativeSeekPosition]);
          }
        }).appendTo($uiControlPanel);

        $progressBarBase = externalJQuery('<div class="progress-base"></div>').appendTo($seekControlBar);
        $bufferProgressFill = externalJQuery('<div class="buffered-fill"></div>').appendTo($progressBarBase);
        $playbackProgressIndicator = externalJQuery('<span class="playhead-indicator"></span>').appendTo($progressBarBase);

        // Original link, now styled as a "View on YouTube" button.
        $sourceLinkElement
          .removeClass('source-link-hidden') // Remove the hidden class
          .addClass('view-original-source')
          .attr('title', 'Watch this video directly on YouTube.com')
          .text('View on YouTube')
          .appendTo($uiControlPanel); // Move it to the control panel.

        // New: Validation for controls. If any essential control is missing, log a warning.
        if (!$playbackToggleBtn.length || !$volumeToggleBtn.length || !$seekControlBar.length) {
          console.warn("One or more essential UI controls could not be created for player:", generatedPlayerId);
        }
      };

      // Initiate the player setup process for the current element.
      $playerWrapper._initializeComponent();

    }); // End of .each()

  }; // End of plugin definition

})(jQuery); // Pass jQuery object into the IIFE.