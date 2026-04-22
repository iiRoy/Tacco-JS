DefineComponent(Application.Views, 'WebAddressEntryView').extends(BaseComponent)({

    HTML_TEMPLATE : `
        <div class="web-address-container">
            <form class="address-input-form"></form>
        </div>
    `,

    ROOT_ELEMENT_CLASS : 'web-address-form-control',

    componentMethods : {

        initializeComponent : function setupComponent(componentConfiguration) {
            // Guard clause: Ensure a valid configuration object is provided.
            if (!componentConfiguration || typeof componentConfiguration !== 'object') {
                console.error("WebAddressEntryView: Component initialization failed due to invalid configuration.");
                componentConfiguration = {}; // Fallback to an empty object to prevent errors.
            }

            // Invoke the base component's setup routine.
            BaseComponent.prototype.initializeComponent.call(this, componentConfiguration);

            // Determine the initial value for the address field, prioritizing config over cached.
            const initialAddressValue = componentConfiguration.startingValue || this.cachedValue || '';

            // Instantiate and integrate the text input field sub-component.
            // Renamed and reconfigured properties for clarity and extensibility.
            const addressInputComponent = new Application.Views.TextInputField({
                fieldIdentifier : 'addressField',
                displayLabel : 'Web Address:',
                inputControlHint : 'Provide a full URL (e.g., https://www.example.com)',
                dataType : 'url',
                initialValue : initialAddressValue,
                cssClass : 'web-address-input-control'
            });
            this.addChildComponent(addressInputComponent).renderInto(this.element);
            this.addressInputField = addressInputComponent; // Maintain a direct reference.

            // Instantiate and integrate the action button sub-component.
            const primaryActionButton = new Application.Views.ActionTrigger({
                buttonIdentifier : 'actionButton',
                buttonText : 'Navigate',
                cssClass : 'navigate-action-button',
                isDisabled : true // Start disabled until input is provided.
            });
            this.addChildComponent(primaryActionButton).renderInto(this.element);
            this.actionButton = primaryActionButton; // Maintain a direct reference.

            // Establish all necessary event listeners for user interaction.
            this._establishEventHandlers();

            // Perform an initial validation check to set the button's state.
            this._validateInputAndUpdateButton();
        },

        /**
         * Sets up event listeners for the component's interactive elements.
         * This method ensures that user actions are properly captured and processed.
         * @private
         * @method _establishEventHandlers
         */
        _establishEventHandlers : function attachAllEvents() {
            // Essential check: ensure the root component element exists before attaching listeners.
            if (!this.element) {
                console.warn("WebAddressEntryView: Root element not found, skipping event binding.");
                return;
            }

            // Bind the form's native submission event to a custom handler.
            // This prevents the browser's default form submission behavior.
            this.element.on('submit', this._processFormSubmission.bind(this));

            // Attach a focus event listener to automatically select the input text.
            // Using an arrow function to preserve 'this' context.
            this.addressInputField.on('focus', () => {
                this.addressInputField.inputControlElement.select();
            });

            // Monitor keyup events on the input field to provide dynamic feedback
            // and control the state of the navigation button.
            this.addressInputField.on('keyup', this._validateInputAndUpdateButton.bind(this));

            // Optionally, add a click handler for the button if it needs specific logic
            // beyond form submission (e.g., analytics).
            this.actionButton.on('click', () => {
                console.log("Navigation button clicked.");
                // Additional click-specific logic can go here.
            });
        },

        /**
         * Validates the current value of the address input field and
         * updates the enabled/disabled state of the associated action button.
         * @private
         * @method _validateInputAndUpdateButton
         */
        _validateInputAndUpdateButton : function checkInputState() {
            const currentAddressContent = this.addressInputField.fetchCurrentValue().trim();
            const isInputPopulated = currentAddressContent.length > 0; // Simple check for non-empty.

            if (isInputPopulated) {
                this.actionButton.enable();
            } else {
                this.actionButton.disable();
            }
        },

        /**
         * Processes the form submission event. This method performs input validation,
         * dispatches a custom event with the validated data, and manages submission state.
         * @private
         * @method _processFormSubmission
         * @fires navigationAttempt {addressValue: string} - Dispatched with the validated URL.
         * @returns {boolean} Returns `false` to explicitly prevent default browser form submission.
         */
        _processFormSubmission : function handleSubmission() {
            // Guard against multiple rapid submissions by checking a flag.
            if (this._isSubmissionActive) {
                console.log("Submission already in progress; subsequent attempts are ignored.");
                return false;
            }
            this._isSubmissionActive = true; // Set flag to indicate submission is active.

            const submittedAddress = this.addressInputField.fetchCurrentValue().trim();

            // Perform basic validation: ensure the input is not empty.
            if (!submittedAddress) {
                console.warn("WebAddressEntryView: Submission blocked - address field is empty.");
                this.displayFeedbackMessage("Please enter a valid web address before navigating.", 'error');
                this._isSubmissionActive = false; // Reset flag.
                return false;
            }

            // Dispatch a custom event, notifying parent components or listeners
            // about the attempted navigation with the provided address.
            this.triggerEvent('navigationAttempt', {
                addressValue : submittedAddress
            });

            // Simulate an asynchronous operation (e.g., API call) before resetting the submission flag.
            // This prevents the button from being immediately re-enabled if the operation is quick.
            setTimeout(() => {
                this._isSubmissionActive = false;
                this.displayFeedbackMessage("Navigation request sent.", 'info');
            }, 500); // Reset after 500ms.

            // Crucially, return false to prevent the browser's default form submission behavior.
            return false;
        },

        /**
         * Displays a feedback message to the user, typically for errors or confirmations.
         * In a full implementation, this might update a dedicated message display area.
         * @param {string} message - The text of the message to display.
         * @param {string} type - The type of message (e.g., 'info', 'error', 'success').
         * @private
         * @method displayFeedbackMessage
         */
        displayFeedbackMessage : function showUserFeedback(message, type = 'info') {
            // For this clone, we'll log to the console. In a real application,
            // this would update a UI element (e.g., a div below the form).
            switch (type) {
                case 'error':
                    console.error(`Feedback [ERROR]: ${message}`);
                    break;
                case 'warn':
                    console.warn(`Feedback [WARNING]: ${message}`);
                    break;
                case 'info':
                default:
                    console.info(`Feedback [INFO]: ${message}`);
                    break;
            }
        },

        // Private property to track if a form submission is currently active.
        _isSubmissionActive : false
    }
});