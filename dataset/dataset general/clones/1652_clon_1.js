/*
 * This file defines a 'dirty' extension for the wysiwyg editor binding.
 * It integrates with Knockout.js to track changes in the editor content.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */
( function( wysiwyg ) {

  // Define the 'dirty' extension under the wysiwyg.extensions namespace.
  // This function will be called when the 'wysiwyg' binding is initialized
  // with this extension.
  wysiwyg.extensions[ 'dirty' ] = function( editor, args, allBindings, bindingContext ) {

    // Check if the 'wysiwygDirty' binding is present in the element's data-bind attribute.
    if ( allBindings.has( 'wysiwygDirty' ) ) {

      // Retrieve the Knockout observable accessor bound to 'wysiwygDirty'.
      var accessor = allBindings.get( 'wysiwygDirty' );

      // Ensure that the provided accessor is a writeable Knockout observable.
      // If it's not, throw an error to indicate incorrect usage.
      if ( ! ko.isWriteableObservable( accessor ) ) {
        throw 'wysiwygDirty must be writeable and observable'; // Error message for invalid binding.
      }

      // Update the observable with the current dirty status of the editor.
      // editor.isDirty() returns true if content has changed, false otherwise.
      accessor( editor.isDirty() );

    } else {

      // If 'wysiwygDirty' binding is not explicitly provided,
      // we'll attempt to set a 'isDirty' property on the $root view-model.
      // This is a common pattern for tracking overall form dirtiness.
      bindingContext[ '$root' ].isDirty = editor.isDirty();

    } /* End of if-else block for wysiwygDirty check */

  }; // End of wysiwyg.extensions['dirty'] function definition

// The IIFE is immediately invoked with ko.bindingHandlers['wysiwyg'] as its argument,
// ensuring the extension is added to the correct wysiwyg binding handler.
} )( ko.bindingHandlers[ 'wysiwyg' ] );

// End of 'dirty' extension module.