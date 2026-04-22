let playerInitializationRegistry = {};

window.onCustomPlayerAPIReady = function(uniquePlayerIdentifier) {
    if (playerInitializationRegistry[uniquePlayerIdentifier]) {
        playerInitializationRegistry[uniquePlayerIdentifier](uniquePlayerIdentifier);
        delete playerInitializationRegistry[uniquePlayerIdentifier];
    }
};

(function() {

    function retrieveElementOffset(targetElement) {
        const boundingBox = targetElement.getBoundingClientRect();
        return {
            leftPosition: boundingBox.left + window.scrollX,
            topPosition: boundingBox.top + window.scrollY
        };
    }

    class VideoControlWidget {
        constructor(initialLinkElement, userProvidedOptions) {
            this.sourceAnchor = initialLinkElement;

            const baseSettings = {
                displayWidth: '640',
                displayHeight: '360',
                playerElementPrefix: 'playerNode',
                flashParameters: {
                    allowScriptAccess: 'always',
                    wmode: 'transparent'
                }
            };

            this.finalConfiguration = Object.assign({}, baseSettings, userProvidedOptions);

            this.playerAPIObject = null;
            this.playPauseButton = null;
            this.muteUnmuteButton = null;
            this.playbackScrubber = null;
            this.progressTrack = null;
            this.bufferedSegment = null;
            this.playbackPositionMarker = null;
            this.mainWidgetWrapper = null;
            this.statusRefreshIntervalId = null;

            this.prepareWidget();
        }

        prepareWidget() {
            const mediaLinkURL = this.sourceAnchor.getAttribute('href');
            this.youtubeVideoCode = mediaLinkURL.substr(31);
            
            const uniquePlayerNodeId = this.sourceAnchor.getAttribute('id') || this.finalConfiguration.playerElementPrefix + Math.random().toString(36).substring(2, 11);
            this.playerContainerId = uniquePlayerNodeId;

            this.mainWidgetWrapper = document.createElement('div');
            this.mainWidgetWrapper.className = 'media-interface-container';

            const playerEmbeddingZone = document.createElement('div');
            playerEmbeddingZone.className = 'video-embed-zone';
            playerEmbeddingZone.id = uniquePlayerNodeId;

            const controlPanelArea = document.createElement('div');
            controlPanelArea.className = 'interactive-control-panel';

            this.sourceAnchor.parentNode.insertBefore(this.mainWidgetWrapper, this.sourceAnchor);
            this.mainWidgetWrapper.appendChild(playerEmbeddingZone);
            this.mainWidgetWrapper.appendChild(controlPanelArea);

            controlPanelArea.appendChild(this.sourceAnchor);
            this.controlPanelElement = controlPanelArea;

            this.constructControlElements();
            this.embedYouTubePlayer();
        }

        constructControlElements() {
            this.playPauseButton = document.createElement('a');
            this.playPauseButton.href = '#';
            this.playPauseButton.className = 'play-pause-action-button';
            this.playPauseButton.textContent = 'Toggle Play';
            this.playPauseButton.title = 'Begin Playback';
            this.playPauseButton.addEventListener('click', (eventData) => {
                eventData.preventDefault();
                this.performPlaybackToggle();
            });
            this.controlPanelElement.appendChild(this.playPauseButton);

            this.muteUnmuteButton = document.createElement('a');
            this.muteUnmuteButton.href = '#';
            this.muteUnmuteButton.className = 'sound-level-control';
            this.muteUnmuteButton.textContent = 'Audio Control';
            this.muteUnmuteButton.title = 'Mute Sound';
            this.muteUnmuteButton.addEventListener('click', (eventData) => {
                eventData.preventDefault();
                this.performVolumeToggle();
            });
            this.controlPanelElement.appendChild(this.muteUnmuteButton);

            this.sourceAnchor.classList.add('view-on-youtube-link');
            this.sourceAnchor.setAttribute('title', 'Access on YouTube');
            this.sourceAnchor.innerHTML = 'Play / View on YouTube';

            this.playbackScrubber = document.createElement('div');
            this.playbackScrubber.className = 'media-progress-display';
            this.playbackScrubber.addEventListener('click', (eventData) => {
                const clickPositionX = eventData.pageX - retrieveElementOffset(this.playbackScrubber).leftPosition;
                const totalWidth = this.playbackScrubber.offsetWidth;
                this.jumpToPlaybackPosition(clickPositionX / totalWidth);
            });
            this.controlPanelElement.appendChild(this.playbackScrubber);

            this.progressTrack = document.createElement('div');
            this.progressTrack.className = 'progress-bar-base';
            this.playbackScrubber.appendChild(this.progressTrack);

            this.bufferedSegment = document.createElement('div');
            this.bufferedSegment.className = 'loaded-buffer-segment';
            this.progressTrack.appendChild(this.bufferedSegment);

            this.playbackPositionMarker = document.createElement('span');
            this.playbackPositionMarker.className = 'current-position-indicator';
            this.progressTrack.appendChild(this.playbackPositionMarker);
        }

        embedYouTubePlayer() {
            playerInitializationRegistry[this.playerContainerId] = (idOfPlayer) => {
                this.playerAPIObject = document.getElementById(idOfPlayer);
                this.beginStatusPolling();
                this.cueVideoForPlayback();
            };

            swfobject.embedSWF(
                'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=' + this.playerContainerId,
                this.playerContainerId,
                this.finalConfiguration.displayWidth,
                this.finalConfiguration.displayHeight,
                '8',
                null,
                null,
                this.finalConfiguration.flashParameters,
                { id: this.playerContainerId },
                (swfObjectResult) => {
                    if (swfObjectResult.success) {
                        this.playerAPIObject = swfObjectResult.ref;
                    }
                }
            );
        }

        beginStatusPolling() {
            this.statusRefreshIntervalId = setInterval(() => {
                this.updateDisplayState();
            }, 250);
        }

        cueVideoForPlayback() {
            if (this.playerAPIObject && typeof this.playerAPIObject.cueVideoById === 'function') {
                this.playerAPIObject.cueVideoById(this.youtubeVideoCode);
            }
        }

        performPlaybackToggle() {
            if (this.playPauseButton.classList.contains('playing-state')) {
                this.haltVideoPlayback();
            } else {
                this.initiateVideoPlayback();
            }
        }

        initiateVideoPlayback() {
            if (this.playerAPIObject && typeof this.playerAPIObject.playVideo === 'function') {
                this.playerAPIObject.playVideo();
                this.playPauseButton.classList.remove('paused-state');
                this.playPauseButton.classList.add('playing-state');
                this.playPauseButton.title = 'Suspend Playback';
            }
        }

        haltVideoPlayback() {
            if (this.playerAPIObject && typeof this.playerAPIObject.pauseVideo === 'function') {
                this.playerAPIObject.pauseVideo();
                this.playPauseButton.classList.remove('playing-state');
                this.playPauseButton.classList.add('paused-state');
                this.playPauseButton.title = 'Resume Playback';
            }
        }

        performVolumeToggle() {
            if (this.muteUnmuteButton.classList.contains('muted-state')) {
                this.unmuteVideoSound();
            } else {
                this.muteVideoSound();
            }
        }

        muteVideoSound() {
            if (this.playerAPIObject && typeof this.playerAPIObject.mute === 'function') {
                this.playerAPIObject.mute();
                this.muteUnmuteButton.classList.add('muted-state');
                this.muteUnmuteButton.title = 'Unmute Sound';
            }
        }

        unmuteVideoSound() {
            if (this.playerAPIObject && typeof this.playerAPIObject.unMute === 'function') {
                this.playerAPIObject.unMute();
                this.muteUnmuteButton.classList.remove('muted-state');
                this.muteUnmuteButton.title = 'Mute Sound';
            }
        }

        jumpToPlaybackPosition(normalizedSeekPosition) {
            if (this.playerAPIObject && typeof this.playerAPIObject.getDuration === 'function' && typeof this.playerAPIObject.seekTo === 'function') {
                const totalMediaDuration = this.playerAPIObject.getDuration();
                const targetSeekTime = Math.round(totalMediaDuration * normalizedSeekPosition);
                this.playerAPIObject.seekTo(targetSeekTime, false);
            }
        }

        updateDisplayState() {
            if (this.playerAPIObject && typeof this.playerAPIObject.getDuration === 'function') {
                const currentAPIState = this.playerAPIObject.getPlayerState();
                const API_STATE_PLAYING = 1;
                const API_STATE_PAUSED = 2;
                const API_STATE_ENDED = 0;

                if (currentAPIState === API_STATE_PLAYING) {
                    this.initiateVideoPlayback();
                } else if (currentAPIState === API_STATE_ENDED || currentAPIState === API_STATE_PAUSED) {
                    this.haltVideoPlayback();
                }

                if (this.playerAPIObject.getVideoLoadedFraction() > 0) {
                    const loadedFractionValue = Math.min(this.playerAPIObject.getVideoLoadedFraction(), 1);
                    const loadedPercent = Math.round(loadedFractionValue * 100);
                    this.bufferedSegment.style.width = loadedPercent + '%';
                }

                if (this.playerAPIObject.getCurrentTime() > 0 && this.playerAPIObject.getDuration() > 0) {
                    const currentTimeInMedia = this.playerAPIObject.getCurrentTime();
                    const mediaTotalDuration = this.playerAPIObject.getDuration();
                    const positionPercentage = (currentTimeInMedia / mediaTotalDuration) * 100;
                    this.playbackPositionMarker.style.left = positionPercentage + '%';
                }
            }
        }
    }

    window.activateVideoControls = function(cssSelector, customGlobalOptions = {}) {
        const targetElements = document.querySelectorAll(cssSelector);
        targetElements.forEach((element) => {
            new VideoControlWidget(element, customGlobalOptions);
        });
    };

})();