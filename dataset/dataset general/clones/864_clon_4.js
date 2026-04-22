(function (window, videojs) {
    'use strict';

    function mergeConfigurations(target, source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
        return target;
    }

    var DomHelper = {
        makeElement: function(tag, id, classes, attributes) {
            var el = document.createElement(tag);
            if (id) el.id = id;
            if (classes) el.className = classes;
            if (attributes) {
                for (var attr in attributes) {
                    if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
                        el.setAttribute(attr, attributes[attr]);
                    }
                }
            }
            return el;
        },
        fetchElement: function(selector) {
            return document.querySelector(selector);
        },
        placeElement: function(parent, child) {
            parent.appendChild(child);
        },
        removeElement: function(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },
        listen: function(element, event, handler) {
            if (element) {
                element.addEventListener(event, handler);
            }
        },
        unlisten: function(element, event, handler) {
            if (element) {
                element.removeEventListener(event, handler);
            }
        },
        styleElement: function(element, styles) {
            if (element) {
                for (var prop in styles) {
                    if (Object.prototype.hasOwnProperty.call(styles, prop)) {
                        element.style[prop] = styles[prop];
                    }
                }
            }
        },
        readOuterWidth: function(element) {
            if (!element) return 0;
            var style = getComputedStyle(element);
            return element.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        },
        readOuterHeight: function(element) {
            if (!element) return 0;
            var style = getComputedStyle(element);
            return element.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        },
        isMatching: function(element, selector) {
             if (!element || !element.matches) return false;
             return element.matches(selector);
        }
    };


    var ScreenDisplayUnit = function(initialConfig) {

        var standardOptions = {
            allowFlashForFirefox: true,
            forcePlaybackStart: false,
            displayControls: false,
            cycleContent: false,
            hostElement: document.body,
            enableShrinking: false
        };

        var instanceApi = {},
            mediaPlayerRef,
            visualMediaZoneIdentifier = 'visual-content-display',
            enclosureBoxElement,
            aspectRatio = 16/9,
            formattedDuration = '0:00',
            defaultSoundLevel = 0.8,
            isInitialised = false,
            isSeekingProcess = false,
            isContentActive = false,
            isPlaylistEnabled = false,
            isBackgroundContent = false,
            contentManifest = [],
            currentManifestIndex,
            currentDisplayType;

        var runtimeSettings = mergeConfigurations({}, standardOptions);
        mergeConfigurations(runtimeSettings, initialConfig);

        function updateScreenGeometry() {
            var hostContainer = runtimeSettings.hostElement;
            var containerWidth = DomHelper.readOuterWidth(hostContainer) < window.innerWidth ? DomHelper.readOuterWidth(hostContainer) : window.innerWidth;
            var containerHeight = DomHelper.readOuterHeight(hostContainer) < window.innerHeight ? DomHelper.readOuterHeight(hostContainer) : window.innerHeight;
            var containerAspect = containerWidth / containerHeight;

            if (DomHelper.isMatching(hostContainer, 'body')) {
                DomHelper.styleElement(document.documentElement, { height: window.innerHeight > document.body.offsetHeight ? '100%' : 'auto' });
                DomHelper.styleElement(document.body, { height: window.innerHeight > document.body.offsetHeight ? '100%' : 'auto' });
            }

            var videoDisplay = DomHelper.fetchElement('#' + visualMediaZoneIdentifier);
            var imageDisplay = DomHelper.fetchElement('#static-visual-asset');

            if (containerAspect < aspectRatio) {
                // Container is taller (or narrower) than media
                if (currentDisplayType === 'video') {
                    if (mediaPlayerRef) {
                        mediaPlayerRef.width(containerHeight * aspectRatio);
                        mediaPlayerRef.height(containerHeight);
                    }

                    if (!runtimeSettings.enableShrinking) {
                        DomHelper.styleElement(videoDisplay, {
                            top: '0',
                            left: -(containerHeight * aspectRatio - containerWidth) / 2 + 'px',
                            height: containerHeight + 'px',
                            width: (containerHeight * aspectRatio) + 'px'
                        });
                    } else {
                        DomHelper.styleElement(videoDisplay, {
                            top: -(containerWidth / aspectRatio - containerHeight) / 2 + 'px',
                            left: '0',
                            height: (containerWidth / aspectRatio) + 'px',
                            width: containerWidth + 'px'
                        });
                    }
                } else if (currentDisplayType === 'image' && imageDisplay) {
                    DomHelper.styleElement(imageDisplay, {
                        width: 'auto',
                        height: containerHeight + 'px',
                        top: '0',
                        left: -(containerHeight * aspectRatio - containerWidth) / 2 + 'px'
                    });
                }
            } else {
                // Container is wider (or shorter) than media
                if (currentDisplayType === 'video') {
                    if (mediaPlayerRef) {
                        mediaPlayerRef.width(containerWidth);
                        mediaPlayerRef.height(containerWidth / aspectRatio);
                    }
                    DomHelper.styleElement(videoDisplay, {
                        top: -(containerWidth / aspectRatio - containerHeight) / 2 + 'px',
                        left: '0',
                        height: (containerWidth / aspectRatio) + 'px',
                        width: containerWidth + 'px'
                    });
                } else if (currentDisplayType === 'image' && imageDisplay) {
                    DomHelper.styleElement(imageDisplay, {
                        width: containerWidth + 'px',
                        height: 'auto',
                        top: -(containerWidth / aspectRatio - containerHeight) / 2 + 'px',
                        left: '0'
                    });
                }
            }
        }

        var visualProgressSlider = {
            baseElement: null,
            fillBar: null,
            isUserDragging: false,
            initiate: function(trackID, fillID) {
                this.baseElement = DomHelper.fetchElement('#' + trackID);
                this.fillBar = DomHelper.fetchElement('#' + fillID);

                if (!this.baseElement || !this.fillBar) return;

                DomHelper.listen(this.baseElement, 'mousedown', this.onStartDrag.bind(this));
                DomHelper.listen(this.baseElement, 'touchstart', this.onStartDrag.bind(this));
            },
            onStartDrag: function(e) {
                e.preventDefault();
                this.isUserDragging = true;
                this.updateDragPosition(e);
                DomHelper.listen(document, 'mousemove', this.onDragging.bind(this));
                DomHelper.listen(document, 'mouseup', this.onEndDrag.bind(this));
                DomHelper.listen(document, 'touchmove', this.onDragging.bind(this));
                DomHelper.listen(document, 'touchend', this.onEndDrag.bind(this));
                DomHelper.listen(document, 'touchcancel', this.onEndDrag.bind(this));
            },
            onDragging: function(e) {
                if (!this.isUserDragging) return;
                e.preventDefault();
                this.updateDragPosition(e);
            },
            onEndDrag: function(e) {
                if (!this.isUserDragging) return;
                this.isUserDragging = false;
                DomHelper.unlisten(document, 'mousemove', this.onDragging);
                DomHelper.unlisten(document, 'mouseup', this.onEndDrag);
                DomHelper.unlisten(document, 'touchmove', this.onDragging);
                DomHelper.unlisten(document, 'touchend', this.onEndDrag);
                DomHelper.unlisten(document, 'touchcancel', this.onEndDrag);
                isSeekingProcess = false;
            },
            updateDragPosition: function(e) {
                isSeekingProcess = true;
                var clientXCoord = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                if (!clientXCoord) return;

                var trackBounds = this.baseElement.getBoundingClientRect();
                var relativeX = clientXCoord - trackBounds.left;
                var progressFraction = Math.max(0, Math.min(1, relativeX / this.baseElement.offsetWidth));
                
                DomHelper.styleElement(this.fillBar, { width: (progressFraction * 100) + '%' });

                if (mediaPlayerRef && mediaPlayerRef.duration()) {
                    mediaPlayerRef.currentTime(progressFraction * mediaPlayerRef.duration());
                }
            },
            setVisualValue: function(value) { // value is 0-100
                if (!this.isUserDragging) {
                    DomHelper.styleElement(this.fillBar, { width: value + '%' });
                }
            }
        };


        function establishPlaybackInterface() {
            var controlPanel = DomHelper.makeElement('div', 'playback-interface-panel');
            var controlBarLayout = DomHelper.makeElement('div', 'playback-interface-bar');
            var playPauseButton = DomHelper.makeElement('a', 'playback-toggle-button', '', { href: '#' });
            var centerSection = DomHelper.makeElement('div', 'playback-middle-section');
            var progressTrack = DomHelper.makeElement('div', 'progress-timeline-track');
            var progressFill = DomHelper.makeElement('div', 'progress-timeline-fill');
            var timeIndicator = DomHelper.makeElement('div', 'playback-duration-indicator');

            DomHelper.placeElement(progressTrack, progressFill);
            DomHelper.placeElement(centerSection, progressTrack);
            DomHelper.placeElement(controlBarLayout, playPauseButton);
            DomHelper.placeElement(controlBarLayout, centerSection);
            DomHelper.placeElement(controlBarLayout, timeIndicator);
            DomHelper.placeElement(controlPanel, controlBarLayout);
            DomHelper.placeElement(runtimeSettings.hostElement, controlPanel);

            DomHelper.styleElement(controlPanel, { display: 'none' });
            DomHelper.styleElement(timeIndicator, { display: 'none' });

            visualProgressSlider.initiate('progress-timeline-track', 'progress-timeline-fill');

            DomHelper.listen(playPauseButton, 'click', function(e) {
                e.preventDefault();
                executePlaybackCommand('toggle');
            });

            mediaPlayerRef.on('timeupdate', function() {
                if (!isSeekingProcess && mediaPlayerRef.duration()) {
                    var currentTime = mediaPlayerRef.currentTime();
                    var duration = mediaPlayerRef.duration();
                    var minutes = Math.floor(currentTime / 60);
                    var seconds = Math.floor(currentTime) - (60 * minutes);
                    if (seconds < 10) seconds = '0' + seconds;
                    var progressFraction = (currentTime / duration) * 100;

                    visualProgressSlider.setVisualValue(progressFraction);
                    DomHelper.fetchElement('#playback-duration-indicator').textContent = minutes + ':' + seconds + '/' + formattedDuration;
                }
            });
        }

        function executePlaybackCommand(action) {
            action = action || 'toggle';
            if (action === 'toggle') action = isContentActive ? 'pause' : 'play';

            var playButton = DomHelper.fetchElement('#playback-toggle-button');

            if (action === 'pause') {
                mediaPlayerRef.pause();
                DomHelper.styleElement(playButton, { 'background-position': '-16px' });
                isContentActive = false;
            } else if (action === 'play') {
                mediaPlayerRef.play();
                DomHelper.styleElement(playButton, { 'background-position': '0' });
                isContentActive = true;
            } else if (action === 'skip') {
                advanceContentInManifest();
            }
        }

        function activateContinuousPlayback() {
            if (mediaPlayerRef) {
                mediaPlayerRef.play();
            }
            DomHelper.unlisten(runtimeSettings.hostElement, 'click', activateContinuousPlayback);
        }

        function advanceContentInManifest() {
            currentManifestIndex++;
            if (currentManifestIndex === contentManifest.length) currentManifestIndex = 0;
            renderVisualFeed(contentManifest[currentManifestIndex]);
        }

        function renderVisualFeed(source) {
            var imageDisplay = DomHelper.fetchElement('#static-visual-asset');
            if (imageDisplay) DomHelper.removeElement(imageDisplay);
            DomHelper.styleElement(DomHelper.fetchElement('#' + visualMediaZoneIdentifier), { display: 'block' });

            currentDisplayType = 'video';
            mediaPlayerRef.src(source);
            isContentActive = true;

            var controlPanel = DomHelper.fetchElement('#playback-interface-panel');
            if (isBackgroundContent) {
                if (controlPanel) DomHelper.styleElement(controlPanel, { display: 'none' });
                mediaPlayerRef.ready(function(){
                    mediaPlayerRef.volume(0);
                });
                runtimeSettings.cycleContent = true;
            } else {
                if (controlPanel) DomHelper.styleElement(controlPanel, { display: 'block' });
                mediaPlayerRef.ready(function(){
                    mediaPlayerRef.volume(defaultSoundLevel);
                });
                runtimeSettings.cycleContent = false;
            }
            DomHelper.styleElement(DomHelper.fetchElement('#static-visual-asset'), { display: 'none' });
            DomHelper.styleElement(DomHelper.fetchElement('#' + visualMediaZoneIdentifier), { display: 'block' });
        }

        function displayStaticImage(source) {
            if (mediaPlayerRef) mediaPlayerRef.pause();
            DomHelper.styleElement(DomHelper.fetchElement('#' + visualMediaZoneIdentifier), { display: 'none' });

            var controlPanel = DomHelper.fetchElement('#playback-interface-panel');
            if (controlPanel) DomHelper.styleElement(controlPanel, { display: 'none' });

            var existingImage = DomHelper.fetchElement('#static-visual-asset');
            if (existingImage) DomHelper.removeElement(existingImage);

            currentDisplayType = 'image';
            var newImage = DomHelper.makeElement('img', 'static-visual-asset', '', { src: source });
            DomHelper.placeElement(enclosureBoxElement, newImage);

            var imageLoader = new Image();
            imageLoader.onload = function() {
                aspectRatio = this.width / this.height;
                updateScreenGeometry();
            };
            imageLoader.src = source;
        }

        instanceApi.initializeSystem = function() {
            if (!isInitialised) {
                enclosureBoxElement = DomHelper.makeElement('div', 'primary-media-wrapper');
                runtimeSettings.hostElement.prepend(enclosureBoxElement);

                var autoPlaySetting = runtimeSettings.forcePlaybackStart ? 'autoplay' : '';
                var videoElement = DomHelper.makeElement('video', visualMediaZoneIdentifier, 'video-js vjs-minimal-theme', {
                    height: '1',
                    width: '1',
                    preload: 'auto',
                    'data-setup': '{}',
                    [autoPlaySetting ? 'autoplay' : '']: autoPlaySetting,
                    webkitplaysinline: ''
                });
                DomHelper.styleElement(videoElement, { position: 'absolute' });
                DomHelper.placeElement(enclosureBoxElement, videoElement);

                var techOrderSequence = ['html5', 'flash'];
                var userAgent = navigator.userAgent.toLowerCase();
                var isFirefoxBrowser = userAgent.indexOf('firefox') !== -1;
                if (runtimeSettings.allowFlashForFirefox && isFirefoxBrowser) {
                    techOrderSequence = ['flash', 'html5'];
                }

                mediaPlayerRef = videojs(visualMediaZoneIdentifier, {
                    controls: false,
                    autoplay: true,
                    preload: 'auto',
                    techOrder: techOrderSequence
                });

                if (runtimeSettings.displayControls) establishPlaybackInterface();

                updateScreenGeometry();
                isInitialised = true;
                isContentActive = false;

                if (runtimeSettings.forcePlaybackStart) {
                    DomHelper.listen(document.body, 'click', activateContinuousPlayback);
                }

                var flashApiElement = DomHelper.fetchElement('#' + visualMediaZoneIdentifier + '_flash_api');
                if (flashApiElement) {
                    flashApiElement.setAttribute('scale', 'noborder');
                    flashApiElement.setAttribute('width', '100%');
                    flashApiElement.setAttribute('height', '100%');
                }

                DomHelper.listen(window, 'resize', updateScreenGeometry);

                mediaPlayerRef.on('loadedmetadata', function() {
                    var html5Player = DomHelper.fetchElement('#' + visualMediaZoneIdentifier + '_html5_api');
                    var flashPlayer = DomHelper.fetchElement('#' + visualMediaZoneIdentifier + '_flash_api');

                    if (flashPlayer && flashPlayer.vjs_getProperty) {
                        aspectRatio = flashPlayer.vjs_getProperty('videoWidth') / flashPlayer.vjs_getProperty('videoHeight');
                    } else if (html5Player) {
                        aspectRatio = html5Player.videoWidth / html5Player.videoHeight;
                    }
                    updateScreenGeometry();

                    var durationSeconds = Math.round(mediaPlayerRef.duration());
                    var durationMinutes = Math.floor(durationSeconds / 60);
                    var remainingSeconds = durationSeconds - durationMinutes * 60;
                    if (remainingSeconds < 10) remainingSeconds = '0' + remainingSeconds;
                    formattedDuration = durationMinutes + ':' + remainingSeconds;
                });

                mediaPlayerRef.on('ended', function() {
                    if (runtimeSettings.cycleContent) {
                        mediaPlayerRef.currentTime(0);
                        mediaPlayerRef.play();
                    }
                    if (isPlaylistEnabled) {
                        advanceContentInManifest();
                    }
                });
            }
        };

        instanceApi.presentContent = function(contentSource, presentationOptions) {
            presentationOptions = presentationOptions || {};
            isBackgroundContent = presentationOptions.ambient === true;
            if (isBackgroundContent || presentationOptions.cycleContent) runtimeSettings.cycleContent = true;

            if (typeof contentSource === 'string') {
                var fileExtension = (contentSource.lastIndexOf('?') > 0) ? contentSource.substring(contentSource.lastIndexOf('.') + 1, contentSource.lastIndexOf('?')) : contentSource.substring(contentSource.lastIndexOf('.') + 1);
                fileExtension = fileExtension.toLowerCase();

                if (fileExtension === 'jpg' || fileExtension === 'gif' || fileExtension === 'png') {
                    displayStaticImage(contentSource);
                    if (presentationOptions.onShown) presentationOptions.onShown();
                    isPlaylistEnabled = false;
                } else if (fileExtension === 'mp4' || fileExtension === 'ogg' || fileExtension === 'ogv' || fileExtension === 'webm') {
                    renderVisualFeed(contentSource);
                    if (presentationOptions.onShown) presentationOptions.onShown();
                    isPlaylistEnabled = false;
                } else {
                    throw new Error("ScreenDisplayUnit.presentContent received invalid media file type from string source.");
                }
            } else if (Array.isArray(contentSource)) {
                renderVisualFeed(contentSource);
                if (presentationOptions.onShown) presentationOptions.onShown();
                isPlaylistEnabled = false;
            } else if (typeof contentSource === "object" && contentSource.src && contentSource.type) {
                renderVisualFeed([contentSource]);
                if (presentationOptions.onShown) presentationOptions.onShown();
                isPlaylistEnabled = false;
            } else {
                throw new Error("ScreenDisplayUnit.presentContent received invalid input for contentSource parameter");
            }
        };

        instanceApi.queueMedia = function(mediaFiles, queueConfiguration) {
            if (!Array.isArray(mediaFiles)) {
                throw new Error("ScreenDisplayUnit.queueMedia parameter mediaFiles accepts only arrays");
            }

            queueConfiguration = queueConfiguration || {};
            isBackgroundContent = queueConfiguration.ambient === true;
            if (isBackgroundContent || queueConfiguration.cycleContent) runtimeSettings.cycleContent = true;

            contentManifest = mediaFiles;
            currentManifestIndex = 0;
            this.presentContent(contentManifest[currentManifestIndex], queueConfiguration);
            isPlaylistEnabled = true;
        };

        instanceApi.retrievePlayerInstance = function() {
            return mediaPlayerRef;
        };

        instanceApi.decommission = function() {
            isInitialised = false;

            DomHelper.removeElement(enclosureBoxElement);
            DomHelper.unlisten(window, 'resize', updateScreenGeometry);
            DomHelper.unlisten(document.body, 'click', activateContinuousPlayback);

            if (mediaPlayerRef) {
                mediaPlayerRef.off('loadedmetadata');
                mediaPlayerRef.off('ended');
                mediaPlayerRef.off('timeupdate');
                mediaPlayerRef.dispose();
            }

            DomHelper.unlisten(visualProgressSlider.baseElement, 'mousedown', visualProgressSlider.onStartDrag);
            DomHelper.unlisten(visualProgressSlider.baseElement, 'touchstart', visualProgressSlider.onStartDrag);

            mediaPlayerRef = null;
            enclosureBoxElement = null;
            aspectRatio = 16/9;
            formattedDuration = '0:00';
            isInitialised = false;
            isSeekingProcess = false;
            isContentActive = false;
            isPlaylistEnabled = false;
            isBackgroundContent = false;
            contentManifest = [];
            currentManifestIndex = undefined;
            currentDisplayType = undefined;
        };

        instanceApi.signalPlaybackCommand = function(command) {
            executePlaybackCommand(command);
        };

        return instanceApi;
    };

    window.VisualContentDisplay = function(config) {
        return new ScreenDisplayUnit(config);
    };

})(window, window.videojs);