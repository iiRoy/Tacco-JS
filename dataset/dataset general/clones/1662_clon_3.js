const FinancialFlows = FinancialFlows || {};

/**
 * Initializes and renders a Sankey-like flow diagram based on hierarchical financial data.
 * This is a highly modified Type III clone of the original OpenSpending Sankey visualization,
 * incorporating extensive refactoring, new features, and robust error handling.
 *
 * @param {object} renderSettings - Configuration object for the visualization.
 * @param {string} renderSettings.containerSelector - CSS selector for the chart container element (e.g., "#flow-chart-area").
 * @param {string} [renderSettings.currencySymbol='$'] - Symbol to display next to monetary values.
 * @param {function} [renderSettings.onDataProcessed] - Optional callback to execute after data processing is complete.
 */
FinancialFlows.renderBudgetFlow = function(renderSettings) {

  // --- Core Data Transformation Utilities (Extensively Modified) ---

  /**
   * Extracts all direct child entities from a given array of parent entities.
   * This function has been refactored to leverage modern JavaScript Array.prototype.flatMap
   * for a more concise and functional approach.
   * @param {Array<object>} parentEntities - An array of objects, where each object may contain a 'children' array.
   * @returns {Array<object>} A flattened array containing all immediate children. Returns an empty array if input is invalid.
   */
  const extractDirectDescendants = (parentEntities) => {
    // Input validation: Ensure a valid array is provided.
    if (!Array.isArray(parentEntities) || parentEntities.length === 0) {
      console.debug("No parent entities provided for descendant extraction; returning empty array.");
      return [];
    }
    // Using flatMap to efficiently get all children and flatten the result into a single array.
    return parentEntities.flatMap(parent => parent.children || []);
  };

  /**
   * Transforms raw hierarchical tree nodes into a simplified structure suitable for
   * unique identification and basic Sankey node representation.
   * Node properties are renamed for improved clarity and consistency.
   * @param {Array<object>} sourceBranches - An array of branch objects from the original financial tree.
   * @returns {Array<object>} An array of simplified node objects, each with 'identifier' and 'depth' properties.
   */
  const createSimplifiedNodeRepresentations = (sourceBranches) => {
    // A small guard clause for empty input.
    if (!sourceBranches || sourceBranches.length === 0) {
      return [];
    }
    return sourceBranches.map(branchInfo => ({
      identifier: branchInfo.label, // Renamed from 'label'
      depth: branchInfo.level       // Renamed from 'level'
    }));
  };

  /**
   * Recursively (but implemented iteratively for robustness) traverses the financial tree
   * to build a comprehensive and unique list of all nodes present in the data structure.
   * This version employs an iterative approach with a Set for efficient uniqueness tracking
   * to prevent potential stack overflows in deeply nested trees.
   *
   * @param {Array<object>} initialRootNodes - The starting nodes for the traversal (typically the root of the tree).
   * @returns {Array<object>} A sorted array of unique node definitions, each containing 'identifier' and 'depth'.
   */
  const buildComprehensiveNodeSet = (initialRootNodes) => {
    // Ensure we start with a valid array of nodes.
    if (!Array.isArray(initialRootNodes) || initialRootNodes.length === 0) {
      return [];
    }

    const uniqueNodeKeys = new Set(); // Stores unique keys (e.g., "Label$Level") to track processed nodes.
    const finalNodeDefinitions = [];  // Accumulates the unique simplified node objects.
    const traversalQueue = [...initialRootNodes]; // Uses a queue for breadth-first iterative traversal.

    let head = 0; // Pointer for the queue, optimizing array shifts.

    while (head < traversalQueue.length) {
      const currentBranch = traversalQueue[head++]; // Get the next node from the queue.

      // Construct a unique key for the current node based on its identifier and depth.
      const nodeKey = `${currentBranch.label}$${currentBranch.level}`;

      // If this node key hasn't been seen before, add its simplified representation.
      if (!uniqueNodeKeys.has(nodeKey)) {
        finalNodeDefinitions.push({
          identifier: currentBranch.label,
          depth: currentBranch.level
        });
        uniqueNodeKeys.add(nodeKey); // Mark this node as processed.
      }

      // If the current branch has children, add them to the queue for future processing.
      const childrenOfCurrent = currentBranch.children || [];
      if (childrenOfCurrent.length > 0) {
        traversalQueue.push(...childrenOfCurrent);
      }
    }

    // Sort the final node definitions for consistent ordering, useful for debugging or specific D3 layouts.
    finalNodeDefinitions.sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.identifier.localeCompare(b.identifier);
    });

    return finalNodeDefinitions;
  };

  /**
   * Prepares the fundamental data structure required by the D3 Sankey layout generator.
   * This includes a list of all distinct nodes and a fast lookup map from unique node keys to their array indices.
   * @param {Array<object>} nodeDefinitions - A list of unique node objects (identifier, depth).
   * @returns {object} An object containing 'sankeyNodes', 'nodeIndexLookupMap', and an empty 'flowLinks' array.
   */
  const initializeFlowGraphData = (nodeDefinitions) => {
    // Robust input validation.
    if (!Array.isArray(nodeDefinitions) || nodeDefinitions.length === 0) {
      console.error("Attempted to initialize graph data with an empty or invalid node definition list.");
      return { sankeyNodes: [], nodeIndexLookupMap: new Map(), flowLinks: [] };
    }

    // Transform simplified node definitions into the format D3 Sankey expects for nodes.
    const sankeyNodes = nodeDefinitions.map(nodeDef => ({ entityName: nodeDef.identifier })); // Renamed 'name' to 'entityName'.
    const nodeIndexLookupMap = new Map(); // Using a Map for efficient "label$level" -> index lookup.

    // Populate the lookup map.
    nodeDefinitions.forEach((nodeDef, index) => {
      nodeIndexLookupMap.set(`${nodeDef.identifier}$${nodeDef.depth}`, index);
    });

    // Add a diagnostic check.
    if (sankeyNodes.length !== nodeIndexLookupMap.size) {
      console.warn("Potential data integrity issue: Mismatch between number of graph nodes and lookup map size.");
    }

    return {
      sankeyNodes: sankeyNodes,
      nodeIndexLookupMap: nodeIndexLookupMap, // Renamed from nodelookup to nodeIndexLookupMap.
      flowLinks: [], // This array will be populated by 'generateSankeyFlowConnections'.
      totalDistinctNodes: sankeyNodes.length // Added new property for metadata.
    };
  };

  /**
   * Populates the 'flowLinks' array within the graph data bundle by traversing the hierarchical tree.
   * This function utilizes an iterative breadth-first traversal to robustly handle tree structures
   * and create connections (links) between parent and child nodes based on their financial 'amount'.
   *
   * @param {Array<object>} parentStructure - The initial hierarchical tree structure to traverse (e.g., [rootNode]).
   * @param {object} graphDataBundle - The object containing 'sankeyNodes', 'nodeIndexLookupMap', and 'flowLinks' to be populated.
   */
  const generateSankeyFlowConnections = (parentStructure, graphDataBundle) => {
    // Essential input validation.
    if (!graphDataBundle || !graphDataBundle.nodeIndexLookupMap || !Array.isArray(graphDataBundle.flowLinks)) {
      console.error("Invalid graph data bundle provided for link generation. Aborting.");
      return;
    }

    const traversalQueue = [...parentStructure]; // Initialize queue with the starting structure.
    let currentLinkCount = 0; // Tracks the number of generated links.
    let head = 0; // Pointer for the queue.

    while (head < traversalQueue.length) {
      const currentParent = traversalQueue[head++]; // Get the next parent node to process.

      // Ensure the current parent is valid and has children to process as links.
      if (currentParent && Array.isArray(currentParent.children) && currentParent.children.length > 0) {
        currentParent.children.forEach(childNode => {
          // Construct unique keys for both the source and target nodes.
          const sourceKey = `${currentParent.label}$${currentParent.level}`;
          const targetKey = `${childNode.label}$${childNode.level}`;

          // Retrieve the numerical indices for source and target nodes using the lookup map.
          const sourceIndex = graphDataBundle.nodeIndexLookupMap.get(sourceKey);
          const targetIndex = graphDataBundle.nodeIndexLookupMap.get(targetKey);

          // Only create a link if both source and target nodes are found in our pre-built set of unique nodes.
          if (sourceIndex !== undefined && targetIndex !== undefined) {
            // Add the link object to the flowLinks array.
            // Using 'flowValue' instead of 'value' for enhanced clarity.
            // A guard for non-positive amounts: only include links with positive flow.
            if (childNode.amount > 0) {
              graphDataBundle.flowLinks.push({
                source: sourceIndex,
                target: targetIndex,
                flowValue: childNode.amount // Renamed from 'amount' to 'flowValue'.
              });
              currentLinkCount++;
            }
          } else {
            console.warn(`Skipping link: Source (${sourceKey}) or Target (${targetKey}) not found in index map. Data inconsistency possible.`);
          }

          // Add the child to the queue to continue the traversal down the tree.
          traversalQueue.push(childNode);
        });
      }
    }
    console.debug(`Successfully generated ${currentLinkCount} financial flow connections.`);
  };

  // --- Main Visualization Rendering Logic (Extensively Modified) ---

  /**
   * The primary function responsible for orchestrating the data processing and rendering
   * of the Sankey diagram. This function is designed to be invoked as a callback
   * after the initial financial tree data has been loaded or prepared.
   *
   * @param {object} financialTreeData - The root object of the hierarchical financial data structure.
   */
  this.renderVisualization = (financialTreeData) => {
    // --- Initial Input Validation and Environment Setup ---
    if (!financialTreeData || typeof financialTreeData !== 'object' || !financialTreeData.label) {
      console.error("Invalid or empty financial tree data provided for visualization. Rendering aborted.");
      return;
    }

    // Use a robust selector for the chart container.
    const chartContainerElement = document.querySelector(renderSettings.containerSelector || "#flow-chart-area");
    if (!chartContainerElement) {
      console.error(`Chart container element not found using selector: '${renderSettings.containerSelector || "#flow-chart-area"}'. Rendering aborted.`);
      return;
    }

    // Step 1: Build the comprehensive and unique list of all nodes from the entire financial tree.
    // The original `getNodeList` was recursive; `buildComprehensiveNodeSet` is iterative for robustness.
    const distinctNodesList = buildComprehensiveNodeSet([financialTreeData]);

    // Step 2: Initialize the Sankey graph data structure with nodes and a lookup map.
    const sankeyGraphData = initializeFlowGraphData(distinctNodesList);

    // Step 3: Populate the links (flow connections) within the graph data structure.
    generateSankeyFlowConnections([financialTreeData], sankeyGraphData);

    // --- D3.js Visualization Setup ---
    // Define padding for the visualization area, renamed from 'margin'.
    const chartLayoutPadding = { top: 12, right: 12, bottom: 25, left: 12 };
    
    // Dynamically calculate the dimensions of the drawing area based on the container.
    const containerWidth = chartContainerElement.offsetWidth;
    const containerHeight = chartContainerElement.offsetHeight;

    const actualDrawingWidth = containerWidth - chartLayoutPadding.left - chartLayoutPadding.right;
    const actualDrawingHeight = containerHeight - chartLayoutPadding.top - chartLayoutPadding.bottom;

    // Data formatting utilities for displaying monetary values.
    const moneyFormat = d3.format(",.0f"); // Renamed from 'formatNumber'.
    const formatDisplayValue = (value) => `${moneyFormat(value)} ${renderSettings.currencySymbol || financialTreeData.currency || '$'}`; // More robust currency symbol handling.
    const nodeColorAssigner = d3.scaleOrdinal(d3.schemeCategory20); // Using D3v4+ scaleOrdinal and a standard color scheme.

    // Clear any existing SVG content within the container to allow for clean re-rendering.
    d3.select(chartContainerElement).selectAll("svg").remove();

    // Append the main SVG canvas and a group for chart content.
    const svgVisualizationCanvas = d3.select(chartContainerElement).append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("aria-label", "Financial Flow Sankey Diagram") // Added accessibility attribute.
      .append("g")
      .attr("transform", `translate(${chartLayoutPadding.left},${chartLayoutPadding.top})`); // Using template literals for transform.

    // Initialize the D3 Sankey layout generator with adjusted parameters.
    const sankeyDiagramLayout = d3.sankey()
      .nodeWidth(18)   // Slightly adjusted node width.
      .nodePadding(10) // Slightly adjusted node padding.
      .size([actualDrawingWidth, actualDrawingHeight])
      .iterations(50); // Increased iterations for potentially more stable layouts.

    // Define the path generator for drawing links.
    const linkPathDrawer = sankeyDiagramLayout.link();

    // Compute the Sankey layout based on the processed nodes and links.
    sankeyDiagramLayout
      .nodes(sankeyGraphData.sankeyNodes) // Renamed from 'nodes' to 'sankeyNodes'.
      .links(sankeyGraphData.flowLinks)   // Renamed from 'links' to 'flowLinks'.
      .relayout(); // Explicitly call relayout after setting nodes/links for initial positioning.

    // --- Render Flow Links (Paths) ---
    const flowPathsContainer = svgVisualizationCanvas.append("g").attr("class", "sankey-flow-links"); // Group for links.

    const visualFlowLinks = flowPathsContainer.selectAll(".flow-connection")
      .data(sankeyGraphData.flowLinks)
      .enter().append("path")
      .attr("class", "flow-connection")
      .attr("d", linkPathDrawer)
      .style("stroke-width", (d) => Math.max(1, d.dy)) // Ensure a minimum stroke width for visibility.
      .sort((a, b) => b.dy - a.dy); // Sort by thickness to prevent smaller links from being obscured by larger ones.

    // Add tooltips for flow links to provide detailed information on hover.
    visualFlowLinks.append("title")
      .text((d) => `${d.source.entityName} → ${d.target.entityName}\n${formatDisplayValue(d.flowValue)}`); // Updated property names.

    // --- Node Drag Handler Function ---
    const handleNodeDragEvent = function(d) {
      // Basic input validation for the drag event object.
      if (!d3.event || d3.event.x === undefined || d3.event.y === undefined) {
          console.warn("Invalid D3 drag event encountered during node movement.");
          return;
      }
      // Update node position, clamping coordinates within the chart boundaries.
      d.x = Math.max(0, Math.min(actualDrawingWidth - d.dx, d3.event.x));
      d.y = Math.max(0, Math.min(actualDrawingHeight - d.dy, d3.event.y));

      d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
      sankeyDiagramLayout.relayout(); // Recalculate layout after node position change.
      visualFlowLinks.attr("d", linkPathDrawer); // Redraw all links to reflect new node positions.
    };

    // --- Render Sankey Nodes ---
    const sankeyNodesContainer = svgVisualizationCanvas.append("g").attr("class", "sankey-nodes-group"); // Group for nodes.

    const displayNodes = sankeyNodesContainer.selectAll(".sankey-node-item")
      .data(sankeyGraphData.sankeyNodes)
      .enter().append("g")
      .attr("class", "sankey-node-item")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .call(d3.drag() // Using d3.drag() for D3v4+ instead of d3.behavior.drag().
        .subject((d) => d) // Defines the data to be dragged.
        .on("start", function() { this.parentNode.appendChild(this); }) // Bring the dragged node to the front of its group.
        .on("drag", handleNodeDragEvent) // Assign the drag handler.
      );

    // Append rectangles for each node.
    displayNodes.append("rect")
      .attr("height", (d) => d.dy)
      .attr("width", sankeyDiagramLayout.nodeWidth())
      .style("fill", (d) => d.color = nodeColorAssigner(d.entityName.replace(/ .*/, ""))) // Use 'entityName' for coloring.
      .style("stroke", (d) => d3.rgb(d.color).darker(2)) // Darker stroke for contrast.
      .attr("data-node-identifier", (d) => d.entityName) // Added a custom attribute for easier identification.
      .append("title")
      .text((d) => `${d.entityName}\n${formatDisplayValue(d.value)}`); // Updated property names for tooltip.
    
    // Append text labels for each node.
    displayNodes.append("text")
      .attr("x", -10) // Adjusted x offset for left-aligned text.
      .attr("y", (d) => d.dy / 2)
      .attr("dy", ".45em") // Slightly adjusted dy for vertical alignment.
      .attr("text-anchor", "end")
      .attr("transform", null) // Ensure no inherited transform for text.
      .text((d) => d.entityName)
      .filter((d) => d.x < actualDrawingWidth / 2) // Filter for nodes positioned on the left half of the chart.
        .attr("x", 10 + sankeyDiagramLayout.nodeWidth()) // Adjusted x offset for right-aligned text.
        .attr("text-anchor", "start");

    // Optional: Log a success message to the console.
    console.info("Sankey visualization rendering completed successfully.");
  };

  // Assign the `renderVisualization` function as the callback for the data processor.
  // This ensures that the visualization is rendered once the data is ready.
  renderSettings.onDataProcessed = this.renderVisualization;
  
  // Delegate the data loading and initial processing to a separate module or service.
  // Renamed `OpenSpending.Aggregator` to `FinancialFlows.dataProcessor` for consistency.
  FinancialFlows.dataProcessor(renderSettings);
};

// --- Placeholder for the Data Processing Module ---
// In a real application, this module would handle fetching, parsing, and initial structuring
// of the financial data, then invoke the `onDataProcessed` callback.
FinancialFlows.dataProcessor = function(options) {
    console.log("FinancialFlows.dataProcessor initiated with options:", options);
    // Simulate an asynchronous data loading operation (e.g., an AJAX request).
    setTimeout(() => {
        // This 'dummyTree' represents the data that would typically be loaded from an external source.
        const dummyTreeData = {
            label: "Global Budget Allocation", level: 0, amount: 1500000, currency: "EUR",
            children: [
                { label: "Public Services", level: 1, amount: 750000,
                    children: [
                        { label: "Healthcare Sector", level: 2, amount: 400000, children: [] },
                        { label: "Education Initiatives", level: 2, amount: 350000, children: [] }
                    ]
                },
                { label: "Economic Development", level: 1, amount: 500000,
                    children: [
                        { label: "Infrastructure Projects", level: 2, amount: 200000, children: [] },
                        { label: "Research & Innovation", level: 2, amount: 300000, children: [] }
                    ]
                },
                { label: "Environmental Protection", level: 1, amount: 250000,
                    children: [
                        { label: "Renewable Energy", level: 2, amount: 100000, children: [] },
                        { label: "Conservation Efforts", level: 2, amount: 150000, children: [] }
                    ]
                }
            ]
        };

        // After data is "loaded" and possibly pre-processed, invoke the rendering callback.
        if (typeof options.onDataProcessed === 'function') {
            options.onDataProcessed(dummyTreeData);
        } else {
            console.error("The 'onDataProcessed' callback was not defined in renderSettings. Visualization cannot be rendered.");
        }
    }, 150); // Simulate a short network delay for realism.
};