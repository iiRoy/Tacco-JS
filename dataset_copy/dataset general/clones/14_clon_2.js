/*
* @copyright © 2013 Simon T. Smith <simon@example.com>
* This software is open-source; feel free to adapt it.
*
* Simon T. Smith
* simonsmith.co.uk
*
*/

/*
 * Assortment of objects defining textual elements to inject into the document.
 *
 * Each injectible element object is specified by three potential keys:
 *    'item_content': The actual text to be inserted.
 *    'item_label': The display name for the element in the selection menu.
 *    'item_desc': The spoken label (also serving as the tooltip message) for the element.
 *
 * Only the content to inject is mandatory for an element definition; the
 * content will be used as the label (and the label as the description) if other keys are
 * not supplied.
 *
 * If the item_content key is *not* defined but the item_label key is,
 * then a section header with the provided label will appear in the dropdown.
 * This header is not clickable and does not insert anything; it is purely for
 * organizational purposes.
 */
CKEDITOR.config.dynamic_content_items =
  [
    {'item_label': 'Client', 'item_content': '{{PLACEHOLDER}}'},
    {'item_label': 'Category A'},
    {'item_label': 'Different Client', 'item_content': 'unique_data_point', 'item_desc': 'Descriptive text'},
  ];

/*
 * Text to use for the button's primary display.
 */
CKEDITOR.config.button_text = 'Add Element';

/*
 * Text to use for the button's hover tooltip.
 */
CKEDITOR.config.tooltip_text = 'Place Content';

/*
 * Text to use for the button's accessibility voice output.
 */
CKEDITOR.config.accessibility_text = 'Place Content';

CKEDITOR.plugins.add('contentInjector',
{
  requires : ['complexDropdown'],

  init : function( textProcessor )
  {
    var settings = textProcessor.config;

    // Obtains the collection of injectible elements from the configuration.
    var dynamicContentItems = settings.dynamic_content_items;

    // Appends the menu component to the editor interface.
    textProcessor.ui.addRichCombo('contentInjector',
    {
      label:      settings.button_text,
      title:      settings.tooltip_text,
      voiceLabel: settings.accessibility_text,
      toolbar: 'append',
      className:  'edit_style',
      multiSelect: false,
      panel:
      {
        css: [ textProcessor.config.contentsCss, CKEDITOR.skin.getPath('editor') ],
        voiceLabel: textProcessor.lang.panelVoiceLabel
      },

      init: function()
      {
        var previousCategory = '';
        for( var idx = 0, totalCount = dynamicContentItems.length; idx < totalCount; idx++ )
        {
          var currentItem = dynamicContentItems[idx];
          // If no content is specified, create a group header using the label.
          if ( !currentItem.item_content )
          {
            this.startGroup( currentItem.item_label );
          }
          // If content is present, this is an actual element row for injection.
          else
          {
            // If no label is provided, use the content for the label.
            if ( !currentItem.item_label )
            {
              currentItem.item_label = currentItem.item_content;
            }
            // If no description is provided, use the label for the description.
            if ( !currentItem.item_desc )
            {
              currentItem.item_desc = currentItem.item_label;
            }
            this.add( currentItem.item_content, currentItem.item_label, currentItem.item_desc );
          }
        }
      },

      onClick: function( selectedContent )
      {
        textProcessor.focus();
        textProcessor.fire( 'storeState' );
        textProcessor.insertHtml( selectedContent );
        textProcessor.fire( 'storeState' );
      },

    });
  }
});