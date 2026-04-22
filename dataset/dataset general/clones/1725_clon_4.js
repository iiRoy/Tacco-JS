class VisualRefiner {
    constructor() {
        this.transformationRules = new Map();
        this.initializeRules();
    }

    // Configures the styling transformations
    initializeRules() {
        // Group of rules for form and layout adjustments
        this.transformationRules.set('formLayoutAdjustments', [
            // First pass: Handle wrapping of submit buttons that don't have the exact 'btn btn-primary' class
            {
                selectionCriterion: 'input[type="submit"]',
                transformationAction: (element) => {
                    const currentClassAttribute = element.getAttribute('class');
                    if (currentClassAttribute !== 'btn btn-primary') {
                        // Avoid re-wrapping if already inside a 'div.actions'
                        if (!element.parentNode || !element.parentNode.classList.contains('actions')) {
                            this.encapsulateElement(element, 'div', 'actions');
                        }
                    }
                },
                executionPass: 1
            },
            // Second pass: Add 'btn btn-primary' classes to all submit buttons
            {
                selectionCriterion: 'input[type="submit"]',
                transformationAction: (element) => {
                    element.classList.add('btn', 'btn-primary');
                },
                executionPass: 2
            },
            // Add 'btn' class to action links within table cells
            {
                selectionCriterion: 'td.actions > a:not(.btn)',
                transformationAction: (element) => {
                    element.classList.add('btn');
                }
            },
            // Reconfigure 'div.input' elements not exactly 'input added'
            {
                selectionCriterion: 'div.input',
                transformationAction: (element) => {
                    // Replicates [class!="input added"] behavior
                    if (element.getAttribute('class') !== 'input added') {
                        element.className = ''; // Clear all existing classes
                        element.classList.add('clearfix');
                    }
                }
            },
            // Encapsulate specific form controls within 'div.input added'
            {
                selectionCriterion: 'div.clearfix > label ~ input, div.clearfix > label ~ select, div.clearfix > label ~ textarea',
                transformationAction: (element) => {
                    // Avoid re-wrapping if already inside a 'div.input added'
                    if (!element.parentNode || !element.parentNode.classList.contains('input') || !element.parentNode.classList.contains('added')) {
                        this.encapsulateElement(element, 'div', 'input added');
                    }
                }
            }
        ]);

        // Group of rules for message and error displays
        this.transformationRules.set('notificationStyling', [
            { selectionCriterion: '.message', classAdditions: ['alert', 'alert-info'] },
            { selectionCriterion: '.flash_success', classAdditions: ['alert', 'alert-success'] },
            { selectionCriterion: '.flash_warning', classAdditions: ['alert'] },
            { selectionCriterion: '.error-message', classAdditions: ['alert', 'alert-error'] },
            { selectionCriterion: '.form-error', classAdditions: ['error'] },
            // Find the closest 'clearfix' ancestor of 'form-error' and add 'error' class
            {
                selectionCriterion: '.form-error',
                transformationAction: (element) => {
                    let currentAncestor = element.parentNode;
                    while (currentAncestor && currentAncestor !== document) {
                        if (currentAncestor.classList && currentAncestor.classList.contains('clearfix')) {
                            currentAncestor.classList.add('error');
                            break;
                        }
                        currentAncestor = currentAncestor.parentNode;
                    }
                }
            }
        ]);
    }

    // Helper function to wrap an element with a new parent
    encapsulateElement(targetElement, wrapperTag, wrapperClassNames) {
        const newWrapper = document.createElement(wrapperTag);
        if (wrapperClassNames) {
            newWrapper.className = wrapperClassNames;
        }
        targetElement.parentNode.insertBefore(newWrapper, targetElement);
        newWrapper.appendChild(targetElement);
        return newWrapper;
    }

    // Applies a specific set of styling rules
    applyRuleSet(setName) {
        const rulesToApply = this.transformationRules.get(setName);
        if (!rulesToApply) return;

        // Execute rules in their defined passes (default to pass 1 if not specified)
        const passes = [1, 2]; // Define passes explicitly for ordered execution

        passes.forEach(passNumber => {
            rulesToApply.filter(r => (r.executionPass || 1) === passNumber).forEach(rule => {
                const elements = document.querySelectorAll(rule.selectionCriterion);
                elements.forEach(element => {
                    if (rule.classAdditions) {
                        element.classList.add(...rule.classAdditions);
                    }
                    if (rule.transformationAction) {
                        rule.transformationAction(element);
                    }
                });
            });
        });
    }

    // Initiates all defined visual refinements
    refineDocumentVisuals() {
        this.applyRuleSet('formLayoutAdjustments');
        this.applyRuleSet('notificationStyling');
    }
}

// Ensure styling is applied once the document structure is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualRefinerInstance = new VisualRefiner();
    visualRefinerInstance.refineDocumentVisuals();
});