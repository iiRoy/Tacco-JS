window.GovClosure2013 = {};

// Class for visualizing government work stoppage data using a treemap
GovClosure2013.WorkStoppageChart = function() {
  // Ensure 'this' context for specific methods
  _.bindAll(this, 'drawVisualization', 'magnifyArea', 'shortenLabel', 'refreshHint');

  // Define dimensions for the plotting area
  this.plotWidth = 1280 - 80;
  this.plotHeight = 800 - 280;

  // Initialize D3 scales for X and Y coordinates
  this.horizontalScale = d3.scale.linear().range([0, this.plotWidth]);
  this.verticalScale = d3.scale.linear().range([0, this.plotHeight]);

  // Text definitions for the legend categories
  this.explanationLabels = [
    ['temporarily_suspended', "Temporarily Suspended Personnel"],
    ['exempt_type_a', "Exempt from Suspension: Public safety, health services"],
    ['exempt_type_b', "Exempt from Suspension: Funded by existing resources"],
    ['exempt_type_c', "Exempt from Suspension: Safeguarding lives and assets"],
    ['exempt_type_d', "Exempt from Suspension: Various/Unspecified reasons"]
  ];
  // Convert legend array to an object for quick lookup by category
  this.explanationLabelsByCategory = _(this.explanationLabels).object();

  // Configure D3 treemap layout
  this.treeMapLayout = d3.layout.treemap()
    //.mode('slice-dice') // Alternative layout mode
    .padSize(1) // Padding between tree map cells
    .round(true) // Round dimensions to whole pixels
    .size([this.plotWidth, this.plotHeight]) // Set layout dimensions
    .value(function(datum) { return datum.area; }) // Data property to determine cell size
    .sort(function(itemA, itemB) { // Custom sorting logic for cells
      if (itemA.label.match('exempt')) { return 1; } // Exempt categories last
      else if (itemA.label.match('temporarily_suspended')) { return -1; } // Suspended categories first
      return itemA.metric - itemB.metric; // Otherwise, sort by metric value
    });

  // Select the SVG container element and set its styles
  this.graphicsContainer = d3.select('#work-stoppage-chart-area .diagram')
    .style({ 'width': this.plotWidth + 'px', 'height': this.plotHeight + 'px' })
    .append("svg:svg") // Append the main SVG element
    .attr("width", this.plotWidth)
    .attr("height", this.plotHeight)
    .append("svg:g") // Append a group element for transformations
    .attr("transform", "translate(.5,.5)")

  // Select the details panel element using jQuery
  this.$infoPanel = $('.diagram .entity-information');
  // Initialize the custom tooltip component
  this.displayHint = new GovClosure2013.InfoBubble();
  // Perform the initial drawing of the visualization
  this.drawVisualization();
};

// Extend the prototype of WorkStoppageChart with additional methods
_.extend(GovClosure2013.WorkStoppageChart.prototype, {

  /**
   * Renders or re-renders the treemap visualization.
   * @param {object} inputData - Optional data to use for rendering. Defaults to global organizations data.
   */
  drawVisualization: function(inputData) {
    // Use provided data or fallback to global organizations data
    inputData = inputData || GovClosure2013.ORGANIZATIONS;
    // Set the current focus and top-level node for the treemap
    this.currentFocus = inputData, this.topLevel = inputData;

    // Sort the children of the input data based on total size
    inputData.subItems = inputData.subItems.sort(function(itemA, itemB) {
      let totalA = 0,
        totalB = 0;
      for (let idx = 0; idx < itemA.subItems.length; idx++) { totalA += itemA.subItems[idx].area; }
      for (let idx = 0; idx < itemB.subItems.length; idx++) { totalB += itemB.subItems[idx].area; }
      return totalB - totalA; // Sort in descending order of total area
    });

    // Generate treemap layout cells and filter for leaf nodes
    let layoutCells = this.treeMapLayout.nodes(this.topLevel).filter(function(item) { return !item.subItems; }),
      // Get unique parent groups from the layout cells
      parentGroups = this.retrieveParentGroups(layoutCells),
      // Create SVG group elements for parent blocks
      enclosingBlock = this.createEnclosingBlock(parentGroups),
      // Create SVG group elements for inner blocks
      innerBlock = this.createInnerBlock(),
      // Create text labels for the blocks
      blockLabel = this.createBlockLabel(enclosingBlock),
      // Select the legend section
      $keySection = $('#work-stoppage-chart-key');

    // Update legend values with formatted numbers
    $keySection.find('.overall-personnel').text(this.topLevel.metric.formatNumber());
    $keySection.find('.overall-exempt').text((this.topLevel.metric - this.topLevel.suspended_total).formatNumber());
    $keySection.find('.overall-suspended').text(this.topLevel.suspended_total.formatNumber());

    // Generate the detailed bottom legend
    this.generateBottomKey();

    // Attach event listeners for the SVG container to handle tooltip updates
    $('svg').on('mousemove', this.refreshHint)
      .on('mouseenter', this.refreshHint)
      .on('mouseleave', this.displayHint.conceal); // Hide tooltip on mouse leave

    // Attach a click listener to the window for zooming out
    d3.select(window).on("click", _.bind(function() { this.magnifyArea(this.topLevel); }, this));
  },

  /**
   * Creates and appends SVG group elements for parent cells.
   * @param {Array} parentGroups - Array of parent data objects.
   * @returns {d3.selection} D3 selection of the created parent cells.
   */
  createEnclosingBlock: function(parentGroups) {
    return this.graphicsContainer.selectAll('g.outerBlock')
      .data(parentGroups) // Bind data to parent blocks
      .enter().append("svg:g") // Append new group elements for each parent
      .attr("class", "outerBlock") // Assign CSS class
      .attr('data-organization', function(datum) { return datum.label }) // Store organization name
      .attr('data-headcount', function(datum) { return datum.metric }) // Store total headcount
      .attr('data-suspended', function(datum) { return datum.suspended_total }) // Store suspended count
      .attr('data-excluded', function(datum) { return datum.excluded_total }); // Store excluded count
  },

  /**
   * Creates and appends SVG group elements for inner cells within parent cells.
   * @returns {d3.selection} D3 selection of the created inner cells.
   */
  createInnerBlock: function() {
    let innerBlock = this.graphicsContainer.selectAll('g.outerBlock').selectAll('g.innerBlock')
      .data(function(datum) { return datum.subItems; }) // Bind child data to inner blocks
      .enter().append('svg:g') // Append new group elements for each child
      .attr('class', 'innerBlock') // Assign CSS class
      .attr("transform", function(datum) { return "translate(" + datum.pos_x + "," + datum.pos_y + ")"; }) // Position the block
      .attr("data-category", function(datum) { return datum.label; }) // Store category label
      .attr("data-metric", function(datum) { return datum.metric; }) // Store metric value
      .on("click", _.bind(function(datum) { // Click handler for zooming
        return this.magnifyArea(this.currentFocus == datum.parentItem ? this.topLevel : datum.parentItem);
      }, this))
      .on('mouseover', function(datum) { d3.select(this.parentNode).classed('highlighted', true) }) // Highlight parent on hover
      .on('mouseout', function(datum) { d3.select(this.parentNode).classed('highlighted', false) }); // Remove highlight on mouse out

    // Append rectangles to each inner block
    innerBlock.append("svg:rect")
      .attr("width", function(datum) { return datum.width_dim; }) // Set rectangle width
      .attr("height", function(datum) { return datum.height_dim; }) // Set rectangle height
      .attr('class', function(datum) { return datum.label; }); // Assign class based on label

    return innerBlock;
  },

  /**
   * Creates and appends text labels to cells.
   * @param {d3.selection} enclosingBlock - D3 selection of parent cells.
   * @returns {d3.selection} D3 selection of the created text labels.
   */
  createBlockLabel: function(enclosingBlock) {
    let blockLabel = enclosingBlock.append("svg:text")
      .attr('class', 'shortLabel') // Assign CSS class
      .attr("x", function(datum) { return datum.width_dim / 2; }) // Center text horizontally
      .attr("y", function(datum) { return datum.height_dim / 2; }) // Center text vertically
      .attr("dy", ".35em") // Adjust vertical alignment
      .attr("text-anchor", "middle") // Center text anchor
      .attr("transform", function(datum) { return "translate(" + datum.pos_x + "," + datum.pos_y + ")"; }) // Position text
      .text(function(datum) { return datum.label; }) // Set text content
    return this.shortenLabel(blockLabel); // Apply label shortening logic
  },

  /**
   * Generates and appends items to the bottom legend section.
   */
  generateBottomKey: function() {
    let $bottomKey = $('#work-stoppage-key-bottom');

    // Iterate through explanation labels and append to the legend
    _(this.explanationLabels).each(function(keyEntry) {
      $bottomKey.append('<span class="key-item-bottom"><span class="color-patch color-patch-' + keyEntry[0] + '">' +
        '</span><h6 class="' + keyEntry[0] + '">' + keyEntry[1] + '</h6></span>');
    })
  },

  /**
   * Extracts unique parent data objects from a list of layout cells.
   * @param {Array} layoutCells - Array of D3 treemap layout cells.
   * @returns {Array} Array of unique parent data objects.
   */
  retrieveParentGroups: function(layoutCells) {
    let groupIdentifiers = {},
      parentGroups = [];
    for (let count = 0, total = layoutCells.length; count < total; count++) {
      // Check if parent has already been added to avoid duplicates
      if (!groupIdentifiers[layoutCells[count].parentItem.label]) {
        parentGroups.push(layoutCells[count].parentItem);
        groupIdentifiers[layoutCells[count].parentItem.label] = true;
      }
    }
    return parentGroups;
  },

  /**
   * Handles the zooming functionality of the treemap.
   * @param {object} targetDatum - The data object to zoom into (or out to).
   */
  magnifyArea: function(targetDatum) {
    // Calculate scaling factors based on target dimensions
    let scaleX = this.plotWidth / targetDatum.width_dim,
      scaleY = this.plotHeight / targetDatum.height_dim,
      hScale = this.horizontalScale,
      vScale = this.verticalScale;

    // Update the domain of the scales for zooming
    this.horizontalScale.domain([targetDatum.pos_x, targetDatum.pos_x + targetDatum.width_dim]);
    this.verticalScale.domain([targetDatum.pos_y, targetDatum.pos_y + targetDatum.height_dim]);

    // Apply transition to inner blocks for smooth scaling and repositioning
    let transitionEffect = this.graphicsContainer.selectAll("g.innerBlock").transition()
      .duration(d3.event.altKey ? 7500 : 750) // Longer duration with Alt key
      .attr("transform", function(datum) { return "translate(" + hScale(datum.pos_x) + "," + vScale(datum.pos_y) + ")"; });

    // Scale the rectangles within the inner blocks
    transitionEffect.select("rect")
      .attr("width", function(datum) { return scaleX * datum.width_dim; })
      .attr("height", function(datum) { return scaleY * datum.height_dim; })

    // Determine zoom direction (in or out)
    let zoomDirection = (targetDatum == this.topLevel) ? 'zoom_out' : 'zoom_in';

    // Apply transition to parent block labels for opacity and positioning
    this.graphicsContainer.selectAll("g.outerBlock").select("text.shortLabel")
      .transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .attr("transform", function(datum) { return "translate(" + hScale(datum.pos_x) + "," + vScale(datum.pos_y) + ")"; })
      .attr("x", function(datum) { return scaleX * datum.width_dim / 2; })
      .attr("y", function(datum) { return scaleY * datum.height_dim / 2; })
      .style("opacity", function(datum) { return zoomDirection == 'zoom_out' ? 1 : 0; }); // Hide labels when zooming in

    // Handle details panel visibility based on zoom direction
    if (zoomDirection == 'zoom_in') {
      this.populateInfoPanel(targetDatum, this.$infoPanel); // Populate details panel
      this.$infoPanel.slideDown(); // Show details panel
      this.isMagnified = true; // Set zoom state
      this.previousInteractionTarget = undefined; // Reset previous target for tooltip
      this.displayHint.conceal(); // Hide any active tooltip
    } else {
      this.$infoPanel.slideUp(); // Hide details panel
      this.isMagnified = false; // Reset zoom state
    }

    this.currentFocus = targetDatum; // Update current focus node
    d3.event.stopPropagation(); // Stop event propagation to prevent multiple clicks
  },

  /**
   * Populates the details panel with information about the selected data object.
   * @param {object} targetDatum - The data object for which to display details.
   * @param {jQuery} $infoPanel - The jQuery object for the details panel.
   * @returns {object} The current instance of the class for chaining.
   */
  populateInfoPanel: function(targetDatum, $infoPanel) {
    $infoPanel.find('h3').text(targetDatum.label); // Set organization name
    let $personnelPercentage = $infoPanel.find('tr.organization-personnel-percentage td'),
      $personnelCount = $infoPanel.find('tr.organization-personnel-count td');
    // Update percentage values
    $personnelPercentage.first().text(Math.round(100 * (targetDatum.excluded_total / targetDatum.metric)) + "%");
    $personnelPercentage.last().text(Math.round(100 * (targetDatum.suspended_total / targetDatum.metric)) + "%");
    // Update count values
    $personnelCount.first().text(targetDatum.excluded_total.formatNumber());
    $personnelCount.last().text(targetDatum.suspended_total.formatNumber());

    // Position the details panel
    $infoPanel.css({ left: (this.plotWidth / 2) - 150 });
    return this;
  },

  /**
   * Shortens text labels in cells if they exceed the cell width.
   * @param {d3.selection} blockLabel - D3 selection of text labels.
   * @returns {d3.selection} The modified D3 selection of text labels.
   */
  shortenLabel: function(blockLabel) {
    blockLabel.text(function(datum) { return (datum.shortForms && datum.shortForms.length) ? datum.shortForms[0] : ''; }) // Try first abbreviation
      .filter(function(datum) { return (this.getComputedTextLength() + 4 > datum.width_dim); }) // Filter if text is too long
      .text(function(datum) { return (datum.shortForms && datum.shortForms.length > 1) ? datum.shortForms[1] : ''; }) // Try second abbreviation
      .filter(function(datum) { return (this.getComputedTextLength() + 4 > datum.width_dim); }) // Filter again if still too long
      .text(''); // Clear text if still too long

    return blockLabel
  },

  /**
   * Updates the content and position of the tooltip based on mouse events.
   * @param {Event} eventObj - The mouse event object.
   */
  refreshHint: function(eventObj) {
    // Only update if the target element has changed
    if (eventObj.target != this.previousInteractionTarget) {
      this.previousInteractionTarget = eventObj.target; // Store current target
      let $currentElement = $(eventObj.target); // Wrap target in jQuery object

      // Check if visualization is currently zoomed in
      if (this.isMagnified) {
        let $innerBlock = $currentElement.parents('g.innerBlock'), // Find the parent inner block
          elementData = $innerBlock.data(); // Retrieve data associated with the block
        // If data exists and has a category that's in the legend
        if (elementData && elementData.category && this.explanationLabelsByCategory[elementData.category]) {
          let categoryLabel = this.explanationLabelsByCategory[elementData.category]; // Get full legend text
          // Set tooltip HTML content
          this.displayHint.setHtmlContent('<p>' + elementData.metric.formatNumber() + '</p><h6 class="' + elementData.category + '">' + categoryLabel + '</h6>')
        }
      } else { // If not zoomed in, show agency-level details
        let $organization = $currentElement.parents('g.outerBlock'), // Find the parent organization block
          organizationName = $organization.find('text.longLabel').text(), // Get full organization name (if available)
          elementData = $organization.data(); // Retrieve data associated with the organization
        // Construct tooltip HTML for organization details
        let hintContent = ['<h3>', elementData.organization, '</h3>',
          '<h6 class="text-red">', Math.round(100 * (elementData.suspended / elementData.headcount)), '% suspended</h6>',
          '<h6 class="text-gray"><em>click for details</em></h6>'
        ].join('');
        this.displayHint.setHtmlContent(hintContent); // Set tooltip HTML
      }
    }
    this.displayHint.setPosition(eventObj).reveal(); // Position and show the tooltip
  }

});

// Class for displaying a list of government programs and their statuses
GovClosure2013.ProgramStatusTracker = function(programData) {
  // Use provided program data or fallback to global programs data
  this.programs = programData || GovClosure2013.PROGRAMS;
  // Initialize the custom tooltip component
  this.statusHint = new GovClosure2013.InfoBubble();
  // Ensure 'this' context for the refreshHint method
  _.bindAll(this, 'refreshHint');
  // Select the main container for program lists
  this.$mainWrapper = $('#programs-wrapper');
  // Define jQuery objects for different status containers
  this.statusWrappers = {
    '$operational': this.$mainWrapper.find('#programs-operational'),
    '$at_risk': this.$mainWrapper.find('#programs-at-risk'),
    '$stopped': this.$mainWrapper.find('#programs-stopped')
  };
  // Display the programs initially
  this.displayPrograms();
  return this;
};

// Extend the prototype of ProgramStatusTracker with additional methods
_.extend(GovClosure2013.ProgramStatusTracker.prototype, {

  /**
   * Displays the list of programs, categorized by their status.
   * @param {jQuery} $wrapper - Optional jQuery object for the container. Defaults to main wrapper.
   */
  displayPrograms: function($wrapper) {
    if (!$wrapper) { $wrapper = $('#programs-wrapper'); } // Use main wrapper if none provided
    // Map program data to list item elements
    programElements = _(this.programs).map(_.bind(function(program) {
      let listItem = $('<li></li>') // Create a new list item
        .addClass('program-item ' + program.state) // Add class based on program status
        .text(program.title) // Set text content to program title
        .data('details', program.description); // Store program description as data

      // Append the list item to the appropriate status wrapper
      if (this.statusWrappers['$' + program.state]) {
        this.statusWrappers['$' + program.state].append(listItem);
      }
      return listItem;
    }, this));

    // Attach event listeners to the main wrapper for tooltip updates
    this.$mainWrapper.on('mousemove', this.refreshHint)
      .on('mouseenter', this.refreshHint)
      .on('mouseleave', _.bind(function() { this.statusHint.conceal(); }, this)); // Hide tooltip on mouse leave
  },

  /**
   * Updates the tooltip content and position based on mouse events over program list items.
   * @param {Event} eventObj - The mouse event object.
   */
  refreshHint: function(eventObj) {
    // Only update if the target element has changed
    if (eventObj.target != this.previousInteractionTarget) {
      // If the target is not a list item, hide the tooltip and return
      if (eventObj.target.tagName != 'LI') { this.statusHint.conceal(); return; }
      this.previousInteractionTarget = eventObj.target; // Store current target
      let $currentElement = $(eventObj.target),
        programDetails = $currentElement.data('details'); // Get program description from data
      this.statusHint.setTextContent(programDetails); // Set tooltip text content
    }
    this.statusHint.setPosition(eventObj).reveal(); // Position and show the tooltip
  }
});

// Class for tracking and displaying various closure-related metrics over time
GovClosure2013.MetricCounter = function() {
  // Select jQuery elements for displaying metrics
  this.$timeElapsed = $('#closure-duration');
  this.$missedPay = $('#unpaid-earnings');
  this.$aidAmount = $('#assistance-vouchers')
  // Define start and completion dates for the closure period
  this.startDate = new Date(2013, 9, 1); // October 1, 2013
  this.completionDate = new Date(2013, 9, 17, 0, 30); // October 17, 2013, 00:30

  // Optional: setInterval(_.bind(this.recalculateMetrics, this), 1000); // Uncomment to update every second
  this.recalculateMetrics(); // Perform initial calculation and display
};

// Extend the prototype of MetricCounter with additional methods
_.extend(GovClosure2013.MetricCounter.prototype, {

  /**
   * Recalculates and updates all displayed metrics.
   */
  recalculateMetrics: function() {
    let currentTime = new Date(),
      // Calculate total duration in seconds from start to completion date
      durationSeconds = Math.floor((this.completionDate - this.startDate) / 1000),
      // Calculate days, hours, minutes, and seconds from the duration
      daysCount = Math.floor(durationSeconds / (60 * 60 * 24)),
      hoursCount = Math.floor(durationSeconds / (60 * 60)) - (daysCount * 24),
      minutesCount = Math.floor(durationSeconds / 60) - ((daysCount * 24 * 60) + (hoursCount * 60)),
      secondsCount = durationSeconds - ((daysCount * 24 * 60 * 60) + (hoursCount * 60 * 60) + (minutesCount * 60)),
      // Calculate lost assistance amount
      assistanceLost = Math.floor((GovClosure2013.WIC_ASSISTANCE_VALUE_2012 / (365.25 * 24 * 60 * 60)) * durationSeconds);

    // Update the displayed duration string
    this.$timeElapsed.text(daysCount + 'd : ' + hoursCount + 'h : ' + minutesCount + 'm : ' + secondsCount + 's');

    // Update the displayed assistance amount, formatted
    this.$aidAmount.text('$' + assistanceLost.formatNumber());

    // Calculate and display unpaid earnings if suspended personnel data is available
    if (GovClosure2013.workStoppageChart.topLevel.suspended_total) {
      let suspendedPersonnel = GovClosure2013.workStoppageChart.topLevel.suspended_total,
        averageWage = GovClosure2013.AVERAGE_WAGE,
        // Calculate suspended wage per second
        suspendedWagePerSecond = (averageWage * suspendedPersonnel) / (365.25 * 24 * 60 * 60),
        // Calculate total suspended wage
        totalSuspendedWage = Math.floor(suspendedWagePerSecond * durationSeconds);
      // Update the displayed unpaid earnings, formatted
      this.$missedPay.text('$' + totalSuspendedWage.formatNumber());
    }
  }
});

// Class for creating and managing a generic information bubble (tooltip)
GovClosure2013.InfoBubble = function() {
  // Ensure 'this' context for all public methods
  _.bindAll(this, 'reveal', 'conceal', 'setHtmlContent', 'setTextContent', 'applyStyles', 'setPosition');
  // Select the tooltip element using jQuery
  this.$bubbleElement = $('div.info-bubble');
  // Define a default display width for the tooltip
  this.displayWidth = 200;
};

// Extend the prototype of InfoBubble with utility methods
_.extend(GovClosure2013.InfoBubble.prototype, {
  /** Reveals the info bubble. */
  reveal: function() { this.$bubbleElement.show(); return this; },
  /** Conceals the info bubble. */
  conceal: function() { this.$bubbleElement.hide(); return this; },
  /** Sets the HTML content of the info bubble. */
  setHtmlContent: function(contentHtml) { this.$bubbleElement.html(contentHtml); return this; },
  /** Sets the plain text content of the info bubble. */
  setTextContent: function(plainText) { this.$bubbleElement.text(plainText); return this; },
  /** Applies CSS styles to the info bubble. */
  applyStyles: function(styleObject) { this.$bubbleElement.css(styleObject); return this; },

  /**
   * Positions the info bubble relative to a mouse event.
   * @param {Event} eventObj - The mouse event object containing page coordinates.
   * @returns {object} The current instance of the class for chaining.
   */
  setPosition: function(eventObj) {
    let bubbleHeight = this.$bubbleElement.outerHeight(), // Get tooltip's outer height
      viewportWidth = $(window).width(), // Get window width
      bubbleLeft = eventObj.pageX - (this.displayWidth / 2), // Calculate left position, centered
      bubbleTop = eventObj.pageY - (bubbleHeight + 15); // Calculate top position, above cursor

    // Clamp the left position to keep the tooltip within window bounds
    bubbleLeft = Math.min(Math.max(bubbleLeft, 20), viewportWidth - (this.displayWidth + 40));
    // Apply the calculated position to the tooltip
    this.$bubbleElement.css({ top: bubbleTop, left: bubbleLeft });
    return this;
  }
})