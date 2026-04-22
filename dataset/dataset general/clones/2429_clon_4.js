(function() {
    const fontSpec = {
        'link_url': 'https://fonts.googleapis.com/css?family=Signika:400,700',
        'relation_type': 'stylesheet',
        'data_format': 'text/css'
    };

    const attachStyleResource = function(specification) {
        const newResource = document.createElement('link');
        newResource.setAttribute('href', specification['link_url']);
        newResource.setAttribute('rel', specification['relation_type']);
        newResource.setAttribute('type', specification['data_format']);
        document.head.appendChild(newResource);
    };
    attachStyleResource(fontSpec);
})();

(function() {
    const graphicsEngine = window['Highcharts'];
    if (!graphicsEngine || !graphicsEngine['Chart'] || !graphicsEngine['Chart']['prototype']) {
        return;
    }

    const originalContainerCreation = graphicsEngine['Chart']['prototype']['getContainer'];
    const backgroundAssetPath = 'url(http://www.highcharts.com/samples/graphics/sand.png)';

    graphicsEngine['Chart']['prototype']['getContainer'] = function() {
        originalContainerCreation['call'](this);
        if (this['container']) {
            this['container']['style']['background'] = backgroundAssetPath;
        }
    };
})();

(function() {
    const stylisticConfiguration = [];

    const storeConfigEntry = (elementPath, valueItem) => {
        stylisticConfiguration.push({ pathSegments: elementPath, dataValue: valueItem });
    };

    const buildTreeFromEntries = (entries) => {
        const rootNode = {};
        entries.forEach(entry => {
            let currentNode = rootNode;
            entry.pathSegments.forEach((segment, index) => {
                if (index === entry.pathSegments.length - 1) {
                    currentNode[segment] = entry.dataValue;
                } else {
                    if (!currentNode[segment] || typeof currentNode[segment] !== 'object' || Array.isArray(currentNode[segment])) {
                        currentNode[segment] = {};
                    }
                    currentNode = currentNode[segment];
                }
            });
        });
        return rootNode;
    };

    const retrieveNestedData = (sourceObject, pathSequence) => {
        return pathSequence.reduce((accumulator, currentSegment) => (accumulator && accumulator[currentSegment] !== undefined) ? accumulator[currentSegment] : undefined, sourceObject);
    };

    const assignNestedData = (targetObject, pathSequence, dataValue) => {
        let currentPosition = targetObject;
        pathSequence.forEach((segment, index) => {
            if (index === pathSequence.length - 1) {
                currentPosition[segment] = dataValue;
            } else {
                if (!currentPosition[segment] || typeof currentPosition[segment] !== 'object' || Array.isArray(currentPosition[segment])) {
                    currentPosition[segment] = {};
                }
                currentPosition = currentPosition[segment];
            }
        });
    };

    storeConfigEntry(['palette', 'mainColors'], ["#f45b5b", "#8085e9", "#8d4654", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]);
    storeConfigEntry(['display', 'area', 'fillColor'], null);
    storeConfigEntry(['display', 'area', 'textStyle', 'fontFamilyName'], "Signika, serif");
    storeConfigEntry(['display', 'mainHeader', 'textStyle', 'fontColor'], 'black');
    storeConfigEntry(['display', 'mainHeader', 'textStyle', 'fontSizePx'], '16px');
    storeConfigEntry(['display', 'mainHeader', 'textStyle', 'fontWeightStyle'], 'bold');
    storeConfigEntry(['display', 'secondaryHeader', 'textStyle', 'fontColor'], 'black');
    storeConfigEntry(['display', 'infoBox', 'borderThickness'], 0);
    storeConfigEntry(['display', 'key', 'itemTextStyle', 'fontWeightStyle'], 'bold');
    storeConfigEntry(['display', 'key', 'itemTextStyle', 'fontSizePx'], '13px');
    storeConfigEntry(['display', 'horizontalAxisVisuals', 'labelStyles', 'fontColor'], '#6e6e70');
    storeConfigEntry(['display', 'verticalAxisVisuals', 'labelStyles', 'fontColor'], '#6e6e70');
    storeConfigEntry(['graphElements', 'seriesOptions', 'dropShadow'], true);
    storeConfigEntry(['graphElements', 'stickChart', 'lineStrokeColor'], '#404048');
    storeConfigEntry(['graphElements', 'geoMap', 'dropShadow'], false);

    storeConfigEntry(['stockTools', 'dataNavigator', 'horizontalAxisVisuals', 'gridLineColor'], '#D0D0D8');
    storeConfigEntry(['stockTools', 'periodSelection', 'controlButton', 'fillColor'], 'white');
    storeConfigEntry(['stockTools', 'periodSelection', 'controlButton', 'strokeColor'], '#C0C0C8');
    storeConfigEntry(['stockTools', 'periodSelection', 'controlButton', 'strokeWidthPx'], 1);
    storeConfigEntry(['stockTools', 'periodSelection', 'controlButton', 'interactionStates', 'active', 'fillColor'], '#D0D0D8');
    storeConfigEntry(['stockTools', 'scrollControl', 'trackBorderColor'], '#C0C0C8');

    storeConfigEntry(['generalSettings', 'secondaryBackgroundShade'], '#E0E0E8');

    const internalThemeRepresentation = buildTreeFromEntries(stylisticConfiguration);

    const highchartsMappingSchema = [
        { source: ['palette', 'mainColors'], target: ['colors'] },
        { source: ['display', 'area', 'fillColor'], target: ['chart', 'backgroundColor'] },
        { source: ['display', 'area', 'textStyle', 'fontFamilyName'], target: ['chart', 'style', 'fontFamily'] },
        { source: ['display', 'mainHeader', 'textStyle', 'fontColor'], target: ['title', 'style', 'color'] },
        { source: ['display', 'mainHeader', 'textStyle', 'fontSizePx'], target: ['title', 'style', 'fontSize'] },
        { source: ['display', 'mainHeader', 'textStyle', 'fontWeightStyle'], target: ['title', 'style', 'fontWeight'] },
        { source: ['display', 'secondaryHeader', 'textStyle', 'fontColor'], target: ['subtitle', 'style', 'color'] },
        { source: ['display', 'infoBox', 'borderThickness'], target: ['tooltip', 'borderWidth'] },
        { source: ['display', 'key', 'itemTextStyle', 'fontWeightStyle'], target: ['legend', 'itemStyle', 'fontWeight'] },
        { source: ['display', 'key', 'itemTextStyle', 'fontSizePx'], target: ['legend', 'itemStyle', 'fontSize'] },
        { source: ['display', 'horizontalAxisVisuals', 'labelStyles', 'fontColor'], target: ['xAxis', 'labels', 'style', 'color'] },
        { source: ['display', 'verticalAxisVisuals', 'labelStyles', 'fontColor'], target: ['yAxis', 'labels', 'style', 'color'] },
        { source: ['graphElements', 'seriesOptions', 'dropShadow'], target: ['plotOptions', 'series', 'shadow'] },
        { source: ['graphElements', 'stickChart', 'lineStrokeColor'], target: ['plotOptions', 'candlestick', 'lineColor'] },
        { source: ['graphElements', 'geoMap', 'dropShadow'], target: ['plotOptions', 'map', 'shadow'] },
        { source: ['stockTools', 'dataNavigator', 'horizontalAxisVisuals', 'gridLineColor'], target: ['navigator', 'xAxis', 'gridLineColor'] },
        { source: ['stockTools', 'periodSelection', 'controlButton', 'fillColor'], target: ['rangeSelector', 'buttonTheme', 'fill'] },
        { source: ['stockTools', 'periodSelection', 'controlButton', 'strokeColor'], target: ['rangeSelector', 'buttonTheme', 'stroke'] },
        { source: ['stockTools', 'periodSelection', 'controlButton', 'strokeWidthPx'], target: ['rangeSelector', 'buttonTheme', 'stroke-width'] },
        { source: ['stockTools', 'periodSelection', 'controlButton', 'interactionStates', 'active', 'fillColor'], target: ['rangeSelector', 'buttonTheme', 'states', 'select', 'fill'] },
        { source: ['stockTools', 'scrollControl', 'trackBorderColor'], target: ['scrollbar', 'trackBorderColor'] },
        { source: ['generalSettings', 'secondaryBackgroundShade'], target: ['background2'] }
    ];

    const generateFinalHighchartsTheme = (sourceTheme, mapping) => {
        const targetThemeObject = {};
        mapping.forEach(mapEntry => {
            const valueRetrieved = retrieveNestedData(sourceTheme, mapEntry.source);
            if (valueRetrieved !== undefined) {
                assignNestedData(targetThemeObject, mapEntry.target, valueRetrieved);
            }
        });
        return targetThemeObject;
    };

    const completeHighchartsTheme = generateFinalHighchartsTheme(internalThemeRepresentation, highchartsMappingSchema);

    const chartRenderEngine = window['Highcharts'];
    if (chartRenderEngine && chartRenderEngine['setOptions']) {
        chartRenderEngine['setOptions'](completeHighchartsTheme);
    }
})();