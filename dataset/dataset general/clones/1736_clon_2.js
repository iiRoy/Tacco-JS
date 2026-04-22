// This module provides a utility for generating HTML markup based on templates.
function renderContent(output_configs) {

  // Utility for slicing arrays.
  var __sub_array = Array.prototype.slice;

  // Utility for checking own properties on objects.
  var __has_own_key = Object.prototype.hasOwnProperty;

  // Utility for binding function context.
  var __bind_context = function(action_func, target_obj) {
    return function() {
      return action_func.apply(target_obj, arguments);
    };
  };

  // Utility for classical inheritance.
  var __inherit_class = function(child_class, parent_class) {
    for (var prop_key in parent_class) {
      if (__has_own_key.call(parent_class, prop_key)) child_class[prop_key] = parent_class[prop_key];
    }

    function TempConstructor() {
      this.constructor = child_class;
    }
    TempConstructor.prototype = parent_class.prototype;
    child_class.prototype = new TempConstructor;
    child_class.__super__ = parent_class.prototype;
    return child_class;
  };

  // Utility for finding an item's index in an array.
  var __find_item_index = Array.prototype.indexOf || function(search_item) {
    for (var list_idx = 0, list_len = this.length; list_idx < list_len; list_idx++) {
      if (this[list_idx] === search_item) return list_idx;
    }
    return -1;
  };

  // Declare variables for internal use within the rendering process.
  var content_store,
    document_definitions,
    html_escape_func,
    format_spacing_func,
    build_attributes_func,
    repeat_string_func,
    void_elements_list,
    current_indent_level,
    compose_tag_func,
    script_runner,
    note_maker,
    doc_type_setter,
    safe_string_func,
    element_creator,
    text_appender,
    _config_check1,
    _config_check2,
    _config_check3,
    _config_check4;

  // Initialize rendering options if not provided.
  output_configs != null ? output_configs : output_configs = {};
  (_config_check1 = output_configs.context) != null ? _config_check1 : output_configs.context = {};
  (_config_check2 = output_configs.locals) != null ? _config_check2 : output_configs.locals = {};
  (_config_check3 = output_configs.format) != null ? _config_check3 : output_configs.format = false;
  (_config_check4 = output_configs.autoescape) != null ? _config_check4 : output_configs.autoescape = false;

  // Initialize the buffer to store generated HTML.
  content_store = [];

  // Function to render HTML attributes from an object.
  build_attributes_func = function(property_set) {
    var attribute_key, attribute_value, attribute_string;
    attribute_string = '';
    for (attribute_key in property_set) {
      attribute_value = property_set[attribute_key];
      attribute_string += " " + attribute_key + "=\"" + (html_escape_func(attribute_value)) + "\"";
    }
    return attribute_string;
  };

  // Predefined HTML doctype declarations.
  document_definitions = {
    '5': '<!DOCTYPE html>',
    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
  };

  // List of HTML tags that are self-closing (void elements).
  void_elements_list = ['area', 'base', 'basefont', 'br', 'hr', 'img', 'input', 'link', 'meta'];

  // Function to escape text for HTML output.
  html_escape_func = function(input_val) {
    if (output_configs.autoescape) {
      return safe_string_func(input_val);
    } else {
      return String(input_val);
    }
  };

  // Initialize current indentation level.
  current_indent_level = 0;

  // Function to repeat a string a given number of times.
  repeat_string_func = function(base_str, num_repeats) {
    return Array(num_repeats + 1).join(base_str);
  };

  // Function to add indentation based on current level and formatting option.
  format_spacing_func = function() {
    if (output_configs.format) {
      return text_appender(repeat_string_func('  ', current_indent_level));
    }
  };

  // Core HTML escaping function.
  safe_string_func = function(data_val) {
    return String(data_val).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // Function to output a doctype declaration.
  doc_type_setter = function(kind_of_doc) {
    kind_of_doc != null ? kind_of_doc : kind_of_doc = 5;
    text_appender(document_definitions[kind_of_doc]);
    if (output_configs.format) {
      return text_appender('\n');
    }
  };

  // Function to append text to the output buffer.
  text_appender = function(content_data) {
    content_store.push(String(content_data));
    return null;
  };

  // Function to generate an HTML comment.
  note_maker = function(note_content) {
    text_appender("<!--" + note_content + "-->");
    if (output_configs.format) {
      return text_appender('\n');
    }
  };

  // Wrapper function for creating HTML elements.
  element_creator = function() {
    var tag_label;
    tag_label = arguments[0];
    delete arguments[0]; // Remove the tag name from arguments to pass only options
    return compose_tag_func(tag_label, arguments);
  };

  // Core function for composing HTML tags.
  compose_tag_func = function(tag_label, tag_parameters) {
    var current_option,
      inner_result,
      _param_idx_1,
      _param_len_1,
      _param_idx_2,
      _param_len_2;

    format_spacing_func();
    text_appender("<" + tag_label);

    // Process attributes.
    for (_param_idx_1 = 0, _param_len_1 = tag_parameters.length; _param_idx_1 < _param_len_1; _param_idx_1++) {
      current_option = tag_parameters[_param_idx_1];
      if (typeof current_option === 'object') {
        text_appender(build_attributes_func(current_option));
      }
    }

    // Handle self-closing vs. regular tags.
    if (__find_item_index.call(void_elements_list, tag_label) >= 0) {
      text_appender(' />');
      if (output_configs.format) {
        text_appender('\n');
      }
    } else {
      text_appender('>');
      // Process content/children for regular tags.
      for (_param_idx_2 = 0, _param_len_2 = tag_parameters.length; _param_idx_2 < _param_len_2; _param_idx_2++) {
        current_option = tag_parameters[_param_idx_2];
        switch (typeof current_option) {
          case 'string':
          case 'number':
            text_appender(html_escape_func(current_option));
            break;
          case 'function':
            if (output_configs.format) {
              text_appender('\n');
            }
            current_indent_level++;
            inner_result = current_option.call(output_configs.context);
            if (typeof inner_result === 'string') {
              format_spacing_func();
              text_appender(html_escape_func(inner_result));
              if (output_configs.format) {
                text_appender('\n');
              }
            }
            current_indent_level--;
            format_spacing_func();
        }
      }
      text_appender("</" + tag_label + ">");
      if (output_configs.format) {
        text_appender('\n');
      }
    }
    return null;
  };

  // Function to embed CoffeeScript code as an inline script.
  script_runner = function(code_string) {
    return element_creator('script', ";(" + code_string + ")();");
  };

  // Define helper functions for common HTML tags.
  var anchor_link,
    division_block,
    emphasized_text,
    input_form,
    heading_level2,
    italic_text,
    user_input,
    list_item,
    paragraph_block,
    strike_through,
    content_section,
    inline_span,
    table_header,
    time_display,
    table_row,
    underlined_text,
    unordered_list;

  anchor_link = function() {
    return compose_tag_func('a', arguments);
  };
  division_block = function() {
    return compose_tag_func('div', arguments);
  };
  emphasized_text = function() {
    return compose_tag_func('em', arguments);
  };
  input_form = function() {
    return compose_tag_func('form', arguments);
  };
  heading_level2 = function() {
    return compose_tag_func('h2', arguments);
  };
  italic_text = function() {
    return compose_tag_func('i', arguments);
  };
  user_input = function() {
    return compose_tag_func('input', arguments);
  };
  list_item = function() {
    return compose_tag_func('li', arguments);
  };
  paragraph_block = function() {
    return compose_tag_func('p', arguments);
  };
  strike_through = function() {
    return compose_tag_func('s', arguments);
  };
  content_section = function() {
    return compose_tag_func('section', arguments);
  };
  inline_span = function() {
    return compose_tag_func('span', arguments);
  };
  table_header = function() {
    return compose_tag_func('th', arguments);
  };
  time_display = function() {
    return compose_tag_func('time', arguments);
  };
  table_row = function() {
    return compose_tag_func('tr', arguments);
  };
  underlined_text = function() {
    return compose_tag_func('u', arguments);
  };
  unordered_list = function() {
    return compose_tag_func('ul', arguments);
  };

  // Self-executing function to define and render templates.
  (function() {
    var render_timestamp, prefix_digit, markup_collection;

    markup_collection = {};

    // Helper to pad single-digit numbers with a leading zero.
    prefix_digit = function(input_val) {
      input_val = new String(input_val);
      if (input_val.length === 1) {
        input_val = '0' + input_val;
      }
      return input_val;
    };

    // Helper to format a Date object into HH:MM:SS string.
    render_timestamp = function(moment_data) {
      return (prefix_digit(moment_data.getHours())) + ':' + (prefix_digit(moment_data.getMinutes())) + ':' + (prefix_digit(moment_data.getSeconds()));
    };

    // --- Template Definitions ---

    markup_collection.app = function() {
      return content_section({
        "class": 'app'
      }, function() {
        division_block({
          id: 'left'
        }, function() {
          return division_block({
            "class": 'wrap',
            id: 'channel-list'
          });
        });
        return division_block({
          id: 'right'
        }, function() {
          return division_block({
            "class": 'wrap',
            id: 'channel'
          });
        });
      });
    };

    markup_collection.chat = function() {
      return content_section({
        "class": 'chat-wrap'
      }, function() {
        heading_level2(function() {
          return this.name;
        });
        unordered_list({
          "class": 'chat'
        });
        return input_form(function() {
          return user_input({
            type: 'text',
            id: 'message',
            autocomplete: 'off'
          });
        });
      });
    };

    markup_collection.message = function() {
      return list_item({
        "class": 'message'
      }, function() {
        inline_span({
          "class": 'nick'
        }, function() {
          return this.from;
        });
        inline_span({
          "class": 'timestamp'
        }, function() {
          return render_timestamp(this.received);
        });
        return this.message;
      });
    };

    markup_collection.channelList = function() {
      return content_section({
        "class": 'conversations'
      }, function() {
        heading_level2(function() {
          return 'Conversations';
        });
        return unordered_list();
      });
    };

    markup_collection.channelListChannel = function() {
      return list_item({
        "class": 'irc-channel'
      }, function() {
        inline_span({
          "class": 'name'
        }, function() {
          return this.name;
        });
        return inline_span({
          "class": 'message-count'
        });
      });
    };

    // This object appears to be a leftover or a reference that doesn't affect output.
    ({
      tagName: 'li',
      className: 'irc-channel'
    });

    // Execute the requested template if it exists.
    if (markup_collection[this.template]) {
      return markup_collection[this.template]();
    }
  }).call(output_configs.context);

  // Join all buffered parts and return the final HTML string.
  return content_store.join('');
}