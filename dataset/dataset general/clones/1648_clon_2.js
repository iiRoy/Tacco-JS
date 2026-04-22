jQuery(function() {

    // Retrieve references to primary user interface elements.
    var creationInitiator = jQuery('#create-app-btn'),
        appNameInputArea = jQuery('.app-name-input-area');


    // Execute a preliminary check for the presence of the necessary runtime environment.
    verifyRuntimeEnv(function () {
        jQuery('#intro-display').hide();
        jQuery('#no-runtime-view').show();
        jQuery('#notification-zone').append('<span class="warning-alert error-type"><i class="fas fa-exclamation-circle"></i> Runtime environment not detected in system applications.</span>');
    });

    // Assign a click handler to the button that facilitates downloading the runtime.
    jQuery('#get-runtime-btn').on('click', function() {
        var runtimeInterface = require('nw.gui'); // Acquire the Node-WebKit GUI module.
        runtimeInterface.Shell.openExternal('https://github.com/rogerwang/node-webkit'); // Launch the external URL in the default browser.
    });


    // When the 'initiate application creation' button is clicked, reveal the naming input field.
    creationInitiator.on('click', function() {
        appNameInputArea.fadeIn(320); // Animate the display of the input section.
        appNameInputArea.find('input').focus(); // Set keyboard focus to the text input.
    });

    // Manage clicks on the close button within the new application interface.
    creationInitiator.find('.dismiss-btn').on('click', function(eventObject) {
        hideAppNameInput(); // Invoke the routine to conceal the input area.
        eventObject.stopPropagation(); // Halt event propagation to parent elements.
    });

    // A helper method designed to hide the application naming input dialog.
    function hideAppNameInput () {
        appNameInputArea.fadeOut(320, function () { // Fade out the input container element.
            jQuery(this).find('input').val(''); // Clear the value of the input field.
        });
    }


    // Create an instance of the directory selection dialog for new application setup.
    var AppCreationPathPicker = new directorySelector('#create-app-dialog');


    // Monitor for key presses within the application name text field.
    creationInitiator.find('input').on('keydown', function(eventObject) {
        var eventKeycode = eventObject.charCode ? eventObject.charCode : eventObject.keyCode ? eventObject.keyCode : 0;
        if(eventKeycode === 13) { // Detect if the 'Enter' key was pressed.
            creationInitiator.find('.confirm-btn').trigger('click'); // Programmatically trigger a click on the confirmation button.
            eventObject.preventDefault(); // Prevent the default action associated with the Enter key.
        }
    });

    // Define the action to be taken upon clicking the 'confirm application name' button.
    creationInitiator.find('.confirm-btn').on('click', function (eventObject) {

        // Check if the application name field is empty.
        if ( !creationInitiator.find('input').val() ) {
            displayAlertMsg('issue', 'Application title cannot be left blank!');
            return;
        }

        // Validate the characters used in the application name.
        if ( !/^[A-Za-z0-9 _-]+$/.test(creationInitiator.find('input').val()) ){
            displayAlertMsg('issue', 'Application title may only contain: alphanumeric characters, spaces, underscores, and hyphens.');
            return;
        }

        // Open the directory selection dialog for the user to specify the application's location.
        AppCreationPathPicker.open(function (selectedPath) {

            var appDataObj = require('./js/models.js').project; // Load the application's data model.

            // Assign the user-defined name and construct the full path for the application.
            appDataObj.name = creationInitiator.find('input').val();
            appDataObj.path = selectedPath + '/' + appDataObj.name + '/';

            // Initiate the creation of the new application.
            initiateNewApplication(function() {

                // On successful application creation, show a positive feedback message.
                displayAlertMsg('success', 'Excellent! ' + appDataObj.name + ' is now prepared...');

                // If all prerequisites are met, open the newly created application.
                accessApplication(appDataObj.path);

            }, function (errorInfo) {
                // If the target folder already exists or another error occurs, display an error.
                displayAlertMsg('issue', errorInfo);
            });
            
        });
        eventObject.stopPropagation(); // Prevent the event from propagating further up the DOM tree.
    });


    // Configure the 'load application' button to function as a drag-and-drop target.
    enableDropTarget('load-app-btn', function (selectedPath) {
        accessApplication(selectedPath); // Open the application located at the dropped path.
    });

    // Initialize a new dialog specifically for opening existing application folders.
    var AppLoadPathPicker = new directorySelector('#load-app-dialog');

    // Attach a click event listener to the 'open existing application' button.
    jQuery('#load-app-btn').on('click', function() {
        AppLoadPathPicker.open(function (selectedPath) {
            accessApplication(selectedPath); // Use the chosen path to load the application.
        });
    });
    
    // This function handles the process of opening and displaying an application.
    function accessApplication(selectedPath) {

        // Begin loading the application's configuration and data.
        retrieveApplication( selectedPath, function() {

            // If the application data is successfully loaded, transition the UI.
            jQuery('#intro-display').fadeOut(280, function() {

                // Ensure the application naming input is concealed if it was visible.
                hideAppNameInput();

                // Animate the header's padding to a more compact size.
                jQuery('header').animate({padding : '22px'}, 280, function () {

                    // Update the displayed application title in the header.
                    jQuery('.app-headline').text(require('./js/models.js').project.name);

                    // Reveal the main development interface.
                    jQuery('#develop-view').fadeIn(280);

                    // Re-enable the button that allows opening the last accessed application.
                    jQuery('#reopen-last-app-btn').removeAttr('disabled');

                });

            });

        }, function (errorInfo) {
            // In case of an error during configuration file reading, display an alert.
            displayAlertMsg('issue', errorInfo);
        });

    }

    // Set up a click event handler for the 'compile application' button.
    jQuery('#compile-app-btn').on('click', function() {
        
        jQuery(this).attr('disabled', 'disabled'); // Disable the button to prevent repeated clicks during compilation.

        // Store the current icon class and replace it with a spinning indicator.
        var originalIconClass = jQuery('#compile-app-btn i').attr('class');
        jQuery('#compile-app-btn i').removeClass().addClass('fa fa-sync fa-spin');

        // Initiate the application compilation process.
        compileApplication(function() {
            jQuery('#compile-app-btn i').removeClass().addClass(originalIconClass); // Restore the original button icon.
            jQuery('#compile-app-btn').removeAttr('disabled'); // Re-enable the compilation button.
            displayAlertMsg('success', '<i class="fas fa-check-circle"></i> Your application was built successfully!');
            var sndEffect = jQuery('#snd-effect')[0]; // Reference the audio element.
            sndEffect.src = process.cwd() + '/confirmation_sound.wav'; // Set the path for the success sound.
            sndEffect.play(); // Play the success sound.
        },function (errorInfo) {
            displayAlertMsg('issue', errorInfo); // Display any errors encountered during compilation.
            jQuery('#compile-app-btn').removeAttr('disabled'); // Re-enable the button regardless of compilation success or failure.
        },
        jQuery('#minify-opt .toggle-switch').hasClass('active')); // Pass the state of the minification option.

    });

    // Bind the 'launch application' button to its designated execution function.
    jQuery('#launch-app-btn').on('click', executeApplication);

    // Attach a click event to the 'modify application settings' icon.
    jQuery('.modify-app-icon').on('click', function() {
        modifyApplication(); // Execute the function to edit application properties.
    });

    // Handle the closing of the currently active application view.
    jQuery('#develop-view .dismiss-btn').on('click', function() {

        jQuery('#develop-view').fadeOut(280, function () { // Fade out the application development screen.
            jQuery('header').animate({padding : '52px'}, 280, function () { // Restore the header's original padding.
                jQuery('#intro-display').fadeIn(280); // Bring back the main introductory screen.
            });
        });

    });

    // Implement a toggle mechanism for custom checkbox-like interface elements.
    jQuery('.toggle-option-box').on('click', function() {
        jQuery(this).find('.toggle-switch').toggleClass('active'); // Add or remove the 'active' class.
    });

    // Define the action for displaying the application's folder in the system's file explorer.
    jQuery('.reveal-in-explorer-icon').on('click', function() {
        showInSystemExplorer(require('./js/models.js').project.path); // Open the application's directory.
    });

    // Check if there's a record of the last accessed application path in local storage.
    if ( !localStorage.last_accessed_path ){
        jQuery('#reopen-last-app-btn').attr('disabled', 'disabled'); // If no path is stored, disable the button.
    }

    // Set up a click event for the button to reopen the last accessed application.
    jQuery('#reopen-last-app-btn').on('click', function() {
        accessApplication(localStorage.last_accessed_path); // Load the application from the saved path.
    });

});