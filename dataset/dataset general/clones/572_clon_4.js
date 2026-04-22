(function(patternToolkit) {

    const drawingSurface = document.querySelector("#canvas");
    const renderingContext = drawingSurface.getContext("2d");
    const viewportWidth = drawingSurface.width = window.innerWidth;
    const viewportHeight = drawingSurface.height = window.innerHeight;

    const assignVisualProperties = (kitInstance) => {
        kitInstance.majorStrokeStyle = "blue";
        kitInstance.minorStrokeStyle = "red";
        kitInstance.thirdStrokeStyle = "green";
        kitInstance.majorFillStyle = "blue";
        kitInstance.minorFillStyle = "red";
    };

    const patternConfigurations = [
        { patternType: 'square', fixedParams: [50, 25, 12.5] },
        { patternType: 'rect', fixedParams: [50, 25] },
        { patternType: 'isometric', fixedParams: [50] },
        { patternType: 'dimetric', fixedParams: [50] },
        { patternType: 'hex', fixedParams: [50] },
        { patternType: 'polar', fixedParams: [20, 20], dynamicCenter: (widthVal, heightVal) => [widthVal / 2, heightVal / 2] },
        { patternType: 'dots', fixedParams: [50, 25] },
        { patternType: 'hexDots', fixedParams: [50] },
        { patternType: 'plus', fixedParams: [10, 50] },
        { patternType: 'celtic', fixedParams: [50] },
        { patternType: 'triangle', fixedParams: [50] },
        { patternType: 'diamond', fixedParams: [50] }
    ];

    const executeAllRenderings = () => {
        const gridColumns = 4;
        const gridRows = 3;
        const cellWidth = viewportWidth / gridColumns;
        const cellHeight = viewportHeight / gridRows;

        const renderingDispatch = {
            'square': patternToolkit.square,
            'rect': patternToolkit.rect,
            'isometric': patternToolkit.isometric,
            'dimetric': patternToolkit.dimetric,
            'hex': patternToolkit.hex,
            'polar': patternToolkit.polar,
            'dots': patternToolkit.dots,
            'hexDots': patternToolkit.hexDots,
            'plus': patternToolkit.plus,
            'celtic': patternToolkit.celtic,
            'triangle': patternToolkit.triangle,
            'diamond': patternToolkit.diamond
        };

        patternConfigurations.forEach((configItem, configurationIndex) => {
            const currentColumnPosition = configurationIndex % gridColumns;
            const currentRowPosition = Math.floor(configurationIndex / gridColumns);
            const currentOffsetX = currentColumnPosition * cellWidth;
            const currentOffsetY = currentRowPosition * cellHeight;

            let parametersToPass = [renderingContext, currentOffsetX, currentOffsetY, cellWidth, cellHeight];
            parametersToPass = parametersToPass.concat(configItem.fixedParams);

            if (configItem.dynamicCenter) {
                parametersToPass = parametersToPass.concat(configItem.dynamicCenter(cellWidth, cellHeight));
            }

            const chosenRenderer = renderingDispatch[configItem.patternType];
            if (chosenRenderer) {
                chosenRenderer.apply(patternToolkit, parametersToPass);
            }
        });
    };

    executeAllRenderings();

})(grid);