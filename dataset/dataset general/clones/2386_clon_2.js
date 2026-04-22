var SequenceAnimator = function(displayElementId, configuration) {
    // Reference to the main container element
    this.displayArea = document.getElementById(displayElementId);
    // Store the ID of the target element
    this.targetId = displayElementId;
    // URL for the animation data source
    this.animationSource = this.displayArea.getAttribute('data-vidsrc');
    // Default frames per second (playback rate)
    this.playbackSpeed = 20;
    // Flag to indicate if controls should be visible
    this.showControls = true;
    // Playback state: true if animation is paused/frozen
    this.isFrozen = false;
    // Default width of the animation area
    this.viewWidth = '480px';
    // Default height of the animation area
    this.viewHeight = '320px';
    // Border radius setting, initially null
    this.cornerRadius = null;

    // Apply user-defined settings
    this.applySettings(configuration);
    // Initialize browser's animation frame scheduling
    this.setupAnimationScheduler();
};

SequenceAnimator.prototype.applySettings = function(configuration) {
    if ('playbackSpeed' in configuration) {
        this.playbackSpeed = configuration.playbackSpeed;
    }
    if ('showControls' in configuration) {
        this.showControls = configuration.showControls;
    }
    if ('autoStart' in configuration) {
        if (!configuration.autoStart) {
            this.isFrozen = true;
        }
    }
    if ('viewWidth' in configuration) {
        this.viewWidth = configuration.viewWidth;
    }
    if ('viewHeight' in configuration) {
        this.viewHeight = configuration.viewHeight;
    }
    if ('cornerRadius' in configuration) {
        // Create a style element for border-radius
        var styleElement = document.createElement('style');
        styleElement.setAttribute('id', 'style-for-' + this.targetId);
        styleElement.innerHTML = '#' + this.targetId + ', .sequence-elements-' + this.targetId + ' { border-radius: ' + configuration.cornerRadius + '; overflow: hidden; }';
        document.head.appendChild(styleElement);
    }

    // Apply dimensions to the container
    this.displayArea.style.width = this.viewWidth;
    this.displayArea.style.height = this.viewHeight;

    // Conditionally create the control interface
    if (this.showControls) {
        this.buildControlInterface();
    }
};

SequenceAnimator.prototype.displaySequence = function(sequenceData, currentAnimator) {
    let currentTime;
    let lastFrameTime = Date.now();
    const frameInterval = 1000 / currentAnimator.playbackSpeed;
    let timeElapsed;
    let frameIndex = -1; // Start before the first frame

    // Image element to load frames
    let imageObject = document.createElement('img');

    // Create canvas for drawing frames
    currentAnimator.drawingCanvas = document.createElement('canvas');
    currentAnimator.drawingContext = currentAnimator.drawingCanvas.getContext('2d');
    currentAnimator.displayArea.appendChild(currentAnimator.drawingCanvas);

    // Main animation loop function
    const advanceFrame = function() {
        currentTime = Date.now();
        timeElapsed = currentTime - lastFrameTime;

        if (timeElapsed > frameInterval) {
            lastFrameTime = currentTime - (timeElapsed % frameInterval);

            // Only advance frame if not frozen
            if (!currentAnimator.isFrozen) {
                frameIndex++;
                // Loop back to start if end of sequence reached
                if (frameIndex >= sequenceData.frames.length) {
                    frameIndex = 0;
                }
                imageObject.src = sequenceData.frames[frameIndex];
                // Draw the current frame onto the canvas
                currentAnimator.drawingContext.drawImage(imageObject, 0, 0, currentAnimator.drawingCanvas.width, currentAnimator.drawingCanvas.height);
            }
        }

        // Request next animation frame
        window.requestAnimFrame(advanceFrame);
    };

    // Start the animation loop
    window.requestAnimFrame(advanceFrame);
};

SequenceAnimator.prototype.buildControlInterface = function() {
    let selfInstance = this;
    let interfaceContainer = document.createElement('div');
    interfaceContainer.setAttribute('class', 'sa-interface');
    interfaceContainer.style.width = this.viewWidth;

    // Create Freeze Button
    let freezeButton = document.createElement('button');
    freezeButton.setAttribute('id', 'freeze-' + selfInstance.targetId);
    freezeButton.setAttribute('class', 'sa-button');
    freezeButton.innerHTML = 'Freeze';
    freezeButton.addEventListener('click', function() {
            selfInstance.freeze();
        }, false
    );
    interfaceContainer.appendChild(freezeButton);

    // Create Unfreeze Button
    let unfreezeButton = document.createElement('button');
    unfreezeButton.setAttribute('id', 'unfreeze-' + selfInstance.targetId);
    unfreezeButton.setAttribute('class', 'sa-button');
    unfreezeButton.innerHTML = 'Unfreeze';
    unfreezeButton.addEventListener('click', function() {
            selfInstance.unfreeze();
        }, false
    );
    interfaceContainer.appendChild(unfreezeButton);

    // Manage initial visibility of play/pause buttons
    selfInstance.isFrozen ? freezeButton.style.display = 'none' : unfreezeButton.style.display = 'none';

    // Create Filter Selection Dropdown
    let filterDropdown = document.createElement('select');
    const filterChoices = ['standard', 'monochrome', 'vintage', 'inverse'];

    for (let i = 0, total = filterChoices.length; i < total; i++) {
        let optionElement = document.createElement('option');

        optionElement.setAttribute('value', filterChoices[i]);
        optionElement.innerHTML = filterChoices[i];
        filterDropdown.appendChild(optionElement);
    }

    filterDropdown.setAttribute('id', 'visual-effect-' + selfInstance.targetId);
    filterDropdown.setAttribute('class', 'sa-dropdown');
    filterDropdown.addEventListener('change', function() {
            selfInstance.applyVisualEffect(this.value);
        }, false
    );
    interfaceContainer.appendChild(filterDropdown);

    // Append the entire control bar to the display area
    this.displayArea.appendChild(interfaceContainer);
};

SequenceAnimator.prototype.initiatePlayback = function() {
    // Fetch the animation data and then start displaying it
    this.retrieveSource(this.animationSource, this.displaySequence);
};

SequenceAnimator.prototype.unfreeze = function() {
    let unfreezeButtonRef = document.getElementById('unfreeze-' + this.targetId);
    let freezeButtonRef = document.getElementById('freeze-' + this.targetId);

    unfreezeButtonRef.style.display = 'none';
    freezeButtonRef.style.display = 'block';
    this.isFrozen = false;
};

SequenceAnimator.prototype.freeze = function() {
    let unfreezeButtonRef = document.getElementById('unfreeze-' + this.targetId);
    let freezeButtonRef = document.getElementById('freeze-' + this.targetId);

    unfreezeButtonRef.style.display = 'block';
    freezeButtonRef.style.display = 'none';
    this.isFrozen = true;
};

SequenceAnimator.prototype.applyVisualEffect = function(effectName) {
    let targetCanvas = document.querySelector('#' + this.targetId + ' canvas');

    switch (effectName) {
      case 'standard':
        targetCanvas.setAttribute('class', '');
        break;
      case 'monochrome':
        targetCanvas.setAttribute('class', 'sa-monochrome');
        break;
      case 'vintage':
        targetCanvas.setAttribute('class', 'sa-vintage');
        break;
      case 'inverse':
        targetCanvas.setAttribute('class', 'sa-inverse');
        break;
      default:
        // No action for unknown effects
        break;
    }
};

SequenceAnimator.prototype.retrieveSource = function(sourceUrl, completionHandler) {
    let httpRequest = new XMLHttpRequest();
    let instanceRef = this;
    let loadingIndicator = document.createElement('p');

    if (httpRequest) {
        httpRequest.open('GET', sourceUrl, true);
        httpRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        httpRequest.send(null);

        httpRequest.onprogress = function() {
            loadingIndicator.innerHTML = 'Fetching data...';
            loadingIndicator.setAttribute('class', 'sa-loading-message');
            instanceRef.displayArea.appendChild(loadingIndicator);
        };

        if (typeof(httpRequest.onload) !== 'undefined') {
            httpRequest.onload = function() {
                instanceRef.displayArea.removeChild(loadingIndicator);
                completionHandler(JSON.parse(this.responseText), instanceRef);
                httpRequest = null;
            };
        } else {
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === 4) {
                    instanceRef.displayArea.removeChild(loadingIndicator);
                    completionHandler(JSON.parse(this.responseText), instanceRef);
                    httpRequest = null;
                }
            };
        }
    } else {
        throw new Error('Data retrieval failed.');
    }
};

// Polyfill for requestAnimationFrame
SequenceAnimator.prototype.setupAnimationScheduler = function() {
    // Based on work by Paul Irish, Erik Möller, and Tino Zijdel
    // MIT license
    let previousFrameTime = 0;
    let browserPrefixes = ['ms', 'moz', 'webkit', 'o'];
    for (let prefixIndex = 0; prefixIndex < browserPrefixes.length && !window.requestAnimFrame; ++prefixIndex) {
        window.requestAnimFrame = window[browserPrefixes[prefixIndex] + 'RequestAnimationFrame'];
        window.cancelAnimFrame = window[browserPrefixes[prefixIndex] + 'CancelAnimationFrame'] || window[browserPrefixes[prefixIndex] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimFrame)
        window.requestAnimFrame = function(animationCallback, targetElement) {
            let currentTimestamp = new Date().getTime();
            let delayUntilNextFrame = Math.max(0, 16 - (currentTimestamp - previousFrameTime));
            let timerId = window.setTimeout(function() { animationCallback(currentTimestamp + delayUntilNextFrame); },
              delayUntilNextFrame);
            previousFrameTime = currentTimestamp + delayUntilNextFrame;
            return timerId;
        };

    if (!window.cancelAnimFrame)
        window.cancelAnimFrame = function(timerId) {
            clearTimeout(timerId);
        };
};