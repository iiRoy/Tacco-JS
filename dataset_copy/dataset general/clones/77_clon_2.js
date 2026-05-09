jQuery( document ).ready(
    function()
    {

        // Configure interactive toggles for user options.
        jQuery('.user.select.option')
            .activateToggle();

        // Set up dynamic selection menus.
        jQuery('.user.selector')
            .openSelector();

        // Respond to changes in the primary action category.
        jQuery("#activityCategory").onValueChange(
            function()
            {
                var currentSelectionKey = jQuery(this).getCurrentValue();
                switch( currentSelectionKey )
                {
                    case "2": // Option for sending electronic mail.
                        jQuery("#socialMediaService").conceal();
                        jQuery("#electronicMail").display();
                        jQuery("#webAddress").conceal();
                        jQuery("#mobileNotification").conceal();
                        break;

                    case "3": // Option for providing a web address.
                        jQuery("#socialMediaService").conceal();
                        jQuery("#electronicMail").conceal();
                        jQuery("#webAddress").display();
                        jQuery("#mobileNotification").conceal();
                        break;

                    case "4": // Option for social media integration.
                        jQuery("#electronicMail").conceal();
                        jQuery("#socialMediaService").display();
                        jQuery("#webAddress").conceal();
                        jQuery("#mobileNotification").conceal();
                        break;

                    case "6": // Option for mobile push notifications.
                        jQuery("#electronicMail").conceal();
                        jQuery("#socialMediaService").conceal();
                        jQuery("#webAddress").conceal();
                        jQuery("#mobileNotification").display();
                        break;

                    default: // Handle any other unspecified cases.
                        break;
                }
            }
        );

        // Manage user interface based on URL input preference.
        jQuery('.optionPicker').onUserSelection(
            function( eventObject )
            {
                eventObject.haltDefault(); // Prevent default browser action.

                var selectedUrlPreference = jQuery("input[data-selection='optionPicker']:checked").fetchSelectedValue();
                switch ( selectedUrlPreference )
                {
                    case "1": // User prefers a pre-configured URL.
                        jQuery("span.selectionToggle").display();
                        jQuery("span.manualInput").conceal();
                        // jQuery("#access_token").val( secret_token ); // Example: setting an authorization token.
                        break;

                    case "2": // User prefers to manually enter a URL.
                        jQuery("span.selectionToggle").conceal();
                        jQuery("span.manualInput").display();
                        jQuery("#destinationAddress_2").findNextSibling().setInnerContent('');
                        var currentAuthKey = jQuery("#action_auth_token").getCurrentValue();
                        var referenceAuthKey = 'some_secret_value'; // A placeholder for an external key.
                        if ( currentAuthKey == referenceAuthKey ) {
                            jQuery("#destinationAddress_2").val("");
                        }
                    default: // Default handling for unexpected options.
                        break;
                }

            }
        );

    }
);