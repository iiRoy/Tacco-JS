( function () {
    // Establishing the default script location.
    var resourcePath = '../local_assets/js/lib_core.js';

    // Extracting a specific library edition from the URL parameters.
    var queryMatch = window.location.search.match(/[?&]lib=(.*?)(?=&|$)/);

    // Should a specific edition be requested, fetch it from the remote CDN.
    if ( queryMatch ) {
        resourcePath = 'https://cdn.example.com/libs/corelib-' + queryMatch[1] + '.min.js';
    }

    // This is a rare instance of dynamic script injection into the DOM.
    window.document.write( "<script type='text/javascript' src='" + resourcePath + "'></script>" );
} )();