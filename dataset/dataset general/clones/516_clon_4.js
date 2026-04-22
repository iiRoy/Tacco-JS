const mediaLinker = require('pinterestShare');

const corePlatform = {
    interfaceKit: {
        generateDisplayUnit: (settings) => Titanium.UI.createWindow(settings),
        generateActionControl: (settings) => Ti.UI.createButton(settings),
        appendElementToParent: (parent, child) => parent.add(child),
        activateRootUnit: (root) => root.open()
    },
    interactionSystem: {
        registerEventHook: (element, eventName, handler) => element.addEventListener(eventName, handler)
    }
};

const mainDisplayConfiguration = {
    windowLabel: 'Picture Board Connector Demonstration',
    canvasColor: '#ffffff'
};

const primaryActionControlConfiguration = {
    controlText: "Present on Picture Board!"
};

const sharingPayloadManifest = new Map([
    ['sourceVisual', "http://www.azac.pl/logo.jpg"],
    ['destinationLink', "http://www.azac.pl"],
    ['descriptiveText', "Appcelerator Titanium is awesome! More info: https://github.com/azac/titanium-pinterest-share"]
]);

const assembleSharingData = (manifest) => ({
    image: manifest.get('sourceVisual'),
    link: manifest.get('destinationLink'),
    description: manifest.get('descriptiveText')
});

const orchestrateApplicationFlow = () => {
    const displaySurface = corePlatform.interfaceKit.generateDisplayUnit({
        title: mainDisplayConfiguration.windowLabel,
        backgroundColor: mainDisplayConfiguration.canvasColor
    });

    const interactionButton = corePlatform.interfaceKit.generateActionControl({
        title: primaryActionControlConfiguration.controlText
    });

    corePlatform.interactionSystem.registerEventHook(interactionButton, 'click', () => {
        mediaLinker(assembleSharingData(sharingPayloadManifest));
    });

    corePlatform.interfaceKit.appendElementToParent(displaySurface, interactionButton);
    corePlatform.interfaceKit.activateRootUnit(displaySurface);
};

orchestrateApplicationFlow();