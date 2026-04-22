function roundWarmthDiagram() {
  var spacing = {upper: 20, rightward: 20, lower: 20, leftward: 20},
    coreDiameter = 50,
    sectionCount = 24,
    sectionDepth = 20,
    valueRange = null,
    colorSpan = ["white", "red"],
    dataExtractor = function(datum) {return datum;},
    spokeLabels = sectionIdentifiers = [];

  function diagram(chosenElement) {
    chosenElement.each(function(inputValues) {
      var graphicBase = d3.select(this);

      var displacement = coreDiameter + Math.ceil(inputValues.length / sectionCount) * sectionDepth;
      groupContainer = graphicBase.append("g")
        .classed("circular-heat", true)
        .attr("transform", "translate(" + parseInt(spacing.leftward + displacement) + "," + parseInt(spacing.upper + displacement) + ")");

      var automaticRange = false;
      if (valueRange === null) {
        valueRange = d3.extent(inputValues, dataExtractor);
        automaticRange = true;
      }
      var shadeFunction = d3.scale.linear().domain(valueRange).range(colorSpan);
      if(automaticRange) {
        valueRange = null;
      }

      groupContainer.selectAll("path").data(inputValues)
        .enter().append("path")
        .attr("d", d3.svg.arc().innerRadius(innerArcRadius).outerRadius(outerArcRadius).startAngle(startArcAngle).endAngle(endArcAngle))
        .attr("fill", function(datum) {return shadeFunction(dataExtractor(datum));});


      var uniqueIdNumber = d3.selectAll(".circular-heat")[0].length;

      var labelStartAngle = 0.01;
      var textContainers = graphicBase.append("g")
        .classed("labels", true)
        .classed("radial", true)
        .attr("transform", "translate(" + parseInt(spacing.leftward + displacement) + "," + parseInt(spacing.upper + displacement) + ")");

      textContainers.selectAll("def")
        .data(spokeLabels).enter()
        .append("def")
        .append("path")
        .attr("id", function(datum, idx) {return "radial-label-path-"+uniqueIdNumber+"-"+idx;})
        .attr("d", function(datum, idx) {
          var currentRadius = coreDiameter + ((idx + 0.2) * sectionDepth);
          return "m" + currentRadius * Math.sin(labelStartAngle) + " -" + currentRadius * Math.cos(labelStartAngle) +
            " a" + currentRadius + " " + currentRadius + " 0 1 1 -1 0";
        });

      textContainers.selectAll("text")
        .data(spokeLabels).enter()
        .append("text")
        .append("textPath")
        .attr("xlink:href", function(datum, idx) {return "#radial-label-path-"+uniqueIdNumber+"-"+idx;})
        .style("font-size", 0.6 * sectionDepth + 'px')
        .text(function(datum) {return datum;});

      var sectionLabelShift = 2;
      var currentRadius = coreDiameter + Math.ceil(inputValues.length / sectionCount) * sectionDepth + sectionLabelShift;
      textContainers = graphicBase.append("g")
        .classed("labels", true)
        .classed("segment", true)
        .attr("transform", "translate(" + parseInt(spacing.leftward + displacement) + "," + parseInt(spacing.upper + displacement) + ")");

      textContainers.append("def")
        .append("path")
        .attr("id", "segment-label-path-"+uniqueIdNumber)
        .attr("d", "m0 -" + currentRadius + " a" + currentRadius + " " + currentRadius + " 0 1 1 -1 0");

      textContainers.selectAll("text")
        .data(sectionIdentifiers).enter()
        .append("text")
        .append("textPath")
        .attr("xlink:href", "#segment-label-path-"+uniqueIdNumber)
        .attr("startOffset", function(datum, idx) {return idx * 100 / sectionCount + "%";})
        .text(function(datum) {return datum;});
    });

  }

  innerArcRadius = function(datum, idx) {
    return coreDiameter + Math.floor(idx/sectionCount) * sectionDepth;
  }
  outerArcRadius = function(datum, idx) {
    return coreDiameter + sectionDepth + Math.floor(idx/sectionCount) * sectionDepth;
  }
  startArcAngle = function(datum, idx) {
    return (idx * 2 * Math.PI) / sectionCount;
  }
  endArcAngle = function(datum, idx) {
    return ((idx + 1) * 2 * Math.PI) / sectionCount;
  }

  diagram.spacing = function(param) {
    if (!arguments.length) return spacing;
    spacing = param;
    return diagram;
  };

  diagram.coreDiameter = function(param) {
    if (!arguments.length) return coreDiameter;
    coreDiameter = param;
    return diagram;
  };

  diagram.sectionCount = function(param) {
    if (!arguments.length) return sectionCount;
    sectionCount = param;
    return diagram;
  };

  diagram.sectionDepth = function(param) {
    if (!arguments.length) return sectionDepth;
    sectionDepth = param;
    return diagram;
  };

  diagram.valueRange = function(param) {
    if (!arguments.length) return valueRange;
    valueRange = param;
    return diagram;
  };

  diagram.colorSpan = function(param) {
    if (!arguments.length) return colorSpan;
    colorSpan = param;
    return diagram;
  };

  diagram.spokeLabels = function(param) {
    if (!arguments.length) return spokeLabels;
    if (param == null) param = [];
    spokeLabels = param;
    return diagram;
  };

  diagram.sectionIdentifiers = function(param) {
    if (!arguments.length) return sectionIdentifiers;
    if (param == null) param = [];
    sectionIdentifiers = param;
    return diagram;
  };

  diagram.dataExtractor = function(param) {
    if (!arguments.length) return dataExtractor;
    dataExtractor = param;
    return diagram;
  };

  return diagram;
}