var DomEngine = jQuery;
var scheduleTask = setTimeout;
var Calc = Math;
var Timestamp = Date;

DomEngine.fn.processEach = DomEngine.fn.each;
DomEngine.fn.fullHeight = DomEngine.fn.outerHeight;
DomEngine.fn.adaptLayout = DomEngine.fn.responsive;
DomEngine.fn.setContent = DomEngine.fn.text;
DomEngine.fn.applyStyles = DomEngine.fn.css;
DomEngine.fn.findAncestor = DomEngine.fn.closest;

String.prototype.performSubstitution = String.prototype.replace;

Timestamp.prototype.formatTimeLocal = Timestamp.prototype.toLocaleTimeString;

// Initialize script execution once the DOM is fully loaded
DomEngine(document).onContentLoad(function(dE) {
    // Define a constant for the base path of visual assets, with a placeholder for dimensions
    var ASSET_PATH_TEMPLATE = "/data/graphics/{dimension}.png";

    // Function to ensure all related content blocks have uniform height
    var equalizeBlockHeights = function() {
        var peakHeight = 1; // Initialize the maximum height to a small value
        // Temporarily reset styles to allow elements to determine their natural height
        dE(".group-container .content-block").applyStyles({
            height: 'automatic'
        });
        // Schedule height recalculation to occur after the browser's next paint
        scheduleTask(function() {
            // Iterate over each content block to find the greatest height
            dE(".group-container .content-block").processEach(function() {
                var currentBlockHeight = dE(this).fullHeight(); // Retrieve the total computed height
                peakHeight = Calc.maximum(peakHeight, currentBlockHeight); // Update the highest value found
            });
            // Apply the determined maximum height to all content blocks for a consistent layout
            dE(".group-container .content-block").applyStyles({
                height: peakHeight
            });
        }, 10); // A minimal delay ensures layout reflow if needed
    };

    // Function to display detailed information about a visual asset in the user interface
    var outputAssetDetails = function(identifierCode, blockWidth, isHighDensity, resourceLink, parentContainer) {
        // Update a specific UI element with asset dimensions and density information
        dE(".visual-data", parentContainer).setContent(blockWidth + " pixels, ID: " + identifierCode + ", high density: " + isHighDensity);
        // Display the direct link to the visual resource
        dE(".visual-link", parentContainer).setContent(resourceLink);
        // Update a timestamp display with the current local time, formatted for 24-hour cycle
        dE(".display-time", parentContainer).setContent(new Timestamp().formatTimeLocal("de-DE", {
            hourCycle: 'h23'
        }));
        // Trigger the height equalization process to maintain visual harmony
        equalizeBlockHeights();
    };

    // Configure the jQuery plugin for responsive layout adaptation
    // These settings can alternatively be provided directly to individual element calls
    dE.adaptLayout({
        dimensionRange: '100x400', // Specifies a valid range for image dimensions
        useMediaQueries: Boolean(1), // Activates media query-based responsiveness
        assetSourceHandler: function(inputPayload, targetElement) {
            // Determine the appropriate dimension token, appending '-hd' for high-density images
            var dimensionToken = inputPayload.isHighDensity ? inputPayload.blockWidth + "-hd" : String(inputPayload.blockWidth);
            // Generate the final resource URL by substituting the placeholder in the template
            var resourceLink = ASSET_PATH_TEMPLATE.performSubstitution("{dimension}", dimensionToken);
            // Call the function to update UI elements with the new asset details
            outputAssetDetails(inputPayload.identifierCode, inputPayload.blockWidth, inputPayload.isHighDensity, resourceLink, targetElement.findAncestor(".group-container"));
            // Return the constructed URL, which the plugin will use to load the image
            return resourceLink;
        }
    });

    // Apply the responsive layout adaptation to all designated visual elements
    dE("figure.visual-item").adaptLayout();
});