(function (expObj) {
  // Survey Correlation Visualizer - Version 1.0.0
  expObj.datavis = datavis;
  expObj.datavis.version = "1.0.0";

  function datavis(chartContainerId, inputData) {
    var surveyItems = inputData.surveyQuestions;
    var participantAnswers = inputData.surveyResponses;

    // Build a mapping from question label to their numerical index for
    // efficient coordinate calculations on survey answers.
    var answerMap = {};
    surveyItems.forEach(function (item) {
      answerMap[item.identifier] = {};
      item.options.forEach(function (option, optionIndex) {
        answerMap[item.identifier][option] = optionIndex;
      });
    });

    // Convert non-numeric responses into their corresponding numerical
    // index found in the answerMap. This ensures crossfilter compatibility.
    participantAnswers.forEach(function (responseEntry) {
      surveyItems.forEach(function (item) {
        responseEntry[item.identifier] = answerMap[item.identifier][responseEntry[item.identifier]];
      });
    });

    // Append the question text to the display area.
    surveyItems.forEach(function (item) {
      d3.select(chartContainerId)
        .append("div")
        .attr("id", item.identifier + "-visual")
        .attr("class", "survey-visual plot")
        .append("div")
        .attr("class", "title_text")
        .text(item.identifier + '. ' + item.wording);
    });

    // Define various formatting utilities.
    const numFormatter = d3.format(",d");

    // Initialize the crossfilter instance for relevant dimensions and groups.
    var surveyParticipants = crossfilter(participantAnswers),
      totalSelection = surveyParticipants.groupAll();
    var dataDimensions = [];
    var dataGroups = [];
    surveyItems.forEach(function (item, idx) {
      dataDimensions.push(surveyParticipants.dimension(function (entry) {
        return entry[item.identifier]
      }));
      dataGroups.push(dataDimensions[idx].group());
    });

    // Store the total count of participants in each group. This value is
    // later used to accurately determine proportion lines.
    dataGroups.forEach(function (grp) {
      grp._fullSet_ = grp.all().map(function (obj) {
        return obj.value
      });
    });

    // Generate a chart for each data dimension.
    var xAxisScales = [],
      currentXScale;
    const yAxisScale = d3.scale.linear().range([100, 0]);
    var infoBubbles = [],
      currentInfoBubble;
    var plotVisuals = [],
      currentPlot;
    const columnWidth = 80;
    const columnSpacing = 3;

    surveyItems.forEach(function (item, idx) {

      // Extract the labels for the current axis.
      var axisLabels = {};
      item.options.forEach(function (optionText, optionIdx) {
        axisLabels[optionIdx] = optionText;
      });

      // Initialize tooltips if the d3.tip library is available.
      if (d3.tip_library) {
        currentInfoBubble = d3.tip_library()
          .attr('class', 'd3-info-bubble')
          .direction('s')
          .html(function (val) {
            return "item " + val
          });
        infoBubbles.push(currentInfoBubble);
      }

      // Configure the x-axis scale.
      var startVal = 0,
        endVal = item.options.length - 1;
      currentXScale = d3.scale.linear()
        .domain([-0.5, endVal + 0.5])
        .rangeRound([0, columnWidth * ((endVal - startVal) + 1)]);
      currentXScale.labels = axisLabels;
      xAxisScales.push(currentXScale);

      // Adjust the y-axis scale to accommodate the maximum possible domain,
      // ensuring consistent heights and areas across all charts.
      yAxisScale.domain([0, d3.max([
        yAxisScale.domain()[1], dataGroups[idx].top(1)[0].value
      ])]);

      // Create the bar chart instance.
      currentPlot = columnPlot(item)
        .dataDimension(dataDimensions[idx])
        .dataGroup(dataGroups[idx])
        .xAccessor(currentXScale);
      plotVisuals.push(currentPlot);

    });

    // Given the array of charts, assumed to be in the same order as DOM elements,
    // bind them to the DOM and render. Listen for brush events to update the display.
    var currentPlotter = d3.selectAll(".survey-visual.plot")
      .data(plotVisuals)
      .each(function (plot) {
        plot.on("brush_event", refreshAllVisuals)
          .on("brush_end_event", refreshAllVisuals);
      });

    // Add a summary element to display the fraction of currently selected items.
    var summary_box = d3.select(chartContainerId)
      .append("div") // Changed from aside to div
      .attr("id", "summary_box")
      .attr("class", "survey-visual")
      .html("<div style='clear:both;margin-top:20px'></div>" +
        "<span id='current_count'>-</span> " +
        "<span>/</span> <span id='full_count'>-</span> <br/> selected participants");
    const summary_box_width = 300,
      summary_box_height = 120;
    var summary_svg_element = summary_box.insert("svg", "div")
      .attr("width", summary_box_width)
      .attr("height", summary_box_height)
      .append("g")
      .attr("transform", "translate(0,0)");

    // Add a clear div at the bottom as a temporary fix for issue #18.
    d3.select(chartContainerId)
      .append("div")
      .style("clear", "both");

    // Draw the bars for the summary box.
    summary_svg_element.selectAll(".column")
      .data(["all_background", "background_fill", "foreground_fill",
        "all_proportion"
      ])
      .enter().append("path")
      .attr("class", function (d, i) {
        if (i === 0) {
          return "survey-visual " + d + " total_bar result";
        } else if (i === 3) {
          return "survey-visual " + d + " total_bar result";
        }
        return "survey-visual " + d + " column result";
      });
    summary_svg_element.select(".all_background.total_bar")
      .attr("d", ["M", (summary_box_width - (columnWidth - 2 * columnSpacing)) / 2, ",", 10, "v", 100, "h", columnWidth - 2 * columnSpacing, "v", -100].join(""));
    summary_svg_element.select(".foreground_fill.column")
      .attr("d", ["M", (summary_box_width - (columnWidth - 2 * columnSpacing)) / 2, ",", 80, "v", 30, "h", columnWidth - 2 * columnSpacing, "v", -30].join(""));
    summary_svg_element.select(".all_proportion.total_bar")
      .attr("d", ["M", (summary_box_width - (columnWidth - 2 * columnSpacing)) / 2, ",", 40, "h", columnWidth - 2 * columnSpacing, "M", summary_box_width / 2, ",", 15, "v", 44].join(""));

    // Display "all participants" label.
    summary_svg_element.append("foreignObject")
      .attr("class", "survey-visual summary_label")
      .attr("width", (summary_box_width - columnWidth) / 2)
      .attr("height", "3em")
      .attr("x", summary_box_width / 2 + columnWidth / 2 + columnSpacing)
      .attr("y", 0)
      .text("all participants");
    summary_svg_element.append("path")
      .attr("class", "survey-visual summary_label")
      .attr("d", ["M", summary_box_width / 2 + columnWidth / 2, ",", 7,
        "h", -15, "l", -7, ",", 7
      ].join(""));

    // Display "selected participants" label.
    summary_svg_element.append("foreignObject")
      .attr("class", "survey-visual summary_label")
      .attr("width", (summary_box_width - columnWidth) / 2)
      .attr("height", "3em")
      .attr("x", summary_box_width / 2 + columnWidth / 2 + columnSpacing)
      .attr("y", 106)
      .text("selected participants");
    summary_svg_element.append("path")
      .attr("class", "survey-visual summary_label")
      .attr("d", ["M", summary_box_width / 2 + columnWidth / 2, ",", 113,
        "h", -15, "l", -7, ",", -7
      ].join(""));

    // Display "expected selected participants" label.
    summary_svg_element.append("foreignObject")
      .attr("class", "survey-visual summary_label")
      .attr("width", (summary_box_width - columnWidth) / 2)
      .attr("height", "3em")
      .attr("x", summary_box_width / 2 + columnWidth / 2 + columnSpacing)
      .attr("y", 35)
      .text("expected number of selected participants");
    summary_svg_element.append("path")
      .attr("class", "survey-visual summary_label")
      .attr("d", ["M", summary_box_width / 2 + columnWidth / 2, ",", 47,
        "h", -15, "l", -7, ",", -7
      ].join(""));

    // Display "variation in expected selected participants" label.
    summary_svg_element.append("foreignObject")
      .attr("class", "survey-visual summary_label right_align")
      .attr("width", (summary_box_width - columnWidth) / 2 - 20)
      .attr("height", "5em")
      .attr("x", 0)
      .attr("y", 12)
      .attr("text-align", "right")
      .text("variation in expected number of selected participants");
    summary_svg_element.append("path")
      .attr("class", "survey-visual summary_label")
      .attr("d", ["M", summary_box_width / 2 - columnWidth / 2 - 18, ",", 36,
        "h", 15, "v", 22, "h", 42,
        "M", summary_box_width / 2 - columnWidth / 2 - 3, ",", 36,
        "v", -22, "h", 42
      ].join(""));

    // If there is more than one type of question, render a color legend.
    var survey_item_types = d3.set_util(); // Renamed d3.set()
    surveyItems.forEach(function (item) {
      survey_item_types.add(item.itemType);
    });
    survey_item_types = survey_item_types.values();
    if (survey_item_types.length > 1) {
      var color_block_size = 20,
        color_block_spacing = 5;
      summary_box.insert("div", "svg")
        .style("clear", "both");
      var type_indicator_svg = summary_box.insert("svg", "div")
        .attr("width", summary_box_width)
        .attr("height", survey_item_types.length * (color_block_size + color_block_spacing) + color_block_spacing)
        .style("margin-bottom", 20)
        .append("g")
        .attr("transform", "translate(0,0)");

      type_indicator_svg.selectAll()
        .data(survey_item_types).enter()
        .append("path")
        .attr("class", function (d) {
          return "survey-visual foreground_fill column " + d
        })
        .attr("d", function (d, i) {
          return ["M", summary_box_width / 2 - color_block_size / 2, ",",
            color_block_spacing + i * (color_block_size + color_block_spacing),
            "h", color_block_size, "v", color_block_size, "h", -color_block_size
          ]
            .join("")
        });
      type_indicator_svg.selectAll()
        .data(survey_item_types).enter()
        .append("text")
        .attr("class", "survey-visual summary_label")
        .attr("x", summary_box_width / 2 + color_block_size / 2 + columnSpacing)
        .attr("y", function (d, i) {
          return color_block_spacing + i * (color_block_size + color_block_spacing) + color_block_size / 2
        })
        .attr("dy", "0.35em")
        .text(function (d) {
          return d
        });
    }

    // Render the total count of participants.
    d3.selectAll("div.survey-visual #full_count")
      .text(numFormatter(surveyParticipants.size()));

    refreshAllVisuals();

    // Renders the specified visual or list.
    function applyRenderer(renderFunction) {
      d3.select(this).call(renderFunction);
    }

    // Whenever the brush moves, re-render all visuals.
    function refreshAllVisuals() {
      currentPlotter.each(applyRenderer);
      d3.select("div.survey-visual #current_count").text(numFormatter(totalSelection.value()));
    }

    window.applyChartFilters = function (filterValues) {
      filterValues.forEach(function (val, index) {
        plotVisuals[index].applyFilter(val);
      });
      refreshAllVisuals();
    };

    window.clearChartFilter = function (index) {
      plotVisuals[index].applyFilter(null);
      refreshAllVisuals();
    };

    function columnPlot(surveyItem) {
      if (!columnPlot.instanceId) columnPlot.instanceId = 0;

      const padding = {
          top: 10,
          right: 10,
          bottom: 20,
          left: 10
        },
        xCoord,
        yCoord = yAxisScale,
        currentBubble = infoBubbles[columnPlot.instanceId],
        plotIdentifier = columnPlot.instanceId++,
        axisComponent = d3.svg.axis().orient("bottom").tickSize(6, 0, 0),
        selectionBrush = d3.svg.brush(),
        dataDimension,
        dataGroup,
        roundValue;

      function plotFunction(containerDiv) {
        const availableWidth = d3.max(xCoord.range()),
          availableHeight = d3.max(yCoord.range());

        // Create ticks at specific values.
        axisComponent.tickValues(d3.range(0, d3.keys(xCoord.labels).length));

        containerDiv.each(function () {
          var containerElement = d3.select(this),
            gElement = containerElement.select("g");

          // Initialize the chart's skeletal structure.
          if (gElement.empty()) {
            containerElement.select(".title_text").append("a")
              .attr("href", "javascript:clearChartFilter(" + plotIdentifier + ")")
              .attr("class", "survey-visual reset_button")
              .text("reset")
              .style("display", "none");

            gElement = containerElement.append("svg")
              .attr("width", availableWidth + padding.left + padding.right)
              .attr("height", availableHeight + padding.top + padding.bottom)
              .append("g")
              .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

            // Create a hatching pattern for visualizing the brush selection.
            // Reference: http://stackoverflow.com/a/14500054/564709
            const hatchPattern = containerElement.select("svg")
              .insert("pattern", "g")
              .attr("id", "diagonalHatch_" + plotIdentifier) // Unique ID
              .attr("patternUnits", "userSpaceOnUse")
              .attr("width", 10)
              .attr("height", 10);
            hatchPattern.append("path")
              .attr("class", "survey-visual hatching_style")
              .attr("d", "M-1,1l2,-2M0,10l10,-10M9,11l2,-2");

            // Invoke the info bubble for this visualization.
            if (currentBubble) {
              gElement.call(currentBubble);
            }

            gElement.append("clipPath")
              .attr("id", "clip-" + plotIdentifier)
              .append("rect")
              .attr("width", availableWidth)
              .attr("height", availableHeight);

            gElement.selectAll(".column")
              .data(["all_background", "background_fill", "foreground_fill",
                "all_proportion"
              ])
              .enter().append("path")
              .attr("class", function (d, i) {
                if (i === 0) {
                  return "survey-visual " + d + " total_bar " + surveyItem.itemType;
                } else if (i === 3) {
                  return "survey-visual " + d + " total_bar " + surveyItem.itemType;
                }
                return "survey-visual " + d + " column " + surveyItem.itemType;
              })
              .datum(dataGroup.all());

            gElement.selectAll(".foreground_fill.column")
              .attr("clip-path", "url(#clip-" + plotIdentifier + ")");

            gElement.append("g")
              .attr("class", "survey-visual axis_group")
              .attr("transform", "translate(0," + availableHeight + ")")
              .call(axisComponent);

            // Manipulate the axis label text for display.
            var axisLabels_selection = gElement.selectAll("g.axis_group text")
              .text(function (val) {
                var maxLen = 20;
                var s_text = xCoord.labels[val];
                if (s_text === undefined) {
                  return '';
                } else if (s_text.length > maxLen) {
                  var parts = s_text.substring(0, maxLen - 3).split(" ");
                  s_text = parts.slice(0, parts.length - 1).join(" ");
                  s_text += "...";
                }
                return s_text;
              });
            if (currentBubble) {
              currentBubble.html(function (val) {
                return xCoord.labels[val];
              });
              axisLabels_selection.on("mouseover", currentBubble.show)
                .on("mouseout", currentBubble.hide);
            }

            // Initialize the brush component with aesthetic resize handles.
            var brushGroup = gElement.append("g")
              .attr("class", "survey-visual selection_brush")
              .call(selectionBrush);
            brushGroup.selectAll("rect")
              .attr("fill", "url(#diagonalHatch_" + plotIdentifier + ")") // Use unique ID
              .attr("height", availableHeight);
            brushGroup.selectAll(".resize")
              .append("path")
              .attr("d", resizePath);
          }

          // This section uses the group data to set the path.
          gElement.selectAll(".column").attr("d", columnPath);

          // Render the .all_background.total_bar data only once at the beginning.
          gElement.selectAll(".all_background.total_bar")
            .attr("d", function (groupData, index) {
              var existingPath = d3.select(this).attr("d");
              if (existingPath === null) {
                return columnPath(groupData, index);
              }
              return existingPath;
            });

          // Render the .all_proportion.total_bar to indicate the
          // proportion of selected responses within this group.
          if (selectionBrush.empty()) {
            gElement.selectAll(".all_proportion.total_bar")
              .attr("d", ratioPath);
          }

          // Ensure asterisks are removed from dimensions that are currently selected.
          else {
            gElement.selectAll(".significance_marker").remove();
          }
        });

        function columnPath(groupData) {
          var pathSegments = [],
            currentIdx = -1,
            totalItems = groupData.length,
            currentEntry;
          while (++currentIdx < totalItems) {
            currentEntry = groupData[currentIdx];
            pathSegments.push("M", xCoord(currentEntry.key - 0.5) + columnSpacing, ",",
              availableHeight, "V", yCoord(currentEntry.value), "h", columnWidth - 2 * columnSpacing,
              "V", availableHeight);
          }
          return pathSegments.join("");
        }

        // Previous versions simulated a random process 250 times to estimate
        // 95% confidence intervals. This caused flickering. This approach uses an
        // approximation for the 95% confidence interval, providing an exact
        // solution and avoiding the flickering problem.
        // Reference: http://stats.stackexchange.com/a/19142/31771
        function calculateUncertaintyIntervals() {
          var totalPopulation = d3.sum(dataGroup._fullSet_);
          var selectedPopulation = totalSelection.value();

          // Create an array of probabilities for each group. Alpha is the
          // hyperparameter of the categorical distribution.
          // Reference: http://en.wikipedia.org/wiki/Categorical_distribution
          var probabilities = [],
            alphaParam = 1;
          dataGroup._fullSet_.forEach(function (valueElement) {
            probabilities.push((valueElement + alphaParam) / (totalPopulation + alphaParam * dataGroup._fullSet_.length));
          });

          var confidenceIntervals = [],
            intervalBound;
          probabilities.forEach(function (probability) {
            intervalBound = 1.96 * Math.sqrt((probability * (1 - probability)) / selectedPopulation);
            confidenceIntervals.push([
              selectedPopulation * Math.max(probability - intervalBound, 0),
              selectedPopulation * Math.min(probability + intervalBound, 1)
            ]);
          });
          console.log(confidenceIntervals);
          return confidenceIntervals;
        }

        function backgroundRect(xCenter) {
          return "M" + (xCenter - columnWidth / 2) + "," + (-padding.top) +
            "h" + columnWidth +
            "v" + (padding.top + yCoord.range()[0] + padding.bottom) + // Assuming yCoord.range() returns [max, min]
            "h" + (-columnWidth) +
            "Z";
        }

        function ratioPath(groupData) {

          // Remove any previous significance markers.
          var svgElement = d3.select(this.parentElement);
          svgElement.selectAll(".significance_marker").remove();

          var pathSegments = [],
            currentIndex = -1,
            numGroups = groupData.length,
            currentGroup, probability, lowerBound, upperBound,
            totalActiveSelection = totalSelection.value(),
            confidenceIntervals;
        }
      }
    }
  }
})(window);