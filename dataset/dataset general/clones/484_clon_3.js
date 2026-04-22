// This file manages the creation and presentation of specific content annotations within a system.

var viewMarkupSource = require('../views/item_display.html'); // External HTML template for rendering display fragments.

/**
 * Constructs a new AnnotationItem instance.
 * Represents a piece of user-generated content or a system note tied to a specific context.
 * @param {string} contextIdentifier - A unique identifier for the parent content or section this annotation belongs to.
 * @param {object} [initialProps={}] - An optional object containing initial data properties for the annotation.
 */
function AnnotationItem(contextIdentifier, initialProps) {
    // Validate essential input
    if (typeof contextIdentifier !== 'string' || contextIdentifier.trim() === '') {
        throw new Error('AnnotationItem: A valid string contextIdentifier is absolutely required for instantiation.');
    }

    // Prepare internal properties
    const effectivePayload = initialProps && typeof initialProps === 'object' ? { ...initialProps } : {};
    
    // Assign core properties
    this.linkedContext = contextIdentifier; // The context this annotation is associated with
    this.dataPayload = {
        ...effectivePayload,
        creationTimestamp: new Date().toISOString(), // Add a system-generated timestamp
        status: 'active' // Default status
    };

    // Internal flag for lifecycle management
    this._instanceInitialized = true;
}

/**
 * Generates a textual or HTML representation of the AnnotationItem for display purposes.
 * This method simulates rendering using a template and current instance data.
 * @returns {string} A string representing the visual output, or an error message if not initialized.
 */
AnnotationItem.prototype.produceVisualRepresentation = function() {
    // Pre-rendering checks
    if (!this._instanceInitialized) {
        console.error('Attempted to render an uninitialized AnnotationItem.');
        return '<div class="error-message">Error: Annotation item was not properly initialized.</div>';
    }

    // Simulate template usage (viewMarkupSource is not a function, just a path here)
    const baseTemplateRef = viewMarkupSource; 
    let outputBuffer = [];

    // Constructing a simple HTML string based on instance data
    outputBuffer.push(`<article class="content-annotation" data-context-id="${this.linkedContext}">`);
    outputBuffer.push(`  <header>`);
    outputBuffer.push(`    <h3 class="annotation-title">Annotation for Context: ${this.linkedContext}</h3>`);
    outputBuffer.push(`    <time datetime="${this.dataPayload.creationTimestamp}">Created: ${new Date(this.dataPayload.creationTimestamp).toLocaleString()}</time>`);
    outputBuffer.push(`  </header>`);
    outputBuffer.push(`  <section class="annotation-body">`);
    
    // Dynamically adding properties from dataPayload
    for (const key in this.dataPayload) {
        if (Object.prototype.hasOwnProperty.call(this.dataPayload, key)) {
            // Exclude timestamp from direct display as it's in the header
            if (key !== 'creationTimestamp') {
                outputBuffer.push(`    <p class="prop-item"><strong>${key}:</strong> <span>${this.dataPayload[key]}</span></p>`);
            }
        }
    }

    outputBuffer.push(`  </section>`);
    outputBuffer.push(`  <footer>`);
    outputBuffer.push(`    <span class="annotation-status">Status: ${this.dataPayload.status}</span>`);
    outputBuffer.push(`    <!-- Template reference: ${baseTemplateRef} -->`); // Placeholder reference
    outputBuffer.push(`  </footer>`);
    outputBuffer.push(`</article>`);

    // Join all parts and return
    return outputBuffer.join('\n');
};