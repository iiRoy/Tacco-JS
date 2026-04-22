function buildNestedConfiguration(descriptorSegments) {
    const resultingConfiguration = {};

    for (const segment of descriptorSegments) {
        const identifier = segment[0];
        const valueComponent = segment[1];

        if (Array.isArray(valueComponent) && valueComponent.length > 0 && Array.isArray(valueComponent[0]) && valueComponent[0].length >= 1 && typeof valueComponent[0][0] === 'string') {
            resultingConfiguration[identifier] = buildNestedConfiguration(valueComponent);
        } else {
            resultingConfiguration[identifier] = valueComponent;
        }
    }
    return resultingConfiguration;
}

const schemeDescriptor = [
    ['schemeTints', ["#DDDF0D", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]],
    ['graphDisplay', [
        ['backgroundShading', [
            ['gradientStyle', [
                ['x1', 0], ['y1', 0], ['x2', 1], ['y2', 1]
            ]],
            ['shadePoints', [
                [0, 'rgb(48, 48, 96)'],
                [1, 'rgb(0, 0, 0)']
            ]]
        ]],
        ['borderShading', '#000000'],
        ['borderThickness', 2],
        ['styleClass', 'dark-container'],
        ['areaBackgroundShading', 'rgba(255, 255, 255, .1)'],
        ['areaBorderShading', '#CCCCCC'],
        ['areaBorderThickness', 1]
    ]],
    ['mainHeading', [
        ['visuals', [
            ['shading', '#C0C0C0'],
            ['textLayout', 'bold 16px "Trebuchet MS", Verdana, sans-serif']
        ]]
    ]],
    ['subHeading', [
        ['visuals', [
            ['shading', '#666666'],
            ['textLayout', 'bold 12px "Trebuchet MS", Verdana, sans-serif']
        ]]
    ]],
    ['horizontalAxis', [
        ['gridlineShading', '#333333'],
        ['gridlineThickness', 1],
        ['markers', [
            ['visuals', [
                ['shading', '#A0A0A0']
            ]]
        ]],
        ['lineShading', '#A0A0A0'],
        ['tickShading', '#A0A0A0'],
        ['axisHeading', [
            ['visuals', [
                ['shading', '#CCC'],
                ['fontWeight', 'bold'],
                ['fontSize', '12px'],
                ['fontFamily', 'Trebuchet MS, Verdana, sans-serif']
            ]]
        ]]
    ]],
    ['verticalAxis', [
        ['gridlineShading', '#333333'],
        ['markers', [
            ['visuals', [
                ['shading', '#A0A0A0']
            ]]
        ]],
        ['lineShading', '#A0A0A0'],
        ['minorTickSpacing', null],
        ['tickShading', '#A0A0A0'],
        ['tickThickness', 1],
        ['axisHeading', [
            ['visuals', [
                ['shading', '#CCC'],
                ['fontWeight', 'bold'],
                ['fontSize', '12px'],
                ['fontFamily', 'Trebuchet MS, Verdana, sans-serif']
            ]]
        ]]
    ]],
    ['infoBubble', [
        ['backgroundShading', 'rgba(0, 0, 0, 0.75)'],
        ['visuals', [
            ['shading', '#F0F0F0']
        ]]
    ]],
    ['controlPanel', [
        ['elementVisuals', [
            ['shading', 'silver']
        ]]
    ]],
    ['graphOptions', [
        ['lineGraph', [
            ['valueLabels', [
                ['shading', '#CCC']
            ]],
            ['dataPoint', [
                ['lineShading', '#333']
            ]]
        ]],
        ['smoothLine', [
            ['dataPoint', [
                ['lineShading', '#333']
            ]]
        ]],
        ['scatterPlot', [
            ['dataPoint', [
                ['lineShading', '#333']
            ]]
        ]],
        ['barChart', [
            ['lineShading', 'white']
        ]]
    ]],
    ['keyDisplay', [
        ['elementVisuals', [
            ['textLayout', '9pt Trebuchet MS, Verdana, sans-serif'],
            ['shading', '#A0A0A0']
        ]],
        ['elementHoverVisuals', [
            ['shading', '#FFF']
        ]],
        ['elementHiddenVisuals', [
            ['shading', '#444']
        ]]
    ]],
    ['acknowledgements', [
        ['visuals', [
            ['shading', '#666']
        ]]
    ]],
    ['markers', [
        ['visuals', [
            ['shading', '#CCC']
        ]]
    ]],
    ['viewControls', [
        ['buttonSettings', [
            ['iconOutline', '#DDDDDD'],
            ['hoverIconOutline', '#FFFFFF'],
            ['scheme', [
                ['interior', [
                    ['gradientStyle', [
                        ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
                    ]],
                    ['shadePoints', [
                        [0.4, '#606060'],
                        [0.6, '#333333']
                    ]]
                ]],
                ['outline', '#000000']
            ]]
        ]]
    ]],
    ['spanSelector', [
        ['buttonScheme', [
            ['interior', [
                ['gradientStyle', [
                    ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
                ]],
                ['shadePoints', [
                    [0.4, '#888'],
                    [0.6, '#555']
                ]]
            ]],
            ['outline', '#000000'],
            ['visuals', [
                ['shading', '#CCC'],
                ['fontWeight', 'bold']
            ]],
            ['modes', [
                ['onHover', [
                    ['interior', [
                        ['gradientStyle', [
                            ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
                        ]],
                        ['shadePoints', [
                            [0.4, '#BBB'],
                            [0.6, '#888']
                        ]]
                    ]],
                    ['outline', '#000000'],
                    ['visuals', [
                        ['shading', 'white']
                    ]]
                ]],
                ['onSelect', [
                    ['interior', [
                        ['gradientStyle', [
                            ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
                        ]],
                        ['shadePoints', [
                            [0.1, '#000'],
                            [0.3, '#333']
                        ]]
                    ]],
                    ['outline', '#000000'],
                    ['visuals', [
                        ['shading', 'yellow']
                    ]]
                ]]
            ]]
        ]],
        ['inputVisuals', [
            ['backgroundShading', '#333'],
            ['shading', 'silver']
        ]],
        ['labelVisuals', [
            ['shading', 'silver']
        ]]
    ]],
    ['overviewPanel', [
        ['dragHandles', [
            ['backgroundShading', '#666'],
            ['borderShading', '#AAA']
        ]],
        ['outlineShading', '#CCC'],
        ['coverShading', 'rgba(16, 16, 16, 0.5)'],
        ['dataSeries', [
            ['shading', '#7798BF'],
            ['lineShading', '#A6C7ED']
        ]]
    ]],
    ['scrollWidget', [
        ['barBackgroundShading', [
            ['gradientStyle', [
                ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
            ]],
            ['shadePoints', [
                [0.4, '#888'],
                [0.6, '#555']
            ]]
        ]],
        ['barBorderShading', '#CCC'],
        ['arrowShading', '#CCC'],
        ['buttonBackgroundShading', [
            ['gradientStyle', [
                ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
            ]],
            ['shadePoints', [
                [0.4, '#888'],
                [0.6, '#555']
            ]]
        ]],
        ['buttonBorderShading', '#CCC'],
        ['gripShading', '#FFF'],
        ['trackBackgroundShading', [
            ['gradientStyle', [
                ['x1', 0], ['y1', 0], ['x2', 0], ['y2', 1]
            ]],
            ['shadePoints', [
                [0, '#000'],
                [1, '#333']
            ]]
        ]],
        ['trackBorderShading', '#666']
    ]],
    ['keyBackgroundShading', 'rgba(0, 0, 0, 0.5)'],
    ['secondaryBackground', 'rgb(35, 35, 70)'],
    ['valueLabelShading', '#444'],
    ['textShading', '#C0C0C0'],
    ['overlayShading', 'rgba(255,255,255,0.3)']
];

const generatedScheme = buildNestedConfiguration(schemeDescriptor);

Highcharts.theme = generatedScheme;
const optionsApplied = Highcharts.setOptions(Highcharts.theme);