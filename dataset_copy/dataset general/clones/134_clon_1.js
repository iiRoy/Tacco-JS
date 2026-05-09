/*
 * This module exports a function that creates and manages a custom picker UI
 * for various platforms, specifically handling iOS-specific UI elements.
 * It encapsulates the logic for displaying a picker and an associated button.
 */

 module.exports  =  function (  prams  ) {

  // Check if the 'prams' object is undefined. If so, initialize it as an empty object.
  // This ensures that subsequent property accesses do not throw errors.
  if ( prams == undefined )
  {
   prams = {}; // Default to an empty object
  }


  /*
   * Determine the initially selected row.
   * If 'selectedRow' property exists in 'prams', use its value.
   * Otherwise, default to 0 (the first row).
   */
  var selectedRow = prams.hasOwnProperty ( 'selectedRow' ) ? prams.selectedRow : 0;


  // Define properties that are relevant for iOS buttons to be merged from 'prams'.
  var iOSBtnProperties = [ 'left', 'right', 'top', 'bottom', 'width', 'height' ];


  // Initialize parameters for the iOS button (TextField acting as a button).
  var iOSBtnPrams = {
   value : prams.hasOwnProperty('iOSButtonTitle') ? prams.iOSButtonTitle : '', // Text displayed on the button
   height : 40,                                                                  // Fixed height for the button
   width : '90%',                                                                // Button width as a percentage
   enabled : false,                                                              // Button is initially disabled
   borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED                                 // Rounded border style
  };


  // Iterate over the input 'prams' object to merge relevant properties into 'iOSBtnPrams'.
  // This loop specifically looks for properties defined in 'iOSBtnProperties'.
  for ( var i in prams )
  {
   if ( iOSBtnProperties.indexOf ( i ) > -1 )
   {
    // If a matching property is found, assign its value from 'prams' to 'iOSBtnPrams'.
    iOSBtnPrams[i] = prams[i];

    // Important: For non-Android platforms, remove these position properties from the main 'prams' object.
    // This is to prevent conflicts or unintended behavior when creating the picker itself,
    // as these properties are specifically for the button and not the picker's initial creation on iOS.
    if ( Ti.Platform.getOsname() !== 'android' )
    {
     delete prams[i]; // Remove the property from the original parameters
    }
   }
  }


  // Adjust the 'top' property for iPhone to account for the status bar and navigation bar.
  // This creates an offset for the picker's position.
  if ( Ti.Platform.getOsname() === 'iphone' )
  {
   prams.top = 44; // Set the top offset for iPhone
  }


  // Create the main picker UI component using the (potentially modified) 'prams'.
  var picker = Ti.UI.createPicker ( prams );

  // Attach an event listener to the picker for the 'change' event.
  // The 'afterSelect' function will be called when the picker's value changes.
  picker.addEventListener ( 'change', afterSelect );


  // Set the initially selected row for the picker.
  // Note: The comment "set selected on android nley" seems to be a typo,
  // it should likely be "only" or similar, but we must keep it as is for Type I.
  picker.setSelectedRow ( 0, selectedRow );


  // Initialize variables for iOS-specific UI components.
  // These will hold the container view for the picker and the button that triggers it.
  var iOSPickerContainer = null;
  var iOSButton          = null; /* This will be the interactive button for iOS */


  // --- Platform-specific UI setup for iOS (iPhone and iPad) ---
  if ( Ti.Platform.getOsname() === 'iphone' )
  {
   // Configuration for the iPhone bottom-slide-up view that holds the picker.
   // This view slides up from the bottom of the screen.
   iOSPickerContainer = Ti.UI.createView ( {
    height          : 252,          // Fixed height of the container
    bottom          : -252,         // Initially hidden below the screen
    zIndex          : 99,           // Ensure it appears above other elements
    backgroundColor : 'red'         // Placeholder background color (can be customized)
   } );


   // Define animations for sliding the picker container up and down.
   var slideUpAnimation = Ti.UI.createAnimation ( {
    bottom : 0                        // Animation target: slide up to visible position
   } );

   var slideDownAnimation = Ti.UI.createAnimation ( {
    bottom : -252                     // Animation target: slide down to hidden position
   } );


   // Event listeners for controlling the slide-up/slide-down animations.
   iOSPickerContainer.addEventListener ( 'slideUp', function ( ) {
    iOSPickerContainer.animate ( slideUpAnimation ); // Execute the slide-up animation

    // When sliding up, ensure the picker's selected row is visually updated.
    picker.setSelectedRow ( 0, selectedRow, true );
   } );

   iOSPickerContainer.addEventListener ( 'slideDown', function ( ) {
    iOSPickerContainer.animate ( slideDownAnimation ); // Execute the slide-down animation
   } );


   // Create toolbar elements for the iPhone picker.
   // This includes 'Cancel' and 'Done' buttons.

   // Cancel Button:
   var cancelBtn = Ti.UI.createButton ( {
    title : L ( 'Cancel' ),                     // Localized 'Cancel' text
    style : Ti.UI.iPhone.SystemButtonStyle.BORDERED // Bordered button style
   } );

   // Event listener for the Cancel button: fires the 'slideDown' event to hide the picker.
   cancelBtn.addEventListener ( 'click', function ( ) {
    iOSPickerContainer.fireEvent ( 'slideDown' );
   } );


   // Done Button:
   var doneBtn = Ti.UI.createButton ( {
    title : L ( 'Done' ),                       // Localized 'Done' text
    style : Ti.UI.iPhone.SystemButtonStyle.DONE // Done button style
   } );

   // Event listeners for the Done button:
   // 1. Calls 'afterSelect' to process the selected value.
   // 2. Fires the 'slideDown' event to hide the picker.
   doneBtn.addEventListener ( 'click', afterSelect );
   doneBtn.addEventListener ( 'click', function ( ) {
    iOSPickerContainer.fireEvent ( 'slideDown' );
   } );


   // Create the iOS toolbar itself, containing the cancel button, a flexible space, and the done button.
   var toolbar = Ti.UI.iOS.createToolbar ( {
    top   : 0, // Position the toolbar at the top of its container
    items : [ cancelBtn, Ti.UI.createButton ( {
     systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE // Spacer between buttons
    } ), doneBtn ] // Array of toolbar items
   } );


   // Add the created toolbar to the iOS picker container.
   iOSPickerContainer.add ( toolbar );

  } /* End of iPhone specific UI setup */
  else if ( Ti.Platform.getOsname() === 'ipad' )
  {
   // Configuration for the iPad popover that holds the picker.
   // Popovers are used on iPad for contextual menus or temporary views.
   iOSPickerContainer = Ti.UI.iPad.createPopover ( {
    width        : 200,                                     // Fixed width of the popover
    height       : 200,                                     // Fixed height of the popover
    title        : prams.hasOwnProperty ( 'title' ) ? prams.title : '', // Title for the popover
    arrowDirection : Ti.UI.iPad.POPOVER_ARROW_DIRECTION_ANY // Allow arrow to point in any direction
   } );
  }


  // --- Common iOS (non-Android) UI setup ---
  // This block applies to both iPhone and iPad.
  if ( Ti.Platform.getOsname() !== 'android' )
  {
   // Add the actual picker component to its designated container (either slide-up view or popover).
   iOSPickerContainer.add ( picker );


   // Create a 2D matrix for transformations, specifically for rotating the disclosure indicator.
   var transform = Ti.UI.create2DMatrix ( );


   // Create the iOS button (which is actually a TextField to show the selected value).
   iOSButton = Ti.UI.createTextField ( iOSBtnPrams );


   // Configure the disclosure indicator button based on 'rtl' (right-to-left) property.
   if ( prams.hasOwnProperty ( 'rtl' ) )
   {
    // If RTL is enabled, place the disclosure button on the left.
    iOSButton.leftButton = Ti.UI.createButton ( {
     style     : Ti.UI.iPhone.SystemButton.DISCLOSURE, // Disclosure style button
     transform : transform.rotate ( 90 )               // Rotate for a common arrow appearance
    } );

    // Adjust text alignment for RTL.
    iOSButton.setTextAlign ( Ti.UI.TEXT_ALIGNMENT_RIGHT );
   }
   else
   {
    // Default (LTR): place the disclosure button on the right.
    iOSButton.rightButton = Ti.UI.createButton ( {
     style     : Ti.UI.iPhone.SystemButton.DISCLOSURE, // Disclosure style button
     transform : transform.rotate ( 90 )               // Rotate for a common arrow appearance
    } );
   }


   // Add a click event listener to the iOS button.
   // This listener will trigger the display of the picker container.
   iOSButton.addEventListener ( 'click', function ( ) {

    // Logic differs based on whether it's an iPad or iPhone.
    if ( Ti.Platform.getOsname() === 'ipad' )
    {
     // For iPad, show the popover anchored to the button.
     iOSPickerContainer.show ( {
      view     : iOSButton, // Anchor the popover to this button
      animated : true       // Show with animation
     } );
     // Ensure the picker's selected row is updated when the popover appears.
     picker.setSelectedRow ( 0, selectedRow, true );
    }
    else
    {
     // For iPhone, fire the 'slideUp' event on the container.
     iOSPickerContainer.fireEvent ( 'slideUp' );
    }
   } ); // End of iOSButton click event listener
  }


  // --- Public methods exposed by this module ---

  /**
   * Returns the primary UI component(s) for the current platform.
   * This allows external code to add the picker to a view hierarchy.
   */
  this.getUI = function ( ) {

   if ( Ti.Platform.getOsname() === 'android' )
   {
    return picker; // Android directly uses the picker
   }
   else if ( Ti.Platform.getOsname() === 'iphone' )
   {
    // iPhone returns both the button and its associated container.
    return [ iOSButton, iOSPickerContainer ];
   }
   else if ( Ti.Platform.getOsname() === 'ipad' )
   {
    return iOSButton; // iPad returns just the button (popover is managed internally)
   }
  };


  /**
   * Provides direct access to the underlying Ti.UI.Picker object.
   * Useful for programmatic control or listening to additional events.
   */
  this.getPicker = function ( ) {

   return picker;
  };


  /**
   * Retrieves the iOS-specific container view for the picker.
   * This is either a sliding view (iPhone) or a popover (iPad).
   */
  this.getiOSPickerContainer = function ( ) {

   return iOSPickerContainer;
  };


  /**
   * Gets the iOS button (actually a TextField) that triggers the picker.
   * This button displays the currently selected value.
   */
  this.getiOSButton = function ( ) {

   return iOSButton;
  };


  // --- Private helper function for handling picker selection ---
  /**
   * Event handler for when the picker's value changes or the 'Done' button is clicked.
   * Updates the selected row and the display value on the iOS button.
   * @param {Object} e - The event object from the picker's 'change' event or button click.
   */
  function afterSelect ( e ) {

   // On iPhone, if this function is called, it might typically hide the picker.
   // The original code commented this out, so we keep it commented.
   // if ( Ti.Platform.getOsname() === 'iphone' ) {
   //     iOSPickerContainer.fireEvent('slideDown');
   // }

   // If an iOS button exists, update its displayed value.
   if ( iOSButton )
   {
    // Update the 'selectedRow' variable with the newly selected row index.
    // This is primarily for iPad where the popover remains open until dismissed.
    selectedRow = e.rowIndex;

    // Set the value of the iOS button (TextField) to the 'changedName' property
    // of the currently selected row in the picker.
    // The commented line shows an alternative, but we stick to the original logic.
    // iOSButton.setValue(e.row.changedName);
    iOSButton.setValue ( picker.getSelectedRow ( 0 ).changedName );
   }

  }


  // Return the 'this' context, allowing method chaining or direct access to public methods.
  return this;
 }