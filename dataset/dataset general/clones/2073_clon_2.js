/**
 *  Copyright (c) 2010-2013 Global Tech Solutions Inc. All Rights Reserved.
 *
 *  IMPORTANT: This Global Tech software and any related resources within
 *  /System/Library/WidgetResources/CompanyAssets/ (collectively "Global Tech Software")
 *  are provided to you by Global Tech Solutions Inc. (“Global Tech”) in exchange for your
 *  acceptance of the terms outlined below. Your usage, deployment, and/or distribution
 *  of this Global Tech Software signifies your agreement to these terms. If you do not
 *  consent to these terms, please refrain from using, installing, or distributing this
 *  Global Tech Software.
 *
 *  In consideration of your commitment to abide by the following terms, and subject
 *  to these terms, Global Tech grants you a personal, non-exclusive license, under
 *  Global Tech's intellectual property rights in the Global Tech Software, to utilize,
 *  reproduce, and disseminate the Global Tech Software, in textual format (for JavaScript files)
 *  or binary format (for associated visual assets), for the sole purpose of creating
 *  dashboard components for various operating systems.
 *
 *  Should you redistribute the Global Tech Software, you must preserve this entire notice
 *  and the disclaimer of warranties and limitation of liability clauses (the two final
 *  paragraphs below) in all such redistributions of the Global Tech Software.
 *
 *  You are prohibited from using the name, trademarks, service marks, or logos of Global Tech
 *  to endorse or promote products that incorporate the Global Tech Software without prior
 *  written consent from Global Tech. Except as explicitly stated in this notice, no other
 *  rights or licenses, whether express or implied, are granted by Global Tech herein,
 *  including but not limited to any patent rights that might be infringed by your products
 *  that integrate the Global Tech Software or by other creations in which the Global Tech Software
 *  may be embedded.
 *
 *  The Global Tech Software is provided on an "AS IS" basis. GLOBAL TECH MAKES NO WARRANTIES,
 *  EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF
 *  NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE,
 *  REGARDING THE GLOBAL TECH SOFTWARE OR ITS USE AND FUNCTIONALITY ALONE OR IN COMBINATION
 *  WITH YOUR PRODUCTS.
 *
 *  IN NO EVENT SHALL GLOBAL TECH BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL, OR
 *  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 *  ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION, AND/OR DISTRIBUTION OF THE
 *  GLOBAL TECH SOFTWARE, HOWEVER CAUSED AND WHETHER UNDER THEORY OF CONTRACT, TORT
 *  (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, EVEN IF GLOBAL TECH HAS BEEN
 *  INFORMED OF THE POTENTIAL FOR SUCH DAMAGES.
 */

function InterfaceIndicatorButton(triggerElement, displayPanel, indicatorTheme, backdropTheme, onInteraction) {

    // Assign read-write interaction handler
    this.onInteraction = onInteraction;

    // Internal component references
    this._viewPanel = displayPanel;
    this._actionTrigger = triggerElement;
    this._iconElement = document.createElement("img");
    this._iconElement.width = 13;
    this._iconElement.height = 13;
    this._iconElement.setAttribute("alt_text", "Details");
    this._circleOverlay = document.createElement("div");

    // Attach elements to the triggering container
    triggerElement.appendChild(this._circleOverlay);
    triggerElement.appendChild(this._iconElement);

    // Initial visibility state for the icon
    this._iconVisibleStatus = false;

    // Preserve 'this' context for event handlers
    var _instanceRef = this;

    // Function to update the opacity during an animation
    this._adjustTransparency = function(transitionObject, currentValue, isInitial, isFinal) {
        _instanceRef._iconElement.style.opacity = currentValue;
    };

    // Callback executed when an animation sequence completes
    this._transitionFinished = function() {
        delete _instanceRef._activeTransition;
        delete _instanceRef._transitionHandler;
    };

    // Handler for mouse movement over the main display panel
    this._panelHoverEnter = function(interactionEvent) {
        // Clear any pending exit delays
        if (_instanceRef._exitDelay !== undefined) {
            clearTimeout(_instanceRef._exitDelay);
            delete _instanceRef._exitDelay;
        }

        // If icon is already visible, do nothing
        if (_instanceRef._iconVisibleStatus) {
            return;
        }

        // Determine animation starting point and duration
        var startingValue = 0.0;
        var animationDuration = 500;

        if (_instanceRef._activeTransition !== undefined) {
            startingValue = _instanceRef._activeTransition.currentValue; // Use `now` from original, renamed `currentValue`
            animationDuration = (new Date()).getTime() - _instanceRef._transitionHandler.startTime;
            _instanceRef._transitionHandler.stop();
        }

        // Mark icon as visible
        _instanceRef._iconVisibleStatus = true;

        // Create a new animation handler
        var transitionHandler = new WidgetMotionHandler(animationDuration, 13);
        transitionHandler.onCompleteCallback = _instanceRef._transitionFinished;
        _instanceRef._transitionHandler = transitionHandler;

        // Define the animation segment for opacity change
        _instanceRef._activeTransition = new WidgetAnimationSegment(startingValue, 1.0, _instanceRef._adjustTransparency);
        transitionHandler.addSegment(_instanceRef._activeTransition);
        transitionHandler.commence(); // Start the animation
    };

    // Handler for delayed mouse exit from the main display panel
    this._panelHoverExitDelayed = function(actionEvent) {
        if (_instanceRef._exitDelay === undefined) {
            // Set a timeout to hide the icon
            _instanceRef._exitDelay = setTimeout(_instanceRef._panelHoverExit, 0, _instanceRef);
        }
    };

    // Handler for actual mouse exit from the main display panel
    this._panelHoverExit = function(currentInstance) {
        // Clear any existing exit delay
        if (currentInstance._exitDelay !== undefined) {
            clearTimeout(currentInstance._exitDelay);
            delete currentInstance._exitDelay;
        }

        // If icon is not visible, do nothing
        if (!currentInstance._iconVisibleStatus) {
            return;
        }

        // Determine animation starting point and duration
        var startingValue = 1.0;
        var animationDuration = 500;

        if (currentInstance._activeTransition !== undefined) {
            startingValue = currentInstance._activeTransition.currentValue; // Use `now` from original, renamed `currentValue`
            animationDuration = (new Date()).getTime() - currentInstance._transitionHandler.startTime;
            currentInstance._transitionHandler.stop();
        }

        // Create a new animation handler
        var transitionHandler = new WidgetMotionHandler(animationDuration, 13);
        transitionHandler.onCompleteCallback = currentInstance._transitionFinished;
        currentInstance._transitionHandler = transitionHandler;

        // Define the animation segment for opacity change
        currentInstance._activeTransition = new WidgetAnimationSegment(startingValue, 0.0, currentInstance._adjustTransparency);
        transitionHandler.addSegment(currentInstance._activeTransition);
        transitionHandler.commence(); // Start the animation

        // Mark icon as hidden
        currentInstance._iconVisibleStatus = false;
    };

    // Handler for mouse entering the icon area
    this._iconHoverEnter = function(evt) {
        _instanceRef._temporaryHoverFlag = true; // Mark a temporary hover state
        _instanceRef._circleOverlay.style.visibility = "visible";
    };

    // Handler for mouse exiting the icon area
    this._iconHoverExit = function(evt) {
        delete _instanceRef._temporaryHoverFlag; // Clear temporary hover state
        _instanceRef._circleOverlay.style.visibility = "hidden";
    };

    // Handler for the icon being activated (clicked)
    this._iconActivated = function(eventTrigger) {
        _instanceRef._circleOverlay.style.visibility = "hidden";

        try {
            if (_instanceRef.onInteraction !== null) {
                _instanceRef.onInteraction(eventTrigger);
            }
        } catch (exceptionDetails) {
            throw exceptionDetails;
        } finally {
            eventTrigger.stopPropagation(); // Prevent event bubbling
            eventTrigger.preventDefault(); // Prevent default browser action
        }
    };

    // Temporary handler for mouse down on the icon
    this._temporaryIconPress = function(pressEvent) {
        document.addEventListener("mouseup", _instanceRef._temporaryDocumentRelease, true);
        pressEvent.stopPropagation();
        pressEvent.preventDefault();
    };

    // Temporary handler for mouse up on the document
    this._temporaryDocumentRelease = function(releaseEvent) {
        document.removeEventListener("mouseup", _instanceRef._temporaryDocumentRelease, true);

        // If the mouse was over the icon when released
        if (_instanceRef._temporaryHoverFlag !== undefined) {
            delete _instanceRef._temporaryHoverFlag;
            _instanceRef._iconActivated(releaseEvent);
        }
    };


    // Configure initial styling for the icon element
    var elementStyle = this._iconElement.style;
    elementStyle.position = "absolute";
    elementStyle.top = 0;
    elementStyle.left = 0;
    elementStyle.opacity = 0;

    // Configure initial styling for the circle overlay
    elementStyle = this._circleOverlay.style;
    elementStyle.position = "absolute";
    elementStyle.top = 0;
    elementStyle.left = 0;
    elementStyle.width = "13px";
    elementStyle.height = "13px";

    // Set initial transparency for the circle
    this.setOverlayTransparency(0.25);
    elementStyle.visibility = "hidden";

    // Apply the specified visual themes
    this.applyVisualTheme(indicatorTheme, backdropTheme);

    // Attach event listeners to the display panel for hover effects
    this._viewPanel.addEventListener("mousemove", this._panelHoverEnter, true);
    this._viewPanel.addEventListener("mouseout", this._panelHoverExitDelayed, true);

    // Attach event listeners to the action trigger (flipper)
    this._actionTrigger.addEventListener("mousedown", this._temporaryIconPress, true);
    this._actionTrigger.setAttribute("onclick", "interactionEvent.stopPropagation(); interactionEvent.preventDefault();");
    this._actionTrigger.addEventListener("mouseover", this._iconHoverEnter, true);
    this._actionTrigger.addEventListener("mouseout", this._iconHoverExit, true);
}


// Prototype method to clean up event listeners and DOM elements
InterfaceIndicatorButton.prototype.dispose = function() {
    // Remove event listeners from the view panel
    this._viewPanel.removeEventListener("mousemove", this._panelHoverEnter, true);
    this._viewPanel.removeEventListener("mouseout", this._panelHoverExitDelayed, true);

    // Remove event listeners from the action trigger
    this._actionTrigger.removeEventListener("mousedown", this._temporaryIconPress, true);
    this._actionTrigger.removeEventListener("mouseover", this._iconHoverEnter, true);
    this._actionTrigger.removeEventListener("mouseout", this._iconHoverExit, true);

    // Remove the icon and circle elements from their parent
    var containerElement = this._iconElement.parentNode;
    containerElement.removeChild(this._circleOverlay);
    containerElement.removeChild(this._iconElement);
};

// Prototype method to update the visual theme of the button
InterfaceIndicatorButton.prototype.applyVisualTheme = function(indicatorTheme, backdropTheme) {
    // Set the source for the icon image based on the indicator theme
    this._iconElement.src = "file:///System/Library/WidgetResources/widget_assets/" + indicatorTheme + "_icon.png";
    // Set the background for the circle overlay based on the backdrop theme
    this._circleOverlay.style.background = "url(file:///System/Library/WidgetResources/widget_assets/" + backdropTheme + "_rollover.png) no-repeat top left";
};

// Prototype method to set the transparency level of the circle overlay
InterfaceIndicatorButton.prototype.setOverlayTransparency = function(transparencyLevel) {
    this._circleOverlay.style.opacity = transparencyLevel;
};