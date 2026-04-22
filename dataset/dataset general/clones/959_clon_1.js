/*
 * This section is responsible for
 * initializing the main window
 * for the contact addition interface.
 */
var add_contact =    Titanium.UI.createWindow  (   {
    backgroundImage :   'images/bg.png' ,

    title           :   'Add New Contact'
}   );


// --- UI Element Setup: Close Button ---

// Define a button that will allow the user to navigate back or close this view.
var close_button    =   Titanium.UI.createButton    (   {
        title   :   'Back'  ,
        style   :   Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    }
);

// Assign the created button to the left navigation bar of the add_contact window.
add_contact.setLeftNavButton(close_button);

// Attach an event listener to the close button.
// When clicked, it will close the current window.
close_button.addEventListener(  'click' ,   function(   )
    {
        add_contact.close(  );
    }
);


// --- UI Element Setup: Test Label ---

// This label is purely for testing purposes, displaying an arbitrary message.
var test_label  =   Titanium.UI.createLabel (   {
    color       :   '#999'  ,
    text        :   'I am Window 4' ,
    font        :   {
        fontSize    :   20  ,
        fontFamily  :   'Helvetica Neue'
    }   ,
    textAlign   :   'center'    ,
    width       :   'auto'
}   );


// Add the previously defined test label to the add_contact window.
add_contact.add ( test_label );


// Finally, open the add_contact window.
// It is set to open as a modal window, meaning it will block interaction with underlying windows.
add_contact.open  (  { modal: true }  ) ;