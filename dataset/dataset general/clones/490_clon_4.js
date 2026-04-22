const visualizationCore = {};

const dataDrivenVisuals = d3;
const infoBubble = toolTip;
const palette = colors;
const halfPi = PIdiv2;
const tinyAngle = smallRad;
const fileChangeCategories = TYPE_STATUS_FILE;
const momentFormatter = timeFormat;
const numericPresenter = textFormat;
const canvasWidth = w;
const canvasHeight = h;
const chartMargins = margin;
const dayDuration = ONE_DAY;
const rgbaConverter = toRgba;

// Helper for building HTML strings for the info bubble content
function generateInfoHtml(focusedDataItem) {
    let htmlFragments = [];

    htmlFragments.push('<div class="row"><blockquote>');
    htmlFragments.push(focusedDataItem.message.split("\n")[0]);
    htmlFragments.push('</blockquote></div>');

    htmlFragments.push('<div class="row userInfo open"><div class="statInfo">');
    
    // Attempt to get outerHTML from avatar node, assuming it's a DOM element or D3 selection
    let avatarMarkup = '';
    if (focusedDataItem.author.avatar && focusedDataItem.author.avatar.outerHTML) {
        avatarMarkup = focusedDataItem.author.avatar.outerHTML;
    } else if (focusedDataItem.author.avatar && focusedDataItem.author.avatar.node && focusedDataItem.author.avatar.node().outerHTML) {
         avatarMarkup = focusedDataItem.author.avatar.node().outerHTML;
    }
    htmlFragments.push(avatarMarkup);

    htmlFragments.push('<ul>');

    const contributorIdentifier = focusedDataItem.author.name || focusedDataItem.author.login;
    if (contributorIdentifier) {
        htmlFragments.push('<li><h1>');
        htmlFragments.push(contributorIdentifier);
        htmlFragments.push('</h1><hr></li>');
    }

    htmlFragments.push('<li><span class="mini-icon mini-icon-time"></span><strong>');
    htmlFragments.push(momentFormatter(focusedDataItem.date));
    htmlFragments.push('</strong></li>');

    htmlFragments.push('<li>sha: <strong>');
    htmlFragments.push(focusedDataItem.sha.substr(0, 10));
    htmlFragments.push('</strong></li>');

    htmlFragments.push('<li><hr></li>');

    if (focusedDataItem.files.length) {
        htmlFragments.push('<li><ul class="setting"><li class="field"><h1>Changed files:</h1>');
        let categorizedFileCounts = new Map();
        for (const fileRecord of focusedDataItem.files) {
            for (const categoryKey in fileChangeCategories) {
                if (Object.prototype.hasOwnProperty.call(fileChangeCategories, categoryKey) && fileRecord.status === fileChangeCategories[categoryKey]) {
                    categorizedFileCounts.set(categoryKey, (categorizedFileCounts.get(categoryKey) || 0) + 1);
                    break;
                }
            }
        }
        for (const [category, count] of categorizedFileCounts.entries()) {
            htmlFragments.push('<ul class="group"><li class="field"><span>');
            htmlFragments.push(category);
            htmlFragments.push(': </span><strong>');
            htmlFragments.push(count);
            htmlFragments.push('</strong></li></ul>');
        }
        htmlFragments.push('</li></ul></li>');
    }

    htmlFragments.push('<li><ul class="setting"><li class="field"><h1>Changed lines:</h1>');
    const lineLabelPrefixes = { changes: "", additions: " + ", deletions: " - " };
    for (const lineMetricKey in lineLabelPrefixes) {
        if (Object.prototype.hasOwnProperty.call(lineLabelPrefixes, lineMetricKey) && Object.prototype.hasOwnProperty.call(focusedDataItem.stats, lineMetricKey)) {
            htmlFragments.push('<ul class="group"><li class="field"><span>');
            htmlFragments.push(lineMetricKey);
            htmlFragments.push(': </span><strong style="color: ');
            htmlFragments.push(dataDrivenVisuals.rgb(palette[lineMetricKey]).darker(0.2).toString());
            htmlFragments.push('">');
            htmlFragments.push(lineLabelPrefixes[lineMetricKey]);
            htmlFragments.push(numericPresenter(focusedDataItem.stats[lineMetricKey]));
            htmlFragments.push('</strong></li></ul>');
        }
    }
    htmlFragments.push('</li></ul></li>');

    htmlFragments.push('</ul></div></div>');

    return htmlFragments.join('');
}


visualizationCore.highlightElement = function(focusedDataItem) {
    if (!focusedDataItem._g) return;

    focusedDataItem._g.selectAll("path.bar").style(new Map([
        ["fill-opacity", 0.6],
        ["stroke-width", 1],
        ["stroke", () => rgbaConverter("#000000", 1)]
    ]));

    const currentCommitDomElement = focusedDataItem._g.node();
    if (!currentCommitDomElement) return;

    currentCommitDomElement.commitDelBar && currentCommitDomElement.commitDelBar
        .transition()
        .attr("d", currentCommitDomElement.delArcGenerator.startAngle(halfPi + tinyAngle).endAngle(halfPi * 3 - tinyAngle)());

    currentCommitDomElement.commitAddBar && currentCommitDomElement.commitAddBar
        .transition()
        .attr("d", currentCommitDomElement.addArcGenerator.startAngle(-halfPi + tinyAngle).endAngle(halfPi - tinyAngle)());

    focusedDataItem._g.selectAll("text.del, text.add").style("visibility", "visible");

    infoBubble.selectAll("*").remove();
    infoBubble.append("div").html(generateInfoHtml(focusedDataItem));

    infoBubble.show();
};

visualizationCore.dimElement = function(fadedDataItem) {
    if (!fadedDataItem._g) return;

    fadedDataItem._g.selectAll("path.bar").style(new Map([
        ["fill-opacity", 0.3],
        ["stroke", null]
    ]));

    const currentCommitDomElement = fadedDataItem._g.node();
    if (!currentCommitDomElement) return;

    currentCommitDomElement.commitDelBar && currentCommitDomElement.commitDelBar
        .transition()
        .duration(750)
        .ease("elastic")
        .attr("d", currentCommitDomElement.delArcGenerator.startAngle(Math.PI - tinyAngle).endAngle(Math.PI + tinyAngle)());

    currentCommitDomElement.commitAddBar && currentCommitDomElement.commitAddBar
        .transition()
        .duration(750)
        .ease("elastic")
        .attr("d", currentCommitDomElement.addArcGenerator.startAngle(-tinyAngle).endAngle(tinyAngle)());

    fadedDataItem._g.selectAll("text.del").style("visibility", fadedDataItem.stats && fadedDataItem.stats.delTextVis ? fadedDataItem.stats.delTextVis : "hidden");
    fadedDataItem._g.selectAll("text.add").style("visibility", fadedDataItem.stats && fadedDataItem.stats.addTextVis ? fadedDataItem.stats.addTextVis : "hidden");

    infoBubble.hide();
};

visualizationCore.repositionInfo = function(subjectData) {
    visualizationCore.mtt(subjectData);
};

visualizationCore.purgeAnalytics = function() {
    if (visualizationCore.layers && visualizationCore.layers.stat) {
        visualizationCore.layers.stat.selectAll("*").remove();
        visualizationCore.layers.stat.contentContainer && (visualizationCore.layers.stat.contentContainer = null);
    }
};

visualizationCore.renderAnalytics = function(inputData, targetLayer) {
    targetLayer = targetLayer || visualizationCore.layers.stat;

    const commitCollection = inputData && inputData.commits ? inputData.commits.values() : null;

    if (!commitCollection || !commitCollection.length) {
        visualizationCore.purgeAnalytics();
        return;
    }

    const dateBoundaries = dataDrivenVisuals.extent(inputData.dates);
    let timeOffset = (dateBoundaries[1] - dateBoundaries[0]) * 0.1;
    timeOffset = timeOffset || dayDuration;
    const extendedBoundaries = [dateBoundaries[0] - timeOffset, dateBoundaries[1] + timeOffset];

    const horizontalScale = dataDrivenVisuals.time.scale()
        .domain(extendedBoundaries)
        .range([0, canvasWidth - chartMargins.left - chartMargins.right]);

    const sixthHeight = canvasHeight / 6;

    const verticalScale = dataDrivenVisuals.scale.linear()
        .range([2, sixthHeight * 2])
        .domain([0, inputData.stats.changes || 1]);

    const augmentedCommits = commitCollection.slice(0).concat([
        { date: extendedBoundaries[0] + timeOffset / 2, f: { d: 0, a: 0, m: 0 }, stats: { f: { d: 0, a: 0, m: 0 } } },
        { date: extendedBoundaries[1] - timeOffset / 2, f: { d: 0, a: 0, m: 0 }, stats: { f: { d: 0, a: 0, m: 0 } } }
    ]).sort(visualizationCore.sC);

    const visualLayers = [];
    visualLayers.push({
        colorCode: palette.deletedFile,
        segmentValues: augmentedCommits.map(item => ({
            typeIdentifier: 1,
            xCoord: item.date,
            yBase: 0,
            yHeight: (item.stats ? -item.stats.f.d : 0)
        }))
    });
    visualLayers.push({
        colorCode: palette.modifiedFile,
        segmentValues: augmentedCommits.map(item => ({
            xCoord: item.date,
            yBase: 0,
            yHeight: (item.stats ? item.stats.f.m : 0)
        }))
    });
    visualLayers.push({
        colorCode: palette.addedFile,
        segmentValues: augmentedCommits.map(item => ({
            xCoord: item.date,
            yBase: (item.stats ? item.stats.f.m : 0),
            yHeight: (item.stats ? item.stats.f.a : 0)
        }))
    });

    function smoothPathGenerator(coordinates) {
        let currentX = coordinates[0][0], currentY = coordinates[0][1], nextX, nextY, midX,
            pathSegments = [currentX, ",", currentY],
            segmentIndex = 0,
            totalSegments = coordinates.length;
        while (++segmentIndex < totalSegments) {
            nextX = coordinates[segmentIndex][0];
            nextY = coordinates[segmentIndex][1];
            midX = (currentX + nextX) / 2;
            pathSegments.push("C", midX, ",", currentY, " ", midX, ",", nextY, " ", nextX, ",", nextY);
            currentX = nextX;
            currentY = nextY;
        }
        return pathSegments.join("");
    }

    const verticalScaleArea = dataDrivenVisuals.scale.linear()
        .range([sixthHeight * 4.5, sixthHeight * 3, sixthHeight * 1.5])
        .domain([-inputData.stats.files, 0, inputData.stats.files]);

    const areaPlotBuilder = dataDrivenVisuals.svg.area()
        .interpolate(smoothPathGenerator)
        .x(segment => horizontalScale(segment.xCoord))
        .y0(segment => verticalScaleArea(segment.yBase))
        .y1(segment => verticalScaleArea(segment.yBase + segment.yHeight));

    const horizontalAxisGenerator = dataDrivenVisuals.svg.axis()
        .scale(horizontalScale);

    targetLayer.contentContainer = targetLayer.contentContainer || targetLayer
        .append("g")
        .attr("transform", `translate(${chartMargins.left},${chartMargins.top})`);

    targetLayer.contentContainer.selectAll("path.areaFile").remove();

    targetLayer.contentContainer.selectAll("path.areaFile")
        .data(visualLayers)
        .enter()
        .insert("path", ":first-child")
        .attr("class", "areaFile")
        .style("stroke", layerData => layerData.colorCode)
        .style("stroke-opacity", 0.5)
        .style("fill-opacity", 0.1)
        .style("fill", layerData => layerData.colorCode)
        .transition()
        .duration(750)
        .attr("d", layerData => areaPlotBuilder(layerData.segmentValues));

    targetLayer.contentContainer.axisGroup = targetLayer.contentContainer.axisGroup || targetLayer.contentContainer.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${canvasHeight / 2})`);

    targetLayer.contentContainer.axisGroup.selectAll("*").remove();
    targetLayer.contentContainer.axisGroup
        .call(horizontalAxisGenerator)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .style("fill", function() {
            return parseInt(this.textContent) ? "#fff" : null;
        })
        .style("font-size", function() {
            return parseInt(this.textContent) ? "12px" : null;
        })
        .style("font-weight", function() {
            return parseInt(this.textContent) ? "bold" : null;
        });

    targetLayer.contentContainer.dataPointsGroup = targetLayer.contentContainer.dataPointsGroup || targetLayer.contentContainer.append("g")
        .attr("transform", `translate(0,${canvasHeight / 2})`);

    const commitPointElements = targetLayer.contentContainer.dataPointsGroup.selectAll("g.com")
        .data(commitCollection, item => item.sha);

    commitPointElements.enter()
        .append("g")
        .attr("class", "com")
        .on("mouseover", visualizationCore.highlightElement)
        .on("mouseout", visualizationCore.dimElement)
        .on("mousemove", visualizationCore.repositionInfo);

    commitPointElements.each(function(currentCommitData) {
        const currentGroup = currentCommitData._g = dataDrivenVisuals.select(this);
        currentGroup.transition()
            .duration(1500)
            .ease("elastic")
            .attr("transform", `translate(${[horizontalScale(currentCommitData.date), 0]})`);

        this.nodeCenter = this.nodeCenter || currentGroup.append("circle")
            .attr("r", 2)
            .style("fill", palette.center);

        if (!currentCommitData.stats) return;

        const addArcGenerator = this.addArcGenerator = dataDrivenVisuals.svg.arc()
            .innerRadius(1)
            .outerRadius(1)
            .startAngle(-tinyAngle)
            .endAngle(tinyAngle);

        const delArcGenerator = this.delArcGenerator = dataDrivenVisuals.svg.arc()
            .innerRadius(1)
            .outerRadius(1)
            .startAngle(Math.PI - tinyAngle)
            .endAngle(Math.PI + tinyAngle);

        (this.commitAddBar || (
            this.commitAddBar = currentGroup.append("path")
                .attr("class", "bar")
                .style(new Map([
                    ["fill", palette.additions],
                    ["fill-opacity", 0.3]
                ]))
                .attr("d", addArcGenerator())
        ))
            .transition()
            .duration(750)
            .ease("elastic")
            .attr("d", addArcGenerator.outerRadius(verticalScale(currentCommitData.stats.additions))());

        (this.commitDelBar || (
            this.commitDelBar = currentGroup.append("path")
                .attr("class", "bar")
                .style(new Map([
                    ["fill", palette.deletions],
                    ["fill-opacity", 0.3]
                ]))
                .attr("d", delArcGenerator())
        ))
            .transition()
            .duration(750)
            .ease("elastic")
            .attr("d", delArcGenerator.outerRadius(verticalScale(currentCommitData.stats.deletions))());

        function calculateSizedRadius(baseSize, factor) {
            return baseSize * (1 + factor);
        }

        const addArcTopGenerator = this.addArcTopGenerator = dataDrivenVisuals.svg.arc()
            .innerRadius(calculateSizedRadius(verticalScale(currentCommitData.stats.additions), 0.015))
            .outerRadius(calculateSizedRadius(verticalScale(currentCommitData.stats.additions), 0.025))
            .startAngle(-tinyAngle)
            .endAngle(tinyAngle);

        const delArcTopGenerator = this.delArcTopGenerator = dataDrivenVisuals.svg.arc()
            .innerRadius(calculateSizedRadius(verticalScale(currentCommitData.stats.deletions), 0.015))
            .outerRadius(calculateSizedRadius(verticalScale(currentCommitData.stats.deletions), 0.025))
            .startAngle(Math.PI - tinyAngle)
            .endAngle(Math.PI + tinyAngle);

        (this.commitAddBarTop || (
            this.commitAddBarTop = currentGroup.append("path")
                .style("fill", rgbaConverter(palette.additions))
        ))
            .attr("d", addArcTopGenerator());

        (this.commitDelBarTop || (
            this.commitDelBarTop = currentGroup.append("path")
                .style("fill", rgbaConverter(palette.deletions))
        ))
            .attr("d", delArcTopGenerator());

        if (currentCommitData.stats.additions) {
            currentCommitData.stats.addTextVis = calculateSizedRadius(verticalScale(currentCommitData.stats.additions), 0.029) > sixthHeight / 2 ? "visible" : "hidden";
            (this.addLabel || (
                this.addLabel = currentGroup.append("text")
                    .attr("class", "add")
                    .attr("dy", "-.31em")
                    .attr("text-anchor", "middle")
                    .style("fill", palette.additions)
                    .text(` + ${numericPresenter(currentCommitData.stats.additions)}`)
            ))
                .attr("transform", `translate(${[0, -calculateSizedRadius(verticalScale(currentCommitData.stats.additions), 0.027)]})`)
                .attr("visibility", currentCommitData.stats.addTextVis);
        }

        if (currentCommitData.stats.deletions) {
            currentCommitData.stats.delTextVis = calculateSizedRadius(verticalScale(currentCommitData.stats.deletions), 0.029) > sixthHeight / 2 ? "visible" : "hidden";
            (this.delLabel || (
                this.delLabel = currentGroup.append("text")
                    .attr("class", "del")
                    .attr("dy", ".93em")
                    .attr("text-anchor", "middle")
                    .style("fill", palette.deletions)
                    .text(` - ${numericPresenter(currentCommitData.stats.deletions)}`)
            ))
                .attr("transform", `translate(${[0, calculateSizedRadius(verticalScale(currentCommitData.stats.deletions), 0.027)]})`)
                .attr("visibility", currentCommitData.stats.delTextVis);
        }
    });

    commitPointElements.sort((itemA, itemB) => {
        return (itemA.stats && itemB.stats) ? dataDrivenVisuals.ascending(itemB.stats.changes, itemA.stats.changes) : 0;
    });

    commitPointElements.exit().remove();
};

(function (targetExportObject) {
    targetExportObject.highlightElement = visualizationCore.highlightElement;
    targetExportObject.dimElement = visualizationCore.dimElement;
    targetExportObject.repositionInfo = visualizationCore.repositionInfo;
    targetExportObject.purgeAnalytics = visualizationCore.purgeAnalytics;
    targetExportObject.renderAnalytics = visualizationCore.renderAnalytics;
})(typeof vis !== 'undefined' ? vis : (this.vis = {}));