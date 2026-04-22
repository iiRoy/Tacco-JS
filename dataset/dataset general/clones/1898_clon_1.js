// This is a Type I clone of EasyCaptions v0.1.20111123
// Original source: https://github.com/pipwerks/EasyCaptions
// Copyright notice: (c) Philip Hutchison
// License information: MIT-style license found at http://pipwerks.mit-license.org/
// This version is structurally identical but visually altered via whitespace and comments.

var EasyCaptions = function ( options ) {

    // Declare all necessary variables for the EasyCaptions module.
    // These include various string constants, boolean values,
    // and references to DOM elements or internal functions.

    var UNDEFINED = "undefined"
        , STRING = "string"
        , FUNCTION = "function"
        , SPACE = "&nbsp;"
        , MAYBE = "maybe"
        , PROBABLY = "probably"
        , TYPE = "type"
        , SPAN = "span"
        , DATABEGIN = "data-begin"
        , DATAEND = "data-end"
        , TRUE = true
        , FALSE = false
        , $id = function (id) {
            // Shortcut for document.getElementById
            return document.getElementById( id );
        }
        , enable_transcript = ( typeof options.enableTranscript !== UNDEFINED ) ? options.enableTranscript : TRUE
        , enable_captions = ( typeof options.enableCaptions !== UNDEFINED ) ? options.enableCaptions : TRUE
        // Check if the transcript element was provided as a DOM object or an ID string.
        // If it's a string, use the $id helper to retrieve the element.
        // If not found or not provided, default to FALSE.
        , transcript_element = ( typeof options.transcriptElementID === STRING ) ? $id( options.transcriptElementID ) : options.transcriptElementID || FALSE
        // Similar check for the video element.
        , video_element = ( typeof options.videoElementID === STRING ) ? $id( options.videoElementID ) : options.videoElementID || FALSE
        // Define the CSS class to be applied to the transcript container.
        // Use user-defined class if available, otherwise a default.
        , transcript_enabled_class = options.transcriptEnabledClass || "EasyCaptions-enabled"
        // Define the ID for the dynamically generated caption display area.
        // Use user-defined ID if available, otherwise a default.
        , caption_id = options.captionID || "EasyCaptions-caption"
        , caption_array = [] // Array to store caption text keyed by timecode.
        , caption_element // Reference to the DOM element where captions will be displayed.
        , html5_supported // Boolean indicating if HTML5 video is supported and can be used.

        // Internal helper functions are defined below.

        , isHtml5VideoSupported = function () {

            var isSupported = FALSE
                , video = video_element || FALSE
                // Get the video element's type attribute, if it exists.
                , video_element_type = ( video && video.getAttribute( TYPE ) !== UNDEFINED ) ? video.getAttribute( TYPE ) : FALSE
                // Check if the canPlayType method exists on the video element.
                , canplay = ( typeof video.canPlayType !== UNDEFINED );

            // If no video element is present, HTML5 video cannot be supported.
            if ( !video ) {
                return FALSE;
            }

            // If a specific type is defined for the video element.
            if ( video_element_type ) {

                // Check if the browser can play this specific type.
                canplay = video.canPlayType( video_element_type );
                isSupported = video_element_type && ( canplay === MAYBE || canplay === PROBABLY );

            } else { // No type attribute on the video element itself, check source tags.

                if ( canplay ) {

                    // Iterate through all <source> tags within the video element.
                    var src = video.getElementsByTagName( "source" );
                    for ( var i = 0; i < src.length; i++ ) {
                        // Check if any of the source types can be played.
                        canplay = video.canPlayType( src[i].getAttribute( TYPE ) );
                        if ( canplay === MAYBE || canplay === PROBABLY ) {
                            isSupported = TRUE; // Found a playable source.
                            break; // Exit loop early.
                        }
                    }

                }

            }

            return isSupported; // Return the result of the support check.

        }

        // Updates the caption display with text from the caption_array
        // based on the provided timecode.
        , updateCaption = function ( timecode ) {
            if ( typeof caption_array[ timecode ] !== UNDEFINED ) {
                caption_element.innerHTML = caption_array[ timecode ];
            }
        }

        // Event handler for the 'timeupdate' event of an HTML5 video.
        // It calls updateCaption with the current integer time.
        , timeupdateHandler = function () {
            updateCaption( parseInt( this.currentTime, 10 ) );
        }

        // Creates a new DIV element for captions if one doesn't already exist
        // and appends it to the parent of the video element.
        , createCaptionField = function ( video_element, caption_id ) {
            var caption = $id( caption_id ); // Try to find an existing caption element.
            if ( !caption && typeof video_element !== UNDEFINED ) {
                caption = document.createElement( "div" ); // Create if not found.
                caption.id = caption_id;
                caption.innerHTML = SPACE; // Initialize with a non-breaking space.
                video_element.parentNode.appendChild( caption ); // Append to video's parent.
            }
            return caption; // Return the caption element.
        }

        // Parses the transcript element to extract all caption spans
        // and stores their content in an array keyed by begin/end times.
        , getSpans = function ( transcript_el ) {

            if ( !transcript_el ) {
                return FALSE;
            } // No transcript element, no spans to get.

            var spans = transcript_el.getElementsByTagName( SPAN ) // Get all span elements.
                , captionArray = []; // Initialize array to store captions.

            // Loop through each span to extract timecodes and content.
            for ( var i = 0, count = spans.length; i < count; i++ ) {
                var beginNum = spans[i].getAttribute( DATABEGIN ); // Get data-begin attribute.
                var endNum = spans[i].getAttribute( DATAEND );   // Get data-end attribute.
                captionArray[ beginNum ] = spans[i].innerHTML; // Store text at begin time.
                captionArray[ endNum ] = SPACE; // Clear caption at end time.
            }

            return captionArray; // Return the populated caption array.

        }

        // Enables interactive transcript functionality.
        // Clicks on transcript spans will seek the video to the corresponding time.
        , enableTranscript = function ( custom_handler, alt_video_element ) {

            // If HTML5 video is not supported and no custom handler is provided, exit.
            if ( !html5_supported && typeof custom_handler !== FUNCTION ) {
                return FALSE;
            }

            // Add a class to the transcript container to allow CSS styling for interactivity.
            if ( transcript_element.className.indexOf( transcript_enabled_class ) === -1 ) {
                transcript_element.className = transcript_element.className + " " + transcript_enabled_class;
            }

            // Set up an event listener on the transcript container using event delegation.
            // This handles clicks on any span within the transcript_element.
            transcript_element.onclick = function ( e ) {

                var event = e || window.event // Normalize event object.
                    , target = event.target || event.srcElement // Get the clicked element.
                    , position; // Variable to store the seek position.

                // Only proceed if the clicked element is a SPAN.
                if ( target.nodeName.toLowerCase() === SPAN ) {

                    position = target.getAttribute( DATABEGIN ); // Get the data-begin time.

                    // If data-begin is not defined, it's not a seekable span.
                    if ( typeof position === UNDEFINED ) {
                        return FALSE;
                    }

                    // If HTML5 video is supported, set its currentTime property.
                    if ( html5_supported && video_element ) {
                        video_element.currentTime = position;
                    }

                    // If HTML5 is not supported, and a custom handler is provided, invoke it.
                    if ( !html5_supported && alt_video_element && custom_handler ) {
                        custom_handler( alt_video_element, position );
                    }

                }

            };

        }

        // Enables caption display functionality.
        // Either via HTML5 video 'timeupdate' event or a custom handler.
        , enableCaptions = function ( custom_handler, alt_video_element ) {

            // If HTML5 is not supported and no custom handler is given, abort.
            if ( !html5_supported && typeof custom_handler !== FUNCTION ) {
                return FALSE;
            }

            // Populate caption_array if it hasn't been done yet.
            if ( caption_array.length === 0 ) {
                caption_array = getSpans( transcript_element );
            }

            // Create the caption display field if it doesn't exist.
            if ( !caption_element ) {
                // Determine the target element for caption placement.
                var target = ( !html5_supported && alt_video_element ) ? alt_video_element : video_element;
                caption_element = createCaptionField( target, caption_id );
            }

            // If HTML5 video is supported, attach the timeupdateHandler.
            if ( html5_supported ) {
                video_element.addEventListener( "timeupdate", timeupdateHandler, FALSE );
            }

            // If HTML5 is not supported, and a custom handler is provided, invoke it.
            if ( !html5_supported && alt_video_element && custom_handler ) {
                custom_handler( alt_video_element, updateCaption );
            }

        }

        // Provides a fallback mechanism for non-HTML5 video players.
        // Allows users to provide their own handlers for caption and transcript updates.
        , enableFallback = function ( params ) {

            var caption_handler = ( typeof params.captionHandler === FUNCTION ) ? params.captionHandler : FALSE
                , transcript_handler = ( typeof params.transcriptHandler === FUNCTION ) ? params.transcriptHandler : FALSE
                // Determine the alternative video element, which can be an ID string or a DOM element.
                , alt_video_element = ( typeof params.elementID === UNDEFINED ) ? FALSE : ( typeof params.elementID === STRING ) ? $id( params.elementID ) : params.elementID;

            // Ensure there's an alternative video element and at least one handler.
            if ( !alt_video_element || ( !caption_handler && !transcript_handler ) ) {
                return FALSE;
            }

            // If a caption handler is provided, enable captions using it.
            if ( caption_handler ) {
                enableCaptions( caption_handler, alt_video_element );
            }
            // If a transcript handler is provided, enable transcript using it.
            if ( transcript_handler ) {
                enableTranscript( transcript_handler, alt_video_element );
            }

        };


    // Main execution block:
    // Initialize EasyCaptions based on user options and browser capabilities.

    // First, detect if HTML5 video is available and supported.
    html5_supported = isHtml5VideoSupported();

    // If transcript functionality is enabled by options, initialize it.
    if ( enable_transcript ) {
        enableTranscript();
    }

    // If caption functionality is enabled by options, initialize it.
    if ( enable_captions ) {
        enableCaptions();
    }

    // Public API: Expose certain internal properties and methods
    // to allow external interaction with the EasyCaptions instance.
    this.video = video_element;
    this.transcript_element = transcript_element;
    this.caption_element = caption_element;
    this.updateCaption = updateCaption; // Allows manual updating of captions.
    this.html5_supported = html5_supported;
    this.addFallback = enableFallback; // Method to configure fallback for non-HTML5 players.

    return this; // Return the EasyCaptions instance.

};