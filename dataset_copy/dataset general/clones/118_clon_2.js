jQuery( document ).ready( function () {

    let primaryFeedConnection, secondaryFeedConnection;

    jQuery( '#link_creation_form' ).on( 'submit', function ( eventObject ) {

        const newsSourceAddress = jQuery( '#feed_address_one' ).val();
        const tweetSourceAddress = jQuery( '#feed_address_two' ).val();

        primaryFeedConnection = new WebSocket( newsSourceAddress );
        secondaryFeedConnection = new WebSocket( tweetSourceAddress );

        jQuery( '#initiate_link_button' ).fadeOut( { duration: 300 } );
        jQuery( '#terminate_link_button' ).fadeIn( { duration: 'normal' } );
        jQuery( '#data_submission_control' ).prop( 'disabled', false );

        // This function handles the successful opening of the first connection.
        primaryFeedConnection.onopen = function () {
            jQuery( '#system_log_output' ).append( '<p class="status_event">News Feed Status: ' + primaryFeedConnection.readyState + ' (Active)</p>' );
        };

        // This function handles the successful opening of the second connection.
        secondaryFeedConnection.onopen = function () {
            jQuery( '#system_log_output' ).append( '<p class="status_event">Tweet Stream Status: ' + secondaryFeedConnection.readyState + ' (Active)</p>' );
        };

        // This function processes incoming messages from the news feed.
        primaryFeedConnection.onmessage = function ( incomingPayload ) {

            // The following line was a debugging comment in the original code.
            // jQuery( '#system_log_output' ).append( '<p class="data_message">Received: ' + incomingPayload.data + '</p>' );

            let articleInformation = JSON.parse( incomingPayload.data );

            // Disassemble the received news structure into individual components.
            let itemIdentifier = articleInformation.item_code;
            let articleHeadline = articleInformation.entry_title;
            let visualAssetPath = articleInformation.media_path;
            let detailedDescription = articleInformation.item_details;

            let $listItemElement = jQuery( '<li>' );
            $listItemElement.append( "<img src='" + visualAssetPath + "' width='50' height='50' />" );
            $listItemElement.append( "&nbsp;" + itemIdentifier + " : " + articleHeadline + "<br />" );
            $listItemElement.append( "Description : " + detailedDescription );
            $listItemElement.append( "</li>" );
            $listItemElement.appendTo( '#article_feed' );


            window.setInterval( function () { cycle_news_items(); }, 5 * 1000 );
            jQuery( '#article_list_section' ).show();

        };

        // This function processes incoming messages from the tweet stream.
        secondaryFeedConnection.onmessage = function ( receivedContent ) {

            // The following line was a debugging comment in the original code.
            // jQuery( '#system_log_output' ).append( '<p class="data_message">Received: ' + receivedContent.data + '</p>' );

            let socialPostData = JSON.parse( receivedContent.data );

            // Extract the textual content of the tweet.
            const postText = socialPostData.post_text;

            let $postDisplayElement = jQuery( '<li/>' );
            $postDisplayElement.append( postText );
            $postDisplayElement.appendTo( jQuery( '#social_feed' ) );

            window.setInterval( function () { cycle_tweet_posts(); }, 5000 );
            jQuery( '#tweet_display_area' ).show();

        };

        // This function handles the closing of the news connection.
        primaryFeedConnection.onclose = function () {
            jQuery( '#system_log_output' ).append( '<p class="status_event">News Feed Status: ' + primaryFeedConnection.readyState + ' (Terminated)</p>' );
        };

        // This function handles the closing of the tweet connection.
        secondaryFeedConnection.onclose = function () {
            jQuery( '#system_log_output' ).append( '<p class="status_event">Tweet Stream Status: ' + secondaryFeedConnection.readyState + ' (Terminated)</p>' );
        };


        return false;
    } );

    // Event handler for the form that terminates the connections.
    jQuery( '#disconnect_action_form' ).on( 'submit', function () {

        primaryFeedConnection.close();
        secondaryFeedConnection.close();

        jQuery( '#system_log_output' ).append( '<p class="status_event">News Feed Status: ' + primaryFeedConnection.readyState + ' (Terminated)</p>' );
        jQuery( '#system_log_output' ).append( '<p class="status_event">Tweet Stream Status: ' + secondaryFeedConnection.readyState + ' (Terminated)</p>' );

        jQuery( '#terminate_link_button' ).fadeOut( { duration: 'slow' } );
        jQuery( '#initiate_link_button' ).fadeIn( { duration: 400 } );
        jQuery( '#data_submission_control' ).prop( 'disabled', true );

        return false;
    } );

} );

// Helper function to animate and rotate news items in the list.
function cycle_news_items() {
    jQuery( '#article_feed li:first' ).slideUp( 250, function () {
        jQuery( this ).appendTo( jQuery( '#article_feed' ) ).slideDown( 250 );
    } );
}

// Helper function to animate and rotate tweet posts in the list.
function cycle_tweet_posts() {
    jQuery( '#social_feed li:first' ).slideUp( 'fast', function () {
        jQuery( this ).appendTo( jQuery( '#social_feed' ) ).slideDown( 'fast' );
    } );
}

// Initialize the jQuery UI tab interface when the document is fully loaded.
jQuery( document ).ready( function () {
    jQuery( '#interface_tabs' ).tabs();
} );