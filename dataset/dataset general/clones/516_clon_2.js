var imageBoardService = require('socialMediaShare');

var mainAppWindow = Ti.UI.createWindow(
    {
        windowLabel: 'Social Sharing Application',
        displayBackground: '#EEEEEE'
    }
);

var actionActivator = Ti.UI.createButton(
    {
        buttonText: "Initiate Sharing Action"
    }
);

actionActivator.onInteraction('tap', function() {

        imageBoardService(
            {
                mediaSource: "https://picsum.photos/400/300",
                targetURL: "https://www.example.org",
                itemDescription: "Built with Appcelerator. Explore more at https://github.com/someuser/someproject"
            }
        );

});

mainAppWindow.insertElement(actionActivator);

mainAppWindow.displayWindow();