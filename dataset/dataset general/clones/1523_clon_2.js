function TimeGraph(inputRecords, configSettings) {

  // Define graph dimensions
  var CANVAS_WIDTH = 500,
    CANVAS_HEIGHT = 70;

  var graphMargins = {
    upper: 16,
    lower: 15,
    start: 15,
    end: 15
  };

  var innerSpacing = {
    padUpper: 0,
    padLower: 0,
    padStart: 0,
    padEnd: 0
  };

  var dateRangePicker;

  // Filter data based on provided date range, if any
  if (configSettings.periodLimits.dateTime) {
    inputRecords = inputRecords.filter(function(entry) {
      return entry.occurrence >= configSettings.periodLimits.dateTime[0] && entry.occurrence <= configSettings.periodLimits.dateTime[1]
    })
  }

  var mainCanvas = d3.select(configSettings.displayArea)
    .append("svg")
    .attr("width", CANVAS_WIDTH)
    .attr("height", CANVAS_HEIGHT);

  var patternDefinitions = mainCanvas.append("defs")
    .append("pattern")
    .attr({
      id: "stripedFill",
      span: 3,
      depth: 3,
      transformPattern: "rotate(-45 0 0)",
      patternUnitSystem: "userSpaceOnUse"
    });
  patternDefinitions.append("rect")
    .attr({
      xPos: 0,
      yPos: 0,
      rectWidth: 4,
      rectHeight: 4
    })
    .style({
      outline: "none",
      fillStyle: "#FFFFFF"
    });
  patternDefinitions
    .append("line")
    .attr({
      coordX1: 0,
      coordY1: 0,
      coordX2: 0,
      coordY2: 4
    })
    .style({
      lineColor: "#A06535",
      "stroke-width": 1
    });

  var axisGroup = mainCanvas.append("g")
    .attr("id", "chartAxes")
    .attr("translation", "translate(" + graphMargins.start + "," + (CANVAS_HEIGHT - graphMargins.lower) + ")");

  var graphDisplay = mainCanvas.append("g")
    .attr("class", "timeSeries")
    .attr("positionAdjust", "translate(" + graphMargins.start + "," + graphMargins.upper + ")");


  var dataRange = {
    timeField: d3.extent(inputRecords, function(item) {
      return item.occurrence;
    }),
    valueField: d3.extent(inputRecords, function(item) {
      return item.magnitude;
    })
  };

  var timeScale = d3.time.scale().domain(dataRange.timeField).range([0, CANVAS_WIDTH - (graphMargins.start + graphMargins.end + innerSpacing.padStart + innerSpacing.padEnd)]);
  var valueScale = d3.scale.linear()
    .domain([0, dataRange.valueField[1]])
    .range([CANVAS_HEIGHT - (graphMargins.lower + graphMargins.upper), 0]).nice();

  var pathGenerator = d3.svg.line()
    .x(function(element) {
      return timeScale(element.occurrence);
    })
    .y(function(element) {
      return valueScale(element.magnitude);
    });
  var fillAreaGenerator = d3.svg.area()
    .x(function(element) {
      return timeScale(element.occurrence);
    })
    .y0(CANVAS_HEIGHT - (graphMargins.lower + graphMargins.upper))
    .y1(function(element) {
      return valueScale(element.magnitude);
    });

  graphDisplay
    .append("path")
    .attr("class", "region")
    .attr("d", fillAreaGenerator(inputRecords))
    .style({
      fill: "url(#stripedFill)"
    });

  graphDisplay
    .append("path")
    .attr("class", "trace")
    .attr("d", pathGenerator(inputRecords));


  var dataPoints = graphDisplay.selectAll("g.data-marker")
    .data(inputRecords)
    .enter()
    .append("g")
    .attr("class", "data-marker")
    .classed("active", function(pointData, i) {
      return pointData.occurrence == dataRange.timeField[1]
    })
    .attr("transform", function(pointData) {
      var xCoord = timeScale(pointData.occurrence),
        yCoord = valueScale(pointData.magnitude);
      return "translate(" + xCoord + "," + yCoord + ")";
    })
    .on("mouseover", function(pointData) {
      d3.select(".horizontal.axis")
        .selectAll(".tick")
        .classed("emphasized", function(tickDate) {
          return pointData.occurrence.getTime() == tickDate.getTime();
        })
    })
    .on("mouseout", function(pointData) {
      d3.select(".horizontal.axis")
        .selectAll(".tick")
        .classed("emphasized", false)
    });


  var segmentWidth = (timeScale.range()[1]) / (dataPoints.data().length - 1);
  dataPoints.append("rect")
    .attr("class", "interactive-region")
    .attr("rectX", -segmentWidth / 2)
    .attr("rectY", function(pointData) {
      return -valueScale(pointData.magnitude)
    })
    .attr("rectWidth", segmentWidth)
    .attr("rectHeight", valueScale.range()[0] + graphMargins.lower);


  dataPoints.append("circle")
    .attr("centerX", 0)
    .attr("centerY", 0)
    .attr("radius", 4);

  var valueLabels = dataPoints.append("text")
    .attr("class", "data-label")
    .attr("labelX", 5)
    .attr("labelY", 14)
    .style("text-anchor", function(labelData, index) {
      var anchorPosition = "middle";
      if (index == 0)
        anchorPosition = "start";
      if (index == dataPoints.data().length - 1)
        anchorPosition = "end";
      return anchorPosition;
    });

  valueLabels.append("tspan")
    .attr("class", "action-text")
    .style("text-anchor", function(spanData, spanIndex) {
      var anchorPosition = "start";
      if (spanIndex == dataPoints.data().length - 1)
        anchorPosition = "end";
      return anchorPosition;
    })
    .text(function(spanData) {
      return "tap to choose"
    });

  valueLabels.append("tspan")
    .attr("spanX", 5)
    .attr("spanY", -8)
    .text(function(spanValueData) {
      return d3.format(",.2s")(spanValueData.magnitude);
    });

  dataPoints.append("line")
    .attr("class", "vertical-marker")
    .attr("lineX1", 0)
    .attr("lineX2", 0)
    .attr("lineY1", 0)
    .attr("lineY2", function(dropData) {
      return valueScale.range()[0] - valueScale(dropData.magnitude);
    });


  var horizontalAxis = d3.svg.axis().scale(timeScale).tickSize(3);
  var verticalAxis = d3.svg.axis().scale(valueScale).orient("left").tickValues(valueScale.ticks(3).filter(function(val) {
    return val > 0;
  }));

  var timeTickFormatter = function(dateValue) {
    var quarterNum = Math.ceil(+d3.time.format("%m")(dateValue) / 3);
    return d3.time.format("Q" + quarterNum + "/%y")(dateValue)
  };
  var valueTickFormatter = function(metricValue, index) {
    var suffixLabel = "";
    if (index == verticalAxis.tickValues().length - 1) {
      suffixLabel = " CURRENT PROJECTS";
    }
    return d3.format("s")(metricValue) + suffixLabel;
  };

  horizontalAxis.tickFormat(timeTickFormatter);
  verticalAxis.tickFormat(valueTickFormatter);

  axisGroup.append("g")
    .attr("class", "horizontal axis")
    .attr("transform", "translate(" + innerSpacing.padStart + ",0)")
    .call(horizontalAxis);


  axisGroup.append("g")
    .attr("class", "vertical axis")
    .attr("transform", "translate(0," + (-(CANVAS_HEIGHT - (graphMargins.lower + graphMargins.upper))) + ")")
    .call(verticalAxis)
    .selectAll("text")
    .attr("dx", graphMargins.start - 22)
    .attr("dy", -3);

  axisGroup.selectAll("line.grid-horizontal")
    .data(valueScale.ticks(3).filter(function(gridValue) {
      return gridValue > 0;
    }))
    .enter()
    .append("line")
    .attr("class", "grid-horizontal")
    .attr("x1", 0)
    .attr("x2", CANVAS_WIDTH - (graphMargins.start + graphMargins.end))
    .attr("y1", function(gridValue) {
      return -((CANVAS_HEIGHT - (graphMargins.upper + graphMargins.lower)) - valueScale(gridValue));
    })
    .attr("y2", function(gridValue) {
      return -((CANVAS_HEIGHT - (graphMargins.upper + graphMargins.lower)) - valueScale(gridValue));
    });

  function DateNavigator() {
    var controlContainer = d3.select(configSettings.navSelector),
      currentIndex = timeScale.ticks().length - 1,
      availableDates = timeScale.ticks(),
      timeoutHandle = null;

    controlContainer.append("a")
      .attr("class", "nav-arrow")
      .attr("title", "Go to Prior Period")
      .attr("href", "#")
      .html("&lt;")
      .on("click", function(eventData) {
        d3.event.preventDefault();
        if (currentIndex > 0) {
          currentIndex--;
          chooseDate(availableDates[currentIndex]);
        }
      });

    controlContainer.append("ul")
      .selectAll("li")
      .data(availableDates)
      .enter()
      .append("li")
      .classed("active", function(listItemDate, listItemIndex) {
        return listItemDate.getTime() == availableDates[currentIndex].getTime()
      })
      .text(function(listItemDate) {
        return timeTickFormatter(listItemDate);
      });
    controlContainer.append("a")
      .attr("class", "nav-arrow")
      .attr("title", "Go to Next Period")
      .attr("href", "#")
      .html("&gt;")
      .on("click", function(eventData) {
        d3.event.preventDefault();
        if (currentIndex < availableDates.length - 1) {
          currentIndex++;
          chooseDate(availableDates[currentIndex]);
        }
      });

    this.activate = function(selectionDate) {
      chooseDate(selectionDate, true)
    };

    function chooseDate(selectedTime, suppressCallback) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      timeoutHandle = setTimeout(function() {

        currentIndex = availableDates.map(function(t) {
          return t.getTime()
        }).indexOf(selectedTime.getTime());

        controlContainer
          .selectAll("li")
          .classed("active", function(liDate, liIndex) {
            return liDate.getTime() == selectedTime.getTime()
          });
        if (!suppressCallback) {
          markDataPoint(selectedTime);
          configSettings.callback({
            time: selectedTime
          });
        }

      }, 200);
    }
  }

  dateRangePicker = new DateNavigator();

  graphDisplay.selectAll("g.data-marker")
    .on("click", function(clickedPoint) {
      markDataPoint(clickedPoint.occurrence);
      configSettings.callback(clickedPoint);
    });

  function markDataPoint(momentInTime) {

    graphDisplay
      .selectAll("g.data-marker")
      .classed("active", function(pointTime) {
        return momentInTime.getTime() == pointTime.occurrence.getTime();
      });

    mainCanvas.select(".horizontal.axis")
      .selectAll(".tick")
      .classed("active", function(axisTick) {
        return momentInTime.getTime() == axisTick.getTime();
      });

    dateRangePicker.activate(momentInTime);
  }
  markDataPoint(timeScale.ticks()[timeScale.ticks().length - 1]);
}