class VisualToggleManager {
    constructor(displayElement, setupParameters = {}) {
        if (!displayElement || displayElement.tagName !== 'INPUT' || displayElement.type !== 'checkbox') {
            return;
        }

        this.associatedElement = displayElement;
        this.componentOptions = setupParameters;
        this.visualComponentInstance = null;
        this.previousStatusOfDisabled = null;

        this.elementChangeMonitor = this.elementChangeMonitor.bind(this);
        this.attributeChangeObserver = this.attributeChangeObserver.bind(this);

        this.initializeAttributeMonitor();
        this.constructVisualComponent();
    }

    initializeAttributeMonitor() {
        this.observerForAttributes = new MutationObserver(this.attributeChangeObserver);
        this.observerForAttributes.observe(this.associatedElement, {
            attributes: true,
            attributeFilter: ['disabled']
        });
        this.previousStatusOfDisabled = this.associatedElement.disabled;
    }

    attributeChangeObserver(mutationRecords) {
        for (let record of mutationRecords) {
            if (record.type === 'attributes' && record.attributeName === 'disabled') {
                const currentDisabledState = this.associatedElement.disabled;
                if (currentDisabledState !== this.previousStatusOfDisabled) {
                    this.previousStatusOfDisabled = currentDisabledState;
                    this.constructVisualComponent();
                }
            }
        }
    }

    constructVisualComponent() {
        if (this.visualComponentInstance) {
            if (this.visualComponentInstance.switcher && this.visualComponentInstance.switcher.parentNode) {
                this.visualComponentInstance.switcher.parentNode.removeChild(this.visualComponentInstance.switcher);
            }
            this.visualComponentInstance.element.removeEventListener('change', this.elementChangeMonitor);
        }

        this.visualComponentInstance = new Switchery(this.associatedElement, this.componentOptions);
        this.visualComponentInstance.element.checked = this.associatedElement.checked;
        this.visualComponentInstance.setPosition(false);

        this.visualComponentInstance.element.addEventListener('change', this.elementChangeMonitor);
    }

    elementChangeMonitor(event) {
        const notificationEvent = new CustomEvent('toggleStateModified', {
            detail: {
                currentValue: this.associatedElement.checked,
                originalEvent: event
            },
            bubbles: true
        });
        this.associatedElement.dispatchEvent(notificationEvent);
    }

    get currentToggleValue() {
        return this.associatedElement.checked;
    }

    set currentToggleValue(newValue) {
        if (typeof newValue === 'boolean' && newValue !== this.associatedElement.checked) {
            this.associatedElement.checked = newValue;
            if (this.visualComponentInstance) {
                this.visualComponentInstance.setPosition(true);
            }
            const notificationEvent = new CustomEvent('toggleStateModified', {
                detail: {
                    currentValue: newValue,
                    originalEvent: null
                },
                bubbles: true
            });
            this.associatedElement.dispatchEvent(notificationEvent);
        }
    }

    deactivate() {
        if (this.visualComponentInstance) {
            this.visualComponentInstance.element.removeEventListener('change', this.elementChangeMonitor);
            if (this.visualComponentInstance.switcher && this.visualComponentInstance.switcher.parentNode) {
                this.visualComponentInstance.switcher.parentNode.removeChild(this.visualComponentInstance.switcher);
            }
            this.visualComponentInstance = null;
        }
        if (this.observerForAttributes) {
            this.observerForAttributes.disconnect();
            this.observerForAttributes = null;
        }
        this.associatedElement = null;
    }
}