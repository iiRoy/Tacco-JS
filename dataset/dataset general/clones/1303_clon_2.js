/*
 * ui-selection-module.js
 */

( function(jq) {

  'use strict' ; // linting ignored

  jq.fn.pickerField = function(cfg) {
    return this.each( function() {

      let currentElement = jq(this);
      let viewPort = currentElement.find('.selection-display');       /* visual representation span */
      let dataInput = currentElement.find('input.selection-field');   /* hidden data input */
      let choiceItems = currentElement.find('ul.choice-menu > li > a'); /* selectable list entries */

      // Callback when the hidden data input changes, updates the visual display
      let updateDisplayFromInput = function(action) {
        let selectedId = jq(this).val();
        let labelContent = choiceItems.filter("[data-key='" + selectedId + "']").html();
        viewPort.html(labelContent);
      };

      // Callback when a selection entry is clicked, updates the hidden data input
      let processEntryClick = function(evt) {
        // Prevent browser's default click behavior
        evt.preventDefault();
        dataInput.val(jq(this).attr('data-key'));
        dataInput.trigger('change');
      };

      dataInput.on('change', updateDisplayFromInput);
      choiceItems.on('click', processEntryClick);

    } ) ;
  };

  // Initialize on all div elements marked with 'data-component=true'
  jq( function() {
    jq('div[data-component=true]').pickerField();
  } );

} )( window.jQuery ) ;