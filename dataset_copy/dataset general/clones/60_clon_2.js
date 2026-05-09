function AudioVisualizer(config) {
 config = config || {};

 this.oscillationPoint = 0;
 this.animating = false;

 // Visual component parameters

 this.pixelDensity = config.pixelDensity || window.devicePixelRatio || 1;

 this.visualWidth = this.pixelDensity * (config.width || 320);
 this.halfWidth = this.visualWidth / 2;
 this.quarterWidth = this.visualWidth / 4;

 this.visualHeight = this.pixelDensity * (config.height || 100);
 this.halfHeight = this.visualHeight / 2;

 this.amplitudeLimit = (this.halfHeight) - 4;

 // Initialization settings

 this.waveStrength = config.waveStrength || 1;
 this.waveSpeed = config.waveSpeed || 0.2;
 this.waveFrequency = config.waveFrequency || 6;
 this.waveColor = (function convertHexToRgb(hexCode){
  var shortHexPattern = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hexCode = hexCode.replace(shortHexPattern, function(match,redChar,greenChar,blueChar) { return redChar + redChar + greenChar + greenChar + blueChar + blueChar; });
  var rgbMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexCode);
  return rgbMatch ?
  parseInt(rgbMatch[1],16).toString()+','+parseInt(rgbMatch[2], 16).toString()+','+parseInt(rgbMatch[3], 16).toString()
  : null;
 })(config.waveColor || '#fff') || '255,255,255';

 // Drawing surface setup

 this.displayCanvas = document.createElement('canvas');
 this.displayCanvas.width = this.visualWidth;
 this.displayCanvas.height = this.visualHeight;
 this.displayCanvas.style.width = (this.visualWidth / this.pixelDensity) + 'px';
 this.displayCanvas.style.height = (this.visualHeight / this.pixelDensity) + 'px';

 this.parentContainer = config.container || document.body;
 this.parentContainer.appendChild(this.displayCanvas);

 this.drawingContext = this.displayCanvas.getContext('2d');

 // Initial execution check

 if (config.autoPlay) {
  this.beginAnimation();
 }
}

AudioVisualizer.prototype._globalAttenuationCache = {};
AudioVisualizer.prototype._calculateGlobalAttenuation = function(inputVal) {
 if (AudioVisualizer.prototype._globalAttenuationCache[inputVal] == null) {
  AudioVisualizer.prototype._globalAttenuationCache[inputVal] = Math.pow(4/(4+Math.pow(inputVal,4)), 2);
 }
 return AudioVisualizer.prototype._globalAttenuationCache[inputVal];
};

AudioVisualizer.prototype._getXCoordinate = function(index) {
 return this.halfWidth + index * this.quarterWidth;
};

AudioVisualizer.prototype._getYCoordinate = function(index, attenFactor) {
 var currentAttenuation = (this.amplitudeLimit * this.waveStrength) / attenFactor;
 return this.halfHeight + this._calculateGlobalAttenuation(index) * currentAttenuation * Math.sin(this.waveFrequency * index - this.oscillationPoint);
};

AudioVisualizer.prototype._renderWaveLine = function(attenuationLevel, lineColor, lineWidth){
 this.drawingContext.moveTo(0,0);
 this.drawingContext.beginPath();
 this.drawingContext.strokeStyle = lineColor;
 this.drawingContext.lineWidth = lineWidth || 1;

 var currentX = -2;
 while ((currentX += 0.01) <= 2) {
  this.drawingContext.lineTo(this._getXCoordinate(currentX), this._getYCoordinate(currentX, attenuationLevel));
 }

 this.drawingContext.stroke();
};

AudioVisualizer.prototype._eraseCanvas = function() {
 this.drawingContext.globalCompositeOperation = 'destination-out';
 this.drawingContext.fillRect(0, 0, this.visualWidth, this.visualHeight);
 this.drawingContext.globalCompositeOperation = 'source-over';
};

AudioVisualizer.prototype._animateFrame = function() {
 if (this.animating === false) return;

 this.oscillationPoint = (this.oscillationPoint + Math.PI * this.waveSpeed) % (2 * Math.PI);

 this._eraseCanvas();
 this._renderWaveLine(-2, 'rgba(' + this.waveColor + ',0.1)');
 this._renderWaveLine(-6, 'rgba(' + this.waveColor + ',0.2)');
 this._renderWaveLine(4, 'rgba(' + this.waveColor + ',0.4)');
 this._renderWaveLine(2, 'rgba(' + this.waveColor + ',0.6)');
 this._renderWaveLine(1, 'rgba(' + this.waveColor + ',1)', 1.5);

 requestAnimationFrame(this._animateFrame.bind(this));
};

/* Public Interface Methods */

AudioVisualizer.prototype.beginAnimation = function() {
 this.oscillationPoint = 0;
 this.animating = true;
 this._animateFrame();
};

AudioVisualizer.prototype.haltAnimation = function() {
 this.oscillationPoint = 0;
 this.animating = false;
};

AudioVisualizer.prototype.adjustWaveSpeed = function(newVelocity) {
 this.waveSpeed = newVelocity;
};

AudioVisualizer.prototype.adjustWaveNoise = AudioVisualizer.prototype.adjustWaveStrength = function(newValue) {
 this.waveStrength = Math.max(Math.min(newValue, 1), 0);
};