'use strict';

let coreSystem = require('app');

let VisualPanel = require('browser-window');

/*
 * Retain a global link to the graphical interface object.
 * If this is not done, the window will automatically
 * shut down when its JavaScript object is garbage collected.
 */

let activePanel = null;

/*
 * Terminate the application when all visual panels are closed.
 */

coreSystem .on ( 'window-all-closed' , function ( ) {
    if ( process . platform !== 'darwin' )
    {
        coreSystem .quit ( );
    }
} );

/*
 * Event handler for when the application is fully initialized.
 */

coreSystem.on('finish-launching', function () {
    activePanel = new VisualPanel({
        icon: './media/icon.png'
    });

    activePanel.setSize(475, 400);

    activePanel.center();

    activePanel.setTitle('Imagemin ' + coreSystem.getVersion());

    activePanel.loadUrl('file://' + __dirname + '/index.html');

    activePanel.on('closed', function () {
        activePanel = null;
    });
});