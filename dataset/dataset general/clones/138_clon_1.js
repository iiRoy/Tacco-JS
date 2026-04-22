/*
 * This file contains AngularJS template caches for message center components.
 * It registers two templates with the $templateCache service.
 */

angular . module ( "template/message-center/message-center.html" , [ ] ) . run ( [ "$templateCache" , function ( $templateCache ) {

    // Store the main message-center template in the cache
    $templateCache . put (
        "template/message-center/message-center.html" ,
        /* HTML content for the message center view */
        '<span>' +
            '<span class="message-center-important">' +
                '<message ng-repeat="message in impMessages" class="message-animation"></message>' +
            '</span>' +
            '<span class="message-center-regular">' +
                '<message ng-repeat="message in messages" class="message-animation"></message>' +
            '</span>' +
        '<span>'
    ) ;

} ] ) ;


/*
 * This block registers the template for an individual message item.
 * It's part of the message center functionality.
 */

angular . module ( "template/message-center/message.html" , [ ] ) . run ( [ "$templateCache" , function ( $templateCache ) {

    // Put the individual message template into the template cache
    $templateCache . put (
        "template/message-center/message.html" ,
        /* HTML content for a single message item */
        '<div class="message-box" ng-class="message.classes">' +
            '<span class="message">{{message.message}}</span>' +
            '<button type="button" class="close" aria-hidden="true" ng-click="removeItem(message)">&times;</button>' +
        '</div>'
    ) ;

} ] ) ;