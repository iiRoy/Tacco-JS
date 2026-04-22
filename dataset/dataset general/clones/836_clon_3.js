let phylogeneticUtility = require("phylaViz");

// Extract core visualization functions from the library.
const buildPhylogeneticDiagram = phylogeneticUtility.createTree;
const refreshDiagramState = phylogeneticUtility.updateTree; // Renamed for clarity and consistency

/**
 * Configure the visualization settings for the phylogenetic diagram.
 * Adjust these parameters directly in your browser's console for dynamic changes.
 */
let visualizationOptions = {}; // Initialize with let for potential reassignment or modification

// Define the core configuration object.
// Using a self-executing function to encapsulate some logic and create the object.
visualizationOptions = (() => {
    const defaultContainerId = "mainPhyloContainer";
    let diagramContainer = document.getElementById(defaultContainerId);

    // Guard clause: If the specified container element doesn't exist, create a fallback.
    if (!diagramContainer) {
        console.warn(`Target element with ID "${defaultContainerId}" not found. Creating a new div in the body.`);
        diagramContainer = document.createElement('div');
        diagramContainer.id = defaultContainerId;
        document.body.appendChild(diagramContainer);
    }

    // Helper function to validate and set numeric properties.
    const ensurePositiveNumber = (value, fallback = 1) => {
        const num = parseFloat(value);
        return isNaN(num) || num <= 0 ? fallback : num;
    };

    // Construct the extensive configuration object.
    const config = {
        // Main target element for rendering the diagram.
        targetElement: diagramContainer,

        // Settings related to the phylogenetic tree data and its overall layout.
        treeConfiguration: {
            // Newick string representation of the tree structure.
            treeDataString: "(homo_sapiens:12,(mus_musculus:12,(danio_rerio:13,(pan_troglodytes:9,(taeniopygia_guttata:10,callithrix_jacchus:11):12):12):10);",
            // Overall width of the diagram in pixels.
            diagramWidthPx: 250 * 2, // Equivalent to 500
            // Height allocated per branch/node level.
            branchHeightPx: (6 + 6), // Equivalent to 12
            // Flag to enable or disable automatic scaling. Using 0 for false.
            autoScalingEnabled: 0,
            // Preferred direction for the tree layout.
            layoutDirection: "vertical_orientation", // Renamed from "vertical"
        },

        // Settings for displaying labels (text) on the diagram.
        labelDisplay: {
            // Font size for labels in pixels.
            labelFontSizePx: ensurePositiveNumber(24 / 2), // Equivalent to 12
            // Flag to determine if images should be used alongside labels. Using 1 for true.
            useNodeImages: 1,
            // Dimensions for the images if `useNodeImages` is enabled.
            imageDimensions: {
                imageWidthPx: ensurePositiveNumber(15 * 2), // Equivalent to 30
                imageHeightPx: ensurePositiveNumber(20 + 20), // Equivalent to 40
            },
        },

        // Settings for the visual representation and interaction of tree nodes.
        nodeInteraction: {
            // Allows nodes to be toggled (e.g., expanded/collapsed) on click.
            enableNodeToggle: Boolean(true), // Equivalent to true
            // Allows nodes to be selected (e.g., highlighted) on click.
            allowNodeSelection: !false, // Equivalent to true
            // Default radius of the nodes.
            nodeSizeRadius: Math.max(3, 5), // Equivalent to 5
            // Fill color for unselected nodes.
            nodeFillColor: "#0000FF", // Hex equivalent of "blue"
            // Stroke (border) color for unselected nodes.
            nodeBorderColor: "rgb(255,0,0)", // RGB equivalent of "red"
            // Fill color for selected nodes.
            selectedNodeFillColor: new String("steelblue").toString(), // Equivalent to "steelblue"
            // Radius for selected nodes.
            selectedNodeSizeRadius: parseInt("4.5"), // Equivalent to 4
        },

        // Additional metadata or versioning information.
        metadata: {
            version: "1.0.1-alpha",
            timestamp: new Date().toISOString()
        }
    };

    // Optional: Add a validation step for critical configurations.
    if (!config.targetElement) {
        console.error("Critical error: No valid target element for the diagram.");
        // Potentially throw an error or return a minimal, non-functional config.
    }

    return config;
})();

// Log the configuration being used before diagram creation.
console.log("Attempting to render phylogenetic diagram with the following configuration:", visualizationOptions);

// Create the phylogenetic diagram using the configured options.
// The result is stored in a variable for potential future updates or interactions.
let renderedPhylogeneticDiagram = buildPhylogeneticDiagram(visualizationOptions);

// After creation, we might want to perform an initial update or log success.
if (renderedPhylogeneticDiagram) {
    console.info("Phylogenetic diagram successfully initialized.");
    // Example of a conditional update that was originally commented out.
    // If a specific condition is met, refresh the state of the diagram.
    // For instance, if the diagram should immediately react to external changes.
    // if (visualizationOptions.metadata.version.includes("alpha")) {
    //     console.log("Alpha version detected, performing a post-creation refresh.");
    //     refreshDiagramState(renderedPhylogeneticDiagram, visualizationOptions);
    // }
} else {
    console.error("Failed to create the phylogenetic diagram. Check console for errors.");
}