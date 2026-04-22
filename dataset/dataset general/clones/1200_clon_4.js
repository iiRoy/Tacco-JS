(function() {
    "use strict";

    // A unique global object to hold our component and its utilities
    var CustomComponentSystem = {};

    // The main class for our toggle switch
    CustomComponentSystem.ToggleController = function(containerElement, initialOptions) {
        if (!(containerElement instanceof HTMLElement)) {
            console.error('Invalid DOM element provided for ToggleController.');
            return null;
        }

        // Internal references to DOM elements
        var _baseContainer = containerElement; // The original .switch element
        var _inputCheckbox;
        var _displayWrapper; // The div that wraps the input and spans
        var _leftDisplaySpan;
        var _middleGrabHandle;
        var _rightDisplaySpan;

        // Internal state variables
        var _isDragging = false;
        var _dragStartX = 0;

        // Configuration settings, merged from defaults and provided options
        var _config = {
            activeLabel: "ON",
            inactiveLabel: "OFF",
            activeClassModifier: "", // e.g., 'switch-primary'
            inactiveClassModifier: "",
            iconClass: false, // e.g., 'icon-ok'
            enableAnimation: true
        };

        // Helper to retrieve configuration from data attributes, mimicking original behavior
        function readDataAttributes() {
            if (_baseContainer.dataset.onLabel !== undefined) {
                _config.activeLabel = _baseContainer.dataset.onLabel;
            }
            if (_baseContainer.dataset.offLabel !== undefined) {
                _config.inactiveLabel = _baseContainer.dataset.offLabel;
            }
            if (_baseContainer.dataset.icon !== undefined) {
                _config.iconClass = _baseContainer.dataset.icon;
            }
            if (_baseContainer.dataset.animated !== undefined) {
                _config.enableAnimation = (_baseContainer.dataset.animated !== 'false');
            }
            if (_baseContainer.dataset.on !== undefined) {
                _config.activeClassModifier = "switch-" + _baseContainer.dataset.on;
            }
            if (_baseContainer.dataset.off !== undefined) {
                _config.inactiveClassModifier = "switch-" + _baseContainer.dataset.off;
            }
        }

        // Helper to determine the size class (mini, small, large)
        function identifySizeClass() {
            var classes = _baseContainer.className;
            var sizeOptions = ['switch-mini', 'switch-small', 'switch-large'];
            for (var i = 0; i < sizeOptions.length; i++) {
                if (classes.includes(sizeOptions[i])) {
                    return sizeOptions[i];
                }
            }
            return '';
        }

        // Updates the visual appearance of the switch based on the checkbox's checked state
        function syncDisplayState(preventChangeEvent) {
            var currentStatus = _inputCheckbox.checked;
            var isCurrentlyOff = _displayWrapper.classList.contains('switch-off');

            _displayWrapper.style.left = ''; // Reset CSS position

            // Only proceed if the visual state does not match the checkbox's actual state
            if (isCurrentlyOff === currentStatus) {
                if (currentStatus) {
                    _displayWrapper.classList.remove('switch-off');
                    _displayWrapper.classList.add('switch-on');
                } else {
                    _displayWrapper.classList.remove('switch-on');
                    _displayWrapper.classList.add('switch-off');
                }

                if (_config.enableAnimation) {
                    _displayWrapper.classList.add('switch-animate');
                }

                if (!(typeof preventChangeEvent === 'boolean' && preventChangeEvent)) {
                    // Dispatch a custom event for external listeners
                    var eventDetails = {
                        controlElement: _inputCheckbox,
                        newValue: currentStatus
                    };
                    var stateChangedEvent = new CustomEvent('toggle-control-changed', { detail: eventDetails, bubbles: true });
                    _baseContainer.dispatchEvent(stateChangedEvent);
                }
            }
        }

        // Handles clicks on the left/right segments or spacebar press
        function handleInteractionToggle(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (_baseContainer.classList.contains('deactivate')) return;

            _inputCheckbox.checked = !_inputCheckbox.checked;
            // Trigger a native change event on the checkbox, which will then call syncDisplayState
            _inputCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Handles the native change event on the hidden checkbox
        function handleCheckboxChangeEvent(event) {
            // The original's `trigger('change', skipOnChange)` passes a boolean.
            // We're using CustomEvent detail for this, or checking for it if it's a native event.
            var skipCustomEvent = event.detail ? event.detail.preventCustomEvent : false;
            syncDisplayState(skipCustomEvent);
        }

        // Handles the start of a drag/click on the middle handle
        function handleHandleStart(event) {
            if (_baseContainer.classList.contains('deactivate')) return;

            _isDragging = false;
            event.preventDefault();
            event.stopImmediatePropagation();

            _displayWrapper.classList.remove('switch-animate');

            // Get initial X position for drag calculation
            _dragStartX = (event.pageX || (event.touches && event.touches[0].pageX)) - _displayWrapper.getBoundingClientRect().left;

            // Attach move and end listeners
            _middleGrabHandle.addEventListener('mousemove', handleHandleMove);
            _middleGrabHandle.addEventListener('touchmove', handleHandleMove);
            _middleGrabHandle.addEventListener('mouseup', handleHandleEnd);
            _middleGrabHandle.addEventListener('touchend', handleHandleEnd);
            _middleGrabHandle.addEventListener('mouseleave', handleHandleLeave);
        }

        // Handles dragging motion of the middle handle
        function handleHandleMove(event) {
            if (_baseContainer.classList.contains('deactivate')) return;

            _isDragging = true;
            event.preventDefault();
            event.stopImmediatePropagation();

            var currentEventX = (event.pageX || (event.touches && event.touches[0].pageX));
            var wrapperWidth = _displayWrapper.offsetWidth;
            var relativePositionX = currentEventX - _baseContainer.getBoundingClientRect().left;

            var percentageMoved = (relativePositionX / wrapperWidth) * 100;
            var minThreshold = 25; // Equivalent to original's 'left'
            var maxThreshold = 75; // Equivalent to original's 'right'

            if (percentageMoved < minThreshold) {
                percentageMoved = minThreshold;
            } else if (percentageMoved > maxThreshold) {
                percentageMoved = maxThreshold;
            }

            // Original calculation was `(percent - right) + "%"`, so `(percentageMoved - 75) + "%"`
            _displayWrapper.style.left = (percentageMoved - maxThreshold) + "%";
        }

        // Handles the end of a drag or a click on the middle handle
        function handleHandleEnd(event) {
            if (_baseContainer.classList.contains('deactivate')) return;

            event.stopImmediatePropagation();
            event.preventDefault();

            // Clean up move and leave listeners
            _middleGrabHandle.removeEventListener('mousemove', handleHandleMove);
            _middleGrabHandle.removeEventListener('touchmove', handleHandleMove);
            _middleGrabHandle.removeEventListener('mouseleave', handleHandleLeave);

            var currentOffset = parseInt(window.getComputedStyle(_displayWrapper).left, 10);
            var checkThreshold = -25; // Original logic: `parseInt($this.parent().css('left')) < -25`

            if (_isDragging) {
                _inputCheckbox.checked = !(currentOffset < checkThreshold);
            } else {
                _inputCheckbox.checked = !_inputCheckbox.checked; // It was a click, just toggle
            }

            _isDragging = false;
            _inputCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Handles mouse leaving the middle handle during a potential drag
        function handleHandleLeave(event) {
            if (_baseContainer.classList.contains('deactivate')) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            // Clean up move and leave listeners
            _middleGrabHandle.removeEventListener('mousemove', handleHandleMove);
            _middleGrabHandle.removeEventListener('mouseleave', handleHandleLeave);

            // Re-evaluate state based on current position, similar to mouseup
            var currentOffset = parseInt(window.getComputedStyle(_displayWrapper).left, 10);
            var checkThreshold = -25;

            _inputCheckbox.checked = !(currentOffset < checkThreshold);
            _inputCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Handles keyboard events, specifically spacebar
        function handleKeyboardInput(event) {
            if (event.keyCode === 32) { // Spacebar key code
                event.stopImmediatePropagation();
                event.preventDefault();
                handleInteractionToggle(event); // Re-use toggle logic
            }
        }

        // Public API methods
        this.toggleOperatingState = function() {
            _baseContainer.classList.toggle('deactivate');
        };

        this.queryOperatingStatus = function() {
            return !_baseContainer.classList.contains('deactivate');
        };

        this.setOperatingStatus = function(shouldActivate) {
            if (shouldActivate) {
                _baseContainer.classList.remove('deactivate');
            } else {
                _baseContainer.classList.add('deactivate');
            }
        };

        this.flipCurrentValue = function(preventCustomEvent) {
            if (_inputCheckbox) {
                _inputCheckbox.checked = !_inputCheckbox.checked;
                _inputCheckbox.dispatchEvent(new CustomEvent('change', { detail: { preventCustomEvent: preventCustomEvent }, bubbles: true }));
            }
        };

        this.assignSpecificValue = function(value, preventCustomEvent) {
            if (_inputCheckbox) {
                _inputCheckbox.checked = !!value; // Ensure boolean
                _inputCheckbox.dispatchEvent(new CustomEvent('change', { detail: { preventCustomEvent: preventCustomEvent }, bubbles: true }));
            }
        };

        this.retrieveCurrentValue = function() {
            return _inputCheckbox ? _inputCheckbox.checked : false;
        };

        this.dismantleComponent = function() {
            if (!_inputCheckbox) return; // Already dismantled or not initialized

            // Remove all attached event listeners
            _baseContainer.removeEventListener('keydown', handleKeyboardInput);
            _leftDisplaySpan.removeEventListener('click', handleInteractionToggle);
            _rightDisplaySpan.removeEventListener('click', handleInteractionToggle);
            _inputCheckbox.removeEventListener('change', handleCheckboxChangeEvent);
            _middleGrabHandle.removeEventListener('mousedown', handleHandleStart);
            _middleGrabHandle.removeEventListener('touchstart', handleHandleStart);
            _middleGrabHandle.removeEventListener('mousemove', handleHandleMove); // Ensure cleanup
            _middleGrabHandle.removeEventListener('touchmove', handleHandleMove);
            _middleGrabHandle.removeEventListener('mouseup', handleHandleEnd);
            _middleGrabHandle.removeEventListener('touchend', handleHandleEnd);
            _middleGrabHandle.removeEventListener('mouseleave', handleHandleLeave);

            // Restore the DOM to its original state (checkbox only)
            // The original jQuery destroy unwrap()s twice, meaning it replaces the `has-switch` element itself with the checkbox.
            if (_baseContainer.parentNode) {
                _baseContainer.parentNode.replaceChild(_inputCheckbox, _baseContainer);
            }

            // Clear references to aid garbage collection
            _baseContainer.ToggleControllerInstance = null; // Remove instance reference
            _inputCheckbox = null;
            _displayWrapper = null;
            _leftDisplaySpan = null;
            _middleGrabHandle = null;
            _rightDisplaySpan = null;
        };

        // Component initialization routine
        (function _initialize() {
            _inputCheckbox = _baseContainer.querySelector('input[type="checkbox"]');
            if (!_inputCheckbox) {
                console.error('No checkbox found within the target element:', _baseContainer);
                return;
            }

            // Merge initial options and then override with data attributes
            Object.assign(_config, initialOptions);
            readDataAttributes(); // Data attributes take precedence over initialOptions

            var currentSizeClass = identifySizeClass();

            _baseContainer.classList.add('has-switch');

            // Create left display span
            _leftDisplaySpan = document.createElement('span');
            _leftDisplaySpan.classList.add("switch-left", currentSizeClass);
            if (_config.activeClassModifier) _leftDisplaySpan.classList.add(_config.activeClassModifier);
            _leftDisplaySpan.innerHTML = _config.activeLabel;

            // Create right display span
            _rightDisplaySpan = document.createElement('span');
            _rightDisplaySpan.classList.add("switch-right", currentSizeClass);
            if (_config.inactiveClassModifier) _rightDisplaySpan.classList.add(_config.inactiveClassModifier);
            _rightDisplaySpan.innerHTML = _config.inactiveLabel;

            // Create middle grab handle (label)
            _middleGrabHandle = document.createElement('label');
            _middleGrabHandle.innerHTML = "&nbsp;";
            _middleGrabHandle.classList.add(currentSizeClass);
            if (_inputCheckbox.id) {
                 _middleGrabHandle.setAttribute('for', _inputCheckbox.id);
            }
            if (_config.iconClass) {
                _middleGrabHandle.innerHTML = '<i class="icon ' + _config.iconClass + '"></i>';
            }

            // Create the inner wrapper div
            _displayWrapper = document.createElement('div');
            _displayWrapper.classList.add('switch'); // Base class for the wrapper

            // Move the checkbox into the new wrapper div
            _inputCheckbox.parentNode.insertBefore(_displayWrapper, _inputCheckbox);
            _displayWrapper.appendChild(_inputCheckbox);

            // Append the display spans and handle to the wrapper
            _displayWrapper
                .appendChild(_leftDisplaySpan);
            _displayWrapper
                .appendChild(_middleGrabHandle);
            _displayWrapper
                .appendChild(_rightDisplaySpan);

            // Apply animation class if enabled
            if (_config.enableAnimation) {
                _displayWrapper.classList.add('switch-animate');
            }

            // Set initial visual state based on checkbox checked property
            if (_inputCheckbox.checked) {
                _displayWrapper.classList.add('switch-on');
            } else {
                _displayWrapper.classList.add('switch-off');
            }

            // Apply disabled state if checkbox is disabled
            if (_inputCheckbox.disabled) {
                _baseContainer.classList.add('deactivate');
            }

            // Attach all event listeners
            _baseContainer.addEventListener('keydown', handleKeyboardInput);
            _leftDisplaySpan.addEventListener('click', handleInteractionToggle);
            _rightDisplaySpan.addEventListener('click', handleInteractionToggle);
            _inputCheckbox.addEventListener('change', handleCheckboxChangeEvent);
            _middleGrabHandle.addEventListener('mousedown', handleHandleStart);
            _middleGrabHandle.addEventListener('touchstart', handleHandleStart);

            // Store instance on the base container for external access
            _baseContainer.ToggleControllerInstance = this;
        })();
    };

    // Global utility function to initialize toggle controls on selected elements
    CustomComponentSystem.initializeToggles = function(selector, options) {
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
            // Only initialize if not already an instance
            if (!el.ToggleControllerInstance) {
                new CustomComponentSystem.ToggleController(el, options);
            }
        });
    };

    // Mimic jQuery's document ready for initial setup
    document.addEventListener('DOMContentLoaded', function() {
        CustomComponentSystem.initializeToggles('.switch');
    });

    // Expose the system globally if needed, though `initializeToggles` is the primary entry point
    window.CustomComponentSystem = CustomComponentSystem;

})();