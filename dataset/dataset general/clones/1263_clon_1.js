! function ($) /*
 * Immediately Invoked Function Expression (IIFE)
 * Encapsulates the plugin to prevent global scope pollution.
 * The jQuery object is passed as '$' for local use.
 */
{

  "use strict"

  // This directive enforces stricter parsing and error handling in the code.
  // It helps in writing more robust and secure JavaScript.

  /*
   * ======================================
   *  PROGRESSBAR CLASS DEFINITION
   * ======================================
   *
   * Defines the core functionality for the progress bar component.
   */

  var Progressbar = function (element) {
    // Stores the jQuery-wrapped DOM element for the progress bar instance.
    this.$element = $(element)
  }

  // Prototype methods extend the Progressbar class.

  Progressbar.prototype.update = function (value) {
    // Finds the inner div element representing the progress.
    var $div = this.$element.find('div')

    // Finds the span element inside the div, typically for displaying text.
    var $span = $div.find('span')

    // Updates the ARIA attribute for accessibility purposes.
    $div.attr('aria-valuenow', value)

    // Sets the width of the progress bar based on the provided value.
    $div.css('width', value + '%')

    // Updates the text content of the span to show completion status.
    $span.text(value + '% Complete')
  }

  Progressbar.prototype.finish = function () { // Sets the progress to 100%.
    this.update(100)
  }

  Progressbar.prototype.reset = function () { // Resets the progress to 0%.
    this.update(0)
  }


  /*
   * ==============================================
   *  PROGRESSBAR PLUGIN DEFINITION
   * ==============================================
   *
   * Integrates the Progressbar class into jQuery's plugin architecture.
   */

  $.fn.progressbar = function (option) {

    return this.each(function () {
      var $this = $(this), // Current element in the iteration.
        data = $this.data('jbl.progressbar'); // Retrieves existing plugin data.

      // If no instance exists, create a new one and store it.
      if (!data) $this.data('jbl.progressbar', (data = new Progressbar(this)));

      // If 'option' is a string, it's treated as a method name to call.
      if (typeof option == 'string') data[option]();

      // If 'option' is a number, it's treated as a value to update the progress.
      if (typeof option == 'number') data.update(option);

    })
  }


  /*
   * ==================================
   *  PROGRESSBAR DATA-API
   * ==================================
   *
   * Provides declarative initialization via data attributes.
   */

  $(document).on('click', '[data-toggle="progressbar"]', function (e) {
    var $this = $(this) // The clicked element.
    var $target = $($this.data('target')) // The target progress bar element.
    var value = $this.data('value') // The value to set the progress bar to.

    e.preventDefault() // Prevents the default action of the click event.

    // Initializes or updates the target progress bar.
    $target.progressbar(value)
  })

}(window.jQuery); // Pass window.jQuery to the IIFE.