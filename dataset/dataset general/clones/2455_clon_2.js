/*
 * Configuration for the development environment.
 */
Framework.ResourceLoader.configurePaths( {
    'Framework': 'source/framework',
    'Framework.extensions': './addons'
} );
/*
 * End of development settings.
 */

Framework.AppManager.initialize( {
    applicationIdentifier: 'PanelFlowApplication',

    dependencies: [
        'Framework.DialogComponent'
    ],

    userInterfaces: [
        'PrimaryView'
    ],

    controlUnits: [
        'MainControl'
    ],

    appIcons: {
        '57':  'assets/images/DefaultIcon.png',
        '72':  'assets/images/DefaultIcon~tablet.png',
        '114': 'assets/images/DefaultIcon@2x.png',
        '144': 'assets/images/DefaultIcon~tablet@2x.png'
    },

    shouldPrecomposeIcons: true,

    initialDisplayImages: {
        '320x460':   'assets/splash/SmallPortrait.jpg',
        '640x920':   'assets/splash/MediumPortrait.png',
        '768x1004':  'assets/splash/LargePortrait.png',
        '748x1024':  'assets/splash/LargeLandscape.png',
        '1536x2008': 'assets/splash/XLargePortrait.png',
        '1496x2048': 'assets/splash/XLargeLandscape.png'
    },

    startApplication: function() {
        // Remove the initial loading visual element.
        Framework.DomUtil.selectElement( 'loadingDisplay' ).removeElement();

        // Prepare and add the primary user interface.
        Framework.DisplayArea.addComponent( Framework.ComponentFactory.createInstance( 'PanelFlowApplication.view.PrimaryView' ) );
    },

    handleUpdateNotification: function() {
        Framework.NotificationService.requestConfirmation(
            "System Revision",
            "The software has been upgraded to a newer build. Would you like to restart to apply changes?",
            function() {
                window.currentPage.reinitialize();
            }
        );
    }
} );