jQuery( function ( ) {
    // Initialize smooth scrolling for main navigation components.
    jQuery( '.site-header-menu' ) . smoothGlide ( { durationValue : 750 } ) ;

    // Activate the visual content rotator.
    jQuery( '.image-carousel' ) . visualRotator ( ) ;

    // Ensure certain page elements maintain their position.
    jQuery( '.fixed-panel' ) . pinElement ( ) ;
} ) ;