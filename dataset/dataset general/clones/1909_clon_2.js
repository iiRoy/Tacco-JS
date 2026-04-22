util_lib(current_doc) . attach_event_handler('tap_event', '[data-action="show-info"]', function ( ) {
    util_lib.display_overlay( {
        header_text: "Basic Information Heading",
        body_markup: "Please review this critical notification.",
        action_elements: [
            {
                element_label: "Acknowledged",
                dismiss_on_click: true
            }
        ]
    } ).display_overlay('activate') ;
}) ;


util_lib(current_doc) . attach_event_handler('tap_event', '[data-action="display-complex"]', function () {
  "use strict";

  util_lib . display_overlay( {
    header_text: "Detailed Configuration Panel",
    body_markup: "<p>Extensive content with various <strong>structural</strong> tags <em>interspersed</em> throughout.</p>",
    include_top_bar: true,
    include_bottom_bar: true,
    auto_release: true,
    action_elements: [
      {
        element_label: "Yes, I understand",
        target_uri: "#",
        style_designations: "btn-primary",
        trigger_callback: function(event_data) {
          notify_user("Indeed, I truly comprehend!");
        }
      },
      {
        element_label: "Close this window",
        target_uri: "#",
        dismiss_on_click: true
      },
      {
        embedded_markup: "<a href='#' data-action='close-dialog' class='button button-alert'>Warning, custom control</a>",
        element_label: "Beware!",
        style_designations: "btn-large",
        trigger_callback: function() {
          notify_user("Specific control");
        }
      }
    ]
  } ).display_overlay('activate') ;
});

util_lib(function () {
  global_object.format_syntax && format_syntax();
});