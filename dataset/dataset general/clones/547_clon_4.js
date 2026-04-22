(function ($, global_window, current_document, undefined_value) {

  var PLUGIN_IDENTIFIER = "frameAdjusterMechanism";

  var instanceRegistry = new WeakMap();

  var frameDetailsRegistry = new WeakMap();

  function createDebouncer(action_function, delay_ms) {
    let timer_id;
    return function (...args_passed) {
      clearTimeout(timer_id);
      timer_id = setTimeout(() => action_function.apply(this, args_passed), delay_ms);
    };
  }

  function formatToSpecificPrecision(value_num, precision_count) {
    if (typeof value_num !== 'number' || !isFinite(value_num)) {
      return NaN;
    }
    return parseFloat(value_num.toPrecision(precision_count));
  }

  function buildControlUnit(target_dom_node, operational_params, standard_presets) {
    const current_context = {};

    const configuration_settings = $.extend({}, standard_presets, operational_params);

    const host_element = $(target_dom_node);

    function determineProportion(embedded_content) {
      const initial_span = embedded_content.attr('width');
      const initial_vertical = embedded_content.attr('height');
      if (!initial_span || !initial_vertical || parseFloat(initial_span) === 0) {
        const natural_size = embedded_content[0].getBoundingClientRect();
        return formatToSpecificPrecision((natural_size.height / natural_size.width) || (3 / 4), 4);
      }
      return formatToSpecificPrecision((parseFloat(initial_vertical) / parseFloat(initial_span)), 4);
    }

    function prepareItem(embedded_content) {
      const proportional_factor = determineProportion(embedded_content);
      const current_span = embedded_content.width();
      const current_vertical = embedded_content.height();

      frameDetailsRegistry.set(embedded_content[0], {
        proportional_factor: proportional_factor,
        original_span: current_span,
        original_vertical: current_vertical
      });
      embedded_content.addClass(configuration_settings.item_class_name);
    }

    function performItemAdjustment(embedded_content, parent_span, parent_vertical, prioritize_vertical_fit) {
      const stored_details = frameDetailsRegistry.get(embedded_content[0]);
      if (!stored_details) return;

      const aspect_value = stored_details.proportional_factor;
      let new_vertical_dimension = parent_span * aspect_value;

      if (prioritize_vertical_fit && (new_vertical_dimension > parent_vertical)) {
        embedded_content.css({
          height: parent_vertical,
          width: parent_vertical / aspect_value
        });
      } else {
        embedded_content.css({
          height: new_vertical_dimension,
          width: '100%'
        });
      }
    }

    function recalibrateAll() {
      const parent_span = host_element.width();
      const parent_vertical = host_element.height();
      const prioritize_vertical_fit = configuration_settings.prioritize_vertical_fit;

      host_element.find('iframe.' + configuration_settings.item_class_name).each(function () {
        performItemAdjustment($(this), parent_span, parent_vertical, prioritize_vertical_fit);
      });
    }

    let debouncedResizer;
    function establishListeners() {
      debouncedResizer = createDebouncer(recalibrateAll, 100);
      $(global_window).on('resize.' + PLUGIN_IDENTIFIER, debouncedResizer);
    }

    function releaseListeners() {
      $(global_window).off('resize.' + PLUGIN_IDENTIFIER);
    }

    current_context.refreshDisplay = function () {
      if (configuration_settings.setting_style === 'scale') {
        processUnscaled();
      } else {
        processUncontained();
      }
    };

    current_context.encapsulateItem = function (embedded_content) {
      const proportional_factor = determineProportion(embedded_content);
      const bottom_spacing = (proportional_factor * 100) + '%';
      const enclosing_container = $('<div/>')
        .addClass(configuration_settings.container_class_name)
        .css('padding-bottom', bottom_spacing);

      return embedded_content.wrap(enclosing_container).parent();
    };

    current_context.adjustItem = function (embedded_content) {
      prepareItem(embedded_content);
      performItemAdjustment(embedded_content, host_element.width(), host_element.height(), configuration_settings.prioritize_vertical_fit);
      return embedded_content;
    };

    current_context.removeMechanism = function () {
      if (configuration_settings.setting_style === 'scale') {
        host_element.find('iframe.' + configuration_settings.item_class_name).each(function () {
          const frame_node = this;
          const stored_details = frameDetailsRegistry.get(frame_node);
          if (stored_details) {
            $(frame_node)
              .removeClass(configuration_settings.item_class_name)
              .width(stored_details.original_span)
              .height(stored_details.original_vertical);
            frameDetailsRegistry.delete(frame_node);
          }
        });
        releaseListeners();
      } else {
        host_element.find('.' + configuration_settings.container_class_name).children().unwrap();
      }
      instanceRegistry.delete(host_element[0]);
    };

    function processUncontained() {
      const unmanaged_frames = host_element.find('iframe')
        .filter(function () {
          return !$(this).closest('.' + configuration_settings.container_class_name).length;
        });

      unmanaged_frames.each(function () {
        current_context.encapsulateItem($(this));
      });
    }

    function processUnscaled() {
      host_element.find('iframe').not('.' + configuration_settings.item_class_name).each(function () {
        prepareItem($(this));
      });
      recalibrateAll();
    }

    function startProcess() {
      if (configuration_settings.setting_style === 'scale') {
        establishListeners();
      }
      current_context.refreshDisplay();
    }

    startProcess();

    return current_context;
  }

  $.fn.frameAdjuster = function (operational_params) {
    let input_arguments = arguments;
    let function_output;

    this.each(function () {
      let control_object = instanceRegistry.get(this);

      if (control_object) {
        if (typeof (operational_params) === 'string' && operational_params[0] !== '_') {
          let invoked_action = control_object[operational_params];
          if (typeof (invoked_action) === 'function') {
            function_output = invoked_action.apply(control_object, Array.prototype.slice.call(input_arguments, 1));
          } else {
            $.error('Public action \'' + operational_params + '\' does not exist on jQuery.frameAdjuster');
          }
        }

      } else {
        instanceRegistry.set(this, buildControlUnit(this, operational_params, $.fn.frameAdjuster.standard_presets));
      }
    });

    return function_output !== undefined_value ? function_output : this;
  };

  $.fn.frameAdjuster.standard_presets = {
    container_class_name: 'content-wrapper-div',
    item_class_name: 'responsive-frame-item',
    setting_style: 'contain',
    prioritize_vertical_fit: false
  };

})(jQuery, window, document);