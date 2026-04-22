let   demander = require('./process_flow.js');
let   DrawingSurface = require('canvas');

// Function to process input arguments and convert them to a named object structure
function extract_config_args( input_configs, key_labels ) {
  if (input_configs.length > 1) {
    let reformatted_configs = {};
    for (let idx_val = 0; idx_val < key_labels.length; idx_val = idx_val + 1)
      reformatted_configs[key_labels[idx_val]] = input_configs[idx_val];
    return reformatted_configs;
  } else if (input_configs.length === 1) {
    return input_configs[0];
  } else {
    return {};
  }
}

// Main image processing toolkit object
let image_toolkit = module.exports = exports = {

  // Converts a given image surface to a grayscale representation
  convert_to_luminance : function ( source_surface ) {
    let graphics_context = source_surface.getContext("2d");
    let pixel_data_obj = graphics_context.getImageData(0, 0, source_surface.width, source_surface.height);
    let raw_pixel_buffer = pixel_data_obj.data;
    
    let output_surface = new DrawingSurface(source_surface.width, source_surface.height);
    let result_context = output_surface.getContext("2d");
    let result_pixel_data = result_context.getImageData(0, 0, source_surface.width, source_surface.height);
    let processed_pixel_buffer = result_pixel_data.data;
    
    let current_index_a, current_index_b, pixel_count_loop = source_surface.width * source_surface.height * 4;
    
    while (pixel_count_loop > 0.0)
    {
      processed_pixel_buffer[pixel_count_loop - 1] = 255.0; // Set alpha channel to fully opaque
      // Calculate grayscale value based on standard luminance formula
      processed_pixel_buffer[pixel_count_loop -= 4] = processed_pixel_buffer[current_index_a = pixel_count_loop + 1] = processed_pixel_buffer[current_index_b = pixel_count_loop + 2] = (raw_pixel_buffer[pixel_count_loop] * 0.3 + raw_pixel_buffer[current_index_a] * 0.59 + raw_pixel_buffer[current_index_b] * 0.11);
    }
    result_context.putImageData(result_pixel_data, 0, 0);
    return output_surface;
  },

  // Groups elements in a sequence based on a custom predicate function
  cluster_elements : function ( input_sequence, grouping_predicate ) {
    let outer_idx, inner_idx;
    let union_find_nodes = new Array(input_sequence.length);
    for (outer_idx = 0; outer_idx < input_sequence.length; outer_idx++)
      union_find_nodes[outer_idx] = {"parent" : -1,
                                 "element" : input_sequence[outer_idx],
                                 "rank" : 0};
    for (outer_idx = 0; outer_idx < input_sequence.length; outer_idx++) {
      if (!union_find_nodes[outer_idx].element)
        continue;
      let current_root = outer_idx;
      while (union_find_nodes[current_root].parent !== -1)
        current_root = union_find_nodes[current_root].parent;
      for (inner_idx = 0; inner_idx < input_sequence.length; inner_idx++) {
        if( outer_idx !== inner_idx && union_find_nodes[inner_idx].element && grouping_predicate(union_find_nodes[outer_idx].element, union_find_nodes[inner_idx].element)) {
          let other_root = inner_idx;

          while (union_find_nodes[other_root].parent !== -1)
            other_root = union_find_nodes[other_root].parent;

          if(other_root !== current_root) {
            if(union_find_nodes[current_root].rank > union_find_nodes[other_root].rank)
              union_find_nodes[other_root].parent = current_root;
            else {
              union_find_nodes[current_root].parent = other_root;
              if (union_find_nodes[current_root].rank === union_find_nodes[other_root].rank)
                union_find_nodes[other_root].rank++;
              current_root = other_root;
            }

            // Path compression for the first node's branch
            let temp_node_ref, path_compress_node = inner_idx;
            while (union_find_nodes[path_compress_node].parent !== -1) {
              temp_node_ref = path_compress_node;
              path_compress_node = union_find_nodes[path_compress_node].parent;
              union_find_nodes[temp_node_ref].parent = current_root;
            }

            // Path compression for the second node's branch
            path_compress_node = outer_idx;
            while (union_find_nodes[path_compress_node].parent !== -1) {
              temp_node_ref = path_compress_node;
              path_compress_node = union_find_nodes[path_compress_node].parent;
              union_find_nodes[temp_node_ref].parent = current_root;
            }
          }
        }
      }
    }
    let group_indices = new Array(input_sequence.length);
    let category_counter = 0;
    for(outer_idx = 0; outer_idx < input_sequence.length; outer_idx++) {
      inner_idx = -1;
      let traverse_node = outer_idx;
      if(union_find_nodes[traverse_node].element) {
        while (union_find_nodes[traverse_node].parent !== -1)
          traverse_node = union_find_nodes[traverse_node].parent;
        if(union_find_nodes[traverse_node].rank >= 0)
          union_find_nodes[traverse_node].rank = ~category_counter++;
        inner_idx = ~union_find_nodes[traverse_node].rank;
      }
      group_indices[outer_idx] = inner_idx;
    }
    return {"index" : group_indices, "cat" : category_counter};
  },

  // Detects specific visual features within an image plane
  locate_visual_features : function ( source_image_plane, scaling_interval, minimum_proximity ) {
      let detection_parameters = extract_config_args(arguments, ["canvas", "interval", "min_neighbors"]);
      detection_parameters.canvas = image_toolkit.convert_to_luminance(detection_parameters.canvas);
      detection_parameters.cascade = demander;
      detection_parameters.scale = Math.pow(2, 1 / (detection_parameters.interval + 1));
      detection_parameters.next = detection_parameters.interval + 1;
      detection_parameters.scale_upto = Math.floor(Math.log(Math.min(detection_parameters.canvas.width / detection_parameters.cascade.width, detection_parameters.canvas.height / detection_parameters.cascade.height)) / Math.log(detection_parameters.scale));
      let loop_index;
      for (loop_index = 0; loop_index < detection_parameters.cascade.stage_classifier.length; loop_index++)
      {
        detection_parameters.cascade.stage_classifier[loop_index].orig_feature = detection_parameters.cascade.stage_classifier[loop_index].feature;
      }
      
    // Preprocessing step: generate image pyramid
    function prepare_image_pyramid() {
      
      let base_image_surface = detection_parameters.canvas;
      let step_interval = detection_parameters.interval;
      let magnification_ratio = detection_parameters.scale;
      let subsequent_level = detection_parameters.next;
      let maximum_level = detection_parameters.scale_upto;
      let image_pyramid = new Array((maximum_level + subsequent_level * 2) * 4);
      let pyramid_data_array = new Array((maximum_level + subsequent_level * 2) * 4);
      image_pyramid[0] = base_image_surface;
      pyramid_data_array[0] = { "surface_width" : image_pyramid[0].width,
                             "surface_height" : image_pyramid[0].height,
                             "pixel_buffer" : image_pyramid[0].getContext("2d").getImageData(0, 0, image_pyramid[0].width, image_pyramid[0].height).data };
      let level_iterator;
      for (level_iterator = 1; level_iterator <= step_interval; level_iterator++) {
        image_pyramid[level_iterator * 4] = new DrawingSurface(
          Math.floor(image_pyramid[0].width / Math.pow(magnification_ratio, level_iterator)),
          Math.floor(image_pyramid[0].height / Math.pow(magnification_ratio, level_iterator))
          );
        image_pyramid[level_iterator * 4].getContext("2d").drawImage(image_pyramid[0], 0, 0, image_pyramid[0].width, image_pyramid[0].height, 0, 0, image_pyramid[level_iterator * 4].width, image_pyramid[level_iterator * 4].height);
        pyramid_data_array[level_iterator * 4] = { "surface_width" : image_pyramid[level_iterator * 4].width,
                                 "surface_height" : image_pyramid[level_iterator * 4].height,
                                 "pixel_buffer" : image_pyramid[level_iterator * 4].getContext("2d").getImageData(0, 0, image_pyramid[level_iterator * 4].width, image_pyramid[level_iterator * 4].height).data };
      }
      for (level_iterator = subsequent_level; level_iterator < maximum_level + subsequent_level * 2; level_iterator++) {
        image_pyramid[level_iterator * 4] = new DrawingSurface(
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].width / 2),
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].height / 2)
          );
        image_pyramid[level_iterator * 4].getContext("2d").drawImage(image_pyramid[level_iterator * 4 - subsequent_level * 4], 0, 0, image_pyramid[level_iterator * 4 - subsequent_level * 4].width, image_pyramid[level_iterator * 4 - subsequent_level * 4].height, 0, 0, image_pyramid[level_iterator * 4].width, image_pyramid[level_iterator * 4].height);
        pyramid_data_array[level_iterator * 4] = { "surface_width" : image_pyramid[level_iterator * 4].width,
                                 "surface_height" : image_pyramid[level_iterator * 4].height,
                                 "pixel_buffer" : image_pyramid[level_iterator * 4].getContext("2d").getImageData(0, 0, image_pyramid[level_iterator * 4].width, image_pyramid[level_iterator * 4].height).data };
      }
      for (level_iterator = subsequent_level * 2; level_iterator < maximum_level + subsequent_level * 2; level_iterator++) {
        image_pyramid[level_iterator * 4 + 1] = new DrawingSurface(
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].width / 2),
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].height / 2)
          );
        image_pyramid[level_iterator * 4 + 1].getContext("2d").drawImage(image_pyramid[level_iterator * 4 - subsequent_level * 4], 1, 0, image_pyramid[level_iterator * 4 - subsequent_level * 4].width - 1, image_pyramid[level_iterator * 4 - subsequent_level * 4].height, 0, 0, image_pyramid[level_iterator * 4 + 1].width - 2, image_pyramid[level_iterator * 4 + 1].height);
        pyramid_data_array[level_iterator * 4 + 1] = { "surface_width" : image_pyramid[level_iterator * 4 + 1].width,
                                   "surface_height" : image_pyramid[level_iterator * 4 + 1].height,
                                   "pixel_buffer" : image_pyramid[level_iterator * 4 + 1].getContext("2d").getImageData(0, 0, image_pyramid[level_iterator * 4 + 1].width, image_pyramid[level_iterator * 4 + 1].height).data };
        
        image_pyramid[level_iterator * 4 + 2] = new DrawingSurface(
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].width / 2),
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].height / 2)
          );
        image_pyramid[level_iterator * 4 + 2].getContext("2d").drawImage(image_pyramid[level_iterator * 4 - subsequent_level * 4], 0, 1, image_pyramid[level_iterator * 4 - subsequent_level * 4].width, image_pyramid[level_iterator * 4 - subsequent_level * 4].height - 1, 0, 0, image_pyramid[level_iterator * 4 + 2].width, image_pyramid[level_iterator * 4 + 2].height - 2);
        pyramid_data_array[level_iterator * 4 + 2] = { "surface_width" : image_pyramid[level_iterator * 4 + 2].width,
                                   "surface_height" : image_pyramid[level_iterator * 4 + 2].height,
                                   "pixel_buffer" : image_pyramid[level_iterator * 4 + 2].getContext("2d").getImageData(0, 0, image_pyramid[level_iterator * 4 + 2].width, image_pyramid[level_iterator * 4 + 2].height).data };
        image_pyramid[level_iterator * 4 + 3] = new DrawingSurface(
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].width / 2),
          Math.floor(image_pyramid[level_iterator * 4 - subsequent_level * 4].height / 2)
          );
        image_pyramid[level_iterator * 4 + 3].getContext("2d").drawImage(image_pyramid[level_iterator * 4 - subsequent_level * 4], 1, 1, image_pyramid[level_iterator * 4 - subsequent_level * 4].width - 1, image_pyramid[level_iterator * 4 - subsequent_level * 4].height - 1, 0, 0, image_pyramid[level_iterator * 4 + 3].width - 2, image_pyramid[level_iterator * 4 + 3].height - 2);
        pyramid_data_array[level_iterator * 4 + 3] = { "surface_width" : image_pyramid[level_iterator * 4 + 3].width,
                                   "surface_height" : image_pyramid[level_iterator * 4 + 3].height,
                                   "pixel_buffer" : image_pyramid[level_iterator * 4 + 3].getContext("2d").getImageData(0, 0, image_pyramid[level_iterator * 4 + 3].width, image_pyramid[level_iterator * 4 + 3].height).data };
      }
      return pyramid_data_array;
    };

    // Core processing step: apply cascade classifier to the image pyramid
    function process_feature_detection( image_pyramid_data, process_id ) {
      let classification_pipeline = detection_parameters.cascade;
      let level_separation = detection_parameters.interval;
      let zoom_factor = detection_parameters.scale;
      let future_step = detection_parameters.next;
      let upper_bound_scale = detection_parameters.scale_upto;
      let idx_a, idx_b, idx_c, coord_x, coord_y, quad_idx;
      let current_scale_h = 1.0, current_scale_v = 1.0;
      let offset_x_coords = [0, 1, 0, 1];
      let offset_y_coords = [0, 0, 1, 1];
      let detected_objects_list = [];
      for (idx_a = 0; idx_a < upper_bound_scale; idx_a++) {
        let window_width = image_pyramid_data[idx_a * 4 + future_step * 8].surface_width - Math.floor(classification_pipeline.width / 4);
        let window_height = image_pyramid_data[idx_a * 4 + future_step * 8].surface_height - Math.floor(classification_pipeline.height / 4);
        let pixel_steps = [image_pyramid_data[idx_a * 4].surface_width * 4, image_pyramid_data[idx_a * 4 + future_step * 4].surface_width * 4, image_pyramid_data[idx_a * 4 + future_step * 8].surface_width * 4];
        
        let horizontal_paddings = [image_pyramid_data[idx_a * 4].surface_width * 16 - window_width * 16,
                                   image_pyramid_data[idx_a * 4 + future_step * 4].surface_width * 8 - window_width * 8,
                                   image_pyramid_data[idx_a * 4 + future_step * 8].surface_width * 4 - window_width * 4];
        for (idx_b = 0; idx_b < classification_pipeline.stage_classifier.length; idx_b++) {

          let initial_feature_def = classification_pipeline.stage_classifier[idx_b].orig_feature;
          let current_feature_set = classification_pipeline.stage_classifier[idx_b].feature = new Array(classification_pipeline.stage_classifier[idx_b].count);
          for (idx_c = 0; idx_c < classification_pipeline.stage_classifier[idx_b].count; idx_c++) {

            current_feature_set[idx_c] = {"element_size" : initial_feature_def[idx_c].size,
                                    "positive_x_coords" : new Array(initial_feature_def[idx_c].size),
                                    "positive_z_indices" : new Array(initial_feature_def[idx_c].size),
                                    "negative_x_coords" : new Array(initial_feature_def[idx_c].size),
                                    "negative_z_indices" : new Array(initial_feature_def[idx_c].size)};
            for (quad_idx = 0; quad_idx < initial_feature_def[idx_c].size; quad_idx++) {
              current_feature_set[idx_c].positive_x_coords[quad_idx] = initial_feature_def[idx_c].px[quad_idx] * 4 + initial_feature_def[idx_c].py[quad_idx] * pixel_steps[initial_feature_def[idx_c].pz[quad_idx]];
              current_feature_set[idx_c].positive_z_indices[quad_idx] = initial_feature_def[idx_c].pz[quad_idx];
              current_feature_set[idx_c].negative_x_coords[quad_idx] = initial_feature_def[idx_c].nx[quad_idx] * 4 + initial_feature_def[idx_c].ny[quad_idx] * pixel_steps[initial_feature_def[idx_c].nz[quad_idx]];
              current_feature_set[idx_c].negative_z_indices[quad_idx] = initial_feature_def[idx_c].nz[quad_idx];
            }
          }
        }
        for (quad_idx = 0; quad_idx < 4; quad_idx++) {
          let pixel_buffers_quad = [image_pyramid_data[idx_a * 4].pixel_buffer, image_pyramid_data[idx_a * 4 + future_step * 4].pixel_buffer, image_pyramid_data[idx_a * 4 + future_step * 8 + quad_idx].pixel_buffer];
          let pixel_offsets_quad = [offset_x_coords[quad_idx] * 8 + offset_y_coords[quad_idx] * image_pyramid_data[idx_a * 4].surface_width * 8, offset_x_coords[quad_idx] * 4 + offset_y_coords[quad_idx] * image_pyramid_data[idx_a * 4 + future_step * 4].surface_width * 4, 0];
          for (coord_y = 0; coord_y < window_height; coord_y++) {
            for (coord_x = 0; coord_x < window_width; coord_x++) {
              let current_sum_score = 0;
              let detection_successful = true;
              for (idx_b = 0; idx_b < classification_pipeline.stage_classifier.length; idx_b++) {
                current_sum_score = 0;
                let weight_values = classification_pipeline.stage_classifier[idx_b].alpha;
                let feature_reference = classification_pipeline.stage_classifier[idx_b].feature;
                for (idx_c = 0; idx_c < classification_pipeline.stage_classifier[idx_b].count; idx_c++) {
                  let single_feature_data = feature_reference[idx_c];
                  let positive_val, min_positive_val = pixel_buffers_quad[single_feature_data.positive_z_indices[0]][pixel_offsets_quad[single_feature_data.positive_z_indices[0]] + single_feature_data.positive_x_coords[0]];
                  let negative_val, max_negative_val = pixel_buffers_quad[single_feature_data.negative_z_indices[0]][pixel_offsets_quad[single_feature_data.negative_z_indices[0]] + single_feature_data.negative_x_coords[0]];
                  if (min_positive_val <= max_negative_val) {
                    current_sum_score += weight_values[idx_c * 2];
                  } else {
                    let feature_iter, path_shortcut_taken = true;
                    for (feature_iter = 0; feature_iter < single_feature_data.element_size; feature_iter++) {
                      if (single_feature_data.positive_z_indices[feature_iter] >= 0) {
                        positive_val = pixel_buffers_quad[single_feature_data.positive_z_indices[feature_iter]][pixel_offsets_quad[single_feature_data.positive_z_indices[feature_iter]] + single_feature_data.positive_x_coords[feature_iter]];
                        if (positive_val < min_positive_val) {
                          if (positive_val <= max_negative_val) {
                            path_shortcut_taken = false;
                            break;
                          }
                          min_positive_val = positive_val;
                        }
                      }
                      if (single_feature_data.negative_z_indices[feature_iter] >= 0) {
                        negative_val = pixel_buffers_quad[single_feature_data.negative_z_indices[feature_iter]][pixel_offsets_quad[single_feature_data.negative_z_indices[feature_iter]] + single_feature_data.negative_x_coords[feature_iter]];
                        if (negative_val > max_negative_val) {
                          if (min_positive_val <= negative_val) {
                            path_shortcut_taken = false;
                            break;
                          }
                          max_negative_val = negative_val;
                        }
                      }
                    }
                    current_sum_score += (path_shortcut_taken) ? weight_values[idx_c * 2 + 1] : weight_values[idx_c * 2];
                  }
                }
                if (current_sum_score < classification_pipeline.stage_classifier[idx_b].threshold) {
                  detection_successful = false;
                  break;
                }
              }
              if (detection_successful) {
                detected_objects_list.push({"x" : (coord_x * 4 + offset_x_coords[quad_idx] * 2) * current_scale_h,
                                      "y" : (coord_y * 4 + offset_y_coords[quad_idx] * 2) * current_scale_v,
                                      "width" : classification_pipeline.width * current_scale_h,
                                      "height" : classification_pipeline.height * current_scale_v,
                                      "neighbor" : 1,
                                      "confidence" : current_sum_score});
              }
              pixel_offsets_quad[0] += 16;
              pixel_offsets_quad[1] += 8;
              pixel_offsets_quad[2] += 4;
            }
            pixel_offsets_quad[0] += horizontal_paddings[0];
            pixel_offsets_quad[1] += horizontal_paddings[1];
            pixel_offsets_quad[2] += horizontal_paddings[2];
          }
        }
        current_scale_h *= zoom_factor;
        current_scale_v *= zoom_factor;
      }
      return detected_objects_list;
    };

    // Post-processing step: group and filter detected objects
    function finalize_detections( raw_detections ) {
      let neighbor_threshold = detection_parameters.min_neighbors;
      let classifier_chain = detection_parameters.cascade;
      let scale_interval = detection_parameters.interval;
      let magnification_factor = detection_parameters.scale;
      let next_stage_level = detection_parameters.next;
      let max_scaling_level = detection_parameters.scale_upto;
      let outer_loop_idx, inner_loop_idx;
      for (outer_loop_idx = 0; outer_loop_idx < classifier_chain.stage_classifier.length; outer_loop_idx++)
        classifier_chain.stage_classifier[outer_loop_idx].feature = classifier_chain.stage_classifier[outer_loop_idx].orig_feature;
      raw_detections = raw_detections[0];
      if (!(neighbor_threshold > 0.0))
        return raw_detections;
      else {
        let grouped_results = image_toolkit.cluster_elements(raw_detections, function (region_one, region_two) {
          let proximity_distance = Math.floor(region_one.width * 0.25 + 0.5);

          return region_two.x <= region_one.x + proximity_distance &&
                 region_two.x >= region_one.x - proximity_distance &&
                 region_two.y <= region_one.y + proximity_distance &&
                 region_two.y >= region_one.y - proximity_distance &&
                 region_two.width <= Math.floor(region_one.width * 1.5 + 0.5) &&
                 Math.floor(region_two.width * 1.5 + 0.5) >= region_one.width;
        });
        let num_components = grouped_results.cat;
        let index_sequence = grouped_results.index;
        let component_data = new Array(num_components + 1);
        for (outer_loop_idx = 0; outer_loop_idx < component_data.length; outer_loop_idx++)
          component_data[outer_loop_idx] = {"neighbors" : 0,
                                        "x" : 0,
                                        "y" : 0,
                                        "width" : 0,
                                        "height" : 0,
                                        "confidence" : 0};

        // Count number of neighbors for each component
        for(outer_loop_idx = 0; outer_loop_idx < raw_detections.length; outer_loop_idx++)
        {
          let region_one = raw_detections[outer_loop_idx];
          let component_index = index_sequence[outer_loop_idx];

          if (component_data[component_index].neighbors === 0)
            component_data[component_index].confidence = region_one.confidence;

          ++component_data[component_index].neighbors;

          component_data[component_index].x += region_one.x;
          component_data[component_index].y += region_one.y;
          component_data[component_index].width += region_one.width;
          component_data[component_index].height += region_one.height;
          component_data[component_index].confidence = Math.max(component_data[component_index].confidence, region_one.confidence);
        }

        let filtered_detections = [];
        // Calculate average bounding box for valid components
        for(outer_loop_idx = 0; outer_loop_idx < num_components; outer_loop_idx++)
        {
          let neighbor_count = component_data[outer_loop_idx].neighbors;
          if (neighbor_count >= neighbor_threshold)
            filtered_detections.push({"x" : (component_data[outer_loop_idx].x * 2 + neighbor_count) / (2 * neighbor_count),
                                   "y" : (component_data[outer_loop_idx].y * 2 + neighbor_count) / (2 * neighbor_count),
                                   "width" : (component_data[outer_loop_idx].width * 2 + neighbor_count) / (2 * neighbor_count),
                                   "height" : (component_data[outer_loop_idx].height * 2 + neighbor_count) / (2 * neighbor_count),
                                   "neighbors" : component_data[outer_loop_idx].neighbors,
                                   "confidence" : component_data[outer_loop_idx].confidence});
        }

        let final_output_list = [];
        // Filter out smaller detections contained within larger, more confident ones
        for(outer_loop_idx = 0; outer_loop_idx < filtered_detections.length; outer_loop_idx++)
        {
          let region_one = filtered_detections[outer_loop_idx];
          let valid_detection_flag = true;
          for(inner_loop_idx = 0; inner_loop_idx < filtered_detections.length; inner_loop_idx++)
          {
            let region_two = filtered_detections[inner_loop_idx];
            let proximity_distance = Math.floor(region_two.width * 0.25 + 0.5);

            if(outer_loop_idx !== inner_loop_idx &&
               region_one.x >= region_two.x - proximity_distance &&
               region_one.y >= region_two.y - proximity_distance &&
               region_one.x + region_one.width <= region_two.x + region_two.width + proximity_distance &&
               region_one.y + region_one.height <= region_two.y + region_two.height + proximity_distance &&
               (region_two.neighbors > Math.max(3, region_one.neighbors) || region_one.neighbors < 3))
            {
              valid_detection_flag = false;
              break;
            }
          }

          if(valid_detection_flag)
            final_output_list.push(region_one);
        }
        return final_output_list;
      }
    };
    
    return finalize_detections([
      process_feature_detection(
        prepare_image_pyramid(1),0,0)
    ]);
  }
}