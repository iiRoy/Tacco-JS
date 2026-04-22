// Custom Tooltip Activation System
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-hint-toggle="hint"]').forEach(element => {
        if (element.hasAttribute('title')) {
            const initialHintText = element.getAttribute('title');
            element.removeAttribute('title'); // Prevent default browser tooltip

            let hintComponent;

            const revealHint = () => {
                if (!hintComponent) {
                    hintComponent = document.createElement('div');
                    hintComponent.className = 'custom-hint-display-panel'; // Distinct class
                    hintComponent.textContent = initialHintText;
                    document.body.appendChild(hintComponent);
                    Object.assign(hintComponent.style, {
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: '9999',
                        backgroundColor: '#333',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        opacity: '0',
                        transition: 'opacity 0.2s ease-in-out',
                        whiteSpace: 'nowrap'
                    });
                }
                const boundingBox = element.getBoundingClientRect();
                Object.assign(hintComponent.style, {
                    left: `${boundingBox.left + window.scrollX}px`,
                    top: `${boundingBox.bottom + window.scrollY + 5}px`,
                    opacity: '1'
                });
            };

            const concealHint = () => {
                if (hintComponent) {
                    hintComponent.style.opacity = '0';
                    setTimeout(() => {
                        if (hintComponent && hintComponent.parentNode) {
                            hintComponent.parentNode.removeChild(hintComponent);
                            hintComponent = null;
                        }
                    }, 200);
                }
            };

            element.addEventListener('mouseenter', revealHint);
            element.addEventListener('mouseleave', concealHint);
            element.addEventListener('focus', revealHint);
            element.addEventListener('blur', concealHint);
        }
    });
});

// Inquiry Form Processing Mechanism
const formValidationController = (() => {
    const fieldValidationMap = new Map();
    const feedbackStyles = {
        issueGroupClass: 'validation-issue-group',
        adviceBlockClass: 'validation-advice-block'
    };
    const standardFeedback = {
        mandatory: 'This field is required.',
        formatMismatch: 'Value does not match the expected format.',
        lengthExceeds: (limit) => `Maximum length is ${limit} characters.`,
        lengthInsufficient: (limit) => `Minimum length is ${limit} characters.`,
        invalidEmail: 'Please enter a valid electronic mail address.',
        notNumeric: 'Please enter a numerical value.',
        valueTooHigh: (limit) => `Value cannot exceed ${limit}.`,
        valueTooLow: (limit) => `Value must be at least ${limit}.`
    };

    const retrieveCurrentFieldValue = (targetElement) => {
        if (targetElement.type === 'checkbox' || targetElement.type === 'radio') {
            return targetElement.checked;
        }
        return targetElement.value;
    };

    const registerFieldRules = (fieldItem) => {
        const rulesForCurrentField = [];

        if (fieldItem.hasAttribute('required') || fieldItem.getAttribute('aria-required') === 'true') {
            rulesForCurrentField.push({
                kind: 'mandatory',
                test: (val) => val !== null && val !== undefined && String(val).trim() !== '',
                response: fieldItem.dataset.validationRequiredMessage || standardFeedback.mandatory
            });
        }

        if (fieldItem.hasAttribute('pattern')) {
            try {
                const patternExpression = new RegExp(fieldItem.getAttribute('pattern'));
                rulesForCurrentField.push({
                    kind: 'pattern',
                    test: (val) => patternExpression.test(val),
                    response: fieldItem.dataset.validationPatternMessage || standardFeedback.formatMismatch
                });
            } catch (e) {
                console.warn('Invalid regex pattern:', fieldItem.getAttribute('pattern'), e);
            }
        }

        if (fieldItem.hasAttribute('maxlength')) {
            const maxAllowedLength = parseInt(fieldItem.getAttribute('maxlength'), 10);
            rulesForCurrentField.push({
                kind: 'maxlength',
                test: (val) => String(val).length <= maxAllowedLength,
                response: fieldItem.dataset.validationMaxlengthMessage || standardFeedback.lengthExceeds(maxAllowedLength)
            });
        }

        if (fieldItem.hasAttribute('minlength')) {
            const minRequiredLength = parseInt(fieldItem.getAttribute('minlength'), 10);
            rulesForCurrentField.push({
                kind: 'minlength',
                test: (val) => String(val).length >= minRequiredLength,
                response: fieldItem.dataset.validationMinlengthMessage || standardFeedback.lengthInsufficient(minRequiredLength)
            });
        }

        if (fieldItem.type === 'email') {
            rulesForCurrentField.push({
                kind: 'email',
                test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
                response: fieldItem.dataset.validationValidemailMessage || fieldItem.dataset.validationEmailMessage || standardFeedback.invalidEmail
            });
        }

        if (fieldItem.type === 'number') {
            rulesForCurrentField.push({
                kind: 'number',
                test: (val) => !isNaN(parseFloat(val)) && isFinite(val),
                response: fieldItem.dataset.validationNumberMessage || standardFeedback.notNumeric
            });
        }

        if (fieldItem.hasAttribute('max') || fieldItem.hasAttribute('aria-valuemax')) {
            const maxValue = parseFloat(fieldItem.getAttribute('max') || fieldItem.getAttribute('aria-valuemax'));
            rulesForCurrentField.push({
                kind: 'max',
                test: (val) => parseFloat(val) <= maxValue,
                response: fieldItem.dataset.validationMaxMessage || standardFeedback.valueTooHigh(maxValue)
            });
        }

        if (fieldItem.hasAttribute('min') || fieldItem.hasAttribute('aria-valuemin')) {
            const minValue = parseFloat(fieldItem.getAttribute('min') || fieldItem.getAttribute('aria-valuemin'));
            rulesForCurrentField.push({
                kind: 'min',
                test: (val) => parseFloat(val) >= minValue,
                response: fieldItem.dataset.validationMinMessage || standardFeedback.valueTooLow(minValue)
            });
        }

        fieldValidationMap.set(fieldItem, rulesForCurrentField);
    };

    const evaluateFieldCorrectness = (fieldItem) => {
        const currentRules = fieldValidationMap.get(fieldItem);
        const itemValue = retrieveCurrentFieldValue(fieldItem);
        const containingGroup = fieldItem.closest('.form-group');
        const adviceContainer = containingGroup ? containingGroup.querySelector(`.${feedbackStyles.adviceBlockClass}`) : null;
        const recordedDefects = [];

        if (adviceContainer) {
            adviceContainer.innerHTML = '';
            containingGroup.classList.remove('has-error', 'has-warning');
        }
        fieldItem.classList.remove('is-invalid-input');

        if (currentRules) {
            for (const rule of currentRules) {
                if (!rule.test(itemValue)) {
                    recordedDefects.push(rule.response);
                }
            }
        }

        if (recordedDefects.length > 0) {
            if (containingGroup) {
                containingGroup.classList.add('has-error');
            }
            fieldItem.classList.add('is-invalid-input');
            if (adviceContainer) {
                adviceContainer.innerHTML = recordedDefects.join('<br>');
            }
            return {
                legitimate: false,
                comments: recordedDefects
            };
        }
        return {
            legitimate: true,
            comments: []
        };
    };

    const activateFormValidation = (formHandle, settings) => {
        const relevantInputs = formHandle.querySelectorAll('input, textarea');
        relevantInputs.forEach(input => {
            if (settings.elementVisibilityCheck && !settings.elementVisibilityCheck.call(input)) {
                return;
            }
            registerFieldRules(input);
        });

        formHandle.addEventListener('submit', async (submissionEvent) => {
            let formHasDefects = false;
            const compiledDefects = {};

            relevantInputs.forEach(input => {
                const checkOutcome = evaluateFieldCorrectness(input);
                if (!checkOutcome.legitimate) {
                    formHasDefects = true;
                    compiledDefects[input.name || input.id] = checkOutcome.comments;
                }
            });

            if (formHasDefects) {
                if (settings.blockSubmission) {
                    submissionEvent.preventDefault();
                }
                formHandle.classList.add('has-error');
                if (typeof settings.onErrorFeedback === 'function') {
                    settings.onErrorFeedback(formHandle, submissionEvent, compiledDefects);
                }
            } else {
                formHandle.classList.remove('has-error');
                if (typeof settings.onSuccessConfirmation === 'function') {
                    submissionEvent.preventDefault();
                    settings.onSuccessConfirmation(formHandle, submissionEvent);
                }
            }
        });

        relevantInputs.forEach(input => {
            input.addEventListener('blur', () => evaluateFieldCorrectness(input));
            input.addEventListener('change', () => evaluateFieldCorrectness(input));
        });
    };

    return {
        setup: activateFormValidation
    };
})();

document.addEventListener('DOMContentLoaded', () => {

    formValidationController.setup(document.getElementById('inquiryForm'), {
        blockSubmission: true,
        onErrorFeedback: (currentForm, actionEvent, issueReports) => {
            // Additional error messages or events can be handled here
        },
        onSuccessConfirmation: async (currentForm, actionEvent) => {
            const contactName = document.getElementById('participantName').value;
            const contactMail = document.getElementById('participantEmail').value;
            const contactPhone = document.getElementById('participantContact').value;
            const contactNote = document.getElementById('participantMessage').value;

            let displayedNamePortion = contactName;
            if (displayedNamePortion.includes(' ')) {
                displayedNamePortion = contactName.split(' ').slice(0, -1).join(' ');
            }

            try {
                const remoteResponse = await fetch("././mail/contact_processor.php", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        senderName: contactName,
                        senderContact: contactPhone,
                        senderMail: contactMail,
                        senderNote: contactNote
                    }),
                });

                if (remoteResponse.ok) {
                    const resultContainer = document.getElementById('resultDisplay');
                    resultContainer.innerHTML = `
                        <div class="status-panel success-status">
                            <button type="button" class="dismiss-button" data-cancel-alert="alert" visually-concealed="true">&times;</button>
                            <strong>Your communication has been transmitted. </strong>
                        </div>
                    `;
                    resultContainer.querySelector('.dismiss-button').addEventListener('click', (e) => {
                        e.target.closest('.status-panel').remove();
                    });
                    currentForm.reset();
                } else {
                    const resultContainer = document.getElementById('resultDisplay');
                    resultContainer.innerHTML = `
                        <div class="status-panel failure-status">
                            <button type="button" class="dismiss-button" data-cancel-alert="alert" visually-concealed="true">&times;</button>
                            <strong>Apologies ${displayedNamePortion}, it appears our messaging service is unresponsive. Kindly attempt again later!</strong>
                        </div>
                    `;
                    resultContainer.querySelector('.dismiss-button').addEventListener('click', (e) => {
                        e.target.closest('.status-panel').remove();
                    });
                    currentForm.reset();
                }
            } catch (exception) {
                const resultContainer = document.getElementById('resultDisplay');
                resultContainer.innerHTML = `
                    <div class="status-panel failure-status">
                        <button type="button" class="dismiss-button" data-cancel-alert="alert" visually-concealed="true">&times;</button>
                        <strong>Apologies ${displayedNamePortion}, an unexpected issue occurred. Kindly attempt again later!</strong>
                    </div>
                `;
                resultContainer.querySelector('.dismiss-button').addEventListener('click', (e) => {
                    e.target.closest('.status-panel').remove();
                });
                currentForm.reset();
            }
        },
        elementVisibilityCheck: function() {
            return this.offsetWidth > 0 || this.offsetHeight > 0 || this.getClientRects().length > 0;
        },
    });

    document.querySelectorAll('a[data-activate-section="section"]').forEach(activationLink => {
        activationLink.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = activationLink.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                document.querySelectorAll('.nav-tabs .active, .tab-content .active.in').forEach(el => {
                    el.classList.remove('active', 'in');
                });
                activationLink.closest('li').classList.add('active');
                targetElement.classList.add('active', 'in');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const nameInputForFocus = document.getElementById('participantName');
    if (nameInputForFocus) {
        nameInputForFocus.addEventListener('focus', () => {
            const resultDisplayArea = document.getElementById('resultDisplay');
            if (resultDisplayArea) {
                resultDisplayArea.innerHTML = '';
            }
        });
    }
});