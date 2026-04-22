define(['handlebars/runtime'], function(HbsCore) {
    // This module registers compiled Handlebars views with the core templating engine.
    // It ensures the engine is loaded and provides two primary view definitions.

    // A guard clause to verify the Handlebars core is properly initialized.
    if (!HbsCore || typeof HbsCore.template !== 'function') {
        console.error("Templating engine (HbsCore) is not available or properly configured.");
        // Return an empty object to prevent further errors in consuming modules.
        return {};
    }

    // Reference to the Handlebars template compilation function.
    const viewCompiler = HbsCore.template;

    // Initialize or retrieve the global store for compiled views.
    // Renamed from `Handlebars.templates` to `HbsCore.views`.
    let globalViewRegistry = HbsCore.views = HbsCore.views || {};
    const registeredViews = globalViewRegistry; // Local reference to the view store.

    // --- Template Definition 1: Feedback Submission Form ---
    // Original: 'comments/form'
    // Renamed to 'feedback/submissionForm'
    registeredViews['feedback/submissionForm'] = viewCompiler({
        // Updated metadata for the compilation environment.
        engineInfo: [7, ">= 3.0.0-alpha.1"], // Compiler version updated.

        // The main rendering function for this template.
        // Parameters renamed for clarity and to reflect Type III changes.
        renderContent: function(renderContext, renderAssists, nestedComponents, extraRenderData) {
            // Define local constants for function type and missing helper handler.
            const funcType = "function";
            const missingAssistHandler = renderAssists.helperMissing;

            let resolvedAssist; // Variable to hold the dynamically resolved helper or value.

            // Attempt to find the primary content from helpers or the rendering context.
            // This logic is broken down for more explicit steps compared to the original.
            let contentSource = renderAssists.primaryContent; // Renamed `content` to `primaryContent`.
            if (contentSource === undefined || contentSource === null) {
                // If no helper, check the context's primary content property, or the context itself.
                contentSource = (renderContext != null && renderContext.primaryContent !== undefined) ? renderContext.primaryContent : renderContext;
            }

            if (contentSource !== undefined && contentSource !== null) {
                resolvedAssist = contentSource;
            } else {
                resolvedAssist = missingAssistHandler; // Fallback if content is not found.
            }

            let finalRenderedOutput;
            // Check if the resolved item is a function (a helper).
            if (typeof resolvedAssist === funcType) {
                // Call the helper with appropriate context and data.
                finalRenderedOutput = resolvedAssist.call(renderContext, {
                    "componentName": "primaryContent", // Renamed "name" to "componentName".
                    "hash": {},
                    "data": extraRenderData // Renamed `data` property in object.
                });
            } else {
                // Use the value directly if it's not a function.
                finalRenderedOutput = resolvedAssist;
            }

            // Sanitize the output to prevent XSS.
            const htmlSanitizer = this.escapeExpression;

            // Construct the HTML string using a template literal.
            // Changed method from GET to POST, added a class and a data attribute.
            const formMarkup = `<form method="POST" class="submission-form" data-component-identifier="feedback-form">${htmlSanitizer(finalRenderedOutput)}</form>`;
            return formMarkup;
        },
        // Renamed `useData` to `passDataToPartials` for clarity.
        passDataToPartials: true
    });

    // --- Template Definition 2: User List Item Entry ---
    // Original: 'user/listItem'
    // Renamed to 'identity/profileEntry'
    registeredViews['identity/profileEntry'] = viewCompiler({
        engineInfo: [7, ">= 3.0.0-alpha.1"], // Consistent compiler info.

        // The primary function to generate the output for a single user item.
        // Renamed `main` to `generateOutput`.
        generateOutput: function(scopeData, renderingAssists, subViews, additionalContext) {
            // Added a guard clause: If no scope data is provided, return a placeholder.
            if (!scopeData || typeof scopeData !== 'object') {
                return `<li class="user-entry-error">Invalid user data provided.</li>`;
            }

            const functionKind = "function";
            const missingHelperFallback = renderingAssists.helperMissing;
            const outputEncoder = this.escapeExpression;

            let determinedContent;

            // Alternative logic for content resolution.
            // Prioritize `renderAssists.entryText`, then `scopeData.entryText`, then `scopeData` itself.
            let potentialContent = renderingAssists.entryText; // Renamed `content` to `entryText`.
            if (potentialContent === undefined || potentialContent === null) {
                potentialContent = (scopeData && scopeData.entryText !== undefined) ? scopeData.entryText : scopeData;
            }

            determinedContent = (potentialContent !== undefined && potentialContent !== null) ? potentialContent : missingHelperFallback;

            let finalRenderResult;
            if (typeof determinedContent === functionKind) {
                // Execute the content helper.
                finalRenderResult = determinedContent.call(scopeData, {
                    "componentName": "entryText", // Renamed "name".
                    "options": {}, // Added a new empty object for options.
                    "contextInfo": additionalContext // Renamed `data` to `contextInfo`.
                });
            } else {
                // Use the raw content.
                finalRenderResult = determinedContent;
            }

            // Construct the `<li>` element.
            // Changed class name, added a `data-user-id` attribute for illustrative purposes.
            const userId = scopeData.id || 'unknown'; // Accessing an `id` property from `scopeData`.
            const itemHtml = `<li class="profile-entry" data-member-id="${outputEncoder(userId)}">${outputEncoder(finalRenderResult)}</li>`;
            return itemHtml;
        }
        // Deliberately omitted `useData` (or `passDataToPartials`) here to demonstrate deletion of a non-essential statement,
        // assuming its default value (false) is acceptable or it's not needed for this template.
    });

    // Return the collection of all registered views.
    return registeredViews;
});