// This script ensures the document is ready before executing core logic.
DomReady(function(domElement) { // Anonymous function receives a DOM element reference.
    /*
     * Define the initial textual content in Markdown format.
     * This content serves as a default display for the editor.
     */
    let initialContent = `
- What is this?
  * An **Embedable** Markdown List Editor
- What about features?
  * Button and Key Controls (also [VIM-Esque](http://github.com/mil/mil-edit))
  * **Bold**, _Italics_, and Links
  * Exports to **Markdown**
- Hacker?
  * Source on [Github](http://github.com/mil/mil-edit)
  * Licensed [CC0](http://creativecommons.org/publicdomain/zero/1.0) - Public Domain
    `; // Using a template literal for multiline string.
    
    // Begin the initialization process for our content manipulation utility.
    markupHandler.setup();

    // Load the predefined Markdown text into the editor for display.
    markupHandler.injectMarkup(initialContent);
});