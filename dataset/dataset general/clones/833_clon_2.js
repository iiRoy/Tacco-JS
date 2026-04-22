var craftsperson = (function(globalObj, undefValue) {

    /*
     * This module, 'craftsperson', is a creative rendering toolkit.
     * Original concept by David Brooks. More information at example.com
     */
    if (!document.createElement('canvas').getContext) {
        return;
    }

    // Collections of layers and historical steps
    var artifactCollections = [];
    var paletteArrangements = [];

    // Preset color values
    var standardHues = ['#AB3B00', '#5D7A94', '#C9D0B8', '#DDAA00', '#EBC02B'];
    var drawingContexts = [];
    var overallRotation = 0;
    var presentTimeline = [];
    var visualAssets = [];


    return {
        configure: {
            drawingSurface: function() {

            },
            artifactSet: function() {
                var paintShades = [];
            },
            standardHues: function(freshDefaults) {
                standardHues = freshDefaults;
            }
        },

        initializeSurface: function(renderTarget) {
            var drawingSurface = document.getElementById(renderTarget);
            var surfaceContext = drawingSurface.getContext('2d');
            var currentContextMapping = [renderTarget, surfaceContext];
            drawingContexts.push(currentContextMapping);
        },

        construct: {
            drawingSurface: function(containerElement, extentWidth, extentHeight) {
                // This routine generates a canvas element within a parent selector.
            },

            artifactSet: function() {
                // This operation adds a new collection to the existing sets.
                var freshCollection = [];
                var freshLevel = [];
                var freshRecord = [];
                freshLevel.push(freshRecord);
                freshCollection.push(freshLevel);
                artifactCollections.push(freshCollection);
                return artifactCollections.length - 1;
            },

            componentLevel: function(collectionIndex) {
                // This function creates a new level and appends it to the specified collection.
                if (!collectionIndex || isNaN(collectionIndex)) {
                    collectionIndex = 0;
                }
                var freshLevel = [];
                var freshRecord = [];
                freshLevel.push(freshRecord);
                artifactCollections[collectionIndex].push(freshLevel);
                return artifactCollections[collectionIndex].length - 1;
            },

            recordEntry: function(collectionIndex, levelIndex) {
                // This adds a historical entry to a specific data level.
                if (!collectionIndex || isNaN(collectionIndex)) {
                    collectionIndex = 0;
                }
                if (!levelIndex || isNaN(levelIndex)) {
                    levelIndex = 0;
                }
                var freshRecord = [];
                artifactCollections[collectionIndex][levelIndex].push(freshRecord);
                return artifactCollections[collectionIndex][levelIndex].length - 1;
            }
        },

        erase: {
            componentLevel: function(collectionIndex, levelIndex) {
                // This clears the specified level of all its data.
                if (!collectionIndex || isNaN(collectionIndex)) {
                    collectionIndex = 0;
                }
                if (!levelIndex || isNaN(levelIndex)) {
                    levelIndex = 0;
                }
                var desiredLevel = artifactCollections[collectionIndex][levelIndex];
                for (var lvl = 0; lvl < desiredLevel.length; lvl++) {
                    desiredLevel[lvl] = [];
                }
            }
        },

        gather: {
            presentTimeline: function() {
                return presentTimeline;
            }
        },

        transformTo: {
            imagePNG: function(renderTarget) {
                var outputImage = document.getElementById(renderTarget);
                outputImage = outputImage.toDataURL();
                return outputImage;
            }
        },

        addEntryToTimeline: function(collectionIndex, levelIndex, timelinePosition, instructionType, payloadDetails) {
            if (!collectionIndex || isNaN(collectionIndex)) {
                collectionIndex = 0;
            }
            if (!levelIndex || isNaN(levelIndex)) {
                levelIndex = 0;
            }
            if (!timelinePosition || isNaN(timelinePosition)) {
                timelinePosition = 0;
            }
            var freshRecord = [];
            freshRecord.push(instructionType, payloadDetails);
            artifactCollections[collectionIndex][levelIndex][timelinePosition].push(freshRecord);
        },

        analyzeElementTag: function(domElementId) {
            var elemTag = document.getElementById(domElementId).tagName;
            return elemTag;
        },

        locateDrawingContext: function(domElementId) {
            var surfaceContext = '';
            for (var ctx = 0; ctx < drawingContexts.length; ctx++) {
                if (drawingContexts[ctx][0] == domElementId) {
                    surfaceContext = drawingContexts[ctx][1];
                }
            }
            if (surfaceContext === '') {
                craftsperson.initializeSurface(domElementId);
                surfaceContext = craftsperson.locateDrawingContext(domElementId);
            }
            return surfaceContext;
        },

        renderCircularShape: function(renderTarget, posX, posY, cirRadius, paintColor, strokeThickness, borderColor, opacityValue, shadeFeather, shadeColor, shadeOffsetX, shadeOffsetY) {
            // This method is responsible for rendering a circular shape across various formats.
            var targetElement = document.getElementById(renderTarget);
            var elemWidth = targetElement.width;
            var elemHeight = targetElement.height;
            posX = craftsperson.interpretRequest(posX, elemWidth);
            posY = craftsperson.interpretRequest(posY, elemHeight);
            strokeThickness = craftsperson.interpretRequest(strokeThickness, elemWidth);
            cirRadius = craftsperson.interpretRequest(cirRadius, elemWidth);
            paintColor = craftsperson.interpretColor(paintColor);
            opacityValue = craftsperson.interpretAlpha(opacityValue);
            borderColor = craftsperson.interpretColor(borderColor);
            shadeColor = craftsperson.interpretColor(shadeColor);
            if (shadeFeather !== 'random') {
                shadeFeather = parseInt(shadeFeather, 10);
            }
            shadeOffsetX = parseInt(shadeOffsetX, 10);
            shadeOffsetY = parseInt(shadeOffsetY, 10);
            if (!shadeFeather) {
                shadeFeather = 0;
            } else if (shadeFeather === 'random') {
                shadeFeather = craftsperson.randomize(0, 30);
            }
            if (!shadeOffsetX || isNaN(shadeOffsetX)) {
                shadeOffsetX = 0;
            }
            if (!shadeOffsetY || isNaN(shadeOffsetY)) {
                shadeOffsetY = 0;
            }
            var currentCircleProps = [posX, posY, cirRadius, paintColor, strokeThickness, borderColor, opacityValue, shadeFeather, shadeColor, shadeOffsetX, shadeOffsetY];
            var currentInstructionSet = ['circle', currentCircleProps];
            presentTimeline.push(currentInstructionSet);

            var elementFormat = craftsperson.analyzeElementTag(renderTarget);
            switch (elementFormat) {
                case "CANVAS":
                    // Handle rendering for Canvas elements
                    var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
                    surfaceContext.beginPath();
                    surfaceContext.lineWidth = strokeThickness;
                    surfaceContext.globalAlpha = opacityValue;
                    surfaceContext.arc(posX, posY, cirRadius, 0, Math.PI * 2, true);
                    surfaceContext.closePath();
                    surfaceContext.fillStyle = paintColor;
                    if (strokeThickness !== 0) {
                        surfaceContext.strokeStyle = borderColor;
                        surfaceContext.stroke();
                    }
                    if (shadeFeather) {
                        surfaceContext.shadowOffsetX = shadeOffsetX;
                        surfaceContext.shadowOffsetY = shadeOffsetY;
                        surfaceContext.shadowBlur = shadeFeather;
                        surfaceContext.shadowColor = shadeColor;
                    }
                    if (paintColor !== '') {
                        surfaceContext.fill();
                    }
                    break;
                default:
                    // Default rendering behavior
            }
        },

        renderRectangularShape: function(renderTarget, startXCoord, startYCoord, extentWidth, extentHeight, paintColor, strokeThickness, borderColor, opacityValue, shadeFeather, shadeColor, shadeOffsetX, shadeOffsetY) {
            var targetElement = document.getElementById(renderTarget);
            var elemWidth = targetElement.width;
            var elemHeight = targetElement.height;
            startXCoord = craftsperson.interpretRequest(startXCoord, elemWidth);
            startYCoord = craftsperson.interpretRequest(startYCoord, elemHeight);
            extentWidth = craftsperson.interpretRequest(extentWidth, elemWidth);
            extentHeight = craftsperson.interpretRequest(extentHeight, elemHeight);
            strokeThickness = craftsperson.interpretRequest(strokeThickness, elemWidth);
            borderColor = craftsperson.interpretColor(borderColor);
            paintColor = craftsperson.interpretColor(paintColor);
            opacityValue = craftsperson.interpretAlpha(opacityValue);
            if (shadeFeather !== 'random') {
                shadeFeather = parseInt(shadeFeather, 10);
            }
            shadeOffsetX = parseInt(shadeOffsetX, 10);
            shadeOffsetY = parseInt(shadeOffsetY, 10);
            if (!shadeFeather) {
                shadeFeather = 0;
            } else if (shadeFeather === 'random') {
                shadeFeather = craftsperson.randomize(0, 30);
            }
            if (!shadeColor) {
                shadeColor = '';
            } else if (shadeColor === 'random') {
                shadeColor = standardHues[craftsperson.randomize(0, standardHues.length)];
            } else if (shadeColor.constructor.toString().indexOf("Array") !== -1) {
                shadeColor = shadeColor[craftsperson.randomize(0, shadeColor.length)];
            }
            if (!shadeOffsetX || isNaN(shadeOffsetX)) {
                shadeOffsetX = 0;
            }
            if (!shadeOffsetY || isNaN(shadeOffsetY)) {
                shadeOffsetY = 0;
            }
            var elementFormat = craftsperson.analyzeElementTag(renderTarget);
            switch (elementFormat) {
                case "CANVAS":
                    // Canvas rendering implementation
                    var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
                    surfaceContext.fillStyle = paintColor;
                    surfaceContext.strokeStyle = borderColor;
                    surfaceContext.lineWidth = strokeThickness;
                    surfaceContext.globalAlpha = opacityValue;
                    if (shadeFeather) {
                        surfaceContext.shadowOffsetX = shadeOffsetX;
                        surfaceContext.shadowOffsetY = shadeOffsetY;
                        surfaceContext.shadowBlur = shadeFeather;
                        surfaceContext.shadowColor = shadeColor;
                    }
                    surfaceContext.fillRect(startXCoord, startYCoord, extentWidth, extentHeight);
                    if (strokeThickness !== 0) {
                        surfaceContext.strokeRect(startXCoord, startYCoord, extentWidth, extentHeight);
                    }
                    break;
                default:
                    // Standard rendering for other types
            }
        },

        renderVisualAsset: function(renderTarget, imageSource, posX, posY, extentWidth, extentHeight, opacityValue, paintColor, strokeThickness, borderColor, shadeFeather, shadeColor, shadeOffsetX, shadeOffsetY) {
            var targetElement = document.getElementById(renderTarget);
            var elemWidth = targetElement.width;
            var elemHeight = targetElement.height;
            if (imageSource) {
                posX = craftsperson.interpretRequest(posX, elemWidth);
                posY = craftsperson.interpretRequest(posY, elemHeight);
                extentWidth = craftsperson.interpretRequest(extentWidth, elemWidth);
                extentHeight = craftsperson.interpretRequest(extentHeight, elemHeight);
                strokeThickness = craftsperson.interpretRequest(strokeThickness, elemWidth);
                paintColor = craftsperson.interpretColor(paintColor);
                opacityValue = craftsperson.interpretAlpha(opacityValue);
                borderColor = craftsperson.interpretColor(borderColor);
                shadeColor = craftsperson.interpretColor(shadeColor);
                if (shadeFeather !== 'random') {
                    shadeFeather = parseInt(shadeFeather, 10);
                }
                shadeOffsetX = parseInt(shadeOffsetX, 10);
                shadeOffsetY = parseInt(shadeOffsetY, 10);
                if (!shadeFeather) {
                    shadeFeather = 0;
                } else if (shadeFeather === 'random') {
                    shadeFeather = craftsperson.randomize(0, 30);
                }
                if (!shadeColor) {
                    shadeColor = '';
                } else if (shadeColor === 'random') {
                    shadeColor = standardHues[craftsperson.randomize(0, standardHues.length)];
                } else if (shadeColor.length) {
                    shadeColor = shadeColor[craftsperson.randomize(0, shadeColor.length)];
                }
                if (!shadeOffsetX || isNaN(shadeOffsetX)) {
                    shadeOffsetX = 0;
                }
                if (!shadeOffsetY || isNaN(shadeOffsetY)) {
                    shadeOffsetY = 0;
                }
                var elementFormat = craftsperson.analyzeElementTag(renderTarget);
                switch (elementFormat) {
                    case "CANVAS":
                        // Canvas image rendering
                        var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
                        var currentImageObject = new Image();
                        currentImageObject.src = imageSource;
                        currentImageObject.style.opacity = opacityValue;
                        currentImageObject.style.MozOpacity = opacityValue;
                        currentImageObject.onload = function() {
                            surfaceContext.shadowOffsetX = shadeOffsetX;
                            surfaceContext.shadowOffsetY = shadeOffsetY;
                            surfaceContext.shadowBlur = shadeFeather;
                            surfaceContext.shadowColor = shadeColor;
                            surfaceContext.strokeStyle = borderColor;
                            surfaceContext.fillStyle = paintColor;
                            surfaceContext.drawImage(currentImageObject, posX, posY, extentWidth, extentHeight);
                        };
                        break;
                    default:
                        // Standard rendering approach
                }
            }
        },

        renderComplexPath: function(renderTarget, geometricPath, strokeThickness, pathColor, paintColor, opacityValue) {
            var targetElement = document.getElementById(renderTarget);
            var elemWidth = targetElement.width;
            var elemHeight = targetElement.height;
            var ctrlPt1X, ctrlPt1Y, ctrlPt2X, ctrlPt2Y, currentX, currentY;
            var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
            if (!geometricPath) {
                geometricPath = [
                    [0, 0]
                ];
            }
            strokeThickness = craftsperson.interpretRequest(strokeThickness, elemWidth);
            paintColor = craftsperson.interpretColor(paintColor);
            opacityValue = craftsperson.interpretAlpha(opacityValue);
            pathColor = craftsperson.interpretColor(pathColor);
            var initialPointX = geometricPath[0][0];
            initialPointX = craftsperson.interpretRequest(initialPointX, elemWidth);
            var initialPointY = geometricPath[0][1];
            initialPointY = craftsperson.interpretRequest(initialPointY, elemHeight);
            surfaceContext.beginPath();
            surfaceContext.moveTo(initialPointX, initialPointY);
            for (var pth = 1; pth < geometricPath.length; pth++) {
                var pathPointX = geometricPath[pth][0];
                pathPointX = craftsperson.interpretRequest(pathPointX, elemWidth);
                var pathPointY = geometricPath[pth][1];
                pathPointY = craftsperson.interpretRequest(pathPointY, elemHeight);
                if (!geometricPath[pth][2]) {
                    surfaceContext.lineTo(pathPointX, pathPointY);
                } else if (geometricPath[pth][2] === 'bezier') {
                    ctrlPt1X = geometricPath[pth][3];
                    ctrlPt1X = craftsperson.interpretRequest(ctrlPt1X, elemWidth);
                    ctrlPt1Y = geometricPath[pth][4];
                    ctrlPt1Y = craftsperson.interpretRequest(ctrlPt1Y, elemHeight);
                    ctrlPt2X = geometricPath[pth][5];
                    ctrlPt2X = craftsperson.interpretRequest(ctrlPt2X, elemWidth);
                    ctrlPt2Y = geometricPath[pth][6];
                    ctrlPt2Y = craftsperson.interpretRequest(ctrlPt2Y, elemHeight);
                    surfaceContext.bezierCurveTo(ctrlPt1X, ctrlPt1Y, ctrlPt2X, ctrlPt2Y, pathPointX, pathPointY);
                } else if (geometricPath[pth][2] === 'quadratic') {
                    ctrlPt1X = currentX + 2.0 / 3.0 * (geometricPath[pth][3] - currentX);
                    ctrlPt1X = craftsperson.interpretRequest(ctrlPt1X, elemWidth);
                    ctrlPt1Y = currentY + 2.0 / 3.0 * (geometricPath[pth][4] - currentY);
                    ctrlPt1Y = craftsperson.interpretRequest(ctrlPt1Y, elemHeight);
                    ctrlPt2X = ctrlPt1X + (pathPointX - currentX) / 3.0;
                    ctrlPt2X = craftsperson.interpretRequest(ctrlPt2X, elemWidth);
                    ctrlPt2Y = ctrlPt1Y + (pathPointY - currentY) / 3.0;
                    ctrlPt2Y = craftsperson.interpretRequest(ctrlPt2Y, elemHeight);
                    surfaceContext.bezierCurveTo(ctrlPt1X, ctrlPt1Y, ctrlPt2X, ctrlPt2Y, pathPointX, pathPointY);
                }
                currentX = pathPointX;
                currentY = pathPointY;
            }
            if (strokeThickness !== 0 && pathColor !== '') {
                strokeThickness = craftsperson.analyzeValue(strokeThickness, elemWidth);
                surfaceContext.lineWidth = strokeThickness;
                surfaceContext.stroke();
            }
            if (paintColor !== '') {
                surfaceContext.fillStyle = paintColor;
                surfaceContext.fill();
            }
            surfaceContext.closePath();
        },

        renderStraightLine: function(renderTarget, startXCoord, startYCoord, endXCoord, endYCoord, strokeThickness, pathColor, curveType, ctrlPt1X, ctrlPt1Y, ctrlPt2X, ctrlPt2Y) {
            var targetElement = document.getElementById(renderTarget);
            var elemWidth = targetElement.width;
            var elemHeight = targetElement.height;
            startXCoord = craftsperson.interpretRequest(startXCoord, elemWidth);
            startYCoord = craftsperson.interpretRequest(startYCoord, elemHeight);
            endXCoord = craftsperson.interpretRequest(endXCoord, elemWidth);
            endYCoord = craftsperson.interpretRequest(endYCoord, elemHeight);
            ctrlPt1X = craftsperson.interpretRequest(ctrlPt1X, elemWidth);
            ctrlPt1Y = craftsperson.interpretRequest(ctrlPt1Y, elemHeight);
            ctrlPt2X = craftsperson.interpretRequest(ctrlPt2X, elemWidth);
            ctrlPt2Y = craftsperson.interpretRequest(ctrlPt2Y, elemHeight);
            strokeThickness = craftsperson.interpretRequest(strokeThickness, elemWidth);
            pathColor = craftsperson.interpretColor(pathColor);
            var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
            surfaceContext.beginPath();
            surfaceContext.moveTo(startXCoord, startYCoord);
            if (!curveType) {
                surfaceContext.lineTo(endXCoord, endYCoord);
            } else if (curveType === 'bezier') {
                ctrlPt1X = parseInt(ctrlPt1X, 10);
                ctrlPt1Y = parseInt(ctrlPt1Y, 10);
                ctrlPt2X = parseInt(ctrlPt2X, 10);
                ctrlPt2Y = parseInt(ctrlPt2Y, 10);
                surfaceContext.bezierCurveTo(ctrlPt1X, ctrlPt1Y, ctrlPt2X, ctrlPt2Y, endXCoord, endYCoord);
            } else if (curveType === 'quadratic') {
                ctrlPt1X = startXCoord + 2.0 / 3.0 * (ctrlPt1X - startXCoord);
                ctrlPt1Y = startYCoord + 2.0 / 3.0 * (ctrlPt1Y - startYCoord);
                ctrlPt2X = ctrlPt1X + (endXCoord - startXCoord) / 3.0;
                ctrlPt2Y = ctrlPt1Y + (endYCoord - startYCoord) / 3.0;
                ctrlPt1X = parseInt(ctrlPt1X, 10);
                ctrlPt1Y = parseInt(ctrlPt1Y, 10);
                ctrlPt2X = parseInt(ctrlPt2X, 10);
                ctrlPt2Y = parseInt(ctrlPt2Y, 10);
                surfaceContext.bezierCurveTo(ctrlPt1X, ctrlPt1Y, ctrlPt2X, ctrlPt2Y, endXCoord, endYCoord);
            }
            if (strokeThickness !== 0 && pathColor !== '') {
                surfaceContext.strokeStyle = pathColor;
                surfaceContext.lineWidth = strokeThickness;
                surfaceContext.stroke();
            }
        },

        finalizePathSegment: function(renderTarget) {
            var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
            surfaceContext.closePath();
        },

        renderTextContent: function(renderTarget, posX, posY, displayText, textColor, fontWeight, fontSize, fontFamily, textAlign, opacityValue, strokeThickness, pathColor, textBaseline) {
            var targetElement = document.getElementById(renderTarget);
            var elemWidth = targetElement.width;
            var elemHeight = targetElement.height;
            posX = craftsperson.interpretRequest(posX, elemWidth);
            posY = craftsperson.interpretRequest(posY, elemHeight);
            textColor = craftsperson.interpretColor(textColor);
            opacityValue = craftsperson.interpretAlpha(opacityValue);
            strokeThickness = craftsperson.interpretRequest(strokeThickness, elemWidth);
            pathColor = craftsperson.interpretColor(pathColor);
            if (!displayText) {
                displayText = '';
            }
            if (!fontWeight) {
                fontWeight = '';
            }
            if (fontSize !== 'random' && fontSize) {
                fontSize = craftsperson.analyzeValue(fontSize, elemWidth) + 'px';
            } else if (fontSize === 'random') {
                fontSize = craftsperson.randomize(0, 190) + 'px';
            } else if (!fontSize) {
                fontSize = '15px';
            }
            if (!fontFamily) {
                fontFamily = 'sans-serif';
            }
            var computedFontStyle = fontWeight + ' ' + fontSize + ' ' + fontFamily;
            if (!textAlign) {
                textAlign = 'left';
            }
            if (!textBaseline) {
                textBaseline = 'top';
            }
            var surfaceContext = craftsperson.locateDrawingContext(renderTarget);
            surfaceContext.textAlign = textAlign;
            surfaceContext.globalAlpha = opacityValue;
            surfaceContext.fillStyle = textColor;
            surfaceContext.font = computedFontStyle;
            surfaceContext.textBaseline = textBaseline;
            surfaceContext.fillText(displayText, posX, posY);
            if (strokeThickness !== 0) {
                surfaceContext.strokeText(displayText, posX, posY);
            }
        },

        renderArtifactSet: function(renderTarget, collectionIndex, timelinePosition) {
            // This function renders the entire collection onto the designated element.
            if (collectionIndex === 'latest') {
                collectionIndex = artifactCollections.length - 1;
            } else if (!collectionIndex || isNaN(collectionIndex) || collectionIndex === 'first') {
                collectionIndex = 0;
            }
            // Loop through all component levels
            for (var lvl = 0; lvl < artifactCollections[collectionIndex].length; lvl++) {
                // Loop through the history records
                if (timelinePosition === 'first' || timelinePosition === 0) {
                    timelinePosition = 0;
                } else if (!timelinePosition || isNaN(timelinePosition) || timelinePosition === 'latest') {
                    timelinePosition = artifactCollections[collectionIndex][lvl].length - 1;
                }
                craftsperson.renderComponentLevel(renderTarget, collectionIndex, lvl, timelinePosition);
            }
        },

        renderComponentLevel: function(renderTarget, collectionIndex, levelIndex, timelinePosition) {
            // This method draws a specific level onto the specified rendering element.
            if (!collectionIndex || isNaN(collectionIndex)) {
                collectionIndex = 0;
            }
            if (levelIndex === 'latest') {
                levelIndex = artifactCollections[collectionIndex].length - 1;
            } else if (!levelIndex || isNaN(levelIndex) || levelIndex === 'first') {
                levelIndex = 0;
            }
            // Iterate through historical entries
            if (timelinePosition === 'previous') {
                timelinePosition = artifactCollections[collectionIndex][levelIndex].length - 2;
            } else if (!timelinePosition || isNaN(timelinePosition) || timelinePosition === 'latest') {
                timelinePosition = artifactCollections[collectionIndex][levelIndex].length - 1;
            } else if (timelinePosition === 'first' || timelinePosition === 0) {
                timelinePosition = 0;
            }
            // Note: The original code had a missing call here to actually use the 'timelinePosition'
            // to render something from artifactCollections. This structure is preserved as-is.
        }
    };
})(window, undefined);