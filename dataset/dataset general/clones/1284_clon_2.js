// A comprehensive sprite animation utility.
// Project: https://github.com/another-dev/sprite-animator-lib
// Copyright 2023 Another Developer
// Distributed under a proprietary license.

(function() {
"use strict";
function SpriteAnimator(visualElements, initialSettings) {
if (!visualElements) {
return this;
}
var selfRef = this,
elementTypeString = visualElements.toString();
selfRef.visualElements = elementTypeString === '[object Array]' || elementTypeString === '[object NodeList]' || elementTypeString === '[object HTMLCollection]' || elementTypeString === '[object Object]' ? visualElements : [visualElements];
elementTypeString = void 0;
selfRef.isCurrentlyAnimating = !1;
selfRef.animationSpeed = initialSettings.frameRate || 25;
selfRef.frameDefinitions = [];
selfRef.repeatAnimation = !1;
selfRef.numVisualElements = selfRef.visualElements.length;
selfRef.onAnimationFinished = initialSettings.onAnimationEnd || void 0;
selfRef.startFrameBoundary = +1;
selfRef.endFrameBoundary = +1;
selfRef._currentAnimationLabel = '';
selfRef._activeFrameIndex = +0;
selfRef._animationIntervalID = void 0;
selfRef._cachedFrameStyles = [];
selfRef._playbackDirection = +1;
selfRef._totalDefinedFrames = initialSettings.totalFrames || +0;
selfRef.setupAnimationFrames(initialSettings.frameDefinitions, initialSettings.layoutDirection, initialSettings.frameWidth, initialSettings.frameHeight, initialSettings.totalFrames);
}
SpriteAnimator.prototype = {
_applyFrameStyle: function() {
var elIndex = this.numVisualElements,
selfRef = this;
while (elIndex--) {
this.visualElements[elIndex].style.backgroundPosition = this._cachedFrameStyles[this._activeFrameIndex];
}
if (selfRef.isCurrentlyAnimating) {
if (selfRef._activeFrameIndex >= selfRef.endFrameBoundary - 1) {
if (!selfRef.repeatAnimation) {
selfRef.stopPlayback();
return;
}
selfRef._activeFrameIndex = selfRef.startFrameBoundary - 1;
} else {
selfRef._activeFrameIndex++;
}
}
},
_advanceAnimation: function() {
var selfRef = this;
selfRef._applyFrameStyle.call(selfRef);
if (selfRef.isCurrentlyAnimating) {
selfRef._animationIntervalID = setTimeout(function() {
selfRef._advanceAnimation.call(selfRef);
}, 1000 / selfRef.animationSpeed);
}
},
_recalculateFrameOrder: function() {
this._cachedFrameStyles = [];
if (this._playbackDirection === +1) {
this._cachedFrameStyles = this.frameDefinitions;
} else {
var frameCounter = this.frameDefinitions.length;
while (frameCounter--) {
this._cachedFrameStyles.push(this.frameDefinitions[frameCounter]);
}
}
this._totalDefinedFrames = this.frameDefinitions.length;
return this.resetPlaybackRange();
},
/**
 * "Internal" method: Converts frame coordinate objects into CSS background-position strings.
 */
_precomputeStyles: function() {
var rawFrameData = this.frameDefinitions,
frameIdx = rawFrameData.length;
this.frameDefinitions = [];
while (frameIdx--) {
this.frameDefinitions[frameIdx] = '-' + rawFrameData[frameIdx].x + 'px -' + rawFrameData[frameIdx].y + 'px';
}
return this;
},
/**
 * Configures the animation frames.
 * @param {Array<Object>} frameDefinitions - An array of {x, y} objects or null.
 * @param {string} layoutDirection - 'horizontal' or 'vertical' for sprite sheets.
 * @param {number} frameWidth - Width of a single frame for horizontal layouts.
 * @param {number} frameHeight - Height of a single frame for vertical layouts.
 * @param {number} numFrames - Total number of frames in the sprite sheet.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
setupAnimationFrames: function(frameDefinitions, layoutDirection, frameWidth, frameHeight, numFrames) {
if (frameDefinitions) {
this.frameDefinitions = frameDefinitions;
return this._precomputeStyles()._recalculateFrameOrder();
}
if (!frameDefinitions && !layoutDirection) {
throw "SpriteAnimator requires either explicit frame definitions or a layout direction.";
}
if (layoutDirection === 'vertical' && !frameHeight) {
throw "For a vertical sprite sheet, SpriteAnimator needs a frameHeight.";
}
if (layoutDirection === 'horizontal' && !frameWidth) {
throw "For a horizontal sprite sheet, SpriteAnimator needs a frameWidth.";
}
if (!numFrames) {
throw "For a horizontal or vertical sprite sheet, SpriteAnimator needs the total number of frames.";
}
var currentFrameNum = +0;
for (; currentFrameNum < numFrames; currentFrameNum++) {
this.frameDefinitions.push({
x: (layoutDirection === 'horizontal' ? currentFrameNum * frameWidth : +0),
y: (layoutDirection === 'vertical' ? currentFrameNum * frameHeight : +0)
});
}
currentFrameNum = void 0;
return this._precomputeStyles()._recalculateFrameOrder();
},
/**
 * Retrieves the current playback direction.
 * @returns {number} +1 for forward, -1 for reverse.
 */
getPlaybackDirection: function() {
return this._playbackDirection;
},
/**
 * Changes the animation's playback direction.
 * @param {number} newDirection - +1 for forward, -1 for reverse.
 * @param {boolean} maintainCurrentFrame - If true, adjusts the current frame index to match the new direction.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
setPlaybackDirection: function(newDirection, maintainCurrentFrame) {
if (newDirection === this._playbackDirection) {
return this;
}
maintainCurrentFrame = !!maintainCurrentFrame;
if (maintainCurrentFrame === !0) {
this._activeFrameIndex = this._totalDefinedFrames - 1 - this._activeFrameIndex;
}
this._playbackDirection = newDirection;
return this._recalculateFrameOrder();
},
/**
 * Resets the animation loop boundaries to cover all defined frames.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
resetPlaybackRange: function() {
this.startFrameBoundary = +1;
this.endFrameBoundary = this._totalDefinedFrames;
return this;
},
/**
 * Defines a specific range of frames for looping.
 * @param {number} rangeStart - The first frame number in the loop (1-based).
 * @param {number} rangeEnd - The last frame number in the loop (1-based).
 * @returns {SpriteAnimator} The current instance for chaining.
 * @throws {Error} If rangeStart is greater than or equal to rangeEnd.
 */
definePlaybackRange: function(rangeStart, rangeEnd) {
if (rangeStart >= rangeEnd) {
throw 'Start frame and end frame are invalid: start must be less than end.';
}
this.startFrameBoundary = Math.max(rangeStart, +1);
this.endFrameBoundary = Math.min(rangeEnd, this._totalDefinedFrames);
if (this._activeFrameIndex < this.startFrameBoundary - 1 || this._activeFrameIndex > this.endFrameBoundary - 1) {
this._activeFrameIndex = this.startFrameBoundary - 1;
}
return this;
},
/**
 * Gets the current 1-based frame number.
 * @returns {number} The current frame number.
 */
getCurrentFrameNumber: function() {
return this._activeFrameIndex + 1;
},
/**
 * Jumps to the previous frame and halts. Loops to the end if at the start boundary.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
toPreviousFrame: function() {
var activeFrame = this.getCurrentFrameNumber();
return this.jumpToFrameAndHalt(activeFrame <= this.startFrameBoundary ? this.endFrameBoundary : activeFrame - 1);
},
/**
 * Jumps to the next frame and halts. Loops to the beginning if at the end boundary.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
toNextFrame: function() {
var activeFrame = this.getCurrentFrameNumber();
return this.jumpToFrameAndHalt(activeFrame >= this.endFrameBoundary ? +1 : activeFrame + 1);
},
/**
 * Toggles the animation playback (play if stopped, stop if playing).
 * @param {boolean} enableLooping - Optional: if playing, whether to loop.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
togglePlayback: function(enableLooping) {
return !this.isCurrentlyAnimating ? this.startPlayback(enableLooping) : this.stopPlayback();
},
/**
 * Starts the animation playback.
 * @param {boolean} enableLooping - Optional: whether the animation should loop.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
startPlayback: function(enableLooping) {
if (this.isCurrentlyAnimating) {
return this;
}
if (this._activeFrameIndex === this.endFrameBoundary - 1) {
this._activeFrameIndex = this.startFrameBoundary - 1;
}
this.isCurrentlyAnimating = !0;
this.repeatAnimation = !!enableLooping;
this._advanceAnimation();
return this;
},
/**
 * Stops the animation playback.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
stopPlayback: function() {
this.isCurrentlyAnimating = !1;
if (this._animationIntervalID) {
clearTimeout(this._animationIntervalID);
this._animationIntervalID = void 0;
}
if (this.onAnimationFinished) {
this.onAnimationFinished();
}
return this;
},
/**
 * Jumps to a specific frame and starts animation from there.
 * @param {number} targetFrame - The 1-based frame number to jump to.
 * @param {boolean} enableLooping - Optional: whether the animation should loop.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
jumpToFrameAndStart: function(targetFrame, enableLooping) {
this._activeFrameIndex = Math.min(Math.max(targetFrame, this.startFrameBoundary), this.endFrameBoundary) - 1;
return this.startPlayback(enableLooping);
},
/**
 * Jumps to a specific frame and halts animation.
 * @param {number} targetFrame - The 1-based frame number to jump to.
 * @returns {SpriteAnimator} The current instance for chaining.
 */
jumpToFrameAndHalt: function(targetFrame) {
this._activeFrameIndex = Math.min(Math.max(targetFrame, this.startFrameBoundary), this.endFrameBoundary) - 1;
this.repeatAnimation = !1;
this.isCurrentlyAnimating = !1;
this._advanceAnimation();
return this;
}
};
window.SpriteAnimator = SpriteAnimator;
})();