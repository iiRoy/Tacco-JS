// This module orchestrates responsive image loading,
// incorporating srcset fallback and deferred image loading.

var ImageLoader = (function () {
    var config = {
        pauseDuration: 400, // Time to wait before next batch
        lookaheadFactor: 3, // Multiplier for viewport height for eager loading
        maxBatchSize: 6     // Max images to load in a single batch
    };
    var doc = document, 
        win = window, 
        currentBatchCount = 0, 
        processingStartIdx = 0, 
        idx, isPaused, totalItems, srcSetIdx, 
        sourceURL, sourceSetString, cachedViewportHeight, cachedViewportWidth, 
        desiredWidth, isQueued, 
        elementProp, retrieveMediaElements, attachEventHandler, 
        isVisibleInWindow, loadTargetImage, processMediaQueue;
          
    // Helper function to either retrieve or assign an HTML element's attribute.
    elementProp = function() {
        // If three arguments are provided, it's a setter operation.
        return arguments.length - 2 ?
            // Set the attribute only if its current value differs from the new value.
            (elementProp(arguments[0], arguments[1]) !== arguments[2]) && arguments[0].setAttribute(arguments[1], arguments[2]) :
            // Otherwise, with two arguments, retrieve the attribute's value.
            arguments[0].getAttribute(arguments[1]);
    };

    // Populates the array of image elements to be processed.
    retrieveMediaElements = function() {
        mediaElements = doc.querySelectorAll ?
                        doc.querySelectorAll('img[data-srcset]') :
                        doc.getElementsByTagName('img');
    };

    attachEventHandler = function(eventName, callbackFunction) {
        win.addEventListener ?
            this.addEventListener(eventName, callbackFunction, false) :
            (win.attachEvent) ?
                this.attachEvent('on' + eventName, callbackFunction) :
                this['on' + eventName] = callbackFunction;
    };

    isVisibleInWindow = function(targetElement) {
        // If the element already has a placeholder for its original source, it's considered loaded or processed.
        if ( elementProp(targetElement, 'data-original-src') ) {
            return true;
        }

        // Obtain the size and position of the element relative to the viewport.
        var boundingBox = targetElement.getBoundingClientRect();

        // Check if the element's bounding box is within or near the viewport,
        // considering the configured lookahead factor.
        return (
           boundingBox.left >= 0 - config.lookaheadFactor * getEffectiveWindowHeight() &&
           boundingBox.top <= config.lookaheadFactor * getEffectiveWindowHeight()
        );
    };

    applyImageSource = function(mediaEl, finalSource) {
        // Only update the 'src' attribute if it's different from the current value.
        if ( elementProp(mediaEl, 'src') !== finalSource ) {
            currentBatchCount += 1; // Increment the count of images loaded in the current batch.
            elementProp(mediaEl, 'src', finalSource);
            // Optionally log image loading for debugging purposes.
            // console.log(['Image loaded:', finalSource, mediaEl, { batch: currentBatchCount }]);
        }
    };

    loadTargetImage = function(mediaEl) {
        // Retrieve the 'data-srcset' attribute; if absent, there's nothing to do.
        sourceSetString = elementProp(mediaEl, 'data-srcset');
        if (!sourceSetString) {
            return;
        }
        
        // Store the image's current 'src' as its original placeholder, if not already saved.
        if ( !elementProp(mediaEl, 'data-original-src') ) {
            elementProp( mediaEl, 'data-original-src', elementProp(mediaEl, 'src') );
        }

        // Parse the srcset string into individual image candidates.
        var candidates = sourceSetString.split(/, ?/);
                
        // Loop through each candidate in the srcset array.
        for ( srcSetIdx = 0; srcSetIdx < candidates.length; srcSetIdx++ ) {
        
            // Check if the candidate specifies a width descriptor (e.g., '100w').
            if ( !candidates[srcSetIdx].match(/\dw$/) ) {
                // If no width descriptor, treat as a standard lazy load source.
                sourceURL = candidates[srcSetIdx];
                applyImageSource(mediaEl, sourceURL);

            } else {
                // Extract the specified width from the srcset candidate.
                desiredWidth = +candidates[srcSetIdx].match(/\d+(?=w$)/);
                // If the candidate's width is suitable for the current viewport, load it.
                if (desiredWidth <= cachedViewportWidth ) {
                    sourceURL = candidates[srcSetIdx].split(/ /)[0]; // Get the URL part.
                    applyImageSource(mediaEl, sourceURL);
                    break; // Stop after finding the first suitable image.
                } 
            } 
        }
    };

    processMediaQueue = function() {

        // If the image processing is currently paused, do not proceed.
        if (!isPaused) {
            // console.log('-- processMediaQueue invoked and executing');
            isPaused = true; // Set flag to prevent re-entry.
            
            // Update the cached viewport width once per processing cycle.
            cachedViewportWidth = getEffectiveWindowWidth();
            isQueued = false; // Reset the queue flag for this cycle.

            totalItems = mediaElements.length; // Get the total number of images.
            // console.log(['Total media elements:', totalItems, mediaElements]);
            // Ensure processingStartIdx is valid, reset to 0 if not (though it should be self-correcting).
            processingStartIdx = processingStartIdx === processingStartIdx ? 0 : processingStartIdx;


            // Iterate through the media elements starting from the last known position.
            for ( idx = processingStartIdx; idx < totalItems; idx++ ) {

                // Check if the current batch size limit has been reached.
                if (currentBatchCount < config.maxBatchSize) {
                    // If within limits, check if the image is visible in the viewport.
                    if ( isVisibleInWindow(mediaElements[idx]) ) {
                        loadTargetImage(mediaElements[idx]);
                    }
                } else {
                    // If batch limit is hit, queue a follow-up processing run.
                    if (!isQueued) {
                        isQueued = true;
                        setTimeout(function() {
                            currentBatchCount = 0; // Reset batch counter.
                            isQueued = false;      // Reset queue flag.
                            processingStartIdx = idx; // Store current index to resume from.
                            processMediaQueue();   // Recursively call to process remaining images.
                        }, config.pauseDuration / 10); // A shorter delay for batch continuation.
                        return; // Exit current loop, wait for queued call.
                    }
                }

            }
            // If the loop finishes without returning (i.e., not hitting batch limit),
            // isPaused remains true, awaiting release by an event or the 'else' block's timeout.
        } else {
            // If processing is already paused (due to a previous queue or ongoing run),
            // ensure a follow-up call is scheduled if not already.
            if (!isQueued) {
                isQueued = true;
                setTimeout(function() {
                    if (isPaused) { // Check if still paused, could have been reset by another event.
                        isPaused = false; // Release the processing lock.
                        isQueued = false; // Reset queue flag.
                        processMediaQueue(); // Re-initiate processing.
                    }
                }, config.pauseDuration); // Use full delay for general event-triggered pauses.
            }
        }
    };

    // Retrieves the current viewport height, caching the result for efficiency.
    getEffectiveWindowHeight = function() {
        return cachedViewportHeight = cachedViewportHeight ||
            (win.innerHeight || doc.documentElement.clientHeight);
    };

    // Computes the effective viewport width, adjusting for device pixel ratio.
    getEffectiveWindowWidth = function() {
        return (win.innerWidth || doc.body.parentNode.clientWidth) * (win.devicePixelRatio || 1);
    };

    isQueued = isPaused = false; // Initialize state flags to indicate no pending operations.

    retrieveMediaElements(); // Populate the initial list of images.

    attachEventHandler( 'load', processMediaQueue ); // Trigger processing upon page load.
    attachEventHandler( 'orientationchange', function() {
        // When device orientation changes, invalidate cached height and reset processing state.
        cachedViewportHeight = 0; // Force recalculation of viewport height.
        isPaused = false;         // Release the processing lock.
        processMediaQueue();      // Re-initiate image loading to adapt to new dimensions.
    });
    attachEventHandler( 'scroll', processMediaQueue ); // Trigger processing on scroll events.
    attachEventHandler( 'orientationchange', processMediaQueue ); // Also trigger on orientation change for processing.

    // If no image elements were found initially, schedule a re-check after a short delay.        
    !mediaElements.length && 
        setTimeout(retrieveMediaElements, config.pauseDuration);
        

    // Expose a public interface for interacting with the image loading system.
    return({

        // Method to dynamically adjust configuration parameters.
        // For instance, 'lookaheadFactor' dictates how far beyond the viewport
        // images are considered for loading (e.g., 1 for strict lazy, 5 for eager).
        // Example:
        // ImageLoader.configureOptions({ lookaheadFactor: 1 }); // Very lazy loading
        // ImageLoader.configureOptions({ lookaheadFactor: 5 }); // More aggressive pre-loading
        configureOptions: function(settings) {
            for (var settingKey in settings) {
                if (settings.hasOwnProperty(settingKey)) {
                    config[settingKey] = settings[settingKey];
                }
            }
        },
        
        // Provides a mechanism to add new image elements to the processing queue.
        // Useful for content loaded via AJAX or dynamically inserted.
        // Example:
        // var freshImageElement = document.createElement('img');
        // freshImageElement.src = 'new_picture.jpg';
        // ImageLoader.addPicture(freshImageElement);
        addPicture: function(newImgElement) {
            return mediaElements.push(newImgElement);
        },
        
        // Forces immediate loading of all remaining images, bypassing lazy loading.
        // Example:
        // ImageLoader.loadImmediately();
        loadImmediately: function() {
            for ( idx = 0, totalItems = mediaElements.length; idx < totalItems; idx++ ) {
                loadTargetImage(mediaElements[idx]);
            }
        }

        // Optional: A method to expose the internal array of media elements.
        // getMediaElements: function() {
        //    return mediaElements;
        // }

    });

})();