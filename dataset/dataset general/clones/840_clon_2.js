/*
 * Online Video Player Component
 * http://www.sampledomain.com/
 *
 * Copyright (c) 2024 Author Name
 * Shared under the MIT and GNU GPL version 3 licenses.
 * Consult: https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @revision 1.0.1
 */

(function(jQ) {
  jQ.fn.tubePlayer = function(settingsObj) {

    // Define the default setup parameters
    var defaultSettings = {
      playerDisplayWidth: 640,
      playerDisplayHeight: 360,
      elementIdentifierPrefix: 'mediaUnit',
      embeddingParameters: {
        allowScriptAccessProperty: 'always',
        windowMode: 'transparent'
      }
    };

    return this.each(function(indexPos) {

      // Initial declaration of various local variables

      var currentOptions = jQ.extend(defaultSettings, settingsObj),

        // Reference to the originating jQuery element
        $sourceHyperlink = jQ(this),

        // Extract necessary data from the source element
        mediaResourceURL = $sourceHyperlink.attr('href'),
        playerContainerID = $sourceHyperlink.attr('id') || currentOptions.elementIdentifierPrefix + indexPos,
        youtubeStreamID = mediaResourceURL.substr(31),

        // Construct new DOM elements for the player interface
        $playerWrapperDiv = $sourceHyperlink.wrap('<div class="video-container"></div>').parent(),
        $controlInterface = jQ('<div class="player-controls"></div>').appendTo($playerWrapperDiv),
        $playerTargetDiv = jQ('<div class="video-area"></div>').prependTo($playerWrapperDiv).attr('id', playerContainerID),
        $progressBarStrip,
        $playbackHeadMarker,
        $bufferedSegmentIndicator,
        $audioControlBtn,
        $playPauseToggleBtn,
        $timelineSliderDiv,

        // The YouTube API player instance
        mediaPlayerObject;

      // Attach custom events to the player wrapper
      $playerWrapperDiv.bind({

        // Playback state transitions
        'togglePlaybackState': function() {
          $playerWrapperDiv.togglePlaybackState();
        },
        'initiatePlayback': function() {
          $playerWrapperDiv.initiatePlayback();
        },
        'haltCurrentPlayback': function() {
          $playerWrapperDiv.haltCurrentPlayback();
        },
        'toggleAudioState': function() {
          $playerWrapperDiv.toggleAudioState();
        },
        'silenceSound': function() {
          $playerWrapperDiv.silenceSound();
        },
        'restoreSound': function() {
          $playerWrapperDiv.restoreSound();
        },
        'jumpToTime': function() {
          $playerWrapperDiv.jumpToTime();
        },

        // Player information updates
        'refreshPlayerStatus': function() {
          $playerWrapperDiv.refreshPlayerStatus();
        },
        'loadMediaContent': function() {
          mediaPlayerObject.cueVideoById(youtubeStreamID);
        }

      });


      // Definition of player control functions

      // Switches between playing and paused states
      $playerWrapperDiv.togglePlaybackState = function() {
        if ($playPauseToggleBtn.hasClass('is-playing')) {
          $playerWrapperDiv.trigger('haltCurrentPlayback');
        } else {
          $playerWrapperDiv.trigger('initiatePlayback');
        }
        return false;
      };

      // Starts the video playing
      $playerWrapperDiv.initiatePlayback = function() {
        mediaPlayerObject.playVideo();
        $playPauseToggleBtn.removeClass('is-paused').addClass('is-playing').attr('title', 'Pause Video');
      };

      // Stops the video and keeps it ready
      $playerWrapperDiv.haltCurrentPlayback = function() {
        mediaPlayerObject.pauseVideo();
        $playPauseToggleBtn.removeClass('is-playing').addClass('is-paused').attr('title', 'Play Video');
      };

      // Changes the mute status of the audio
      $playerWrapperDiv.toggleAudioState = function() {
        if ($audioControlBtn.hasClass('is-muted')) {
          $playerWrapperDiv.trigger('restoreSound');
        } else {
          $playerWrapperDiv.trigger('silenceSound');
        }
        return false;
      };

      // Mutes the video audio
      $playerWrapperDiv.silenceSound = function() {
        mediaPlayerObject.mute();
        $audioControlBtn.addClass('is-muted').attr('title', 'Unmute Audio');
      };

      // Unmutes the video audio
      $playerWrapperDiv.restoreSound = function() {
        mediaPlayerObject.unMute();
        $audioControlBtn.removeClass('is-muted').attr('title', 'Mute Audio');
      };

      // Moves the video playback to a specified position
      $playerWrapperDiv.jumpToTime = function(targetSeekPosition) {
        var calculatedSeekPoint = Math.round(mediaPlayerObject.getDuration() * targetSeekPosition);
        mediaPlayerObject.seekTo(calculatedSeekPoint, false);
      };



      // Player initialization and status refresh methods

      // Updates the player's visual status indicators
      $playerWrapperDiv.refreshPlayerStatus = function() {

        if (mediaPlayerObject && mediaPlayerObject.getDuration) {

          if (mediaPlayerObject.getPlayerState() === 1) { // Currently playing
            $playerWrapperDiv.initiatePlayback();
          } else if (mediaPlayerObject.getPlayerState() === 0) { // Video has ended
            $playerWrapperDiv.haltCurrentPlayback();
          }

          if (mediaPlayerObject.getVideoLoadedFraction() > 0) {
            var bufferedAmount = Math.round(Math.min(mediaPlayerObject.getVideoLoadedFraction(), 1) * 100);
            $bufferedSegmentIndicator.css('width', bufferedAmount + '%');
          }

          if (mediaPlayerObject.getCurrentTime() > 0) {
            var mediaPlayProgress = (mediaPlayerObject.getCurrentTime() / mediaPlayerObject.getDuration()) * 100;
            $playbackHeadMarker.css('left', mediaPlayProgress + '%');
          }

        }

      };


      // This global function is called by the YouTube player when it has loaded.
      // NOTE: This identifier is changed from the official YT API callback name
      onEmbeddedPlayerReady = function(playerIDString) {

        var $associatedPlayerContainer = jQ(document.getElementById(playerIDString)).parent();

        setInterval(function() {
          $associatedPlayerContainer.trigger('refreshPlayerStatus');
        }, 250);

        $associatedPlayerContainer.trigger('loadMediaContent');

      };



      // Primary initialization routine

      // Embeds the YouTube Flash player
      $playerWrapperDiv.activateEmbed = function() {

        swfobject.embedSWF(
          'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=' + playerContainerID,
          playerContainerID,
          currentOptions.playerDisplayWidth,
          currentOptions.playerDisplayHeight,
          8, // Minimum Flash player version required
          null,
          null,
          currentOptions.embeddingParameters, {
            id: playerContainerID
          },
          function() {
            mediaPlayerObject = document.getElementById(playerContainerID);
          }
        );

        $playerWrapperDiv.buildControlElements();

      };

      // Creates the interactive control elements for the video player
      $playerWrapperDiv.buildControlElements = function() {

        // Play/Pause button
        $playPauseToggleBtn = jQ('<a/>', {
          linkRef: '#',
          styleClass: 'play-pause-btn',
          displayText: 'Play/Pause Action',
          hoverText: 'Start Playback',
          onActivation: function() {
            $playerWrapperDiv.trigger('togglePlaybackState');
            return false;
          }
        }).appendTo($controlInterface);

        // Mute/Unmute button
        $audioControlBtn = jQ('<a/>', {
          linkRef: '#',
          styleClass: 'volume-toggle-btn',
          displayText: 'Audio Level',
          hoverText: 'Mute Audio',
          onActivation: function() {
            $playerWrapperDiv.trigger('toggleAudioState');
            return false;
          }
        }).appendTo($controlInterface);

        // Link to view the video on YouTube
        $sourceHyperlink
          .addClass('view-on-youtube-link')
          .attr('title', 'Open on YouTube')
          .html('Initiate / View on YouTube')
          .appendTo($controlInterface);

        // Progress timeline for seeking
        $timelineSliderDiv = jQ('<div/>', {
          styleClass: 'playback-timeline',
          onActivation: function(eventObj) {
            var seekOffset = eventObj.pageX - $timelineSliderDiv.offset().left,
              timelineElementWidth = $timelineSliderDiv.width();
            $playerWrapperDiv.jumpToTime(seekOffset / timelineElementWidth);
          }
        }).appendTo($controlInterface);

        $progressBarStrip = jQ('<div class="progress-bar-track"></div>').appendTo($timelineSliderDiv);
        $bufferedSegmentIndicator = jQ('<div class="loaded-progress"></div>').appendTo($progressBarStrip);
        $playbackHeadMarker = jQ('<span class="current-position-marker"></span>').appendTo($progressBarStrip);

      };

      // Start the player embedding process
      $playerWrapperDiv.activateEmbed();

    });

  };

})(jQuery);