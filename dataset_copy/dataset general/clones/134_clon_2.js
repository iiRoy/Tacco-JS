// This module creates a platform-agnostic picker component.
// It adapts its behavior for iOS (iPhone/iPad) and Android.

module.exports = function ( componentOptions )
{

    // Ensure configuration object is available
    if ( componentOptions === void 0 ) {
        componentOptions = {};
    }

    let chosenIndex = componentOptions.hasOwnProperty( 'initialSelectionIndex' ) ? componentOptions.initialSelectionIndex : 0;

    // Define attributes relevant for iOS-style buttons
    const appleButtonAttributes = [ 'left', 'right', 'top', 'bottom', 'width', 'height' ];

    // Default configuration for the iOS-style display button
    const appleButtonConfig = {
        displayValue    : componentOptions.hasOwnProperty( 'appleButtonLabel' ) ? componentOptions.appleButtonLabel : '',
        dimensionHeight : 40,
        dimensionWidth  : '90%',
        isInteractive   : false,
        frameStyle      : Ti.UI.INPUT_BORDERSTYLE_ROUNDED
    };

    // Integrate user-provided options into button configuration
    for ( const attributeKey in componentOptions ) {
        if ( appleButtonAttributes.includes( attributeKey ) ) {
            appleButtonConfig[ attributeKey ] = componentOptions[ attributeKey ];

            // For non-Android platforms, these properties are handled by the button itself,
            // so remove them from the main picker configuration to avoid conflicts.
            if ( Ti.Platform.getOsname() !== 'android' ) {
                delete componentOptions[ attributeKey ];
            }
        }
    }

    // Adjust top offset for iPhone's status bar/navigation bar
    if ( Ti.Platform.getOsname() === 'iphone' ) {
        componentOptions.top = 44;
    }

    // Initialize the core selection component
    const selectionWidget = Ti.UI.createPicker( componentOptions );
    selectionWidget.addEventListener( 'change', handleSelectionChange );

    // Set the initial selection for Android-specific behavior
    selectionWidget.setSelectedRow( 0, chosenIndex );

    let applePickerWrapper = null;
    let appleDisplayButton = null;

    if ( Ti.Platform.getOsname() === 'iphone' ) {

        // Container view for the picker on iPhone, slides up from bottom
        applePickerWrapper = Ti.UI.createView( {
            dimensionHeight     : 252,
            bottom              : -252,
            zIndex              : 99,
            backgroundColor     : '#FF0000'
        } );

        // Animation for displaying the picker
        const revealAnimation = Ti.UI.createAnimation( {
            bottom : 0
        } );
        // Animation for hiding the picker
        const hideAnimation = Ti.UI.createAnimation( {
            bottom : -252
        } );

        // Event listeners for showing and hiding the picker with animation
        applePickerWrapper.addEventListener( 'slideUp', function () {
            applePickerWrapper.animate( revealAnimation );

            selectionWidget.setSelectedRow( 0, chosenIndex, true );
        } );
        applePickerWrapper.addEventListener( 'slideDown', function () {
            applePickerWrapper.animate( hideAnimation );
        } );

        // Create buttons for the toolbar
        const dismissButton = Ti.UI.createButton( {
            title   : L( 'Abort' ),
            style   : Ti.UI.iPhone.SystemButtonStyle.BORDERED
        } );
        dismissButton.addEventListener( 'click', function () {
            applePickerWrapper.fireEvent( 'slideDown' );
        } );

        const confirmButton = Ti.UI.createButton( {
            title   : L( 'Confirm' ),
            style   : Ti.UI.iPhone.SystemButtonStyle.DONE
        } );
        confirmButton.addEventListener( 'click', handleSelectionChange );
        confirmButton.addEventListener( 'click', function () {
            applePickerWrapper.fireEvent( 'slideDown' );
        } );

        // Create the toolbar itself
        const controlBar = Ti.UI.iOS.createToolbar( {
            top     : 0,
            items   : [
                dismissButton,
                Ti.UI.createButton( { systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE } ),
                confirmButton
            ]
        } );

        applePickerWrapper.add( controlBar );

    } else if ( Ti.Platform.getOsname() === 'ipad' ) {

        // Popover container for iPad
        applePickerWrapper = Ti.UI.iPad.createPopover( {
            dimensionWidth      : 200,
            dimensionHeight     : 200,
            title               : componentOptions.hasOwnProperty( 'popoverTitle' ) ? componentOptions.popoverTitle : 'Select Item',
            arrowDirection      : Ti.UI.iPad.POPOVER_ARROW_DIRECTION_ANY
        } );
    }

    // Logic for all Apple platforms (iPhone, iPad)
    if ( Ti.Platform.getOsname() !== 'android' ) {

        // Attach the selection widget to its wrapper (popover or sliding view)
        applePickerWrapper.add( selectionWidget );

        const rotationMatrix = Ti.UI.create2DMatrix();

        // Create the visible button that triggers the picker
        appleDisplayButton = Ti.UI.createTextField( appleButtonConfig );

        // Handle Right-To-Left (RTL) layout if specified in options
        if ( componentOptions.hasOwnProperty( 'isRightToLeft' ) ) {
            appleDisplayButton.leadingAccessoryButton = Ti.UI.createButton( {
                style       : Ti.UI.iPhone.SystemButton.DISCLOSURE,
                transform   : rotationMatrix.rotate( 90 )
            } );

            appleDisplayButton.alignTextContent( Ti.UI.TEXT_ALIGNMENT_RIGHT );
        } else {
            appleDisplayButton.trailingAccessoryButton = Ti.UI.createButton( {
                style       : Ti.UI.iPhone.SystemButton.DISCLOSURE,
                transform   : rotationMatrix.rotate( 90 )
            } );
        }

        // Event handler for clicking the display button
        appleDisplayButton.addEventListener( 'click', function () {

            if ( Ti.Platform.getOsname() === 'ipad' ) {

                // Show the popover on iPad
                applePickerWrapper.show( {
                    view        : appleDisplayButton,
                    animated    : true
                } );
                selectionWidget.setSelectedRow( 0, chosenIndex, true );
            } else {
                // Trigger slide-up animation on iPhone
                applePickerWrapper.fireEvent( 'slideUp' );
            }
        } );
    }

    // Public method to retrieve the appropriate UI component(s)
    this.retrieveUserInterface = function () {

        if ( Ti.Platform.getOsname() === 'android' ) {
            return selectionWidget;
        } else if ( Ti.Platform.getOsname() === 'iphone' ) {
            return [ appleDisplayButton, applePickerWrapper ];
        } else if ( Ti.Platform.getOsname() === 'ipad' ) {
            return appleDisplayButton;
        }
    };

    // Public method to get the underlying picker component
    this.getSelectionWidget = function () {

        return selectionWidget;
    };

    // Public method to access the iOS-specific wrapper view
    this.getAppleWrapper = function () {

        return applePickerWrapper;
    };

    // Public method to obtain the iOS-style display button
    this.getAppleActionButton = function () {

        return appleDisplayButton;
    };

    // Event handler for when the picker selection changes
    function handleSelectionChange ( eventData ) {

        // On iPhone, this would typically dismiss the picker, but it's commented out in original.
        if ( Ti.Platform.getOsname() === 'iphone' ) {
            // applePickerWrapper.fireEvent( 'slideDown' );
        }

        // Update the display button's value if it exists
        if ( appleDisplayButton ) {

            // Store the selected row index, mainly for iPad popover context
            chosenIndex = eventData.selectedRowIndex;

            // Set the value of the display button using the selected item's label
            appleDisplayButton.setValue( selectionWidget.getSelectedRow( 0 ).updatedLabel );
        }

    }

    return this;
}