( function( angular, undefined ) {

    'use strict';

    // Application configuration parameters
    // These define how image resources are handled throughout the application.
    const resourceConfigDefaults = {
        // Option to append a unique timestamp or random string to resource URLs,
        // effectively bypassing browser and CDN caches to ensure fresh content.
        cacheBustingEnabled: true,
        // If true, removes event listeners and unnecessary attributes from the image
        // element once it has successfully loaded, optimizing performance.
        cleanupOnLoadSuccess: true,
        // CSS class name to be applied to an image element upon successful loading.
        loadedStateClass: "image-ready",
        // CSS class name for an image element while its source is being fetched.
        loadingStateClass: "image-fetching",
        // CSS class name indicating that an error occurred during image loading.
        errorStateClass: "image-failed",
        // Auto-sizing and positioning options for images within their containers.
        // Determines how the image scales relative to its container.
        scalingMode: 'contain', // Accepts 'contain' (fit within bounds) or 'cover' (fill bounds).
        // Boolean flag to center the image horizontally and vertically within its container.
        alignCenter: true,
        // Defines the reference container for scaling and centering operations.
        // Can be 'parent' (immediate DOM parent) or 'viewport' (the browser window).
        containerReference: 'parent',
        // When true, the loading/loaded/error CSS classes are also propagated
        // to the image's immediate parent element, if one exists.
        propagateContainerClasses: true
    };

    // Predefined responsive breakpoints for image source selection.
    // Each object maps an attribute name (used in directives) to a media query string.
    let responsiveBreakpoints = [
        {
            attributeLabel: 'default',
            mediaQuery: 'only screen and (min-width: 1px)'
        }, {
            attributeLabel: 'small',
            mediaQuery: 'only screen and (min-width: 480px)'
        }, {
            attributeLabel: 'medium',
            mediaQuery: 'only screen and (min-width: 768px)'
        }, {
            attributeLabel: 'large',
            mediaQuery: 'only screen and (min-width: 1280px)'
        }, {
            attributeLabel: 'extraLarge',
            mediaQuery: 'only screen and (min-width: 1440px)'
        }
    ];

    // Utility media queries for common device characteristics.
    const commonMediaQueryExpressions = {
        'highDensityDisplay': 'only screen and (-webkit-min-device-pixel-ratio: 2), ' +
            'only screen and (min--moz-device-pixel-ratio: 2), ' +
            'only screen and (-o-min-device-pixel-ratio: 2/1), ' +
            'only screen and (min-device-pixel-ratio: 2), ' +
            'only screen and (min-resolution: 192dpi), ' +
            'only screen and (min-resolution: 2dppx)',
        'devicePortrait': 'only screen and (orientation: portrait)'
    };

    let viewportResizeHandlerInitialized = false;

    // Basic environment check: ensure `matchMedia` API is available.
    // This is crucial for responsive image loading logic.
    if ( typeof window.matchMedia === 'undefined' ) {
        throw new Error( "The `matchMedia` API is missing. Please include a polyfill for responsive image handling." );
    }

    // Custom event names used for broadcasting and listening within the Angular application.
    const ASSET_LOAD_SUCCESS = "$resourceLoadSuccess",
        ASSET_LOAD_FAILURE = "$resourceLoadFailure",
        ASSET_REQUEST_INITIATED = "$resourceLoadInitiated",
        QUEUE_ITEM_COMPLETED = "$resourceQueueItemDone",
        GLOBAL_QUEUE_COMPLETED = "$resourceQueueFinished",
        IMAGE_ELEMENT_RESIZED = "$resourceElementResized",
        VIEWPORT_RESIZED = "$resourceViewportResized",
        MEDIA_QUERY_STATE_CHANGED = "$resourceMediaQueryChanged";

    const resourceLoaderModule = angular.module( 'resourceLoader', [] );

    resourceLoaderModule.provider( 'resourceConfigService', [

        function() {
            // Allows configuration of default settings for the resource loader.
            // Can be called with an object to update settings or without to retrieve current settings.
            this.setGlobalConfig = function( newSettings ) {
                if ( typeof newSettings !== 'undefined' && newSettings !== null && typeof newSettings === 'object' ) {
                    Object.keys( newSettings ).forEach( propKey => {
                        if ( Object.prototype.hasOwnProperty.call( resourceConfigDefaults, propKey ) && typeof newSettings[ propKey ] !== 'undefined' ) {
                            resourceConfigDefaults[ propKey ] = newSettings[ propKey ];
                        }
                    } );
                } else if ( typeof newSettings === 'undefined' ) {
                    return { ...resourceConfigDefaults }; // Return a copy to prevent external modification
                }
            };

            // Manages the list of responsive breakpoints.
            this.setResponsiveBreakpoints = function( newBreakpoints ) {
                if ( typeof newBreakpoints !== 'undefined' && newBreakpoints !== null && Array.isArray( newBreakpoints ) ) {
                    // Simple replacement for now, could be more sophisticated (merge, etc.)
                    responsiveBreakpoints = newBreakpoints;
                } else if ( typeof newBreakpoints === 'undefined' ) {
                    return [ ...responsiveBreakpoints ]; // Return a copy
                }
            };

            // Adds a new breakpoint definition to the existing list.
            this.addNewBreakpoint = function( label, queryExpression ) {
                if ( typeof label === 'string' && label.length > 0 && typeof queryExpression === 'string' && queryExpression.length > 0 ) {
                    responsiveBreakpoints.push( {
                        "attributeLabel": label,
                        "mediaQuery": queryExpression
                    } );
                }
            };

            // Updates an existing breakpoint's query expression based on its label.
            this.updateBreakpointQuery = function( labelToFind, newQueryExpression ) {
                if ( typeof labelToFind === 'string' && typeof newQueryExpression === 'string' ) {
                    for ( let idx = 0; idx < responsiveBreakpoints.length; idx++ ) {
                        if ( responsiveBreakpoints[ idx ].attributeLabel === labelToFind ) {
                            responsiveBreakpoints[ idx ].mediaQuery = newQueryExpression;
                            break; // Assuming unique labels, stop after first match
                        }
                    }
                }
            };

            // Removes a breakpoint definition by its label.
            this.deleteBreakpoint = function( labelToRemove ) {
                if ( typeof labelToRemove === 'string' ) {
                    const initialLength = responsiveBreakpoints.length;
                    responsiveBreakpoints = responsiveBreakpoints.filter( bp => bp.attributeLabel !== labelToRemove );
                    if ( responsiveBreakpoints.length === initialLength ) {
                        // Optionally log if no breakpoint was found to remove
                        // console.warn(`Breakpoint with label "${labelToRemove}" not found.`);
                    }
                }
            };

            // The actual service instance. No-op since this provider primarily configures.
            this.$get = angular.noop;
        }
    ] );

    resourceLoaderModule.service( 'resourceSourceResolver', [ "$window", "$log", "$rootScope",

        function( $window, $log, $rootScope ) {

            const resolverService = {};

            // Stores active matchMedia instances keyed by their query string.
            resolverService.activeMediaQueries = {};

            // Helper function to safely get a setting, prioritizing element-specific options over global defaults.
            const getEffectiveSetting = ( settingKey, elementOptions ) => {
                if ( elementOptions && typeof elementOptions[ settingKey ] !== 'undefined' ) {
                    return elementOptions[ settingKey ];
                }
                return resourceConfigDefaults[ settingKey ];
            };

            // Generates the final image URL, potentially adding cache-busting parameters.
            resolverService.constructImageUrl = function( sourceMap, elementOptions ) {
                let selectedSourceUrl = resolverService.determineBestSource( sourceMap, elementOptions );

                if ( !selectedSourceUrl ) {
                    $log.warn( "[resourceLoader] No suitable URL found for image sources:", sourceMap );
                    return false;
                }

                if ( getEffectiveSetting( 'cacheBustingEnabled', elementOptions ) === true ) {
                    const cacheBuster = Math.random().toString( 36 ).substring( 2, 15 ); // More robust random string
                    selectedSourceUrl += ( selectedSourceUrl.includes( '?' ) ? '&' : '?' ) + `_cb=${cacheBuster}`;
                }

                return selectedSourceUrl;
            };

            // Selects the most appropriate image source URL based on current media queries and options.
            resolverService.determineBestSource = function( availableSources, elementOptions ) {
                let matchedAttributeSource = null;
                let fallbackSource = null; // Stores a default or non-matching source as a fallback

                // Convert sources object to an array to use modern iteration methods
                const sourceEntries = Object.entries( availableSources );

                for ( const [ attrKey, sourceValue ] of sourceEntries ) {
                    if ( typeof sourceValue === 'undefined' || sourceValue === null || sourceValue === '' ) {
                        continue; // Skip empty sources
                    }

                    const cleanAttrKey = attrKey.replace( 'Portrait', '' );
                    const isPortraitSpecific = attrKey.includes( "Portrait" );

                    const breakpointDefinition = getBreakpointByLabel( cleanAttrKey );

                    if ( breakpointDefinition ) {
                        const queryToMatch = elementOptions[ attrKey ] || breakpointDefinition.mediaQuery;
                        let mediaQueryInstance = resolverService.activeMediaQueries[ queryToMatch ];

                        if ( !mediaQueryInstance ) {
                            mediaQueryInstance = setupMediaQueryListener( queryToMatch );
                        }

                        // Check if the current media query matches
                        if ( mediaQueryInstance.matches ) {
                            // If it's portrait-specific, also check portrait query
                            if ( isPortraitSpecific ) {
                                if ( resolverService.portraitModeQuery.matches ) {
                                    matchedAttributeSource = sourceValue;
                                    break; // Found the best match, exit loop
                                }
                            } else {
                                matchedAttributeSource = sourceValue;
                                // Continue iterating in case a more specific match (e.g., higher resolution) is later
                                // break; // Changed to not break immediately, allowing for potential better matches later
                            }
                        } else if ( !fallbackSource ) {
                            // If no match yet, keep the first encountered source as a potential fallback
                            fallbackSource = sourceValue;
                        }
                    } else if ( attrKey === 'default' ) { // Explicitly handle a 'default' source if no breakpoint matches
                        fallbackSource = sourceValue;
                    }
                }

                // If no specific match, try to use the fallback
                let finalSourceCandidate = matchedAttributeSource || fallbackSource;

                if ( !finalSourceCandidate ) {
                    return ''; // No source found at all
                } else {
                    return resolverService.refineSourceForDensity( finalSourceCandidate, availableSources, elementOptions );
                }
            };

            // Broadcasts media query changes throughout the application.
            resolverService.handleMediaQueryChange = function( mqEvent ) {
                $rootScope.$broadcast( MEDIA_QUERY_STATE_CHANGED, mqEvent );
            };

            // Sets up a matchMedia listener for a given query string.
            const setupMediaQueryListener = function( queryStr ) {
                const mq = $window.matchMedia( queryStr );
                mq.addEventListener( 'change', resolverService.handleMediaQueryChange ); // Modern API
                resolverService.activeMediaQueries[ queryStr ] = mq;
                return mq;
            };

            // Finds a breakpoint definition by its attribute label.
            const getBreakpointByLabel = function( label ) {
                for ( const bp of responsiveBreakpoints ) {
                    if ( bp.attributeLabel === label ) {
                        return bp;
                    }
                }
                return null;
            };

            // Processes the image URL to select retina or standard version if available.
            resolverService.refineSourceForDensity = function( baseImageUrl, allSources, options ) {
                let outputUrl = baseImageUrl;

                // Handle comma-separated sources for retina/standard variants
                if ( baseImageUrl.includes( "," ) ) {
                    const imageVariants = baseImageUrl.split( "," ).map( s => s.trim() );
                    let selectedVariant = '';

                    // Prioritize retina if display supports it and variant exists
                    if ( resolverService.isHighDensityDisplay && imageVariants.some( v => v.includes( '@2x' ) ) ) {
                        selectedVariant = imageVariants.find( v => v.includes( '@2x' ) ) || imageVariants[ 0 ];
                    } else {
                        // Otherwise, prefer non-retina or the first available
                        selectedVariant = imageVariants.find( v => !v.includes( '@2x' ) ) || imageVariants[ 0 ];
                    }
                    outputUrl = selectedVariant || imageVariants[ 0 ]; // Ensure a fallback
                }

                return outputUrl;
            };

            // Initialize global media query states.
            resolverService.isHighDensityDisplay = $window.matchMedia( commonMediaQueryExpressions.highDensityDisplay ).matches;
            resolverService.portraitModeQuery = setupMediaQueryListener( commonMediaQueryExpressions.devicePortrait );

            return resolverService;
        }
    ] );

    resourceLoaderModule.service( 'resourceRequestTrigger', [ '$rootScope',

        function( $rootScope ) {

            const requestTrigger = {};

            // Triggers loading for a specific index in the global image queue.
            requestTrigger.loadQueueIndexItems = function( queueIndex ) {
                $rootScope.$broadcast( ASSET_REQUEST_INITIATED, {
                    requestType: 'queueIndex',
                    targetIndex: queueIndex
                } );
            };

            // Triggers loading for images matching a specific attribute name and value.
            requestTrigger.loadByCustomAttribute = function( attrName, attrValue ) {
                $rootScope.$broadcast( ASSET_REQUEST_INITIATED, {
                    requestType: 'attributeMatch',
                    attributeName: attrName,
                    attributeValue: attrValue,
                    priorityIndex: 0 // Default priority
                } );
            };

            // Triggers loading for images associated with a given CSS class.
            requestTrigger.loadByCssClass = function( cssClassName ) {
                $rootScope.$broadcast( ASSET_REQUEST_INITIATED, {
                    requestType: 'classMatch',
                    targetClass: cssClassName,
                    priorityIndex: 0
                } );
            };

            // Triggers loading for a specific image identified by its ID.
            requestTrigger.loadByIdentifier = function( elementId ) {
                $rootScope.$broadcast( ASSET_REQUEST_INITIATED, {
                    requestType: 'idMatch',
                    elementIdentifier: elementId,
                    priorityIndex: 0
                } );
            };

            return requestTrigger;
        }
    ] );

    resourceLoaderModule.service( 'resourceLoadingQueue', [ '$rootScope',

        function( $rootScope ) {

            const loadingQueueService = {};

            // The main queue, structured as an array of index groups.
            // Each group contains items to be loaded at a specific priority index.
            loadingQueueService.pendingTasks = [];
            loadingQueueService.currentProcessingIndex = -1;
            loadingQueueService.overallProgress = 0; // Global percentage
            loadingQueueService.itemsProcessedCount = 0; // Counter for individual items completed

            // Listen for image load success events to remove items from the queue.
            $rootScope.$on( ASSET_LOAD_SUCCESS, function( event, taskData, elementRef ) {
                loadingQueueService.removeTask( taskData ); // elementRef might be used for specific cleanup later
            } );

            // Listen for image load error events to also remove items from the queue.
            $rootScope.$on( ASSET_LOAD_FAILURE, function( event, taskData, elementRef ) {
                loadingQueueService.removeTask( taskData );
            } );

            // Adds a new loading task to the queue.
            loadingQueueService.addTask = function( taskObject ) {
                if ( !taskObject || typeof taskObject.priorityIndex === 'undefined' || typeof taskObject.sourceUrl === 'undefined' ) {
                    $log.error( "Invalid task object provided to queue:", taskObject );
                    return;
                }

                let targetIndexGroup = loadingQueueService.findIndexGroup( taskObject.priorityIndex );
                if ( !targetIndexGroup ) {
                    targetIndexGroup = {
                        priorityIndex: taskObject.priorityIndex,
                        items: []
                    };
                    loadingQueueService.pendingTasks.push( targetIndexGroup );
                }

                // Prevent adding duplicate tasks based on URL within the same group.
                if ( loadingQueueService.isTaskAlreadyQueued( targetIndexGroup.items, taskObject ) ) {
                    return;
                }

                targetIndexGroup.items.push( taskObject );

                // Keep the queue sorted by priority index.
                loadingQueueService.pendingTasks.sort( ( a, b ) => a.priorityIndex - b.priorityIndex );
            };

            // Checks if a group with the given index exists, optionally removing it.
            loadingQueueService.findIndexGroup = function( indexToFind, shouldRemove = false ) {
                if ( !loadingQueueService.pendingTasks || loadingQueueService.pendingTasks.length === 0 ) {
                    return null;
                }

                for ( let i = 0; i < loadingQueueService.pendingTasks.length; i++ ) {
                    if ( loadingQueueService.pendingTasks[ i ].priorityIndex === indexToFind ) {
                        if ( shouldRemove ) {
                            return loadingQueueService.pendingTasks.splice( i, 1 )[ 0 ];
                        } else {
                            return loadingQueueService.pendingTasks[ i ];
                        }
                    }
                }
                return null;
            };

            // Checks if a specific task (by URL) exists within a given list of tasks.
            loadingQueueService.isTaskAlreadyQueued = function( taskList, taskObject, shouldRemove = false ) {
                if ( !taskList || taskList.length === 0 ) {
                    return false;
                }

                for ( let i = 0; i < taskList.length; i++ ) {
                    if ( taskList[ i ].sourceUrl === taskObject.sourceUrl ) {
                        if ( shouldRemove ) {
                            return taskList.splice( i, 1 )[ 0 ];
                        } else {
                            return taskList[ i ];
                        }
                    }
                }
                return false;
            };

            // Removes an entire index group from the queue.
            loadingQueueService.removeIndexGroup = function( indexToRemove ) {
                return loadingQueueService.findIndexGroup( indexToRemove, true );
            };

            // Removes a single task object from its respective index group.
            loadingQueueService.removeTask = function( taskToRemove ) {
                if ( !taskToRemove || typeof taskToRemove.priorityIndex === 'undefined' || typeof taskToRemove.sourceUrl === 'undefined' ) {
                    return;
                }

                const targetIndexGroup = loadingQueueService.findIndexGroup( taskToRemove.priorityIndex );

                if ( targetIndexGroup && targetIndexGroup.items ) {
                    loadingQueueService.isTaskAlreadyQueued( targetIndexGroup.items, taskToRemove, true );

                    // If the group becomes empty after removal, consider removing the group itself
                    if ( targetIndexGroup.items.length === 0 ) {
                        loadingQueueService.removeIndexGroup( targetIndexGroup.priorityIndex );
                        $rootScope.$broadcast( QUEUE_ITEM_COMPLETED, targetIndexGroup.priorityIndex );
                    }
                }

                // Check if the entire queue is empty now
                if ( loadingQueueService.pendingTasks.length === 0 ) {
                    $rootScope.$broadcast( GLOBAL_QUEUE_COMPLETED );
                }
            };
        }
    ] );

}( angular ) );