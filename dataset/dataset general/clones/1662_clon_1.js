/*
 * This file contains the OpenSpending Sankey diagram visualization logic.
 * It's part of the OpenSpending library for data visualization.
 */

// Ensure OpenSpending namespace exists, or initialize it as an empty object.
var OpenSpending = OpenSpending || {
};

/**
 * Initializes the Sankey visualization for OpenSpending data.
 * @param {object} config - Configuration object for the Sankey diagram.
 *                          Expected to contain data and other settings.
 */
OpenSpending.sankey = function(config) {
  // --- Helper Functions for Data Processing ---

  /**
   * Recursively retrieves all children nodes from a given tree structure.
   * @param {Array<object>} t - An array of tree nodes, each potentially having a 'children' property.
   * @returns {Array<object>} A flat array containing all children nodes.
   */
  var getChildren = function(t) {
    // Use Underscore.js to map and reduce the children arrays.
    return _.reduce(
      _.map(t, function(d) {
        return d.children
      }),
      function(x, y) {
        return x.concat(y)
      },
      []
    );
  }; // End of getChildren function

  /**
   * Extracts basic node information (label and level) from a list of tree nodes.
   * @param {Array<object>} t - An array of tree nodes.
   * @returns {Array<object>} An array of objects, each with 'label' and 'level' properties.
   */
  var getNodes = function(t) {
    return _.map(t, function(d) {
      return {
        label: d.label,
        level: d.level
      }
    });
  }; // End of getNodes function

  /**
   * Recursively builds a unique list of all nodes in the tree.
   * Uses label and level to determine uniqueness.
   * @param {Array<object>} t - Current level of nodes to process.
   * @param {Array<object>} r - Accumulator for the resulting unique node list.
   * @returns {Array<object>} A unique list of all nodes from the tree.
   */
  var getNodeList = function(t, r) {
    // Get children for the current level
    c = getChildren(t);

    // Base case: if no more unique children, return the accumulated list
    if (_.uniq(c).length == 0) {
      return _.uniq(r)
    } else {
      // Recursive step: get nodes from children, add to accumulator, and recurse
      nodes = getNodes(c);
      r = _.uniq(r.concat(nodes), function(d) {
        return d.label + "$" + d.level;
      });
      return getNodeList(c, r);
    }
  }; // End of getNodeList function

  /**
   * Creates a Sankey-compatible node object structure from a list of nodes.
   * This includes an array of nodes and a lookup map for their indices.
   * @param {Array<object>} l - A list of nodes (from getNodeList).
   * @returns {object} An object containing 'nodes' (for D3) and 'nodelookup' (for link creation).
   */
  var makeNodeObject = function(l) {
    return {
      nodes: _.map(l, function(d) {
        return {
          name: d.label
        }
      }),
      // Create a lookup table for node indices based on their label and level
      nodelookup: _.reduce(
        _.map(l, function(d, i) {
          return ([d.label + "$" + d.level, i])
        }),
        function(x, y) {
          x[y[0]] = y[1];
          return x
        }, {}
      ),
      links: [] // Links array will be populated later
    };
  }; // End of makeNodeObject function

  /**
   * Recursively generates the list of links (edges) for the Sankey diagram.
   * Populates the 'links' property of the result object.
   * @param {Array<object>} l - Current level of nodes to process for links.
   * @param {object} r - The result object containing 'nodelookup' and 'links' array.
   */
  var makeLinkList = function(l, r) {
    // Get children for the current level to find potential links
    c = getChildren(l);

    // Base case: if no more unique children, return the result object
    if (_.uniq(c).length == 0) {
      return r
    } else {
      // Iterate through current level's children to create links
      _.each(c, function(s) {
        // For each child 's', iterate through its own children 'd'
        _.each(s.children, function(d) {
          // Push a new link object into the result's links array
          r.links.push({
            source: r.nodelookup[s.label + "$" + s.level], // Source node index
            target: r.nodelookup[d.label + "$" + d.level], // Target node index
            value: d.amount // Value of the link (flow)
          });
        });
      });
      // Recursive call for the next level of children
      makeLinkList(c, r);
    }
  }; // End of makeLinkList function

  // --- Main Callback Function for Visualization ---

  /**
   * The primary callback function that generates and renders the Sankey diagram.
   * This function is invoked once the data (tree structure) is ready.
   * @param {object} tree - The hierarchical data structure representing financial flows.
   */
  this.callback = function(tree) {
    // 1. Data Transformation: Prepare data for Sankey layout.
    // Get a flat list of all unique nodes in the tree.
    nl = getNodeList([tree], []);
    // Create the node object structure required by D3 Sankey.
    no = makeNodeObject(nl);
    // Populate the links array within the 'no' object.
    makeLinkList([tree], no);

    // For debugging purposes, log the processed node and link data.
    console.log(nl);
    console.log(no);

    // 2. Setup SVG and Dimensions
    // Define margins for the chart within the SVG container.
    var margin = {
      top: 1,
      right: 1,
      bottom: 6,
      left: 1
    };

    // Get the chart container element by ID.
    el = document.getElementById("chart");

    // Calculate the width and height of the chart area, accounting for margins.
    var width = el.offsetWidth - margin.left - margin.right;
    var height = el.offsetHeight - margin.top - margin.bottom;

    // 3. D3 Formatting and Color Scale
    // D3 number formatter for currency values.
    var formatNumber = d3.format(",.0f"),
      // Custom format function to append currency symbol.
      format = function(d) {
        return formatNumber(d) + " " + tree.currency
      },
      // D3 categorical color scale for nodes.
      color = d3.scale.category20();

    // 4. Create SVG Element
    // Select the chart container and append an SVG element.
    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right) // Set total SVG width
      .attr("height", height + margin.top + margin.bottom) // Set total SVG height
      .append("g") // Append a group element to apply margins via translation
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 5. Initialize D3 Sankey Layout
    var sankey = d3.sankey()
      .nodeWidth(15) // Width of the Sankey nodes
      .nodePadding(5) // Padding between nodes at the same level
      .size([width, height]); // Set the layout size

    // Define the D3 Sankey link path generator.
    var path = sankey.link();

    // 6. Apply Sankey Layout to Data
    sankey.nodes(no.nodes) // Provide nodes data to the layout
      .links(no.links) // Provide links data to the layout
      .layout(32); // Perform the Sankey layout calculation (iterations)

    // 7. Draw Links (Paths)
    var link = svg.append("g").selectAll(".link")
      .data(no.links) // Bind link data
      .enter().append("path") // Append a path for each link
      .attr("class", "link") // Assign CSS class
      .attr("d", path) // Set the 'd' attribute using the path generator
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      }) // Set stroke width based on link value
      .sort(function(a, b) {
        return b.dy - a.dy;
      }); // Sort links for proper rendering order

    // Add tooltips to links
    link.append("title")
      .text(function(d) {
        return d.source.name + " - " + d.target.name +
          "\n" + format(d.value);
      });

    // 8. Define Drag Behavior for Nodes
    /**
     * Function to handle node drag events.
     * Updates node position, relayouts Sankey, and redraws links.
     * @param {object} d - The data bound to the dragged node.
     */
    dragmove = function(d) {
      d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y =
        Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")"); // Update node position
      sankey.relayout(); // Recalculate link paths
      link.attr("d", path); // Redraw links
    }; // End of dragmove function

    // 9. Draw Nodes (Rectangles and Text)
    var node = svg.append("g").selectAll(".node")
      .data(no.nodes) // Bind node data
      .enter().append("g") // Append a group for each node
      .attr("class", "node") // Assign CSS class
      .attr("transform", function(d) {
        return "translate(" + d.x +
          "," + d.y + ")";
      }) // Position the node group
      .call(d3.behavior.drag().origin(function(d) {
          return d;
        }) // Enable drag behavior
        .on("dragstart", function() {
          this.parentNode.appendChild(this);
        }) // Bring dragged node to front
        .on("drag", dragmove)); // Call dragmove on drag event

    // Append rectangles for nodes
    node.append("rect")
      .attr("height", function(d) {
        return d.dy;
      }) // Set height based on node value
      .attr("width", sankey.nodeWidth()) // Set width from Sankey layout
      .style("fill", function(d) {
        return d.color = color(d.name.replace(/ .*/, ""));
      }) // Set fill color
      .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2);
      }) // Set stroke color
      .append("title") // Add tooltip to node rectangle
      .text(function(d) {
        return d.name + "\n" + format(d.value)
      });

    // Append text labels for nodes
    node.append("text")
      .attr("x", -6) // Position text relative to node
      .attr("y", function(d) {
        return d.dy / 2;
      }) // Vertically center text
      .attr("dy", ".35em") // Fine-tune vertical alignment
      .attr("text-anchor", "end") // Align text to the end (right side of text)
      .attr("transform", null) // Remove any inherited transform
      .text(function(d) {
        return d.name;
      }) // Set text content
      .filter(function(d) {
        return d.x < width / 2;
      }) // Filter nodes on the left side
      .attr("x", 6 + sankey.nodeWidth()) // Reposition text for left-side nodes
      .attr("text-anchor", "start"); // Change text anchor for left-side nodes

  }; // End of this.callback function

  // --- Initialization ---
  // Assign the generated callback function to the config object.
  config.callback = this.callback;

  // Call the OpenSpending Aggregator to fetch and process data,
  // which will eventually invoke our callback.
  OpenSpending.Aggregator(config);
}; // End of OpenSpending.sankey function