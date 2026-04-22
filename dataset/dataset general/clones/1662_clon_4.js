var FinancialFlows = FinancialFlows || {};

FinancialFlows.flowDiagram = function(configuration) {

    // Helper function to process the hierarchical data structure into a flat list of unique nodes and their connections
    function analyzeFlowStructure(rootElement) {
        const visualEntities = []; // Array to hold node objects suitable for D3 Sankey (e.g., {name: "Label"})
        const visualConnections = []; // Array to hold link objects suitable for D3 Sankey (e.g., {source: index, target: index, value: amount})
        const entityKeyToIndexMap = new Map(); // Maps unique string key (label#level) to an index in visualEntities
        let nextAvailableIndex = 0;

        // Use a queue for an iterative Breadth-First Search (BFS) to traverse the tree structure
        const traversalQueue = [{ current: rootElement, depth: 0 }];
        const encounteredEntities = new Set(); // Stores unique keys (label#level) to prevent duplicate node creation

        while (traversalQueue.length > 0) {
            const { current: activeNode } = traversalQueue.shift();

            // Generate a unique identifier for the current node based on its label and level
            const activeNodeIdentifier = `${activeNode.label}#${activeNode.level}`;

            // If this node hasn't been added to our visual entities list yet, add it
            if (!encounteredEntities.has(activeNodeIdentifier)) {
                encounteredEntities.add(activeNodeIdentifier);
                entityKeyToIndexMap.set(activeNodeIdentifier, nextAvailableIndex);
                visualEntities.push({ name: activeNode.label });
                nextAvailableIndex++;
            }

            // Process children of the current node
            if (activeNode.children && activeNode.children.length > 0) {
                const sourceEntityIndex = entityKeyToIndexMap.get(activeNodeIdentifier);

                for (const childEntity of activeNode.children) {
                    const childEntityIdentifier = `${childEntity.label}#${childEntity.level}`;

                    // Ensure the child entity is also added to our visual entities list if new
                    if (!encounteredEntities.has(childEntityIdentifier)) {
                        encounteredEntities.add(childEntityIdentifier);
                        entityKeyToIndexMap.set(childEntityIdentifier, nextAvailableIndex);
                        visualEntities.push({ name: childEntity.label });
                        nextAvailableIndex++;
                    }

                    const targetEntityIndex = entityKeyToIndexMap.get(childEntityIdentifier);

                    // Create a connection (link) between the current node and its child
                    visualConnections.push({
                        source: sourceEntityIndex,
                        target: targetEntityIndex,
                        value: childEntity.amount
                    });

                    // If the child entity itself has children, add it to the queue for further traversal
                    if (childEntity.children && childEntity.children.length > 0) {
                        traversalQueue.push({ current: childEntity, depth: 0 }); // Depth not strictly needed for this BFS
                    }
                }
            }
        }

        return { nodes: visualEntities, links: visualConnections };
    }

    // This function will be assigned as the callback for the external aggregator
    this.displayDiagram = function (treeData) {
        const processedFlowData = analyzeFlowStructure(treeData);
        const diagramNodes = processedFlowData.nodes;
        const diagramLinks = processedFlowData.links;

        // Output processed data to console for inspection (equivalent to original console.log)
        console.log("Processed Nodes:", diagramNodes);
        console.log("Processed Links:", diagramLinks);

        // D3.js visualization setup - Renamed variables and slightly re-structured
        const visualizationArea = document.getElementById("chart");
        if (!visualizationArea) {
            console.error("The DOM element with ID 'chart' could not be found for visualization.");
            return;
        }

        const paddingDimensions = {
            top: 1,
            right: 1,
            bottom: 6,
            left: 1
        };

        const chartWidth = visualizationArea.offsetWidth - paddingDimensions.left - paddingDimensions.right;
        const chartHeight = visualizationArea.offsetHeight - paddingDimensions.top - paddingDimensions.bottom;

        const valueNumberFormat = d3.format(",.0f");
        const customValueFormat = (val) => `${valueNumberFormat(val)} ${treeData.currency}`;
        const nodeColorAssigner = d3.scale.category20();

        const baseSvgElement = d3.select(visualizationArea).append("svg")
            .attr("width", chartWidth + paddingDimensions.left + paddingDimensions.right)
            .attr("height", chartHeight + paddingDimensions.top + paddingDimensions.bottom)
            .append("g")
            .attr("transform", `translate(${paddingDimensions.left},${paddingDimensions.top})`);

        const sankeyProcessor = d3.sankey()
            .nodeWidth(15)
            .nodePadding(5)
            .size([chartWidth, chartHeight]);

        const linkPathGenerator = sankeyProcessor.link();

        sankeyProcessor.nodes(diagramNodes)
            .links(diagramLinks)
            .layout(32); // Number of iterations for the Sankey layout algorithm

        const linkElements = baseSvgElement.append("g").selectAll(".flow-connection")
            .data(diagramLinks)
            .enter().append("path")
            .attr("class", "flow-connection")
            .attr("d", linkPathGenerator)
            .style("stroke-width", (d) => Math.max(1, d.dy))
            .sort((a, b) => b.dy - a.dy);

        linkElements.append("title")
            .text((d) => `${d.source.name} \u2192 ${d.target.name}\n${customValueFormat(d.value)}`);

        // Function to update node position on drag
        const updateNodePosition = function(d) {
            d3.select(this).attr("transform", `translate(${d.x}, ${d.y = Math.max(0, Math.min(chartHeight - d.dy, d3.event.y))})`);
            sankeyProcessor.relayout(); // Recalculate node and link positions
            linkElements.attr("d", linkPathGenerator); // Update link paths to reflect new positions
        };

        const nodeElements = baseSvgElement.append("g").selectAll(".sankey-node")
            .data(diagramNodes)
            .enter().append("g")
            .attr("class", "sankey-node")
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
            .call(d3.behavior.drag()
                .origin((d) => d)
                .on("dragstart", function() { this.parentNode.appendChild(this); }) // Bring dragged node to front
                .on("drag", updateNodePosition));

        nodeElements.append("rect")
            .attr("height", (d) => d.dy)
            .attr("width", sankeyProcessor.nodeWidth())
            .style("fill", (d) => d.color = nodeColorAssigner(d.name.replace(/ .*/, "")))
            .style("stroke", (d) => d3.rgb(d.color).darker(2))
            .append("title")
            .text((d) => `${d.name}\n${customValueFormat(d.value)}`);

        nodeElements.append("text")
            .attr("x", -6)
            .attr("y", (d) => d.dy / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text((d) => d.name)
            .filter((d) => d.x < chartWidth / 2) // Adjust text position for nodes on the left side
                .attr("x", 6 + sankeyProcessor.nodeWidth())
                .attr("text-anchor", "start");
    };

    // Assign the new display function to the configuration object for external use
    configuration.diagramRenderer = this.displayDiagram;
    
    // Call the external OpenSpending Aggregator, passing the modified configuration
    OpenSpending.Aggregator(configuration);
};