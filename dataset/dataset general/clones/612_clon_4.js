const chartData = [
    { x: 0.5, y: 0.8 },
    { x: 1.0, y: 1.5 },
    { x: 1.8, y: 3.2 },
    { x: 2.5, y: 2.0 },
    { x: 3.2, y: 3.8 },
    { x: 3.8, y: 2.5 }
];

const outerDimensionWidth = 400;
const outerDimensionHeight = 200;

const marginNorth = 5;
const marginEast = 10;
const marginSouth = 20;
const marginWest = 20;

const innerPlotWidth = outerDimensionWidth - marginWest - marginEast;
const innerPlotHeight = outerDimensionHeight - marginNorth - marginSouth;

const minimumXValue = Math.min(...chartData.map(item => item.x));
const maximumXValue = Math.max(...chartData.map(item => item.x));

const horizontalMapper = (value) => marginWest + (value - minimumXValue) / (maximumXValue - minimumXValue) * innerPlotWidth;
const verticalMapper = (value) => marginNorth + innerPlotHeight - (value - 0) / (4 - 0) * innerPlotHeight;

const constructSvgElement = (tag, attributes, content = '') => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    if (content) {
        element.textContent = content;
    }
    return element;
};

const displayElementIdentifier = 'fig';
const containerElement = document.getElementById(displayElementIdentifier);

const graphicsContainer = constructSvgElement('svg', {
    width: outerDimensionWidth,
    height: outerDimensionHeight,
    viewBox: `0 0 ${outerDimensionWidth} ${outerDimensionHeight}`
});
containerElement.appendChild(graphicsContainer);

const verticalAxisMarks = [0, 1, 2, 3, 4];

verticalAxisMarks.forEach(axisMarkValue => {
    const verticalPosition = verticalMapper(axisMarkValue);

    graphicsContainer.appendChild(constructSvgElement('line', {
        x1: marginWest,
        y1: verticalPosition,
        x2: marginWest + innerPlotWidth,
        y2: verticalPosition,
        stroke: axisMarkValue === 0 ? '#000' : '#eee',
        'stroke-width': 1
    }));

    graphicsContainer.appendChild(constructSvgElement('text', {
        x: marginWest - 8,
        y: verticalPosition + 4,
        'text-anchor': 'end',
        'font-family': 'sans-serif',
        'font-size': '10px',
        fill: '#000'
    }, axisMarkValue.toString()));
});

const horizontalAxisMarks = [];
const tickCount = 5;
for (let i = 0; i <= tickCount; i++) {
    horizontalAxisMarks.push(minimumXValue + (maximumXValue - minimumXValue) * i / tickCount);
}

horizontalAxisMarks.forEach(axisMarkValue => {
    const horizontalPosition = horizontalMapper(axisMarkValue);

    if (axisMarkValue !== 0) {
        graphicsContainer.appendChild(constructSvgElement('line', {
            x1: horizontalPosition,
            y1: marginNorth + innerPlotHeight,
            x2: horizontalPosition,
            y2: marginNorth + innerPlotHeight + 5,
            stroke: '#000',
            'stroke-width': 1
        }));

        graphicsContainer.appendChild(constructSvgElement('text', {
            x: horizontalPosition,
            y: marginNorth + innerPlotHeight + 15,
            'text-anchor': 'middle',
            'font-family': 'sans-serif',
            'font-size': '10px',
            fill: '#000'
        }, axisMarkValue.toFixed(1).toString()));
    }
});

const chartShapeVertices = chartData.map(item => ({
    x: horizontalMapper(item.x),
    y: verticalMapper(item.y)
}));

const baseLineYPosition = verticalMapper(1);

let areaOutlineDescription = `M ${chartShapeVertices[0].x} ${chartShapeVertices[0].y}`;
for (let i = 1; i < chartShapeVertices.length; i++) {
    areaOutlineDescription += ` L ${chartShapeVertices[i].x} ${chartShapeVertices[i].y}`;
}
areaOutlineDescription += ` L ${chartShapeVertices[chartShapeVertices.length - 1].x} ${baseLineYPosition}`;
areaOutlineDescription += ` L ${chartShapeVertices[0].x} ${baseLineYPosition} Z`;

graphicsContainer.appendChild(constructSvgElement('path', {
    d: areaOutlineDescription,
    fill: 'rgb(121,173,210)',
    stroke: 'none'
}));

let featureLineDescription = `M ${chartShapeVertices[0].x} ${chartShapeVertices[0].y}`;
for (let i = 1; i < chartShapeVertices.length; i++) {
    featureLineDescription += ` L ${chartShapeVertices[i].x} ${chartShapeVertices[i].y}`;
}

graphicsContainer.appendChild(constructSvgElement('path', {
    d: featureLineDescription,
    fill: 'none',
    stroke: '#000',
    'stroke-width': 3
}));