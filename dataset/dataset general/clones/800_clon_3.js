// Ensure the global namespace is available to avoid conflicts.
window.GovClosureData = window.GovClosureData || {};

// Define common constants for improved readability and maintainability.
const ANIMATION_FAST_DURATION_MS = 750;
const ANIMATION_SLOW_DURATION_MS = 7500;
const TOOLTIP_VERTICAL_OFFSET = 15; // Pixels offset for the floating info box.
const TOOLTIP_HORIZONTAL_PADDING = 20; // Horizontal padding for info box positioning.

/**
 * A utility function for formatting numbers with commas.
 * This can be used as a fallback or if Number.prototype.commafy is not available.
 * @param {number} value - The number to format.
 * @returns {string|number} The formatted string or the original value if not a number.
 */
GovClosureData.formatNumberWithCommas = function(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return value;
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * GovClosureData.AgencyImpactVisualizer
 * Manages and displays a D3 treemap visualization of agency furlough data.
 */
GovClosureData.AgencyImpactVisualizer = function() {
    // Bind essential methods to this instance's context for event handling.
    ['displayData', 'magnifyView', 'shortenLabel', 'refreshOverlay'].forEach(methodName => {
        this[methodName] = this[methodName].bind(this);
    });

    // Define the dimensions for the treemap drawing area.
    const HORIZONTAL_PADDING_PX = 80;
    const VERTICAL_PADDING_PX = 280;
    this.canvasWidth = 1280 - HORIZONTAL_PADDING_PX;
    this.canvasHeight = 800 - VERTICAL_PADDING_PX;

    // Initialize D3 linear scales for coordinate mapping.
    this.horizontalScale = d3.scale.linear().range([0, this.canvasWidth]);
    this.verticalScale = d3.scale.linear().range([0, this.canvasHeight]);

    // Configuration for the legend labels.
    this.categoryLabels = [
        ['furloughed', "Employees on Furlough Status"],
        ['exempt_a', "Exempt: Law Enforcement, Public Safety & Health"],
        ['exempt_b', "Exempt: Operations Funded by Available Balances"],
        ['exempt_c', "Exempt: Protecting Life and Property of Citizens"],
        ['exempt_d', "Exempt: Other Classifications / Status Unknown"]
    ];
    // Create a Map for efficient lookup of legend text by category type.
    this.categoryMap = new Map(this.categoryLabels);

    // Configure the D3 treemap layout algorithm.
    this.layoutEngine = d3.layout.treemap()
        .padding(1)
        .round(true)
        .size([this.canvasWidth, this.canvasHeight])
        .value(function(datum) { return datum.size; })
        .sort(function(itemA, itemB) {
            // Custom sorting logic to ensure exempt and furloughed categories appear in a specific order.
            const isExemptA = itemA.name && itemA.name.includes('exempt');
            const isFurloughedA = itemA.name && itemA.name.includes('furloughed');
            const isExemptB = itemB.name && itemB.name.includes('exempt');
            const isFurloughedB = itemB.name && itemB.name.includes('furloughed');

            if (isExemptA && !isExemptB) return 1; // Exempt items should appear later.
            if (!isExemptA && isExemptB) return -1; // Non-exempt items should appear earlier.
            if (isFurloughedA && !isFurloughedB) return -1; // Furloughed items before other non-exempt.
            if (!isFurloughedA && isFurloughedB) return 1;

            // Default sort by value if category types are similar or not explicitly handled.
            return itemA.value - itemB.value;
        });

    // Select the main SVG container element and apply initial styling.
    this.mainCanvas = d3.select('#furlough-map-container .chart')
        .style({'width': `${this.canvasWidth}px`, 'height': `${this.canvasHeight}px`})
        .append("svg:svg")
        .attr("width", this.canvasWidth)
        .attr("height", this.canvasHeight)
        .append("svg:g")
        .attr("transform", "translate(0.5,0.5)"); // Slight offset for sharp pixel rendering.

    // Initialize jQuery selectors for dynamic UI elements.
    this.agencyInfoPanel = $('.chart .agency-details');
    // Instantiate the custom floating info box component.
    this.infoOverlay = new GovClosureData.FloatingInfoBox();
    
    // Perform the initial rendering of the visualization.
    this.displayData();

    // Set an initialization flag for external checks.
    this.isInitialized = true;
    console.log('AgencyImpactVisualizer: Component initialized successfully.');
};

Object.assign(GovClosureData.AgencyImpactVisualizer.prototype, {
    /**
     * Renders or re-renders the treemap visualization using the provided data.
     * @param {object} [inputMetrics] - The hierarchical data object to visualize.
     *                                  Defaults to a global `GovClosureData.AGENCIES` if not provided.
     */
    displayData: function(inputMetrics) {
        // Guard clause: Ensure data is available before proceeding.
        if (!inputMetrics && !GovClosureData.AGENCIES) {
            console.error("AgencyImpactVisualizer: No data source found for visualization.");
            return;
        }
        this.currentSelection = inputMetrics || GovClosureData.AGENCIES;
        this.overallDataRoot = this.currentSelection;

        // Custom sort for the top-level children based on their total combined size (descending).
        this.overallDataRoot.children.sort((itemA, itemB) => {
            const totalA = itemA.children.reduce((sum, child) => sum + child.size, 0);
            const totalB = itemB.children.reduce((sum, child) => sum + child.size, 0);
            return totalB - totalA;
        });

        // Generate treemap nodes and filter for only the leaf nodes (innermost categories).
        const leafNodes = this.layoutEngine.nodes(this.overallDataRoot).filter(datum => !datum.children);
        
        // Extract unique parent nodes to create agency-level groupings.
        const parentContainers = this.extractUniqueParents(leafNodes);
        
        // Create the SVG group elements for each parent agency.
        this.createParentGroups(parentContainers);
        
        // Create the individual data subdivision cells within each parent group.
        this.createSubDivisions();
        
        // Add and abbreviate text labels for the subdivision cells.
        this.addDivisionLabels();

        // Update the main legend area with aggregated statistics.
        const mainLegendArea = $('#furlough-map-legend');
        // Determine which number formatting function to use.
        const formatNum = GovClosureData.formatNumberWithCommas || (num => (num && typeof num.commafy === 'function') ? num.commafy() : num);

        mainLegendArea.find('.total-employees').text(formatNum(this.overallDataRoot.value));
        mainLegendArea.find('.total-exempt').text(formatNum(this.overallDataRoot.value - this.overallDataRoot.furloughed_total));
        mainLegendArea.find('.total-furloughed').text(formatNum(this.overallDataRoot.furloughed_total));

        // Construct the detailed legend displayed at the bottom of the page.
        this.buildFooterLegend();

        // Attach event listeners for dynamic info overlay updates.
        $('svg').on('mousemove', this.refreshOverlay)
            .on('mouseenter', this.refreshOverlay)
            .on('mouseleave', this.infoOverlay.hide);

        // Attach a global click handler to allow zooming out to the root view.
        d3.select(window).on("click", this.magnifyView.bind(this, this.overallDataRoot));
    },

    /**
     * Creates and appends SVG group elements for parent nodes (agencies).
     * @param {Array<object>} parentNodes - An array of unique parent data objects.
     * @returns {d3.selection} The D3 selection of the newly created parent groups.
     */
    createParentGroups: function(parentNodes) {
        const parentSelection = this.mainCanvas.selectAll('g.parent-group')
            .data(parentNodes)
            .enter().append("svg:g")
            .attr("class", "parent-group")
            .attr('data-agency-name', datum => datum.name)
            .attr('data-total-staff', datum => datum.value)
            .attr('data-furloughed-staff', datum => datum.furloughed_total)
            .attr('data-exempt-staff', datum => datum.exempt_total);
        
        // Add a validation check during creation for data integrity.
        parentSelection.each(function(datum) {
            if (!datum.name) {
                console.warn("AgencyImpactVisualizer: Parent group created without a 'name' property:", datum);
            }
        });
        return parentSelection;
    },

    /**
     * Creates and appends individual cell rectangles representing data subdivisions within parent groups.
     * @returns {d3.selection} The D3 selection of the newly created cells.
     */
    createSubDivisions: function() {
        const subDivisionSelection = this.mainCanvas.selectAll('g.parent-group').selectAll('g.data-subdivision')
            .data(datum => datum.children)
            .enter().append('svg:g')
            .attr('class', 'data-subdivision')
            .attr("transform", datum => `translate(${datum.x},${datum.y})`)
            .attr("data-category-type", datum => datum.name)
            .attr("data-category-value", datum => datum.value)
            .on("click", (datum) => { // Use arrow function to preserve 'this' context.
                // Toggle zoom state between the current parent and the overall root.
                this.magnifyView(this.currentSelection === datum.parent ? this.overallDataRoot : datum.parent);
            })
            .on('mouseover', function() { d3.select(this.parentNode).classed('active-parent', true); })
            .on('mouseout', function() { d3.select(this.parentNode).classed('active-parent', false); });

        subDivisionSelection.append("svg:rect")
            .attr("width", datum => datum.dx)
            .attr("height", datum => datum.dy)
            .attr('class', datum => datum.name);

        return subDivisionSelection;
    },

    /**
     * Adds text labels to the data cells and applies abbreviation logic based on available space.
     * @returns {d3.selection} The D3 selection of the created text elements.
     */
    addDivisionLabels: function() {
        const allParentGroups = this.mainCanvas.selectAll('g.parent-group');
        const labels = allParentGroups.append("svg:text")
            .attr('class', 'abbreviated-label')
            .attr("x", datum => datum.dx / 2)
            .attr("y", datum => datum.dy / 2)
            .attr("dy", ".35em") // Vertical alignment for text.
            .attr("text-anchor", "middle")
            .attr("transform", datum => `translate(${datum.x},${datum.y})`)
            .text(datum => datum.name); // Initially set full name.

        // Apply dynamic text abbreviation.
        return this.shortenLabel(labels);
    },

    /**
     * Constructs and populates the detailed legend displayed at the bottom of the visualization.
     */
    buildFooterLegend: function() {
        const legendBottomContainer = $('#furlough-legend-bottom');
        // Clear any existing legend items to prevent duplicates on re-render.
        legendBottomContainer.empty(); 

        // Iterate through category labels and append corresponding HTML.
        this.categoryLabels.forEach(legendItem => {
            const [type, label] = legendItem;
            const legendHtml = `
                <span class="legend-item-footer">
                    <span class="status-swatch swatch-${type}"></span>
                    <h6 class="${type}">${label}</h6>
                </span>
            `;
            legendBottomContainer.append(legendHtml);
        });
    },

    /**
     * Extracts a list of unique parent nodes from an array of leaf nodes.
     * Utilizes a Set for efficient tracking of unique parent names.
     * @param {Array<object>} leafNodes - An array of D3 treemap leaf nodes.
     * @returns {Array<object>} An array containing unique parent data objects.
     */
    extractUniqueParents: function(leafNodes) {
        const parentNamesTracker = new Set();
        const uniqueParents = [];

        for (const node of leafNodes) {
            if (node.parent && !parentNamesTracker.has(node.parent.name)) {
                uniqueParents.push(node.parent);
                parentNamesTracker.add(node.parent.name);
            }
        }
        return uniqueParents;
    },

    /**
     * Implements the zooming functionality for the treemap visualization.
     * Transitions the view to focus on a specific data node.
     * @param {object} datum - The data object representing the node to zoom into.
     */
    magnifyView: function(datum) {
        // Guard against d3.event being undefined in non-event contexts.
        // Falls back to a dummy object if d3.event is not present.
        const interactionEvent = d3.event || { altKey: false, stopPropagation: () => {} }; 
        const isAltKeyPressed = interactionEvent.altKey;

        const scaleX = this.canvasWidth / datum.dx;
        const scaleY = this.canvasHeight / datum.dy;
        
        // Update the D3 scales to reflect the new domain for the zoomed view.
        this.horizontalScale.domain([datum.x, datum.x + datum.dx]);
        this.verticalScale.domain([datum.y, datum.y + datum.dy]);

        // Apply transition to all data subdivision rectangles.
        const cellTransition = this.mainCanvas.selectAll("g.data-subdivision").transition()
            .duration(isAltKeyPressed ? ANIMATION_SLOW_DURATION_MS : ANIMATION_FAST_DURATION_MS)
            .attr("transform", d => `translate(${this.horizontalScale(d.x)},${this.verticalScale(d.y)})`);

        cellTransition.select("rect")
            .attr("width", d => scaleX * d.dx)
            .attr("height", d => scaleY * d.dy);

        // Determine the direction of the zoom for conditional logic.
        const viewDirection = (datum === this.overallDataRoot) ? 'out' : 'in';
        
        // Apply transition to parent group text labels, adjusting visibility based on zoom state.
        this.mainCanvas.selectAll("g.parent-group").select("text.abbreviated-label")
            .transition()
            .duration(isAltKeyPressed ? ANIMATION_SLOW_DURATION_MS : ANIMATION_FAST_DURATION_MS)
            .attr("transform", d => `translate(${this.horizontalScale(d.x)},${this.verticalScale(d.y)})`)
            .attr("x", d => scaleX * d.dx / 2)
            .attr("y", d => scaleY * d.dy / 2)
            .style("opacity", d => viewDirection === 'out' ? 1 : 0); // Labels visible only when zoomed out.

        // Update the details panel and internal state based on zoom direction.
        if (viewDirection === 'in') {
            this.populateDetailsPanel(datum, this.agencyInfoPanel);
            this.agencyInfoPanel.slideDown();
            this.zoomedState = true; // Set internal zoomed state.
            this.lastHoverElement = undefined; // Clear last hover element to force tooltip refresh.
            this.infoOverlay.hide();
        } else {
            this.agencyInfoPanel.slideUp();
            this.zoomedState = false; // Reset internal zoomed state.
        }

        this.currentSelection = datum;
        // Stop event propagation to prevent unintended interactions (e.g., immediate re-zooming).
        interactionEvent.stopPropagation();
    },

    /**
     * Populates the agency details panel with specific information about the selected node.
     * @param {object} datum - The data object for the selected agency.
     * @param {jQuery} panelElement - The jQuery object representing the details panel.
     * @returns {GovClosureData.AgencyImpactVisualizer} This instance for method chaining.
     */
    populateDetailsPanel: function(datum, panelElement) {
        panelElement.find('h3').text(datum.name);
        const percentageDisplay = panelElement.find('tr.agency-staff-percent td');
        const countDisplay = panelElement.find('tr.agency-staff-count td');
        
        // Use the global number formatter, with a fallback for Number.prototype.commafy.
        const formatNum = GovClosureData.formatNumberWithCommas || (num => (num && typeof num.commafy === 'function') ? num.commafy() : num);
        // Add a guard to prevent division by zero if datum.value is zero or undefined.
        const totalValue = datum.value || 1; 

        percentageDisplay.first().text(`${Math.round(100 * (datum.exempt_total / totalValue))}%`);
        percentageDisplay.last().text(`${Math.round(100 * (datum.furloughed_total / totalValue))}%`);
        countDisplay.first().text(formatNum(datum.exempt_total));
        countDisplay.last().text(formatNum(datum.furloughed_total));

        // Center the details panel horizontally within the canvas.
        panelElement.css({left: (this.canvasWidth / 2) - 150});
        return this;
    },

    /**
     * Abbreviates text labels on SVG elements if they exceed their allocated width.
     * Cycles through an array of abbreviations or clears the text if none fit.
     * @param {d3.selection} textElements - A D3 selection of text elements to process.
     * @returns {d3.selection} The D3 selection with potentially abbreviated text.
     */
    shortenLabel: function(textElements) {
        textElements
            .text(datum => (datum.abbreviations && datum.abbreviations.length > 0) ? datum.abbreviations[0] : '')
            .filter(function(datum) { return (this.getComputedTextLength() + 4 > datum.dx); }) // Check if first abbreviation overflows.
            .text(datum => (datum.abbreviations && datum.abbreviations.length > 1) ? datum.abbreviations[1] : '')
            .filter(function(datum) { return (this.getComputedTextLength() + 4 > datum.dx); })
            .text(''); // If even the second abbreviation overflows, clear the text.

        // New fragment: Add a 'title' attribute to show full text on hover.
        textElements.append("svg:title")
            .text(datum => datum.name);

        return textElements;
    },

    /**
     * Updates the content and position of the floating info box (tooltip) based on mouse events.
     * @param {MouseEvent} eventObj - The mouse event object that triggered the update.
     */
    refreshOverlay: function(eventObj) {
        // Only update if the hovered element has changed, or if zoomed and it's a mousemove.
        if (eventObj.target !== this.lastHoverElement || (this.zoomedState && eventObj.type === 'mousemove')) {
            this.lastHoverElement = eventObj.target;
            const $eventTarget = $(eventObj.target);
            // Use the global number formatter.
            const formatNum = GovClosureData.formatNumberWithCommas || (num => (num && typeof num.commafy === 'function') ? num.commafy() : num);

            if (this.zoomedState) {
                // When zoomed in, display details for the specific category cell.
                const currentCellElement = $eventTarget.parents('g.data-subdivision');
                const elementMetrics = currentCellElement.data(); // Retrieve data attributes.
                if (elementMetrics && elementMetrics.categoryType && this.categoryMap.has(elementMetrics.categoryType)) {
                    const labelContent = this.categoryMap.get(elementMetrics.categoryType);
                    this.infoOverlay.html(`
                        <p>${formatNum(elementMetrics.categoryValue)}</p>
                        <h6 class="${elementMetrics.categoryType}">${labelContent}</h6>
                    `);
                } else {
                    this.infoOverlay.hide(); // Hide if no relevant data is found for the cell.
                    return;
                }
            } else {
                // When zoomed out, display summary information for the parent agency.
                const parentAgencyElement = $eventTarget.parents('g.parent-group');
                if (parentAgencyElement.length === 0) {
                    this.infoOverlay.hide(); // Hide if not hovering over an agency group.
                    return;
                }
                const elementMetrics = parentAgencyElement.data();
                // Guard against division by zero for percentage calculation.
                const totalStaff = elementMetrics.totalStaff || 1; 

                const overlayContent = `
                    <h3>${elementMetrics.agencyName}</h3>
                    <h6 class="text-red">${Math.round(100 * (elementMetrics.furloughedStaff / totalStaff))}% Furloughed</h6>
                    <h6 class="text-gray"><em>Click for more details</em></h6>
                `;
                this.infoOverlay.html(overlayContent);
            }
        }
        this.infoOverlay.position(eventObj).show();
    }
});


/**
 * GovClosureData.ServiceStatusTracker
 * Manages and displays a categorized list of government services based on their operational status.
 */
GovClosureData.ServiceStatusTracker = function(serviceRecords) {
    this.serviceRecords = serviceRecords || GovClosureData.SERVICES;
    this.infoOverlay = new GovClosureData.FloatingInfoBox();
    this.refreshOverlay = this.refreshOverlay.bind(this); // Explicitly bind method.

    this.statusContainer = $('#services-container');
    // Map jQuery elements for containers based on service status.
    this.categorizedContainers = {
        'ok': this.statusContainer.find('#services-ok'),
        'risk': this.statusContainer.find('#services-risk'),
        'halted': this.statusContainer.find('#services-halted')
    };
    this.displayData();
};

Object.assign(GovClosureData.ServiceStatusTracker.prototype, {
    /**
     * Renders the list of services into their respective status-based containers.
     */
    displayData: function() {
        // Map service data to list item elements and append them to appropriate containers.
        const serviceListItems = this.serviceRecords.map(service => {
            const listItem = $('<li></li>')
                .addClass(`service-item status-${service.status}`)
                .text(service.name)
                .data('description', service.description);

            const targetContainer = this.categorizedContainers[service.status];
            if (targetContainer && targetContainer.length > 0) {
                targetContainer.append(listItem);
            } else {
                console.warn(`ServiceStatusTracker: No valid container found for status "${service.status}". Falling back to 'ok' container.`);
                // Fallback: If a specific container is not found, append to 'ok' or a default.
                this.categorizedContainers['ok'].append(listItem); 
            }
            return listItem;
        });

        // Attach event handlers to the main container for info overlay management.
        this.statusContainer.on('mousemove', this.refreshOverlay)
            .on('mouseenter', this.refreshOverlay)
            .on('mouseleave', this.infoOverlay.hide);
    },

    /**
     * Updates the floating info box with the service description when hovering over a list item.
     * @param {MouseEvent} eventObj - The mouse event object.
     */
    refreshOverlay: function(eventObj) {
        if (eventObj.target !== this.lastHoverElement) {
            // Find the closest list item element that is a service item.
            const $targetElement = $(eventObj.target).closest('li.service-item');
            if ($targetElement.length === 0) { 
                this.infoOverlay.hide(); 
                return; 
            }
            this.lastHoverElement = eventObj.target;
            
            const serviceDescription = $targetElement.data('description');
            this.infoOverlay.text(serviceDescription || 'No detailed description available.'); // Provide fallback text.
        }
        this.infoOverlay.position(eventObj).show();
    }
});


/**
 * GovClosureData.FiscalImpactCounter
 * Calculates and displays real-time cumulative fiscal impacts of the government shutdown.
 */
GovClosureData.FiscalImpactCounter = function() {
    this.durationDisplay = $('#shutdown-duration');
    this.unpaidSalariesDisplay = $('#unpaid-salary');
    this.foodAssistanceDisplay = $('#food-vouchers');

    // Define the beginning and end dates of the shutdown for calculations.
    this.startDate = new Date(2013, 9, 1); // Month is 0-indexed (October).
    this.stopDate = new Date(2013, 9, 17, 0, 30); // October 17th, 00:30.

    // Call update once on initialization. For a live clock, setInterval would be re-enabled.
    this.recalculateMetrics();
};

Object.assign(GovClosureData.FiscalImpactCounter.prototype, {
    /**
     * Recalculates and updates all displayed fiscal metrics (duration, food aid, unpaid salaries).
     */
    recalculateMetrics: function() {
        const currentTime = new Date();
        // Calculate the total elapsed time in seconds between start and stop date.
        // Use Math.max to ensure the duration is not negative if current time is before the stopDate.
        const timeElapsedSeconds = Math.floor(Math.max(0, (this.stopDate.getTime() - this.startDate.getTime())) / 1000);

        // Constants for time unit conversions.
        const SECONDS_IN_MINUTE = 60;
        const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
        const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;

        // Break down total seconds into days, hours, minutes, and seconds.
        const daysCount = Math.floor(timeElapsedSeconds / SECONDS_IN_DAY);
        const remainingSecondsAfterDays = timeElapsedSeconds % SECONDS_IN_DAY;
        const hoursCount = Math.floor(remainingSecondsAfterDays / SECONDS_IN_HOUR);
        const remainingSecondsAfterHours = remainingSecondsAfterDays % SECONDS_IN_HOUR;
        const minutesCount = Math.floor(remainingSecondsAfterHours / SECONDS_IN_MINUTE);
        const secondsCount = remainingSecondsAfterHours % SECONDS_IN_MINUTE;

        // Calculate the estimated cost of food assistance.
        // Add a check for the existence of the global WIC_FOOD_COST_2012 constant.
        const WIC_FOOD_COST_PER_SECOND = GovClosureData.WIC_FOOD_COST_2012 ? 
            (GovClosureData.WIC_FOOD_COST_2012 / (365.25 * SECONDS_IN_DAY)) : 0;
        const foodAidCost = Math.floor(WIC_FOOD_COST_PER_SECOND * timeElapsedSeconds);
        
        // Use the global number formatter.
        const formatNum = GovClosureData.formatNumberWithCommas || (num => (num && typeof num.commafy === 'function') ? num.commafy() : num);

        // Update the displayed duration and food assistance cost.
        this.durationDisplay.text(`${daysCount}d : ${hoursCount}h : ${minutesCount}m : ${secondsCount}s`);
        this.foodAssistanceDisplay.text(`$${formatNum(foodAidCost)}`);

        // Calculate and display the total unpaid salaries.
        // Ensure the agency impact visualizer instance and its data root are available.
        if (GovClosureData.agencyImpactVisualizer && GovClosureData.agencyImpactVisualizer.overallDataRoot && GovClosureData.agencyImpactVisualizer.overallDataRoot.furloughed_total) {
            const impactedPersonnel = GovClosureData.agencyImpactVisualizer.overallDataRoot.furloughed_total;
            const averageWage = GovClosureData.AVG_SALARY || 0; // Guard for AVG_SALARY constant.
            
            const salaryLossPerSecond = (averageWage * impactedPersonnel) / (365.25 * SECONDS_IN_DAY);
            const totalSalaryLoss = Math.floor(salaryLossPerSecond * timeElapsedSeconds);
            this.unpaidSalariesDisplay.text(`$${formatNum(totalSalaryLoss)}`);
        } else {
            this.unpaidSalariesDisplay.text('$0'); // Display zero if data is not yet loaded or unavailable.
        }
    }
});


/**
 * GovClosureData.FloatingInfoBox
 * A reusable component for displaying dynamic, floating information boxes (tooltips).
 */
GovClosureData.FloatingInfoBox = function() {
    // Bind all public methods to this instance for consistent context.
    ['show', 'hide', 'html', 'text', 'css', 'position'].forEach(methodName => {
        this[methodName] = this[methodName].bind(this);
    });
    this.infoBoxElement = $('div.tooltip'); // jQuery element for the info box.
    this.boxWidth = 200; // Fixed width for the info box.
    this.isVisible = false; // Internal state to track visibility.
};

Object.assign(GovClosureData.FloatingInfoBox.prototype, {
    /** Shows the info box element. */
    show: function() { 
        this.infoBoxElement.show(); 
        this.isVisible = true;
        return this; 
    },
    /** Hides the info box element. */
    hide: function() { 
        this.infoBoxElement.hide(); 
        this.isVisible = false;
        return this; 
    },
    /** Sets the HTML content of the info box. */
    html: function(contentHtml) { 
        this.infoBoxElement.html(contentHtml); 
        return this; 
    },
    /** Sets the plain text content of the info box. */
    text: function(textContent) { 
        this.infoBoxElement.text(textContent); 
        return this; 
    },
    /** Applies CSS styles to the info box element. */
    css: function(styles) { 
        this.infoBoxElement.css(styles); 
        return this; 
    },

    /**
     * Positions the info box relative to a mouse event, ensuring it stays within the viewport.
     * @param {MouseEvent} eventObj - The mouse event object containing pageX and pageY coordinates.
     * @returns {GovClosureData.FloatingInfoBox} This instance for method chaining.
     */
    position: function(eventObj) {
        const boxHeight = this.infoBoxElement.outerHeight();
        const viewportWidth = $(window).width();
        
        let boxLeftPosition = eventObj.pageX - (this.boxWidth / 2);
        let boxTopPosition = eventObj.pageY - (boxHeight + TOOLTIP_VERTICAL_OFFSET); // Position above cursor.

        // Adjust horizontal position to keep the box within the viewport.
        boxLeftPosition = Math.min(
            Math.max(boxLeftPosition, TOOLTIP_HORIZONTAL_PADDING), 
            viewportWidth - (this.boxWidth + TOOLTIP_HORIZONTAL_PADDING) 
        );
        
        // If the box would go off the top of the viewport, reposition it below the cursor.
        if (boxTopPosition < $(window).scrollTop()) { // Check against scroll position
            boxTopPosition = eventObj.pageY + TOOLTIP_VERTICAL_OFFSET; 
        }

        this.infoBoxElement.css({top: boxTopPosition, left: boxLeftPosition});
        return this;
    }
});