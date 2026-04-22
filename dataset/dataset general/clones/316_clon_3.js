(function(jqAlias) {
    'use strict';

    /**
     * Custom HTML5 Audio Player UI Generator
     *
     * This script intercepts native audio elements with 'controls' attribute
     * and replaces them with a feature-rich, styled custom player interface.
     * It leverages Bootstrap for styling and jQuery for DOM manipulation.
     * Metadata and feature toggles are read from data attributes on the audio tag.
     *
     * @param {jQuery} jqAlias - The jQuery object passed as an argument.
     */
    jqAlias('audio[controls]').before(function() {
        const originalAudioElement = this; // Reference to the native audio element

        // Pre-flight check: Ensure the audio element is valid before proceeding.
        if (!(originalAudioElement instanceof HTMLAudioElement)) {
            console.warn('Skipping element as it is not a valid audio element:', originalAudioElement);
            return;
        }

        jqAlias(originalAudioElement).prop('controls', false); // Disable native controls immediately

        // --- Configuration and Utility Constants ---
        const playerClassPrefix = 'custom-audio-player-';
        const commonClasses = {
            wrapper: playerClassPrefix + 'well container-fluid',
            detailsToggle: 'btn btn-block',
            detailsCollapsed: 'collapse',
            controlsGroup: 'btn-group row-fluid',
            infoTable: 'table table-condensed',
            playbackBtn: 'btn disabled span1', // Note: span classes are deprecated in Bootstrap 4+
            seekWrapper: 'btn disabled span4',
            timeDisplay: 'btn span3',
            volumeWrapper: 'btn disabled span3',
            albumArt: 'thumbnail',
            attributionText: 'pull-right muted'
        };

        const iconClasses = {
            details: 'icon-reorder',
            play: 'icon-play',
            pause: 'icon-pause',
            spinner: 'icon-spinner icon-spin',
            volumeUp: 'icon-volume-up',
            volumeDown: 'icon-volume-down',
            volumeOff: 'icon-volume-off'
        };

        const dataAttrMap = { // Mapping for data attributes
            albumArt: 'infoAlbumArt',
            artist: 'infoArtist',
            title: 'infoTitle',
            albumTitle: 'infoAlbumTitle',
            label: 'infoLabel',
            year: 'infoYear',
            attribution: 'infoAtt',
            attributionLink: 'infoAttLink'
        };

        const featureToggleMap = { // Mapping for feature toggles
            play: 'play',
            seek: 'seek',
            time: 'time',
            mute: 'mute',
            volume: 'volume'
        };

        // --- Core UI Component Creation ---
        const uiWrapper = document.createElement('div');
        const $uiWrapper = jqAlias(uiWrapper);
        $uiWrapper.addClass(jqAlias(originalAudioElement).attr('class') + ' ' + commonClasses.wrapper);

        const metadataSection = document.createElement('section');
        const $metadataSection = jqAlias(metadataSection);
        $metadataSection.addClass(commonClasses.detailsCollapsed);

        const toggleButtonsContainer = document.createElement('div');
        const $toggleButtonsContainer = jqAlias(toggleButtonsContainer);
        $toggleButtonsContainer.addClass(commonClasses.controlsGroup);

        const detailsExpanderButton = document.createElement('a');
        const $detailsExpanderButton = jqAlias(detailsExpanderButton);
        $detailsExpanderButton.html(`<i class="${iconClasses.details}"></i>`);
        $detailsExpanderButton.addClass(commonClasses.detailsToggle);
        $detailsExpanderButton.css('opacity', 0.3); // Apply a subtle visual effect
        $detailsExpanderButton.attr('title', 'Track Information');
        $detailsExpanderButton.tooltip({ 'container': 'body', 'placement': 'top', 'html': true });
        $detailsExpanderButton.on('click', function() {
            $metadataSection.collapse('toggle');
        });
        $toggleButtonsContainer.append(detailsExpanderButton);

        const trackInfoTable = document.createElement('table');
        const $trackInfoTable = jqAlias(trackInfoTable);
        $trackInfoTable.addClass(commonClasses.infoTable);

        const mainPlaybackPanel = document.createElement('section');
        const $mainPlaybackPanel = jqAlias(mainPlaybackPanel);
        $mainPlaybackPanel.addClass(commonClasses.controlsGroup);

        // --- Centralized Error Handling Function ---
        const indicatePlayerError = function(issueMessage = 'An unexpected playback error occurred.') {
            console.error('Audio player error:', issueMessage, originalAudioElement.src);
            $uiWrapper.find('.btn').addClass('disabled'); // Disable all buttons
            $uiWrapper.find('input[type="range"]').hide(); // Hide sliders
            const spinnerIcon = $uiWrapper.find(`.${iconClasses.spinner.split(' ')[0]}`);
            spinnerIcon.text('Error').removeClass(iconClasses.spinner);
            spinnerIcon.parent().attr('title', `Playback Issue: ${issueMessage}`);
            spinnerIcon.parent().tooltip('fixTitle');
            jqAlias(originalAudioElement).off(); // Detach all event listeners from the audio element to prevent further issues
        };

        // --- Feature Enablement Check Utility ---
        const checkFeatureEnabled = (featureKey) => {
            const dataAttribute = featureToggleMap[featureKey];
            if (!dataAttribute) return false; // Feature key not mapped

            const dataValue = jqAlias(originalAudioElement).data(dataAttribute);
            return dataValue !== 'off' && dataValue !== false;
        };

        // --- Play/Pause Control Module ---
        const createPlaybackButton = function() {
            const playPauseBtn = document.createElement('button');
            const $playPauseBtn = jqAlias(playPauseBtn);
            $playPauseBtn.addClass(commonClasses.playbackBtn);

            let currentPlayState = 'play'; // Internal state tracker

            const applyButtonIconAndHandler = function(newState) {
                if (newState === 'play') {
                    $playPauseBtn.html(`<i class="${iconClasses.play}"></i>`);
                    $playPauseBtn.off('click').on('click', () => originalAudioElement.play());
                    currentPlayState = 'play';
                } else if (newState === 'pause') {
                    $playPauseBtn.html(`<i class="${iconClasses.pause}"></i>`);
                    $playPauseBtn.off('click').on('click', () => originalAudioElement.pause());
                    currentPlayState = 'pause';
                }
                $playPauseBtn.removeClass('disabled'); // Enable button once functional
            };

            // Bind audio element events to update button state
            jqAlias(originalAudioElement).on('play', () => applyButtonIconAndHandler('pause'));
            jqAlias(originalAudioElement).on('pause', () => applyButtonIconAndHandler('play'));
            jqAlias(originalAudioElement).on('canplay', () => applyButtonIconAndHandler('play'));
            jqAlias(originalAudioElement).on('ended', () => applyButtonIconAndHandler('play')); // Reset to play icon on track end

            // Implement a robust initial loading check using polling
            let loadAttemptCounter = 0;
            const maxLoadAttempts = 150; // 150 attempts * 50ms interval = 7.5 seconds
            const loadPollingInterval = setInterval(() => {
                // If duration is available and enough data buffered, player is ready
                if (!isNaN(originalAudioElement.duration) && originalAudioElement.readyState >= originalAudioElement.HAVE_CURRENT_DATA) {
                    applyButtonIconAndHandler('play');
                    clearInterval(loadPollingInterval);
                    return;
                }
                // If network error or max attempts reached, signal error
                if (originalAudioElement.networkState === originalAudioElement.NETWORK_NO_SOURCE || loadAttemptCounter >= maxLoadAttempts) {
                    indicatePlayerError('Failed to load audio source due to network or timeout.');
                    clearInterval(loadPollingInterval);
                    return;
                }
                loadAttemptCounter++;
            }, 50);

            $mainPlaybackPanel.append(playPauseBtn);
        };

        // --- Seek Bar Control Module ---
        const constructSeekSlider = function() {
            const seekInput = document.createElement('input');
            const $seekInput = jqAlias(seekInput);
            $seekInput.attr({
                'type': 'range',
                'min': 0,
                'value': 0,
                'class': 'seek-bar'
            });

            // Helper to dynamically generate the CSS background gradient for progress visualization
            const computeProgressBarGradient = function() {
                const currentTime = originalAudioElement.currentTime;
                const duration = originalAudioElement.duration;
                if (isNaN(duration) || duration === 0) return 'none';

                let gradientSegments = [];
                const playedPercentage = (currentTime / duration) * 100;

                // Segment for the played portion (typically green)
                gradientSegments.push(`rgba(223, 240, 216, 1) 0%`);
                gradientSegments.push(`rgba(223, 240, 216, 1) ${playedPercentage}%`);
                gradientSegments.push(`rgba(223, 240, 216, 0) ${playedPercentage}%`);

                // Segments for buffered ranges (typically blue)
                for (let i = 0; i < originalAudioElement.buffered.length; i++) {
                    const bufferStart = originalAudioElement.buffered.start(i);
                    const bufferEnd = originalAudioElement.buffered.end(i);

                    // Only consider buffers that are valid and extend past current time
                    if (!isNaN(bufferStart) && !isNaN(bufferEnd) && bufferEnd > currentTime) {
                        const effectiveBufferStart = Math.max(currentTime, bufferStart); // Buffer starts from current time if it's before
                        const startPercent = (effectiveBufferStart / duration) * 100;
                        const endPercent = (bufferEnd / duration) * 100;

                        gradientSegments.push(`rgba(217, 237, 247, 0) ${startPercent}%`);
                        gradientSegments.push(`rgba(217, 237, 247, 1) ${startPercent}%`);
                        gradientSegments.push(`rgba(217, 237, 247, 1) ${endPercent}%`);
                        gradientSegments.push(`rgba(217, 237, 247, 0) ${endPercent}%`);
                    }
                }
                return `-webkit-linear-gradient(left, ${gradientSegments.join(', ')})`;
            };

            const refreshSeekSliderDisplay = function() {
                const duration = originalAudioElement.duration;
                if (!isNaN(duration) && duration > 0) {
                    $seekInput.prop('max', duration);
                    $seekInput.prop('step', duration / 1000); // More granular steps for smoother seeking
                    $seekInput.val(originalAudioElement.currentTime);
                    $seekInput.css('background', computeProgressBarGradient());
                    $seekInput.css('background-color', '#ddd'); // Base background color
                }
            };

            const handleSliderValueChange = function() {
                originalAudioElement.currentTime = parseFloat($seekInput.val());
                refreshSeekSliderDisplay(); // Update gradient immediately after seeking
            };

            const resetOnMediaEnd = function() {
                $seekInput.val(0);
                originalAudioElement.currentTime = 0;
                refreshSeekSliderDisplay();
                if (!originalAudioElement.loop) { // Only pause if not looping
                    originalAudioElement.pause();
                } else {
                    originalAudioElement.play(); // Restart if looping
                }
            };

            // Bind events for slider updates
            jqAlias(originalAudioElement).on('loadedmetadata loadeddata canplay canplaythrough', refreshSeekSliderDisplay);
            jqAlias(originalAudioElement).on('timeupdate progress', refreshSeekSliderDisplay);
            jqAlias(originalAudioElement).on('ended', resetOnMediaEnd);
            $seekInput.on('input change', handleSliderValueChange); // 'input' for continuous, 'change' for final value

            // Initial setup if audio is already loaded (e.g., from cache)
            if (originalAudioElement.readyState > 0) {
                refreshSeekSliderDisplay();
            }

            const seekWrapperDiv = document.createElement('div');
            const $seekWrapperDiv = jqAlias(seekWrapperDiv);
            $seekWrapperDiv.addClass(commonClasses.seekWrapper);
            $seekWrapperDiv.append(seekInput);
            $mainPlaybackPanel.append(seekWrapperDiv);
        };

        // --- Time Display Module ---
        const generateTimeDisplay = function() {
            const timeAnchor = document.createElement('a');
            const $timeAnchor = jqAlias(timeAnchor);
            $timeAnchor.addClass(commonClasses.timeDisplay);
            $timeAnchor.tooltip({ 'container': 'body', 'placement': 'right', 'html': true });

            // Utility function to ensure numbers are always two digits (e.g., 5 -> "05")
            const padWithZero = (num) => String(Math.floor(num)).padStart(2, '0');

            // Utility function to format total seconds into H:MM:SS string
            const formatSecondsAsTime = (totalSeconds) => {
                if (isNaN(totalSeconds) || !isFinite(totalSeconds)) {
                    return `<i class="${iconClasses.spinner}"></i>`; // Show spinner if duration is not available
                }
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = Math.floor(totalSeconds % 60);

                let formattedTime = `${padWithZero(minutes)}:${padWithZero(seconds)}`;
                if (hours > 0) {
                    formattedTime = `${hours}:${formattedTime}`;
                }
                return formattedTime;
            };

            const updateTimeDisplayContent = function() {
                const current = originalAudioElement.currentTime;
                const total = originalAudioElement.duration;

                const currentFormatted = formatSecondsAsTime(current);
                const totalFormatted = formatSecondsAsTime(total);

                let displayHtml = '';
                let tooltipContent = '';

                if (isNaN(total) || total === 0) {
                    displayHtml = `<i class="${iconClasses.spinner}"></i>`;
                    tooltipContent = 'Loading duration...';
                } else {
                    if (!originalAudioElement.paused) {
                        displayHtml = currentFormatted; // Show current time during playback
                        tooltipContent = `Click to Reset<hr style="padding:0; margin:0;" />Length: ${totalFormatted}`;
                    } else {
                        displayHtml = totalFormatted; // Show total duration when paused
                        tooltipContent = `Click to Reset<hr style="padding:0; margin:0;" />Position: ${currentFormatted}`;
                    }
                }
                $timeAnchor.html(displayHtml);
                $timeAnchor.attr('title', tooltipContent);
                $timeAnchor.tooltip('fixTitle'); // Update tooltip content
            };

            $timeAnchor.on('click', function() {
                originalAudioElement.pause();
                originalAudioElement.currentTime = 0;
                updateTimeDisplayContent();
                $timeAnchor.tooltip('fixTitle');
                $timeAnchor.tooltip('show'); // Show tooltip after reset
            });

            // Bind various events to keep the time display updated
            jqAlias(originalAudioElement).on('loadedmetadata loadeddata progress canplay canplaythrough timeupdate', updateTimeDisplayContent);

            // Set initial state
            if (originalAudioElement.readyState > 0) {
                updateTimeDisplayContent();
            } else {
                $timeAnchor.html(`<i class="${iconClasses.spinner}"></i>`);
            }
            $mainPlaybackPanel.append(timeAnchor);
        };

        // --- Mute Control Module ---
        const buildMuteButton = function() {
            const muteBtn = document.createElement('button');
            const $muteBtn = jqAlias(muteBtn);
            $muteBtn.addClass(commonClasses.playbackBtn); // Reusing a general button class

            let lastKnownVolume = originalAudioElement.volume || 1; // Store volume before muting

            const updateMuteIcon = function() {
                if (originalAudioElement.muted || originalAudioElement.volume === 0) {
                    $muteBtn.html(`<i class="${iconClasses.volumeOff}"></i>`);
                } else if (originalAudioElement.volume <= 0.5) {
                    $muteBtn.html(`<i class="${iconClasses.volumeDown}"></i>`);
                } else {
                    $muteBtn.html(`<i class="${iconClasses.volumeUp}"></i>`);
                }
            };

            $muteBtn.on('click', function() {
                if (originalAudioElement.muted) {
                    originalAudioElement.muted = false;
                    originalAudioElement.volume = lastKnownVolume; // Restore to last non-zero volume
                } else {
                    originalAudioElement.muted = true;
                    lastKnownVolume = originalAudioElement.volume; // Save current volume before muting
                    originalAudioElement.volume = 0;
                }
                updateMuteIcon();
            });

            jqAlias(originalAudioElement).on('volumechange', updateMuteIcon);
            updateMuteIcon(); // Set initial icon state
            $mainPlaybackPanel.append(muteBtn);
        };

        // --- Volume Slider Module ---
        const createVolumeSlider = function() {
            const volumeInput = document.createElement('input');
            const $volumeInput = jqAlias(volumeInput);
            $volumeInput.attr({
                'type': 'range',
                'min': 0,
                'max': 1,
                'step': 0.01, // Finer control for volume
                'value': originalAudioElement.volume || 1 // Initialize with current volume
            });

            const handleVolumeSliderInput = function() {
                originalAudioElement.muted = false; // Unmute if user adjusts volume
                originalAudioElement.volume = parseFloat($volumeInput.val());
            };

            const synchronizeSliderToAudioVolume = function() {
                $volumeInput.val(originalAudioElement.volume);
            };

            const volumeWrapperDiv = document.createElement('div');
            const $volumeWrapperDiv = jqAlias(volumeWrapperDiv);
            $volumeWrapperDiv.addClass(commonClasses.volumeWrapper);
            $volumeWrapperDiv.append(volumeInput);

            $volumeInput.on('input change', handleVolumeSliderInput);
            jqAlias(originalAudioElement).on('volumechange', synchronizeSliderToAudioVolume);

            // Ensure slider reflects current audio volume initially
            synchronizeSliderToAudioVolume();

            $mainPlaybackPanel.append(volumeWrapperDiv);
        };

        // --- Metadata Display Modules ---
        const addAlbumArtwork = function() {
            const albumArtUrl = jqAlias(originalAudioElement).data(dataAttrMap.albumArt);
            if (albumArtUrl) {
                const artworkImg = document.createElement('img');
                jqAlias(artworkImg).addClass(commonClasses.albumArt);
                jqAlias(artworkImg).attr('src', albumArtUrl);
                $metadataSection.append(artworkImg);
                return true;
            }
            return false;
        };

        const createMetadataRow = function(label, dataKeyAlias) {
            const dataAttribute = dataAttrMap[dataKeyAlias];
            if (!dataAttribute) return false;

            const value = jqAlias(originalAudioElement).data(dataAttribute);
            if (value !== undefined && value !== null && String(value).trim() !== '') { // Check for non-empty string
                const dataRow = document.createElement('tr');
                const headerCell = document.createElement('th');
                const dataCell = document.createElement('td');
                jqAlias(headerCell).html(label);
                jqAlias(dataCell).html(value);
                jqAlias(dataRow).append(headerCell, dataCell);
                $trackInfoTable.append(dataRow);
                return true; // Indicate that a row was successfully added
            }
            return false;
        };

        const populateMetadataSection = function() {
            let anyMetadataAdded = false;

            // Attempt to add album art
            anyMetadataAdded = addAlbumArtwork();

            // Attempt to add textual metadata rows
            anyMetadataAdded = createMetadataRow('Artist', 'artist') || anyMetadataAdded;
            anyMetadataAdded = createMetadataRow('Title', 'title') || anyMetadataAdded;
            anyMetadataAdded = createMetadataRow('Album', 'albumTitle') || anyMetadataAdded;
            anyMetadataAdded = createMetadataRow('Label', 'label') || anyMetadataAdded;
            anyMetadataAdded = createMetadataRow('Year', 'year') || anyMetadataAdded;

            // Only append metadata UI elements if actual metadata was found
            if (anyMetadataAdded) {
                $metadataSection.append(trackInfoTable);
                $uiWrapper.append(toggleButtonsContainer);
                $uiWrapper.append(metadataSection);
            }
        };

        // --- Player Controls Assembly ---
        const assemblePlaybackControls = function() {
            if (checkFeatureEnabled('play')) { createPlaybackButton(); }
            if (checkFeatureEnabled('seek')) { constructSeekSlider(); }
            if (checkFeatureEnabled('time')) { generateTimeDisplay(); }
            if (checkFeatureEnabled('mute')) { buildMuteButton(); }
            if (checkFeatureEnabled('volume')) { createVolumeSlider(); }
            $uiWrapper.append(mainPlaybackPanel);
        };

        // --- Attribution Display Module ---
        const createAttributionDisplay = function() {
            const attributionText = jqAlias(originalAudioElement).data(dataAttrMap.attribution);
            const attributionLink = jqAlias(originalAudioElement).data(dataAttrMap.attributionLink);

            if (attributionText) {
                const smallAttribution = document.createElement('small');
                const $smallAttribution = jqAlias(smallAttribution);
                $smallAttribution.addClass(commonClasses.attributionText);

                if (attributionLink) {
                    const linkElement = document.createElement('a');
                    jqAlias(linkElement).addClass('muted');
                    jqAlias(linkElement).attr('href', attributionLink);
                    jqAlias(linkElement).html(attributionText);
                    $smallAttribution.append(linkElement);
                } else {
                    $smallAttribution.html(attributionText);
                }
                $uiWrapper.append(smallAttribution);
            }
        };

        // --- Main Initialization Sequence for the Custom Player ---
        const initializeCustomPlayer = function() {
            populateMetadataSection();
            assemblePlaybackControls();
            createAttributionDisplay(); // Always attempt to add attribution if data is present

            // Register a final, catch-all error listener on the audio element
            jqAlias(originalAudioElement).on('error', function() {
                indicatePlayerError('The audio element reported a general error.');
            });
        };

        // Execute the main initialization routine
        initializeCustomPlayer();

        // Return the newly constructed player UI wrapper for insertion into the DOM
        return uiWrapper;
    });
})(jQuery);