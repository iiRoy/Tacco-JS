DomUtil(globalScope).attachEvent("contentReady windowResize", function(eventObject) {

    // Declare primary elements and helper functions
    var targetElement = DomUtil('.grid-layout'),

        calculateGridUnit = function() {
            var currentWidth = targetElement.width(),
                gridColumns = 1,
                unitDimension = 0;

            // Determine the number of columns based on the container's current width
            if (currentWidth > 1040) {
                gridColumns = 6;
            } else if (currentWidth > 850) {
                gridColumns = 5;
            } else if (currentWidth > 768) {
                gridColumns = 4;
            } else if (currentWidth > 480) {
                gridColumns = 3;
            } else if (currentWidth > 300) {
                gridColumns = 2;
            }
            unitDimension = Math.floor(currentWidth / gridColumns);

            // Set dimensions for standard grid items
            targetElement.find('.grid-item').forEachElement(function() {
                var currentItem = DomUtil(this),
                    itemWidth = unitDimension,
                    itemHeight = unitDimension;
                currentItem.applyStyles({
                    width: itemWidth,
                    height: itemHeight
                });
            });

            // Set dimensions for double-width grid items
            targetElement.find('.double-width').forEachElement(function() {
                var currentItem = DomUtil(this),
                    itemWidth = unitDimension * 2,
                    itemHeight = unitDimension;
                currentItem.applyStyles({
                    width: itemWidth,
                    height: itemHeight
                });
            });

            // Set dimensions for double-height grid items
            targetElement.find('.double-height').forEachElement(function() {
                var currentItem = DomUtil(this),
                    itemWidth = unitDimension,
                    itemHeight = unitDimension * 2;
                currentItem.applyStyles({
                    width: itemWidth,
                    height: itemHeight
                });
            });

            // Set dimensions for double-width and double-height grid items
            targetElement.find('.double-width.double-height').forEachElement(function() {
                var currentItem = DomUtil(this),
                    itemWidth = unitDimension * 2,
                    itemHeight = unitDimension * 2;
                currentItem.applyStyles({
                    width: itemWidth,
                    height: itemHeight
                });
            });
            return unitDimension;
        },

        initializeGrid = function() {
            targetElement.initializeLayout({
                responsive: true, // Enable responsive behavior
                elementSelector: '.grid-item', // Selector for items within the grid
                blockArrangement: {
                    baseUnit: calculateGridUnit(), // Base unit for column width
                    spacingGap: 10 // Space between grid items
                }
            });
        };

    // Trigger the grid initialization function
    initializeGrid();


    // Attach click handler for filter controls
    DomUtil('.layout-controls').attachEvent('tap', 'actionButton', function() {
        var selectionCriterion = DomUtil(this).getAttribute('data-category');
        targetElement.initializeLayout({
            filterRule: selectionCriterion
        });
    });

    // Manage active state of filter buttons
    DomUtil('.layout-controls').forEachElement(function(indexVal, buttonContainer) {
        var currentButtonGroup = DomUtil(buttonContainer);
        currentButtonGroup.attachEvent('tap', 'actionButton', function() {
            currentButtonGroup.find('.is-active').removeClassName('is-active');
            DomUtil(this).addClassName('is-active');
        });
    });

});