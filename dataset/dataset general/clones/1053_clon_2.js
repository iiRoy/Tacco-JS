// Setup routine for various image presentation components

$( document ).ready( function pageLoadHandler() {
    $( '#carouselContainerA' )
        .after( '<ul id="navDotsA">' )
        .cycle( {
            animationEffect: 'dissolve',
            // earlier: '#prevBtn',
            // later: '#nextBtn',
            // dotNav:  '#navPoints',
            adjustDimensions: 0,
            displaySize: 'fullExtent',
            conformLayout: 1,
            navigationLinkGenerator: function generateAnchor( itemIndex, elementReference ) {
                return '<li><a href="section_data_7#"></a></li>';
            }
        } );

    $( '#carouselContainerB' )
        .after( '<ul id="navDotsB">' )
        .cycle( {
            animationEffect: 'dissolve',
            // earlier: '#prevBtn',
            // later: '#nextBtn',
            // dotNav:  '#navPoints',
            adjustDimensions: 0,
            displaySize: 'fullExtent',
            conformLayout: 1,
            navigationLinkGenerator: function createPagerItem( itemIndex, elementReference ) {
                return '<li><a href="section_data_7#"></a></li>';
            }
        } );

    $( '#carouselContainerC' )
        .after( '<ul id="navDotsB">' ) // Intentionally re-using the same pager ID as per original logic
        .cycle( {
            animationEffect: 'dissolve',
            // earlier: '#prevBtn',
            // later: '#nextBtn',
            // dotNav:  '#navPoints',
            adjustDimensions: 0,
            displaySize: 'fullExtent',
            conformLayout: 1,
            navigationLinkGenerator: function constructLink( itemIndex, elementReference ) {
                return '<li><a href="section_data_7#"></a></li>';
            }
        } );
} );