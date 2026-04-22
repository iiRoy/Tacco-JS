/*global jQuery */
/*!
 * MotionEngine.js 1.0.0
 *
 * Copyright 2023, Your Name Here
 * your.email@example.com
 * Released under the MIT license
 * https://opensource.org/licenses/MIT
 *
 */

(function ( globalScope ) {


    globalScope.MotionEngine = function ( settings ) {

        let engine_logger_enabled = false;
        if ( settings ) {
            engine_logger_enabled = settings.hasOwnProperty('debug') ? settings.debug : false;
        }

        const universal_vars = [];
        const action_sequences = {};
        const sequence_finish_handlers = {};

        const ME = this;

        const setting_keys = [ "duration", "easing", "delay", "complete", "loop" ];


        /**
         * Creates a random numerical value within a specified range.
         * @param {number} lowerBound The minimum possible value (inclusive).
         * @param {number} upperBound The maximum possible value (inclusive).
         * @returns {number} A random number between lowerBound and upperBound.
         */
        const produce_random_value = function ( lowerBound, upperBound ) {
            let minVal = lowerBound * 1;
            let maxVal = upperBound * 1;

            if ( maxVal <= minVal ) {
                ME.write_log("warn", "For @random_value, ensure the first parameter is smaller. Values swapped for safety.");
                const tempMax = minVal;
                minVal = maxVal;
                maxVal = tempMax;
            }

            const difference = maxVal - minVal;
            return minVal + difference * Math.random();
        };

        /**
         * Retrieves an action sequence object by its identifier.
         * @param {string} sequence_label The name of the action sequence.
         * @returns {object} The action sequence object.
         */
        const retrieve_sequence_by_name = function ( sequence_label ) {
            return action_sequences[ sequence_label ];
        };

        /**
         * Extracts the mathematical prefix from a string (e.g., '+=', '-=', '-').
         * @param {string} input_string The string to analyze.
         * @returns {string} The identified prefix or an empty string.
         */
        const extract_operation_prefix = function ( input_string ) {
            if ( input_string.indexOf('+=') === 0 ) {
                return "+=";
            }
            else if ( input_string.indexOf('-=') === 0 ) {
                return '-=';
            }
            else if ( input_string.indexOf('-') === 0 ) {
                return '-';
            }
            else {
                return "";
            }
        };

        /**
         * Determines the unit of measurement from a string (e.g., 'px', '%').
         * @param {string} input_string The string containing the value.
         * @returns {string} The unit or an empty string if none found.
         */
        const determine_measurement_units = function ( input_string ) {
            if ( input_string.indexOf(')px', input_string.length - 3) !== -1 ) {
                return 'px';
            }
            else if ( input_string.indexOf('%', input_string.length - 1) !== -1 ) {
                return '%';
            }
            else {
                return '';
            }
        };

        /**
         * Parses a property string to get the actual attribute name.
         * @param {string} input_string The property string (e.g., "@params.alpha").
         * @returns {string} The extracted attribute name.
         */
        const parse_nested_attribute = function ( input_string ) {
            const raw_name = input_string.split('.')[1].split(')')[0];
            if ( raw_name.indexOf('%') !== -1 ) {
                return raw_name.substring(0, raw_name.length - 1);
            }
            else {
                return raw_name;
            }
        };

        /**
         * Initiates an action sequence by its name.
         * Supports various parameter formats for event data, settings, and completion handlers.
         * @param {string} sequence_label The name of the sequence to trigger.
         * @param {*} [trigger_event_data] Optional event object.
         * @param {object} [user_settings] Optional settings for this trigger.
         * @param {Function} [completion_handler] Optional function to call upon sequence completion.
         * @returns {OperationHandle} An object to control the running process.
         */
        this.initiate_sequence = function ( sequence_label, trigger_event_data, user_settings, completion_handler ) {

            let parameters_are_valid = true;
            let active_process_handle;

            let user_event_data, user_settings_obj, user_completion_handler_fn;

            if ( arguments.length === 0 ) {
                ME.write_log("error", "An action sequence label (string) must always be the first argument for MotionEngine.initiate_sequence.");
                active_process_handle = new OperationHandle(null);
                parameters_are_valid = false;
            }
            else {
                if ( typeof arguments[0] !== "string" ) {
                    ME.write_log("error", "The first argument for initiate_sequence must be a string representing the sequence name. Received: "
                        + typeof arguments[0] + ".");
                    active_process_handle = new OperationHandle(null);
                    parameters_are_valid = false;
                }
                else if ( arguments.length > 1 ) {

                    if ( typeof arguments[1] === "object" && arguments[1] !== null ) {
                        if ( arguments[1].target ) {
                            user_event_data = arguments[1];
                            if ( arguments.length > 2 ) {
                                if ( typeof arguments[2] === "object" && arguments[2] !== null ) {
                                    user_settings_obj = arguments[2];
                                    if ( arguments.length > 3 ) {
                                        if ( typeof arguments[3] === "function" ) {
                                            user_completion_handler_fn = arguments[3];
                                        }
                                        else {
                                            ME.write_log("error", "Invalid type for the 4th parameter of initiate_sequence for sequence " + sequence_label + ". Expected Function, got " + typeof arguments[3] + ".");
                                            parameters_are_valid = false;
                                        }
                                    }
                                }
                                else if ( typeof arguments[2] === "function" ) {
                                    user_completion_handler_fn = arguments[2];
                                }
                                else {
                                    ME.write_log("error", "Invalid type for the 3rd parameter of initiate_sequence for sequence " + sequence_label + ". Expected Object or Function, got " + typeof arguments[2] + ".");
                                    parameters_are_valid = false;
                                }
                            }
                        }
                        else {
                            user_settings_obj = arguments[1];
                            if ( arguments.length > 2 ) {
                                if ( typeof arguments[2] !== "function" ) {
                                    ME.write_log("error", "Invalid type for the 3rd parameter of initiate_sequence for sequence " + sequence_label + ". Expected Function, got " + typeof arguments[2] + ".");
                                    parameters_are_valid = false;
                                }
                                else {
                                    user_completion_handler_fn = arguments[2];
                                }
                            }
                        }
                    }
                    else if ( typeof arguments[1] === "function" ) {
                        user_completion_handler_fn = arguments[1];
                    }
                    else {
                        ME.write_log("error", "Invalid type for the 2nd parameter of initiate_sequence for sequence " + sequence_label + ". Expected Object or Function, got " + typeof arguments[1] + ".");
                        parameters_are_valid = false;
                    }
                }
            }

            if ( !user_settings_obj ) {
                user_settings_obj = {};
            }
            if ( !user_completion_handler_fn ) {
                user_completion_handler_fn = function () { };
            }

            if ( parameters_are_valid ) {
                if ( action_sequences.hasOwnProperty(sequence_label) ) {
                    // console.log('Action sequence found and initiating.');
                    active_process_handle = new OperationHandle(action_sequences[sequence_label]);
                    action_sequences[sequence_label].start_execution(user_event_data, user_settings_obj, user_completion_handler_fn);
                }
                else {
                    active_process_handle = new OperationHandle(null);
                    ME.write_log("error", "The action sequence '" + sequence_label + "' is undefined in configuration. It will be skipped.");
                }
            }

            return active_process_handle;
        };

        /**
         * Processes the configuration tree to define global variables and action sequences.
         * @param {object} root_element The root node of the configuration object.
         * @param {Function} completion_handler Callback once compilation is done.
         */
        const process_configuration = function ( root_element, completion_handler ) {
            const handler_pattern = new RegExp(/^[a-zA-Z0-9\.\-\_]+\:callback$/);
            const global_var_pattern = new RegExp(/^@[a-zA-Z0-9\.\-\_]*?/);

            for ( const attrib_key in root_element.attributes ) {
                if ( root_element.attributes.hasOwnProperty(attrib_key) ) {
                    // Stage 0: Identify and store global variables
                    if ( attrib_key === "@index" || attrib_key === "@params" || attrib_key === "@domel" ) {
                        ME.write_log("warn", "Keywords like @index, @params, and @domel are reserved by MotionEngine and cannot be used as global variable names. " +
                            "The global declaration for '" + attrib_key + "' will be ignored!");
                    }
                    else if ( global_var_pattern.exec(attrib_key) ) {
                        universal_vars[attrib_key] = root_element.attributes[attrib_key];
                    }
                    else {
                        ME.write_log("warn", "The attribute '" + attrib_key + "' intended as a global variable should start with '@'. It will be ignored!");
                    }
                }
            }

            for ( const attrib_key in root_element.children ) {
                if ( handler_pattern.exec(attrib_key) ) {
                    const selection_parts = attrib_key.split(":");
                    sequence_finish_handlers[selection_parts[0]] = root_element.children[attrib_key].attributes.eventName;
                }

                // Stage 1.a: Deconstruct the selector and event string
                const selection_parts = attrib_key.split(":");

                // Stage 1.b: Validate the structure of the selection string
                if ( selection_parts.length < 2 ) {
                    ME.write_log("error", "The MotionEngine selection and event string '" + attrib_key + "' is invalid. " +
                        "It must contain at least a selection string and an event name separated by a ':' character.");
                }
                else {
                    const sequence_id = selection_parts[selection_parts.length - 1];
                    let current_sequence;

                    if ( !action_sequences.hasOwnProperty(sequence_id) ) {
                        let sequence_iterations = 1;
                        if ( root_element.children[attrib_key].attributes.hasOwnProperty('loop') ) {
                            sequence_iterations = root_element.children[attrib_key].attributes['loop'];
                        }
                        current_sequence = new ActionSequence(sequence_iterations, sequence_id);
                        current_sequence.add_segment(selection_parts, root_element.children[attrib_key]);
                        action_sequences[sequence_id] = current_sequence;
                    }
                    else {
                        current_sequence = action_sequences[sequence_id]; // Re-use existing sequence object
                        current_sequence.add_segment(selection_parts, root_element.children[attrib_key]);
                    }
                }
            }

            completion_handler();
        };


        /**
         * Represents a running animation process, allowing it to be stopped.
         * @param {ActionSequence|null} associated_sequence The sequence tied to this process, or null if invalid.
         */
        const OperationHandle = function ( associated_sequence ) {
            /**
             * Halts the currently running action sequence.
             */
            this.stop_process = function () {
                if ( associated_sequence ) {
                    associated_sequence.halt_execution();
                }
                else {
                    ME.write_log("error", "Attempted to stop a process that was not valid or initiated.");
                }
            };
        };

        /**
         * Defines an individual segment of an animation sequence.
         * This object handles element selection, attribute parsing, and animation execution.
         * @param {Array<string>} target_selector An array representing the selection string parts.
         * @param {object} segment_node The configuration node for this segment.
         * @param {ActionSequence} AssociatedSequence The parent ActionSequence object.
         * @param {object} [inherited_properties] Properties inherited from a parent segment.
         * @param {string} [search_identifier] A string to further refine element selection (e.g., 'find').
         */
        const AnimationSegment = function ( target_selector, segment_node, AssociatedSequence, inherited_properties, search_identifier ) {
            this.loops = 1;

            if ( !inherited_properties ) {
                inherited_properties = {
                    attributes: {},
                    options: {}
                };
            }
            if ( !search_identifier ) {
                search_identifier = '';
            }

            this.target_selection_logic = this.generate_selection_method(target_selector, search_identifier);

            const global_accessor_pattern = new RegExp(/^@universal_vars\.[a-zA-Z0-9\-\_]*$/);

            const local_attributes = JSON.parse(JSON.stringify(inherited_properties));
            local_attributes.attributes = {};

            for ( const attrib_key in segment_node.attributes ) {
                if ( global_accessor_pattern.exec(segment_node.attributes[attrib_key]) ) {
                    const anticipated_global_key = segment_node.attributes[attrib_key].split('.')[1].trim();
                    if ( !universal_vars.hasOwnProperty("@" + anticipated_global_key) ) {
                        ME.write_log("error", "Global variable '" + segment_node.attributes[attrib_key] + "' is undefined. It will be ignored.");
                    }
                    else {
                        segment_node.attributes[attrib_key] = universal_vars['@' + anticipated_global_key];
                    }
                }

                if ( setting_keys.indexOf(attrib_key) >= 0 ) {
                    if ( attrib_key !== "loop" ) {
                        local_attributes.options[attrib_key] = segment_node.attributes[attrib_key];
                    }
                    else {
                        this.loops = segment_node.attributes[attrib_key];
                    }
                }
                else {
                    local_attributes.attributes[attrib_key] = segment_node.attributes[attrib_key];
                }
            }

            let segment_completion_callback = function () {
                AssociatedSequence.ProcessCompletionTracker.animation_finished_callback();
            };

            const sub_elements = Object.keys(segment_node.children);

            if ( segment_node.attributes.hasOwnProperty('loop') ) {
                AssociatedSequence.set_iteration_count(segment_node.attributes.loop);
            }

            for ( let i = 0; i < sub_elements.length; i++ ) {
                const sub_element_label = sub_elements[i];

                if ( sub_element_label === "complete:trigger" ) {
                    segment_completion_callback = function ( trigger_event_data, execution_params ) {
                        const inner_callback = function () {
                            AssociatedSequence.ProcessCompletionTracker.animation_finished_callback();
                        };
                        retrieve_sequence_by_name(segment_node.children[sub_element_label].attributes.eventName).start_execution(trigger_event_data, execution_params, inner_callback);
                    };
                }
                else if ( sub_element_label !== "complete" ) {
                    AssociatedSequence.add_prepared_segment(new AnimationSegment(this.target_selection_logic, segment_node.children[sub_element_label], AssociatedSequence, local_attributes, sub_element_label));
                }
                else {
                    let embedded_sequence_iterations = 1;
                    if ( segment_node.children[sub_element_label].attributes.hasOwnProperty('loop') ) {
                        embedded_sequence_iterations = segment_node.children[sub_element_label].attributes['loop'];
                    }

                    const embedded_sequence = new ActionSequence(embedded_sequence_iterations);
                    embedded_sequence.add_prepared_segment(new AnimationSegment(this.target_selection_logic, segment_node.children.complete, embedded_sequence, local_attributes));
                    segment_completion_callback = function ( trigger_event_data, execution_params ) {
                        const inner_callback = function () {
                            AssociatedSequence.ProcessCompletionTracker.animation_finished_callback();
                        };
                        embedded_sequence.start_execution(trigger_event_data, execution_params, inner_callback);
                    };
                }
            }

            this.create_execution_routine(local_attributes, segment_completion_callback);


            this.run_segment = function ( trigger_event_data, execution_params ) {
                this.execution_routine(trigger_event_data, execution_params, segment_completion_callback);
            };

        };


        /**
         * Constructs the core animation execution function for an AnimationSegment.
         * This function, when run, selects target elements and applies animations
         * based on parsed properties and runtime parameters.
         * @param {object} properties The combined attributes and options for the animation.
         * @param {Function} final_segment_completion_callback The callback to invoke after this segment finishes.
         */
        AnimationSegment.prototype.create_execution_routine = function ( properties, final_segment_completion_callback ) {
            const parameter_placeholder_pattern = new RegExp(/^@params\.[a-zA-Z0-9\-\_]*$|^-@params\.[a-zA-Z0-9\-\_]*$|^-=@params\.[a-zA-Z0-9\-\_]*$|^\+=@params\.[a-zA-Z0-9\-\_]*$|^@params\.[a-zA-Z0-9\-\_]*.%$|-^@params\.[a-zA-Z0-9\-\_]*.%$|^-=@params\.[a-zA-Z0-9\-\_]*.%$|^\+=@params\.[a-zA-Z0-9\-\_]*.%$|^\(@params\.[a-zA-Z0-9\-\_]*.\)px$|-^\(@params\.[a-zA-Z0-9\-\_]*.\)px$|^-=\(@params\.[a-zA-Z0-9\-\_]*.\)px$|^\+=\(@params\.[a-zA-Z0-9\-\_]*.\)px$/);
            const dom_attribute_placeholder_pattern = new RegExp(/^@domel\.[a-zA-Z0-9\-\_]*$|^-@domel\.[a-zA-Z0-9\-\_]*$|^-=@domel\.[a-zA-Z0-9\-\_]*$|^\+=@domel\.[a-zA-Z0-9\-\_]*$|^@domel\.[a-zA-Z0-9\-\_]*.%$|-^@domel\.[a-zA-Z0-9\-\_]*.%$|^-=@domel\.[a-zA-Z0-9\-\_]*.%$|^\+=@domel\.[a-zA-Z0-9\-\_]*.%$|^\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^-\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^-=\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^\+=\(@domel\.[a-zA-Z0-9\-\_]*.\)px$/);
            const random_value_placeholder_pattern = new RegExp(/^@rand\( *?.+ *?, *?.+ *?\)$|^-@rand\( *?.+ *?, *?.+ *?\)$|^-=@rand\( *?.+ *?, *?.+ *?\)$|^\+=@rand\( *?.+ *?, *?.+ *?\)$|^@rand\( *?.+ *?, *?.+ *?\)%$|^-@rand\( *?.+ *?, *?.+ *?\)%$|^-=@rand\( *?.+ *?, *?.+ *?\)%$|^\+=@rand\( *?.+ *?, *?.+ *?\)%$|^@rand\( *?.+ *?, *?.+ *?\)px$|^-@rand\( *?.+ *?, *?.+ *?\)px$|^-=@rand\( *?.+ *?, *?.+ *?\)px$|^\+=@rand\( *?.+ *?, *?.+ *?\)px$/);

            let duration_not_specified = false;
            if ( !properties.options.hasOwnProperty("duration") ) {
                properties.options.duration = '0.3s';
                duration_not_specified = true;
            }


            this.execution_routine = function ( trigger_event_data, execution_params, segment_completion_callback ) {
                let contains_parameters = false;
                let contains_random_values = false;
                // Stores mappings for attributes/options that need runtime parameter replacement.
                const parameterized_mappings = [];
                // Stores mappings for attributes/options that need runtime random value generation.
                const random_value_specifications = [];

                let attribute_count = 0;

                const pre_execution_steps = [];
                const run_pre_steps = function ( target_element ) {
                    for ( let i = 0; i < pre_execution_steps.length; i++ ) {
                        pre_execution_steps[i](target_element);
                    }
                    return target_element;
                };

                for ( const attrib_key in properties.attributes ) {
                    if ( attrib_key === '-.' ) {
                        const class_to_remove = properties.attributes[attrib_key] + '';
                        pre_execution_steps.push(function ( element_target ) {
                            element_target.removeClass(class_to_remove);
                        });
                        continue;
                    }
                    else if ( attrib_key === '+.' ) {
                        const class_to_add = properties.attributes[attrib_key] + '';
                        pre_execution_steps.push(function ( element_target ) {
                            element_target.addClass(class_to_add);
                        });
                        continue;
                    }

                    attribute_count += 1;
                    if ( parameter_placeholder_pattern.exec(properties.attributes[attrib_key]) ) {
                        const actual_property_name = parse_nested_attribute(properties.attributes[attrib_key]);
                        if ( execution_params.hasOwnProperty(actual_property_name) ) {
                            properties.attributes[attrib_key] = extract_operation_prefix(properties.attributes[attrib_key]) + execution_params[actual_property_name] + determine_measurement_units(properties.attributes[attrib_key]);
                        }
                        else {
                            ME.write_log("error", "Parameter '" + actual_property_name + "' was expected in the parameters object but is missing. It will be ignored.");
                        }
                    }
                    else if ( dom_attribute_placeholder_pattern.exec(properties.attributes[attrib_key]) ) {
                        parameterized_mappings.push({
                            prefix: extract_operation_prefix(properties.attributes[attrib_key]),
                            units: determine_measurement_units(properties.attributes[attrib_key]),
                            part_type: 'attributes',
                            target_key: attrib_key,
                            source_attribute: parse_nested_attribute(properties.attributes[attrib_key])
                        });
                        contains_parameters = true;
                    }
                    else if ( random_value_placeholder_pattern.exec(properties.attributes[attrib_key]) ) {
                        const value_range_array = properties.attributes[attrib_key].match(/([^()]+)/g)[1].split(',');
                        random_value_specifications.push({
                            prefix: extract_operation_prefix(properties.attributes[attrib_key]),
                            units: determine_measurement_units(properties.attributes[attrib_key]),
                            part_type: 'attributes',
                            target_key: attrib_key,
                            random_range: [ value_range_array[0].trim() * 1, value_range_array[1].trim() * 1 ]
                        });
                        contains_random_values = true;
                    }
                }

                for ( const attrib_key in properties.options ) {
                    if ( parameter_placeholder_pattern.exec(properties.options[attrib_key]) ) {
                        const actual_property_name = parse_nested_attribute(properties.options[attrib_key]);
                        if ( execution_params.hasOwnProperty(actual_property_name) ) {
                            properties.options[attrib_key] = extract_operation_prefix(properties.options[attrib_key]) + execution_params[actual_property_name] + determine_measurement_units(properties.options[attrib_key]);
                        }
                        else {
                            ME.write_log("error", "Parameter '" + actual_property_name + "' was expected in the parameters object but is missing. It will be ignored.");
                        }
                    }
                    else if ( dom_attribute_placeholder_pattern.exec(properties.options[attrib_key]) ) {
                        parameterized_mappings.push({
                            prefix: extract_operation_prefix(properties.options[attrib_key]),
                            units: determine_measurement_units(properties.options[attrib_key]),
                            part_type: 'options',
                            target_key: attrib_key,
                            source_attribute: parse_nested_attribute(properties.options[attrib_key])
                        });
                        contains_parameters = true;
                    }
                    else if ( random_value_placeholder_pattern.exec(properties.options[attrib_key]) ) {
                        contains_random_values = true;
                        const value_range_array = properties.options[attrib_key].match(/([^()]+)/g)[1].split(',');
                        random_value_specifications.push({
                            prefix: extract_operation_prefix(properties.options[attrib_key]),
                            units: determine_measurement_units(properties.options[attrib_key]),
                            part_type: 'options',
                            target_key: attrib_key,
                            random_range: [ value_range_array[0].trim() * 1, value_range_array[1].trim() * 1 ]
                        });
                    }
                }

                if ( attribute_count === 0 ) {
                    run_pre_steps(this.target_selection_logic(properties, trigger_event_data));
                    segment_completion_callback(trigger_event_data, execution_params);
                    return true;
                }
                else if ( duration_not_specified ) {
                    ME.write_log("error", "Animation duration was not defined. Defaulting to 0.3s.");
                }

                if ( !contains_parameters && !contains_random_values ) {
                    properties.options.complete = function () {
                        segment_completion_callback(trigger_event_data, execution_params);
                    };
                    const animated_elements = this.target_selection_logic(properties, trigger_event_data);
                    run_pre_steps(animated_elements).velocity(properties.attributes, properties.options);
                }
                else {
                    const chosen_elements = this.target_selection_logic(properties, trigger_event_data);
                    const ProcessCompletionTracker = {
                        total_elements_to_animate: chosen_elements.length,
                        completed_animations_count: 0,

                        animation_finished_callback: function () {
                            this.completed_animations_count += 1;
                            if ( this.completed_animations_count === this.total_elements_to_animate ) {
                                segment_completion_callback(trigger_event_data, execution_params);
                            }
                        }
                    };

                    chosen_elements.each(function () {
                        const individual_element_attributes = JSON.parse(JSON.stringify(properties));
                        for ( let i = 0; i < parameterized_mappings.length; i++ ) {
                            individual_element_attributes[parameterized_mappings[i].part_type][parameterized_mappings[i].target_key] =
                                parameterized_mappings[i].prefix + $(this).attr(parameterized_mappings[i].source_attribute) + parameterized_mappings[i].units;
                        }
                        for ( let i = 0; i < random_value_specifications.length; i++ ) {
                            individual_element_attributes[random_value_specifications[i].part_type][random_value_specifications[i].target_key] =
                                random_value_specifications[i].prefix + produce_random_value(random_value_specifications[i]['random_range'][0], random_value_specifications[i]['random_range'][1]) + random_value_specifications[i].units;
                        }

                        individual_element_attributes.options.complete = function () {
                            ProcessCompletionTracker.animation_finished_callback();
                        };
                        run_pre_steps($(this)).velocity(individual_element_attributes.attributes, individual_element_attributes.options);
                    });
                }

            };
        };


        /**
         * Generates a function that, when executed, returns the set of DOM elements
         * to be animated for a given segment. It interprets complex selection strings.
         * @param {Array<string>} selector_parts An array of strings defining the selection.
         * @param {string} search_identifier An optional string for further `find` operations.
         * @returns {Function} A function that takes properties and an event object, returning a jQuery collection.
         */
        AnimationSegment.prototype.generate_selection_method = function ( selector_parts, search_identifier ) {
            const selection_expressions = [
                {
                    name: 'index greater than',
                    regex_pattern: new RegExp(/^@index\ *?\>\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            return ":gt(" + expression_string.split(":")[1].trim() + ")";
                        };
                    }
                },
                {
                    name: 'index less than',
                    regex_pattern: new RegExp(/^@index\ *?\<\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            return ":lt(" + expression_string.split(":")[1].trim() + ")";
                        };
                    }
                },
                {
                    name: 'index less or equal to',
                    regex_pattern: new RegExp(/^@index\ *?\<\=\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            return ":le(" + expression_string.split(":")[1].trim() + ")";
                        };
                    }
                },
                {
                    name: 'index greater or equal to',
                    regex_pattern: new RegExp(/^@index\ *?\>\=\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            return ":ge(" + expression_string.split(":")[1].trim() + ")";
                        };
                    }
                },
                {
                    name: 'index equal to',
                    regex_pattern: new RegExp(/^@index\ *?\=\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            return ":eq(" + expression_string.split(":")[1].trim() + ")";
                        };
                    }
                },
                {
                    name: 'data attribute greater than',
                    regex_pattern: new RegExp(/^@data\-[a-zA-Z0-9\-\_]+\ *?\>\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            const expression_parts = expression_string.split(">");
                            const attribute_name = expression_parts[0].split("-")[1];
                            const attribute_value = expression_parts[1].trim();

                            const initial_selection = $('[' + expression_parts[0].trim().replace('@', '') + ']');
                            const filtered_elements = initial_selection.filter(function () {
                                return $(this).data(attribute_name) > attribute_value;
                            });
                            return filtered_elements;
                        };
                    }
                },
                {
                    name: 'data attribute less than',
                    regex_pattern: new RegExp(/^@data\-[a-zA-Z0-9\-\_]+\ *?\<\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            const expression_parts = expression_string.split("<");
                            const attribute_name = expression_parts[0].split("-")[1];
                            const attribute_value = expression_parts[1].trim();

                            const initial_selection = $('[' + expression_parts[0].trim().replace('@', '') + ']');
                            const filtered_elements = initial_selection.filter(function () {
                                return $(this).data(attribute_name) < attribute_value;
                            });
                            return filtered_elements;
                        };
                    }
                },
                {
                    name: 'data attribute greater or equal to',
                    regex_pattern: new RegExp(/^@data\-[a-zA-Z0-9\-\_]+\ *?\>\=\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            const expression_parts = expression_string.split(">=");
                            const attribute_name = expression_parts[0].split("-")[1];
                            const attribute_value = expression_parts[1].trim();

                            const initial_selection = $('[' + expression_parts[0].trim().replace('@', '') + ']');
                            const filtered_elements = initial_selection.filter(function () {
                                return $(this).data(attribute_name) >= attribute_value;
                            });
                            return filtered_elements;
                        };
                    }
                },
                {
                    name: 'data attribute less or equal to',
                    regex_pattern: new RegExp(/^@data\-[a-zA-Z0-9\-\_]+\ *?\<\=\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            const expression_parts = expression_string.split("<=");
                            const attribute_name = expression_parts[0].split("-")[1];
                            const attribute_value = expression_parts[1].trim();

                            const initial_selection = $('[' + expression_parts[0].trim().replace('@', '') + ']');
                            const filtered_elements = initial_selection.filter(function () {
                                return $(this).data(attribute_name) <= attribute_value;
                            });
                            return filtered_elements;
                        };
                    }
                },
                {
                    name: 'data attribute equal to',
                    regex_pattern: new RegExp(/^@data\-[a-zA-Z0-9\-\_]+\ *?\=\ *?\d+$/),
                    generate_selection_method: function ( expression_string ) {
                        return function ( current_properties ) {
                            const expression_parts = expression_string.split("=");
                            const attribute_name = expression_parts[0].split("-")[1];
                            const attribute_value = expression_parts[1].trim();

                            const initial_selection = $('[' + expression_parts[0].trim().replace('@', '') + ']');
                            const filtered_elements = initial_selection.filter(function () {
                                return $(this).data(attribute_name) === attribute_value;
                            });
                            return filtered_elements;
                        };
                    }
                }
            ];

            return function ( current_properties, trigger_event_data ) {
                let dom_elements_collection;
                const base_selection_string = selector_parts[0];

                if ( base_selection_string === "triggeringElement" ) {
                    dom_elements_collection = $(trigger_event_data.currentTarget);
                }
                else if ( base_selection_string.indexOf('not(triggeringElement)') === 0 ) {
                    dom_elements_collection = $(':not(' + $(trigger_event_data.currentTarget).prop('tagName') + ')');
                }
                else {
                    dom_elements_collection = $(base_selection_string);
                }

                if ( selector_parts.length > 2 ) {
                    for ( let i = 1; i < selector_parts.length - 1; i++ ) {
                        let expression_matched = false;
                        for ( let j = 0; j < selection_expressions.length; j++ ) {
                            if ( selection_expressions[j].regex_pattern.exec(selector_parts[i]) ) {
                                dom_elements_collection = dom_elements_collection.filter(selection_expressions[j].generate_selection_method(selector_parts[i])(current_properties));
                                expression_matched = true;
                                break;
                            }
                        }
                        if ( !expression_matched ) {
                            ME.write_log("error", "The selection expression '" + selector_parts[i] + "' is not supported and will be disregarded!");
                        }
                    }
                }

                if ( search_identifier !== '' ) {
                    dom_elements_collection = dom_elements_collection.find(search_identifier);
                }

                return dom_elements_collection;
            };
        };


        /**
         * Represents a complete action sequence, managing its segments and execution flow.
         * @param {number|boolean} iteration_count The number of times the sequence should loop, or true for infinite.
         * @param {string} [sequence_label] The name of this action sequence.
         */
        const ActionSequence = function ( iteration_count, sequence_label ) {
            this.iteration_count = iteration_count || 1;
            this.sequence_label = sequence_label;
            this.defined_segments = []; // All segments defined in the MSS
            this.is_active = false;
            this.running_segments = []; // Segments currently executing
            this.prepared_segments = []; // Segments ready for execution in the current iteration
            this.ProcessCompletionTracker = {
                total_animations_in_iteration: 0,
                completed_animations_in_iteration: 0,
                on_sequence_finish_callback: function () { },
                parent_sequence_object: this,
                animation_finished_callback: function () {
                    this.completed_animations_in_iteration += 1;
                    if ( this.completed_animations_in_iteration === this.total_animations_in_iteration ) {
                        this.on_sequence_finish_callback();
                        this.parent_sequence_object.on_iteration_complete();
                    }
                }
            };
        };

        /**
         * Adds a new AnimationSegment to this sequence based on selector and node data.
         * @param {Array<string>} selector_data The selector array for the segment.
         * @param {object} segment_config_node The configuration node for the segment.
         */
        ActionSequence.prototype.add_segment = function ( selector_data, segment_config_node ) {
            this.defined_segments.push(new AnimationSegment(selector_data, segment_config_node, this));
        };

        /**
         * Adds an already created AnimationSegment to the list of segments ready for execution.
         * @param {AnimationSegment} segment_instance The AnimationSegment object.
         */
        ActionSequence.prototype.add_prepared_segment = function ( segment_instance ) {
            this.prepared_segments.push(segment_instance);
        };

        /**
         * Initiates the execution of all prepared segments within this sequence.
         * @param {*} trigger_event_data Event data from the trigger.
         * @param {object} execution_params Parameters to pass to animations.
         * @param {Function} on_sequence_finish_callback Callback for when the entire sequence (or iteration) finishes.
         */
        ActionSequence.prototype.start_execution = function ( trigger_event_data, execution_params, on_sequence_finish_callback ) {
            this.ProcessCompletionTracker.on_sequence_finish_callback = on_sequence_finish_callback;
            this.ProcessCompletionTracker.total_animations_in_iteration = this.prepared_segments.length;
            this.ProcessCompletionTracker.completed_animations_in_iteration = 0;
            this.is_active = true;

            for ( let i = 0; i < this.prepared_segments.length; i++ ) {
                this.prepared_segments[i].run_segment(trigger_event_data, execution_params);
                this.running_segments.push(this.prepared_segments[i]);
            }
        };

        /**
         * Stops the current execution of this action sequence.
         */
        ActionSequence.prototype.halt_execution = function () {
            this.is_active = false;
            this.running_segments = [];
        };

        /**
         * Sets the number of times this sequence should loop.
         * @param {number|boolean} new_loop_count The new loop count.
         */
        ActionSequence.prototype.set_iteration_count = function ( new_loop_count ) {
            this.iteration_count = new_loop_count;
        };

        /**
         * Called when an iteration of the sequence completes. Handles looping logic.
         */
        ActionSequence.prototype.on_iteration_complete = function () {
            if ( this.iteration_count === true || this.iteration_count > 1 ) {
                if ( this.iteration_count > 1 ) {
                    this.iteration_count -= 1;
                }
                // Re-trigger the sequence with previous parameters for looping
                this.start_execution(null, null, this.ProcessCompletionTracker.on_sequence_finish_callback);
            }
            else {
                this.halt_execution();
            }
        };

        /**
         * Logs messages to the console based on debug settings and message type.
         * @param {string} message_type The type of message ('error', 'warn', 'info').
         * @param {string} message_content The message text.
         */
        this.write_log = function ( message_type, message_content ) {
            if ( engine_logger_enabled ) {
                if ( message_type === "error" ) {
                    console.error("MotionEngine: " + message_content);
                }
                else if ( message_type === "warn" ) {
                    console.warn("MotionEngine: " + message_content);
                }
                else {
                    console.log("MotionEngine: " + message_content);
                }
            }
        };
    };
})( window );