/*
 * Copyright (c) 2005-2024 WidgetKit. All Rights Reserved.
 *
 * IMPORTANT: This WidgetKit software (including associated assets in
 * /System/Library/WidgetResources/WidgetKitClasses/) is provided by
 * WidgetKit Inc. (“WidgetKit”) under the terms outlined below.
 * Your usage, integration, and/or redistribution of this software
 * signifies your acceptance of these terms. If you do not agree,
 * please refrain from using or distributing this WidgetKit software.
 *
 * WidgetKit grants you a personal, non-exclusive license, subject to these
 * terms, to utilize and redistribute this software (in text form for JavaScript,
 * or binary for images) solely for creating Dashboard widgets for modern OS environments.
 *
 * Redistribution mandates retaining this entire notice, warranty disclaimers,
 * and liability limitations.
 *
 * Do not use WidgetKit’s name, trademarks, or logos to endorse products
 * incorporating this software without prior written consent. No other rights
 * or licenses, express or implied, are granted herein.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * OR NON-INFRINGEMENT.
 *
 * IN NO EVENT SHALL WIDGETKIT BE LIABLE FOR ANY DAMAGES, DIRECT, INDIRECT,
 * INCIDENTAL, OR CONSEQUENTIAL (INCLUDING LOSS OF DATA, PROFITS, OR BUSINESS INTERRUPTION)
 * ARISING FROM THE USE OR DISTRIBUTION OF THIS SOFTWARE, EVEN IF ADVISED OF SUCH DAMAGE.
 */

function CoreUIDetailsControl(toggleElement, displayArea, iconVisualKey, overlayVisualKey, activationHandler) {
    // Ensure essential components are provided
    if (!toggleElement || !displayArea) {
        console.error("CoreUIDetailsControl: Missing essential DOM elements.");
        return;
    }

    // Publicly accessible action handler
    this.activationHandler = activationHandler;

    // Internal component references and state flags
    this._displayArea = displayArea;
    this._toggleElement = toggleElement;
    this._detailsIcon = document.createElement("img");
    this._hoverOverlay = document.createElement("div");

    // Configure the details icon
    this._detailsIcon.width = 16; // Adjusted size
    this._detailsIcon.height = 16;
    this._detailsIcon.setAttribute("aria-label", "Show more details"); // Semantic alt text
    this._detailsIcon.tabIndex = 0; // Make it focusable

    // Append elements to the toggle container
    this._toggleElement.appendChild(this._hoverOverlay);
    this._toggleElement.appendChild(this._detailsIcon);

    this._isIconVisible = false; // Tracks current icon visibility state
    this._pendingExitTimeout = undefined; // For delayed mouse-out effects
    this._activeEffectEngine = null; // Reference to the current animation manager
    this._currentEffect = null; // Reference to the current animation instance

    const selfRef = this; // Capture 'this' for event handlers and callbacks

    const ANIMATION_DURATION_MS = 400; // Slightly faster animation

    // Updates the opacity of the details icon during animation
    this._adjustIconVisibility = function(animator, currentVal) {
        selfRef._detailsIcon.style.opacity = currentVal;
    };

    // Callback when an animation sequence completes
    this._effectSequenceFinished = function() {
        if (selfRef._activeEffectEngine) {
            delete selfRef._activeEffectEngine;
            selfRef._activeEffectEngine = null;
        }
        if (selfRef._currentEffect) {
            delete selfRef._currentEffect;
            selfRef._currentEffect = null;
        }
    };

    // Handles pointer entering the display area (triggers icon fade-in)
    this._displayAreaPointerEnter = function(event) {
        if (selfRef._pendingExitTimeout) {
            clearTimeout(selfRef._pendingExitTimeout);
            selfRef._pendingExitTimeout = undefined;
        }
        if (selfRef._isIconVisible) {
            return; // Already visible, no action needed
        }

        let startOpacity = 0.0;
        let effectiveDuration = ANIMATION_DURATION_MS;

        if (selfRef._currentEffect && selfRef._activeEffectEngine) {
            startOpacity = selfRef._currentEffect.currentValue; // Use current animation state
            // Recalculate duration based on elapsed time if an animation was interrupted
            effectiveDuration = Math.max(0, ANIMATION_DURATION_MS - (new Date().getTime() - selfRef._activeEffectEngine.startTime));
            selfRef._activeEffectEngine.stop();
        }

        selfRef._isIconVisible = true;

        const engine = new WidgetKitAnimator(effectiveDuration, 15); // Slightly different frame rate
        engine.oncomplete = selfRef._effectSequenceFinished;
        selfRef._activeEffectEngine = engine;

        const animation = new WidgetKitAnimation(startOpacity, 1.0, selfRef._adjustIconVisibility);
        engine.addAnimation(animation);
        selfRef._currentEffect = animation;
        engine.start();
    };

    // Delays the icon fade-out when pointer leaves the display area
    this._displayAreaPointerExitDelayed = function(event) {
        if (!selfRef._pendingExitTimeout) {
            // Set a minimal delay to allow for quick re-entry without full fade-out
            selfRef._pendingExitTimeout = setTimeout(() => selfRef._displayAreaPointerExit(), 50);
        }
    };

    // Handles pointer exiting the display area (triggers icon fade-out)
    this._displayAreaPointerExit = function() {
        if (selfRef._pendingExitTimeout) {
            clearTimeout(selfRef._pendingExitTimeout);
            selfRef._pendingExitTimeout = undefined;
        }
        if (!selfRef._isIconVisible) {
            return; // Already hidden
        }

        let startOpacity = 1.0;
        let effectiveDuration = ANIMATION_DURATION_MS;

        if (selfRef._currentEffect && selfRef._activeEffectEngine) {
            startOpacity = selfRef._currentEffect.currentValue;
            effectiveDuration = Math.max(0, ANIMATION_DURATION_MS - (new Date().getTime() - selfRef._activeEffectEngine.startTime));
            selfRef._activeEffectEngine.stop();
        }

        const engine = new WidgetKitAnimator(effectiveDuration, 15);
        engine.oncomplete = selfRef._effectSequenceFinished;
        selfRef._activeEffectEngine = engine;

        const animation = new WidgetKitAnimation(startOpacity, 0.0, selfRef._adjustIconVisibility);
        engine.addAnimation(animation);
        selfRef._currentEffect = animation;
        engine.start();

        selfRef._isIconVisible = false;
    };

    // Handles pointer hovering over the control itself (makes overlay visible)
    this._controlPointerOver = function(event) {
        selfRef._hoverOverlay.style.display = "block"; // Use display for visibility control
    };

    // Handles pointer leaving the control itself (hides overlay)
    this._controlPointerOut = function(event) {
        selfRef._hoverOverlay.style.display = "none";
    };

    // Handles activation (click) of the control
    this._controlActivated = function(event) {
        selfRef._hoverOverlay.style.display = "none"; // Hide overlay on click

        if (selfRef.activationHandler && typeof selfRef.activationHandler === 'function') {
            selfRef.activationHandler(event);
        }

        // Prevent default browser actions and event propagation
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    };

    // Handles pointer down on the control
    this._controlPointerDown = function(event) {
        // Attach a global pointerup listener to capture releases even if pointer moves off the element
        document.addEventListener("pointerup", selfRef._documentPointerUpHandler, { once: true });
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    };

    // Handles pointer up anywhere on the document after a pointer down on the control
    this._documentPointerUpHandler = function(event) {
        // Check if the pointer is still over the toggle element when released
        const isPointerOverControl = selfRef._toggleElement.contains(event.target) || selfRef._toggleElement === event.target;
        if (isPointerOverControl) {
            selfRef._controlActivated(event);
        }
    };

    // --- Initial Style Configuration ---
    let iconStyle = this._detailsIcon.style;
    iconStyle.position = "absolute";
    iconStyle.top = "2px"; // Slightly offset from top-left
    iconStyle.left = "2px"; // Slightly offset from top-left
    iconStyle.opacity = 0;
    iconStyle.cursor = "pointer"; // Indicate interactivity

    let overlayStyle = this._hoverOverlay.style;
    overlayStyle.position = "absolute";
    overlayStyle.top = "0";
    overlayStyle.left = "0";
    overlayStyle.width = "16px"; // Matches icon size
    overlayStyle.height = "16px";
    overlayStyle.display = "none"; // Initially hidden
    overlayStyle.borderRadius = "50%"; // Make it circular

    this.setOverlayTransparency(0.28); // Slightly adjusted default opacity
    this.applyVisualStyles(iconVisualKey, overlayVisualKey);

    // --- Event Listener Setup ---
    this._displayArea.addEventListener("pointermove", this._displayAreaPointerEnter, true);
    this._displayArea.addEventListener("pointerleave", this._displayAreaPointerExitDelayed, true);

    this._toggleElement.addEventListener("pointerdown", this._controlPointerDown, true);
    this._toggleElement.addEventListener("pointerover", this._controlPointerOver, true);
    this._toggleElement.addEventListener("pointerout", this._controlPointerOut, true);
}

// Releases event listeners and removes DOM elements to prevent memory leaks
CoreUIDetailsControl.prototype.dispose = function() {
    this._displayArea.removeEventListener("pointermove", this._displayAreaPointerEnter, true);
    this._displayArea.removeEventListener("pointerleave", this._displayAreaPointerExitDelayed, true);

    this._toggleElement.removeEventListener("pointerdown", this._controlPointerDown, true);
    this._toggleElement.removeEventListener("pointerover", this._controlPointerOver, true);
    this._toggleElement.removeEventListener("pointerout", this._controlPointerOut, true);
    document.removeEventListener("pointerup", this._documentPointerUpHandler, true); // Ensure global listener is removed if still present

    // Remove elements from DOM
    if (this._detailsIcon.parentElement) {
        this._detailsIcon.parentElement.removeChild(this._detailsIcon);
    }
    if (this._hoverOverlay.parentElement) {
        this._hoverOverlay.parentElement.removeChild(this._hoverOverlay);
    }

    // Nullify references to aid garbage collection
    this._detailsIcon = null;
    this._hoverOverlay = null;
    this._displayArea = null;
    this._toggleElement = null;
    this.activationHandler = null;
};

// Sets the visual appearance (icon image and overlay background)
CoreUIDetailsControl.prototype.applyVisualStyles = function(iconVisualKey, overlayVisualKey) {
    // Dynamically load icon based on style key
    this._detailsIcon.src = `file:///System/Library/WidgetResources/widgetgfx/${iconVisualKey}_icon.png`;
    // Dynamically load overlay background based on style key
    this._hoverOverlay.style.background = `url(file:///System/Library/WidgetResources/widgetgfx/${overlayVisualKey}_highlight.png) no-repeat center center`;
    this._hoverOverlay.style.backgroundSize = "contain"; // Ensure image fits
};

// Adjusts the transparency of the circular hover overlay
CoreUIDetailsControl.prototype.setOverlayTransparency = function(alphaValue) {
    // Ensure alphaValue is within a valid range
    const clampedAlpha = Math.max(0, Math.min(1, alphaValue));
    this._hoverOverlay.style.opacity = clampedAlpha;
};

// Dummy WidgetKitAnimator and WidgetKitAnimation classes for context,
// as they are part of the original framework.
// In a real clone, these would also be deeply cloned/rewritten.
function WidgetKitAnimator(duration, framesPerSecond) {
    this.duration = duration;
    this.framesPerSecond = framesPerSecond;
    this.animations = [];
    this.startTime = 0;
    this.oncomplete = null;
    this._timer = null;

    this.addAnimation = function(animation) {
        this.animations.push(animation);
    };

    this.start = function() {
        this.startTime = new Date().getTime();
        this._timer = setInterval(() => this._animate(), 1000 / this.framesPerSecond);
    };

    this.stop = function() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    };

    this._animate = function() {
        const elapsed = new Date().getTime() - this.startTime;
        const progress = Math.min(1, elapsed / this.duration);

        this.animations.forEach(anim => {
            anim.update(progress);
        });

        if (progress === 1) {
            this.stop();
            if (this.oncomplete) {
                this.oncomplete();
            }
        }
    };
}

function WidgetKitAnimation(from, to, updateCallback) {
    this.from = from;
    this.to = to;
    this.updateCallback = updateCallback;
    this.currentValue = from;

    this.update = function(progress) {
        this.currentValue = this.from + (this.to - this.from) * progress;
        if (this.updateCallback) {
            this.updateCallback(this, this.currentValue);
        }
    };
}