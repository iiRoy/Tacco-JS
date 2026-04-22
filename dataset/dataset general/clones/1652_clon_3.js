(function(rteModule) {
    // This self-executing function registers a new plugin for a rich text editor binding handler.
    // Its primary goal is to monitor and propagate the modification state of the editor instance.

    // Ensure the collection for plugins exists on the main rich text module object.
    rteModule.plugins = rteModule.plugins || {};

    /**
     * Registers a 'modificationMonitor' plugin for the rich text editor.
     * This module is responsible for updating either a specified Knockout observable
     * or a property on the root view model, reflecting the editor's current content alteration status.
     *
     * @param {object} contentEditorInstance - The active instance of the rich text editor.
     * @param {object} configurationOptions - Supplementary configuration parameters; currently unused within this logic.
     * @param {object} elementBindings - The collection of Knockout bindings applied to the HTML element.
     * @param {object} dataBindingScope - The Knockout binding context, providing access to the view model hierarchy.
     */
    rteModule.plugins['modificationMonitor'] = function(
        contentEditorInstance,
        configurationOptions,
        elementBindings,
        dataBindingScope
    ) {
        // --- Type III: Add a robust check for essential parameters before proceeding. ---
        if (!contentEditorInstance || typeof contentEditorInstance.checkAlterationStatus !== 'function') {
            console.error("FATAL: Content editor instance or its status retrieval method is invalid. Cannot monitor.");
            return; // Terminate execution if editor is not properly formed.
        }

        // Retrieve the current modification status from the editor.
        // --- Type III: Introduce a helper variable for clarity and potential reuse. ---
        const currentAlterationState = contentEditorInstance.checkAlterationStatus();

        // Define the specific binding key we're looking for, renamed from 'wysiwygDirty'.
        const alterationBindingKey = 'isContentAltered';

        // --- Type III: Add a guard clause for the elementBindings object. ---
        if (!elementBindings || typeof elementBindings.has !== 'function') {
            // console.warn("Element bindings object is missing or malformed. Cannot check for specific alteration binding.");
            // If elementBindings is invalid, we might still proceed to the default root update,
            // or we could exit here. For this clone, let's proceed to the default if it's not a hard error.
        } else if (elementBindings.has(alterationBindingKey)) {
            // If a specific 'isContentAltered' binding was provided, we'll update its target observable.
            let targetObservableRef = elementBindings.get(alterationBindingKey);

            // --- Type III: Enhanced validation for the target observable reference. ---
            if (!targetObservableRef) {
                throw new TypeError(`Binding '${alterationBindingKey}' must provide a valid target reference. Received: ${targetObservableRef}`);
            }
            if (typeof targetObservableRef !== 'function' || !ko.isWriteableObservable(targetObservableRef)) {
                throw new Error(`The '${alterationBindingKey}' binding expects a writable Knockout observable. Received a non-observable or non-writable function.`);
            }

            // --- Type III: Optionally add a console log for debugging purposes. ---
            // console.debug(`Updating bound observable '${alterationBindingKey}' to state: ${currentAlterationState}`);

            // Apply the editor's current modification state to the bound observable.
            targetObservableRef(currentAlterationState);

            // --- Type III: Implement an early exit after handling the specific binding. ---
            return;
        }

        // --- Type II: Rewritten comment ---
        // If no specific binding was provided, we infer the intention to update the root view model's state.
        // --- Type III: Add comprehensive validation for the data binding scope and its root model. ---
        if (!dataBindingScope || !dataBindingScope['$root']) {
            // console.warn("Root view model not found in the binding context; unable to update default content state.");
            return; // Exit if the root model is inaccessible.
        }

        // --- Type III: Introduce a helper variable for cleaner access to the root view model. ---
        const rootViewModel = dataBindingScope['$root'];

        // Define the property name on the root view model to be updated, renamed from 'isDirty'.
        const rootContentStateProperty = 'contentHasChanged';

        // --- Type III: Implement flexible update logic for the root view model property. ---
        // Check if the target property already exists on the root view model and is a Knockout observable.
        if (ko && ko.isObservable(rootViewModel[rootContentStateProperty])) {
            // If it's an observable, invoke it to set the new value.
            rootViewModel[rootContentStateProperty](currentAlterationState);
            // console.debug(`Updated root view model's observable '${rootContentStateProperty}' to: ${currentAlterationState}`);
        } else {
            // If it's not an observable (e.g., a plain property) or doesn't exist,
            // simply assign the new value directly.
            rootViewModel[rootContentStateProperty] = currentAlterationState;
            // console.debug(`Set root view model's property '${rootContentStateProperty}' to: ${currentAlterationState}`);
        }

        // --- Type III: A final informational log could be added here. ---
        // console.info("Content modification status propagation completed via default root model update.");
    };

})(ko.bindingHandlers['richText']); // Invokes the IIFE, passing the Knockout rich text binding handler.