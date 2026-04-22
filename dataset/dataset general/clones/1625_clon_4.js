document.addEventListener('DOMContentLoaded', () => {
    const securityValue = document.head.querySelector('meta[name="csrf-token"]')?.content;
    const securityKey = document.head.querySelector('meta[name="csrf-param"]')?.content;

    /**
     * Dispatches a custom event and checks if any handler prevented its default action.
     * Mimics jQuery's custom event handling with `event.result !== false`.
     */
    const signalAndVerify = (elementToSignal, signalName, signalPayload = {}) => {
        const customSignal = new CustomEvent(signalName, {
            bubbles: true,
            cancelable: true,
            detail: signalPayload
        });
        elementToSignal.dispatchEvent(customSignal);
        return !customSignal.defaultPrevented;
    };

    /**
     * Manages remote data transfer operations using the Fetch API.
     * Dispatches custom events at various stages of the operation.
     */
    const initiateRemoteOperation = async (triggeringElement) => {
        const operationVerb = triggeringElement.getAttribute('method') || triggeringElement.getAttribute('data-method') || 'GET';
        let destinationPath = triggeringElement.getAttribute('action') || triggeringElement.getAttribute('href');
        const responseFormat = triggeringElement.getAttribute('data-type') || 'text';

        if (!destinationPath) {
            throw new Error("No target path specified for remote operation (action or href must be present).");
        }

        if (signalAndVerify(triggeringElement, 'remote:preflight')) {
            let payloadContent = null;
            const fetchOptions = {
                method: operationVerb.toUpperCase(),
                headers: {}
            };

            if (triggeringElement.tagName === 'FORM') {
                const formDataInstance = new FormData(triggeringElement);
                if (operationVerb.toUpperCase() === 'GET') {
                    destinationPath += '?' + new URLSearchParams(formDataInstance).toString();
                } else {
                    payloadContent = formDataInstance;
                }
            }
            // For non-form elements, original jQuery passes an empty array as data,
            // which translates to no body content in a native fetch request.

            if (payloadContent instanceof FormData && operationVerb.toUpperCase() !== 'GET') {
                fetchOptions.body = payloadContent;
            } else if (payloadContent && typeof payloadContent === 'object') {
                fetchOptions.body = JSON.stringify(payloadContent);
                fetchOptions.headers['Content-Type'] = 'application/json';
            }

            try {
                triggeringElement.dispatchEvent(new CustomEvent('remote:dispatching', { detail: { element: triggeringElement } }));
                const response = await fetch(destinationPath, fetchOptions);

                if (response.ok) {
                    let responseData;
                    switch (responseFormat) {
                        case 'json':
                            responseData = await response.json();
                            break;
                        case 'script':
                            const scriptText = await response.text();
                            // Eval is generally dangerous but matches jQuery's dataType: 'script' behavior.
                            window.eval(scriptText);
                            responseData = scriptText;
                            break;
                        case 'html':
                            responseData = await response.text();
                            break;
                        default:
                            responseData = await response.text();
                    }
                    triggeringElement.dispatchEvent(new CustomEvent('remote:success', { detail: { data: responseData, status: response.status, response: response } }));
                } else {
                    triggeringElement.dispatchEvent(new CustomEvent('remote:fail', { detail: { response: response, status: response.status, error: response.statusText } }));
                }
            } catch (operationError) {
                triggeringElement.dispatchEvent(new CustomEvent('remote:fail', { detail: { error: operationError } }));
            } finally {
                triggeringElement.dispatchEvent(new CustomEvent('remote:completion'));
            }
        }
        triggeringElement.dispatchEvent(new CustomEvent('remote:postflight'));
    };

    /**
     * Event handler for elements with 'data-confirm' attribute.
     * Displays a confirmation dialog before proceeding.
     */
    document.body.addEventListener('click', (eventOccasion) => {
        const interactiveElement = eventOccasion.target.closest('[data-confirm]');
        if (interactiveElement) {
            if (signalAndVerify(interactiveElement, 'confirm:check')) {
                if (!window.confirm(interactiveElement.getAttribute('data-confirm'))) {
                    eventOccasion.preventDefault();
                    eventOccasion.stopImmediatePropagation();
                }
            }
        }
    });

    /**
     * Event handler for form submissions with 'data-remote' attribute.
     * Prevents default submission and initiates a remote operation.
     */
    document.body.addEventListener('submit', (eventOccasion) => {
        const formElement = eventOccasion.target.closest('form[data-remote]');
        if (formElement) {
            eventOccasion.preventDefault();
            initiateRemoteOperation(formElement);
        }
    });

    /**
     * Event handler for clicks on 'data-remote' links/inputs.
     * Prevents default action and initiates a remote operation.
     */
    document.body.addEventListener('click', (eventOccasion) => {
        const clickableElement = eventOccasion.target.closest('a[data-remote],input[data-remote]');
        if (clickableElement) {
            eventOccasion.preventDefault();
            initiateRemoteOperation(clickableElement);
        }
    });

    /**
     * Event handler for links with 'data-method' (not 'data-remote').
     * Creates and submits a hidden form to simulate different HTTP methods.
     */
    document.body.addEventListener('click', (eventOccasion) => {
        const linkElement = eventOccasion.target.closest('a[data-method]:not([data-remote])');
        if (linkElement) {
            eventOccasion.preventDefault();
            const targetPath = linkElement.getAttribute('href');
            const desiredMethod = linkElement.getAttribute('data-method');

            const temporaryForm = document.createElement('form');
            temporaryForm.method = 'POST'; // Method override forms always use POST
            temporaryForm.action = targetPath;
            temporaryForm.style.display = 'none';

            const methodOverrideInput = document.createElement('input');
            methodOverrideInput.type = 'hidden';
            methodOverrideInput.name = '_method';
            methodOverrideInput.value = desiredMethod;
            temporaryForm.appendChild(methodOverrideInput);

            if (securityKey && securityValue) {
                const securityInput = document.createElement('input');
                securityInput.type = 'hidden';
                securityInput.name = securityKey;
                securityInput.value = securityValue;
                temporaryForm.appendChild(securityInput);
            }

            document.body.appendChild(temporaryForm);
            temporaryForm.submit();
            // The form is typically removed by browser navigation or garbage collection.
        }
    });

    /**
     * Handlers for disabling/enabling input elements during remote operations.
     */
    const disablerAttribute = 'data-inhibit-action'; // Renamed from data-disable-with

    document.body.addEventListener('remote:preflight', (eventOccasion) => {
        const originatingForm = eventOccasion.target.closest('form[data-remote]');
        if (originatingForm) {
            originatingForm.querySelectorAll(`input[${disablerAttribute}]`).forEach(controlField => {
                controlField.dataset.originalValue = controlField.value; // Store original value in dataset
                controlField.value = controlField.getAttribute(disablerAttribute);
                controlField.disabled = true;
            });
        }
    });

    document.body.addEventListener('remote:completion', (eventOccasion) => {
        const originatingForm = eventOccasion.target.closest('form[data-remote]');
        if (originatingForm) {
            originatingForm.querySelectorAll(`input[${disablerAttribute}]`).forEach(controlField => {
                controlField.disabled = false;
                if (controlField.dataset.originalValue !== undefined) {
                    controlField.value = controlField.dataset.originalValue; // Restore original value
                    delete controlField.dataset.originalValue; // Clean up stored value
                }
            });
        }
    });
});