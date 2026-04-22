// This module defines a visual theme for the editor.
define(
    "my_editor/styling/lazy_hands", // Unique theme path
    [
        "need",           // Dependency for module loading
        "outlets",        // Exported interfaces
        "unit",           // Module instance
        "my_editor/util/style_helper" // Utility for CSS injection
    ],
    function(
        need,    // Function to load dependencies
        outlets, // Object for module exports
        unit     // Current module context
    ) {

// Indicate if this is a dark color scheme.
outlets.isNightMode = true;

// The primary CSS class name for this theme.
outlets.styleIdentifier = "my-editor-lazy-hands";


// Comprehensive CSS rules for the editor's appearance.
outlets.styleDefinition =
  ".my-editor-lazy-hands  .my_editor_pane_gutter  { " +
  " background-color: #3b3b3b ; " +
  " color: rgb(153, 153, 153) " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_print-margin { " +
  " width: 1px ; " +
  " background: #3b3b3b " +
  "} " +
  ".my-editor-lazy-hands { " +
  " background-color: #323232 ; " +
  " color: #FFFFFF " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_cursor { " +
  " color: #91FF00 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_marker-layer .my_editor_pane_selection { " +
  " background: rgba(90, 100, 126, 0.88) " +
  "} " +
  ".my-editor-lazy-hands.my_editor_pane_multiselect .my_editor_pane_selection.my_editor_pane_start { " +
  " box-shadow: 0 0 3px 0px #323232 ; " +
  " border-radius: 2px " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_marker-layer .my_editor_pane_step { " +
  " background: rgb(102, 82, 0) " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_marker-layer .my_editor_pane_bracket { " +
  " margin: -1px 0 0 -1px ; " +
  " border: 1px solid #404040 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_marker-layer .my_editor_pane_active-line { " +
  " background: #353637 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_gutter-active-line { " +
  " background-color: #353637 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_marker-layer .my_editor_pane_selected-word { " +
  " border: 1px solid rgba(90, 100, 126, 0.88) " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_invisible { " +
  " color: #404040 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_keyword, " +
  ".my-editor-lazy-hands .my_editor_pane_meta { " +
  " color: #CC7833 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_constant, " +
  ".my-editor-lazy-hands .my_editor_pane_constant.my_editor_pane_character, " +
  ".my-editor-lazy-hands .my_editor_pane_constant.my_editor_pane_character.my_editor_pane_escape, " +
  ".my-editor-lazy-hands .my_editor_pane_constant.my_editor_pane_other, " +
  ".my-editor-lazy-hands .my_editor_pane_support.my_editor_pane_constant { " +
  " color: #6C99BB " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_invalid { " +
  " color: #FFFFFF ; " +
  " background-color: #FF0000 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_fold { " +
  " background-color: #CC7833 ; " +
  " border-color: #FFFFFF " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_support.my_editor_pane_function { " +
  " color: #B83426 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_variable.my_editor_pane_parameter { " +
  " font-style: italic " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_string { " +
  " color: #A5C261 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_string.my_editor_pane_regexp { " +
  " color: #CCCC33 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_comment { " +
  " font-style: italic ; " +
  " color: #BC9458 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_meta.my_editor_pane_tag { " +
  " color: #FFE5BB " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_entity.my_editor_pane_name { " +
  " color: #FFC66D " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_collab.my_editor_pane_user1 { " +
  " color: #323232 ; " +
  " background-color: #FFF980 " +
  "} " +
  ".my-editor-lazy-hands .my_editor_pane_indent-guide { " +
  " background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMwMjLyZYiPj/8PAAreAwAI1+g0AAAAAElFTkSuQmCC) right repeat-y " +
  "} ";


// Load the CSS utility module.
var styleUtil = need("my_editor/util/style_helper");

// Inject the generated CSS string into the document's head.
styleUtil.injectStyleText(outlets.styleDefinition, outlets.styleIdentifier);

    }
);