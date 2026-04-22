// Centralized collection of routines for various design extensions
let designCraft = designCraft || {};

designCraft.utility = {
  traverseAllNodes: function(elements, action) {
    for (let idx = 0; idx < [elements count]; idx++) {
      let node = [elements objectAtIndex:idx];
      console.debug(node);
      if ([node isMemberOfClass:[SketchGroup class]]) {
        action(node);
        // Recurse into child elements
        designCraft.utility.traverseAllNodes([node layers], action);
      }
      else {
        action(node);
      }
    }
  },

  fetchCanvasGridSpacing: function() {
    const canvas_grid = [[[documentObj activePage] currentWorksheet] verticalLayoutData];
    const spacing = [canvas_grid getGuideAt: 1] - [canvas_grid getGuideAt: 0];

    return [canvas_grid getGuideAt: 1];
  },

  // Computes and yields the most appropriate factor for a given input value
  // relative to the active grid unit.
  // For instance, if the grid unit is 20 pixels and you input 24,
  // this routine will output 1. For an input of 35, it will output 2.
  determineFactor: function(inputVal) {
    let factor;
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    if (inputVal % grid_spacing === 0) {
      factor = inputVal / grid_spacing;
    }
    else {
      if (inputVal % grid_spacing > (grid_spacing / 2)) {
        factor = Math.ceil(inputVal / grid_spacing);
      }
      else {
        factor = Math.floor(inputVal / grid_spacing);
      }
    }
    return factor === 0 ? 1 : factor;
  },

  notifyUser: function(header, content) {
    const applicationInst = [AppManager sharedInstance];
    [applicationInst showModal: content withTitle: header];
  }
};

designCraft.dimensions = {
  adjustHeightTo: function(element, target_height) {
    const current_dim_h = [[element boundary] h_dim];

    // This specific approach is necessary as no direct height adjustment method exists.
    [[element boundary] deductHeight: current_dim_h - 1];
    [[element boundary] augmentHeight: target_height - 1];
  },

  adjustWidthTo: function(element, target_width) {
    const current_dim_w = [[element boundary] w_dim];

    // This specific approach is necessary as no direct width adjustment method exists.
    [[element boundary] deductWidth: current_dim_w - 1];
    [[element boundary] augmentWidth: target_width - 1];
  },

  conformToBaselineGrid: function(element) {
    const element_h = [[element boundary] h_dim];
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    const new_h_factor = designCraft.utility.determineFactor(element_h);
    const final_height = grid_spacing * new_h_factor;
    designCraft.dimensions.adjustHeightTo(element, final_height);
  },

  conformToHorizontalGrid: function(element) {
    // Begin by aligning the element to the nearest column.
    designCraft.positioning.alignLeftEdgeToClosestGridline(layout_grid, element);

    const element_w = [[element boundary] w_dim];
    const element_x2_coord = element_w + [[element boundary] x_coord];
    const closest_col_idx = layout_grid.locateNearestEndLineIndex(element);
    const closest_column = layout_grid.grid_segments[closest_col_idx];
    const final_width = closest_column.end_coord - [[element boundary] x_coord];

    designCraft.dimensions.adjustWidthTo(element, final_width);
  },

  extendToBaselineGrid: function(element) {
    const element_h = [[element boundary] h_dim];
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    designCraft.dimensions.adjustHeightTo(element, element_h + grid_spacing);
  },

  contractToBaselineGrid: function(element) {
    const element_h = [[element boundary] h_dim];
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    designCraft.dimensions.adjustHeightTo(element, element_h - grid_spacing);
  },

  contractToHorizontalGrid: function(element) {
    // Begin by aligning the element to the nearest column.
    designCraft.positioning.alignLeftEdgeToClosestGridline(layout_grid, element);

    const element_w = [[element boundary] w_dim];
    const element_x2_coord = element_w + [[element boundary] x_coord];
    const closest_col_idx = layout_grid.locateNearestEndLineIndex(element);

    let closest_column = layout_grid.grid_segments[closest_col_idx];

    // Handle cases where the element is already aligned or the closest column is ahead.
    if (closest_column.end_coord >= element_x2_coord) {
      console.debug("Closest column is ahead.");
      closest_column = layout_grid.grid_segments[closest_col_idx - 1];
    }

    const final_width = closest_column.end_coord - [[element boundary] x_coord];

    if (!(final_width < layout_grid.segment_width)) {
      designCraft.dimensions.adjustWidthTo(element, final_width);
    } else {
      console.debug("Cannot shrink further.");
    }
  },

  extendToHorizontalGrid: function(element) {
    // Begin by aligning the element to the nearest column.
    designCraft.positioning.alignLeftEdgeToClosestGridline(layout_grid, element);

    const element_w = [[element boundary] w_dim];
    const element_x2_coord = element_w + [[element boundary] x_coord];
    const closest_col_idx = layout_grid.locateNearestEndLineIndex(element);

    let closest_column = layout_grid.grid_segments[closest_col_idx + 1];
    if (closest_column.end_coord === element_x2_coord) {
      console.debug("Moving to the subsequent column.");
      closest_column = layout_grid.grid_segments[closest_col_idx + 2];
    }

    const final_width = closest_column.end_coord - [[element boundary] x_coord];

    designCraft.dimensions.adjustWidthTo(element, final_width);
  }
};

designCraft.typography = {
  // Adjusts a text element's line gap to conform with the active baseline grid.
  setLineGapToBaselineGrid: function(text_node) {
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    if ([text_node fontMetricSize] > grid_spacing) {
      [text_node setLineMetricGap: (Math.ceil([text_node fontMetricSize] / grid_spacing) * grid_spacing)];
    } else {
      [text_node setLineMetricGap: grid_spacing];
    }
  }
};

designCraft.positioning = {
  shiftToXCoord: function(element, target_x_coord) {
    const current_x_coord = [[element boundary] x_coord];
    [[element boundary] deductX: current_x_coord - 1];
    [[element boundary] augmentX: target_x_coord - 1];
  },

  shiftToYCoord: function(element, target_y_coord) {
    const current_y_coord = [[element boundary] y_coord];
    [[element boundary] deductY: current_y_coord - 1];
    [[element boundary] augmentY: target_y_coord - 1];
  },

  alignTopOnBaseline: function(element) {
    const element_y_coord = [[element boundary] y_coord];
    const new_y_factor = designCraft.utility.determineFactor(element_y_coord);
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    console.debug("-------------------------------------");
    console.debug("Grid Spacing: " + grid_spacing);
    console.debug("Y Factor: " + new_y_factor);
    console.debug("Current element Y position: " + element_y_coord);
    console.debug("New Y position: " + grid_spacing * new_y_factor);

    designCraft.positioning.shiftToYCoord(element, grid_spacing * new_y_factor);
  },

  alignBottomOnBaseline: function(element) {
    const element_h = [[element boundary] h_dim];
    const element_y1_coord = [[element boundary] y_coord];
    const element_y2_coord = element_y1_coord + element_h;

    const new_y_factor = designCraft.utility.determineFactor(element_y2_coord);
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    const final_y_coord = (new_y_factor * grid_spacing) - element_h;

    designCraft.positioning.shiftToYCoord(element, final_y_coord);
  },

  alignTopOnNextBaseline: function(element) {
    const element_y_coord = [[element boundary] y_coord];
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();

    // Utilizing a simpler factor calculation, as the goal is always to advance to the next baseline.
    const new_y_factor = Math.floor(element_y_coord / grid_spacing);
    const final_y_coord = (grid_spacing * new_y_factor) + grid_spacing;
    designCraft.positioning.shiftToYCoord(element, final_y_coord);
  },

  alignBottomOnNextBaseline: function(element) {
    const element_h = [[element boundary] h_dim];
    const element_y1_coord = [[element boundary] y_coord];
    const element_y2_coord = element_y1_coord + element_h;
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    
    // Utilizing a simpler factor calculation, as the goal is always to advance to the next baseline.
    const new_y_factor = Math.floor(element_y2_coord / grid_spacing);
    const final_y_coord = ((new_y_factor * grid_spacing) - element_h) + grid_spacing;
    designCraft.positioning.shiftToYCoord(element, final_y_coord);
  },

  alignTopOnPriorBaseline: function(element) {
    const element_y_coord = [[element boundary] y_coord];
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();

    // Utilizing a simpler factor calculation, as the goal is always to retreat to the previous baseline.
    const new_y_factor = Math.ceil(element_y_coord / grid_spacing);
    const final_y_coord = (grid_spacing * new_y_factor) - grid_spacing;
    designCraft.positioning.shiftToYCoord(element, final_y_coord);
  },

  alignBottomOnPriorBaseline: function(element) {
    const element_h = [[element boundary] h_dim];
    const element_y1_coord = [[element boundary] y_coord];
    const element_y2_coord = element_y1_coord + element_h;
    const grid_spacing = designCraft.utility.fetchCanvasGridSpacing();
    
    // Utilizing a simpler factor calculation, as the goal is always to retreat to the previous baseline.
    const new_y_factor = Math.floor(element_y2_coord / grid_spacing);
    const final_y_coord = ((new_y_factor * grid_spacing) - element_h) - grid_spacing;
    designCraft.positioning.shiftToYCoord(element, final_y_coord);
  },

  // Positions the left edge of the given element to the closest column gridline.
  alignLeftEdgeToClosestGridline: function(layout_grid, element) {
    const closest_line_idx = layout_grid.locateNearestStartLineIndex(element);
    designCraft.positioning.shiftToXCoord(element, layout_grid.grid_segments[closest_line_idx].start_pos);
  },

  // Positions the right edge of the given element to the closest column gridline.
  alignRightEdgeToClosestGridline: function(layout_grid, element) {
    const closest_line_idx = layout_grid.locateNearestEndLineIndex(element);
    const element_x2_coord = [[element boundary] x_coord] + [[element boundary] w_dim];

    const coord_offset = layout_grid.grid_segments[closest_line_idx].end_coord - element_x2_coord;

    designCraft.positioning.shiftToXCoord(element, [[element boundary] x_coord] + coord_offset);
  },

  // Positions the left edge of the given element to the subsequent column gridline.
  alignLeftEdgeToNextGridline: function(layout_grid, element) {
    const closest_line_idx = layout_grid.locateNearestStartLineIndex(element);
    const closest_column = layout_grid.grid_segments[closest_line_idx];
    const element_x_coord = [[element boundary] x_coord];

    // To ensure movement to the next column, verify that the closest column isn't
    // the current or a preceding one. If so, target the column after the next.
    if ((closest_column.start_pos < element_x_coord) || (closest_column.start_pos === element_x_coord)) {

      // If at the last column, wrap around to the first for positioning.
      const next_col_idx = (closest_line_idx + 1 > layout_grid.grid_segments.length - 1) ? 0 : closest_line_idx + 1;
      designCraft.positioning.shiftToXCoord(element, layout_grid.grid_segments[next_col_idx].start_pos);
    } else {
      designCraft.positioning.shiftToXCoord(element, closest_column.start_pos);
    }
  },

  // Positions the right edge of the given element to the subsequent column gridline.
  alignRightEdgeToNextGridline: function(layout_grid, element) {
    const closest_line_idx = layout_grid.locateNearestEndLineIndex(element);
    const closest_column = layout_grid.grid_segments[closest_line_idx];
    const element_x2_coord = [[element boundary] x_coord] + [[element boundary] w_dim];

    let coord_offset = closest_column.end_coord - element_x2_coord;

    // To ensure movement to the next column, verify that the closest column isn't
    // the current or a preceding one. If so, target the column after the next.
    if ((closest_column.end_coord < element_x2_coord) || (closest_column.end_coord === element_x2_coord)) {

      // If at the last column, wrap around to the first for positioning.
      const next_col_idx = (closest_line_idx + 1 > layout_grid.grid_segments.length - 1) ? 0 : closest_line_idx + 1;

      coord_offset = layout_grid.grid_segments[next_col_idx].end_coord - element_x2_coord;
      designCraft.positioning.shiftToXCoord(element, [[element boundary] x_coord] + coord_offset);
    } else {
      designCraft.positioning.shiftToXCoord(element, [[element boundary] x_coord] + coord_offset);
    }
  },

  // Positions the left edge of the given element to the preceding column gridline.
  alignLeftEdgeToPriorGridline: function(layout_grid, element) {
    const closest_line_idx = layout_grid.locateNearestStartLineIndex(element);
    const closest_column = layout_grid.grid_segments[closest_line_idx];
    const element_x_coord = [[element boundary] x_coord];

    // To ensure movement to the previous column, verify that the closest column isn't
    // the current or a subsequent one. If so, target the column before the previous.
    if ((closest_column.start_pos > element_x_coord) || (closest_column.start_pos === element_x_coord)) {

      // If at the first column, wrap around to the last for positioning.
      const prior_col_idx = (closest_line_idx - 1 < 0) ? layout_grid.grid_segments.length - 1 : closest_line_idx - 1;
      designCraft.positioning.shiftToXCoord(element, layout_grid.grid_segments[prior_col_idx].start_pos);
    } else {
      designCraft.positioning.shiftToXCoord(element, closest_column.start_pos);
    }
  },

  // Positions the right edge of the given element to the preceding column gridline.
  alignRightEdgeToPriorGridline: function(layout_grid, element) {
    const closest_line_idx = layout_grid.locateNearestEndLineIndex(element);
    const closest_column = layout_grid.grid_segments[closest_line_idx];
    const element_x2_coord = [[element boundary] x_coord] + [[element boundary] w_dim];

    let coord_offset = closest_column.end_coord - element_x2_coord;

    // To ensure movement to the previous column, verify that the closest column isn't
    // the current or a subsequent one. If so, target the column before the previous.
    if ((closest_column.end_coord > element_x2_coord) || (closest_column.end_coord === element_x2_coord)) {

      // If at the first column, wrap around to the last for positioning.
      const prior_col_idx = (closest_line_idx - 1 < 0) ? layout_grid.grid_segments.length - 1 : closest_line_idx - 1;

      coord_offset = layout_grid.grid_segments[prior_col_idx].end_coord - element_x2_coord;
      designCraft.positioning.shiftToXCoord(element, [[element boundary] x_coord] + coord_offset);
    } else {
      designCraft.positioning.shiftToXCoord(element, [[element boundary] x_coord] + coord_offset);
    }
  }
};

// Proportional values sourced from http://modularscale.com/
designCraft.typographic = {
  proportionals: {
    "15:16 – Minor Second Ratio": 1.067,
    "8:9 – Major Second Ratio": 1.125,
    "5:6 – Minor Third Ratio": 1.2,
    "4:5 – Major Third Ratio": 1.25,
    "3:4 – Perfect Fourth Ratio": 1.333,
    "1:√2 – Augmented Fourth / Diminished Fifth Ratio": 1.414,
    "2:3 – Perfect Fifth Ratio": 1.5,
    "5:8 – Minor Sixth Ratio": 1.6,
    "1:1.618 – Golden Section Ratio": 1.618,
    "3:5 – Major Sixth Ratio": 1.667,
    "9:16 – Minor Seventh Ratio": 1.778,
    "8:15 – Major Seventh Ratio": 1.875,
    "1:2 – Octave Ratio": 2,
    "2:5 – Major Tenth Ratio": 2.5,
    "3:8 – Major Eleventh Ratio": 2.667,
    "1:3 – Major Twelfth Ratio": 3,
    "1:4 – Double Octave Ratio": 4,
  },

  renderTypographicScale: function(initial_text_node, rate, increment) {
    // Store all text nodes as the scale is constructed.
    const text_nodes = [initial_text_node];

    for (let idx = 0; idx < increment; idx++) {
      // The preceding text node in the overall sequence.
      const prev_text_node = text_nodes[text_nodes.length - 1];

      // Direct creation of text nodes is not supported by the API,
      // requiring duplication instead.
      const new_text_node = [prev_text_node replicate];

      const prev_font_size_val = [prev_text_node fontMetricSize];
      [new_text_node setFontMetricSize: prev_font_size_val * rate];

      // Position the newly created text node appropriately.
      const prev_text_h = [prev_text_node lineMetricGap];
      const new_text_y_coord = [[prev_text_node boundary] y_coord] + prev_text_h;
      designCraft.positioning.shiftToYCoord(new_text_node, new_text_y_coord);

      text_nodes.push(new_text_node);
    }
  }
};

designCraft.colorUtility = {
  generateColorFromHex: function(hex_code, opacity_val) {
    return [SketchColor colorFromHex: "#" + hex_code alpha: opacity_val];
  },

  // Renders a color swatch on the canvas.
  // Requires a base_element for sizing each color block, and
  // an array of SketchColor objects forming the swatch.
  renderColorPalette: function(base_element, colors_list) {

    const first_color = colors_list[0];
    const palette_elements = [base_element];

    const initial_fill = [[[base_element visuals] fill_styles] firstItem];
    [initial_fill applyColor: first_color];

    for(let idx = 1; idx < colors_list.length; idx++) {
      const prev_element = palette_elements[palette_elements.length - 1];
      const new_color_element = [prev_element replicate];

      const new_color = colors_list[idx];
      [[[[new_color_element visuals] fill_styles] firstItem] applyColor: new_color];

      const current_x_coord = [[new_color_element boundary] x_coord];
      const new_x_position = current_x_coord + [[new_color_element boundary] w_dim];
      designCraft.positioning.shiftToXCoord(new_color_element, new_x_position);

      palette_elements.push(new_color_element);
    }
  },

  // Constructs and returns an array of SketchColor objects for a monochromatic scheme.
  // Adapted from https://github.com/brianpilati/color-palette-creator
  generateMonochromaticPalette: function(main_color, attenuation) {
    const mono_colors = [main_color];

    const lightness_steps = [0.8, 0.4];
    const darkness_steps = [0.6, 0.3];

    const r_val = [main_color red];
    const g_val = [main_color green];
    const b_val = [main_color blue];
    const color_opacity = [main_color alpha];

    for (let idx = 0; idx < lightness_steps.length; idx++){
      mono_colors.push([SketchColor colorFromRGB: (r_val + (1 - r_val) * lightness_steps[idx]) green: (g_val + (1 - g_val) * lightness_steps[idx]) blue: (b_val + (1 - b_val) * lightness_steps[idx]) alpha: color_opacity]);
    }

    for (let idx = 0; idx < darkness_steps.length; idx++){
      mono_colors.push([SketchColor colorFromRGB: (r_val * darkness_steps[idx]) green: (g_val * darkness_steps[idx]) blue: (b_val * darkness_steps[idx]) alpha: color_opacity]);
    }

    return mono_colors;
  }
};

designCraft.netService = {
  performRequest: function(resource_url, http_method) {
    const req_url_obj = [URLObject urlFromString: resource_url];

    const httpRequest = MutableURLRequest.createWithURLCachePolicyTimeout(req_url_obj, ReloadIgnoringLocalCacheData, 60);
    httpRequest.setHttpMethod(http_method);

    const httpResponse = [URLConnection sendSyncRequest:httpRequest getResponse:null errorObj:null];
    let response_payload = [[StringObject allocate] initFromData:httpResponse encoding:UTF8StringEncoder];
    return response_payload;
  }
};

designCraft.colorAPI = {
  // Generates and returns an array of SketchColor objects derived from an API JSON
  // payload containing hexadecimal color codes.
  generatePaletteFromJSON: function(json_data) {

    const parsed_data = JSON.parse(json_data);
    const total_palettes = parsed_data.length;
    const rand_palette_idx = Math.floor(Math.random() * total_palettes);
    const rand_palette = parsed_data[rand_palette_idx];

    const colors_arr = [];
    const palette_color_codes = rand_palette["colors"];

    for(let idx = 0; idx < palette_color_codes.length; idx++) {
      const single_color = designCraft.colorUtility.generateColorFromHex(palette_color_codes[idx], 1.0);
      colors_arr.push(single_color);
    }

    return colors_arr;
  }
};

// A namespace for grid-related functionalities, including "class" definitions.
designCraft.layoutGrid = {
  // Defines a Sketch grid configured via 'View > Grid Settings', distinct from ruler guides.
  // The Sketch document's grid object should be supplied to its constructor.
  ColumnarLayout: function() {
    this.layoutDescriptor = [[[documentObj activePage] currentWorksheet] layoutSettings];
    this.channel_width = this.layoutDescriptor.getChannelWidth();
    this.total_channels = this.layoutDescriptor.countTotalChannels();
    this.segment_width = this.layoutDescriptor.getSegmentWidth();
    this.total_segments = this.layoutDescriptor.countSegments();
    this.total_layout_width = (this.total_channels * this.channel_width) + (this.total_segments * this.segment_width);
    this.channelsAreExternal = this.layoutDescriptor.areChannelsExternal() === 1 ? true : false;
    this.grid_segments = this.transformSketchGridToSegments();
  },

  LayoutSegment: function (start_pos_x, end_pos_x) {
    this.start_pos = start_pos_x;
    this.end_pos = end_pos_x;
  }
};

// Provides a textual summary of the ColumnarLayout for diagnostic purposes.
designCraft.layoutGrid.ColumnarLayout.prototype.toDescriptionString = function() {
  let descriptor_str = "Segment: " + this.segment_width + " || Channel: " + this.channel_width + " ";
  for(let idx = 0; idx < this.grid_segments.length; idx++) {
    descriptor_str += this.grid_segments[idx];
  }

  return descriptor_str += "Channels External?: " + this.channelsAreExternal;
};

// Generates LayoutSegment objects that collectively define the horizontal
// grid as configured in View > Grid Settings > Layout.
// Returns an array containing all generated LayoutSegments.
designCraft.layoutGrid.ColumnarLayout.prototype.transformSketchGridToSegments = function() {
  if (this.channelsAreExternal) {
    const first_segment = new designCraft.layoutGrid.LayoutSegment((this.channel_width / 2), (this.channel_width / 2) + this.segment_width);