module.exports = function(componentConfiguration) {
    // A robust check for the Titanium environment. If Ti is not available,
    // we might want to log a warning or throw an error, depending on desired behavior.
    if (typeof Ti === 'undefined' || !Ti.UI || !Ti.Platform) {
        console.error("Titanium environment (Ti.UI, Ti.Platform) is not available. Component cannot be initialized.");
        // Returning an empty object or throwing an error is a valid Type III change.
        return {};
    }

    // Initialize configuration object if not provided or undefined.
    // Using the nullish coalescing operator for conciseness and modern JavaScript.
    componentConfiguration ??= {};

    // Helper to get the current operating system name for repeated checks.
    const getOperatingSystem = () => Ti.Platform.getOsname();
    const currentOperatingSystemName = getOperatingSystem();

    // Determine the initial selected row index from configuration, defaulting to 0.
    let initialSelectedIndex = componentConfiguration.hasOwnProperty('initialSelection')
        ? componentConfiguration.initialSelection
        : 0;

    // A variable to track the currently selected index, updated on change.
    let currentSelectionTracker = initialSelectedIndex;

    // Define properties that can be directly mapped to the button activation field.
    const allowedButtonLayoutKeys = ['left', 'right', 'top', 'bottom', 'width', 'height'];

    // Base configuration for the interactive display field (button/textfield).
    const buttonActivationFieldProps = {
        value: componentConfiguration.hasOwnProperty('displayTitle')
            ? componentConfiguration.displayTitle
            : 'Select an option', // More descriptive default title
        height: 42, // Slightly altered height
        width: '88%', // Slightly altered width
        enabled: false, // Remains disabled for input
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        color: '#333' // Adding a default text color
    };

    // Merge custom configuration into the button properties.
    // Iterating over keys to ensure only allowed layout properties are merged.
    Object.keys(componentConfiguration).forEach(propKey => {
        if (allowedButtonLayoutKeys.includes(propKey)) {
            buttonActivationFieldProps[propKey] = componentConfiguration[propKey];

            // For non-Android platforms, these properties are handled by the main view,
            // so they are removed from the picker configuration to avoid conflicts.
            if (currentOperatingSystemName !== 'android') {
                delete componentConfiguration[propKey]; // Remove from original config
            }
        }
    });

    // Adjust top offset for iPhone to account for status/navigation bar.
    if (currentOperatingSystemName === 'iphone') {
        // Use a different property name for clarity.
        componentConfiguration.topOffset = componentConfiguration.topOffset || 44;
        componentConfiguration.top = componentConfiguration.topOffset; // Ensure the picker gets it
    }

    // Create the core picker widget.
    const valueSelectorInstance = Ti.UI.createPicker(componentConfiguration);
    valueSelectorInstance.addEventListener('change', handlePickerSelectionUpdate);

    // Set the initial selection for the picker.
    // Note: The original code sets `setSelectedRow(0, selectedRow)`.
    // We maintain that behavior for the first column.
    valueSelectorInstance.setSelectedRow(0, currentSelectionTracker, false); // Explicitly setting animated to false

    // Variables for platform-specific UI elements.
    let modalPresentationWrapper = null;
    let interactiveDisplayField = null; // The field that triggers the picker

    // Platform-specific UI setup for iOS (iPhone/iPad).
    if (currentOperatingSystemName === 'iphone') {
        // iPhone modal presentation view (slides up from bottom).
        modalPresentationWrapper = Ti.UI.createView({
            height: 260, // Slightly altered height
            bottom: -260, // Initially off-screen
            zIndex: 100, // Higher zIndex for visibility
            // Removing backgroundColor: 'red' for a cleaner UI.
            opacity: 0.95 // Adding slight opacity
        });

        // Animations for showing and hiding the modal.
        const showModalAnimation = Ti.UI.createAnimation({
            bottom: 0,
            duration: 300 // Custom duration
        });
        const hideModalAnimation = Ti.UI.createAnimation({
            bottom: -260,
            duration: 250 // Slightly faster hide duration
        });

        // Event listeners to control modal visibility.
        modalPresentationWrapper.addEventListener('presentPickerModal', () => {
            modalPresentationWrapper.animate(showModalAnimation);
            // Ensure the picker displays the current selection when shown.
            valueSelectorInstance.setSelectedRow(0, currentSelectionTracker, true);
        });
        modalPresentationWrapper.addEventListener('dismissPickerModal', () => {
            modalPresentationWrapper.animate(hideModalAnimation);
        });

        // Setup the toolbar for modal actions.
        // Using a helper function for consistent button creation.
        const createToolbarButton = (titleKey, style) => Ti.UI.createButton({
            title: Ti.Locale.getString(titleKey) || titleKey, // Use i18n or fallback
            style: style,
            font: { fontSize: 16, fontWeight: 'bold' } // Custom font
        });

        const dismissControl = createToolbarButton('CancelButtonText', Ti.UI.iPhone.SystemButtonStyle.BORDERED);
        dismissControl.addEventListener('click', () => {
            modalPresentationWrapper.fireEvent('dismissPickerModal');
        });

        const confirmControl = createToolbarButton('DoneButtonText', Ti.UI.iPhone.SystemButtonStyle.DONE);
        confirmControl.addEventListener('click', handlePickerSelectionUpdate); // Trigger selection update
        confirmControl.addEventListener('click', () => {
            modalPresentationWrapper.fireEvent('dismissPickerModal');
        });

        // Create flexible space for toolbar layout.
        const flexibleSpace = Ti.UI.createButton({
            systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });

        const pickerAccessoryBar = Ti.UI.iOS.createToolbar({
            top: 0,
            items: [dismissControl, flexibleSpace, confirmControl],
            barColor: '#EFEFF4' // Light grey toolbar color
        });

        modalPresentationWrapper.add(pickerAccessoryBar);

    } else if (currentOperatingSystemName === 'ipad') {
        // iPad uses a popover for presentation.
        modalPresentationWrapper = Ti.UI.iPad.createPopover({
            width: 250, // Altered dimensions
            height: 250,
            title: componentConfiguration.hasOwnProperty('popoverTitle')
                ? componentConfiguration.popoverTitle
                : 'Choose Value', // More explicit title key and default
            arrowDirection: Ti.UI.iPad.POPOVER_ARROW_DIRECTION_ANY,
            backgroundColor: '#F5F5F5' // Adding a background color
        });
    }

    // Logic specifically for non-Android platforms (iOS devices).
    if (currentOperatingSystemName !== 'android') {
        // Add the picker to its respective container (modal view or popover).
        if (modalPresentationWrapper) { // Guard clause
            modalPresentationWrapper.add(valueSelectorInstance);
        } else {
            console.warn("Modal presentation wrapper was not initialized for iOS.");
        }

        // Create a transformation matrix for the disclosure indicator.
        const disclosureIconTransform = Ti.UI.create2DMatrix().rotate(90);

        // Create the interactive text field that acts as a button.
        interactiveDisplayField = Ti.UI.createTextField(buttonActivationFieldProps);

        // Determine placement of the disclosure indicator based on RTL setting.
        const isRTL = componentConfiguration.hasOwnProperty('isRightToLeft') && componentConfiguration.isRightToLeft;
        const disclosureButton = Ti.UI.createButton({
            style: Ti.UI.iPhone.SystemButton.DISCLOSURE,
            transform: disclosureIconTransform,
            width: 30, // Explicit width for the button
            height: 30
        });

        if (isRTL) {
            interactiveDisplayField.leftButton = disclosureButton;
            interactiveDisplayField.textAlign = Ti.UI.TEXT_ALIGNMENT_RIGHT;
        } else {
            interactiveDisplayField.rightButton = disclosureButton;
            interactiveDisplayField.textAlign = Ti.UI.TEXT_ALIGNMENT_LEFT; // Explicitly set
        }

        // Event listener for when the interactive field is tapped.
        interactiveDisplayField.addEventListener('click', () => {
            if (currentOperatingSystemName === 'ipad') {
                if (modalPresentationWrapper && interactiveDisplayField) { // Additional guard
                    modalPresentationWrapper.show({
                        view: interactiveDisplayField, // Renamed 'view' to 'anchorView' conceptually, but using original property name.
                        animated: true,
                        // Add a preferred content size for iPad popover
                        width: 250,
                        height: 250
                    });
                    valueSelectorInstance.setSelectedRow(0, currentSelectionTracker, true);
                }
            } else if (currentOperatingSystemName === 'iphone') {
                if (modalPresentationWrapper) { // Guard clause
                    modalPresentationWrapper.fireEvent('presentPickerModal');
                }
            }
        });
    }

    // Public methods to expose component parts.
    // Using a switch statement for platform checks for Type III.
    this.retrieveTopLevelViews = function() {
        switch (currentOperatingSystemName) {
            case 'android':
                return valueSelectorInstance;
            case 'iphone':
                // Return an array containing the trigger field and the modal container.
                return [interactiveDisplayField, modalPresentationWrapper];
            case 'ipad':
                return interactiveDisplayField; // iPad only exposes the button; popover is managed internally.
            default:
                console.warn("Unknown OS, returning default picker instance.");
                return valueSelectorInstance;
        }
    };

    this.getContainedPicker = function() {
        return valueSelectorInstance;
    };

    this.getModalContainer = function() {
        return modalPresentationWrapper;
    };

    this.getActivationButton = function() {
        return interactiveDisplayField;
    };

    /**
     * Handles the change event from the picker widget.
     * Updates the internal state and the display field if present.
     * @param {Object} selectionEvent - The event object from the picker's 'change' event.
     */
    function handlePickerSelectionUpdate(selectionEvent) {
        // Ensure the event object and its properties are valid.
        if (!selectionEvent || typeof selectionEvent.rowIndex === 'undefined') {
            console.warn("Invalid selection event received.", selectionEvent);
            return;
        }

        // Update the globally tracked selected index.
        currentSelectionTracker = selectionEvent.rowIndex;

        // If an interactive display field exists, update its value.
        if (interactiveDisplayField) {
            // Retrieve the full row object from the picker to get the display value.
            const selectedRowObject = valueSelectorInstance.getSelectedRow(0);
            if (selectedRowObject && selectedRowObject.title) { // Assuming 'title' is the display property.
                interactiveDisplayField.value = selectedRowObject.title;
            } else {
                // Fallback if title property is not found.
                interactiveDisplayField.value = `Item ${currentSelectionTracker + 1}`;
            }
        }
    }

    // Return the instance of the component.
    return this;
};