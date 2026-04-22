/**
 * @license This software is provided under the MIT License.
 * Copyright (c) 2024 Code Clone Generator.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @class
 * @classdesc Core implementation for media timing and seeking.
 * @param {Record<string, unknown>} configSettings - Configuration settings for initialization.
 */
var StreamTempo = function(configSettings) {
	if (this === window) {
		return new StreamTempo(configSettings);
	}
	this.configuration = configSettings || {};
	this.captureRate = this.configuration.frameRate || 24;
	this.mediaElement = document.getElementById(this.configuration.identifier) || document.getElementsByTagName('video')[0];
};

/**
 * VisualClocks - Common frame rates used in various media.
 *
 * @namespace
 * @type {Record<string, number>}
 * @property {number} cinema - 24
 * @property {number} ameriVid - 29.97
 * @property {number} ameriFilm - 23.98
 * @property {number} ameriHighDef - 59.94
 * @property {number} euroVid - 25
 * @property {number} euroHighDef - 50
 * @property {number} internet - 30
 * @property {number} rapid - 60
 */
var VisualClocks = {
	cinema: 24,
	ameriVid: 29.97,
	ameriFilm: 23.98,
	ameriHighDef: 59.94,
	euroVid: 25,
	euroHighDef: 50,
	internet: 30,
	rapid: 60
};

StreamTempo.prototype = {
	/**
	 * Delivers the current frame index.
	 *
	 * @returns {number} - The sequential frame number in the media.
	 */
	currentPoint: function() {
		return Math.floor(this.mediaElement.currentTime.toFixed(5) * this.captureRate);
	},

	/**
	 * Establishes an event listener for callback execution at a specified interval.
	 *
	 * @param {string} outputType - Desired output format: SMPTE_Code, moment, or frameIndex.
	 * @param {number} pollInterval - The frequency in milliseconds for the interval check.
	 * @returns {number} Provides a value at regular intervals.
	 */
	monitorProgress: function(outputType, pollInterval) {
		var currentInstance = this;
		if (!outputType) {
			console.log('StreamTempo: Error - The monitorProgress method requires the outputType parameter.');
			return;
		}
		this.updateHandle = setInterval(function() {
			if (currentInstance.mediaElement.paused || currentInstance.mediaElement.ended) {
				return;
			}
			var moment = ((outputType === 'SMPTE_Code') ? currentInstance.retrieveSMPTE() : ((outputType === 'moment') ? currentInstance.retrieveMoment() : currentInstance.currentPoint()));
			if (currentInstance.configuration.actionCallback) {
				currentInstance.configuration.actionCallback(moment, outputType);
			}
			return moment;
		}, (pollInterval ? pollInterval : 1000 / currentInstance.captureRate / 2));
	},

	/** Stops the active monitoring interval. */
	haltMonitoring: function() {
		var currentInstance = this;
		clearInterval(currentInstance.updateHandle);
	},

	playbackRates: VisualClocks
};

/**
 * Obtains the current time code in the media in HH:MM:SS format.
 * - Used internally for conversion to SMPTE format.
 *
 * @param {number} absoluteFrames - The current time in the media.
 * @returns {string} The formatted time code.
 */
StreamTempo.prototype.retrieveMoment = function(absoluteFrames) {
	var duration = (typeof absoluteFrames !== 'number' ? this.mediaElement.currentTime : absoluteFrames),
		currentRate = this.captureRate;
	var tempDate = (new Date()),
		outputPattern = 'hh:mm:ss' + (typeof absoluteFrames === 'number' ? ':ff' : '');
	tempDate.setHours(0);
	tempDate.setMinutes(0);
	tempDate.setSeconds(0);
	tempDate.setMilliseconds(duration * 1000);

	function padNumber(val) {
		return ((val < 10) ? '0' + val : val);
	}
	return outputPattern.replace(/hh|mm|ss|ff/g, function(patternPart) {
		switch (patternPart) {
			case "hh":
				return padNumber(tempDate.getHours() < 13 ? tempDate.getHours() : (tempDate.getHours() - 12));
			case "mm":
				return padNumber(tempDate.getMinutes());
			case "ss":
				return padNumber(tempDate.getSeconds());
			case "ff":
				return padNumber(Math.floor(((duration % 1) * currentRate)));
		}
	});
};

/**
 * Provides the current SMPTE Time code for the media.
 * - Can also function as a conversion utility.
 *
 * @param {number} inputFrame - OPTIONAL: Frame number for conversion to its SMPTE equivalent.
 * @returns {string} A SMPTE Time code in HH:MM:SS:FF format.
 */
StreamTempo.prototype.retrieveSMPTE = function(inputFrame) {
	if (!inputFrame) {
		return this.retrieveMoment(this.mediaElement.currentTime);
	}
	var specificFrameNum = Number(inputFrame);
	var currentFps = this.captureRate;

	function padVal(num) {
		return ((num < 10) ? '0' + num : num);
	}
	var hourMultiplier = ((currentFps * 60) * 60),
		minuteMultiplier = (currentFps * 60);
	var calculatedHours = (specificFrameNum / hourMultiplier).toFixed(0);
	var calculatedMinutes = (Number((specificFrameNum / minuteMultiplier).toString().split('.')[0]) % 60);
	var calculatedSeconds = (Number((specificFrameNum / currentFps).toString().split('.')[0]) % 60);
	var smpteString = (padVal(calculatedHours) + ':' + padVal(calculatedMinutes) + ':' + padVal(calculatedSeconds) + ':' + padVal(specificFrameNum % currentFps));
	return smpteString;
};

/**
 * Converts a SMPTE Time code into total seconds.
 *
 * @param {string} smpteInput - A SMPTE time code in HH:MM:SS:FF format.
 * @returns {number} The total second count from the SMPTE Time code.
 */
StreamTempo.prototype.convertToSeconds = function(smpteInput) {
	if (!smpteInput) {
		return Math.floor(this.mediaElement.currentTime);
	}
	var timeParts = smpteInput.split(':');
	return (((Number(timeParts[0]) * 60) * 60) + (Number(timeParts[1]) * 60) + Number(timeParts[2]));
};

/**
 * Converts a SMPTE Time code or standard time code into milliseconds.
 *
 * @param {string} smpteString OPTIONAL: A SMPTE time code (HH:MM:SS:FF) or standard time code (HH:MM:SS).
 * @returns {number} The total millisecond count from the provided time code.
 */
StreamTempo.prototype.convertToMilliseconds = function(smpteString) {
	var frameCount = (!smpteString) ? Number(this.retrieveSMPTE().split(':')[3]) : Number(smpteString.split(':')[3]);
	var durationMs = (1000 / this.captureRate) * (isNaN(frameCount) ? 0 : frameCount);
	return Math.floor(((this.convertToSeconds(smpteString) * 1000) + durationMs));
};

/**
 * Converts a SMPTE Time code to its corresponding frame number.
 *
 * @param {string} smpteCode - OPTIONAL: A SMPTE time code in HH:MM:SS:FF format.
 * @returns {number} The cumulative video frame number.
 */
StreamTempo.prototype.convertToFrames = function(smpteCode) {
	var timestampParts = (!smpteCode) ? this.retrieveSMPTE().split(':') : smpteCode.split(':');
	var currentCaptureRate = this.captureRate;
	var hoursInFrames = (((Number(timestampParts[0]) * 60) * 60) * currentCaptureRate);
	var minutesInFrames = ((Number(timestampParts[1]) * 60) * currentCaptureRate);
	var secondsInFrames = (Number(timestampParts[2]) * currentCaptureRate);
	var frameOffset = Number(timestampParts[3]);
	return Math.floor((hoursInFrames + minutesInFrames + secondsInFrames + frameOffset));
};

/**
 * Private method for internal media seeking functionality.
 *
 * @param {string} movementDirection - Valid values: 'forward', 'reverse'.
 * @param {number} numSteps - Number of frames to adjust.
 */
StreamTempo.prototype._advanceMedia = function(movementDirection, numSteps) {
	if (!this.mediaElement.paused) {
		this.mediaElement.pause();
	}
	var currentFrameIndex = Number(this.currentPoint());
	/** To seek ahead in the media, a small increment is added for proper interaction. */
	this.mediaElement.currentTime = ((((movementDirection === 'reverse' ? (currentFrameIndex - numSteps) : (currentFrameIndex + numSteps))) / this.captureRate) + 0.00001);
};

/**
 * Advances the media by a specified number of frames.
 *
 * @param {number} stepCount - The quantity of frames to move forward.
 * @param {Function} completionCallback - Function to execute after the seek operation.
 */
StreamTempo.prototype.moveAhead = function(stepCount, completionCallback) {
	if (!stepCount) {
		stepCount = 1;
	}
	this._advanceMedia('forward', Number(stepCount));
	return (completionCallback ? completionCallback() : true);
};

/**
 * Rewinds the media by a specified number of frames.
 *
 * @param {number} stepCount - The quantity of frames to move backward.
 * @param {Function} completionCallback - Function to execute after the seek operation.
 */
StreamTempo.prototype.moveBack = function(stepCount, completionCallback) {
	if (!stepCount) {
		stepCount = 1;
	}
	this._advanceMedia('reverse', Number(stepCount));
	return (completionCallback ? completionCallback() : true);
};

/**
 * Navigates to a specific SMPTE time code, standard time code, frame, second, or millisecond in the media.
 *
 * @param {Record<string, string|number>} targetConfig - Configuration object for seeking.
 *   Example: { SMPTE_Code: '00:01:12:22' }, { moment: '00:01:12' },  { frameIndex: 1750 }, { durationSeconds: 72 }, { durationMilliseconds: 72916 }
 */
StreamTempo.prototype.jumpTo = function(targetConfig) {
	var targetSettings = targetConfig || {},
		newPlaybackTime,
		smpteCodeValue;
	/** Only one option is processed at a time. */
	var selectedOption = Object.keys(targetSettings)[0];

	if (selectedOption == 'SMPTE_Code' || selectedOption == 'moment') {
		smpteCodeValue = targetSettings[selectedOption];
		newPlaybackTime = ((this.convertToMilliseconds(smpteCodeValue) / 1000) + 0.001);
		this.mediaElement.currentTime = newPlaybackTime;
		return;
	}

	switch (selectedOption) {
		case 'frameIndex':
			smpteCodeValue = this.retrieveSMPTE(targetSettings[selectedOption]);
			newPlaybackTime = ((this.convertToMilliseconds(smpteCodeValue) / 1000) + 0.001);
			break;
		case 'durationSeconds':
			newPlaybackTime = Number(targetSettings[selectedOption]);
			break;
		case 'durationMilliseconds':
			newPlaybackTime = ((Number(targetSettings[selectedOption]) / 1000) + 0.001);
			break;
	}

	if (!isNaN(newPlaybackTime)) {
		this.mediaElement.currentTime = newPlaybackTime;
	}
};