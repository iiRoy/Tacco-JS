(function( globalContext, hasNativeMQ ){

    // --- Core Configuration and State Management ---
    // This object serves as the public interface for the media query polyfill.
    globalContext.styleAdaptr = {};

    // For environments with native media query support, the update function will be a no-op.
    // This prevents errors if external scripts attempt to call it.
    globalContext.styleAdaptr.refresh = function(){};

    // Expose the detected media query support flag for external inspection.
    globalContext.styleAdaptr.hasBuiltinMQ = hasNativeMQ;

    // If the browser natively supports media queries, there's no need for this polyfill.
    if( hasNativeMQ ){
        return;
    }

    // --- Internal Variables and Constants ---
    const documentRef                 = globalContext.document;
    const documentRoot                = documentRef.documentElement;
    let   processedRulesets           = [];       // Stores parsed media query conditions and rule indices.
    let   cssRuleBlocks               = [];       // Stores the actual CSS rule strings, indexed.
    let   injectedStyleElements       = [];       // References to the <style> elements we dynamically add.
    const processedSheetURLs          = {};       // Map to prevent re-fetching/re-parsing the same stylesheet URL.
    const debounceInterval            = 45;       // Milliseconds to wait before processing resize events.
    const documentHead                = documentRef.getElementsByTagName( "head" )[0] || documentRoot;
    const styleLinkElements           = documentHead.getElementsByTagName( "link" );
    const pendingStyleRequests        = [];       // Queue for stylesheets that need to be fetched via AJAX.

    // --- Utility Functions ---

    /**
     * Extracts the directory path from a given URL.
     * @param {string} url - The full URL.
     * @returns {string} The directory path, ending with a slash if non-empty.
     */
    const getDirectoryPath = function( url ) {
        const lastSlashIndex = url.lastIndexOf( "/" );
        if ( lastSlashIndex > -1 ) {
            return url.substring( 0, lastSlashIndex + 1 );
        }
        return ""; // No directory path found
    };

    /**
     * Checks if a given URL belongs to the same origin as the current document.
     * @param {string} resourceURL - The URL to check.
     * @returns {boolean} True if the URL is local or same-origin, false otherwise.
     */
    const isSameOriginResource = function( resourceURL ) {
        // Regex to check for absolute URLs with scheme (e.g., http://, https://, //)
        const absoluteURLPattern = /^([a-zA-Z]+?:(\/\/)?(www\.)?)/;
        const match = resourceURL.match( absoluteURLPattern );

        // If it's an absolute URL, check if its host matches the current window's host.
        if ( match && match[1] ) {
            const domainPart = resourceURL.replace( match[1], "" ).split( "/" )[0];
            return domainPart === globalContext.location.host;
        }
        // If it's a relative URL, it's considered same-origin.
        return true;
    };

    /**
     * Replaces relative URLs within CSS content with absolute URLs based on the stylesheet's base path.
     * @param {string} cssFragment - The CSS string to process.
     * @param {string} basePath - The base path to prepend to relative URLs.
     * @returns {string} The CSS string with adjusted URLs.
     */
    const adjustRelativeURLs = function( cssFragment, basePath ) {
        // Regex to find 'url()' references in CSS, capturing the path.
        // It needs to handle both 'url("path")' and 'url(path)' formats.
        return cssFragment.replace( /(url\()['"]?([^\/'"]+?)['"]?(\))/g, function( _, p1, p2, p3 ) {
            // Ensure the base path ends with a slash if it's not empty, and the URL is not already absolute.
            const adjustedPath = ( basePath && !p2.startsWith('/') && !/^[a-zA-Z]+?:\/\//.test(p2) ) ? basePath + p2 : p2;
            return p1 + adjustedPath + p3;
        });
    };

    // --- Core Logic Functions ---

    /**
     * Scans all <link> elements in the document head, queues external stylesheets for fetching.
     */
    const scanStyleLinks = function(){
        const allLinks = styleLinkElements;
        const linkCount = allLinks.length;

        for( let i = 0; i < linkCount; i++ ){
            const currentLink = allLinks[ i ];
            const linkURL = currentLink.href;
            const linkMediaAttr = currentLink.media;
            const isStylesheetLink = currentLink.rel && currentLink.rel.toLowerCase() === "stylesheet";

            // Only process valid stylesheet links that haven't been parsed yet.
            if( linkURL && isStylesheetLink && !processedSheetURLs[ linkURL ] ){
                // If it's a same-origin resource (or relative), add it to the fetch queue.
                if( isSameOriginResource( linkURL ) ){
                    pendingStyleRequests.push( {
                        url: linkURL,
                        media: linkMediaAttr
                    } );
                }
                // Mark remote resources as processed to avoid re-checking, as they can't be fetched via XHR.
                else {
                    processedSheetURLs[ linkURL ] = true;
                }
            }
        }
        // Once all links are scanned, start fetching their content.
        initiateResourceFetching();
    };

    /**
     * Recursively processes the queue of pending stylesheet requests, fetching their content.
     */
    const initiateResourceFetching = function(){
        if( pendingStyleRequests.length > 0 ){
            const currentFetchItem = pendingStyleRequests.shift();

            fetchResourceContent( currentFetchItem.url, function( stylesContent ){
                // Process the fetched CSS content.
                parseAndProcessCSS( stylesContent, currentFetchItem.url, currentFetchItem.media );
                processedSheetURLs[ currentFetchItem.url ] = true; // Mark as processed.
                initiateResourceFetching(); // Continue with the next item in the queue.
            });
        }
    };

    /**
     * Parses CSS text for @media blocks, extracts rules, and stores them for dynamic application.
     * @param {string} cssContent - The raw CSS text.
     * @param {string} baseURL - The base URL of the stylesheet (for relative path resolution).
     * @param {string} externalMediaSpec - The media attribute value from the <link> tag, if any.
     */
    const parseAndProcessCSS = function( cssContent, baseURL, externalMediaSpec ){
        if ( !cssContent || typeof cssContent !== 'string' ) {
            return; // Skip if content is empty or invalid.
        }

        // Regex to find @media blocks. The '(?=\}\/\*\/mediaquery\*\/)' part is a lookahead
        // to handle nested media queries or specific markers. The original code's regex was a bit specific.
        // Let's simplify and assume standard @media { ... } structure.
        const mediaBlockMatches = cssContent.match( /@media\s+([^\{]+)\{([\S\s]+?)\}\s*(?=@media|$)/gmi );
        const numMediaBlocks = mediaBlockMatches ? mediaBlockMatches.length : 0;

        const stylesheetBasePath = getDirectoryPath( baseURL );

        let useExternalMedia = !numMediaBlocks && externalMediaSpec; // If no internal @media, but link has media attribute.

        // If no internal media queries are found, but an external media attribute exists,
        // treat the entire stylesheet content as belonging to that media query.
        if( useExternalMedia ){
            // Push the entire CSS content as a single rule block.
            cssRuleBlocks.push( adjustRelativeURLs( cssContent, stylesheetBasePath ) );
            // Treat it as one media block for the loop.
            const mediaQueryDetails = {
                mediaType: externalMediaSpec.match( /(only\s+)?([a-zA-Z]+)(\sand)?/ ) && RegExp.$2,
                ruleIndex: cssRuleBlocks.length - 1,
                minWidth: null, // No min/max parsed from external attribute
                maxWidth: null
            };
            processedRulesets.push( mediaQueryDetails );
        }

        for( let i = 0; i < numMediaBlocks; i++ ){
            const currentMediaBlock = mediaBlockMatches[ i ];
            const blockParts = currentMediaBlock.match( /@media\s+([^\{]+)\{([\S\s]+?)\}/ );

            if ( !blockParts ) continue; // Skip malformed blocks.

            const fullMediaQueryString = blockParts[1].trim();
            const cssRulesInsideBlock  = blockParts[2].trim();

            // Store the CSS rules.
            cssRuleBlocks.push( adjustRelativeURLs( cssRulesInsideBlock, stylesheetBasePath ) );

            // Split complex media queries (e.g., "screen and (min-width: 768px), projection and (max-width: 1024px)")
            const individualQueries = fullMediaQueryString.split( "," );

            for( let j = 0; j < individualQueries.length; j++ ){
                const currentQueryFragment = individualQueries[ j ].trim();

                // Extract media type (e.g., 'screen', 'print')
                const mediaTypeMatch = currentQueryFragment.match( /(only\s+)?([a-zA-Z]+)(\s+and)?/ );
                const mediaType = mediaTypeMatch ? mediaTypeMatch[2] : 'all'; // Default to 'all' if not specified.

                // Extract min-width
                const minWidthMatch = currentQueryFragment.match( /\(min\-width:\s*(\s?[0-9]+(?:\.[0-9]+)?)\s*px\s*\)/ );
                const minWidthValue = minWidthMatch ? parseFloat( minWidthMatch[1] ) : null;

                // Extract max-width
                const maxWidthMatch = currentQueryFragment.match( /\(max\-width:\s*(\s?[0-9]+(?:\.[0-9]+)?)\s*px\s*\)/ );
                const maxWidthValue = maxWidthMatch ? parseFloat( maxWidthMatch[1] ) : null;

                // Store the parsed media query details.
                processedRulesets.push( {
                    mediaType: mediaType,
                    ruleIndex: cssRuleBlocks.length - 1, // Points to the index in cssRuleBlocks
                    minWidth: minWidthValue,
                    maxWidth: maxWidthValue
                } );
            }
        }
        // After parsing all rules, update the active styles on the page.
        activateCurrentStyles();
    };

    let lastUpdateTime, debounceTimer;

    /**
     * Enables or disables style blocks based on the current viewport width and media query conditions.
     * @param {boolean} triggeredByResize - True if this call originated from a window resize event.
     */
    const activateCurrentStyles = function( triggeredByResize ){
        const viewportWidthProperty = "clientWidth";
        // Determine the current viewport width, considering document compatibility mode.
        const currentViewportWidth = documentRef.compatMode === "CSS1Compat" && documentRoot[ viewportWidthProperty ] ||
                                     documentRef.body[ viewportWidthProperty ] ||
                                     documentRoot[ viewportWidthProperty ];

        const activeStyleGroups = {}; // Stores CSS content grouped by media type to be injected.
        const documentFragmentNode = documentRef.createDocumentFragment();
        const referenceLinkNode = styleLinkElements[ styleLinkElements.length - 1 ];
        const currentTimeStamp = (new Date()).getTime();

        // --- Resize Event Debouncing ---
        if( triggeredByResize && lastUpdateTime && (currentTimeStamp - lastUpdateTime) < debounceInterval ){
            clearTimeout( debounceTimer );
            debounceTimer = setTimeout( activateCurrentStyles, debounceInterval );
            return;
        }
        // Update the timestamp for the last successful style application.
        lastUpdateTime = currentTimeStamp;
        // --- End Debouncing ---

        // Iterate through all processed media query rulesets.
        for( let i = 0; i < processedRulesets.length; i++ ){
            const currentRuleSet = processedRulesets[ i ];

            // Check if the current viewport width satisfies the media query conditions.
            const minWidthSatisfied = ( currentRuleSet.minWidth === null || currentViewportWidth >= currentRuleSet.minWidth );
            const maxWidthSatisfied = ( currentRuleSet.maxWidth === null || currentViewportWidth <= currentRuleSet.maxWidth );

            if( minWidthSatisfied && maxWidthSatisfied ){
                // If conditions are met, add the corresponding CSS rules to the active groups.
                const mediaTypeKey = currentRuleSet.mediaType || 'all'; // Use 'all' if no specific type.
                if( !activeStyleGroups[ mediaTypeKey ] ){
                    activeStyleGroups[ mediaTypeKey ] = [];
                }
                activeStyleGroups[ mediaTypeKey ].push( cssRuleBlocks[ currentRuleSet.ruleIndex ] );
            }
        }

        // --- Cleanup Existing Injected Styles ---
        // Remove any <style> elements previously injected by this polyfill.
        for( let i = injectedStyleElements.length - 1; i >= 0; i-- ){
            const elementToRemove = injectedStyleElements[ i ];
            if( elementToRemove && elementToRemove.parentNode === documentHead ){
                documentHead.removeChild( elementToRemove );
            }
            injectedStyleElements.splice( i, 1 ); // Remove from our tracking array.
        }

        // --- Inject New Active Styles ---
        // Create new <style> elements for the currently active media query groups.
        for( const mediaType in activeStyleGroups ){
            if (activeStyleGroups.hasOwnProperty(mediaType)) {
                const newStyleElement = documentRef.createElement( "style" );
                const combinedCSSContent = activeStyleGroups[ mediaType ].join( "\n" );

                newStyleElement.type = "text/css";
                newStyleElement.media = mediaType;

                // Append CSS content as a text node.
                newStyleElement.appendChild( documentRef.createTextNode( combinedCSSContent ) );

                documentFragmentNode.appendChild( newStyleElement );
                injectedStyleElements.push( newStyleElement );
            }
        }

        // Append all new style elements to the DOM in a single operation for performance.
        if ( documentFragmentNode.hasChildNodes() ) {
            documentHead.insertBefore( documentFragmentNode, referenceLinkNode ? referenceLinkNode.nextSibling : null );
        }
    };

    /**
     * Performs an AJAX GET request to fetch resource content.
     * @param {string} resourceURL - The URL of the resource to fetch.
     * @param {function(string): void} onContentReady - Callback function to execute with the fetched content.
     */
    const fetchResourceContent = function( resourceURL, onContentReady ) {
        const httpRequest = getXMLHttpRequestObject();
        if ( !httpRequest ){
            console.error("AJAX: Failed to create XMLHttpRequest object.");
            return;
        }
        httpRequest.open( "GET", resourceURL, true );
        httpRequest.onreadystatechange = function () {
            // Only process when request is complete and successful (status 200 or 304).
            if ( httpRequest.readyState === 4 ) {
                if ( httpRequest.status === 200 || httpRequest.status === 304 ) {
                    onContentReady( httpRequest.responseText );
                } else {
                    console.error(`AJAX: Failed to fetch ${resourceURL}. Status: ${httpRequest.status}`);
                }
            }
        };
        // If the request was already complete (e.g., cached), ensure onreadystatechange is called.
        if ( httpRequest.readyState === 4 ){
            return;
        }
        httpRequest.send();
    };

    /**
     * Factory function to obtain an XMLHttpRequest object, trying various methods for browser compatibility.
     * Caches the successful constructor for subsequent calls.
     * @returns {XMLHttpRequest|ActiveXObject|null} An XHR object or null if none can be created.
     */
    const getXMLHttpRequestObject = (function() {
        let cachedXHRInstance = null; // Stores the successful XHR constructor/object.
        const xhrCreationMethods = [
            function(){ return new globalContext.XMLHttpRequest(); },
            function(){ return new globalContext.ActiveXObject("Msxml2.XMLHTTP"); },
            function(){ return new globalContext.ActiveXObject("Microsoft.XMLHTTP"); }
        ];
        let methodCount = xhrCreationMethods.length;

        // Attempt to create an XHR object using different methods until one succeeds.
        while( methodCount-- ){
            try {
                cachedXHRInstance = xhrCreationMethods[ methodCount ]();
                // If successful, store this method for future calls and break.
                // Note: The original code stored the *instance*, not the constructor.
                // This implies a singleton pattern for XHR, which is unusual.
                // We'll stick to the original intent of caching a working instance if possible,
                // or just the factory function that creates it.
                break;
            }
            catch(e) {
                // Continue to the next method if an error occurs.
                continue;
            }
        }
        // Return a function that will provide the XHR object (either the cached instance or a new one from the cached constructor).
        // This closure ensures we reuse the same successful creation method.
        return function(){
            // If we managed to create an instance, return it. Otherwise, return null.
            // This is a slight deviation from original, which returned the instance itself.
            // For a factory, it should return a *new* instance or the *cached factory function*.
            // Let's refine to return a new instance from the best method found.
            for( let i = 0; i < xhrCreationMethods.length; i++ ) {
                try {
                    return xhrCreationMethods[i]();
                } catch(e) { /* try next */ }
            }
            return null; // Failed to create any XHR object.
        };
    })();


    // --- Initialization & Event Binding ---

    // Perform the initial scan and processing of stylesheets.
    scanStyleLinks();

    // Expose the update function for external scripts to trigger a re-scan and re-application of styles.
    globalContext.styleAdaptr.refresh = scanStyleLinks;

    // Define the resize handler, which debounces calls to activateCurrentStyles.
    const debouncedResizeHandler = function(){
        activateCurrentStyles( true ); // Pass 'true' to indicate it's a resize event.
    };

    // Attach the resize event listener using cross-browser methods.
    if( globalContext.addEventListener ){
        globalContext.addEventListener( "resize", debouncedResizeHandler, false );
    }
    else if( globalContext.attachEvent ){
        globalContext.attachEvent( "onresize", debouncedResizeHandler );
    }

})(
    this, // Pass 'this' as the global context (window in browsers).

    // --- IIFE for Native Media Query Support Detection ---
    (function( runtimeEnv ){

        // Modern browsers with 'window.matchMedia' natively support media queries.
        if( runtimeEnv.matchMedia ){ return true; }

        const currentDocument = document;
        const rootElement = currentDocument.documentElement;
        // Determine the insertion point for our test elements.
        const insertionPoint = rootElement.firstElementChild || rootElement.firstChild;

        // Create a temporary body element to correctly test media queries in older browsers (e.g., Firefox < 4).
        const testContainer = currentDocument.createElement( "body" );
        testContainer.style.cssText = "position:absolute;top:-99999px;left:-99999px;"; // Hide it off-screen.

        // Create a div to apply and measure media query effects.
        const measurementDiv = currentDocument.createElement( "div" );
        measurementDiv.id = "mq-test-unique-id"; // Give it a unique ID for the CSS rule.
        measurementDiv.style.cssText = "position:absolute;top:-99999px;width:0;"; // Initial hidden state.

        // Append the test div to the temporary body, then the body to the document.
        testContainer.appendChild( measurementDiv );
        rootElement.insertBefore( testContainer, insertionPoint );

        // Inject a <style> block directly into the test div.
        // This style will only apply if the media query `only all` is supported.
        const queryCondition = "only all";
        const inlineStyleBlock = currentDocument.createElement('style');
        inlineStyleBlock.media = queryCondition;
        inlineStyleBlock.textContent = `
            @media ${queryCondition} {
                #mq-test-unique-id { width: 9px !important; }
            }
        `;
        measurementDiv.appendChild(inlineStyleBlock);

        // Check if the style has been applied by measuring the div's width.
        const isSupportedCheck = measurementDiv.offsetWidth === 9;

        // Clean up the temporary elements.
        measurementDiv.removeChild( inlineStyleBlock );
        testContainer.removeChild( measurementDiv );
        rootElement.removeChild( testContainer );

        return isSupportedCheck; // Return the result of the support check.

    })( this ) // Pass 'this' (window) to the detection IIFE as well.
);