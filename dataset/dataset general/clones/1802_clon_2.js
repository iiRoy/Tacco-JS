var vizCore = window.vizCore || {};
window.vizCore = vizCore;
vizCore._isModule = true;

( function ( coreModule, undefined ) {
    // Set the current version of this visualization library.
    coreModule.codeVersion = "0.1.1";
    // Flag to enable or disable detailed tracing messages.
    coreModule.traceEnabled = false;
    // Create an event dispatcher for various library events.
    coreModule.eventHub = d3.dispatch( 'renderStarted', 'renderFinished', 'refreshVisuals' );

    /*
     * Stores all performance metrics and logging data.
     */
    coreModule.metricStore = {};
    
    /*
     * Holds references to all currently displayed visualization objects.
     */
    coreModule.visualsArray = [];

    /*
     * Outputs messages to the browser's console if tracing is enabled.
     */
    coreModule.debugLog = function ( ) {
        if ( coreModule.traceEnabled && console.log && console.log.apply ) {
            console.log.apply( console, arguments );
        }
        else if ( coreModule.traceEnabled && console.log && Function.prototype.bind ) {
            var logOutput = Function.prototype.bind.call( console.log, console );
            logOutput.apply( console, arguments );
        }
        return arguments[ arguments.length - 1 ];
    };

    /*
     * Orchestrates the rendering process, executing callbacks within
     * dispatch events for proper lifecycle management.
     *
     * @param { Number } chunkCount: The number of items to process in each asynchronous loop iteration.
     */
    coreModule.drawVisuals = function visualRenderOperation ( chunkCount ) {
        chunkCount = chunkCount || 1; // Default to processing one item per cycle.

        visualRenderOperation.processingFlag = true;
        coreModule.eventHub.renderStarted();

        setTimeout( function ( ) {
            var outputGraph, nextVisual;

            for ( var loopIndex = 0; loopIndex < chunkCount && ( nextVisual = visualRenderOperation.pendingVisuals[ loopIndex ] ); loopIndex++ ) {
                outputGraph = nextVisual.produceChart();
                coreModule.visualsArray.push( outputGraph );
            }

            visualRenderOperation.pendingVisuals.splice( 0, loopIndex );

            if ( visualRenderOperation.pendingVisuals.length ) {
                setTimeout( arguments.callee, 0 );
            }
            else {
                coreModule.drawVisuals.processingFlag = false;
                coreModule.eventHub.renderFinished();
            }
        }, 0 );
    };

    coreModule.drawVisuals.processingFlag = false;
    coreModule.drawVisuals.pendingVisuals = [];

    /*
     * Adds a chart generation object or function to the rendering queue.
     *
     * @param { Object } itemToQueue: An object containing a 'produceChart' method, or a function to be wrapped.
     */
    coreModule.enqueueVisual = function ( itemToQueue ) {
        if ( typeof arguments[ 0 ] == typeof( Function ) )
            itemToQueue = { produceChart: arguments[ 0 ] };

        coreModule.drawVisuals.pendingVisuals.push( itemToQueue );

        if ( ! coreModule.drawVisuals.processingFlag ) {
            coreModule.drawVisuals();
        }
    };

    /*
     * Attaches a new callback to the window's resize event, preserving existing handlers.
     *
     * @param { Function } resizeHandler: The function to invoke when the window is resized.
     */
    coreModule.viewportAdjust = function ( resizeHandler ) {
        var previousResizeHandler = window.onresize;
        window.onresize = function ( resizeEvent ) {
            if ( typeof previousResizeHandler == 'function' ) {
                previousResizeHandler( resizeEvent );
            }
            resizeHandler( resizeEvent );
        };
    };

    /*
     * Sets up initial event listeners for render lifecycle events, primarily for debug logging.
     * This setup only proceeds if the tracing flag is enabled.
     */
    function initializeModule ( ) {
        if ( coreModule.traceEnabled ) {
            coreModule.eventHub.on( 'renderStarted', function ( resizeEvent ) {
                coreModule.metricStore.startTimestamp = +new Date();
            } );
            coreModule.eventHub.on( 'renderFinished', function ( resizeEvent ) {
                coreModule.metricStore.completionTime = +new Date();
                coreModule.metricStore.renderDurationMs = coreModule.metricStore.completionTime - coreModule.metricStore.startTimestamp;
                coreModule.debugLog( 'duration', coreModule.metricStore.renderDurationMs, 'milliseconds' );
            } );
        }

        coreModule.eventHub.on( 'refreshVisuals', function ( resizeEvent ) {
            for ( var loopIndex = 0; loopIndex < coreModule.visualsArray.length; loopIndex++ ) {
                coreModule.visualsArray[ loopIndex ].targetElement.call( coreModule.visualsArray[ loopIndex ] );
            }
        } );

        coreModule.viewportAdjust( function ( ) {
            coreModule.eventHub.refreshVisuals();
        } );
    }

    initializeModule();

}(vizCore));