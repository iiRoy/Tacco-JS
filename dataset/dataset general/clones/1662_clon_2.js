var FinancialFlows = FinancialFlows || {};


FinancialFlows.flowDiagram = function (settingsObject) {


  var retrieveSubElements = function(inputCollection) {
    return _.reduce(
      _.map(inputCollection, function(currentItem) {
        return currentItem.children;
      }),
      function(accumulator, currentValue) {
        return accumulator.concat(currentValue);
      },
      []
    );
  };


  var extractShapeData = function(inputCollection) {
    return _.map(inputCollection, function(currentItem) {
      return {
        dataLabel: currentItem.dataLabel,
        dataLevel: currentItem.dataLevel
      };
    });
  };


  var buildUniqueItemList = function(inputCollection, accumulatedList) {
    var descendants = retrieveSubElements(inputCollection);
    if (_.uniq(descendants).length === 0) {
      return _.uniq(accumulatedList);
    } else {
      var shapeInstances = extractShapeData(descendants);
      accumulatedList = _.uniq(
        accumulatedList.concat(shapeInstances),
        function(currentItem) {
          return currentItem.dataLabel + "$" + currentItem.dataLevel;
        }
      );
      return buildUniqueItemList(descendants, accumulatedList);
    }
  };


  var assembleGraphComponents = function(itemCollection) {
    return {
      nodes: _.map(itemCollection, function(currentItem) {
        return {
          name: currentItem.dataLabel
        };
      }),
      itemMap: _.reduce(
        _.map(itemCollection, function(currentItem, indexVal) {
          return [currentItem.dataLabel + "$" + currentItem.dataLevel, indexVal];
        }),
        function(accumulator, currentValue) {
          accumulator[currentValue[0]] = currentValue[1];
          return accumulator;
        }, {}
      ),
      connections: []
    };
  };


  var constructEdgeList = function(inputCollection, graphStructure) {
    var descendants = retrieveSubElements(inputCollection);
    if (_.uniq(descendants).length === 0) {
      return graphStructure;
    } else {
      _.each(inputCollection, function(sourceNode) {
        _.each(sourceNode.children, function(destinationItem) {
          graphStructure.connections.push({
            origin: graphStructure.itemMap[sourceNode.dataLabel + "$" + sourceNode.dataLevel],
            destination: graphStructure.itemMap[destinationItem.dataLabel + "$" + destinationItem.dataLevel],
            quantity: destinationItem.magnitude
          });
        });
      });
      constructEdgeList(descendants, graphStructure);
    }
  };


  this.processFlowData = function(dataHierarchy) {
    var uniqueEntities = buildUniqueItemList([dataHierarchy], []);
    var graphStructure = assembleGraphComponents(uniqueEntities);
    constructEdgeList([dataHierarchy], graphStructure);


    console.log(uniqueEntities);
    console.log(graphStructure);


    var layoutPadding = {
      top: 1,
      right: 1,
      bottom: 6,
      left: 1
    };
    var containerElement = document.getElementById("chart");
    var chartWidth = containerElement.offsetWidth - layoutPadding.left - layoutPadding.right;
    var chartHeight = containerElement.offsetHeight - layoutPadding.top - layoutPadding.bottom;


    var numericalPresenter = d3.format(",.0f"),
      valueVisualizer = function(val) {
        return numericalPresenter(val) + " " + dataHierarchy.monetarySymbol;
      },
      visualPalette = d3.scale.category20();


    var graphicCanvas = d3.select("#chart").append("svg")
      .attr("width", chartWidth + layoutPadding.left + layoutPadding.right)
      .attr("height", chartHeight + layoutPadding.top + layoutPadding.bottom)
      .append("g")
      .attr("transform", "translate(" + layoutPadding.left + "," + layoutPadding.top + ")");


    var flowArrangement = d3.sankey()
      .nodeWidth(15)
      .nodePadding(5)
      .size([chartWidth, chartHeight]);


    var connectionPathGenerator = flowArrangement.link();


    flowArrangement.nodes(graphStructure.nodes)
      .connections(graphStructure.connections)
      .layout(32);


    var flowLinks = graphicCanvas.append("g").selectAll(".link-path")
      .data(graphStructure.connections)
      .enter().append("path")
      .attr("class", "link-path")
      .attr("d", connectionPathGenerator)
      .style("stroke-width", function(currentItem) {
        return Math.max(1, currentItem.dy);
      })
      .sort(function(itemA, itemB) {
        return itemB.dy - itemA.dy;
      });


    flowLinks.append("title")
      .text(function(currentItem) {
        return currentItem.origin.name + " - " + currentItem.destination.name +
          "\n" + valueVisualizer(currentItem.quantity);
      });


    var handleNodeMovement = function(draggedItem) {
      d3.select(this).attr("transform", "translate(" + draggedItem.x + "," + (draggedItem.y =
        Math.max(0, Math.min(chartHeight - draggedItem.dy, d3.event.y))) + ")");
      flowArrangement.relayout();
      flowLinks.attr("d", connectionPathGenerator);
    };


    var flowNodes = graphicCanvas.append("g").selectAll(".flow-node")
      .data(graphStructure.nodes)
      .enter().append("g")
      .attr("class", "flow-node")
      .attr("transform", function(currentItem) {
        return "translate(" + currentItem.x +
          "," + currentItem.y + ")";
      })
      .call(d3.behavior.drag().origin(function(currentItem) {
          return currentItem;
        })
        .on("dragstart", function() {
          this.parentNode.appendChild(this);
        })
        .on("drag", handleNodeMovement));


    flowNodes.append("rect")
      .attr("height", function(currentItem) {
        return currentItem.dy;
      })
      .attr("width", flowArrangement.nodeWidth())
      .style("fill", function(currentItem) {
        return currentItem.nodeColor = visualPalette(currentItem.name.replace(/ .*/, ""));
      })
      .style("stroke", function(currentItem) {
        return d3.rgb(currentItem.nodeColor).darker(2);
      })
      .append("title")
      .text(function(currentItem) {
        return currentItem.name + "\n" + valueVisualizer(currentItem.quantity);
      });


    flowNodes.append("text")
      .attr("x", -6)
      .attr("y", function(currentItem) {
        return currentItem.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(currentItem) {
        return currentItem.name;
      })
      .filter(function(currentItem) {
        return currentItem.x < chartWidth / 2;
      })
      .attr("x", 6 + flowArrangement.nodeWidth())
      .attr("text-anchor", "start");


  };


  settingsObject.callback = this.processFlowData;


  FinancialFlows.DataComposer(settingsObject);
};