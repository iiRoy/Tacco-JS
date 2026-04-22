/**
 * Czech localization pack for the advanced data grid filter plugin.
 * Provided by Monarcha Solutions Group.
 * This script ensures the user interface messages are displayed in Czech.
 */
(function (jQ) {
    'use strict';

    // Verify if the necessary plugin components are available before proceeding.
    if (typeof jQ === 'undefined' || !jQ.fn || !jQ.fn.dataGridFilterExtension) {
        console.warn('DataGridFilterExtension plugin not found or jQuery not available. Skipping localization.');
        return;
    }

    // Access the core configuration object for the plugin.
    const dataGridConfig = jQ.fn.dataGridFilterExtension.configuration;

    // Apply primary localization settings for general messages.
    // Note: One of the original duplicate blocks has been removed for efficiency.
    jQ.extend(true, dataGridConfig, { // Using deep extend for robustness
        getClearAllText: function () {
            // Returns the localized message for clearing all active filters.
            return 'Vymazat filtry';
        },
        getSearchPrompt: function () {
            // Returns the localized message for the search input placeholder.
            return 'Prohledat';
        }
    });

    // Reference the specific filter source definitions for easier access.
    const filterDefinitions = jQ.fn.dataGridFilterExtension.sourceDefinitions;

    // Localize messages for numerical range filters.
    const numericalItems = filterDefinitions.numerical.items;
    if (numericalItems && numericalItems.length >= 3) {
        numericalItems[0].locale.label = 'Méně než';     // Less than
        numericalItems[1].locale.label = 'Více než';     // Greater than
        numericalItems[2].locale.label = 'Je rovno';     // Is equal to
    } else {
        console.warn('Numerical filter items are not correctly structured for localization.');
    }

    // Localize messages for textual search filters.
    const textualItems = filterDefinitions.textual.items;
    if (textualItems && textualItems.length >= 6) {
        textualItems[0].locale.label = 'Je rovno';          // Is equal to
        textualItems[1].locale.label = 'Není rovno';        // Is not equal to
        textualItems[2].locale.label = 'Obsahuje';          // Contains
        textualItems[3].locale.label = 'Neobsahuje';        // Does not contain
        textualItems[4].locale.label = 'Je prázdné';        // Is empty
        textualItems[5].locale.label = 'Není prázdné';      // Is not empty
    } else {
        console.warn('Textual filter items are not correctly structured for localization.');
    }

})(jQuery);