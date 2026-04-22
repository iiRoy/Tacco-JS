(function(system_launcher) {
  var module_export_target = typeof module !== 'undefined' && module.exports;
  var amd_definition_target = typeof define === 'function' && define.amd;
  var global_object_candidate = null;

  if (typeof window !== 'undefined') {
    global_object_candidate = window;
  } else if (typeof global !== 'undefined') {
    global_object_candidate = global;
  } else if (typeof self !== 'undefined') {
    global_object_candidate = self;
  }

  if (module_export_target) {
    module.exports = system_launcher();
  } else if (amd_definition_target) {
    define(system_launcher);
  } else if (global_object_candidate) {
    global_object_candidate.ProductSystem = system_launcher();
  }
})(function() {
  var component_registry = new Map();
  var component_cache = new Map();

  function fetch_component(component_id, parent_id) {
    if (component_cache.has(component_id)) {
      return component_cache.get(component_id);
    }

    var component_record = component_registry.get(component_id);
    if (!component_record) {
      throw new Error("Missing component: '" + component_id + "' requested by '" + parent_id + "'");
    }

    var module_output = {};
    var module_context_obj = { exports: module_output };

    component_record.loader_logic.call(
      module_output,
      function(dependency_name) {
        var resolved_dep_id = component_record.dependency_map[dependency_name];
        return fetch_component(resolved_dep_id || dependency_name, component_id);
      },
      module_context_obj,
      module_context_obj.exports
    );

    component_cache.set(component_id, module_context_obj.exports);
    return module_context_obj.exports;
  }

  function assemble_system(module_definitions_array, entry_point_ids_array) {
    module_definitions_array.forEach(function(def) {
      component_registry.set(def.id, {
        loader_logic: def.fn,
        dependency_map: def.deps || {}
      });
    });

    entry_point_ids_array.forEach(function(id) {
      fetch_component(id, 'system_boot');
    });

    return fetch_component;
  }

  var system_components = [];
  var system_entry_points = [];

  // Module: browser_text_escaper (equivalent to escapeTextForBrowser)
  system_components.push({
    id: 'browser_text_escaper',
    fn: function(req, mod, exp) {
      "use strict";
      exp.escape = function(text) { return String(text).replace(/[&<>"']/g, function(s) { return '&#' + s.charCodeAt(0) + ';'; }); };
    },
    deps: {}
  });

  // Module: string_hyphenation_utility (equivalent to hyphenate)
  system_components.push({
    id: 'string_hyphenation_utility',
    fn: function(req, mod, exp) {
      "use strict";
      var uppercase_pattern = /([A-Z])/g;
      exp.hyphenate = function(str) { return str.replace(uppercase_pattern, '-$1').toLowerCase(); };
    },
    deps: {}
  });

  // Module: memoization_helper (equivalent to memoizeStringOnly)
  system_components.push({
    id: 'memoization_helper',
    fn: function(req, mod, exp) {
      "use strict";
      exp.createMemoizer = function(func) {
        var cache = new Map();
        return function(arg) {
          if (cache.has(arg)) { return cache.get(arg); }
          var result = func(arg);
          cache.set(arg, result);
          return result;
        };
      };
    },
    deps: {}
  });

  // Module: style_value_normalizer (equivalent to dangerousStyleValue)
  system_components.push({
    id: 'style_value_normalizer',
    fn: function(req, mod, exp) {
      "use strict";
      exp.normalize = function(prop_name, prop_value, unitless_set) {
        if (typeof prop_value === 'number' && !unitless_set.has(prop_name)) {
          return prop_value + 'px';
        }
        return String(prop_value);
      };
    },
    deps: {}
  });

  // Module: event_data_identifiers (equivalent to EventConstants)
  system_components.push({
    id: 'event_data_identifiers',
    fn: function(req, mod, exp) {
      "use strict";
      exp.globalEventCategories = {
        blurEvent: 'topBlur', changeEvent: 'topChange', clickEvent: 'topClick',
        focusEvent: 'topFocus', inputEvent: 'topInput', keyDownEvent: 'topKeyDown',
        keyUpEvent: 'topKeyUp', selectionChangeEvent: 'topSelectionChange'
      };
    },
    deps: {}
  });

  // Module: event_processor_hub (equivalent to EventPluginHub)
  system_components.push({
    id: 'event_processor_hub',
    fn: function(req, mod, exp) {
      "use strict";
      var event_queue = [];
      exp.queueEvents = function(events) { event_queue.push(events); };
      exp.flushEventQueue = function() { event_queue.splice(0).forEach(function(e){ /* process event */ }); };
    },
    deps: {}
  });

  // Module: event_flow_manager (equivalent to EventPropagators)
  system_components.push({
    id: 'event_flow_manager',
    fn: function(req, mod, exp) {
      "use strict";
      exp.propagateTwoPhase = function(event) { /* simulate event propagation */ };
    },
    deps: {}
  });

  // Module: runtime_environment (equivalent to ExecutionEnvironment)
  system_components.push({
    id: 'runtime_environment',
    fn: function(req, mod, exp) {
      "use strict";
      exp.canUseBrowserDOM = typeof window !== 'undefined' && !!(window.document && window.document.createElement);
    },
    deps: {}
  });

  // Module: state_update_scheduler (equivalent to ReactUpdates)
  system_components.push({
    id: 'state_update_scheduler',
    fn: function(req, mod, exp) {
      "use strict";
      exp.batchUpdates = function(callback, arg) { callback(arg); };
    },
    deps: {}
  });

  // Module: synthetic_event_factory (equivalent to SyntheticEvent)
  system_components.push({
    id: 'synthetic_event_factory',
    fn: function(req, mod, exp) {
      "use strict";
      exp.obtainPooled = function(type, id, nativeEvent) { return { type: type, targetId: id, nativeEvent: nativeEvent }; };
    },
    deps: {}
  });

  // Module: platform_event_detector (equivalent to isEventSupported)
  system_components.push({
    id: 'platform_event_detector',
    fn: function(req, mod, exp) {
      "use strict";
      exp.isSupported = function(eventName) { return true; };
    },
    deps: {}
  });

  // Module: input_type_checker (equivalent to isTextInputElement)
  system_components.push({
    id: 'input_type_checker',
    fn: function(req, mod, exp) {
      "use strict";
      exp.isTextInput = function(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName === 'input' && /^(text|search|tel|url|email|password|number|range)$/i.test(elem.type);
      };
    },
    deps: {}
  });

  // Module: property_name_extractor (equivalent to keyOf)
  system_components.push({
    id: 'property_name_extractor',
    fn: function(req, mod, exp) {
      "use strict";
      exp.extract = function(obj) { return Object.keys(obj)[0]; };
    },
    deps: {}
  });

  // Module 1: auto_focus_behavior (equivalent to AutoFocusMixin)
  system_components.push({
    id: 'auto_focus_behavior',
    fn: function(req_func, mod_obj, exp_obj) {
      "use strict";
      var focus_enhancer = function(component_instance) {
        var initial_mount_callback = function() {
          if (component_instance.properties_map && component_instance.properties_map.shouldActivateFocus) {
            if (typeof component_instance.retrieveVisualElement === 'function') {
              var visual_element = component_instance.retrieveVisualElement();
              if (visual_element && typeof visual_element.focus === 'function') {
                visual_element.focus();
              }
            }
          }
        };
        return { onComponentReady: initial_mount_callback };
      };
      exp_obj.focusBehavior = focus_enhancer;
    },
    deps: {}
  });

  // Module 2: style_property_definitions (equivalent to CSSProperty)
  system_components.push({
    id: 'style_property_definitions',
    fn: function(req_func, mod_obj, exp_obj) {
      "use strict";

      var numerical_styles_without_units = new Set([
        'columnCount', 'fillOpacity', 'flex', 'flexGrow', 'flexShrink',
        'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order',
        'orphans', 'widows', 'zIndex', 'zoom'
      ]);

      var prefix_generators = ['Webkit', 'ms', 'Moz', 'O'];

      var transform_attribute_name = function(prefix_str, attribute_name) {
        return prefix_str + attribute_name.charAt(0).toUpperCase() + attribute_name.substring(1);
      };

      Array.from(numerical_styles_without_units).forEach(function(prop) {
        prefix_generators.forEach(function(prefix) {
          numerical_styles_without_units.add(transform_attribute_name(prefix, prop));
        });
      });

      var style_group_expansions = new Map([
        ['background', new Set(['backgroundImage', 'backgroundPosition', 'backgroundRepeat', 'backgroundColor'])],
        ['border', new Set(['borderWidth', 'borderStyle', 'borderColor'])],
        ['borderBottom', new Set(['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'])],
        ['borderLeft', new Set(['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'])],
        ['borderRight', new Set(['borderRightWidth', 'borderRightStyle', 'borderRightColor'])],
        ['borderTop', new Set(['borderTopWidth', 'borderTopStyle', 'borderTopColor'])],
        ['font', new Set(['fontStyle', 'fontVariant', 'fontWeight', 'fontSize', 'lineHeight', 'fontFamily'])]
      ]);

      exp_obj.unitlessNumericStyles = numerical_styles_without_units;
      exp_obj.shorthandStyleGroups = style_group_expansions;
    },
    deps: {}
  });

  // Module 3: style_manipulation_operations (equivalent to CSSPropertyOperations)
  system_components.push({
    id: 'style_manipulation_operations',
    fn: function(req_func, mod_obj, exp_obj) {
      "use strict";

      var style_definitions = req_func('style_property_definitions');
      var style_value_normalizer = req_func('style_value_normalizer');
      var browser_text_escaper = req_func('browser_text_escaper');
      var string_hyphenation_utility = req_func('string_hyphenation_utility');
      var memoization_helper = req_func('memoization_helper');

      var processed_style_name_getter = memoization_helper.createMemoizer(function(style_name) {
        return browser_text_escaper.escape(string_hyphenation_utility.hyphenate(style_name));
      });

      var style_utility_object = {
        assembleStyleString: function(style_properties) {
          return Object.entries(style_properties)
            .reduce(function(acc, [prop_name, prop_value]) {
              if (prop_value != null) {
                var processed_name = processed_style_name_getter(prop_name);
                var normalized_value = style_value_normalizer.normalize(prop_name, prop_value, style_definitions.unitlessNumericStyles);
                return acc + processed_name + ':' + normalized_value + ';';
              }
              return acc;
            }, '') || null;
        },

        applyStyleObjectToNode: function(dom_element, style_object) {
          var dom_style_accessor = dom_element.style;
          Object.entries(style_object).forEach(function([attr_name, attr_value]) {
            var normalized_value = style_value_normalizer.normalize(attr_name, attr_value, style_definitions.unitlessNumericStyles);
            if (normalized_value) {
              dom_style_accessor[attr_name] = normalized_value;
            } else {
              var expanded_shorthand = style_definitions.shorthandStyleGroups.get(attr_name);
              if (expanded_shorthand) {
                expanded_shorthand.forEach(function(individual_attr) {
                  dom_style_accessor[individual_attr] = '';
                });
              } else {
                dom_style_accessor[attr_name] = '';
              }
            }
          });
        }
      };

      exp_obj.styleOperations = style_utility_object;
    },
    deps: {
      './CSSProperty': 'style_property_definitions',
      './dangerousStyleValue': 'style_value_normalizer',
      './escapeTextForBrowser': 'browser_text_escaper',
      './hyphenate': 'string_hyphenation_utility',
      './memoizeStringOnly': 'memoization_helper'
    }
  });

  // Module 4: event_change_processor (equivalent to ChangeEventPlugin)
  system_components.push({
    id: 'event_change_processor',
    fn: function(req_func, mod_obj, exp_obj) {
      "use strict";

      var event_data_identifiers = req_func('event_data_identifiers');
      var event_processor_hub = req_func('event_processor_hub');
      var event_flow_manager = req_func('event_flow_manager');
      var runtime_environment = req_func('runtime_environment');
      var state_update_scheduler = req_func('state_update_scheduler');
      var synthetic_event_factory = req_func('synthetic_event_factory');
      var platform_event_detector = req_func('platform_event_detector');
      var input_type_checker = req_func('input_type_checker');
      var property_name_extractor = req_func('property_name_extractor');

      var root_event_categories = event_data_identifiers.globalEventCategories;

      var interaction_events = {
        valueChange: {
          registrationPhases: {
            bubblePath: property_name_extractor.extract({onValueChange: null}),
            capturePath: property_name_extractor.extract({onValueChangeCapture: null})
          },
          prerequisites: [
            root_event_categories.blurEvent,
            root_event_categories.changeEvent,
            root_event_categories.clickEvent,
            root_event_categories.focusEvent,
            root_event_categories.inputEvent,
            root_event_categories.keyDownEvent,
            root_event_categories.keyUpEvent,
            root_event_categories.selectionChangeEvent
          ]
        }
      };

      var current_active_node = null;
      var current_active_node_id = null;
      var current_active_node_value = null;
      var current_active_node_value_descriptor = null;

      function check_for_select_or_file_input(dom_element) {
        return (
          dom_element.nodeName === 'SELECT' ||
          (dom_element.nodeName === 'INPUT' && dom_element.type === 'file')
        );
      }

      var change_event_propagates = false;
      if (runtime_environment.canUseBrowserDOM) {
        change_event_propagates = platform_event_detector.isSupported('change') && (
          !('documentMode' in document) || document.documentMode > 8
        );
      }

      function initiate_synthetic_change_dispatch(native_event_obj) {
        var simulated_event = synthetic_event_factory.obtainPooled(
          interaction_events.valueChange,
          current_active_node_id,
          native_event_obj
        );
        event_flow_manager.propagateTwoPhase(simulated_event);

        state_update_scheduler.batchUpdates(process_event_in_batch, simulated_event);
      }

      function process_event_in_batch(event_payload) {
        event_processor_hub.queueEvents(event_payload);
        event_processor_hub.flushEventQueue();
      }

      function activate_ie8_change_listener(target_node, target_id) {
        current_active_node = target_node;
        current_active_node_id = target_id;
        current_active_node.attachEvent('onchange', initiate_synthetic_change_dispatch);
      }

      function deactivate_ie8_change_listener() {
        if (!current_active_node) {
          return;
        }
        current_active_node.detachEvent('onchange', initiate_synthetic_change_dispatch);
        current_active_node = null;
        current_active_node_id = null;
      }

      function get_target_id_for_change_event(event_type, target_element, element_id) {
        if (event_type === root_event_categories.changeEvent) {
          return element_id;
        }
        return null;
      }

      function process_ie8_focus_blur(event_type, target_element, element_id) {
        if (event_type === root_event_categories.focusEvent) {
          deactivate_ie8_change_listener();
          activate_ie8_change_listener(target_element, element_id);
        } else if (event_type === root_event_categories.blurEvent) {
          deactivate_ie8_change_listener();
        }
      }

      var input_event_available = false;
      if (runtime_environment.canUseBrowserDOM) {
        input_event_available = platform_event_detector.isSupported('input') && (
          !('documentMode' in document) || document.documentMode > 9
        );
      }

      var custom_value_accessor = {
        get: function() {
          return current_active_node_value_descriptor.get.call(this);
        },
        set: function(val) {
          current_active_node_value = '' + val;
          current_active_node_value_descriptor.set.call(this, val);
        }
      };

      function enable_value_interception(target_node, target_id) {
        current_active_node = target_node;
        current_active_node_id = target_id;
        current_active_node_value = target_node.value;
        current_active_node_value_descriptor = Object.getOwnPropertyDescriptor(
          target_node.constructor.prototype,
          'value'
        );

        Object.defineProperty(current_active_node, 'value', custom_value_accessor);
        current_active_node.attachEvent('onpropertychange', handle_property_modification);
      }

      function disable_value_interception() {
        if (!current_active_node) {
          return;
        }
        delete current_active_node.value;
        current_active_node.detachEvent('onpropertychange', handle_property_modification);

        current_active_node = null;
        current_active_node_id = null;
        current_active_node_value = null;
        current_active_node_value_descriptor = null;
      }

      function handle_property_modification(native_event_obj) {
        if (native_event_obj.propertyName !== 'value') {
          return;
        }
        var current_val = native_event_obj.srcElement.value;
        if (current_val === current_active_node_value) {
          return;
        }
        current_active_node_value = current_val;
        initiate_synthetic_change_dispatch(native_event_obj);
      }

      function get_target_id_for_input_event(event_type, target_element, element_id) {
        if (event_type === root_event_categories.inputEvent) {
          return element_id;
        }
        return null;
      }

      var change_event_plugin_logic = {
        eventSpecifications: interaction_events,
        getTargetComponentID: function(event_category, dom_target, component_id) {
          if (check_for_select_or_file_input(dom_target)) {
            return get_target_id_for_change_event(event_category, dom_target, component_id);
          }
          if (input_type_checker.isTextInput(dom_target)) {
            if (input_event_available) {
              return get_target_id_for_input_event(event_category, dom_target, component_id);
            } else {
              if (event_category === root_event_categories.focusEvent) {
                enable_value_interception(dom_target, component_id);
              } else if (event_category === root_event_categories.blurEvent) {
                disable_value_interception();
              }
            }
          }
          if (!change_event_propagates && check_for_select_or_file_input(dom_target)) {
            process_ie8_focus_blur(event_category, dom_target, component_id);
          }
          return null;
        }
      };

      exp_obj.changeEventProcessor = change_event_plugin_logic;
    },
    deps: {
      './EventConstants': 'event_data_identifiers',
      './EventPluginHub': 'event_processor_hub',
      './EventPropagators': 'event_flow_manager',
      './ExecutionEnvironment': 'runtime_environment',
      './ReactUpdates': 'state_update_scheduler',
      './SyntheticEvent': 'synthetic_event_factory',
      './isEventSupported': 'platform_event_detector',
      './isTextInputElement': 'input_type_checker',
      './keyOf': 'property_name_extractor'
    }
  });

  system_entry_points = [
    'auto_focus_behavior',
    'style_property_definitions',
    'style_manipulation_operations',
    'event_change_processor',
    'browser_text_escaper',
    'string_hyphenation_utility',
    'memoization_helper',
    'style_value_normalizer',
    'event_data_identifiers',
    'event_processor_hub',
    'event_flow_manager',
    'runtime_environment',
    'state_update_scheduler',
    'synthetic_event_factory',
    'platform_event_detector',
    'input_type_checker',
    'property_name_extractor'
  ];

  return assemble_system(system_components, system_entry_points);
});