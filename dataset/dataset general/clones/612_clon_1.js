var w = 400; // Define the width of the visualization area.
var h = 200; // Define the height of the visualization area.

// Set up the linear scale for the x-axis based on input data.
var x = pv.Scale.linear(data, function(d) { return d.x; }).range(0, w);

// Set up the linear scale for the y-axis, mapping 0-4 to the visualization height.
var y = pv.Scale.linear(0, 4).range(0, h);


// Initialize the main Protovis panel for rendering.
var vis = new pv.Panel()
  .canvas('fig') // Target the HTML canvas element with ID 'fig'.
  .width(w)      // Apply the calculated width.
  .height(h)     // Apply the calculated height.
  .bottom(20)    // Set the bottom margin for the panel.
  .left(20)      // Set the left margin for the panel.
  .right(10)     // Set the right margin for the panel.
  .top(5);       // Set the top margin for the panel.


// Add the Y-axis rules, ticks, and labels to the visualization.
vis.add(pv.Rule)
  .data(y.ticks(5)) // Generate 5 tick marks along the Y-axis.
  .bottom(y)        // Position each tick based on the Y scale.
  .strokeStyle(function(d) {
    // Determine tick line color: dark for main axis, light for grid lines.
    return d ? "#eee" : "#000";
  })
  .anchor("left")   // Anchor the labels to the left of the Y-axis.
    .add(pv.Label)  // Add text labels for each Y-axis tick.
      .text(y.tickFormat); // Format the label text using the Y-axis's default formatter.


// Add the X-axis rules, ticks, and labels to the visualization.
vis.add(pv.Rule)
  .data(x.ticks())    // Generate tick marks along the X-axis based on the X scale.
  .visible(function(d) { return d; }) // Ensure all generated ticks are visible.
  .left(x)            // Position each tick based on the X scale.
  .bottom(-5)         // Offset the X-axis slightly below the main plot area.
  .height(5)          // Set the height of the X-axis tick marks.
  .anchor("bottom")   // Anchor the labels to the bottom of the X-axis.
    .add(pv.Label)    // Add text labels for each X-axis tick.
      .text(x.tickFormat); // Format the label text using the X-axis's default formatter.


// Add the main area plot and its top boundary line.
vis.add(pv.Area)
  .data(data)               // Bind the primary data set to the area plot.
  .bottom(1)                // Set the base level of the area plot.
  .left(function(d) {
    return x(d.x);          // Calculate the left edge of each area segment using the X scale.
  })
  .height(function(d) {
    return y(d.y);          // Calculate the height of each area segment using the Y scale.
  })
  .fillStyle("rgb(121,173,210)") // Set the fill color for the area.
  .anchor("top")            // Anchor the line to the top edge of the area.
    .add(pv.Line)           // Add a line element representing the top boundary of the area.
      .lineWidth(3);        // Set the stroke width for the top line.


// Finally, render the entire Protovis visualization to the canvas.
vis.root.render();