var ImagePan = function(initSettings) {

 'use strict';

 var primaryAssetURL = initSettings.url,
  previewAssetPath = initSettings.lowResUrl,
  displayArea = initSettings.container || document.body,
  currentOrientation = 0,
  delayHandle = 0,
  preventRotation,
  renderWindow,
  assetDetails,
  visualElement,
  assetFetcher,
  widthDifference,
  midpointDisplacement,
  sliderTrackWidth,
  sliderMidpointOffset,
  sliderIndicatorSize,
  sliderPointer,
  appSettings;

 appSettings = {
  maxDeviationAngle: initSettings.maxTilt || 20,
  progressiveLoad: initSettings.lowResUrl || false,
  invertDirection: initSettings.reverseTilt || false
 };

 window.animateFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

 var initializeModule = function() {

  var resourcePath = appSettings.progressiveLoad ? previewAssetPath : primaryAssetURL;

  createDisplayFrame();

  fetchAsset(resourcePath, function() {

   visualElement = assetFetcher.cloneNode(false);
   processAssetDetails();
   assetFetcher = null;

   if (appSettings.progressiveLoad) {

    fetchAsset(primaryAssetURL, function() {
     visualElement.src = assetFetcher.src;
     assetFetcher = null;
    });

   }

   drawContent();
   attachHandlers();

  });

 };

 var adjustPlacement = function() {

  var leanAngle = currentOrientation,
   pixelShift;

  if (leanAngle > 0) {
   leanAngle = Math.min(leanAngle, appSettings.maxDeviationAngle);
  } else {
   leanAngle = Math.max(leanAngle, appSettings.maxDeviationAngle * -1);
  }

  if (!appSettings.invertDirection) {
   leanAngle = leanAngle * -1;
  }

  pixelShift = (leanAngle * midpointDisplacement) / appSettings.maxDeviationAngle;

  updateGraphicPosition(assetDetails, (midpointDisplacement + pixelShift) * -1);

  adjustSlider(leanAngle);

  window.animateFrame(adjustPlacement);

 };

 var adjustSlider = function(leanAngle) {

  var pixelShift = (leanAngle * ((sliderTrackWidth - sliderIndicatorSize) / 2)) / appSettings.maxDeviationAngle;
  applyHorizontalTransform(sliderPointer, (sliderMidpointOffset + pixelShift));

 };

 var updateGraphicPosition = function(graphicSpec, pixelShift) {
  applyHorizontalTransform(visualElement, pixelShift);
 };

 var attachHandlers = function() {

  if (window.DeviceOrientationEvent) {

   var smoothedGammaReadings = [];

   window.addEventListener('deviceorientation', function(sensorEvent) {

    if (!preventRotation) {

     if (smoothedGammaReadings.length > 8) {
      smoothedGammaReadings.shift();
     }

     smoothedGammaReadings.push(sensorEvent.gamma);

     currentOrientation = smoothedGammaReadings.reduce(function(firstVal, secondVal) {
      return firstVal + secondVal;
     }) / smoothedGammaReadings.length;

    }

   }, false);

   window.animateFrame(adjustPlacement);

  }

  window.addEventListener('resize', function() {

   displayArea.classList.add('is-rescaling');
   window.clearTimeout(delayHandle);

   delayHandle = window.setTimeout(function() {

    createDisplayFrame();
    displayArea.innerHTML = "";
    drawContent();
    displayArea.classList.remove('is-rescaling');

   }, 100);

  }, false);

 };

 var applyHorizontalTransform = function(nodeElement, moveAmount) {
  nodeElement.style.webkitTransform =
   nodeElement.style.MozTransform =
   nodeElement.style.msTransform =
   nodeElement.style.transform = "translateX(" + Math.round(moveAmount) + "px)";
 };

 var drawContent = function() {

  var clipContainer,
   sliderTrack,
   scaledGraphicWidth,
   sliderTrackOffset = 20;

  clipContainer = document.createElement('div');
  clipContainer.classList.add('visual-mask');

  visualElement.height = renderWindow.height;
  scaledGraphicWidth = (assetDetails.dimensionRatio * visualElement.height);

  widthDifference = scaledGraphicWidth - renderWindow.width;
  midpointDisplacement = widthDifference / 2;

  sliderTrack = document.createElement('div');
  sliderTrack.classList.add('position-slider');
  sliderTrackWidth = renderWindow.width - sliderTrackOffset;

  sliderPointer = document.createElement('div');
  sliderPointer.classList.add('slider-indicator');

  sliderIndicatorSize = (renderWindow.width * sliderTrackWidth) / scaledGraphicWidth;
  sliderPointer.style.width = sliderIndicatorSize + 'px';

  sliderMidpointOffset = ((sliderTrackWidth / 2) - (sliderIndicatorSize / 2));

  adjustPlacement();

  if (sliderMidpointOffset > 0) {
   preventRotation = false;
   sliderTrack.appendChild(sliderPointer);
   clipContainer.appendChild(sliderTrack);
   displayArea.classList.remove('no-transitions');
  } else {
   preventRotation = true;
   currentOrientation = 0;
   displayArea.classList.add('no-transitions');
  }

  clipContainer.appendChild(visualElement);
  displayArea.appendChild(clipContainer);

 };

 var createDisplayFrame = function() {

  var hostStyle = window.getComputedStyle(displayArea, null);

  renderWindow = {
   width: parseInt(hostStyle.width, 10),
   height: parseInt(hostStyle.height, 10)
  };

 };

 var processAssetDetails = function() {

  assetDetails = {
   width: assetFetcher.width,
   height: assetFetcher.height,
   dimensionRatio: assetFetcher.width / assetFetcher.height,
   sourceAttribute: assetFetcher.src
  };

 };

 var fetchAsset = function(sourceLink, onAssetLoaded) {

  assetFetcher = new Image();
  assetFetcher.addEventListener('load', onAssetLoaded, false);
  assetFetcher.src = sourceLink;

 };

 initializeModule();

 return {
  retrieveDisplayArea: function() {
   return displayArea;
  }
 }

};