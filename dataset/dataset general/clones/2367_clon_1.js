/*
 * File: ApplicationTabGroup.js
 * Description: This module defines the main application tab group structure.
 * It initializes various tabs and their corresponding windows,
 * and applies a custom style.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function ApplicationTabGroup( )
{
    // Declare a variable for the style module.
    var StyleJS
    ;

    // Load the custom style module for iOS handheld devices.
    StyleJS = require ( 'ui/handheld/Style4iOS' ) ;

    // Create the main tab group instance.
    var self = Ti.UI.createTabGroup ( ) ;

    // Apply the predefined style to the newly created tab group.
    StyleJS.setTabGroupStyle ( self ) ;


    /*
     * Require all individual tab window modules.
     * These modules define the content for each tab.
     */
    var Tab1Window = require ( 'ui/handheld/Tab1Window' ) ;
    var Tab2Window = require ( 'ui/handheld/Tab2Window' ) ;
    var Tab3Window = require ( 'ui/handheld/Tab3Window' ) ;
    var Tab4Window = require ( 'ui/handheld/Tab4Window' ) ;
    var Tab5Window = require ( 'ui/handheld/Tab5Window' ) ;


    // Instantiate each tab window, passing a localized string for its title.
    var win1 = new Tab1Window ( L ( 'tab1' ) ) ;
    var win2 = new Tab2Window ( L ( 'tab2' ) ) ;
    var win3 = new Tab3Window ( L ( 'tab3' ) ) ;
    var win4 = new Tab4Window ( L ( 'tab4' ) ) ;
    var win5 = new Tab5Window ( L ( 'tab5' ) ) ;


    // Create the first tab.
    var tab1 = Ti.UI.createTab ( {
        activeIcon : 'images/tab1ica.png' , // Icon when the tab is active.
        icon : '/images/tab1ic.png' ,       // Icon when the tab is inactive.
        window : win1                       // The window associated with this tab.
    } ) ;
    // Link the window back to its containing tab.
    win1.containingTab = tab1 ;


    // Create the second tab.
    var tab2 = Ti.UI.createTab ( {
        activeIcon : 'images/tab2ica.png' ,
        icon : '/images/tab2ic.png' ,
        window : win2
    } ) ;
    win2.containingTab = tab2 ;


    // Create the third tab.
    var tab3 = Ti.UI.createTab ( {
        activeIcon : 'images/tab3ica.png' ,
        icon : '/images/tab3ic.png' ,
        window : win3
    } ) ;
    win3.containingTab = tab3 ;


    // Create the fourth tab.
    var tab4 = Ti.UI.createTab ( {
        activeIcon : 'images/tab4ica.png' ,
        icon : '/images/tab4ic.png' ,
        window : win4
    } ) ;
    win4.containingTab = tab4 ;


    // Create the fifth tab.
    var tab5 = Ti.UI.createTab ( {
        activeIcon : 'images/tab5ica.png' ,
        icon : '/images/tab5ic.png' ,
        window : win5
    } ) ;
    win5.containingTab = tab5 ;


    // Add all the created tabs to the main tab group.
    self.addTab ( tab1 ) ;
    self.addTab ( tab2 ) ;
    self.addTab ( tab3 ) ;
    self.addTab ( tab4 ) ;
    self.addTab ( tab5 ) ;

    // Return the configured tab group.
    return self ;
}
;

// Export the ApplicationTabGroup function to be used by other modules.
module.exports = ApplicationTabGroup ;