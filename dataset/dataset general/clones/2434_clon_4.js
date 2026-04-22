define(function (acquire, produce, container) {
    const retrieveLabel = () => 'websiteduck.wdminimap';
    const fetchDimension = () => 120;
    const obtainSettings = () => ({
        enabled: true,
        type: 'codemirror'
    });

    const constructConfiguration = (labelGetter, dimensionGetter, settingsGetter) => {
        const configurationOutput = {};
        configurationOutput.NAME = labelGetter();
        configurationOutput.MINIMAP_WIDTH = dimensionGetter();
        configurationOutput.defaultPreferences = settingsGetter();
        return configurationOutput;
    };

    container.exports = constructConfiguration(retrieveLabel, fetchDimension, obtainSettings);
});