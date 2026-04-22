(function() {
    'use strict';

    // Utility function to get elements, replacing jQuery's $()
    const acquireElements = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    // Custom Tooltip Class to replace Bootstrap/jQuery tooltip functionality
    class InformationBubble {
        constructor(triggerElement, settings) {
            this.activator = triggerElement;
            this.config = {
                placement: 'top',
                markupContent: false,
                containerElement: 'body',
                ...settings
            };
            this.bubbleElement = null;
            this.currentDisplayContent = this.activator.getAttribute('title') || '';
            this.activator.removeAttribute('title'); // Prevent native tooltip

            this.activator.addEventListener('mouseenter', this.showBubble.bind(this));
            this.activator.addEventListener('mouseleave', this.hideBubble.bind(this));
        }

        generateBubbleContent(content) {
            if (!this.bubbleElement) {
                this.bubbleElement = document.createElement('div');
                this.bubbleElement.classList.add('custom-info-bubble'); // Unique class name
                this.bubbleElement.style.position = 'absolute';
                this.bubbleElement.style.visibility = 'hidden';
                this.bubbleElement.style.opacity = '0';
                this.bubbleElement.style.transition = 'opacity 0.2s';
                this.bubbleElement.style.zIndex = '10000';
                this.bubbleElement.style.padding = '5px 10px';
                this.bubbleElement.style.backgroundColor = 'rgba(0,0,0,0.8)';
                this.bubbleElement.style.color = '#fff';
                this.bubbleElement.style.borderRadius = '3px';
                this.bubbleElement.style.fontSize = '12px';
                this.bubbleElement.style.maxWidth = '250px';
                document.querySelector(this.config.containerElement).appendChild(this.bubbleElement);
            }
            if (this.config.markupContent) {
                this.bubbleElement.innerHTML = content;
            } else {
                this.bubbleElement.textContent = content;
            }
        }

        positionBubble() {
            if (!this.bubbleElement) return;
            const activatorRect = this.activator.getBoundingClientRect();
            const bubbleRect = this.bubbleElement.getBoundingClientRect();
            // const containerRect = document.querySelector(this.config.containerElement).getBoundingClientRect(); // Not strictly needed if positioning relative to viewport

            let verticalPos, horizontalPos;

            switch (this.config.placement) {
                case 'top':
                    verticalPos = activatorRect.top - bubbleRect.height - 5;
                    horizontalPos = activatorRect.left + (activatorRect.width / 2) - (bubbleRect.width / 2);
                    break;
                case 'right':
                    verticalPos = activatorRect.top + (activatorRect.height / 2) - (bubbleRect.height / 2);
                    horizontalPos = activatorRect.right + 5;
                    break;
                default: // Default to bottom
                    verticalPos = activatorRect.bottom + 5;
                    horizontalPos = activatorRect.left + (activatorRect.width / 2) - (bubbleRect.width / 2);
            }

            this.bubbleElement.style.top = `${verticalPos + window.scrollY}px`;
            this.bubbleElement.style.left = `${horizontalPos + window.scrollX}px`;
        }

        showBubble(content = this.currentDisplayContent) {
            this.generateBubbleContent(content);
            this.bubbleElement.style.visibility = 'visible';
            this.bubbleElement.style.opacity = '1';
            this.positionBubble();
        }

        hideBubble() {
            if (this.bubbleElement) {
                this.bubbleElement.style.opacity = '0';
                this.bubbleElement.style.visibility = 'hidden';
            }
        }

        updateContent(newContent) {
            this.currentDisplayContent = newContent;
            if (this.bubbleElement && this.bubbleElement.style.visibility === 'visible') {
                 this.showBubble(newContent);
            }
        }
    }

    // Main processing function for each media element
    function processMediaElement(mediaSource) {
        mediaSource.controls = false; // Disable native controls

        const topContainer = document.createElement('div');
        topContainer.classList.add(mediaSource.className, 'media-playback-wrapper', 'fluid-layout', 'custom-audio-interface');
        
        const detailsPanel = document.createElement('section');
        detailsPanel.classList.add('hidden-section'); // Custom class for hidden state
        detailsPanel.style.display = 'none'; // Initially hidden

        const controlButtonCluster = document.createElement('div');
        controlButtonCluster.classList.add('button-group-cluster', 'row-orientation');

        const detailsActivationButton = document.createElement('a');
        detailsActivationButton.innerHTML = '<i class="reorder-icon-custom"></i>'; // Custom icon class
        detailsActivationButton.classList.add('action-control-button', 'block-style-button');
        detailsActivationButton.style.opacity = '0.3';
        detailsActivationButton.title = 'Details'; // For initial tooltip content
        
        const detailsInfoBubble = new InformationBubble(detailsActivationButton, { containerElement: 'body', placement: 'top', markupContent: true });
        
        detailsActivationButton.addEventListener('click', () => {
            if (detailsPanel.style.display === 'none') {
                detailsPanel.style.display = 'block';
                detailsActivationButton.classList.add('active-state-toggle');
            } else {
                detailsPanel.style.display = 'none';
                detailsActivationButton.classList.remove('active-state-toggle');
            }
        });
        controlButtonCluster.appendChild(detailsActivationButton);

        const metadataGrid = document.createElement('table');
        metadataGrid.classList.add('condensed-data-table');

        const mainPlaybackArea = document.createElement('section');
        mainPlaybackArea.classList.add('button-group-cluster', 'row-orientation');

        // Handler for playback errors
        const signalInterfaceError = () => {
            console.error('An error occurred during audio playback.');
            topContainer.querySelectorAll('.action-control-button').forEach(btn => btn.classList.add('disabled-interface-control'));
            topContainer.querySelectorAll('input[type="range"]').forEach(range => range.style.display = 'none');
            const spinningIcon = topContainer.querySelector('.spinner-icon-custom');
            if (spinningIcon) {
                spinningIcon.textContent = 'Error';
                spinningIcon.parentNode.title = 'Failed to load audio content.';
                // If tooltip is active, update its content
                // For this custom tooltip, we'd call updateContent if it existed on the parent.
                spinningIcon.classList.remove('spinner-icon-custom', 'rotate-animation');
            }
        };

        // Function to construct play/pause control
        const buildPlayPauseControl = () => {
            const playPauseButton = document.createElement('button');
            playPauseButton.classList.add('action-control-button', 'disabled-interface-control', 'flex-span-one');

            let currentActionHandler = null;

            const updatePlayPauseState = (state) => {
                playPauseButton.classList.remove('disabled-interface-control');
                if (currentActionHandler) {
                    playPauseButton.removeEventListener('click', currentActionHandler);
                }

                if (state === 'initiate') {
                    playPauseButton.innerHTML = '<i class="play-icon-custom"></i>';
                    currentActionHandler = () => mediaSource.play();
                } else if (state === 'pause') {
                    playPauseButton.innerHTML = '<i class="pause-icon-custom"></i>';
                    currentActionHandler = () => mediaSource.pause();
                }
                playPauseButton.addEventListener('click', currentActionHandler);
            };

            mediaSource.addEventListener('play', () => updatePlayPauseState('pause'));
            mediaSource.addEventListener('canplay', () => updatePlayPauseState('initiate'));
            mediaSource.addEventListener('pause', () => updatePlayPauseState('initiate'));

            let checkCount = 0;
            const maxChecks = 75;
            const checkInterval = setInterval(() => {
                if (!isNaN(mediaSource.duration) && mediaSource.readyState >= 2) {
                    updatePlayPauseState('initiate');
                    clearInterval(checkInterval);
                } else if (mediaSource.networkState === 3 || checkCount >= maxChecks) {
                    signalInterfaceError();
                    clearInterval(checkInterval);
                }
                checkCount++;
            }, 50);

            mainPlaybackArea.appendChild(playPauseButton);
        };

        // Function to create time progression slider
        const createProgressionSlider = () => {
            const progressionInput = document.createElement('input');
            progressionInput.setAttribute('type', 'range');
            progressionInput.setAttribute('min', '0');
            progressionInput.setAttribute('value', '0');
            progressionInput.classList.add('progression-slider');

            const refreshProgressionBackground = () => {
                let gradientString = 'rgba(223, 240, 216, 1) 0%';
                const currentProgressPct = (mediaSource.currentTime / mediaSource.duration) * 100;
                gradientString += `, rgba(223, 240, 216, 1) ${currentProgressPct}%`;
                gradientString += `, rgba(223, 240, 216, 0) ${currentProgressPct}%`;

                for (let i = 0; i < mediaSource.buffered.length; i++) {
                    const bufferEndValue = mediaSource.buffered.end(i);
                    const bufferStartValue = mediaSource.buffered.start(i);

                    if (bufferEndValue > mediaSource.currentTime && !isNaN(bufferEndValue) && !isNaN(bufferStartValue)) {
                        let bufferStartPercent;
                        let bufferEndPercent = (bufferEndValue / mediaSource.duration) * 100;
                        if (bufferEndValue >= mediaSource.duration) bufferEndPercent = 100;

                        bufferStartPercent = (bufferStartValue / mediaSource.duration) * 100;
                        if (bufferStartValue <= mediaSource.currentTime) bufferStartPercent = (mediaSource.currentTime / mediaSource.duration) * 100;
                        
                        gradientString += `, rgba(217, 237, 247, 0) ${bufferStartPercent}%`;
                        gradientString += `, rgba(217, 237, 247, 1) ${bufferStartPercent}%`;
                        gradientString += `, rgba(217, 237, 247, 1) ${bufferEndPercent}%`;
                        gradientString += `, rgba(217, 237, 247, 0) ${bufferEndPercent}%`;
                    }
                }
                progressionInput.style.background = `-webkit-linear-gradient(left, ${gradientString})`;
                progressionInput.style.backgroundColor = '#ddd';
            };

            const updateSliderValue = () => {
                progressionInput.value = mediaSource.currentTime;
                refreshProgressionBackground();
            };

            const setMediaPosition = () => {
                mediaSource.currentTime = parseFloat(progressionInput.value);
                refreshProgressionBackground();
            };

            const initializeSlider = () => {
                if (!isNaN(mediaSource.duration) && mediaSource.duration > 0) {
                    progressionInput.setAttribute('max', mediaSource.duration);
                    progressionInput.setAttribute('step', mediaSource.duration / 100);
                    updateSliderValue();
                }
            };

            const resetMediaAndSlider = () => {
                progressionInput.value = '0';
                mediaSource.currentTime = 0;
                if (!mediaSource.loop) {
                    mediaSource.pause();
                } else {
                    mediaSource.play();
                }
                refreshProgressionBackground();
            };

            const sliderHousing = document.createElement('div');
            sliderHousing.classList.add('action-control-button', 'disabled-interface-control', 'flex-span-four');
            sliderHousing.appendChild(progressionInput);

            progressionInput.addEventListener('input', setMediaPosition);
            progressionInput.addEventListener('change', setMediaPosition);

            mediaSource.addEventListener('timeupdate', initializeSlider);
            mediaSource.addEventListener('loadedmetadata', initializeSlider);
            mediaSource.addEventListener('loadeddata', initializeSlider);
            mediaSource.addEventListener('progress', initializeSlider);
            mediaSource.addEventListener('canplay', initializeSlider);
            mediaSource.addEventListener('canplaythrough', initializeSlider);
            mediaSource.addEventListener('ended', resetMediaAndSlider);

            if (mediaSource.readyState > 0) {
                initializeSlider();
            }
            mainPlaybackArea.appendChild(sliderHousing);
        };

        // Function to display current and total time
        const generateTimeInformation = () => {
            const timeDisplayLink = document.createElement('a');
            timeDisplayLink.classList.add('action-control-button', 'flex-span-three');

            const timeDisplayBubble = new InformationBubble(timeDisplayLink, { containerElement: 'body', placement: 'right', markupContent: true });
            
            const padWithZero = (num) => String(num).padStart(2, '0');

            const convertSecondsToTime = (seconds) => {
                if (isNaN(seconds)) {
                    return '<i class="spinner-icon-custom rotate-animation"></i>';
                }
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor(seconds / 60) - (hours * 60);
                const remainingSeconds = Math.floor(seconds) - (hours * 3600) - (minutes * 60);
                let formattedTime = `${padWithZero(minutes)}:${padWithZero(remainingSeconds)}`;
                if (hours > 0) {
                    formattedTime = `${hours}:${formattedTime}`;
                }
                return formattedTime;
            };

            const updateTimeContent = () => {
                let displayHtmlContent;
                let bubbleTitleContent;

                if (!mediaSource.paused) {
                    displayHtmlContent = convertSecondsToTime(mediaSource.currentTime);
                    bubbleTitleContent = `Click to Reset<hr style="padding:0; margin:0;" />Length: ${convertSecondsToTime(mediaSource.duration)}`;
                } else {
                    displayHtmlContent = convertSecondsToTime(mediaSource.duration);
                    bubbleTitleContent = `Click to Reset<hr style="padding:0; margin:0;" />Position: ${convertSecondsToTime(mediaSource.currentTime)}`;
                }
                
                timeDisplayLink.innerHTML = displayHtmlContent;
                timeDisplayBubble.updateContent(bubbleTitleContent);
            };

            timeDisplayLink.addEventListener('click', () => {
                mediaSource.pause();
                mediaSource.currentTime = 0;
                updateTimeContent();
                timeDisplayBubble.showBubble(); // Explicitly show on click as per original
            });

            timeDisplayBubble.showBubble(); // Show initially

            mediaSource.addEventListener('loadedmetadata', updateTimeContent);
            mediaSource.addEventListener('loadeddata', updateTimeContent);
            mediaSource.addEventListener('progress', updateTimeContent);
            mediaSource.addEventListener('canplay', updateTimeContent);
            mediaSource.addEventListener('canplaythrough', updateTimeContent);
            mediaSource.addEventListener('timeupdate', updateTimeContent);

            if (mediaSource.readyState > 0) {
                updateTimeContent();
            } else {
                timeDisplayLink.innerHTML = '<i class="spinner-icon-custom rotate-animation"></i>';
            }
            mainPlaybackArea.appendChild(timeDisplayLink);
        };

        // Function to create sound toggle button
        const assembleSoundToggle = () => {
            const soundToggleButton = document.createElement('button');
            soundToggleButton.classList.add('action-control-button', 'flex-span-one');

            const updateSoundIcon = () => {
                if (mediaSource.muted || mediaSource.volume === 0) {
                    soundToggleButton.innerHTML = '<i class="volume-off-icon-custom"></i>';
                } else if (mediaSource.volume <= 0.5) {
                    soundToggleButton.innerHTML = '<i class="volume-down-icon-custom"></i>';
                } else {
                    soundToggleButton.innerHTML = '<i class="volume-up-icon-custom"></i>';
                }
            };

            let storedVolumeLevel = mediaSource.volume;

            soundToggleButton.addEventListener('click', () => {
                if (mediaSource.muted) {
                    mediaSource.muted = false;
                    mediaSource.volume = storedVolumeLevel > 0 ? storedVolumeLevel : 1;
                } else {
                    mediaSource.muted = true;
                    storedVolumeLevel = mediaSource.volume;
                    mediaSource.volume = 0;
                }
                updateSoundIcon();
            });

            updateSoundIcon();
            mediaSource.addEventListener('volumechange', updateSoundIcon);
            mainPlaybackArea.appendChild(soundToggleButton);
        };

        // Function to build volume adjustment slider
        const constructVolumeAdjustment = () => {
            const volumeAdjuster = document.createElement('input');
            volumeAdjuster.setAttribute('type', 'range');
            volumeAdjuster.setAttribute('min', '0');
            volumeAdjuster.setAttribute('max', '1');
            volumeAdjuster.setAttribute('step', '0.01');
            volumeAdjuster.setAttribute('value', mediaSource.volume);
            volumeAdjuster.classList.add('volume-adjuster-slider');

            const modifyMediaVolume = () => {
                mediaSource.muted = false;
                mediaSource.volume = parseFloat(volumeAdjuster.value);
            };

            const synchronizeVolumeSlider = () => {
                volumeAdjuster.value = mediaSource.volume;
            };

            const volumeSliderContainer = document.createElement('div');
            volumeSliderContainer.classList.add('action-control-button', 'disabled-interface-control', 'flex-span-three');
            volumeSliderContainer.appendChild(volumeAdjuster);

            volumeAdjuster.addEventListener('input', modifyMediaVolume);
            volumeAdjuster.addEventListener('change', modifyMediaVolume);

            mediaSource.addEventListener('volumechange', synchronizeVolumeSlider);
            mainPlaybackArea.appendChild(volumeSliderContainer);
        };

        // Function to embed album art
        const embedAlbumArt = () => {
            const albumArtImage = document.createElement('img');
            albumArtImage.classList.add('media-artwork-thumbnail');
            albumArtImage.src = mediaSource.dataset.infoAlbumArt;
            detailsPanel.appendChild(albumArtImage);
        };

        // Function to add a single metadata entry row
        const addMetadataEntry = (labelName, dataKey) => {
            const dataRow = document.createElement('tr');
            const headerCell = document.createElement('th');
            const valueCell = document.createElement('td');
            headerCell.textContent = labelName;
            valueCell.textContent = mediaSource.dataset[dataKey];
            dataRow.appendChild(headerCell);
            dataRow.appendChild(valueCell);
            metadataGrid.appendChild(dataRow);
        };

        // Function to populate the details section
        const populateDetailsSection = () => {
            if (mediaSource.dataset.infoAlbumArt) { embedAlbumArt(); }
            if (mediaSource.dataset.infoArtist) { addMetadataEntry('Artist', 'infoArtist'); }
            if (mediaSource.dataset.infoTitle) { addMetadataEntry('Title', 'infoTitle'); }
            if (mediaSource.dataset.infoAlbumTitle) { addMetadataEntry('Album', 'infoAlbumTitle'); }
            if (mediaSource.dataset.infoLabel) { addMetadataEntry('Label', 'infoLabel'); }
            if (mediaSource.dataset.infoYear) { addMetadataEntry('Year', 'infoYear'); }

            if (metadataGrid.children.length > 0) {
                detailsPanel.appendChild(metadataGrid);
                topContainer.appendChild(controlButtonCluster);
                topContainer.appendChild(detailsPanel);
            }
        };

        // Function to set up the main playback controls
        const configureMainControls = () => {
            if (mediaSource.dataset.play !== 'off') { buildPlayPauseControl(); }
            if (mediaSource.dataset.seek !== 'off') { createProgressionSlider(); }
            if (mediaSource.dataset.time !== 'off') { generateTimeInformation(); }
            if (mediaSource.dataset.mute !== 'off') { assembleSoundToggle(); }
            if (mediaSource.dataset.volume !== 'off') { constructVolumeAdjustment(); }
            topContainer.appendChild(mainPlaybackArea);
        };

        // Function to append attribution information
        const includeAttribution = () => {
            const attributionText = document.createElement('small');
            attributionText.classList.add('align-right-text', 'subdued-text');

            if (mediaSource.dataset.infoAttLink) {
                const attributionLink = document.createElement('a');
                attributionLink.classList.add('subdued-text');
                attributionLink.href = mediaSource.dataset.infoAttLink;
                attributionLink.textContent = mediaSource.dataset.infoAtt;
                attributionText.appendChild(attributionLink);
            } else {
                attributionText.textContent = mediaSource.dataset.infoAtt;
            }
            topContainer.appendChild(attributionText);
        };

        // Function to render the complete player interface
        const renderPlayerInterface = () => {
            populateDetailsSection();
            configureMainControls();
            if (mediaSource.dataset.infoAtt) { includeAttribution(); }
        };

        // Initial interface rendering
        renderPlayerInterface();

        mediaSource.addEventListener('error', signalInterfaceError);

        // Insert the newly created player interface before the original media element
        mediaSource.parentNode.insertBefore(topContainer, mediaSource);
    }

    // Iterate over all audio elements with controls and apply the custom player
    acquireElements('audio[controls]').forEach(processMediaElement);

})();