// This file contains JavaScript code defining various components for the Shutdown2013 application.
// It includes modules for a furlough map, a service list, a stats clock, and a tooltip utility.


// Initialize the global namespace for Shutdown2013 application components.
// All related classes and utilities will be attached to this object.
window.Shutdown2013 = {};



/*
 * Constructor function for the FurloughMap component.
 * This component is responsible for visualizing furlough data using a D3 treemap.
 * It manages rendering, zooming, and interaction with the map.
 */
Shutdown2013.FurloughMap = function () {
  // Bind specific methods of this instance to 'this' to ensure their context is correct when called as event handlers.
  _.bindAll(this, 'render', 'zoom', 'abbrevText', 'updateTip');

  // Define the effective width and height for the treemap visualization area.
  this.width = 1280 - 80; // Calculate the total width, accounting for margins or padding.
  this.height = 800 - 280; // Calculate the total height, accounting for margins or padding.

  // Set up D3 linear scales for the X and Y axes.
  // These scales will map data coordinates to pixel coordinates within the visualization.
  this.xScale = d3.scale.linear() .range([0, this.width]); // X-axis scale, mapping to the full width.
  this.yScale = d3.scale.linear() .range([0, this.height]); // Y-axis scale, mapping to the full height.


  // Define the text labels for the legend, categorized by furlough status.
  this.legendText = [
    ['furloughed', "Furloughed Employees"], // Category for employees on furlough.
    ['exempt_a', "Furlough-Exempt: Law enforcement, health & safety"], // First exemption category.
    ['exempt_b', "Furlough-Exempt: Financed from available funds"], // Second exemption category.
    ['exempt_c', "Furlough-Exempt: Protecting life and property"], // Third exemption category.
    ['exempt_d', "Furlough-Exempt: Other/Unknown"] // Catch-all for other/unspecified exemptions.
  ];

  // Convert the legend text array into an object for easy lookup by category type.
  this.legendTextByType = _(this.legendText).object();


  // Initialize the D3 treemap layout.
  this.treemap = d3.layout.treemap()
    // The commented line below indicates a possible alternative mode, but 'squarify' (default) is used.
    //.mode('slice-dice')
    .padding(1) // Set a small padding around each treemap cell.
    .round(true) // Round cell dimensions to the nearest pixel for crisp rendering.
    .size([this.width, this.height]) // Define the overall size of the treemap.
    .value(function (d) { return d.size; }) // Accessor function to get the size for each node.
    .sort(function (a, b) {
      // Custom sorting function for treemap nodes.
      // Exempt categories are pushed to the end, furloughed to the beginning, then sorted by value.
      if (a.name.match('exempt')) { return 1; } // Exempt items come after.
      else if (a.name.match('furloughed')) { return -1; } // Furloughed items come before.
      return a.value - b.value; // Otherwise, sort by value in ascending order.
    });


  // Select the container for the D3 chart and append an SVG element.
  // This SVG will host all the treemap cells and other visual elements.
  this.svg = d3.select('#furlough-map-container .chart')
    .style({'width': this.width + 'px', 'height': this.height + 'px'}) // Set CSS width and height.
    .append("svg:svg") // Append the main SVG container.
    .attr("width", this.width) // Set SVG width attribute.
    .attr("height", this.height) // Set SVG height attribute.
    .append("svg:g") // Append a group element to apply a slight translation for pixel snapping.
    .attr("transform", "translate(.5,.5)"); // Translate by half a pixel to align with pixel grid.


  // Select the agency details container for displaying specific information.
  this.$details = $('.chart .agency-details');

  // Instantiate a new Tooltip object for interactive hover information.
  this.tip = new Shutdown2013.Tooltip();

  // Initiate the rendering process for the map.
  this.render();
};


// Extend the prototype of FurloughMap with additional methods.
_.extend(Shutdown2013.FurloughMap.prototype, {

  /**
   * Renders the treemap visualization.
   * If no data is provided, it defaults to Shutdown2013.AGENCIES.
   * @param {Object} [data] - The data object to render (typically a hierarchical structure).
   */
  render: function (data) {
    // Use provided data or fall back to the global AGENCIES data.
    data = data || Shutdown2013.AGENCIES;

    // Set the current node and root node for the treemap.
    this.node = data;
    this.root = data;

    // Sort the children of the root node based on their total employee count.
    // This ensures a consistent visual order for the agencies.
    data.children = data.children.sort(function (a, b) {
      var aTotal = 0, bTotal = 0;
      // Calculate total for 'a'
      for (var i = 0; i < a.children.length; i++) { aTotal += a.children[i].size; }
      // Calculate total for 'b'
      for (var i = 0; i < b.children.length; i++) { bTotal += b.children[i].size; }
      return bTotal - aTotal; // Sort in descending order of total employees.
    });


    // Generate treemap nodes and filter out parent nodes (only leaf nodes are processed initially).
    var nodes = this.treemap.nodes(this.root).filter(function (d) { return !d.children; }),
      nodeParents = this.getParents(nodes), // Get unique parent nodes from the filtered leaf nodes.
      parentCell = this.defineParentCell(nodeParents), // Create SVG groups for parent cells.
      cell = this.defineCell(), // Create SVG groups for individual cells within parent cells.
      cellText = this.defineCellText(parentCell), // Add text labels to cells.
      $legend = $('#furlough-map-legend'); // Select the legend element.

    // Update the legend with total employee counts.
    $legend.find('.total-employees').text(this.root.value.commafy());
    $legend.find('.total-exempt').text((this.root.value - this.root.furloughed_total).commafy());
    $legend.find('.total-furloughed').text(this.root.furloughed_total.commafy());

    // Generate the bottom legend items.
    this.makeBottomLegend();

    // Attach mouse event handlers to the SVG element for tooltip management.
    $('svg').on('mousemove', this.updateTip) // Update tooltip position on mouse movement.
      .on('mouseenter', this.updateTip) // Show/update tooltip on mouse entry.
      .on('mouseleave', this.tip.hide); // Hide tooltip on mouse exit.


    // Attach a global click handler to the window for zooming out.
    // It zooms to the root node if nothing else is clicked.
    d3.select(window).on("click", _.bind(function () { this.zoom(this.root); }, this));
  },

  /**
   * Creates SVG group elements for parent nodes (agencies).
   * These groups will contain the individual cells for each agency's categories.
   * @param {Array} nodeParents - An array of parent nodes (agencies).
   * @returns {d3.selection} The D3 selection of created parent cell groups.
   */
  defineParentCell: function (nodeParents) {
    return this.svg.selectAll('g.parentCell') // Select existing parent cells.
      .data(nodeParents) // Bind data to parent cells.
      .enter().append("svg:g") // Append new group elements for new data.
      .attr("class", "parentCell") // Assign class for styling and selection.
      .attr('data-agency', function (d) { return d.name; }) // Store agency name as data attribute.
      .attr('data-staff', function (d) { return d.value; }) // Store total staff as data attribute.
      .attr('data-furloughed', function (d) { return d.furloughed_total; }) // Store furloughed count.
      .attr('data-exempt', function (d) { return d.exempt_total; }); // Store exempt count.
  },

  /**
   * Creates SVG group elements for individual treemap cells (furlough categories).
   * These cells represent the breakdown of employees within each agency.
   * @returns {d3.selection} The D3 selection of created cell groups.
   */
  defineCell: function () {
    var cell = this.svg.selectAll('g.parentCell').selectAll('g.cell') // Select all cells within parent cells.
      .data(function (d) { return d.children; }) // Bind child data (furlough categories) to cells.
      .enter().append('svg:g') // Append new group elements for new cells.
      .attr('class', 'cell') // Assign class for styling.
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; }) // Position cell.
      .attr("data-type", function (d) { return d.name; }) // Store category type.
      .attr("data-value", function (d) { return d.value; }) // Store category value.
      .on("click", _.bind(function (d) {
        // On click, zoom into the clicked cell's parent, or to the root if already zoomed in.
        return this.zoom(this.node == d.parent ? this.root : d.parent);
      }, this))
      .on('mouseover', function (d) { d3.select(this.parentNode).classed('active', true); }) // Highlight parent on hover.
      .on('mouseout', function (d) { d3.select(this.parentNode).classed('active', false); }); // Remove highlight on mouse out.

    // Append a rectangle to each cell group to represent the treemap area.
    cell.append("svg:rect")
      .attr("width", function (d) { return d.dx; }) // Set rectangle width.
      .attr("height", function (d) { return d.dy; }) // Set rectangle height.
      .attr('class', function (d) { return d.name; }); // Assign class based on category name for coloring.

    return cell;
  },

  /**
   * Adds text labels to the treemap cells.
   * It attempts to use abbreviations if the full text doesn't fit.
   * @param {d3.selection} cell - The D3 selection of cell groups.
   * @returns {d3.selection} The D3 selection of text elements after abbreviation processing.
   */
  defineCellText: function (cell) {
    var cellText = cell.append("svg:text") // Append text element to each cell.
      .attr('class', 'abbrevText') // Assign class for styling.
      .attr("x", function (d) { return d.dx / 2; }) // Center text horizontally.
      .attr("y", function (d) { return d.dy / 2; }) // Center text vertically.
      .attr("dy", ".35em") // Adjust vertical alignment.
      .attr("text-anchor", "middle") // Anchor text in the middle.
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; }) // Position text relative to cell.
      .text(function (d) { return d.name; }); // Initial text is the full name.
    return this.abbrevText(cellText); // Process text for abbreviation if it doesn't fit.
  },

  /**
   * Generates and appends the legend items to the bottom legend container.
   * Each item includes a color swatch and descriptive text.
   */
  makeBottomLegend: function () {
    var $legendBottom = $('#furlough-legend-bottom'); // Select the bottom legend container.

    // Iterate through each legend item defined in `this.legendText`.
    _(this.legendText).each(function (legendItem) {
      // Append HTML for each legend item, including a colored swatch and text.
      $legendBottom.append('<span class="legend-bottom-item"><span class="swatch swatch-' + legendItem[0] + '">' +
        '</span><h6 class="' + legendItem[0] + '">' + legendItem[1] + '</h6></span>');
    });
  },

  /**
   * Extracts unique parent nodes from a given array of nodes.
   * Used to identify all unique agencies that have sub-categories.
   * @param {Array} nodes - An array of treemap nodes (typically leaf nodes).
   * @returns {Array} An array of unique parent nodes.
   */
  getParents: function (nodes) {
    var parentNames = {}, // Object to track seen parent names.
      nodeParents = []; // Array to store unique parent nodes.
    for (var i = 0, len = nodes.length; i < len; i++) {
      // If this parent's name hasn't been seen yet, add it to the list.
      if (!parentNames[nodes[i].parent.name]) {
        nodeParents.push(nodes[i].parent);
        parentNames[nodes[i].parent.name] = true; // Mark as seen.
      }
    }
    return nodeParents;
  },

  /**
   * Implements the zooming functionality for the treemap.
   * Transitions the view to focus on a specific node or zoom out to the root.
   * @param {Object} d - The data node to zoom into (or the root to zoom out).
   */
  zoom: function (d) {
    // Calculate scaling factors and update the D3 scales.
    var kx = this.width / d.dx, // Horizontal scaling factor.
      ky = this.height / d.dy, // Vertical scaling factor.
      x = this.xScale, // Reference to X scale.
      y = this.yScale; // Reference to Y scale.

    this.xScale.domain([d.x, d.x + d.dx]); // Update X scale domain based on target node.
    this.yScale.domain([d.y, d.y + d.dy]); // Update Y scale domain based on target node.

    // Transition all individual cells to their new scaled and translated positions.
    var t = this.svg.selectAll("g.cell").transition()
      .duration(d3.event.altKey ? 7500 : 750) // Long duration if Alt key is pressed, otherwise standard.
      .attr("transform", function (d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    // Transition the rectangles within cells to their new scaled dimensions.
    t.select("rect")
      .attr("width", function (d) { return kx * d.dx; }) // Scale width.
      .attr("height", function (d) { return ky * d.dy; }); // Scale height.

    // Determine the zoom direction for text opacity.
    var zoomDir = (d == this.root) ? 'out' : 'in';

    // Transition parent cell text elements.
    this.svg.selectAll("g.parentCell").select("text.abbrevText")
      .transition()
      .duration(d3.event.altKey ? 7500 : 750) // Same duration as cells.
      .attr("transform", function (d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; }) // Translate text.
      .attr("x", function (d) { return kx * d.dx / 2; }) // Center text horizontally within scaled cell.
      .attr("y", function (d) { return ky * d.dy / 2; }) // Center text vertically within scaled cell.
      .style("opacity", function (d) { return zoomDir == 'out' ? 1 : 0; }); // Show text on zoom out, hide on zoom in.

    // Handle details panel visibility and content based on zoom direction.
    if (zoomDir == 'in') {
      this.makeDetails(d, this.$details); // Populate details panel.
      this.$details.slideDown(); // Show details panel with a slide animation.
      this.zoomed = true; // Set zoomed state.
      this.prevTarget = undefined; // Reset previous target for tooltip.
      this.tip.hide(); // Hide any active tooltip.
    } else {
      this.$details.slideUp(); // Hide details panel with a slide animation.
      this.zoomed = false; // Reset zoomed state.
    }

    this.node = d; // Update the current node.
    d3.event.stopPropagation(); // Stop event propagation to prevent window click from zooming out immediately.
  },

  /**
   * Populates the agency details panel with information about the currently zoomed-in agency.
   * @param {Object} d - The data node (agency) to display details for.
   * @param {jQuery} $details - The jQuery object for the details panel.
   * @returns {Shutdown2013.FurloughMap} The current instance for chaining.
   */
  makeDetails: function (d, $details) {
    $details.find('h3').text(d.name); // Set agency name.
    var $staffPercent = $details.find('tr.agency-staff-percent td'), // Select percentage cells.
      $staffCount = $details.find('tr.agency-staff-count td'); // Select count cells.

    // Calculate and display percentage values.
    $staffPercent.first().text(Math.round(100 * (d.exempt_total / d.value)) + "%");
    $staffPercent.last().text(Math.round(100 * (d.furloughed_total / d.value)) + "%");

    // Display raw count values, formatted with commas.
    $staffCount.first().text(d.exempt_total.commafy());
    $staffCount.last().text(d.furloughed_total.commafy());

    // Position the details panel centrally.
    $details.css({left: (this.width / 2) - 150});
    return this;
  },

  /**
   * Abbreviates text labels in cells if they don't fit within their allocated space.
   * It tries multiple abbreviations defined in the data.
   * @param {d3.selection} cellText - The D3 selection of text elements.
   * @returns {d3.selection} The D3 selection of text elements after abbreviation.
   */
  abbrevText: function (cellText) {
    cellText.text(function (d) { return (d.abbreviations && d.abbreviations.length) ? d.abbreviations[0] : ''; }) // Try first abbreviation.
      .filter(function (d) { return (this.getComputedTextLength() + 4 > d.dx); }) // Filter for text that still doesn't fit.
      .text(function (d) { return (d.abbreviations && d.abbreviations.length > 1) ? d.abbreviations[1] : ''; }) // Try second abbreviation.
      .filter(function (d) { return (this.getComputedTextLength() + 4 > d.dx); }) // Filter again.
      .text(''); // If still doesn't fit, clear the text.

    return cellText;
  },

  /**
   * Updates the tooltip content and position based on mouse events.
   * Displays different information depending on whether the map is zoomed or not.
   * @param {Event} e - The mouse event object.
   */
  updateTip: function (e) {
    // Only update if the target element has changed.
    if (e.target != this.prevTarget) {
      this.prevTarget = e.target; // Store the new target.
      var $target = $(e.target); // Wrap target in jQuery.

      if (this.zoomed) {
        // If zoomed in, show details for the specific furlough category.
        var $cell = $target.parents('g.cell'), // Find the parent cell group.
          nodeData = $cell.data(); // Get data attributes from the cell.

        // Check if node data and legend text exist for the category type.
        if (nodeData && nodeData.type && this.legendTextByType[nodeData.type]) {
          var legendText = this.legendTextByType[nodeData.type]; // Get the descriptive text.
          // Set tooltip HTML with value and category description.
          this.tip.html('<p>' + nodeData.value.commafy() + '</p><h6 class="' + nodeData.type + '">' + legendText + '</h6>');
        }
      } else {
        // If not zoomed, show summary details for the agency.
        var $agency = $target.parents('g.parentCell'), // Find the parent agency cell group.
          agencyName = $agency.find('text.fullText').text(), // (This seems to be a placeholder, fullText class might not exist)
          nodeData = $agency.data(); // Get data attributes from the agency cell.

        // Construct tooltip HTML for agency summary.
        var tipHtml = ['<h3>', nodeData.agency, '</h3>',
          '<h6 class="text-red">', Math.round(100 * (nodeData.furloughed / nodeData.staff)), '% furloughed</h6>',
          '<h6 class="text-gray"><em>click for details</em></h6>'].join(''); // Join array elements into a string.
        this.tip.html(tipHtml);
      }
    }
    this.tip.position(e).show(); // Position and show the tooltip.
  }

});



/**
 * Constructor function for the ServiceList component.
 * This component displays a list of government services and their shutdown status.
 * @param {Array} services - An array of service objects.
 */
Shutdown2013.ServiceList = function (services) {
  this.services = services || Shutdown2013.SERVICES; // Use provided services or default global services.
  this.tip = new Shutdown2013.Tooltip(); // Instantiate a tooltip for service descriptions.
  _.bindAll(this, 'updateTip'); // Bind updateTip method to the instance.
  this.$container = $('#services-container'); // Cache the main container element.
  this.containers = {
    '$ok': this.$container.find('#services-ok'), // Container for 'ok' services.
    '$risk': this.$container.find('#services-risk'), // Container for 'at risk' services.
    '$halted': this.$container.find('#services-halted') // Container for 'halted' services.
  };
  this.render(); // Render the service list immediately.
  return this; // Return the instance for chaining.
};


// Extend the prototype of ServiceList with rendering and interaction methods.
_.extend(Shutdown2013.ServiceList.prototype, {

  /**
   * Renders the list of services into their respective status containers.
   * @param {jQuery} [$container] - Optional jQuery object for the container (defaults to `this.$container`).
   */
  render: function ($container) {
    if (!$container) { $container = $('#services-container'); } // Use default container if none provided.
    // The commented code below shows an alternative rendering approach that was not used.
    //var $servicesUl = $("<ul class='services'></ul>"), serviceItems = []
    //        serviceItems = _(this.services).map(function(service) {
    //            return $('<li></li>')
    //                .addClass('service ' + service.status)
    //                .text(service.name)
    //                .data('description', service.description);
    //        });

    // Map through the services array to create list items and append them to the correct containers.
    serviceItems = _(this.services).map(_.bind(function (service) {
      var li = $('<li></li>') // Create a new list item.
        .addClass('service ' + service.status) // Add 'service' class and status-specific class.
        .text(service.name) // Set the service name as text.
        .data('description', service.description); // Store the description as data.

      // Append the list item to the appropriate status container.
      if (this.containers['$' + service.status]) {
        this.containers['$' + service.status].append(li);
      }
      return li; // Return the created list item.
    }, this));
    //$container.html($servicesUl.html(serviceItems)); // This line is commented out, indicating an unused alternative.

    // Attach mouse event handlers to the main container for tooltip management.
    this.$container.on('mousemove', this.updateTip) // Update tooltip position on mouse move.
      .on('mouseenter', this.updateTip) // Show/update tooltip on mouse entry.
      .on('mouseleave', _.bind(function () { this.tip.hide(); }, this)); // Hide tooltip on mouse exit.
  },

  /**
   * Updates the tooltip content and position for service list items.
   * Displays the service description on hover.
   * @param {Event} e - The mouse event object.
   */
  updateTip: function (e) {
    // Only update if the target element has changed.
    if (e.target != this.prevTarget) {
      // If the target is not an LI element, hide the tooltip and return.
      if (e.target.tagName != 'LI') { this.tip.hide(); return; }
      this.prevTarget = e.target; // Store the new target.
      var $target = $(e.target), // Wrap target in jQuery.
        description = $target.data('description'); // Get the stored description.
      this.tip.text(description); // Set the tooltip text.
    }
    this.tip.position(e).show(); // Position and show the tooltip.
  }
});


/**
 * Constructor function for the StatsClock component.
 * This component calculates and displays shutdown duration, unpaid salaries, and food voucher costs.
 */
Shutdown2013.StatsClock = function () {
  this.$duration = $('#shutdown-duration'); // jQuery object for duration display.
  this.$unpaid = $('#unpaid-salary'); // jQuery object for unpaid salary display.
  this.$food = $('#food-vouchers'); // jQuery object for food vouchers display.

  // Define the start and (estimated) end dates of the shutdown.
  this.beginDate = new Date(2013, 9, 1); // October 1, 2013
  this.endDate = new Date(2013, 9, 17, 0, 30); // October 17, 2013, 00:30

  // The commented line below indicates that a setInterval was considered but not used here.
  //setInterval(_.bind(this.update, this), 1000);

  this.update(); // Call update immediately to display initial values.
};


// Extend the prototype of StatsClock with the update method.
_.extend(Shutdown2013.StatsClock.prototype, {

  /**
   * Updates the displayed shutdown statistics (duration, unpaid salary, food costs).
   * This method is intended to be called periodically.
   */
  update: function () {
    var now = new Date(), // Get the current time.
      dT = Math.floor((this.endDate - this.beginDate) / 1000), // Calculate total duration in seconds.
      d = Math.floor(dT / (60 * 60 * 24)), // Calculate days.
      h = Math.floor(dT / (60 * 60)) - (d * 24), // Calculate hours remaining after days.
      m = Math.floor(dT / 60) - ((d * 24 * 60) + (h * 60)), // Calculate minutes remaining after days and hours.
      s = dT - ((d * 24 * 60 * 60) + (h * 60 * 60) + (m * 60)), // Calculate seconds remaining.
      foodUnpaid = Math.floor((Shutdown2013.WIC_FOOD_COST_2012 / (365.25 * 24 * 60 * 60)) * dT); // Calculate food cost.

    // Update the duration display.
    this.$duration.text(d + 'd : ' + h + 'h : ' + m + 'm : ' + s + 's');

    // Update the food voucher cost display, formatted with commas.
    this.$food.text('$' + foodUnpaid.commafy());

    // Calculate and display unpaid salary if furlough data is available.
    if (Shutdown2013.furloughMap.root.furloughed_total) {
      var furloughed = Shutdown2013.furloughMap.root.furloughed_total, // Total furloughed employees.
        avgSalary = Shutdown2013.AVG_SALARY, // Average annual salary.
        furlSalaryPerS = (avgSalary * furloughed) / (365.25 * 24 * 60 * 60), // Unpaid salary per second.
        furlSalary = Math.floor(furlSalaryPerS * dT); // Total unpaid salary.
      this.$unpaid.text('$' + furlSalary.commafy()); // Update unpaid salary display.
    }
  }
});


/**
 * Constructor function for the Tooltip component.
 * This component provides a reusable, styled tooltip for displaying information on hover.
 */
Shutdown2013.Tooltip = function () {
  // Bind all essential methods to 'this' to maintain context.
  _.bindAll(this, 'show', 'hide', 'html', 'text', 'css', 'position');
  this.$tip = $('div.tooltip'); // Cache the jQuery object for the tooltip element.
  this.width = 200; // Define a fixed width for the tooltip.
};


// Extend the prototype of Tooltip with methods for its functionality.
_.extend(Shutdown2013.Tooltip.prototype, {

  /**
   * Shows the tooltip.
   * @returns {Shutdown2013.Tooltip} The current instance for chaining.
   */
  show: function () { this.$tip.show(); return this; },

  /**
   * Hides the tooltip.
   * @returns {Shutdown2013.Tooltip} The current instance for chaining.
   */
  hide: function () { this.$tip.hide(); return this; },

  /**
   * Sets the HTML content of the tooltip.
   * @param {string} html - The HTML string to set.
   * @returns {Shutdown2013.Tooltip} The current instance for chaining.
   */
  html: function (html) { this.$tip.html(html); return this; },

  /**
   * Sets the plain text content of the tooltip.
   * @param {string} text - The text string to set.
   * @returns {Shutdown2013.Tooltip} The current instance for chaining.
   */
  text: function (text) { this.$tip.text(text); return this; },

  /**
   * Applies CSS properties to the tooltip.
   * @param {Object} css - An object of CSS properties.
   * @returns {Shutdown2013.Tooltip} The current instance for chaining.
   */
  css: function (css) { this.$tip.css(css); return this; },

  /**
   * Positions the tooltip relative to a mouse event.
   * It attempts to keep the tooltip within the window boundaries.
   * @param {Event} e - The mouse event object.
   * @returns {Shutdown2013.Tooltip} The current instance for chaining.
   */
  position: function (e) {
    var tipHeight = this.$tip.outerHeight(), // Get tooltip's outer height.
      windowWidth = $(window).width(), // Get current window width.
      tipLeft = e.pageX - (this.width / 2), // Calculate initial left position (centered on cursor).
      tipTop = e.pageY - (tipHeight + 15); // Calculate initial top position (above cursor).

    // Adjust tipLeft to keep it within window boundaries.
    tipLeft = Math.min(Math.max(tipLeft, 20), windowWidth - (this.width + 40));

    // Apply the calculated top and left positions to the tooltip.
    this.$tip.css({top: tipTop, left: tipLeft});
    return this;
  }
});