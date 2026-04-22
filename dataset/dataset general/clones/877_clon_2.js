/*
 *  3D rotator utility v1.0
 *  Authored by a fictional developer
 *  Web: http://www.example.com/
 *  Demo: http://www.example.com/rotator
 
 *  (c) 2023 Fictional Dev. All rights reserved.
 *  Licensed under the Fictional License.
 */

(function(){
    var browserInfo         =   navigator.userAgent.toLowerCase(),
        isTouchCapable      =   "ontouchstart" in window,
        vendorPrefixCss     =   "",
        jsVendorPrefix      =   "",
        requestAnimationFrameAlias,
        cancelAnimationFrameAlias;
    
    if ( /webkit/gi.test(browserInfo) ) {
        vendorPrefixCss     =   "-webkit-";
        jsVendorPrefix      =   "Webkit";
    }
    else if ( /msie | trident/gi.test(browserInfo) ) {
        vendorPrefixCss     =   "-ms-";
        jsVendorPrefix      =   "ms";
    }
    else if ( /mozilla/gi.test(browserInfo) ) {
        vendorPrefixCss     =   "-moz-";
        jsVendorPrefix      =   "Moz";
    }
    else if ( /opera/gi.test(browserInfo) ) {
        vendorPrefixCss     =   "-o-";
        jsVendorPrefix      =   "O";
    }
    else {
        vendorPrefixCss     =   "";
    }
    
    function attachEventHandler(elementNode, eventType, eventHandlerFn, actionType){
        // Map event types for touch/mouse
        var actualEventType     =   eventType || "touchend",
            mouseEventsList     =   ["mousedown", "mouseup", "mousemove"],
            touchEventsList     =   ["touchstart", "touchend", "touchmove"],
            actionType          =   actionType || "add";
         
        actualEventType =   isTouchCapable ? actualEventType : mouseEventsList[touchEventsList.indexOf(eventType)];
        
        elementNode[actionType + "EventListener"](actualEventType, eventHandlerFn, false);
    }
    
    function extractCoordinates(inputEvent) {
        var xCoord,
            yCoord;
        
        // Determine coordinates based on event type
        if ( inputEvent.type.indexOf("mouse") > -1 ) {
            xCoord  =   inputEvent.pageX;
            yCoord  =   inputEvent.pageY;
        }
        else if ( inputEvent.type.indexOf("touch") > -1 ) {
            // Process only if a single finger is engaged:
            if ( inputEvent.touches.length === 1 ) {
                var firstTouchPoint =   inputEvent.touches[0];
                xCoord              =   firstTouchPoint.pageX;
                yCoord              =   firstTouchPoint.pageY;
            }
        }
        
        return [xCoord, yCoord];
    }
    
    function retrieveComputedStyle(domElement, cssProperty){
        var computedStyleObject =   document.defaultView.getComputedStyle(domElement, "");
        return computedStyleObject.getPropertyValue(cssProperty);
    }
    
    requestAnimationFrameAlias = (function(){
        return  window[jsVendorPrefix + "RequestAnimationFrame"] || 
                      function(callbackFunction){
                        window.setTimeout(callbackFunction, 17);
                      };
        })();
        
    cancelAnimationFrameAlias = (function(){
              return  window[jsVendorPrefix + "CancelRequestAnimationFrame"] || 
                      clearTimeout;
         })();
        
    var RotationHandler = function(configurationObject){
        this.settings           =   {};
        this.trackedElement     =   null;
        
        this.initialize(configurationObject);
    };
    
    RotationHandler.prototype.deactivate = function(){
        if ( this.trackedElement !== null ) {
            attachEventHandler(this.trackedElement, 'touchstart', this.eventCallbackReferences[0], "remove");
            attachEventHandler(document, 'touchmove', this.eventCallbackReferences[1], "remove");
            attachEventHandler(document, 'touchend', this.eventCallbackReferences[2], "remove");
        }
    }
    
    RotationHandler.prototype.enable = function(){
        if ( this.trackedElement !== null ) {
            attachEventHandler(this.trackedElement, 'touchstart', this.eventCallbackReferences[0]);
            attachEventHandler(document, 'touchmove', this.eventCallbackReferences[1], "remove"); 
            attachEventHandler(document, 'touchend', this.eventCallbackReferences[2], "remove"); 
        }
    }
        
    RotationHandler.prototype.initialize = function(initSettings){
        var selfRef                 =   this,
            sphereRadius,                   /* a variable to hold the virtual trackball's radius */
            containerElement,               /* the DOM container for the 'rotatable' item */
            rotationAxisVector      =   [], /* The current rotation axis */
            startDragVector         =   [], /* Vector at the start of a drag */
            currentDragVector       =   [], /* Vector during continuous dragging */
            initialTransformMatrix  =   [], /* Transform matrix at the moment dragging begins */
            momentumFactor          =   0,
            enableMomentum, containerPosition, halfWidth, halfHeight, decelerationRate, currentAngle, previousAngle, previousTime, currentTime;
                
        (function boot(){
            selfRef.deactivate();
                    
            // Copy configuration properties
            for ( var settingKey in initSettings ) {
                selfRef.settings[settingKey] =   initSettings[settingKey];
            }
                
            containerElement    =   document.getElementById(selfRef.settings.stage) || document.getElementsByTagName("body")[0];
            containerPosition   =   getElementOffset(containerElement);
            currentAngle        =   selfRef.settings.angle || 0;
            enableMomentum      =   selfRef.settings.impulse === false ? false : true;
             
            // Calculate essential values from the container for the virtual trackball
            // 1. Determine the radius of our imaginary trackball:
            halfHeight  =   containerElement.offsetHeight / 2;
            halfWidth   =   containerElement.offsetWidth / 2;
        
            // Use the smaller dimension as the radius for consistency
            sphereRadius = halfHeight < halfWidth ? halfHeight : halfWidth;
        
            // Scan the container for the first block-level child to be our rotatable target
            for ( var i = 0, l = containerElement.childNodes.length; i < l; i++ ) {
                var nodeItem    =   containerElement.childNodes[i];
                    
                if ( nodeItem.nodeType === 1 ) {
                    selfRef.trackedElement =   nodeItem;
                    break;
                }
            }
            
            var stagePerspective        =   retrieveComputedStyle(containerElement, vendorPrefixCss + "perspective"),
                perspectiveOriginStyle  =   retrieveComputedStyle(containerElement, vendorPrefixCss + "perspective-origin"),
                boxTransformStyle       =   retrieveComputedStyle(selfRef.trackedElement, vendorPrefixCss + "transform");
                            
            // Set initial transformation values. Prioritize config, then CSS, then defaults.
            
            if ( selfRef.settings.axis || selfRef.settings.angle ) {
                // Normalize the initial rotation vector to prevent distortion
                rotationAxisVector  =   normalizeVector(selfRef.settings.axis) || [1,0,0];
                currentAngle        =   selfRef.settings.angle || 0;
                // Compute the initial transformation matrix from the axis and angle
                initialTransformMatrix =   generateRotationMatrix(rotationAxisVector, currentAngle);
            }
            else if ( boxTransformStyle !== "none" ) {
                // Check for existing CSS3D transforms on the element
                initialTransformMatrix =   boxTransformStyle.split(",");
                
                // Convert 2D transforms to 3D if necessary
                if ( /matrix3d/gi.test(initialTransformMatrix[0]) ) {
                    initialTransformMatrix[0]   =   initialTransformMatrix[0].replace(/(matrix3d\()/g, "");
                    initialTransformMatrix[15]  =   initialTransformMatrix[15].replace(/\)/g, "");
                }
                else {
                    initialTransformMatrix[0]   =   initialTransformMatrix[0].replace(/(matrix\()/g, "");
                    initialTransformMatrix[5]   =   initialTransformMatrix[5].replace(/\)/g, "");
                    initialTransformMatrix.splice(2,0,0,0);
                    initialTransformMatrix.splice(6,0,0,0);
                    initialTransformMatrix.splice(8,0,0,0,1,0);
                    initialTransformMatrix.splice(14,0,0,1);
                }
                for ( var j = 0, len = initialTransformMatrix.length; j < len; j++ ) {
                    initialTransformMatrix[j] =   parseFloat(initialTransformMatrix[j]);
                }
            }
            else {
                rotationAxisVector  =   [0,1,0];
                currentAngle        =   0;
                initialTransformMatrix =   generateRotationMatrix(rotationAxisVector, currentAngle);
            }
        
            if ( selfRef.settings.perspective ) {
                containerElement.style[jsVendorPrefix + "Perspective"] =   selfRef.settings.perspective;
            }
            else if ( stagePerspective === "none" ) {
                containerElement.style[jsVendorPrefix + "Perspective"] =   "700px";
            }
            
            if ( selfRef.settings.perspectiveOrigin ) {
                containerElement.style[jsVendorPrefix + "PerspectiveOrigin"] =   selfRef.settings.perspectiveOrigin;
            }
            
            selfRef.trackedElement.style[jsVendorPrefix + "Transform"] =   "matrix3d(" + initialTransformMatrix + ")";
            attachEventHandler(selfRef.trackedElement, 'touchstart', handleDragStart);
            
            selfRef.eventCallbackReferences =   [handleDragStart, handleDragging, handleDragEnd];
        })();
            
        
        function handleDragStart(eventData){  
            // If deceleration is active, stop it
            if ( momentumFactor !== 0 ) {
                haltDeceleratingRotation();
            }
            eventData.preventDefault();
            
            startDragVector =   computeZComponent(extractCoordinates(eventData));
            previousTime    =   currentTime =   new Date().getTime();
            previousAngle   =   currentAngle; 
        
            attachEventHandler(selfRef.trackedElement, 'touchstart', handleDragStart, "remove");
            attachEventHandler(document, 'touchmove', handleDragging);
            attachEventHandler(document, 'touchend', handleDragEnd);            
        }
    
        function handleDragEnd(eventData){
            var finalRotationMatrix;
        
            attachEventHandler(document, 'touchmove', handleDragging, "remove");
            attachEventHandler(document, 'touchend', handleDragEnd, "remove");
            attachEventHandler(selfRef.trackedElement, 'touchstart', handleDragStart);
            determineRotationSpeed();
            // If momentum is enabled and there's speed, start the animated slide
            if ( enableMomentum && momentumFactor > 0 ) {
                requestAnimationFrameAlias(applyDeceleratingRotation);
            }
            else if ( !(isNaN(rotationAxisVector[0]) || isNaN(rotationAxisVector[1]) || isNaN(rotationAxisVector[2])) ) {
                // If no momentum or invalid axis, just finalize the matrix
                haltDeceleratingRotation();
            }
        }
    
        function finalizeMatrixState(){
            // This function cleans up after a rotation ends. It prepares a new 'initial' matrix
            // for the subsequent rotation to prevent the object from resetting its orientation.
            // Steps:
            // 1. Calculate a matrix from the current axis and angle.
            // 2. Combine the existing initial matrix with this new matrix via multiplication.
            finalRotationMatrix     =   generateRotationMatrix(rotationAxisVector, currentAngle);
            initialTransformMatrix  =   combineMatrices(initialTransformMatrix, finalRotationMatrix);
        }
    
        // The core rotation logic:
        function handleDragging(eventData){
            var eventCoordinates =   extractCoordinates(eventData);
            eventData.preventDefault();
            
            previousTime    =   currentTime;
            previousAngle   =   currentAngle;
            
            // Compute the current z-component of the 3D-vector on the virtual trackball
            currentDragVector =   computeZComponent(eventCoordinates);
        
            // Use the start and current vectors to find the new rotation axis
            // (the normal vector perpendicular to startDragVector and currentDragVector).
            rotationAxisVector[0]   =   startDragVector[1] * currentDragVector[2] - startDragVector[2] * currentDragVector[1];
            rotationAxisVector[1]   =   startDragVector[2] * currentDragVector[0] - startDragVector[0] * currentDragVector[2];
            rotationAxisVector[2]   =   startDragVector[0] * currentDragVector[1] - startDragVector[1] * currentDragVector[0];
            rotationAxisVector      =   normalizeVector(rotationAxisVector);
             
            // Now, determine the angle of rotation by finding the angle between the two vectors:
            currentAngle =   calculateVectorAngle(startDragVector, currentDragVector);
            
            // Update the element's position by applying the new transform:
            // This involves the current rotation (rotate3d) and the accumulated initial matrix (matrix3d)
            selfRef.trackedElement.style[jsVendorPrefix + "Transform"] =   "rotate3d(" + rotationAxisVector + "," + currentAngle + "rad) matrix3d(" + initialTransformMatrix + ")";
                                        
            currentTime =   new Date().getTime();
        }
    
        function determineRotationSpeed(){
            var angleDifference =   currentAngle - previousAngle,
                timeDifference  =   currentTime - previousTime;
                
            momentumFactor      =   Math.abs(angleDifference * 17 / timeDifference); 
            
            if ( isNaN(momentumFactor) ) {
                momentumFactor =   0;
            }
            else if ( momentumFactor > 0.2 ) {
                momentumFactor =   0.2;
            }
        } 
        
        function applyDeceleratingRotation(){
            currentAngle    +=  momentumFactor;
            decelerationRate =  0.01 * Math.sqrt(momentumFactor); 
            momentumFactor   =  momentumFactor > 0 ? momentumFactor - decelerationRate : 0;
            
            // Apply the new rotation and accumulated matrix
            selfRef.trackedElement.style[jsVendorPrefix + "Transform"] =   "rotate3d(" + rotationAxisVector + "," + currentAngle + "rad) matrix3d(" + initialTransformMatrix + ")";
            
            if ( momentumFactor === 0 ) {
                haltDeceleratingRotation();
            }
            else {
                requestAnimationFrameAlias(applyDeceleratingRotation);
            }
        }
        
        function haltDeceleratingRotation(){
            cancelAnimationFrameAlias(applyDeceleratingRotation);
            finalizeMatrixState();
            previousAngle = currentAngle = 0; 
            momentumFactor = 0;
        }
        
        // Matrix multiplication utility function.
        function combineMatrices(matrixA, matrixB){
            var resultMatrix = [];
        
            resultMatrix[0]     =   matrixA[0]*matrixB[0]   +   matrixA[1]*matrixB[4]   +   matrixA[2]*matrixB[8]   +   matrixA[3]*matrixB[12];
            resultMatrix[1]     =   matrixA[0]*matrixB[1]   +   matrixA[1]*matrixB[5]   +   matrixA[2]*matrixB[9]   +   matrixA[3]*matrixB[13];
            resultMatrix[2]     =   matrixA[0]*matrixB[2]   +   matrixA[1]*matrixB[6]   +   matrixA[2]*matrixB[10]  +   matrixA[3]*matrixB[14];
            resultMatrix[3]     =   matrixA[0]*matrixB[3]   +   matrixA[1]*matrixB[7]   +   matrixA[2]*matrixB[11]  +   matrixA[3]*matrixB[15];
            resultMatrix[4]     =   matrixA[4]*matrixB[0]   +   matrixA[5]*matrixB[4]   +   matrixA[6]*matrixB[8]   +   matrixA[7]*matrixB[12];
            resultMatrix[5]     =   matrixA[4]*matrixB[1]   +   matrixA[5]*matrixB[5]   +   matrixA[6]*matrixB[9]   +   matrixA[7]*matrixB[13];
            resultMatrix[6]     =   matrixA[4]*matrixB[2]   +   matrixA[5]*matrixB[6]   +   matrixA[6]*matrixB[10]  +   matrixA[7]*matrixB[14];
            resultMatrix[7]     =   matrixA[4]*matrixB[3]   +   matrixA[5]*matrixB[7]   +   matrixA[6]*matrixB[11]  +   matrixA[7]*matrixB[15];
            resultMatrix[8]     =   matrixA[8]*matrixB[0]   +   matrixA[9]*matrixB[4]   +   matrixA[10]*matrixB[8]  +   matrixA[11]*matrixB[12];
            resultMatrix[9]     =   matrixA[8]*matrixB[1]   +   matrixA[9]*matrixB[5]   +   matrixA[10]*matrixB[9]  +   matrixA[11]*matrixB[13];
            resultMatrix[10]    =   matrixA[8]*matrixB[2]   +   matrixA[9]*matrixB[6]   +   matrixA[10]*matrixB[10] +   matrixA[11]*matrixB[14];
            resultMatrix[11]    =   matrixA[8]*matrixB[3]   +   matrixA[9]*matrixB[7]   +   matrixA[10]*matrixB[11] +   matrixA[11]*matrixB[15];
            resultMatrix[12]    =   matrixA[12]*matrixB[0]  +   matrixA[13]*matrixB[4]  +   matrixA[14]*matrixB[8]  +   matrixA[15]*matrixB[12];
            resultMatrix[13]    =   matrixA[12]*matrixB[1]  +   matrixA[13]*matrixB[5]  +   matrixA[14]*matrixB[9]  +   matrixA[15]*matrixB[13];
            resultMatrix[14]    =   matrixA[12]*matrixB[2]  +   matrixA[13]*matrixB[6]  +   matrixA[14]*matrixB[10] +   matrixA[15]*matrixB[14];
            resultMatrix[15]    =   matrixA[12]*matrixB[3]  +   matrixA[13]*matrixB[7]  +   matrixA[14]*matrixB[11] +   matrixA[15]*matrixB[15];
        
            return resultMatrix;
        }

        // This routine computes a z-component for our 3D-vector using the 2D mouse coordinates
        // (representing a point on the virtual trackball surface):
        function computeZComponent(inputCoords){
            var adjustedX       =   selfRef.settings.limitAxxis === "x" ? sphereRadius : inputCoords[0] - containerPosition[0],
                adjustedY       =   selfRef.settings.limitAxxis === "y" ? sphereRadius : inputCoords[1] - containerPosition[1],
                normalizedVector=   [(adjustedX / sphereRadius - 1), (adjustedY / sphereRadius - 1)],
                zComponentValue =   1 - normalizedVector[0] * normalizedVector[0] - normalizedVector[1] * normalizedVector[1];
                
             // Ensure dragging halts if z becomes negative (outside the sphere):
            normalizedVector[2] =   zComponentValue > 0 ? Math.sqrt(zComponentValue) : 0;
 
            return normalizedVector;
        }
    
        // Normalization scales a vector so its length becomes exactly 1.
        // This is done by dividing each coordinate by the vector's total magnitude.
        function normalizeVector(inputVector){   
            var vectorMagnitude =   Math.sqrt(inputVector[0] * inputVector[0] + inputVector[1] * inputVector[1] + inputVector[2] * inputVector[2]);
            
            inputVector[0] /=   vectorMagnitude;
            inputVector[1] /=   vectorMagnitude;
            inputVector[2] /=   vectorMagnitude;

            return inputVector;
        }
            
        // Determines the angular separation between two given 3D vectors.
        function calculateVectorAngle(vectorOne, vectorTwo){
            var dotProduct      =   vectorOne[0] * vectorTwo[0] + vectorOne[1] * vectorTwo[1] + vectorOne[2] * vectorTwo[2],
                magnitudeProduct=   Math.sqrt(vectorOne[0] * vectorOne[0] + vectorOne[1] * vectorOne[1] + vectorOne[2] * vectorOne[2]) *
                                Math.sqrt(vectorTwo[0] * vectorTwo[0] + vectorTwo[1] * vectorTwo[1] + vectorTwo[2] * vectorTwo[2]),
                calculatedAngle =   Math.acos(dotProduct / magnitudeProduct);
            
            return calculatedAngle;
        }
    
        function generateRotationMatrix(rotationVector, rotationAngle){
            // Computes a 4x4 transformation matrix from a 3D vector [x,y,z] and an angle
            var vecX            =   rotationVector[0],
                vecY            =   rotationVector[1],
                vecZ            =   rotationVector[2],
                sinusValue      =   Math.sin(rotationAngle),
                cosinusValue    =   Math.cos(rotationAngle),
                oneMinusCosinus =   1 - cosinusValue,
                outputMatrix    =   [(cosinusValue + vecX * vecX * oneMinusCosinus), (vecY * vecX * oneMinusCosinus + vecZ * sinusValue), (vecZ * vecX * oneMinusCosinus - vecY * sinusValue), 0,
                                  (vecX * vecY * oneMinusCosinus - vecZ * sinusValue), (cosinusValue + vecY * vecY * oneMinusCosinus), (vecZ * vecY * oneMinusCosinus + vecX * sinusValue), 0,
                                  (vecX * vecZ * oneMinusCosinus + vecY * sinusValue), (vecY * vecZ * oneMinusCosinus - vecX * sinusValue), (cosinusValue + vecZ * vecZ * oneMinusCosinus), 0,
                                  0, 0, 0, 1];
                                          
            return outputMatrix;
        }
    
        // getElementOffset - adapted from quirksmode.org
        function getElementOffset(targetObject) {
            var currentLeftOffset   =   0,
                currentTopOffset    =   0;
        
            if ( targetObject.offsetParent ) {
                do {
                    currentLeftOffset   +=  targetObject.offsetLeft;
                    currentTopOffset    +=  targetObject.offsetTop;
                } while ( targetObject = targetObject.offsetParent ); 
                
                return [currentLeftOffset, currentTopOffset];
            }
        }
    }
    
    window.RotationHandler = RotationHandler;
})();