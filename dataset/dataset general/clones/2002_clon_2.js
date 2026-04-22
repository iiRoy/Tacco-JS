/*
 *!========================================================================
 * groupdisplay.js v1.1.2
 * https://myproject.github.io/groupdisplay.js
 * ========================================================================
 * Copyright 2024 New Author
 * Licensed under AnotherLicense (https://myproject.github.io/groupdisplay.js/blob/master/LICENSE)
 * ========================================================================
 */


+function (jQ) {
  "use strict";

  // CLASS DEFINITION FOR ITEM COLLECTION
  // ===================================
  var ItemCollection = function (domElement, settings) {
    this.$container = jQ(domElement);
    this.config = settings || {};
    this.setup();
  };

  ItemCollection.prototype.setup = function() {
    var selfRef = this;
    var $container = this.$container;
    var config = this.config;

    // Apply selection mode if specified in configuration
    if (config.selectionMode)
      $container.attr('data-selection-mode', config.selectionMode);

    // Attach click handler to individual items within the group
    $container.on('click', '.element-group-entry', function () {
      var $clickedEntry = jQ(this);

      // Proceed only if the item is not marked as inactive
      if (!$clickedEntry.hasClass('non-interactable')) {

        // Determine behavior based on selection mode
        if ($container.data('selection-mode') == 'multiple')
          $clickedEntry.toggleClass('selected'); // Toggle selection for multiple items
        else
          selfRef.deactivate('*') // Deselect all other items
                 .activate($clickedEntry); // Select the current item

        // Execute custom click callback if provided
        if (config.itemActivatedCallback)
          config.itemActivatedCallback.apply(this);
      }

      $clickedEntry.blur(); // Remove focus from the clicked item
      return false; // Prevent default link behavior
    });
  };

  // Method to activate (select) items
  ItemCollection.prototype.activate = function (targetItem) {
    // If a jQuery object is passed, add 'selected' class directly
    if (targetItem instanceof jQ)
      targetItem.addClass('selected');

    // If a single string value is passed, convert to array
    if (typeof targetItem === 'string')
      targetItem = [targetItem];

    // If an array of values is passed, find corresponding items and select them
    if (Array.isArray(targetItem)) {
      for (var k in targetItem) {
        var entryValue = targetItem[k];
        this.$container
          .find('.element-group-entry[data-val=\'' + entryValue + '\']')
          .addClass('selected');
      }
    }
    return this; // Allow method chaining
  };

  // Method to deactivate (deselect) items
  ItemCollection.prototype.deactivate = function (deselectionFilter) {
    this.$container
      .find('.element-group-entry') // Find all selectable entries
      .filter(deselectionFilter || '*') // Filter by provided selector or all
      .removeClass('selected'); // Remove the 'selected' class
    return this; // Allow method chaining
  };


  // CLASS DEFINITION FOR DROPDOWN WRAPPER
  // =====================================
  var DropdownWrapper = function(inputElement, configuration) {
    this.$sourceInput = jQ(inputElement);
    this.configuration = configuration;
    this.$associatedGroup = this.generateAssociatedGroup(); // Create the visual group from the input
  };

  // Method to synchronize selection from external values to the source input
  DropdownWrapper.prototype.updateSourceSelection = function (inputValues) {
    // If jQuery objects are provided, extract their values
    if (inputValues instanceof jQ) {
      var extractedValues = [];
      inputValues.each(function(idx, currentElement) {
        extractedValues.push(jQ(currentElement).val());
      });
      inputValues = extractedValues;
    }

    this.$sourceInput.val(inputValues) // Set the value of the source input
                     .trigger('change'); // Trigger change event
  };

  // Method to remove specific values from the source input's selection
  DropdownWrapper.prototype.removeSourceSelection = function(valuesToRemove) {
    var currentInputVal = this.$sourceInput.val();

    // Ensure current and removal values are arrays for consistent processing
    if (!Array.isArray(currentInputVal)) currentInputVal = [currentInputVal];
    if (!Array.isArray(valuesToRemove)) valuesToRemove = [valuesToRemove];

    // This part of the original code has a logical flaw: Array.pop() removes the last element and does not take arguments.
    // It seems to intend to remove specific values. Replicating the *exact* original behavior (bug included).
    for (var m in valuesToRemove)
      currentInputVal.pop(valuesToRemove[m]); // This will just call pop() multiple times, removing the last item each time.

    this.$sourceInput.val(currentInputVal) // Update the input with modified values
                     .trigger('change'); // Trigger change event
  };

  // Method to construct the visual group based on the select input's options
  DropdownWrapper.prototype.generateAssociatedGroup = function() {
    var $sourceDropdown = this.$sourceInput;

    var $displayGroup = jQ('<ul>').addClass('element-group'); // Create the main group container

    // If the source select is multiple, set the group's selection mode
    if ($sourceDropdown.attr('multiple'))
      $displayGroup.attr('data-selection-mode', 'multiple');

    // Iterate through each option in the source select to create corresponding group entries
    $sourceDropdown.find('option').each(function (idx, optionElement) {
      var $currentOption = jQ(optionElement);
      
      // Create a new link element for the group entry
      var $newEntry = jQ('<a>')
                      .attr('href', '#') // Standard href for clickable items
                      .addClass('element-group-entry') // Class for styling
                      .attr('data-val', $currentOption.val()) // Store the option's value
                      .text($currentOption.text()); // Display the option's text

      // Add 'non-interactable' class if the option is disabled
      if ($currentOption.is(':disabled'))
        $newEntry.addClass('non-interactable');

      // Add 'concealed' class if the option is hidden
      if ($currentOption.css('display') === 'none')
        $newEntry.addClass('concealed');

      $displayGroup.append($newEntry); // Add the new entry to the display group
    });

    // Attach change listener to the source dropdown
    $sourceDropdown.on('change', function () {
      $displayGroup.itemgroup({
        deactivate: '*', // Deselect all items in the group
        activate: $sourceDropdown.val() // Select items corresponding to the dropdown's current value
      });
    });

    // Initialize the display group with current selection and click handler
    $displayGroup.itemgroup({
      activate: $sourceDropdown.val(), // Initial selection based on dropdown's value
      itemActivatedCallback: function () {
        var selectedDataValues = [];
        // Collect data-val of all currently selected items in the group
        $displayGroup.find('.element-group-entry.selected').each(function(idx, listItem) {
          var entryDataValue = jQ(listItem).data('val');
          selectedDataValues.push(entryDataValue);
        });
        // Adjust format for single selection (not array) if only one item is selected
        if (selectedDataValues.length === 1) selectedDataValues = selectedDataValues[0];
        $sourceDropdown.val(selectedDataValues); // Update the source dropdown's value
      }
    });
    $sourceDropdown.before($displayGroup); // Insert the display group before the source dropdown
    this.$associatedGroup = $displayGroup; // Store reference to the generated group

    $sourceDropdown.hide(); // Hide the original select input

    return $displayGroup; // Return the generated group element
  };

  
  // JQUERY PLUGIN DEFINITION FOR ITEMGROUP
  // ======================================
  jQ.fn.itemgroup = function (pluginSetting) {
    return this.each(function (indexVal, currentElement) {
      var $currentTarget = jQ(currentElement);

      var groupInstance = $currentTarget.data('itemgroup');
      // Initialize a new instance if one doesn't exist
      if (!groupInstance)
        $currentTarget.data('itemgroup', (groupInstance = $currentTarget.is('select')
          ? new DropdownWrapper(currentElement, pluginSetting) // For select elements
          : new ItemCollection(currentElement, pluginSetting))); // For other elements

      // Apply settings if provided
      if (pluginSetting) {

        // Handle deselection requests
        if (pluginSetting.deactivate)
          groupInstance.deactivate(pluginSetting.deactivate);

        // Handle selection requests
        if (pluginSetting.activate)
          groupInstance.activate(pluginSetting.activate);
      }
    });
  };

  // Auto-initialize item groups on page load
  jQ(function () {
    jQ('.element-group').itemgroup();
  });
}(jQuery);