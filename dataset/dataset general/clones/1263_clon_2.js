!function(jQ) {

    "use strict"; // Enable strict mode for better code quality and error handling

    // Definition of the ProgressionMeter utility class
    // ================================================

    var ProgressionMeter = function(domElement) {
        this._elementRef = jQ(domElement); // Store a jQuery-wrapped reference to the supplied DOM node
    };


    ProgressionMeter.prototype.adjustValue = function(currentLevel) {
        var $visualContainer = this._elementRef.find('div'); // Locate the primary display division
        var $statusTextDisplay = $visualContainer.find('span'); // Find the textual display within the container

        $visualContainer.attr('aria-valuenow', currentLevel); // Update ARIA accessibility attribute for current value
        $visualContainer.css('width', currentLevel + '%'); // Visually set the width percentage
        $statusTextDisplay.text(currentLevel + '% Accomplished'); // Update the descriptive text for users
    };


    ProgressionMeter.prototype.completeProcess = function() {
        this.adjustValue(100.0); // Set the meter to its maximum completion state
    };


    ProgressionMeter.prototype.clearProgress = function() {
        this.adjustValue(0.0); // Reset the meter to its initial, empty state
    };


    // jQuery Plugin Integration for ProgressionMeter
    // ==============================================

    jQ.fn.progressionMeter = function(configOption) {
        return this.each(function() {
            var $currentElement = jQ(this); // Get the current element in the jQuery collection
            var instanceData = $currentElement.data('app.progressionMeter'); // Attempt to retrieve existing instance data

            if (!instanceData) { // If no instance exists for this specific element
                $currentElement.data('app.progressionMeter', (instanceData = new ProgressionMeter(this))); // Create a new instance and store it
            }

            if (typeof configOption === 'string') { // If the option provided is a method name
                instanceData[configOption](); // Invoke the specified method on the instance
            }

            if (typeof configOption === 'number') { // If the option provided is a numerical value
                instanceData.adjustValue(configOption); // Update the meter's value with the given number
            }
        });
    };


    // Data-API for automatic ProgressionMeter initialization
    // ======================================================

    jQ(document).on('click', '[data-toggle="progressionMeter"]', function(eventObject) {
        var $interactingElement = jQ(this); // The element that triggered the click
        var $targetDisplay = jQ($interactingElement.data('target')); // The element specified as the target for the meter
        var levelValue = $interactingElement.data('value'); // The progress value to be applied

        eventObject.preventDefault(); // Prevent the default action associated with the click event

        $targetDisplay.progressionMeter(levelValue); // Initialize or update the progression meter on the target element
    });

}(window.jQuery);