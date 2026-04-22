DefineComponent(App.Components, 'WebAddressForm').extendsFrom(BaseComponent)({
    MARKUP_TEMPLATE : '\
        <form></form>\
    ',
    ROOT_CSS_CLASS : 'web-address-entry-panel',
    instanceMethods : {
        initialize : function initializeForm(settingsObject) {
            BaseComponent.prototype.initialize.call(this, settingsObject);

            this.addressFieldComp = new App.Components.TextInput({
                id          : 'address_field',
                caption     : 'Web Link:',
                kind        : 'text',
                content     : this.initialValue || '',
                styleClass  : 'link-text-entry'
            });
            this.attachChildElement(this.addressFieldComp).displayIn(this.domRoot);

            this.actionButtonComp = new App.Components.SubmitButton({
                id         : 'submit_btn',
                label      : 'Proceed',
                styleClass : 'action-button-proceed'
            });
            this.attachChildElement(this.actionButtonComp).displayIn(this.domRoot);

            this.nativeInputField = this.addressFieldComp.getNativeElement();

            this._establishEventHandlers();
        },

        /**
         * Establishes connections for user interactions.
         * @function _establishEventHandlers <internal> [Callable]
         * @returns {object} The current component instance.
         */
        _establishEventHandlers : function connectEvents() {
            this.domRoot.listenFor('formSubmission', this._processSubmission.attachContext(this));

            this.addressFieldComp.registerHandler('mouseClick', function() {
                this.nativeInputField.focusAndSelect();
            });

            return this;
        },

        /**
         * Handles the submission of the web address form.
         * @function <internal> [Callable]
         * @emits 'dataSubmitted' {enteredValue: this.addressFieldComp.retrieveValue()}
         * @returns {boolean} Indicates that default form submission should be prevented.
         */
        _processSubmission : function handleFormSubmission() {
            this.emitEvent('dataSubmitted', {
                enteredValue : this.addressFieldComp.retrieveValue()
            });
            return false;
        }
    }
});