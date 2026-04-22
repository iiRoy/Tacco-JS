/*
 * This JavaScript code handles drag-and-drop functionality for form components,
 * including dynamic creation, positioning, and property editing via popovers.
 * It leverages jQuery for DOM manipulation and event handling.
 */

// Ensure the DOM is fully loaded before executing any scripts.
$(document) .ready(function  () {

  // Initial alert for demonstration or testing purposes.
  // This alert is typically removed in production.
  alert('test');

  // Delegate event handler for 'mousedown' on elements with class 'component'
  // within any form. This initiates the drag operation.
  $("form") .delegate(".component", "mousedown", function(md) {
    // Hide any currently open popovers to prevent interference.
    $(".popover") .hide();

    // Prevent default browser drag behavior (e.g., image dragging).
    md.preventDefault();

    // Declare variables used throughout the drag operation.
    var tops,                                               // Stores a filtered list of components.
        mouseX = md.pageX,                                  // X-coordinate of the mouse at mousedown.
        mouseY = md.pageY,                                  // Y-coordinate of the mouse at mousedown.
        $temp,                                              // jQuery object for the temporary dragged element.
        timeout,                                            // Placeholder for a timeout ID (not used in current logic).
        $this = $(this),                                    // The component being dragged (jQuery object).
        delays = {                                          // Defines delays for different drag contexts.
          main: 0,                                          // Immediate drag for main components.
          form: 120                                         // Slight delay for form-specific components.
        },
        type;                                               // Determines if the component is from 'main' or 'form' area.

    // Determine the type of component based on its ancestry.
    // This checks if the component is within the '#components' element.
    if ($this.parent().parent().parent().parent().attr("id") === "components") {
      type = "main"; // Component is from the main palette.
    } else {
      type = "form"; // Component is already in the form area.
    }

    // Set a delayed action for creating and showing the draggable element.
    // The delay depends on the 'type' of the component.
    var delayed = setTimeout(function() {
      // Create a temporary representation of the dragged component.
      if (type === "main") {
        // For main components, clone the element.
        $temp = $("<form class='form-horizontal span6' id='temp'>") .append($this.clone());
      } else {
        // For form components, move the original element if it's not the legend.
        if ($this.attr("id") !== "legend") {
          $temp = $("<form class='form-horizontal span6' id='temp'>") .append($this);
        }
      }

      // Append the temporary draggable element to the body.
      $("body") .append($temp);

      // Style and position the temporary element to follow the mouse.
      $temp.css({
        "position" : "absolute",
        "top"      : mouseY - ($temp.height() / 2) + "px", // Center vertically.
        "left"     : mouseX - ($temp.width() / 2) + "px",  // Center horizontally.
        "opacity"  : "0.9"                                  // Make it slightly transparent.
      }) .show(); // Make it visible.

      // Calculate half dimensions for centering during drag.
      var half_box_height = ($temp.height() / 2),
          half_box_width = ($temp.width() / 2),
          $target = $("#target"),                           // The target area where components are dropped.
          tar_pos = $target.position(),                     // Position of the target area.
          $target_component = $("#target .component");      // All components currently in the target area.

      // Delegate 'mousemove' event to the 'body' to track the mouse during drag.
      $(document) .delegate("body", "mousemove", function(mm) {

        var mm_mouseX = mm.pageX,                           // Current X-coordinate of the mouse.
            mm_mouseY = mm.pageY;                           // Current Y-coordinate of the mouse.

        // Update the position of the temporary element to follow the mouse.
        $temp.css({
          "top"      : mm_mouseY - half_box_height + "px",
          "left"     : mm_mouseX - half_box_width  + "px"
        });

        // Check if the temporary element is hovering over the target area.
        if (mm_mouseX > tar_pos.left &&
          mm_mouseX < tar_pos.left + $target.width() + $temp.width() / 2 &&
          mm_mouseY > tar_pos.top &&
          mm_mouseY < tar_pos.top + $target.height() + $temp.height() / 2
          ) {
            // Highlight the target area if hovering.
            $("#target") .css("background-color", "#fafdff");
            // Reset borders of existing components.
            $target_component .css({"border-top" : "1px solid white", "border-bottom" : "none"});

            // Find components whose top edge is below the mouse position.
            tops = $.grep($target_component, function(e) {
              return ($(e) .position() .top - mm_mouseY + half_box_height > 0 && $(e) .attr("id") !== "legend");
            });

            // If there are such components, highlight the top border of the first one.
            if (tops.length > 0) {
              $(tops[0]) .css("border-top", "1px solid #22aaff");
            } else {
              // If no component is above the mouse, highlight the bottom border of the last component
              // (if any components exist in the target area).
              if ($target_component.length > 0) {
                $($target_component[$target_component.length - 1]) .css("border-bottom", "1px solid #22aaff");
              }
            }
          } else {
            // If not hovering over the target area, reset styles.
            $("#target") .css("background-color", "#fff");
            $target_component .css({"border-top" : "1px solid white", "border-bottom" : "none"});
            $target .css("background-color", "#fff");
          }
      });

      // Delegate 'mouseup' event to the 'body' for handling drop.
      $("body") .delegate("#temp", "mouseup", function(mu) {
        mu.preventDefault(); // Prevent default mouseup action.

        var mu_mouseX = mu.pageX,                           // X-coordinate at mouseup.
            mu_mouseY = mu.pageY,                           // Y-coordinate at mouseup.
            tar_pos = $target.position();                   // Current position of the target area.

        // Reset borders of all components in the target area.
        $("#target .component") .css({"border-top" : "1px solid white", "border-bottom" : "none"});

        // Check if the drop occurred within the target area.
        if (mu_mouseX + half_box_width > tar_pos.left &&
          mu_mouseX - half_box_width < tar_pos.left + $target.width() &&
          mu_mouseY + half_box_height > tar_pos.top &&
          mu_mouseY - half_box_height < tar_pos.top + $target.height()
          ) {
            $temp.attr("style", null); // Remove inline styles from the temporary element.

            // Determine where to add the component.
            if (tops.length > 0) {
              // Insert before the first component found 'below' the mouse.
              $($temp.html()) .insertBefore(tops[0]);
            } else {
              // Append to the fieldset within the target if no components are found below.
              $("#target fieldset") .append($temp.html());
            }
          } else {
            // If dropped outside the target area, reset borders and clear 'tops'.
            $("#target .component") .css({"border-top" : "1px solid white", "border-bottom" : "none"});
            tops = []; // Clear the list of components.
          }

        // Clean up after drag and drop.
        $target .css("background-color", "#fff"); // Reset target background.
        $(document) .undelegate("body", "mousemove"); // Unbind mousemove handler.
        $("body") .undelegate("#temp", "mouseup");     // Unbind mouseup handler.
        // Re-initialize popovers for components in the target area.
        $("#target .component") .popover({trigger: "manual"});
        $temp .remove(); // Remove the temporary draggable element.
        genSource();     // Regenerate the source code display.
      });
    }, delays[type]); // Apply the appropriate delay.

    // If the mouse button is released before the delayed drag starts, cancel the delay.
    $(document) .mouseup(function () {
      clearInterval(delayed);
      return false;
    });

    // If the mouse leaves the component before the delayed drag starts, cancel the delay.
    $(this) .mouseout(function () {
      clearInterval(delayed);
      return false;
    });
  });

  /*
   * Function to generate and update the source code display.
   * It scrubs attributes and classes from the generated HTML.
   */
  var genSource = function() {
    var $temptxt = $("<div>") .html($("#build") .html()); // Get the HTML from the build area.

    // Scrub various attributes and classes that are only for design/interaction.
    $($temptxt) .find(".component") .attr({
      "title": null,
      "data-original-title": null,
      "data-type": null,
      "data-content": null,
      "rel": null,
      "trigger": null,
      "style": null
    });
    $($temptxt) .find(".valtype") .attr("data-valtype", null) .removeClass("valtype");
    $($temptxt) .find(".component") .removeClass("component");
    $($temptxt) .find("form") .attr({"id":  null, "style": null});

    // Update the source textarea with the cleaned HTML, removing excess indentation.
    $("#source") .val($temptxt.html().replace(/\n\ \ \ \ \ \ \ \ \ \ \ \ /g, "\n"));
  };

  // Activate popovers for components in the target area, triggered manually.
  $("#target .component") .popover({trigger: "manual"});

  // Delegate 'click' event for components in the target area to show popovers.
  $("#target") .delegate(".component", "click", function(e) {
    e.preventDefault(); // Prevent default link behavior.
    $(".popover") .hide(); // Hide any other open popovers.
    var $active_component = $(this); // The clicked component.
    $active_component .popover("show"); // Show the popover for this component.

    var valtypes = $active_component .find(".valtype"); // Find elements with 'valtype' class.

    // Iterate over elements with 'valtype' to populate popover input fields.
    $.each(valtypes, function(i, e) {
      var valID = "#" + $(e) .attr("data-valtype"); // Construct the ID for the popover input.
      var val; // Variable to hold the value.

      if (valID === "#placeholder") {
        val = $(e) .attr("placeholder");
        $(".popover " + valID) .val(val);
      } else if (valID === "#checkbox") {
        val = $(e) .attr("checked");
        $(".popover " + valID) .attr("checked", val);
      } else if (valID === "#option") {
        val = $.map($(e) .find("option"), function(e, i) { return $(e) .text(); });
        val = val.join("\n");
        $(".popover " + valID) .text(val);
      } else if (valID === "#checkboxes") {
        val = $.map($(e) .find("label"), function(e, i) { return $(e) .text().trim(); });
        val = val.join("\n");
        $(".popover " + valID) .text(val);
      } else if (valID === "#radios") {
        val = $.map($(e) .find("label"), function(e, i) { return $(e) .text().trim(); });
        val = val.join("\n");
        $(".popover " + valID) .text(val);
      } else if (valID === "#inline-checkboxes") {
        val = $.map($(e) .find("label"), function(e, i) { return $(e) .text().trim(); });
        val = val.join("\n");
        $(".popover " + valID) .text(val);
      } else if (valID === "#inline-radios") {
        val = $.map($(e) .find("label"), function(e, i) { return $(e) .text().trim(); });
        val = val.join("\n");
        $(".popover " + valID) .text(val);
      } else if (valID === "#button") {
        val = $(e) .text();
        var type = $(e) .find("button") .attr("class") .split(" ") .filter(function(e) { return e.match(/btn-.*/); });
        $(".popover #color option") .attr("selected", null);
        if (type.length === 0) {
          $(".popover #color #default") .attr("selected", "selected");
        } else {
          $(".popover #color #" + type[0]) .attr("selected", "selected");
        }
        val = $(e) .find(".btn") .text();
        $(".popover #button") .val(val);
      } else {
        val = $(e) .text();
        $(".popover " + valID) .val(val);
      }
    });

    // Delegate click event for the 'Cancel' button in the popover.
    $(".popover") .delegate(".btn-danger", "click", function(e) {
      e.preventDefault();
      $active_component .popover("hide"); // Hide the popover.
    });

    // Delegate click event for the 'Save' button in the popover.
    $(".popover") .delegate(".btn-info", "click", function(e) {
      e.preventDefault();
      var inputs = $(".popover input"); // Get all input fields in the popover.
      inputs .push($(".popover textarea")[0]); // Add the textarea to the inputs list.
      console.log(inputs); // Log inputs for debugging.

      // Iterate over popover input fields to update the component's properties.
      $.each(inputs, function(i, e) {
        var vartype = $(e) .attr("id"); // Get the data-valtype from the input's ID.
        var value = $active_component .find('[data-valtype="' + vartype + '"]'); // Find the corresponding component element.

        if (vartype === "placeholder") {
          $(value) .attr("placeholder", $(e) .val());
        } else if (vartype === "checkbox") {
          if ($(e) .is(":checked")) {
            $(value) .attr("checked", true);
          } else {
            $(value) .attr("checked", false);
          }
        } else if (vartype === "option") {
          var options = $(e) .val().split("\n");
          $(value) .html("");
          $.each(options, function(i, e) {
            $(value) .append("\n      ");
            $(value) .append($("<option>") .text(e));
          });
        } else if (vartype === "checkboxes") {
          var checkboxes = $(e) .val().split("\n");
          $(value) .html("\n      <!-- Multiple Checkboxes -->");
          $.each(checkboxes, function(i, e) {
            if (e.length > 0) {
              $(value) .append('\n      <label class="checkbox">\n        <input type="checkbox" value="' + e + '">\n        ' + e + '\n      </label>');
            }
          });
          $(value) .append("\n  ");
        } else if (vartype === "radios") {
          var radios = $(e) .val().split("\n");
          $(value) .html("\n      <!-- Multiple Radios -->");
          $.each(radios, function(i, e) {
            if (e.length > 0) {
              $(value) .append('\n      <label class="radio">\n        <input type="radio" value="' + e + '">\n        ' + e + '\n      </label>');
            }
          });
          $(value) .append("\n  ");
          $($(value) .find("input")[0]) .attr("checked", true);
        } else if (vartype === "inline-checkboxes") {
          var checkboxes = $(e) .val().split("\n");
          $(value) .html("\n      <!-- Inline Checkboxes -->");
          $.each(checkboxes, function(i, e) {
            if (e.length > 0) {
              $(value) .append('\n      <label class="checkbox inline">\n        <input type="checkbox" value="' + e + '">\n        ' + e + '\n      </label>');
            }
          });
          $(value) .append("\n  ");
        } else if (vartype === "inline-radios") {
          var radios = $(e) .val().split("\n");
          $(value) .html("\n      <!-- Inline Radios -->");
          $.each(radios, function(i, e) {
            if (e.length > 0) {
              $(value) .append('\n      <label class="radio inline">\n        <input type="radio" value="' + e + '">\n        ' + e + '\n      </label>');
            }
          });
          $(value) .append("\n  ");
          $($(value) .find("input")[0]) .attr("checked", true);
        } else if (vartype === "button") {
          var type = $(".popover #color option:selected") .attr("id");
          $(value) .find("button") .text($(e) .val()) .attr("class", "btn " + type);
        } else {
          $(value) .text($(e) .val());
        }
      });
      $active_component .popover("hide"); // Hide the popover after saving.
      genSource(); // Regenerate the source code display.
    });
  });

  // Delegate click event for the 'sourcetab' to update the source code.
  $("#navtab") .delegate("#sourcetab", "click", function(e) {
    genSource(); // Call the function to generate source code.
  });
});