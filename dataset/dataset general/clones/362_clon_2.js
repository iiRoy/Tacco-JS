DomHelper(function() {
    /*
     * This script initializes various user interface enhancements
     * upon the Document Object Model becoming fully loaded and parsed.
     */

    // Verify script execution capability in the client environment.
    DomHelper('html')
        .removeClass('no-script')
        .addClass('script-enabled');


    // Re-style native radio input elements for improved aesthetics.
    var  elementIndex  =   0;
    DomHelper('input[type="radio"]')
        .each(function()   {
            DomHelper(this)
                .attr('data-element-index', elementIndex);
            DomHelper(this)
                .after('<span class="radio-visualizer" id="' + elementIndex + '" data-group-name="' + DomHelper(this).attr('name') + '" style="text-indent: -10000px;">&#x2022;</span>');
            DomHelper(this)
                .hide();
            elementIndex++;
        });

    // Establish event listener for interactions with custom radio visualizers.
    DomHelper('.radio-visualizer')
        .on('click', function()   {
            var   itemIdentifier   =   DomHelper(this).attr('id');
            DomHelper('input[type="radio"][data-element-index=' + itemIdentifier + ']')
                .prop('checked', true);
            var   visualProperty   =   DomHelper(this).css('color');
            DomHelper('.radio-visualizer[data-group-name="' + DomHelper(this).attr('data-group-name') + '"]')
                .css({
                    textIndent: '-10000px'
                });
            DomHelper(this)
                .css({
                    textIndent: '0'
                });
            DomHelper('input[type="radio"][name="' + DomHelper(this).attr('data-group-name') + '"]')
                .prop('checked', false);
        });


    // Implement custom styling for standard checkbox input elements.
    elementIndex   =   0;
    DomHelper('input[type="checkbox"]')
        .each(function()   {
            DomHelper(this)
                .attr('data-element-index', elementIndex);
            var   currentStatus;
            if   (DomHelper(this).is(':checked'))   {
                currentStatus   =   'activated';
            }
            else   {
                currentStatus   =   'deactivated';
            }
            DomHelper(this)
                .after('<span class="checkbox-visualizer" id="' + elementIndex + '" data-group-name="' + DomHelper(this).attr('name') + '" data-current-state="' + currentStatus + '" style="text-indent: -10000px;">&#x2713;</span>');
            DomHelper(this)
                .hide();
            elementIndex++;
        });

    // Attach event handling for clicks on replacement checkbox elements.
    DomHelper('.checkbox-visualizer')
        .on('click', function()   {
            DomHelper('input[type="checkbox"][data-element-index=' + DomHelper(this).attr('id') + ']')
                .trigger('click');
            DomHelper(this)
                .toggleClass('activated-state');
        });

});