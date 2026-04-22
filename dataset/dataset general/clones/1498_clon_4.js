(function(globalScope) {
    // Dynamically inject custom CSS for the control panel styling and animations
    const interfaceStyleData = `
        .control-panel-base {
            position: absolute;
            bottom: 0;
            left: -300px; /* Initially hidden off-screen */
            width: 300px; /* Example width */
            height: 50px; /* Example height */
            z-index: 1000;
            transition: left 0.5s ease-in-out, opacity 0.6s ease-in-out; /* Smooth slide and fade */
            display: flex;
            align-items: center;
            box-sizing: border-box; /* Include padding/border in width/height */
        }
        .control-panel-base.is-visible {
            left: 0; /* Fully visible */
        }
        .control-panel-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: -1;
            border-radius: 5px;
        }
        .control-panel-group {
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0 10px;
            box-sizing: border-box;
            flex-wrap: wrap;
            overflow: hidden;
        }
        .control-element {
            min-width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            background-color: #555;
            color: white;
            margin: 0 5px;
            cursor: default;
            user-select: none;
            font-family: 'Segoe UI', sans-serif;
            font-size: 1.1em;
            border-radius: 3px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .control-element.actionable {
            cursor: pointer;
            background-color: #777;
        }
        .control-element.actionable:hover {
            background-color: #999;
        }
        .control-element.actionable:active {
            background-color: #bbb;
            transform: translateY(1px);
        }
    `;

    function addStyleElement(cssContent) {
        const styleNode = document.createElement('style');
        styleNode.textContent = cssContent;
        document.head.appendChild(styleNode);
    }

    addStyleElement(interfaceStyleData);

    // Class to manage the panoramic view control interface
    class ViewControlUnit {
        constructor(hostApplicationInstance) {
            this._hostApplication = hostApplicationInstance;
            this._interactionElements = {};
            this._primaryContainer = null;
            this._buttonTray = null;
            this._motionSensorDetected = false;

            // Pre-bind event handlers to maintain 'this' context and allow easy removal
            this._boundSpacebarAction = this._processSpacebarPress.bind(this);
            this._boundMotionSensorProbe = this._assessMotionSensor.bind(this);
            this._boundRotationUpdate = this._refreshRotationIndicators.bind(this);
            this._boundSetupInitiator = this._constructInterface.bind(this);
        }

        // Helper for creating DOM elements
        _craftElement(tagType, classNames = '', textContent = '') {
            const domNode = document.createElement(tagType);
            if (classNames) {
                domNode.className = classNames;
            }
            if (textContent) {
                domNode.textContent = textContent;
            }
            return domNode;
        }

        // Main method to build the control interface
        _constructInterface() {
            // Remove any previously existing control panels within the host's scope
            this._hostApplication.$scope.querySelectorAll('.control-panel-base').forEach(node => node.remove());

            this._interactionElements = {
                displayPanel:       this._craftElement('div', 'control-element', 'v'),
                concealPanel:       this._craftElement('div', 'control-element actionable', 'h'),
                dividerLine:        this._craftElement('div', 'control-element', '|'),
                magnifyView:        this._craftElement('div', 'control-element actionable', '+'),
                shrinkView:         this._craftElement('div', 'control-element actionable', '-'),
                autoRotateActivate: this._craftElement('div', 'control-element actionable', 'P'),
                autoRotateDeactivate: this._craftElement('div', 'control-element actionable', 'S'),
                lookUp:             this._craftElement('div', 'control-element actionable', '↑'),
                lookDown:           this._craftElement('div', 'control-element actionable', '↓'),
                lookLeft:           this._craftElement('div', 'control-element actionable', '←'),
                lookRight:          this._craftElement('div', 'control-element actionable', '→'),
                touchControl:       this._craftElement('div', 'control-element actionable', 'T'),
                motionControl:      this._craftElement('div', 'control-element actionable', 'G')
            };

            this._interactionElements.displayPanel.style.display = 'none';
            this._interactionElements.displayPanel.style.marginLeft = '.5em';

            this._refreshRotationIndicators(); // Set initial visibility for Play/Stop buttons

            this._buttonTray = this._craftElement('div', 'control-panel-group');
            this._buttonTray.append(this._interactionElements.concealPanel, this._interactionElements.dividerLine);

            // Check for device orientation support and listen once
            if (globalScope.DeviceOrientationEvent) {
                globalScope.addEventListener("deviceorientation", this._boundMotionSensorProbe, { once: true });
            }

            // After a short delay, check if motion sensor was detected and add controls
            setTimeout(() => {
                if (this._motionSensorDetected) {
                    this._buttonTray.append(this._interactionElements.touchControl, this._interactionElements.motionControl);
                    this._refreshGyroTouchIndicators();
                }
            }, 100);

            this._buttonTray.append(
                this._interactionElements.magnifyView,
                this._interactionElements.shrinkView,
                this._interactionElements.lookLeft,
                this._interactionElements.lookRight,
                this._interactionElements.lookUp,
                this._interactionElements.lookDown,
                this._interactionElements.autoRotateActivate,
                this._interactionElements.autoRotateDeactivate,
                this._interactionElements.displayPanel
            );

            this._primaryContainer = this._craftElement('div', 'control-panel-base');
            this._primaryContainer.append(this._craftElement('div', 'control-panel-background'));
            this._primaryContainer.append(this._buttonTray);

            // Insert the control panel immediately after the host application's main element
            this._primaryContainer.style.opacity = '0'; // Start invisible for fade-in effect
            this._hostApplication.$el[0].parentNode.insertBefore(this._primaryContainer, this._hostApplication.$el[0].nextSibling);

            // Animate the control panel into view
            globalScope.requestAnimationFrame(() => {
                this._primaryContainer.style.display = ''; // Ensure display is not 'none'
                this._primaryContainer.style.opacity = '1';
                this._primaryContainer.classList.add('is-visible'); // Trigger slide-in CSS transition
            });

            this._establishAllInteractions();
        }

        // Assesses if the device's motion sensor provides meaningful data
        _assessMotionSensor(eventData) {
            if (eventData && (eventData.alpha !== null || eventData.beta !== null || eventData.gamma !== null)) {
                this._motionSensorDetected = true;
            }
        }

        // Updates the visibility of the auto-rotate start/stop buttons
        _refreshRotationIndicators() {
            if (this._hostApplication.autorotate === 0) {
                this._interactionElements.autoRotateDeactivate.style.display = 'none';
                this._interactionElements.autoRotateActivate.style.display = '';
            } else {
                this._interactionElements.autoRotateActivate.style.display = 'none';
                this._interactionElements.autoRotateDeactivate.style.display = '';
            }
        }

        // Updates the visibility of the gyro/touch control buttons
        _refreshGyroTouchIndicators() {
            if (this._hostApplication.gyro) {
                this._interactionElements.motionControl.style.display = 'none';
                this._interactionElements.touchControl.style.display = '';
            } else {
                this._interactionElements.touchControl.style.display = 'none';
                this._interactionElements.motionControl.style.display = '';
            }
        }

        // Binds all user interaction events to the control elements
        _establishAllInteractions() {
            // Panel visibility toggles
            this._interactionElements.concealPanel.addEventListener('click', this._togglePanelVisibility.bind(this));
            this._interactionElements.displayPanel.addEventListener('click', this._togglePanelVisibility.bind(this));

            // Auto-rotate actions
            this._interactionElements.autoRotateActivate.addEventListener('click', () => {
                this._hostApplication.toggle_rotate();
                this._refreshRotationIndicators();
            });
            this._interactionElements.autoRotateDeactivate.addEventListener('click', () => {
                this._hostApplication.toggle_rotate();
                this._refreshRotationIndicators();
            });

            // Global Spacebar keydown for rotate toggle
            globalScope.addEventListener('keydown', this._boundSpacebarAction);

            // Gyro/Touch control toggles
            this._interactionElements.motionControl.addEventListener('click', () => {
                this._hostApplication.unbind_touch();
                this._hostApplication.bind_gyro();
                this._refreshGyroTouchIndicators();
            });
            this._interactionElements.touchControl.addEventListener('click', () => {
                this._hostApplication.unbind_gyro();
                this._hostApplication.bind_touch();
                this._refreshGyroTouchIndicators();
            });

            // Helper for handling continuous actions (zoom, pan) on touch/mouse hold
            const bindContinuousAction = (elementNode, startCallback, endCallback) => {
                elementNode.addEventListener('touchstart', startCallback);
                elementNode.addEventListener('mousedown', startCallback);
                elementNode.addEventListener('touchend', endCallback);
                elementNode.addEventListener('mouseup', endCallback);
                elementNode.addEventListener('mouseleave', endCallback); // Prevents stuck state if mouse moves off
            };

            // Zoom controls
            bindContinuousAction(this._interactionElements.magnifyView,
                                 () => this._hostApplication.scale_start(0.05),
                                 () => this._hostApplication.scale_stop());
            bindContinuousAction(this._interactionElements.shrinkView,
                                 () => this._hostApplication.scale_start(-0.05),
                                 () => this._hostApplication.scale_stop());

            // Pan controls
            bindContinuousAction(this._interactionElements.lookLeft,
                                 () => { this._hostApplication.pan_start(-0.7, 0); this._refreshRotationIndicators(); },
                                 () => this._hostApplication.pan_stop());
            bindContinuousAction(this._interactionElements.lookRight,
                                 () => { this._hostApplication.pan_start(0.7, 0); this._refreshRotationIndicators(); },
                                 () => this._hostApplication.pan_stop());
            bindContinuousAction(this._interactionElements.lookUp,
                                 () => { this._hostApplication.pan_start(0, 0.7); this._refreshRotationIndicators(); },
                                 () => this._hostApplication.pan_stop());
            bindContinuousAction(this._interactionElements.lookDown,
                                 () => { this._hostApplication.pan_start(0, -0.7); this._refreshRotationIndicators(); },
                                 () => this._hostApplication.pan_stop());
        }

        // Handles the spacebar key press event to toggle autorotation
        _processSpacebarPress(eventObject) {
            if (eventObject.code === 'Space' || eventObject.key === ' ') {
                this._hostApplication.toggle_rotate();
                this._refreshRotationIndicators(); // Update button display after toggle
                eventObject.preventDefault(); // Prevent default browser action (e.g., page scrolling)
            }
        }

        // Toggles the visibility state of the control panel
        _togglePanelVisibility() {
            if (!this._primaryContainer) return;

            const isCurrentlyVisible = this._primaryContainer.classList.contains('is-visible');

            if (isCurrentlyVisible) {
                // Hide panel
                this._primaryContainer.classList.remove('is-visible');
                this._interactionElements.displayPanel.style.display = ''; // Show 'v' button
            } else {
                // Show panel
                this._primaryContainer.classList.add('is-visible');
                this._interactionElements.displayPanel.style.display = 'none'; // Hide 'v' button
            }
        }

        // Cleans up and removes the interface from the DOM
        _dismantleInterface() {
            if (this._primaryContainer) {
                this._primaryContainer.style.opacity = '0'; // Start fade-out effect
                setTimeout(() => {
                    this._primaryContainer.remove();
                    this._primaryContainer = null;
                    this._interactionElements = {};
                    this._removeGlobalInteractions();
                    globalScope.removeEventListener("deviceorientation", this._boundMotionSensorProbe);
                }, 600); // Matches fade-out duration
            }
        }

        // Removes global event listeners to prevent memory leaks
        _removeGlobalInteractions() {
            globalScope.removeEventListener('keydown', this._boundSpacebarAction);
        }

        // Registers callbacks with the host application's lifecycle events
        registerLifecycleCallbacks() {
            // Attach the interface construction to the engine start event
            this._hostApplication.$el.on(this._hostApplication.EV_ENGINE_STARTED, this._boundSetupInitiator);
            // Update rotation indicators on autorotate state changes
            this._hostApplication.$el.on(this._hostApplication.EV_AUTOROTATE_STOPPED, this._boundRotationUpdate);
            this._hostApplication.$el.on(this._hostApplication.EV_AUTOROTATE_STARTED, this._boundRotationUpdate);
        }
    }

    // Register this extension with the leanorama plugin
    if (globalScope.$ && globalScope.$.fn && globalScope.$.fn.leanorama && globalScope.$.fn.leanorama.extensions) {
        globalScope.$.fn.leanorama.extensions.push(function() {
            // 'this' context refers to the leanorama instance
            const managerInstance = new ViewControlUnit(this);
            managerInstance.registerLifecycleCallbacks();
        });
    }

})(window);