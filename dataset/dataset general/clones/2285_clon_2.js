// Guide for accepting handwritten input:
//  jQ('.scribbleArea').scribbleBoard()
//
// Guide for showing existing handwritten input:
//  jQ('.scribbleArea').scribbleBoard({readOnly:!0}).restore(oldSketch)
//  or
//  var surfaceApi = jQ('.scribbleArea').scribbleBoard({readOnly:!0})
//  surfaceApi.restore(oldSketch)
(function (jQ)
{

    function SketchPadHandler(elementSelector, inputOptions)
    {
        /**
         * Reference to the current instance for internal method access.
         *
         * @private
         *
         * @type {Object}
         */
        var thisObj = this;

        /**
         * Stores combined default and user-defined configuration settings.
         *
         * @private
         *
         * @type {Object}
         */
        var configData = jQ.extend({}, jQ.fn.scribbleBoard.defaults, inputOptions);

        /**
         * The jQuery-wrapped collection of selected DOM elements.
         *
         * @private
         *
         * @type {Object}
         */
        var targetArea = jQ(elementSelector);

        /**
         * jQuery object referring to the drawing canvas within the pad.
         *
         * @private
         *
         * @type {Object}
         */
        var sketchAreaJQ = jQ(configData.canvas, targetArea);

        /**
         * Direct DOM reference to the canvas element.
         *
         * @private
         *
         * @type {Object}
         */
        var rawCanvasEl = sketchAreaJQ.get(0);

        /**
         * The 2D rendering context for the drawing surface.
         *
         * @private
         *
         * @type {Object}
         */
        var drawingContext = void 0; // Using void 0 instead of null

        /**
         * Keeps track of the last drawn point to avoid redundant drawing.
         *
         * @private
         *
         * @type {Object}
         */
        var lastPoint = { 'x': void 0, 'y': void 0 }; // Using void 0 instead of null

        /**
         * An array holding all path coordinates to reconstruct the drawing.
         * Each entry is an object representing a line segment:
         * {
         *   startX: starting X coordinate
         *   startY: starting Y coordinate
         *   endX: ending X coordinate
         *   endY: ending Y coordinate
         * }
         *
         * @private
         *
         * @type {Array}
         */
        var drawingLog = [];

        /**
         * Stores a timer ID for when the pointer exits the drawing area.
         * If the pointer remains outside for a duration, drawing halts.
         *
         * @private
         *
         * @type {Object}
         */
        var pointerOutDelay = !1; // Using !1 instead of false

        /**
         * Flag indicating whether the primary mouse button (or touch) is currently engaged.
         *
         * @private
         *
         * @type {Boolean}
         */
        var buttonEngaged = !1;

        /**
         * Flag indicating if the browser environment supports touch events.
         *
         * @private
         *
         * @type {Boolean}
         */
        var touchEnabled = !1;

        /**
         * Flag to prevent re-binding event listeners multiple times.
         *
         * @private
         *
         * @type {Boolean}
         */
        var boundActions = !1;

        /**
         * The base font size used for typed text, allowing for dynamic scaling.
         *
         * @private
         *
         * @type {Number}
         */
        var baseFontPx = 30;

        /**
         * The current font size applied when generating typed text.
         *
         * @private
         *
         * @type {Number}
         */
        var presentFontPx = baseFontPx;

        /**
         * Counts the number of characters in the text input, aiding font scaling.
         *
         * @private
         *
         * @type {Number}
         */
        var inputCharNum = 0;


        /**
         * Clears any active pointer-out timer.
         * Resets related state variables.
         *
         * @private
         */
        function clearIdleTimer()
        {
            clearTimeout(pointerOutDelay);
            pointerOutDelay = !1;
            buttonEngaged = !1;
        }

        /**
         * Renders a line segment on the canvas based on pointer position.
         * Prevents drawing over the exact same spot to maintain line quality.
         *
         * @private
         *
         * @param {Object} triggerEvent The event object (mouse or touch).
         * @param {Number} vertOffsetPx A pixel value to adjust the new Y coordinate, for single dot drawing.
         */
        function sketchStroke(triggerEvent, vertOffsetPx)
        {
            var posInfo, currX, currY;

            triggerEvent.preventDefault();

            posInfo = jQ(triggerEvent.target).offset();

            clearTimeout(pointerOutDelay);
            pointerOutDelay = !1;

            if (typeof triggerEvent.targetTouches !== 'undefined')
            {
                currX = Math.floor(triggerEvent.targetTouches[0].pageX - posInfo.left);
                currY = Math.floor(triggerEvent.targetTouches[0].pageY - posInfo.top);
            }
            else
            {
                currX = Math.floor(triggerEvent.pageX - posInfo.left);
                currY = Math.floor(triggerEvent.pageY - posInfo.top);
            }

            if (lastPoint.x === currX && lastPoint.y === currY)
            {
                return !0; // Using !0 instead of true
            }

            if (lastPoint.x === void 0) // Using void 0 instead of null
            {
                lastPoint.x = currX;
            }

            if (lastPoint.y === void 0) // Using void 0 instead of null
            {
                lastPoint.y = currY;
            }

            if (vertOffsetPx)
            {
                currY += vertOffsetPx;
            }

            drawingContext.beginPath();
            drawingContext.moveTo(lastPoint.x, lastPoint.y);
            drawingContext.lineTo(currX, currY);
            drawingContext.lineCap = configData.penCap;
            drawingContext.stroke();
            drawingContext.closePath();

            drawingLog.push({
                'endX': currX,
                'endY': currY,
                'startX': lastPoint.x,
                'startY': lastPoint.y
            });

            lastPoint.x = currX;
            lastPoint.y = currY;

            if (configData.onDraw && typeof configData.onDraw === 'function')
            {
                configData.onDraw.apply(thisObj);
            }
        }

        /**
         * A proxy function to call endStroke without an event object.
         * Defined here for later removal from event listeners.
         *
         * @private
         */
        function stopDrawCallback()
        {
            endStroke();
        }

        /**
         * Event handler that halts the drawing process.
         * Unbinds relevant event listeners.
         *
         * @private
         *
         * @param {Object} triggerEvent The event object, if available.
         */
        function endStroke(triggerEvent)
        {
            if (!!triggerEvent)
            {
                sketchStroke(triggerEvent, 1);
            }
            else
            {
                if (touchEnabled)
                {
                    sketchAreaJQ.each(function ()
                    {
                        this.removeEventListener('touchmove', sketchStroke);
                        // This event listener was for Microsoft pointer events and is commented out in original.
                    });
                }
                else
                {
                    sketchAreaJQ.unbind('mousemove.scribbleBoard');
                }

                if (drawingLog.length > 0 && configData.onDrawEnd && typeof configData.onDrawEnd === 'function')
                {
                    configData.onDrawEnd.apply(thisObj);
                }
            }

            lastPoint.x = void 0; // Using void 0 instead of null
            lastPoint.y = void 0; // Using void 0 instead of null

            if (configData.output && drawingLog.length > 0)
            {
                jQ(configData.output, targetArea).val(JSON.stringify(drawingLog));
            }
        }

        /**
         * Renders the guiding baseline for signatures.
         *
         * @private
         */
        function showGuideLine()
        {
            if (!configData.lineWidth)
            {
                return !1; // Using !1 instead of false
            }

            drawingContext.beginPath();
            drawingContext.lineWidth = configData.lineWidth;
            drawingContext.strokeStyle = configData.lineColour;
            drawingContext.moveTo(configData.lineMargin, configData.lineTop);
            drawingContext.lineTo(rawCanvasEl.width - configData.lineMargin, configData.lineTop);
            drawingContext.stroke();
            drawingContext.closePath();
        }

        /**
         * Clears the entire canvas and redraws the signature baseline.
         *
         * @private
         */
        function wipeSurfaceClean()
        {
            drawingContext.clearRect(0, 0, rawCanvasEl.width, rawCanvasEl.height);
            drawingContext.fillStyle = configData.bgColour;
            drawingContext.fillRect(0, 0, rawCanvasEl.width, rawCanvasEl.height);

            if (!configData.displayOnly)
            {
                showGuideLine();
            }

            drawingContext.lineWidth = configData.penWidth;
            drawingContext.strokeStyle = configData.penColour;

            jQ(configData.output, targetArea).val('');
            drawingLog = [];

            endStroke();
        }

        /**
         * Callback for pointer movement events on the canvas.
         * Continues drawing a line or starts a new segment.
         *
         * @private
         *
         * @param {Object} triggerEvent The event object.
         * @param {Object} eventOrigin The DOM element where the event originated (the canvas).
         */
        function handlePointerMove(triggerEvent, eventOrigin)
        {
            if (lastPoint.x == void 0) // Using void 0 instead of null
            {
                sketchStroke(triggerEvent, 1);
            }
            else
            {
                sketchStroke(triggerEvent, eventOrigin);
            }
        }

        /**
         * Callback for mouse/touch down events on the canvas.
         * Initiates the drawing functionality.
         *
         * @private
         *
         * @param {Object} triggerEvent The event object.
         * @param {Object} touchElementRef The DOM object (canvas) that received the event.
         */
        function activateDrawing(triggerEvent, touchElementRef)
        {
            if (touchEnabled)
            {
                touchElementRef.addEventListener('touchmove', handlePointerMove, !1);
                // This event listener was for Microsoft pointer events and is commented out in original.
            }
            else
            {
                sketchAreaJQ.bind('mousemove.scribbleBoard', handlePointerMove);
            }

            // Draws a single point on initial pointer down, useful for small marks or dots.
            sketchStroke(triggerEvent, 1);
        }

        /**
         * Detaches all event listeners from the drawing canvas.
         *
         * @private
         */
        function deactivateSurface()
        {
            boundActions = !1;

            sketchAreaJQ.each(function ()
            {
                if (this.removeEventListener)
                {
                    this.removeEventListener('touchend', stopDrawCallback);
                    this.removeEventListener('touchcancel', stopDrawCallback);
                    this.removeEventListener('touchmove', sketchStroke);
                    // These event listeners were for Microsoft pointer events and are commented out in original.
                    // this.removeEventListener('MSPointerUp', stopDrawCallback)
                    // this.removeEventListener('MSPointerCancel', stopDrawCallback)
                    // this.removeEventListener('MSPointerMove', sketchStroke)
                }

                if (this.ontouchstart)
                {
                    this.ontouchstart = void 0; // Using void 0 instead of null
                }
            });

            jQ(document).unbind('mouseup.scribbleBoard');
            sketchAreaJQ.unbind('mousedown.scribbleBoard');
            sketchAreaJQ.unbind('mousemove.scribbleBoard');
            sketchAreaJQ.unbind('mouseleave.scribbleBoard');

            jQ(configData.clear, targetArea).unbind('click.scribbleBoard');
        }

        /**
         * Performs lazy detection of touch events on first interaction.
         * Binds appropriate event handlers based on detected input type (touch/mouse).
         *
         * @private
         *
         * @param {Object} triggerEvent The event object.
         */
        function prepareInputListeners(triggerEvent)
        {
            if (boundActions)
            {
                return !1; // Using !1 instead of false
            }

            boundActions = !0; // Using !0 instead of true

            // Dismisses any open virtual keyboards to free screen space.
            jQ('input').blur();

            if (typeof triggerEvent.targetTouches !== 'undefined')
            {
                touchEnabled = !0; // Using !0 instead of true
            }

            if (touchEnabled)
            {
                sketchAreaJQ.each(function ()
                {
                    this.addEventListener('touchend', stopDrawCallback, !1);
                    this.addEventListener('touchcancel', stopDrawCallback, !1);
                    // These event listeners were for Microsoft pointer events and are commented out in original.
                    // this.addEventListener('MSPointerUp', stopDrawCallback, !1)
                    // this.addEventListener('MSPointerCancel', stopDrawCallback, !1)
                });

                sketchAreaJQ.unbind('mousedown.scribbleBoard');
            }
            else
            {
                jQ(document).bind('mouseup.scribbleBoard', function ()
                {
                    if (buttonEngaged)
                    {
                        endStroke();
                        clearIdleTimer();
                    }
                });
                sketchAreaJQ.bind('mouseleave.scribbleBoard', function (evt)
                {
                    if (buttonEngaged)
                    {
                        endStroke(evt);
                    }

                    if (buttonEngaged && !pointerOutDelay)
                    {
                        pointerOutDelay = setTimeout(function ()
                        {
                            endStroke();
                            clearIdleTimer();
                        }, 500);
                    }
                });

                sketchAreaJQ.each(function ()
                {
                    this.ontouchstart = void 0; // Using void 0 instead of null
                });
            }
        }

        /**
         * Activates the handwritten drawing mode on the canvas.
         * Sets up event listeners, manages UI element visibility and styling.
         *
         * @private
         */
        function switchToDrawing()
        {
            jQ(configData.typed, targetArea).hide();
            wipeSurfaceClean();

            sketchAreaJQ.each(function ()
            {
                this.ontouchstart = function (evt)
                {
                    evt.preventDefault();
                    buttonEngaged = !0; // Using !0 instead of true
                    prepareInputListeners(evt);
                    activateDrawing(evt, this);
                };
            });

            sketchAreaJQ.bind('mousedown.scribbleBoard', function (evt)
            {
                evt.preventDefault();

                // Only allow the primary mouse button (left-click) to initiate drawing.
                if (evt.which > 1)
                {
                    return !1; // Using !1 instead of false
                }

                buttonEngaged = !0; // Using !0 instead of true
                prepareInputListeners(evt);
                activateDrawing(evt);
            });

            jQ(configData.clear, targetArea).bind('click.scribbleBoard', function (evt) { evt.preventDefault(); wipeSurfaceClean(); });

            jQ(configData.typeIt, targetArea).bind('click.scribbleBoard', function (evt) { evt.preventDefault(); switchToTyping(); });
            jQ(configData.drawIt, targetArea).unbind('click.scribbleBoard');
            jQ(configData.drawIt, targetArea).bind('click.scribbleBoard', function (evt) { evt.preventDefault(); }); // No-op to prevent default

            jQ(configData.typeIt, targetArea).removeClass(configData.currentClass);
            jQ(configData.drawIt, targetArea).addClass(configData.currentClass);
            jQ(configData.sig, targetArea).addClass(configData.currentClass);

            jQ(configData.typeItDesc, targetArea).hide();
            jQ(configData.drawItDesc, targetArea).show();
            jQ(configData.clear, targetArea).show();
        }

        /**
         * Activates the text input mode for generating a signature.
         * Manages UI element visibility and styling, disables canvas drawing.
         *
         * @private
         */
        function switchToTyping()
        {
            wipeSurfaceClean();
            deactivateSurface();
            jQ(configData.typed, targetArea).show();

            jQ(configData.drawIt, targetArea).bind('click.scribbleBoard', function (evt) { evt.preventDefault(); switchToDrawing(); });
            jQ(configData.typeIt, targetArea).unbind('click.scribbleBoard');
            jQ(configData.typeIt, targetArea).bind('click.scribbleBoard', function (evt) { evt.preventDefault(); }); // No-op to prevent default

            jQ(configData.output, targetArea).val('');

            jQ(configData.drawIt, targetArea).removeClass(configData.currentClass);
            jQ(configData.typeIt, targetArea).addClass(configData.currentClass);