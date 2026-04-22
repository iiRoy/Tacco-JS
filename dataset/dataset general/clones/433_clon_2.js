/*
 * SmartSuggest: a jQuery extension, edition: 0.2 (2024-07-20)
 * @requires jQuery library v1.3 or newer
 *
 * SmartSuggest is a jQuery tool that simplifies converting a traditional HTML select element
 * into a QuickSearch-style, autocompleting, flexible matching input field.
 *
 * For detailed instructions and live demonstrations, visit:
 * https://your-project-repo/smart-suggest
 *
 * Distributed under the MIT license terms:
 * https://opensource.org/licenses/MIT
 *
 * Copyright (c) 2009, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 * (Note: Original author's copyright retained, but project name and description changed for clone.)
 */
(function(jq) {
  jq.autoSuggest = function(element, config) {
    this.setup(element, config);
  };

  jq.extend(jq.autoSuggest.prototype, {
    // Configuration options for the suggestion tool
    configuration: {
      permitDiscrepancy: false, // Allow user input that doesn't match an option
      highlightedCssClass: "smart_suggest_highlighted", // CSS class for selected item in dropdown
      suggestionBoxCssClass: "smart_suggest_dropdown", // CSS class for the suggestion box container

      // Functions to transform element IDs for generated input/dropdown
      inputIdentifierChanger: function(uniqueId) {
        return uniqueId + "_smart_input";
      },
      inputNameChanger: function(label) {
        return; // By default, no name for the text input
      },
      suggestionBoxIdentifierChanger: function(uniqueId) {
        return uniqueId + "_smart_box";
      }
    },
    sourceElement: null, // The original <select> element
    displayInput: null, // The new text input field
    valueStore: null, // Hidden input to store the actual selected value
    suggestionBox: null, // The container for suggestions
    suggestionList: null, // The <ul> element within the suggestion box
    dataStore: [], // Cached data from the original select options
    matchedItems: [], // Filtered results based on user input
    previousQuery: null, // Last search query processed
    initialInputValue: null, // Value of input when it gained focus
    currentItemIndex: 0, // Index of the currently highlighted item in matchedItems
    itemChosen: false, // Flag indicating if an item was explicitly selected
    boxHovered: false, // Flag for mouse interaction with the suggestion box (IE fix)

    // Initializes the smart suggest functionality
    setup: function(element, config) {
      jq.extend(this.configuration, config); // Merge provided config with defaults
      this.sourceElement = jq(element); // Wrap the original select element
      this.loadInitialData(); // Populate the internal data cache
      this.drawInterfaceElements(); // Create and insert new DOM elements
      this.attachEventHandlers(); // Set up all event listeners
    },

    // Extracts and stores options from the original select element
    loadInitialData: function() {
      this.dataStore = this.sourceElement.find("option").map(function() {
        // Each option becomes an object with label, value, and initial relevance
        return {
          label: jq.trim(jq(this).text()),
          val: jq(this).val(),
          relevance: 0
        };
      });
    },

    // Creates the text input, hidden field, and suggestion box
    drawInterfaceElements: function() {
      var chosenOption = this.sourceElement.find("option:selected"); // Get the initially selected option

      // Create a hidden input to preserve the original select's value
      this.valueStore = jq("<input type='hidden'/>").attr({
        uniqueId: this.sourceElement.attr("id"),
        label: this.sourceElement.attr("name")
      }).value(chosenOption.val());

      // Create the user-facing text input field
      this.displayInput = jq("<input type='text' autocomplete='off' />").attr({
        uniqueId: this.configuration.inputIdentifierChanger(this.sourceElement.attr("id")),
        label: this.configuration.inputNameChanger(this.sourceElement.attr("name")),
        accessKeyVal: this.sourceElement.attr("accesskey"),
        tabIndexVal: this.sourceElement.attr("tabindex"),
        inlineStyle: this.sourceElement.attr("style")
      }).addClass(this.sourceElement.attr("class")).value(jq.trim(chosenOption.text()));

      // Create the container for the dropdown suggestions
      this.suggestionBox = jq("<div></div>").attr({
        uniqueId: this.configuration.suggestionBoxIdentifierChanger(this.sourceElement.attr("id"))
      }).addClass(this.configuration.suggestionBoxCssClass);
      this.suggestionList = jq("<ul></ul>"); // The actual list within the dropdown
      this.suggestionBox.append(this.suggestionList); // Add list to the box

      // Insert new elements and remove the original select
      this.sourceElement.after(this.displayInput).after(this.valueStore).remove();
      jq("body").append(this.suggestionBox); // Append dropdown to body for positioning
    },

    // Binds various event listeners to the new UI elements
    attachEventHandlers: function() {
      var instanceRef = this; // Store reference to 'this' for use in callbacks

      // When the input is clicked, prepare for filtering
      this.displayInput.on("click", function() {
        instanceRef.previousQuery = null;
        instanceRef.gainFocus(); // Ensure input has focus
      });

      // Prevent text selection issues in some browsers on mouseup
      this.displayInput.on("mouseup", function(evt) {
        evt.preventDefault();
      });

      // Handle focus event for the input field
      this.displayInput.on("focus", function() {
        instanceRef.initialInputValue = instanceRef.displayInput.value(); // Store current value
        instanceRef.displayInput.select(); // Highlight all text in input
        if (!instanceRef.itemChosen) {
          instanceRef.processMatches(); // If nothing picked, show suggestions
        }
      });

      // Handle blur event for the input field
      this.displayInput.on("blur", function() {
        if (!instanceRef.boxHovered) { // If mouse not over dropdown
          instanceRef.conceal(); // Hide suggestions
          if (!instanceRef.itemChosen) {
            instanceRef.revert(); // Revert input if no item was selected
          }
        }
      });

      // Highlight item on mouseover within the suggestion list
      this.suggestionList.on("mouseover", function(evt) {
        if (evt.target.nodeName === "LI") {
          var listItems = instanceRef.suggestionBox.find("li");
          instanceRef.highlightItem(listItems.indexOf(jq(evt.target)));
        }
      });

      // Clear highlight on mouseleave from the suggestion list
      this.suggestionList.on("mouseleave", function() {
        instanceRef.highlightItem(-1);
      });

      // Select item on mouseup from the suggestion list
      this.suggestionList.on("mouseup", function(evt) {
        instanceRef.selectHighlighted(); // Pick the currently highlighted item
        instanceRef.focusAndConceal(); // Focus input and hide dropdown
      });

      // Mark dropdown as hovered when mouse enters
      this.suggestionBox.on("mouseover", function(evt) {
        instanceRef.boxHovered = true;
      });

      // Mark dropdown as not hovered when mouse leaves
      this.suggestionBox.on("mouseleave", function(evt) {
        instanceRef.boxHovered = false;
      });

      // Prevent input blur when clicking dropdown in some browsers
      this.suggestionBox.on("mousedown", function(evt) {
        evt.preventDefault();
      });


      // Handle key up events for filtering and selection
      this.displayInput.on("keyup", function(evt) {
        switch (evt.keyCode) {
          case 13: // Enter key
            evt.preventDefault();
            instanceRef.selectHighlighted(); // Confirm selection
            instanceRef.focusAndConceal(); // Re-focus input and hide
            break;
          case 27: // Escape key
            evt.preventDefault();
            instanceRef.revert(); // Discard changes
            instanceRef.focusAndConceal(); // Re-focus input and hide
            break;
          default:
            instanceRef.processMatches(); // Filter results based on input
            break;
        }
      });

      // Handle key down events for navigation
      this.displayInput.on("keydown", function(evt) {
        switch (evt.keyCode) {
          case 9: // Tab key
            instanceRef.selectHighlighted(); // Select current item before tabbing away
            instanceRef.conceal(); // Hide suggestions
            break;
          case 33: // Page Up
            evt.preventDefault();
            instanceRef.highlightFirst(); // Move highlight to the first item
            break;
          case 34: // Page Down
            evt.preventDefault();
            instanceRef.highlightLast(); // Move highlight to the last item
            break;
          case 38: // Up arrow
            evt.preventDefault();
            instanceRef.shiftHighlight(-1); // Move highlight up
            break;
          case 40: // Down arrow
            evt.preventDefault();
            instanceRef.shiftHighlight(1); // Move highlight down
            break;
          case 13: // Enter key
          case 27: // Escape key
            evt.preventDefault(); // Prevent default browser actions
            evt.stopPropagation(); // Stop event propagation
            break;
        }
      });
    },

    // Filters and scores items based on the current input value
    processMatches: function() {
      var currentQuery = this.displayInput.value(); // Get current input text
      if (currentQuery === this.previousQuery) {
        return; // No change in query, no need to re-filter
      }

      var matchedItems = []; // Array to hold items that match
      jq.each(this.dataStore, function() {
        // Calculate relevance using LiquidMetal-like scoring (assumes global TextMatcher)
        this.relevance = TextMatcher.calculateScore(this.label, currentQuery);
        if (this.relevance > 0) {
          matchedItems.push(this); // Add to matched items if score is positive
        }
      });
      this.matchedItems = matchedItems; // Update the list of matched items

      this.orderMatches(); // Sort the matched items by relevance
      this.displaySuggestionBox(); // Render the dropdown with new items
      this.highlightFirst(); // Highlight the first item by default
      this.previousQuery = currentQuery; // Store current query as previous
      this.itemChosen = false; // Reset item chosen flag
    },

    // Sorts the matched items by their relevance score in descending order
    orderMatches: function() {
      this.matchedItems.sort(function(a, b) {
        return b.relevance - a.relevance;
      });
    },

    // Positions and displays the suggestion dropdown box
    displaySuggestionBox: function() {
      var boxFrameWidth = this.suggestionBox.outerWidth() - this.suggestionBox.innerWidth(); // Calculate border/padding width
      var inputPosition = this.displayInput.offset(); // Get position of the input field

      // Set position and width of the suggestion box
      this.suggestionBox.css({
        width: (this.displayInput.outerWidth() - boxFrameWidth) + "px",
        top: (inputPosition.top + this.displayInput.outerHeight()) + "px",
        left: inputPosition.left + "px"
      });

      var optionList = this.suggestionList.html(""); // Clear and get a reference to the list
      jq.each(this.matchedItems, function() {
        // Append each matched item as a list item
        optionList.append(jq("<li/>").html(this.label));
      });
      this.suggestionBox.show(); // Make the suggestion box visible
    },

    // Highlights a specific item in the suggestion list by index
    highlightItem: function(itemIndex) {
      if (itemIndex > this.matchedItems.length) {
        return; // Index out of bounds
      }

      var listItems = this.suggestionBox.find("li"); // Get all list items
      listItems.removeClass(this.configuration.highlightedCssClass); // Remove highlight from all
      this.currentItemIndex = itemIndex; // Update the current highlighted index

      if (itemIndex >= 0) {
        jq(listItems[itemIndex]).addClass(this.configuration.highlightedCssClass); // Add highlight to the specified item
      }
    },

    // Selects the currently highlighted item and updates input fields
    selectHighlighted: function() {
      var chosenEntry = this.matchedItems[this.currentItemIndex]; // Get the data for the highlighted item
      if (chosenEntry) {
        this.displayInput.value(chosenEntry.label); // Set input text to item's label
        this.valueStore.value(chosenEntry.val); // Set hidden value to item's value
        this.itemChosen = true; // Mark an item as chosen
      } else if (this.configuration.permitDiscrepancy) {
        this.valueStore.value(""); // Clear hidden value if mismatch allowed
      } else {
        this.revert(); // If mismatch not allowed, revert to original state
      }
    },

    // Hides the suggestion dropdown box
    conceal: function() {
      this.suggestionBox.hide(); // Hide the dropdown
      this.previousQuery = null; // Clear last query
    },

    // Moves the highlight up or down in the list
    shiftHighlight: function(direction) {
      this.highlightItem(this.currentItemIndex + direction);
    },

    // Highlights the first item in the list
    highlightFirst: function() {
      this.highlightItem(0);
    },

    // Highlights the last item in the list
    highlightLast: function() {
      this.highlightItem(this.matchedItems.length - 1);
    },

    // Reverts the input field to its state before focus
    revert: function() {
      this.displayInput.value(this.initialInputValue);
    },

    // Sets focus on the input field
    gainFocus: function() {
      this.displayInput.focus();
    },

    // Sets focus on the input field and hides the suggestion box
    focusAndConceal: function() {
      this.gainFocus();
      this.conceal();
    }
  });

  // jQuery plugin initializer for smartSuggest
  jq.fn.smartSuggest = function(config) {
    this.each(function() {
      // Only apply to <select> elements
      if (this.nodeName === "SELECT") {
        new jq.autoSuggest(this, config);
      }
    });
    return this; // Allow chaining
  };
})(jQuery);