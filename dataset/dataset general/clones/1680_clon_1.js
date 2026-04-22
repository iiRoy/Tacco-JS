/*
 *   Justified Gallery - v3.5.4
 *   http://miromannino.com/projects/justified-gallery/
 *   Copyright (c) 2014 Miro Mannino
 *   Licensed under the MIT license.
 *   This file is a Type I clone with extensive whitespace and comment variations.
 */
( function ( $ ) {

    /*
     *   Events triggered by Justified Gallery:
     *   jg.complete : Fired when the gallery has been fully rendered and loaded.
     *   jg.resize   : Fired when the gallery layout has been recalculated due to a resize event.
     */

    $.fn.justifiedGallery = function ( arg ) {

        //  Default configuration options for the gallery behavior.
        var defaults = {
            sizeRangeSuffixes: {
                'lt100' :   '',  // e.g. Flickr uses '_t' for thumbnails less than 100px
                'lt240' :   '',  // e.g. Flickr uses '_m' for medium images less than 240px
                'lt320' :   '',  // e.g. Flickr uses '_n' for images less than 320px
                'lt500' :   '',  // e.g. Flickr uses '' for images less than 500px
                'lt640' :   '',  // e.g. Flickr uses '_z' for images less than 640px
                'lt1024':   ''   // e.g. Flickr uses '_b' for large images up to 1024px
            },
            rowHeight: 120,    // Target height for rows.
            maxRowHeight: 0,   // Max height for rows (0 = 1.5 * rowHeight, negative value = no limits).
            margins: 1,        // Space between images and around the gallery.
            border: -1,        // Border around the gallery (-1 = same as margins, 0 = disabled).

            lastRow: 'nojustify', // How to handle the last row: 'nojustify', 'justify', or 'hide'.
            justifyThreshold: 0.75, /* If (row width / available space) > 0.75, the row will always be justified,
                                       overriding the 'lastRow' setting. */
            fixedHeight: false,        // If true, all images in a row will have the exact same height.
            waitThumbnailsLoad: true,  // Wait for all thumbnails to load before displaying.
            captions: true,            // Enable or disable captions.
            cssAnimation: false,       // Use CSS animations instead of jQuery's .fadeTo().
            imagesAnimationDuration: 500, // Duration for image fade-in (ignored if cssAnimation is true).
            captionSettings: {         // Settings for captions (ignored if cssAnimation is true).
                animationDuration: 500,
                visibleOpacity: 0.7,
                nonVisibleOpacity: 0.0
            },
            rel: null,    // Overwrite the 'rel' attribute of each link (e.g., for lightbox grouping).
            target: null, // Overwrite the 'target' attribute of all links.
            extension: /\.[^.\\/]+$/, // Regex to extract file extension.
            refreshTime: 100,         // Time in ms between width checks for responsive layout.
            randomize: false          // Randomize the order of images.
        }; // End of defaults object.

        //  This function determines the appropriate suffix for an image based on its dimensions.
        function getSuffix ( width, height, context ) {
            var longestSide;
            longestSide = ( width > height ) ? width : height; // Determine the longer side.
            if ( longestSide <= 100 ) {
                return context.settings.sizeRangeSuffixes.lt100;
            } else if ( longestSide <= 240 ) {
                return context.settings.sizeRangeSuffixes.lt240;
            } else if ( longestSide <= 320 ) {
                return context.settings.sizeRangeSuffixes.lt320;
            } else if ( longestSide <= 500 ) {
                return context.settings.sizeRangeSuffixes.lt500;
            } else if ( longestSide <= 640 ) {
                return context.settings.sizeRangeSuffixes.lt640;
            } else {
                return context.settings.sizeRangeSuffixes.lt1024;
            }
        } // End of getSuffix function.

        // Checks if a string `str` ends with a given `suffix`.
        function endsWith( str, suffix ) {
            return str.indexOf( suffix, str.length - suffix.length ) !== -1;
        }

        // Removes a specified `suffix` from the end of a `str`.
        function removeSuffix( str, suffix ) {
            return str.substring( 0, str.length - suffix.length );
        }

        //  Identifies which size suffix (if any) is currently applied to an image source string.
        function getUsedSuffix( str, context ) {
            var voidSuffix = false;
            for ( var si in context.settings.sizeRangeSuffixes ) {
                if ( context.settings.sizeRangeSuffixes[ si ].length === 0 ) {
                    voidSuffix = true; // Flag if there's an empty suffix defined.
                    continue;
                }
                if ( endsWith( str, context.settings.sizeRangeSuffixes[ si ] ) ) {
                    return context.settings.sizeRangeSuffixes[ si ];
                }
            }

            if ( voidSuffix ) return ""; // If an empty suffix was possible, return it.
            else throw 'unknown suffix for ' + str; // Otherwise, throw an error.
        }

        /*
         *  Given an image source URL, its width, and height, this function constructs a new
         *  image source URL with the most appropriate quality suffix for optimal display.
         */
        function newSrc( imageSrc, imgWidth, imgHeight, context ) {
            var matchRes = imageSrc.match( context.settings.extension );
            var ext = ( matchRes != null ) ? matchRes[ 0 ] : ''; // Extract the file extension.
            var newImageSrc = imageSrc.replace( context.settings.extension, '' ); // Remove extension temporarily.
            // Remove any existing suffix before adding the new one.
            newImageSrc = removeSuffix( newImageSrc, getUsedSuffix( newImageSrc, context ) );
            // Add the new, appropriate suffix and the original extension back.
            newImageSrc += getSuffix( imgWidth, imgHeight, context ) + ext;
            return newImageSrc;
        }

        //  Handler for when the mouse enters an entry, showing its caption.
        function onEntryMouseEnterForCaption ( ev ) {
            var $caption = $( ev.currentTarget ).find( '.caption' );
            if ( ev.data.settings.cssAnimation ) {
                $caption.addClass( 'caption-visible' ).removeClass( 'caption-hidden' );
            } else {
                $caption.stop().fadeTo( ev.data.settings.captionSettings.animationDuration,
                                        ev.data.settings.captionSettings.visibleOpacity );
            }
        }

        //  Handler for when the mouse leaves an entry, hiding its caption.
        function onEntryMouseLeaveForCaption ( ev ) {
            var $caption = $( ev.currentTarget ).find( '.caption' );
            if ( ev.data.settings.cssAnimation ) {
                $caption.removeClass( 'caption-visible' ).removeClass( 'caption-hidden' );
            } else {
                $caption.stop().fadeTo( ev.data.settings.captionSettings.animationDuration,
                                        ev.data.settings.captionSettings.nonVisibleOpacity );
            }
        }

        //  Displays an image entry with an animation or immediately.
        function showImg( $entry, callback, context ) {
            if ( context.settings.cssAnimation ) {
                $entry.addClass( 'entry-visible' );
                callback(); // Execute callback after adding class.
            } else {
                $entry.stop().fadeTo( context.settings.imagesAnimationDuration, 1.0, callback );
            }
        }

        //  Immediately hides an image entry.
        function hideImgImmediately( $entry, context ) {
            if ( context.settings.cssAnimation ) {
                $entry.removeClass( 'entry-visible' );
            } else {
                $entry.stop().fadeTo( 0, 0 ); // Instant fade out.
            }
        }

        //  Extracts the `img` element from an entry, considering different HTML structures.
        function imgFromEntry( $entry ) {
            var $img = $entry.find( '> img' ); // Direct child image.
            if ( $img.length === 0 ) {
                $img = $entry.find( '> a > img' ); // Image inside a link.
            }
            return $img;
        }

        /*
         *  Positions and sizes an entry (image + caption) within the gallery.
         *  Also handles image source updating for optimal quality.
         */
        function displayEntry( $entry, x, y, imgWidth, imgHeight, rowHeight, context ) {
            var $image = imgFromEntry( $entry );

            $image.css( 'width', imgWidth );
            $image.css( 'height', imgHeight );

            // Center the image within its container if it's smaller than the container.
            $image.css( 'margin-left', - imgWidth / 2 );
            $image.css( 'margin-top', - imgHeight / 2 );

            $entry.width( imgWidth );
            $entry.height( rowHeight );
            $entry.css( 'top', y );
            $entry.css( 'left', x );

            // DEBUG// console.log('displayEntry (w: ' + $image.width() + ' h: ' + $image.height());

            // Image reloading for higher quality thumbnails based on displayed size.
            var imageSrc = $image.attr( 'src' );
            var newImageSrc = newSrc( imageSrc, imgWidth, imgHeight, context );

            $image.one( 'error', function () {
                // DEBUG// console.log('revert the original image due to error');
                // Revert to the original thumbnail if the new source fails to load.
                $image.attr( 'src', $image.data( 'jg.originalSrc' ) );
            } );

            // Function to load the new image source after animation.
            function loadNewImage() {
                if ( imageSrc !== newImageSrc ) { // Only update if the source actually changed.
                    $image.attr( 'src', newImageSrc );
                }
            }

            // Show the image, potentially waiting for it to load.
            if ( $image.data( 'jg.loaded' ) === 'skipped' ) {
                onImageEvent( imageSrc, function () {
                    showImg( $entry, loadNewImage, context );
                    $image.data( 'jg.loaded', true );
                } );
            } else {
                showImg( $entry, loadNewImage, context );
            }

            // Captions handling ------------------------------
            var captionMouseEvents = $entry.data( 'jg.captionMouseEvents' );
            if ( context.settings.captions === true ) {
                var $imgCaption = $entry.find( '.caption' );
                if ( $imgCaption.length === 0 ) { // Create caption element if it doesn't exist.
                    var caption = $image.attr( 'alt' );
                    if ( typeof caption === 'undefined' ) {
                        caption = $entry.attr( 'title' ); // Fallback to entry's title attribute.
                    }
                    if ( typeof caption !== 'undefined' ) { // Only create if caption text is found.
                        $imgCaption = $( '<div class="caption">' + caption + '</div>' );
                        $entry.append( $imgCaption );
                    }
                }

                // Attach or update caption events.
                if ( $imgCaption.length !== 0 ) {
                    if ( !context.settings.cssAnimation ) {
                        // Initialize caption visibility with fade.
                        $imgCaption.stop().fadeTo( context.settings.imagesAnimationDuration,
                                                  context.settings.captionSettings.nonVisibleOpacity );
                    }
                    if ( typeof captionMouseEvents === 'undefined' ) {
                        // Store event handlers to easily remove them later.
                        captionMouseEvents = {
                            mouseenter: onEntryMouseEnterForCaption,
                            mouseleave: onEntryMouseLeaveForCaption
                        };
                        $entry.on( 'mouseenter', undefined, context, captionMouseEvents.mouseenter );
                        $entry.on( 'mouseleave', undefined, context, captionMouseEvents.mouseleave );
                        $entry.data( 'jg.captionMouseEvents', captionMouseEvents );
                    }
                }
            } else { // Captions are disabled.
                if ( typeof captionMouseEvents !== 'undefined' ) {
                    // Remove event handlers if captions are no longer desired.
                    $entry.off( 'mouseenter', undefined, context, captionMouseEvents.mouseenter );
                    $entry.off( 'mouseleave', undefined, context, captionMouseEvents.mouseleave );
                    $entry.removeData( 'jg.captionMouseEvents' );
                }
            }

        } // End of displayEntry function.

        /*
         *  Prepares a row for rendering, calculating final image dimensions and justification.
         *  Returns minimum height and justification status.
         */
        function prepareBuildingRow( context, isLastRow ) {
            var settings = context.settings;
            var i, $entry, $image, imgAspectRatio, newImgW, newImgH, justify = true;
            var minHeight = 0;
            var availableWidth = context.galleryWidth - ( 2 * context.border ) - (
                                 ( context.buildingRow.entriesBuff.length - 1 ) * settings.margins );
            var rowHeight = availableWidth / context.buildingRow.aspectRatio;
            // Check if the row is "justificable" based on threshold.
            var justificable = context.buildingRow.width / availableWidth > settings.justifyThreshold;

            // Handle the 'hide' option for the last row if it's not justificable.
            if ( isLastRow && settings.lastRow === 'hide' && !justificable ) {
                for ( i = 0; i < context.buildingRow.entriesBuff.length; i++ ) {
                    $entry = context.buildingRow.entriesBuff[ i ];
                    if ( settings.cssAnimation ) {
                        $entry.removeClass( 'entry-visible' );
                    } else {
                        $entry.stop().fadeTo( 0, 0 ); // Instantly hide.
                    }
                }
                return -1; // Indicate that the row was hidden.
            }

            // For 'nojustify' last row, only justify if it meets the justificable threshold.
            if ( isLastRow && !justificable && settings.lastRow === 'nojustify' ) {
                justify = false;
            }

            // Calculate dimensions for each image in the row.
            for ( i = 0; i < context.buildingRow.entriesBuff.length; i++ ) {
                $image = imgFromEntry( context.buildingRow.entriesBuff[ i ] );
                imgAspectRatio = $image.data( 'jg.imgw' ) / $image.data( 'jg.imgh' );

                if ( justify ) {
                    newImgW = ( i === context.buildingRow.entriesBuff.length - 1 ) ? availableWidth
                                : rowHeight * imgAspectRatio;
                    newImgH = rowHeight;

                    /*
                     *   With fixedHeight, newImgH should ideally be >= rowHeight.
                     *   However, sometimes justification might make it smaller.
                     *   The original logic here was commented out to prioritize justification
                     *   over strict fixedHeight adherence in edge cases.
                     *   If (settings.fixedHeight && newImgH < settings.rowHeight) {
                     *     newImgW = settings.rowHeight * imgAspectRatio;
                     *     newImgH = settings.rowHeight;
                     *   }
                     */

                } else { // If not justifying (e.g., last row 'nojustify').
                    newImgW = settings.rowHeight * imgAspectRatio;
                    newImgH = settings.rowHeight;
                }

                availableWidth -= Math.round( newImgW ); // Subtract width for the next image.
                $image.data( 'jg.jimgw', Math.round( newImgW ) );
                $image.data( 'jg.jimgh', Math.ceil( newImgH ) );
                if ( i === 0 || minHeight > newImgH ) {
                    minHeight = newImgH; // Track the minimum height in the row.
                }
            }

            // Adjust minHeight if fixedHeight is enabled and exceeded.
            if ( settings.fixedHeight && minHeight > settings.rowHeight ) {
                minHeight = settings.rowHeight;
            }

            return { minHeight: minHeight, justify: justify };
        } // End of prepareBuildingRow function.

        //  Resets the gallery's internal state for a fresh layout calculation.
        function rewind( context ) {
            context.lastAnalyzedIndex = -1; // Reset last processed image index.
            context.buildingRow.entriesBuff = [];
            context.buildingRow.aspectRatio = 0;
            context.buildingRow.width = 0;
            context.offY = context.border; // Reset vertical offset.
        }

        //  Renders a completed row of images into the gallery.
        function flushRow( context, isLastRow ) {
            var settings = context.settings;
            var $entry, $image, minHeight, buildingRowRes, offX = context.border;

            // DEBUG// console.log('flush (isLastRow: ' + isLastRow + ')');

            buildingRowRes = prepareBuildingRow( context, isLastRow );
            minHeight = buildingRowRes.minHeight;

            // If the row was hidden (e.g., lastRow 'hide'), clear buffers and return.
            if ( isLastRow && settings.lastRow === 'hide' && minHeight === -1 ) {
                context.buildingRow.entriesBuff = [];
                context.buildingRow.aspectRatio = 0;
                context.buildingRow.width = 0;
                return;
            }

            // Apply maxRowHeight constraints.
            if ( settings.maxRowHeight > 0 && settings.maxRowHeight < minHeight ) {
                minHeight = settings.maxRowHeight;
            } else if ( settings.maxRowHeight === 0 && ( 1.5 * settings.rowHeight ) < minHeight ) {
                minHeight = 1.5 * settings.rowHeight;
            }

            // Display each entry in the row.
            for ( var i = 0; i < context.buildingRow.entriesBuff.length; i++ ) {
                $entry = context.buildingRow.entriesBuff[ i ];
                $image = imgFromEntry( $entry );
                displayEntry( $entry, offX, context.offY, $image.data( 'jg.jimgw' ),
                             $image.data( 'jg.jimgh' ), minHeight, context );
                offX += $image.data( 'jg.jimgw' ) + settings.margins;
            }

            // Update the gallery's total height.
            context.$gallery.height( context.offY + minHeight + context.border +
                ( context.spinner.active ? context.spinner.$el.innerHeight() : 0 )
            );

            // Prepare for a new row, unless it's the last row and it's not fully justified.
            if ( !isLastRow || ( minHeight <= context.settings.rowHeight && buildingRowRes.justify ) ) {
                context.offY += minHeight + context.settings.margins; // Advance vertical offset.

                // DEBUG// console.log('minHeight: ' + minHeight + ' offY: ' + context.offY);

                context.buildingRow.entriesBuff = []; // Clear buffer for the next row.
                context.buildingRow.aspectRatio = 0;
                context.buildingRow.width = 0;
                context.$gallery.trigger( 'jg.rowflush' ); // Notify that a row has been flushed.
            }
        } // End of flushRow function.

        //  Sets up an interval to periodically check if the gallery's width has changed.
        function checkWidth( context ) {
            context.checkWidthIntervalId = setInterval( function () {
                var galleryWidth = parseInt( context.$gallery.width(), 10 );
                if ( context.galleryWidth !== galleryWidth ) {
                    // DEBUG// console.log("resize. old: " + context.galleryWidth + " new: " + galleryWidth);

                    context.galleryWidth = galleryWidth;
                    rewind( context ); // Reset internal state.

                    // Restart the image analysis process for the new width.
                    startImgAnalyzer( context, true );
                }
            }, context.settings.refreshTime );
        }

        //  Initiates the loading spinner animation.
        function startLoadingSpinnerAnimation( spinnerContext ) {
            clearInterval( spinnerContext.intervalId ); // Clear any existing interval.
            spinnerContext.intervalId = setInterval( function () {
                if ( spinnerContext.phase < spinnerContext.$points.length ) {
                    spinnerContext.$points.eq( spinnerContext.phase ).fadeTo( spinnerContext.timeslot, 1 );
                } else {
                    // Fade out points that have already faded in.
                    spinnerContext.$points.eq( spinnerContext.phase - spinnerContext.$points.length )
                                  .fadeTo( spinnerContext.timeslot, 0 );
                }
                // Cycle through phases for animation.
                spinnerContext.phase = ( spinnerContext.phase + 1 ) % ( spinnerContext.$points.length * 2 );
            }, spinnerContext.timeslot );
        }

        //  Stops the loading spinner animation.
        function stopLoadingSpinnerAnimation( spinnerContext ) {
            clearInterval( spinnerContext.intervalId );
            spinnerContext.intervalId = null;
        }

        // Stops any pending image analyzer timeout and resets yield counter.
        function stopImgAnalyzerStarter( context ) {
            context.yield.flushed = 0;
            if ( context.imgAnalyzerTimeout !== null ) {
                clearTimeout( context.imgAnalyzerTimeout );
            }
        }

        //  Starts or restarts the image analysis process, potentially with a delay.
        function startImgAnalyzer( context, isForResize ) {
            stopImgAnalyzerStarter( context ); // Ensure no previous analyzer is running.
            context.imgAnalyzerTimeout = setTimeout( function () {
                analyzeImages( context, isForResize );
            }, 0.001 ); // A tiny delay to allow browser to render.
            // Also call immediately for initial load or if no delay needed.
            analyzeImages( context, isForResize );
        }

        //  The core function that analyzes images and arranges them into rows.
        function analyzeImages( context, isForResize ) {

            /*
             *   //DEBUG//
             *   var rnd = parseInt(Math.random() * 10000, 10);
             *   console.log('analyzeImages ' + rnd + ' start');
             *   console.log('images status: ');
             *   for (var i = 0; i < context.entries.length; i++) {
             *     var $entry = $(context.entries[i]);
             *     var $image = imgFromEntry($entry);
             *     console.log(i + ' (alt: ' + $image.attr('alt') + 'loaded: ' + $image.data('jg.loaded') + ')');
             *   }
             */

            var settings = context.settings;
            var isLastRow;

            for ( var i = context.lastAnalyzedIndex + 1; i < context.entries.length; i++ ) {
                var $entry = $( context.entries[ i ] );
                var $image = imgFromEntry( $entry );

                // Only process images that are loaded or skipped (meaning they don't need to load).
                if ( $image.data( 'jg.loaded' ) === true || $image.data( 'jg.loaded' ) === 'skipped' ) {
                    isLastRow = i >= context.entries.length - 1;

                    var availableWidth = context.galleryWidth - ( 2 * context.border ) - (
                                         ( context.buildingRow.entriesBuff.length - 1 ) * settings.margins );
                    var imgAspectRatio = $image.data( 'jg.imgw' ) / $image.data( 'jg.imgh' );

                    // Check if adding the current image would make the row too short (i.e., less than target row height).
                    if ( availableWidth / ( context.buildingRow.aspectRatio + imgAspectRatio ) < settings.rowHeight ) {
                        flushRow( context, isLastRow ); // Render the current row.
                        if ( ++context.yield.flushed >= context.yield.every ) {
                            // DEBUG// console.log("yield - pausing analysis to avoid blocking UI");
                            startImgAnalyzer( context, isForResize ); // Yield control and restart.
                            return;
                        }
                    }

                    // Add the current image to the buffer for the ongoing row.
                    context.buildingRow.entriesBuff.push( $entry );
                    context.buildingRow.aspectRatio += imgAspectRatio;
                    context.buildingRow.width += imgAspectRatio * settings.rowHeight;
                    context.lastAnalyzedIndex = i; // Update the index of the last analyzed image.

                } else if ( $image.data( 'jg.loaded' ) !== 'error' ) {
                    // If an image is not loaded and not errored, stop analysis and wait for it.
                    return;
                }
            }

            // Flush the last row if it contains any images.
            if ( context.buildingRow.entriesBuff.length > 0 ) {
                flushRow( context, true );
            }

            // If a spinner was active, deactivate and remove it.
            if ( context.spinner.active ) {
                context.spinner.active = false;
                context.$gallery.height( context.$gallery.height() - context.spinner.$el.innerHeight() );
                context.spinner.$el.detach();
                stopLoadingSpinnerAnimation( context.spinner );
            }

            /*
             *   Stop any pending timeout that might trigger analyzeImages again.
             *   This is important because an image might have loaded, triggering a timeout,
             *   but then already been processed by a direct call to analyzeImages.
             */
            stopImgAnalyzerStarter( context );

            // Trigger appropriate completion events.
            if ( !isForResize ) {
                context.$gallery.trigger( 'jg.complete' );
            } else {
                context.$gallery.trigger( 'jg.resize' );
            }

            // DEBUG// console.log('analyzeImages ' + rnd + ' end');
        } // End of analyzeImages function.

        //  Validates the gallery settings and converts types where necessary.
        function checkSettings ( context ) {
            var settings = context.settings;

            // Helper to check if a suffix range is a string.
            function checkSuffixesRange( range ) {
                if ( typeof settings.sizeRangeSuffixes[ range ] !== 'string' ) {
                    throw 'sizeRangeSuffixes.' + range + ' must be a string';
                }
            }

            // Helper to check and convert a setting to a number.
            function checkOrConvertNumber( parent, settingName ) {
                if ( typeof parent[ settingName ] === 'string' ) {
                    parent[ settingName ] = parseFloat( parent[ settingName ], 10 );
                    if ( isNaN( parent[ settingName ] ) ) {
                        throw 'invalid number for ' + settingName;
                    }
                } else if ( typeof parent[ settingName ] === 'number' ) {
                    if ( isNaN( parent[ settingName ] ) ) {
                        throw 'invalid number for ' + settingName;
                    }
                } else {
                    throw settingName + ' must be a number';
                }
            }

            // Perform checks on sizeRangeSuffixes object and its properties.
            if ( typeof settings.sizeRangeSuffixes !== 'object' ) {
                throw 'sizeRangeSuffixes must be defined and must be an object';
            }

            checkSuffixesRange( 'lt100' );
            checkSuffixesRange( 'lt240' );
            checkSuffixesRange( 'lt320' );
            checkSuffixesRange( 'lt500' );
            checkSuffixesRange( 'lt640' );
            checkSuffixesRange( 'lt1024' );

            // Check and convert numeric settings.
            checkOrConvertNumber( settings, 'rowHeight' );
            checkOrConvertNumber( settings, 'maxRowHeight' );

            // Ensure maxRowHeight is not less than rowHeight if positive.
            if ( settings.maxRowHeight > 0 &&
                 settings.maxRowHeight < settings.rowHeight ) {
                settings.maxRowHeight = settings.rowHeight;
            }

            checkOrConvertNumber( settings, 'margins' );
            checkOrConvertNumber( settings, 'border' );

            // Validate lastRow option.
            if ( settings.lastRow !== 'nojustify' &&
                 settings.lastRow !== 'justify' &&
                 settings.lastRow !== 'hide' ) {
                throw 'lastRow must be "nojustify", "justify" or "hide"';
            }

            // Validate justifyThreshold.
            checkOrConvertNumber( settings, 'justifyThreshold' );
            if ( settings.justifyThreshold < 0 || settings.justifyThreshold > 1 ) {
                throw 'justifyThreshold must be between 0 and 1';
            }

            checkOrConvertNumber( settings, 'imagesAnimationDuration' );
            checkOrConvertNumber( settings.captionSettings, 'animationDuration' );
            checkOrConvertNumber( settings.captionSettings, 'visibleOpacity' );
            checkOrConvertNumber( settings.captionSettings, 'nonVisibleOpacity' );
            checkOrConvertNumber( settings, 'refreshTime' );

            if ( settings.refreshTime < 0 ) {
                throw 'refreshTime must be a positive number';
            }
        } // End of checkSettings function.

        //  Initializes the gallery. This is the main entry point for the plugin instance.
        function init( context, arg ) {
            // Merge default settings with user-provided arguments.
            context.settings = $.extend( true, {}, defaults, arg );
            checkSettings( context ); // Validate and normalize settings.

            context.lastAnalyzedIndex = -1; // Index of the last image processed.
            context.buildingRow = {
                entriesBuff: [],   // Buffer for images in the current row.
                aspectRatio: 0,    // Accumulated aspect ratio of images in the current row.
                width: 0           // Accumulated width of images in the current row (at target height).
            };
            context.offY = context.border; // Current Y offset for placing rows.
            context.yield = {
                every: 2,          // How many rows to flush before yielding (for performance).
                flushed: 0         // Counter for flushed rows.
            };
            context.imgAnalyzerTimeout = null; // Timeout ID for deferred image analysis.
            context.checkWidthIntervalId = null; // Interval ID for width checking.

            context.$gallery.empty(); // Clear any existing content in the gallery container.
            context.$gallery.css( 'position', 'relative' ); // Ensure proper positioning.
            context.$gallery.width( 'auto' ); // Allow width to be determined by parent.
            context.$gallery.addClass( 'justified-gallery' ); // Add a class for styling.

            // Configure spinner for loading indication.
            context.spinner = {
                active: false,
                phase: 0,
                timeslot: 150, // Time per spinner phase.
                $el: $( '<div class="spinner"><span></span><span></span><span></span></div>' ),
                intervalId: null
            };

            // Retrieve gallery images/entries.
            context.entries = context.$gallery.find( '> a, > div' ).toArray();
            if ( context.entries.length === 0 ) {
                return; // No entries found, nothing to do.
            }

            // Randomize image order if requested.
            if ( context.settings.randomize ) {
                context.entries.sort( function () { return 0.5 - Math.random(); } );
            }

            // Initialize image data attributes and original sources.
            var imagesToLoad = 0;
            for ( var i = 0; i < context.entries.length; i++ ) {
                var $entry = $( context.entries[ i ] );
                var $image = imgFromEntry( $entry );

                $image.data( 'jg.originalSrc', $image.attr( 'src' ) ); // Store original source.
                $image.data( 'jg.loaded', false ); // Mark as not loaded initially.

                $entry.addClass( 'entry' ); // Add entry class.
                if ( !context.settings.cssAnimation ) {
                    $entry.stop().fadeTo( 0, 0 ); // Hide initially if no CSS animation.
                }

                // Attach rel and target attributes if defined in settings.
                if ( context.settings.rel ) {
                    $entry.attr( 'rel', context.settings.rel );
                }
                if ( context.settings.target ) {
                    $entry.attr( 'target', context.settings.target );
                }

                // Extract width and height from image data or attributes.
                var imgWidth = $image.attr( 'width' );
                var imgHeight = $image.attr( 'height' );

                if ( typeof imgWidth !== 'undefined' && typeof imgHeight !== 'undefined' ) {
                    $image.data( 'jg.imgw', parseInt( imgWidth, 10 ) );
                    $image.data( 'jg.imgh', parseInt( imgHeight, 10 ) );
                    $image.data( 'jg.loaded', true ); // If dimensions are known, consider it "loaded".
                } else if ( context.settings.waitThumbnailsLoad ) {
                    imagesToLoad++; // Count images that need to be loaded to get dimensions.
                    // Attach load handler.
                    $image.one( 'load', function () {
                        var $img = $( this );
                        $img.data( 'jg.imgw', $img.width() );
                        $img.data( 'jg.imgh', $img.height() );
                        $img.data( 'jg.loaded', true );
                        imagesToLoad--; // Decrement count on load.
                        // If all images are loaded, start analysis.
                        if ( imagesToLoad === 0 ) {
                            analyzeImages( context, false );
                        }
                    } ).one( 'error', function () {
                        var $img = $( this );
                        $img.data( 'jg.loaded', 'error' ); // Mark as error.
                        imagesToLoad--;
                        if ( imagesToLoad === 0 ) {
                            analyzeImages( context, false );
                        }
                    } );
                } else {
                    $image.data( 'jg.imgw', 1 ); // Default to 1px if dimensions unknown and not waiting.
                    $image.data( 'jg.imgh', 1 );
                    $image.data( 'jg.loaded', 'skipped' ); // Mark as skipped.
                }

            } // End of for loop through entries.

            // If there are images to load and waitThumbnailsLoad is true, show spinner.
            if ( imagesToLoad > 0 && context.settings.waitThumbnailsLoad ) {
                context.spinner.active = true;
                context.$gallery.append( context.spinner.$el );
                startLoadingSpinnerAnimation( context.spinner );
            }

            // Get initial gallery width.
            context.galleryWidth = parseInt( context.$gallery.width(), 10 );

            // Start analyzing images if no images are pending load or if not waiting.
            if ( imagesToLoad === 0 ) {
                analyzeImages( context, false );
            }

            // Set up interval to check for width changes.
            checkWidth( context );
        } // End of init function.

        // Main plugin logic for each selected element.
        return this.each( function () {
            var context = {
                $gallery: $( this ) // Store the jQuery object for the gallery element.
            };
            init( context, arg ); // Initialize the gallery.
        } );

    }; // End of $.fn.justifiedGallery.

} ) ( jQuery ); // Pass jQuery as $ to the immediately invoked function.