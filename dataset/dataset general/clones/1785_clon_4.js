var GlobalAppComponents = {};

GlobalAppComponents.WebAddressEntry = (function() {

    class InternalField {
        constructor(configuration) {
            this.domElement = document.createElement('input');
            this.domElement.name = configuration.componentName;
            this.domElement.type = configuration.elementKind;
            this.domElement.value = configuration.initialContent || '';
            this.domElement.className = configuration.styleClass;

            this.labelContainer = document.createElement('label');
            this.labelContainer.textContent = configuration.captionText;
            this.labelContainer.appendChild(this.domElement);

            this.associatedElement = this.domElement;
        }

        fetchValue() {
            return this.domElement.value;
        }

        attachEvent(eventName, eventHandler) {
            this.domElement.addEventListener(eventName, eventHandler);
        }

        displayIn(parentDomElement) {
            parentDomElement.appendChild(this.labelContainer);
        }
    }

    class InternalAction {
        constructor(configuration) {
            this.domElement = document.createElement('button');
            this.domElement.name = configuration.componentName;
            this.domElement.textContent = configuration.buttonCaption;
            this.domElement.className = configuration.styleClass;
            this.domElement.type = 'submit';
        }

        attachEvent(eventName, eventHandler) {
            this.domElement.addEventListener(eventName, eventHandler);
        }

        displayIn(parentDomElement) {
            parentDomElement.appendChild(this.domElement);
        }
    }

    class UnifiedAddressPanel extends EventTarget {
        constructor(settingsObject) {
            super();

            this.mainPanel = document.createElement('form');
            this.mainPanel.className = 'unified-address-display';

            this.addressEntryField = new InternalField({
                componentName: 'addressEntryField',
                captionText: 'Location Resource:',
                elementKind: 'url',
                initialContent: settingsObject.startingAddress || '',
                styleClass: 'address-entry-element'
            });

            this.triggerButton = new InternalAction({
                componentName: 'triggerButton',
                buttonCaption: 'Activate',
                styleClass: 'address-entry-action'
            });

            this.addressEntryField.displayIn(this.mainPanel);
            this.triggerButton.displayIn(this.mainPanel);

            this.setupEventHandlers();
        }

        setupEventHandlers() {
            this.mainPanel.addEventListener('submit', this.handleFormSubmission.bind(this));
            this.addressEntryField.attachEvent('click', () => {
                this.addressEntryField.associatedElement.select();
            });
        }

        handleFormSubmission(eventObject) {
            eventObject.preventDefault();

            const submittedAddress = this.addressEntryField.fetchValue();

            const customEventData = new CustomEvent('resourceSubmitted', {
                detail: {
                    resourcePath: submittedAddress
                }
            });
            this.dispatchEvent(customEventData);
        }

        getComponentRoot() {
            return this.mainPanel;
        }
    }

    return UnifiedAddressPanel;

})();