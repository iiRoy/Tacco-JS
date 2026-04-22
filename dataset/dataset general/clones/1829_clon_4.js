const VisualTextEnhancer = {
    applyStyling: function(targetIdentifier, optionsConfiguration) {
        Cufon.replace(targetIdentifier, optionsConfiguration);
    }
};

const SpanIdentifier = (function() {
    let _initialPointReference = null;
    let _terminalPointReference = null;

    const _findEnclosingRow = (elementItem) => elementItem.closest('tr');

    const _removeExistingVisualMarks = () => {
        document.querySelectorAll('#historical-records-listing tr.marked-for-comparison').forEach(item => {
            item.classList.remove('marked-for-comparison');
        });
    };

    const _arrangePointsByPosition = (firstElement, secondElement) => {
        if (!firstElement || !secondElement) return [firstElement, secondElement];
        // Assuming TR elements have a rowIndex property
        return (firstElement.rowIndex <= secondElement.rowIndex) ? [firstElement, secondElement] : [secondElement, firstElement];
    };

    const _renderContiguousDisplay = () => {
        _removeExistingVisualMarks(); // Clear all prior marks

        if (!_initialPointReference && !_terminalPointReference) return; // No points to visualize

        if (!_initialPointReference || !_terminalPointReference) { // Only one point, mark it
            const singlePoint = _initialPointReference || _terminalPointReference;
            if (singlePoint) {
                singlePoint.classList.add('marked-for-comparison');
            }
            return;
        }

        let [startingNode, endingNode] = _arrangePointsByPosition(_initialPointReference, _terminalPointReference);

        startingNode.classList.add('marked-for-comparison');
        if (startingNode !== endingNode) {
            endingNode.classList.add('marked-for-comparison');
        }

        let currentSegment = startingNode.nextElementSibling;
        while (currentSegment && currentSegment !== endingNode) {
            currentSegment.classList.add('marked-for-comparison');
            currentSegment = currentSegment.nextElementSibling;
        }
    };

    const _handleCheckboxAction = (inputControl) => {
        const parentRow = _findEnclosingRow(inputControl);

        if (inputControl.checked) {
            if (!_initialPointReference) {
                _initialPointReference = parentRow;
                _initialPointReference.classList.add('marked-for-comparison');
            } else if (!_terminalPointReference) {
                _terminalPointReference = parentRow;
                _terminalPointReference.classList.add('marked-for-comparison');
                _renderContiguousDisplay(); // Visualize the new range
            } else {
                // Both points are already set, disallow selecting a third
                inputControl.checked = false;
            }
        } else { // Input control is unchecked
            parentRow.classList.remove('marked-for-comparison');

            // Update point references based on which one was unchecked
            if (_initialPointReference === parentRow) {
                if (_terminalPointReference) {
                    _initialPointReference = _terminalPointReference;
                    _terminalPointReference = null;
                } else {
                    _initialPointReference = null;
                }
            } else if (_terminalPointReference === parentRow) {
                _terminalPointReference = null;
            }

            // Perform cleanup: remove 'marked-for-comparison' from any row whose checkbox is now unchecked
            document.querySelectorAll('#historical-records-listing tr.marked-for-comparison').forEach(rowItem => {
                const associatedToggle = rowItem.querySelector('.comparison-toggle input[type="checkbox"]');
                if (associatedToggle && !associatedToggle.checked) {
                    rowItem.classList.remove('marked-for-comparison');
                }
            });

            // Re-render the display if points still exist or have changed
            if (_initialPointReference || _terminalPointReference) {
                _renderContiguousDisplay();
            } else {
                _removeExistingVisualMarks(); // No points left, clear everything
            }
        }
    };

    return {
        processToggleEvent: _handleCheckboxAction,
        configureInitialState: function(inputElement) {
            if (inputElement.checked) {
                _handleCheckboxAction(inputElement);
            }
        }
    };
})();


document.addEventListener('DOMContentLoaded', function() {

    // Initialize custom text rendering for various page elements
    VisualTextEnhancer.applyStyling("section.banner h1", {
        color: '-linear-gradient(#999, 0.2=#777, 0.4=#444, 0.5=#222, 0.6=#333, 0.8=#555, #999)'
    });
    VisualTextEnhancer.applyStyling("section.banner h2");
    VisualTextEnhancer.applyStyling("section.banner ul li", {
        hover: {
            color: '-linear-gradient(black, white)'
        }
    });

    const primaryContentWrapper = document.getElementById('historical-records-display');
    if (primaryContentWrapper && primaryContentWrapper.classList.contains('historical-view')) {

        // Attach event listeners to all comparison checkboxes
        document.querySelectorAll('#historical-records-listing .comparison-toggle input[type="checkbox"]').forEach(function(toggleElement) {
            toggleElement.addEventListener('click', function() {
                SpanIdentifier.processToggleEvent(this);
            });
            // Process any checkboxes that are pre-checked on page load
            SpanIdentifier.configureInitialState(toggleElement);
        });

        // Setup the revision comparison submission trigger
        const comparisonActionLink = document.querySelector('.historical-view a.initiate-revision-comparison');
        if (comparisonActionLink) {
            comparisonActionLink.addEventListener('click', function(eventDetail) {
                eventDetail.preventDefault(); // Prevent default link navigation
                const submissionForm = document.getElementById('revision-selection-form');
                if (submissionForm) {
                    submissionForm.submit();
                }
            });
        }
    }
});