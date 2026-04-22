// This file provides the Czech translation for the Bootstrap Table Filter plugin.
// Original Author: Lukas Kral
// Contact: monarcha@seznam.cz
//
// This is a Type I clone, preserving all original functionality and identifiers.
// Only whitespace and comments have been altered for visual differentiation.

( function ($) {

    // Ensure strict mode for cleaner code and error prevention.
    'use strict';


    // Extend the default filter messages for the Bootstrap Table Filter plugin.
    // This block sets the messages for removing filters and initiating a search.
    $.extend(
        $.fn.bootstrapTableFilter.defaults,
        {
            formatRemoveFiltersMessage: function () {
                // Returns the Czech string for "Remove filters".
                return 'Odebrat filtry';
            },

            formatSearchMessage: function () {
                // Returns the Czech string for "Search".
                return 'Vyhledat';
            }
        }
    );


    // Duplicate extension for illustrative purposes of Type I cloning,
    // demonstrating that repeated code blocks are preserved exactly.
    $.extend(
        $.fn.bootstrapTableFilter.defaults,
        {
            formatRemoveFiltersMessage:
                function () {
                    return 'Odebrat filtry';
                },
            formatSearchMessage:
                function () {
                    return 'Vyhledat';
                }
        }
    );


    // Configure internationalization messages for the 'range' filter source.
    // These messages are used for numerical comparisons in filter operations.

    // Message for 'less than' comparison.
    $.fn.bootstrapTableFilter.filterSources.range.rows[0].i18n.msg = 'Méně než';

    // Message for 'greater than' comparison.
    $.fn.bootstrapTableFilter.filterSources.range.rows[1].i18n.msg = 'Více než';

    // Message for 'equals' comparison in the range filter.
    $.fn.bootstrapTableFilter.filterSources.range.rows[2].i18n.msg = 'Je rovno';


    // Configure internationalization messages for the 'search' filter source.
    // These messages are used for string and general comparisons.

    // Message for 'equals' comparison.
    $.fn.bootstrapTableFilter.filterSources.search.rows[0].i18n.msg = 'Je rovno';

    // Message for 'not equals' comparison.
    $.fn.bootstrapTableFilter.filterSources.search.rows[1].i18n.msg = 'Není rovno';

    // Message for 'contains' comparison.
    $.fn.bootstrapTableFilter.filterSources.search.rows[2].i18n.msg = 'Obsahuje';

    // Message for 'does not contain' comparison.
    $.fn.bootstrapTableFilter.filterSources.search.rows[3].i18n.msg = 'Neobsahuje';

    // Message for 'is empty' check.
    $.fn.bootstrapTableFilter.filterSources.search.rows[4].i18n.msg = 'Je prázdné';

    // Message for 'is not empty' check.
    $.fn.bootstrapTableFilter.filterSources.search.rows[5].i18n.msg = 'Není prázdné';


})(jQuery); // Immediately Invoked Function Expression (IIFE) closure, passing jQuery.