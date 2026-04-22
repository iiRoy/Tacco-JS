/*
 * This script initializes the mil-edit markdown editor.
 * It leverages Zepto.js for DOM readiness and provides a default
 * introductory markdown content for the editor.
 */

Zepto
(
    function ( $ )
    {

        // Define the initial markdown content that will be loaded
        // into the editor upon its initialization.
        // This serves as a quick guide for new users.
        var defaultMarkdown = "- What is this?\n\
  * An **Embedable** Markdown List Editor\n\
- What about features?\n\
  * Button and Key Controls (also [VIM-Esque](http://github.com/mil/mil-edit))\n\
  * **Bold**, _Italics_, and Links\n\
  * Exports to **Markdown**\n\
- Hacker?\n\
  * Source on [Github](http://github.com/mil/mil-edit)\n\
  * Licensed [CC0](http://creativecommons.org/publicdomain/zero/1.0) - Public Domain";


        // Call the initialization function for the mil-edit editor.
        // This sets up all necessary components and event listeners.
        mil_edit.initialize();


        // After initialization, load the predefined default markdown
        // content into the editor's display area.
        mil_edit.load_markdown( defaultMarkdown );

    }
); // End of Zepto document ready function.