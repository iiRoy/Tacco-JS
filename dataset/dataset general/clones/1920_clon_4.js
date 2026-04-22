let vizIdGen = 0;

function createRadialDataViz() {
    let vizSettings = {
        framePadding: { top: 20, right: 20, bottom: 20, left: 20 },
        centralRadius: 50,
        sectorCount: 24,
        sectorDepth: 20,
        valueRange: null,
        colorSpectrum: ["white", "red"],
        dataValueExtractor: function(item) { return item; },
        spokeLabels: [],
        ringLabels: [],
        labelStartAngleOffset: 0.01,
        ringLabelGap: 2
    };

    const currentVizIdentifier = ++vizIdGen;

    function drawViz(containerElement) {
        containerElement.each(function(inputValues) {
            const canvasElement = d3.select(this);

            const totalRingCount = Math.ceil(inputValues.length / vizSettings.sectorCount);
            const transformationOffset = vizSettings.centralRadius + totalRingCount * vizSettings.sectorDepth;

            const mainDrawingLayer = canvasElement.append("g")
                .attr("class", "radial-grid-display-group")
                .attr("transform", `translate(${parseInt(vizSettings.framePadding.left + transformationOffset)},${parseInt(vizSettings.framePadding.top + transformationOffset)})`);

            let derivedValueRange = vizSettings.valueRange;
            let rangeWasAutoComputed = false;
            if (derivedValueRange === null) {
                derivedValueRange = d3.extent(inputValues, vizSettings.dataValueExtractor);
                rangeWasAutoComputed = true;
            }
            const colorMappingFunction = d3.scale.linear().domain(derivedValueRange).range(vizSettings.colorSpectrum);
            if (rangeWasAutoComputed) {
                derivedValueRange = null;
            }

            const generateInnerRadius = (d, index) => vizSettings.centralRadius + Math.floor(index / vizSettings.sectorCount) * vizSettings.sectorDepth;
            const generateOuterRadius = (d, index) => vizSettings.centralRadius + vizSettings.sectorDepth + Math.floor(index / vizSettings.sectorCount) * vizSettings.sectorDepth;
            const generateStartAngle = (d, index) => (index * 2 * Math.PI) / vizSettings.sectorCount;
            const generateEndAngle = (d, index) => ((index + 1) * 2 * Math.PI) / vizSettings.sectorCount;

            const segmentArcCreator = d3.svg.arc()
                .innerRadius(generateInnerRadius)
                .outerRadius(generateOuterRadius)
                .startAngle(generateStartAngle)
                .endAngle(generateEndAngle);

            mainDrawingLayer.selectAll("path.data-segment-arc").data(inputValues)
                .enter().append("path")
                .attr("class", "data-segment-arc")
                .attr("d", segmentArcCreator)
                .attr("fill", (d) => colorMappingFunction(vizSettings.dataValueExtractor(d)));

            const spokeLabelContainer = canvasElement.append("g")
                .attr("class", "annotation-group spoke-annotations")
                .attr("transform", `translate(${parseInt(vizSettings.framePadding.left + transformationOffset)},${parseInt(vizSettings.framePadding.top + transformationOffset)})`);

            spokeLabelContainer.selectAll("defs.spoke-path-defs")
                .data(vizSettings.spokeLabels).enter()
                .append("defs")
                .attr("class", "spoke-path-defs")
                .append("path")
                .attr("id", (d, idx) => `spoke-annotation-path-${currentVizIdentifier}-${idx}`)
                .attr("d", (d, idx) => {
                    const labelPathArcRadius = vizSettings.centralRadius + ((idx + 0.2) * vizSettings.sectorDepth);
                    return `m${labelPathArcRadius * Math.sin(vizSettings.labelStartAngleOffset)} -${labelPathArcRadius * Math.cos(vizSettings.labelStartAngleOffset)}` +
                           ` a${labelPathArcRadius} ${labelPathArcRadius} 0 1 1 -1 0`;
                });

            spokeLabelContainer.selectAll("text.spoke-label-text")
                .data(vizSettings.spokeLabels).enter()
                .append("text")
                .attr("class", "spoke-label-text")
                .append("textPath")
                .attr("xlink:href", (d, idx) => `#spoke-annotation-path-${currentVizIdentifier}-${idx}`)
                .style("font-size", `${0.6 * vizSettings.sectorDepth}px`)
                .text((d) => d);

            const ringLabelContainer = canvasElement.append("g")
                .attr("class", "annotation-group ring-annotations")
                .attr("transform", `translate(${parseInt(vizSettings.framePadding.left + transformationOffset)},${parseInt(vizSettings.framePadding.top + transformationOffset)})`);

            const ringLabelArcRadius = vizSettings.centralRadius + totalRingCount * vizSettings.sectorDepth + vizSettings.ringLabelGap;
            ringLabelContainer.append("defs")
                .attr("class", "ring-path-defs")
                .append("path")
                .attr("id", `ring-annotation-path-${currentVizIdentifier}`)
                .attr("d", `m0 -${ringLabelArcRadius} a${ringLabelArcRadius} ${ringLabelArcRadius} 0 1 1 -1 0`);

            ringLabelContainer.selectAll("text.ring-label-text")
                .data(vizSettings.ringLabels).enter()
                .append("text")
                .attr("class", "ring-label-text")
                .append("textPath")
                .attr("xlink:href", `#ring-annotation-path-${currentVizIdentifier}`)
                .attr("startOffset", (d, idx) => `${idx * 100 / vizSettings.sectorCount}%`)
                .text((d) => d);
        });
    }

    drawViz.framePadding = function(newVal) {
        if (!arguments.length) return vizSettings.framePadding;
        vizSettings.framePadding = newVal;
        return drawViz;
    };

    drawViz.centralRadius = function(newVal) {
        if (!arguments.length) return vizSettings.centralRadius;
        vizSettings.centralRadius = newVal;
        return drawViz;
    };

    drawViz.sectorCount = function(newVal) {
        if (!arguments.length) return vizSettings.sectorCount;
        vizSettings.sectorCount = newVal;
        return drawViz;
    };

    drawViz.sectorDepth = function(newVal) {
        if (!arguments.length) return vizSettings.sectorDepth;
        vizSettings.sectorDepth = newVal;
        return drawViz;
    };

    drawViz.valueRange = function(newVal) {
        if (!arguments.length) return vizSettings.valueRange;
        vizSettings.valueRange = newVal;
        return drawViz;
    };

    drawViz.colorSpectrum = function(newVal) {
        if (!arguments.length) return vizSettings.colorSpectrum;
        vizSettings.colorSpectrum = newVal;
        return drawViz;
    };

    drawViz.spokeLabels = function(newVal) {
        if (!arguments.length) return vizSettings.spokeLabels;
        vizSettings.spokeLabels = (newVal == null ? [] : newVal);
        return drawViz;
    };

    drawViz.ringLabels = function(newVal) {
        if (!arguments.length) return vizSettings.ringLabels;
        vizSettings.ringLabels = (newVal == null ? [] : newVal);
        return drawViz;
    };

    drawViz.dataValueExtractor = function(newVal) {
        if (!arguments.length) return vizSettings.dataValueExtractor;
        vizSettings.dataValueExtractor = newVal;
        return drawViz;
    };

    return drawViz;
}