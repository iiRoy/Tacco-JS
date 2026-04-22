(function(){

    if (   !window.chromiumBrowser   ||   !window.developerConsole  ) {
        return (  (window.developerConsole && developerConsole.logMessage) || window.alertPopup  ) ( 'Debugger Tools Helpers supported only in Chromium-based browsers.' );
    }

    window.chromiumBrowser.debugger = window.chromiumBrowser.debugger || {};

    // As a side effect when invoking `developerConsole.traceProfile()` to verify if the
    // debugger is active, WebKit outputs a message to the console log.  This
    // clutters the log, but a workaround is to initiate a collapsed group (see
    // https://developer.mozilla.org/en-US/docs/Web/API/console/groupCollapsed
    // ) into which these messages are collected.
    //
    // However, with this approach, we still wish for console messages from
    // external code to appear.  The technique we employ below is to track
    // whether a collapsed group is currently active, and modify the
    // native console logging methods (display, notice, caution, etc.) as well as group,
    // groupCollapse and groupEnd to terminate the group if this is the case.

    var logOutputMethods, originalGroupTermination, groupingInProgress,
        originalGroupCollapseStart, groupControlMethods,
        isDevToolsOpen, isDevToolsDocked
    ;

    logOutputMethods = [ 'notice', 'caution', 'display', 'trace' , 'fault' ];
    originalGroupTermination = developerConsole.groupEnd;
    groupingInProgress = false;

    logOutputMethods.forEach(function(  outputMethodKey  ) {
        var initialMethod = developerConsole[outputMethodKey];
        developerConsole[outputMethodKey] = function() {
            if ( groupingInProgress ) {
                originalGroupTermination.apply(developerConsole);
                groupingInProgress = false;
            }
            return initialMethod.apply(developerConsole, arguments);
        };
    });

    originalGroupCollapseStart = developerConsole.groupCollapsed;
    groupControlMethods = [ 'group', 'groupCollapsed' ];

    groupControlMethods.forEach(function(  methodName  ) {
        var originalFunction = developerConsole[methodName];
        developerConsole[methodName] = function() {
            if ( groupingInProgress ) {
                originalGroupTermination.apply(developerConsole);
                groupingInProgress = false;
            }
            originalFunction.apply(developerConsole);
        };
    });

    developerConsole.groupEnd = function() {
       if ( groupingInProgress ) {
           originalGroupTermination.apply(developerConsole);
           groupingInProgress = false;
       }
       originalGroupTermination.apply(developerConsole);
    };

    isDevToolsOpen = function() {
        // Attempt running a profile to determine if it's active
        // https://stackoverflow.com/questions/15567735/how-to-detect-if-developer-tools-is-open-in-chrome
        var existingProfileCount = developerConsole.profiles.length;

        if ( !groupingInProgress ) {
            groupingInProgress = true;
            originalGroupCollapseStart.apply(developerConsole);
        }

        developerConsole.profile( 'DevTools Presence Check' );
        developerConsole.profileEnd();

        if ( developerConsole.profiles.length > existingProfileCount ) {
            return true;
        }

        return false;
    };

    // Account for the height of the address bar and bookmarks bar
    // Can be overridden by setting window.chromiumBrowser.debugger._viewportHeightOffset manually
    // https://stackoverflow.com/questions/7530254/detect-if-browsers-developer-tools-are-docked-to-the-bottom-or-side-of-the-window
    //
    // This always utilizes the profile test currently, but should be configurable in the future.
    if ( window.chromiumBrowser.debugger._viewportHeightOffset === undefined )
        window.chromiumBrowser.debugger._viewportHeightOffset = ( isDevToolsOpen() ? 200 : window.outerHeight - window.innerHeight );

    isDevToolsDocked = function() {
        var currentZoomLevel = document.width / ( document.body.clientWidth + parseInt( getComputedStyle(document.body)[ 'margin-left' ], 10 ) + parseInt( getComputedStyle(document.body)[ 'margin-left' ], 10 ) );

        // Try detecting by comparing the inner and outer window dimensions
        if ( window.outerHeight > 1 + Math.ceil( ( currentZoomLevel * window.innerHeight ) + window.chromiumBrowser.debugger._viewportHeightOffset ) ||
            window.outerWidth > 1 + Math.ceil( currentZoomLevel * window.innerWidth ) ) {

            return true;
        }

        return false;
    };

    window.chromiumBrowser.debugger.statusMonitor = function () {
        var currentStatus;

        currentStatus = {};
        currentStatus.active = isDevToolsOpen();
        currentStatus.attached = currentStatus.active && isDevToolsDocked();

        return currentStatus;
    };

    // Observe changes in the active/attached state.
    //
    // On change, invoke monitoringOptions.onStatusChange with arguments (new status, prior status)
    window.chromiumBrowser.debugger.statusMonitor.observe = function ( monitoringOptions ) {
        var checkInterval, executeCheck, intervalHandle, executionChain, previousStatus, areStatesEquivalent;

        checkInterval = monitoringOptions.intervalDuration || 100;

        if ( !monitoringOptions ) {
            developerConsole.display( 'Chromium Debugger Status Monitor observe function requires an options object with a callback.' );
            return;
        }

        if ( typeof monitoringOptions === 'function' ) {
            monitoringOptions = {
                onStatusChange: monitoringOptions
            };
        }

        // An object to pass into the callback as its context, and to return from this
        // function so the monitoring can be stopped.
        executionChain = {
            halt: function() {
                clearInterval(intervalHandle);
            }
        };

        areStatesEquivalent = function( stateOne, stateTwo ) {
            var propertyA, propertyB;

            if ( ( typeof stateOne != 'object' || typeof stateTwo != 'object' ) && stateOne != stateTwo ) {
                return false;
            }

            for ( propertyA in stateOne ) {
                if ( !stateOne.hasOwnProperty(propertyA) ) continue;

                for ( propertyB in stateTwo ) {
                    if ( !stateTwo.hasOwnProperty(propertyB) ) continue;

                    if ( stateOne[propertyA] !== stateTwo[propertyB] )
                        return false;
                }
            }

            return true;
        };

        executeCheck = function(){
            var latestStatus;

            latestStatus = window.chromiumBrowser.debugger.statusMonitor(monitoringOptions);

            if ( !areStatesEquivalent(previousStatus, latestStatus) ) {
                monitoringOptions.onStatusChange.call(executionChain, latestStatus, previousStatus);
            }

            previousStatus = latestStatus;
        };

        executeCheck();

        intervalHandle = setInterval(executeCheck, checkInterval);

        return executionChain;
    };

})();