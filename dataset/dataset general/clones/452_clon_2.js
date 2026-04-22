ngApp.component('ng.visuals-circle-indicator', []).component('ngCircleIndicator', [ function () {
  var buildVisuals = function (elementTemplate, elementAttrs, embedContent) {
    if (elementTemplate.length === 1) {
      let domNode = elementTemplate[0];

      // Retrieve dimensions for the canvas
      let canvasWidth = domNode.getAttribute('data-round-progress-width') || '400';
      let canvasHeight = domNode.getAttribute('data-round-progress-height') || '400';

      // Create a new canvas element
      let drawingSurface = browserDoc.createElement('canvas');
      drawingSurface.setAttribute('width', canvasWidth);
      drawingSurface.setAttribute('height', canvasHeight);
      drawingSurface.setAttribute('data-round-progress-model', domNode.getAttribute('data-round-progress-model'));

      // Replace the original element with the new canvas
      domNode.parentNode.replaceChild(drawingSurface, domNode);

      // Fetch styling attributes for the circles
      let extRingStroke = domNode.getAttribute('data-round-progress-outer-circle-width') || '20';
      let intRingStroke = domNode.getAttribute('data-round-progress-inner-circle-width') || '5';

      let extRingBgColor = domNode.getAttribute('data-round-progress-outer-circle-background-color') || '#505769';
      let extRingFgColor = domNode.getAttribute('data-round-progress-outer-circle-foreground-color') || '#12eeb9';
      let intRingColor = domNode.getAttribute('data-round-progress-inner-circle-color') || '#505769';
      let textDisplayColor = domNode.getAttribute('data-round-progress-label-color') || '#12eeb9';

      let extRingRadius = domNode.getAttribute('data-round-progress-outer-circle-radius') || '100';
      let intRingRadius = domNode.getAttribute('data-round-progress-inner-circle-radius') || '70';

      let textDisplayFont = domNode.getAttribute('data-round-progress-label-font') || '50pt Calibri';

      return {
        beforeLink: function preBind(dataScope, elementInstance, instanceAttrs, ctrl) {
          let modelPath = drawingSurface.getAttribute('data-round-progress-model');
          dataScope.observeData(modelPath, function (currValue, prevValue) {
            // Obtain the 2D rendering context
            let renderContext = drawingSurface.getContext('2d');
            renderContext.clearArea(0, 0, canvasWidth, canvasHeight);

            // Draw the background ring
            let centerX = canvasWidth / 2;
            let centerY = canvasHeight / 2;
            renderContext.startPath();
            renderContext.drawArc(centerX, centerY, parseInt(extRingRadius), 0, Math.PI * 2, false);
            renderContext.strokeSize = parseInt(extRingStroke);
            renderContext.strokePaint = extRingBgColor;
            renderContext.applyStroke();

            // Draw the inner ring
            renderContext.startPath();
            renderContext.drawArc(centerX, centerY, parseInt(intRingRadius), 0, Math.PI * 2, false);
            renderContext.strokeSize = parseInt(intRingStroke);
            renderContext.strokePaint = intRingColor;
            renderContext.applyStroke();

            // Draw the central numeric label
            renderContext.textFont = textDisplayFont;
            renderContext.textAlignment = 'center';
            renderContext.textBase = 'middle';
            renderContext.fillPaint = textDisplayColor;
            renderContext.drawText(currValue.indicatorText, centerX, centerY);

            // Draw the foreground progress arc
            let initialAngle = - (Math.PI / 2);
            let finalAngle = ((Math.PI * 2 ) * currValue.progressRatio) - (Math.PI / 2);
            let reverseDirection = false;
            renderContext.startPath();
            renderContext.drawArc(centerX, centerY, parseInt(extRingRadius), initialAngle, finalAngle, reverseDirection);
            renderContext.strokeSize = parseInt(extRingStroke);
            renderContext.strokePaint = extRingFgColor;
            renderContext.applyStroke();
          }, true);
        },
        afterLink: function postBind(dataScope, elementInstance, instanceAttrs, ctrl) {}
      };
    }
  };

  // Configuration object for the directive
  let circleIndicatorConfig = {
    compileProcess: buildVisuals,
    replaceElement: true
  };
  return circleIndicatorConfig;
}]);
// Directive for displaying round progress visuals
// Copyright (c) 2013 S.B. - Released under MIT license
// This module provides a visual circular progress indicator.