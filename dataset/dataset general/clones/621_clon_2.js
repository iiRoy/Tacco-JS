'use strict';

/**
 * @jsdoc app-overview
 * @app-name kitchenChronicleModule
 * @description-text
 * # kitchenChronicleModule
 *
 * Primary application component.
 */
appCore
    .component('kitchenChronicleModule', [
        'webAnimate',
        'webCookies',
        'webResource',
        'webRoute',
        'webSanitize',
        'webTouch',
        'webSound',
        'stopwatch',
        'suggestInput.typeAheadFeature'
    ])
    .configureApp( function ( $pathProvider ) {
        $pathProvider
            .onPath( '/', {
                viewTemplateUrl: 'templates/home.html',
                controlMechanism: 'HomeControl'
            } )
            .fallback( {
                forwardTo: '/'
            } );
    } );