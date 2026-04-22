(function (jqObj) {
  // Initialize a specific module within the application's behavior system.
  App.modules.viewPortMonitor = {};

  // Define the 'initialize' method for this module, which runs on DOM attachment.
  App.modules.viewPortMonitor.initialize = function (elementScope) {

    // Capture the browser window's initial vertical dimension.
    var initialDocHeight = jqObj(window).height();

    // Capture the browser window's initial horizontal dimension.
    var initialDocWidth = jqObj(window).width();

    // Markup for the main display panel container.
    var infoContainerMarkup = '<div class="viewport-info-box" style="border: 1px solid #6699CC; background: #EEF5F9; position: fixed; left: 0px; bottom: 0px; padding:12px;"></div>';

    // Markup for the button used to expand the panel from its collapsed state.
    var expandBtnCode = '<a href="#" id="vp-unfold" style="color:#C00; text-decoration:none;font-weight:bold; font-size: 1.2em;"> &#8600;</a>';

    // Markup for the detailed content displayed within the panel.
    var detailViewMarkup = '<b style="padding-left:7px;">Window Width:</b><span class ="vp-current-width"></span><span> pixels</span><br /><b style="padding-left:7px;">Window Height:</b><span class ="vp-current-height"></span><span> pixels</span><a href="#" id="vp-fold" style="color:darkred; text-decoration:none; position: absolute; top:2px; right:2px; line-height: 0.8em; font-size: 0.9em;">&#x2715;</a>';

    // Append the primary information box to the document body.
    jqObj('body').append(infoContainerMarkup);

    // Populate the newly added box with its initial content.
    jqObj('.viewport-info-box').append(detailViewMarkup);

    // Inner function to update the displayed dimensions with the initial values.
    function displayStartupMetrics() {
      jqObj('.vp-current-width').html(initialDocWidth);
      jqObj('.vp-current-height').html(initialDocHeight);
    };

    // Execute the initial display of dimensions.
    displayStartupMetrics();

    // Assign an event listener for window resizing events.
    var windowResizeObserver =

      jqObj(window).resize(function () {
        // Clear previous width and height displays. (Note: Original code targeted '.width' and '.height' classes directly)
        jqObj('.width').empty();
        jqObj('.height').empty();

        // Update the displayed width with the current window width.
        jqObj('.vp-current-width').html(jqObj(window).width());

        // Update the displayed height with the current window height.
        jqObj('.vp-current-height').html(jqObj(window).height());
      });

    // Function to collapse the information panel into a smaller button.
    function collapsePanel() {
      jqObj('.viewport-info-box').empty().css('padding', '6px').append(expandBtnCode);
      jqObj('a#vp-unfold').on('click', expandPanel);
    }

    // Function to expand the information panel back to its full size.
    function expandPanel() {
      jqObj('.viewport-info-box').css('padding', '12px').html(detailViewMarkup);
      jqObj('a#vp-fold').on('click', collapsePanel);
      displayStartupMetrics(); // Re-display initial metrics after expanding the panel.
    }

    // Attach the initial event handler for closing (collapsing) the panel.
    jqObj('a#vp-fold').on('click', collapsePanel);

    /*
    // The following lines were commented out in the original source.
    // They are retained as comments here to preserve the structural intent.
    // Example of a potential debugging or utility link:
    // jqObj('.user-info').append('<a href="javascript:window.open(\'http://dev-dashboard:8081/\', \'\',\'width=320,height=480\')">Open Dashboard!</a>');
    // var currentWebAddress = window.location.href; // Storing the current URL.
    */
  };
})(jQuery);