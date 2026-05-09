const waveGenerator = require("/lib/Ti.RippleEffect");

const containerScreen = Ti.UI.createWindow({
    backgroundColor: "#000000"
});

const visualComponentConfigurations = [
    { identifier: "alpha", dimensions: { width: 320, height: 150 }, colorCode: "red", placement: { top: 0, left: 0 } },
    { identifier: "beta", dimensions: { width: 160, height: 150 }, colorCode: "blue", placement: { top: 150, left: 0 } },
    { identifier: "gamma", dimensions: { width: 160, height: 150 }, colorCode: "green", placement: { top: 150, right: 0 } },
    { identifier: "delta", dimensions: { width: 320, height: 150 }, colorCode: "purple", placement: { top: 300, left: 0 } }
];

const interactiveElements = visualComponentConfigurations.map(dataPoint => {
    const currentElement = Ti.UI.createView({
        width: dataPoint.dimensions.width,
        height: dataPoint.dimensions.height,
        backgroundColor: dataPoint.colorCode,
        ...dataPoint.placement
    });

    currentElement.addEventListener("click", (interactionEvent) => {
        waveGenerator.create(interactionEvent);
    });

    return currentElement;
});

interactiveElements.forEach(elementUnit => containerScreen.add(elementUnit));

containerScreen.open();