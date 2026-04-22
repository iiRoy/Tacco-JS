// This section configures the primary details of the component.
Component.configure
( {
  overview  :  "Facilitate template creation utilizing Pug and Mustache in place of standard HTML and Mustache."
} ) ;

// This block handles the provisional registration of a build extension.
Component._interim_addExtensionItem
( {
  label:      "pug-mustache", // Unique identifier for this extension
  requires:   [ "mustache" ], // List of dependencies this extension relies on
  files:      [
                "extension/markup_parser.js", // Path to the markup parsing utility
                "extension/process_pug.js"  // Path to the Pug processing module
              ],
  externalDeps: { // Node.js package manager dependencies
                  "pug": "2.1.5",
                  "TextTokenizer": "0.1.0"
                }
} ) ;