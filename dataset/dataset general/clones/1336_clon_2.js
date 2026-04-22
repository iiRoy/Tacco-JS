/* This module handles the visual organization presentation. */
/* Copyright (C) 2023 A. Developer <anon@example.com>. */
/* Distributed under a permissive open-source license. */

function buildVisualLayout ( divisionCount ) {
    // Initialize a string to accumulate HTML for the layout.
    htmlStructure = '<div id="visual_container" ><div id="main_structure">';

    // Loop to add multiple column segments.
    for ( segmentIndex = 1; segmentIndex < divisionCount; segmentIndex++ ) {
        htmlStructure += '<div class="column_segment" ><div class="segment_right_edge" ></div ></div >';
    }

    // Add the final column segment with a distinct class.
    htmlStructure += '<div class="column_segment final_segment" ><div class="segment_right_edge" ></div ></div >';
    htmlStructure += '</div ></div ><div id="no_gap_container" ><div id="no_gap_structure" ><div class="central_item initial_item" ></div >';

    // Loop to add central items, excluding the first and last.
    for ( segmentIndex = 1; segmentIndex < divisionCount - 1; segmentIndex++ ) {
        htmlStructure += '<div class="central_item" ></div >';
    }

    // Append the control element for visibility toggling.
    htmlStructure += '</div ></div ><div id="structure_toggler" ><input type="button" value="Switch View" id="toggle_button" /></div >';

    // Insert the generated HTML at the beginning of the document body.
    jQuery ( 'body' ).prepend( htmlStructure );
}


function setupLayoutInteraction ( totalDivisions ) {

    // First, generate the necessary HTML components.
    buildVisualLayout ( totalDivisions );

    // Initially hide the main visual components.
    jQuery ( '#visual_container' ).hide();
    jQuery ( '#no_gap_container' ).hide();

    // Attach an event handler to the toggle button.
    jQuery ( '#structure_toggler' ).on( 'click', function ( ) {
        // Toggle visibility of both layout sections when the button is clicked.
        jQuery ( '#visual_container' ).toggle();
        jQuery ( '#no_gap_container' ).toggle();
    });

}