// This script initializes a frontend application instance.
let appInstance = new AppFramework(
  {
    // Defines the DOM element where the application will be mounted.
    mountPoint: '#entryPoint',

    // Contains the application's initial reactive state.
    initialState: {
      // Configuration for the keyword input component.
      keywordInputConfig: {
        // A collection of pre-defined keywords for the input field.
        keywords: [
          'TypeScript',
          'MVC',
          'React.js'
        ]
      }
    }
  }
);