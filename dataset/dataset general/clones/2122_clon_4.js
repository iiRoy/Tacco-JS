window.addEventListener('DOMContentLoaded', function() {

    const obtainElement = (idString) => document.querySelector(idString);
    const concealElement = (item) => {
        if (item) item.style.display = 'none';
    };
    const exposeElement = (item) => {
        if (item) item.style.display = '';
    };

    const retrieveDataFromEndpoint = async (resourcePath) => {
        try {
            const responseUnit = await fetch(resourcePath);
            if (!responseUnit.ok) {
                throw new Error(`Service issue! Status: ${responseUnit.status}`);
            }
            return await responseUnit.json();
        } catch (problem) {
            console.error('Data acquisition error:', problem);
            return null;
        }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Adjusting geographical selectors based on national choice
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const manageGeographicalOptions = async (identificationTag) => {
        const nationSelectionInput = obtainElement(`#${identificationTag}_countries_dropdown`);
        const regionalTextInput = obtainElement(`#${identificationTag}_address_states_input`);
        const regionalOptionSelector = obtainElement(`#${identificationTag}_address_states_dropdown`);

        if (!nationSelectionInput || !regionalTextInput || !regionalOptionSelector) return;

        concealElement(regionalTextInput);
        concealElement(regionalOptionSelector);

        const currentNationId = nationSelectionInput.value;
        const apiSource = `/states/by_country?country_id=${currentNationId}`;

        const receivedInformation = await retrieveDataFromEndpoint(apiSource);

        if (receivedInformation && receivedInformation.states && receivedInformation.states.length > 0) {
            exposeElement(regionalOptionSelector);
            regionalOptionSelector.innerHTML = '';

            receivedInformation.states.forEach(stateEntry => {
                const newChoice = document.createElement('option');
                newChoice.value = stateEntry.id;
                newChoice.textContent = stateEntry.name;
                regionalOptionSelector.appendChild(newChoice);
            });

            const initialSelectionValue = regionalOptionSelector.getAttribute('data-initial-selection');
            if (initialSelectionValue) {
                regionalOptionSelector.value = initialSelectionValue;
            }

        } else {
            exposeElement(regionalTextInput);
        }
    };

    const mainBillingNationSelector = obtainElement("#bill_countries_dropdown");
    if (mainBillingNationSelector) {
        manageGeographicalOptions('bill');
        manageGeographicalOptions('ship');

        mainBillingNationSelector.addEventListener('change', () => manageGeographicalOptions('bill'));
        obtainElement("#ship_countries_dropdown").addEventListener('change', () => manageGeographicalOptions('ship'));
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Toggling delivery address panel visibility
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const synchronizeDeliveryAddressPanel = () => {
        const primaryAddressToggleSwitch = obtainElement('#use_billing');
        const deliveryDetailsPanel = obtainElement('#ship_address_form');

        if (!primaryAddressToggleSwitch || !deliveryDetailsPanel) return;

        if (primaryAddressToggleSwitch.checked) {
            concealElement(deliveryDetailsPanel);
        } else {
            exposeElement(deliveryDetailsPanel);
        }
    };

    synchronizeDeliveryAddressPanel();
    obtainElement('#use_billing')?.addEventListener('click', synchronizeDeliveryAddressPanel);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Submission form integrity check
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const primarySubmissionElement = obtainElement("#checkout-form");

    if (primarySubmissionElement) {
        const integrityCheckEngine = (formContainer, fieldValidationRules, problemIndicator, successIndicator) => {
            let overallResult = true;

            const targetFields = Object.keys(fieldValidationRules).map(fieldAlias => {
                return formContainer.querySelector(`[name="${fieldAlias}"]`);
            }).filter(Boolean);

            targetFields.forEach(dataField => {
                const fieldAlias = dataField.name;
                const ruleset = fieldValidationRules[fieldAlias];
                const enclosingGroup = dataField.closest('.control-group');

                let fieldPasses = true;

                if (ruleset.required && (!dataField.value || dataField.value.trim() === '')) {
                    fieldPasses = false;
                }

                if (!fieldPasses) {
                    overallResult = false;
                    if (enclosingGroup) {
                        problemIndicator(dataField, enclosingGroup);
                    }
                } else {
                    if (enclosingGroup) {
                        successIndicator(dataField, enclosingGroup);
                    }
                }
            });

            return overallResult;
        };

        const markAsProblem = (offendingField, containingUnit) => {
            containingUnit.classList.remove('success');
            containingUnit.classList.add('error');
        };

        const confirmAsValid = (validatedField, containingUnit) => {
            validatedField.classList.add('valid');
            containingUnit.classList.remove('error');
        };

        const validationConfiguration = {
            'agree': { required: true },
            'order[bill_address_attributes][firstname]': { required: true },
            'order[bill_address_attributes][lastname]': { required: true },
            'order[bill_address_attributes][phone]': { required: true },
            'order[bill_address_attributes][address1]': { required: true },
            'order[bill_address_attributes][city]': { required: true },
            'order[bill_address_attributes][zip]': { required: true },
            'order[bill_address_attributes][country_id]': { required: true },
            'order[bill_address_attributes][state_id]': { required: true }
        };

        primarySubmissionElement.addEventListener('submit', (eventSignal) => {
            eventSignal.preventDefault();

            const formIsAcceptable = integrityCheckEngine(
                primarySubmissionElement,
                validationConfiguration,
                markAsProblem,
                confirmAsValid
            );

            if (formIsAcceptable) {
                console.log('Form is acceptable for processing!');
                // primarySubmissionElement.submit(); // Actual submission would occur here
            } else {
                console.log('Form contains integrity violations.');
            }
        });
    }

});