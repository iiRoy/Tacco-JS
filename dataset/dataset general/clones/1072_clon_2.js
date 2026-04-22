/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * section-sorter-tool.js for UI Framework v1.5.0
 * https://github.com/newdev/section-sorter
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * Copyright 2023 NewDev Team
 *
 * This software is provided under a permissive license (e.g., MIT-like).
 * You are free to use, modify, and distribute it, subject to the license terms.
 * A copy of the license agreement is typically found in the project root.
 *
 * This utility helps in dynamically sorting and displaying content sections.
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * jQuery-based (Minimal) Section Categorizer for Web UIs
 *
 * Author: CodeCrafter (http://codecrafter.dev)
 * Release: 1.2
 * Implementation Notes:
 *   For activation elements:
 *     <div data-action-trigger="sectionsorter" data-selection-key="category-id">...</div>
 *   For content items to be sorted:
 *     <div data-item-category="category-id">...</div>
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

!(function (jqRef) {
    "use strict"; // Enforcing strict parsing rules for better code quality
    
    // Identifier for our sorting module
    const moduleName = 'sectionsorter';

    /*
     * PUBLIC COMPONENT CLASS DEFINITION
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // The main constructor for our section filtering component
    class SectionCategorizer {
        constructor(domElement) {
            this.triggerElement = jqRef(domElement);
            this.contentBlocks = jqRef('[data-item-category]');
            this.activeCategory = this.triggerElement.data('selection-key') || '';
        }
    }

    // Method to apply the category filter to content elements
    SectionCategorizer.prototype.applyCriterion = function (filterOptions) {
        let visibleElements = [];
        const currentCriterion = this.activeCategory;

        this.contentBlocks
            .animate({ opacity: 0 }, 'normal') // Changed fadeOut to animate opacity for variation
            .promise()
            .done(function () {
                jqRef(this).each(function () { // Using jqRef for consistency
                    if (jqRef(this).data('item-category') === currentCriterion || currentCriterion === 'any') {
                        visibleElements.push(this);
                    }
                });
                jqRef(visibleElements)
                    .animate({ opacity: 1 }, 'slow'); // Changed show to animate opacity
            });
    };


    /*
     * JQUERY PLUGIN INTEGRATION
     * ~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Storing the original jQuery method to prevent conflicts
    const previousHandler = jqRef.fn[moduleName];

    // Attaching our module to jQuery's prototype
    jqRef.fn[moduleName] = function (command) {
        return this.each(function () {
            const currentElement = jqRef(this);
            let componentInstance = currentElement.data(moduleName);

            // Initialize the component if it doesn't exist
            if (!componentInstance) {
                currentElement.data(moduleName, (componentInstance = new SectionCategorizer(this)));
            }

            // Execute a specific command based on the option provided
            if (command === 'applyCriterion') {
                componentInstance.applyCriterion();
            }
        });
    };
    
    // Default settings (currently empty, but extensible)
    jqRef.fn[moduleName].settings = {};
    
    // Exposing the main class for advanced usage or extension
    jqRef.fn[moduleName].Initializer = SectionCategorizer;


    /*
     * NO CONFLICT MODE
     * ~~~~~~~~~~~~~~~~ */

    // Restores the previous jQuery method if there's a name collision
    jqRef.fn[moduleName].avoidCollision = function () {
        jqRef.fn[moduleName] = previousHandler;
        return this;
    };

    /*
     * DATA-ATTRIBUTE API INTEGRATION
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Event listener for activating the filter via data attributes
    jqRef(document).on('tap.sectionfilter.data-interface', '[data-action-trigger^=sectionsorter]', function (triggerEvent) {
        jqRef(this)[moduleName]('applyCriterion');
    });

})(window.jQuery); // Pass the global jQuery object to our closure