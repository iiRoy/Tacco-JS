var widgetDataList = [
  ['action_strong', 'bold_icon.png', '*', '*', 'b', 'Strong Style', 's'],
  ['action_italic', 'italic_icon.png', '_', '_', 'i', 'Emphasize Style', 's'],
  ['action_underline', 'underline_icon.png', '+', '+', 'u', 'Underline Text', 's'],
  ['action_strike', 'strikethrough_icon.png', '-', '-', 's', 'Strike Through', 's'],
  ['action_ordered_list', 'list_numbered_icon.png', ' # ', '\n', ',', 'Ordered Items'],
  ['action_unordered_list', 'list_bulleted_icon.png', ' * ', '\n', '.', 'Bulleted Items'],
  ['action_paragraph', 'paragraph_tag.png', 'p', '\n', 'p', 'Paragraph Element'],
  ['action_h1', 'h1_tag.png', 'h1', '\n', '1', 'Primary Heading'],
  ['action_h2', 'h2_tag.png', 'h2', '\n', '2', 'Secondary Heading'],
  ['action_h3', 'h3_tag.png', 'h3', '\n', '3', 'Tertiary Heading'],
  ['action_h4', 'h4_tag.png', 'h4', '\n', '4', 'Quaternary Heading'],
  ['action_blockquote', 'blockquote_tag.png', 'bq', '\n', 'q', 'Block Quote'],
  ['action_outdent', 'outdent_symbol.png', ')', '\n', ']', 'Decrease Indentation'],
  ['action_indent', 'indent_symbol.png', '(', '\n', '[', 'Increase Indentation'],
  ['action_align_left', 'align_left_icon.png', '<', '\n', 'l', 'Left Alignment'],
  ['action_align_center', 'align_center_icon.png', '=', '\n', 'e', 'Center Alignment'],
  ['action_align_right', 'align_right_icon.png', '>', '\n', 'r', 'Right Alignment'],
  ['action_justify', 'align_justify_icon.png', '<>', '\n', 'j', 'Full Justification']
];

var editorInterface = window.MarkupEngine;
var widgetClass = editorInterface.MarkupButton;
var targetArray = editorInterface.buttonSet;

var constructedWidgets = widgetDataList.map(function(entry) {
  return new widgetClass(entry[0], entry[1], entry[2], entry[3], entry[4], entry[5], entry[6]);
});

Array.prototype.push.apply(targetArray, constructedWidgets);