!function ($) {
  /*
   * This is a Type I clone of the original Selectpicker JavaScript code.
   * All functional aspects, variable names, and logic remain identical.
   * Only whitespace and comments have been extensively altered.
   */

  var Selectpicker = function (element, options, e) {
    // Check if an event object 'e' was passed
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
      e.preventDefault();  // Stop default action
    }

    this.$element = $(element); // Store the jQuery wrapped element
    this.$newElement = null;   // Placeholder for the new custom select element
    this.button = null;        // Placeholder for the custom select button

    // Merge default options, user-provided options, and data-attributes.
    // The order ensures data-attributes override defaults, and user options override data-attributes.
    this.options = $.extend(
      {},
      $.fn.selectpicker.defaults,
      this.$element.data(),
      typeof options == 'object' && options // Only merge if options is a valid object
    );

    // If 'title' option is still null, try to get it from the element's 'title' attribute.
    // jQuery's .data() method doesn't pick up 'title' as a data-attribute by default.
    if (this.options.title == null) {
      this.options.title = this.$element.attr('title');
    }

    // Expose public methods for external access.
    this.val    = Selectpicker.prototype.val;
    this.render = Selectpicker.prototype.render;

    // Initialize the selectpicker instance.
    this.init();
  };

  Selectpicker.prototype = {

    constructor: Selectpicker, // Explicitly set the constructor property

    // Initialization method for the selectpicker instance
    init: function (e) {
      var _this = this; // Cache 'this' for use in inner functions/scopes.

      this.$element.hide(); // Hide the original <select> element.
      this.multiple = this.$element.prop('multiple'); // Check if it's a multiple-select.


      var classList = this.$element.attr('class') !== undefined ? this.$element.attr('class').split(/\s+/) : '';
      var id = this.$element.attr('id'); // Get the ID of the original select.

      this.$element.after(this.createView()); // Insert the custom view after the original select.
      this.$newElement = this.$element.next('.select'); // Reference to the newly created custom select wrapper.

      var select = this.$newElement; // Shorter alias for the new element.
      var menu = this.$newElement.find('.dropdown-menu'); // The dropdown menu part.
      var menuArrow = this.$newElement.find('.dropdown-arrow'); // The dropdown arrow element.
      var menuA = menu.find('li > a'); // All anchor elements within the dropdown menu list items.

      // Calculate liHeight by temporarily adding 'open' class to get correct dimensions.
      var liHeight = select.addClass('open').find('.dropdown-menu li > a').outerHeight();
      select.removeClass('open'); // Remove 'open' class after calculation.

      var divHeight = menu.find('li .divider').outerHeight(true); // Height of a divider.
      var selectOffset_top = this.$newElement.offset().top; // Top offset of the new element.

      var size = 0; // Unused variable, potentially for future use or refactoring.
      var menuHeight = 0; // Variable to store calculated menu height.
      var selectHeight = this.$newElement.outerHeight(); // Total height of the custom select.

      this.button = this.$newElement.find('> button'); // The main button of the custom select.

      // If the original select had an ID, transfer it to the custom button and link labels.
      if (id !== undefined) {
        this.button.attr('id', id);
        $('label[for="' + id + '"]').click(function () {
          select.find('button#' + id).focus();
        });
      }

      // Copy classes from the original select element to the new custom element,
      // excluding 'selectpicker' itself.
      for (var i = 0; i < classList.length; i++) {
        if (classList[i] != 'selectpicker') {
          this.$newElement.addClass(classList[i]);
        }
      }

      // If it's a multiple select, add a specific class for styling.
      if (this.multiple) {
        this.$newElement.addClass('select-multiple');
      }

      // Apply custom styles from options to the button and menu.
      this.button.addClass(this.options.style);
      menu.addClass(this.options.menuStyle);

      // Apply arrow specific class based on menuStyle.
      menuArrow.addClass(function () {
        if (_this.options.menuStyle) {
          return _this.options.menuStyle.replace('dropdown-', 'dropdown-arrow-');
        }
      });

      this.checkDisabled(); // Check and apply disabled state.
      this.checkTabIndex(); // Transfer tabindex attribute if present.
      this.clickListener(); // Set up event listeners for clicks.

      // Calculate menu padding for height adjustments.
      var menuPadding = parseInt(menu.css('padding-top')) + parseInt(menu.css('padding-bottom')) + parseInt(menu.css('border-top-width')) + parseInt(menu.css('border-bottom-width'));

      // Handle 'auto' size option to adjust menu height dynamically.
      if (this.options.size == 'auto') {
        function getSize() {
          var selectOffset_top_scroll = selectOffset_top - $(window).scrollTop(); // Top offset relative to current scroll.
          var windowHeight = $(window).innerHeight; // Window inner height.
          var menuExtras = menuPadding + parseInt(menu.css('margin-top')) + parseInt(menu.css('margin-bottom')) + 2; // Total vertical space taken by menu extras.
          var selectOffset_bot = windowHeight - selectOffset_top_scroll - selectHeight - menuExtras; // Space available below the select.

          menuHeight = selectOffset_bot; // Default menu height.

          // If select is in 'dropup' mode, calculate height based on space above.
          if (select.hasClass('dropup')) {
            menuHeight = selectOffset_top_scroll - menuExtras;
          }

          // Apply calculated max-height, overflow, and min-height.
          menu.css({
            'max-height': menuHeight + 'px',
            'overflow-y': 'auto',
            'min-height': liHeight * 3 + 'px'
          });
        }
        getSize(); // Call once on init.
        $(window).resize(getSize); // Recalculate on window resize.
        $(window).scroll(getSize); // Recalculate on window scroll.
        this.$element.bind('DOMNodeInserted', getSize); // Recalculate if DOM changes.
      }
      // Handle fixed size option if number of items exceeds specified size.
      else if (this.options.size && this.options.size != 'auto' && menu.find('li').length > this.options.size) {
        // Find the index of the last visible item based on 'size' option.
        var optIndex = menu.find("li > *").filter(':not(.divider)').slice(0, this.options.size).last().parent().index();
        // Count dividers within the visible range.
        var divLength = menu.find("li").slice(0, optIndex + 1).find('.divider').length;
        // Calculate total menu height.
        menuHeight = liHeight * this.options.size + divLength * divHeight + menuPadding;
        // Apply max-height and overflow.
        menu.css({
          'max-height': menuHeight + 'px',
          'overflow-y': 'scroll'
        });
      }

      // Listen for DOM changes in the original select element and reload the list.
      this.$element.bind('DOMNodeInserted', $.proxy(this.reloadLi, this));

      // Render the initial state of the custom select.
      this.render();
    },

    // Creates the basic dropdown structure (button, arrow, empty ul).
    createDropdown: function () {
      var drop =
        "<div class='btn-group select'>" +
        "<button class='btn dropdown-toggle clearfix' data-toggle='dropdown'>" +
        "<span class='filter-option pull-left'></span>&nbsp;" +
        "<span class='caret'></span>" +
        "</button>" +
        "<span class='dropdown-arrow'></span>" +
        "<ul class='dropdown-menu' role='menu'>" +
        "</ul>" +
        "</div>";

      return $(drop); // Return the jQuery object of the created dropdown.
    },


    // Creates the full custom select view by combining dropdown and list items.
    createView: function () {
      var $drop = this.createDropdown(); // Get the dropdown structure.
      var $li = this.createLi();       // Get the list items.
      $drop.find('ul').append($li);     // Append list items to the dropdown's ul.
      return $drop;                   // Return the complete view.
    },

    // Reloads the list items (li) based on the current state of the original select.
    reloadLi: function () {
      this.destroyLi(); // Remove all existing list items.
      var $li = this.createLi(); // Re-create new list items.
      this.$newElement.find('ul').append($li); // Append the new items.
      this.render(); // Re-render the view to reflect changes.
    },

    // Removes all list items from the custom select's dropdown menu.
    destroyLi: function () {
      this.$newElement.find('li').remove();
    },

    // Creates the list items (li) for the custom select's dropdown menu.
    createLi: function () {

      var _this = this; // Cache 'this'.
      var _li = [];     // Array to temporarily store option texts.
      var _liA = [];    // Array to store generated <a> or divider/dt HTML.
      var _liHtml = ''; // String to build the final list item HTML.

      // Populate _li with texts from original options.
      this.$element.find('option').each(function () {
        _li.push($(this).text());
      });

      // Iterate through each original <option> to build corresponding <li> HTML.
      this.$element.find('option').each(function (index) {
        var optionClass = $(this).attr("class") !== undefined ? $(this).attr("class") : ''; // Get option's class.
        var text = $(this).text(); // Get option's text.
        // Get subtext if available, format it as small muted text.
        var subtext = $(this).data('subtext') !== undefined ? '<small class="muted">' + $(this).data('subtext') + '</small>' : '';

        text += subtext; // Append subtext to main text.

        // Handle optgroup elements.
        if ($(this).parent().is('optgroup') && $(this).data('divider') != true) {
          if ($(this).index() == 0) { // If it's the first option in an optgroup.
            var label = $(this).parent().attr('label'); // Get optgroup label.
            // Get optgroup subtext.
            var labelSubtext = $(this).parent().data('subtext') !== undefined ? '<small class="muted">' + $(this).parent().data('subtext') + '</small>' : '';
            label += labelSubtext; // Append subtext to label.

            if ($(this)[0].index != 0) { // If this is not the very first option in the whole select.
              _liA.push( // Add a divider, then the optgroup label, then the option.
                '<div class="divider"></div>' +
                '<dt>' + label + '</dt>' +
                _this.createA(text, "opt " + optionClass)
              );
            } else {
              _liA.push( // Otherwise, just the label and the option.
                '<dt>' + label + '</dt>' +
                _this.createA(text, "opt " + optionClass));
            }
          } else { // Not the first option in an optgroup, just add the option.
            _liA.push(_this.createA(text, "opt " + optionClass));
          }
        }
        // Handle explicit dividers.
        else if ($(this).data('divider') == true) {
          _liA.push('<div class="divider"></div>');
        }
        // Handle hidden options.
        else if ($(this).data('hidden') == true) {
          _liA.push(''); // Add an empty string, effectively skipping this item.
        }
        // Default case: regular option.
        else {
          _liA.push(_this.createA(text, optionClass));
        }
      });

      // Assemble the final HTML string for list items.
      if (_li.length > 0) {
        for (var i = 0; i < _li.length; i++) {
          var $option = this.$element.find('option').eq(i); // Reference to the original option.
          _liHtml += "<li rel=" + i + ">" + _liA[i] + "</li>"; // Build <li> with generated <a>/divider/dt.
        }
      }

      // If no option is selected and no title is set, select the first option by default.
      if (this.$element.find('option:selected').length == 0 && !_this.options.title) {
        this.$element.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
      }

      return $(_liHtml); // Return jQuery object of the generated HTML.
    },

    // Creates the anchor (<a>) element for a list item.
    createA: function (test, classes) {
      return '<a tabindex="-1" href="#" class="' + classes + '">' +
        '<span class="pull-left">' + test + '</span>' +
        '</a>';
    },

    // Renders/updates the visual state of the custom select.
    render: function () {
      var _this = this; // Cache 'this'.

      // Set width of the custom select based on options.
      if (this.options.width == 'auto') {
        var ulWidth = this.$newElement.find('.dropdown-menu').css('width');
        this.$newElement.css('width', ulWidth);
      } else if (this.options.width && this.options.width != 'auto') {
        this.$newElement.css('width', this.options.width);
      }

      // Update the LI elements to match the SELECT's disabled/selected states.
      this.$element.find('option').each(function (index) {
        // Check if the option or its parent optgroup is disabled.
        _this.setDisabled(index, $(this).is(':disabled') || $(this).parent().is(':disabled'));
        // Check if the option is selected.
        _this.setSelected(index, $(this).is(':selected'));
      });

      // Get an array of selected item texts (or titles if available).
      var selectedItems = this.$element.find('option:selected').map(function (index, value) {
        if ($(this).attr('title') != undefined) {
          return $(this).attr('title');
        } else {
          return $(this).text();
        }
      }).toArray();

      // Convert selected items into a comma-delimited string for display.
      var title = selectedItems.join(", ");

      // If multiple select and 'selectedTextFormat' is 'count', display count.
      if (_this.multiple && _this.options.selectedTextFormat.indexOf('count') > -1) {
        var max = _this.options.selectedTextFormat.split(">");
        // Check if count exceeds threshold for displaying "X of Y selected".
        if ((max.length > 1 && selectedItems.length > max[1]) || (max.length == 1 && selectedItems.length >= 2)) {
          title = selectedItems.length + ' of ' + this.$element.find('option').length + ' selected';
        }
      }

      // If no title is determined, use the custom title or 'noneSelectedText'.
      if (!title) {
        title = _this.options.title != undefined ? _this.options.title : _this.options.noneSelectedText;
      }

      // Update the text displayed in the custom select button.
      this.$element.next('.select').find('.filter-option').html(title);
    },

    // Sets the 'selected' class on the corresponding list item.
    setSelected: function (index, selected) {
      if (selected) {
        this.$newElement.find('li').eq(index).addClass('selected');
      } else {
        this.$newElement.find('li').eq(index).removeClass('selected');
      }
    },

    // Sets the 'disabled' class on the corresponding list item.
    setDisabled: function (index, disabled) {
      if (disabled) {
        this.$newElement.find('li').eq(index).addClass('disabled');
      } else {
        this.$newElement.find('li').eq(index).removeClass('disabled');
      }
    },

    // Checks if the original select is disabled and updates the custom button.
    checkDisabled: function () {
      if (this.$element.is(':disabled')) {
        this.button.addClass('disabled');
        // Prevent clicks on the disabled button.
        this.button.click(function (e) {
          e.preventDefault();
        });
      }
    },

    // Transfers the tabindex attribute from the original select to the custom button.
    checkTabIndex: function () {
      if (this.$element.is('[tabindex]')) {
        var tabindex = this.$element.attr("tabindex");
        this.button.attr('tabindex', tabindex);
      }
    },

    // Sets up all click and change event listeners.
    clickListener: function () {
      var _this = this; // Cache 'this'.

      // Prevent dropdown menu from closing on touch devices when touching inside it.
      $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
        e.stopPropagation();
      });

      // Event listener for clicks on list item anchors.
      this.$newElement.on('click', 'li a', function (e) {
        var clickedIndex = $(this).parent().index(), // Index of the clicked list item.
          $this = $(this).parent(), // The clicked <li> element.
          $select = $this.parents('.select'); // The custom select wrapper.

        // If it's a multiple select, prevent the dropdown from closing immediately.
        if (_this.multiple) {
          e.stopPropagation();
        }

        e.preventDefault(); // Prevent default anchor link behavior.

        // Only proceed if the original select is not disabled and the clicked item is not disabled.
        if ($select.prev('select').not(':disabled') && !$(this).parent().hasClass('disabled')) {
          // If not a multiple select, deselect all other options.
          if (!_this.multiple) {
            $select.prev('select').find('option').removeAttr('selected');
            $select.prev('select').find('option').eq(clickedIndex).prop('selected', true).attr('selected', 'selected');
          }
          // If multiple select, toggle the selected state of the clicked option.
          else {
            var selected = $select.prev('select').find('option').eq(clickedIndex).prop('selected');

            if (selected) {
              $select.prev('select').find('option').eq(clickedIndex).removeAttr('selected');
            } else {
              $select.prev('select').find('option').eq(clickedIndex).prop('selected', true).attr('selected', 'selected');
            }
          }


          $select.find('.filter-option').html($this.text()); // Update button text.
          $select.find('button').focus(); // Focus the button.

          // Trigger the 'change' event on the original <select> element.
          $select.prev('select').trigger('change');
        }

      });

      // Prevent clicks on disabled items, optgroup labels, and dividers from doing anything.
      this.$newElement.on('click', 'li.disabled a, li dt, li .divider', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $select = $(this).parent().parents('.select'); // Get the parent custom select.
        $select.find('button').focus(); // Focus the button.
      });

      // Listen for 'change' events on the original select and re-render.
      this.$element.on('change', function (e) {
        _this.render();
      });
    },

    // Public method to get or set the value of the selectpicker.
    val: function (value) {

      if (value != undefined) {
        this.$element.val(value); // Set the value of the original select.

        this.$element.trigger('change'); // Trigger change event.
        return this.$element; // Return the jQuery object of the original select.
      } else {
        return this.$element.val(); // Return the current value of the original select.
      }
    }

  };

  // jQuery plugin definition.
  $.fn.selectpicker = function (option, event) {
    var args = arguments; // Store all arguments.
    var value;         // Variable to store return value of methods.
    var property;      // Property name for method calls.

    // Iterate over each matched element.
    var chain = this.each(function () {
      var $this = $(this),
        data = $this.data('selectpicker'), // Get existing selectpicker instance data.
        options = typeof option == 'object' && option; // User-provided options.

      if (!data) {
        // If no instance exists, create a new one.
        $this.data('selectpicker', (data = new Selectpicker(this, options, event)));
      } else {
        // If instance exists, and option is an object, update properties (this looks like a bug, usually options are passed to constructor or specific methods are called)
        for (var i in option) {
          data[i] = option[i];
        }
      }

      // If option is a string, it's a method call.
      if (typeof option == 'string') {
        property = option; // Store the method name.
        if (data[property] instanceof Function) {
          [].shift.apply(args); // Remove the method name from args.
          value = data[property].apply(data, args); // Call the method.
        } else {
          value = data[property]; // Access a property.
        }
      }
    });

    // If a value was returned by a method call, return it.
    if (value != undefined) {
      return value;
    } else {
      return chain; // Otherwise, return the jQuery chain for method chaining.
    }
  };

  // Default options for the selectpicker plugin.
  $.fn.selectpicker.defaults = {
    style: null,           // Custom CSS class for the button.
    size: 'auto',          // Number of items to show, or 'auto'.
    title: null,           // Placeholder text if nothing is selected.
    selectedTextFormat: 'values', // Format for displaying selected items ('values' or 'count').
    noneSelectedText: 'Nothing selected', // Text when no items are selected.
    width: null,           // Custom width for the selectpicker.
    menuStyle: null,       // Custom CSS class for the dropdown menu.
    toggleSize: null       // Unused, possibly for a feature like 'show-menu-up'.
  }

}(window.jQuery); // Pass window.jQuery to the IIFE.