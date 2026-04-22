const ngCore = require('angular');
const PresentationEngine = require('./refined-presentation-core');
const fileSaverUtil = require('./WebFileSaver');

// Main application module for slide creation interface
const presentationApp = ngCore.module('slide-creator-app', []);

/*
 * This controller manages the user interface logic for editing and previewing presentations.
 * It handles content updates, saving mechanisms, and real-time rendering within the UI.
 * Dependencies:
 *   - scopeContext: Angular's $scope for data binding.
 *   - domContainer: Angular's $element for DOM manipulation.
 *   - slideGenerator: Custom service for presentation generation.
 */
presentationApp.controller('BuilderController', function(scopeContext, domContainer, slideGenerator) {
  // Stores the dynamically generated HTML output of the presentation.
  let generatedOutput = null;
  // Holds the function to unregister the Angular watch listener for content changes.
  let modelChangeUnregister = null;

  // Collection of all editable content models for the presentation.
  // These strings represent the raw content and templates used by the presentation engine.
  scopeContext.presentationContent = {
    // Markdown source for the presentation slides.
    'slideSource': "title: Enhanced Presentation Example\nauthor:\n  name: Alex Johnson\n  twitter: alexj_dev\n  url: https://dev.alexjohnson.com\noutput: output_slides.html\n\n--\n\n# Welcome to the Builder\n## Crafting Dynamic HTML Presentations with Ease\n\n--\n\n### Textual Content Mastery\n\nLeverage **Markdown** for rich text. No more double angle brackets for new lines!\n\nEach new line break creates a distinct paragraph.\n\n<img src=\"https://example.com/assets/img/icon.png\" alt=\"Placeholder Image\" style=\"width: 180px;\"/>\n\n    ![sample-icon](icon.png)\n    <img src=\"icon.png\" />\n\n[Visit a sample link](https://bing.com).\n\n--\n\n### Structured Information\n\n* First item in a list\n* Second item, B\n* Third item, Delta\n\nSingle template for multiple layouts! [Another useful link](https://yahoo.com).\n\n--\n\n### Global Character Support\n\n* 桜の花が咲く\n* 涙がこぼれる\n* Brackets «»‹› “”‘’「」〈〉《》〔〕\n* Greek Alpha βγδ εζηθ ικλμ νξοπ ρςτυ φχψω\n* Currencies  ¤ $ ¢ € ₠ £ ¥\n\n--\n\n### Code Snippet Integration\n\n```javascript\n// A simple JavaScript function showcasing closures\nconst calculate = (factorOne) => {\n    return (factorTwo) => {\n        return `Factor One: ${factorOne}, Factor Two: ${factorTwo}`;\n    };\n};\n\nconsole.log(calculate(5)(10)); // Expected output: 'Factor One: 5, Factor Two: 10'\n```\n\nInline code like `console.log()` is also supported.",
    // Main HTML layout template, defining the overall page structure.
    'mainLayout': '<!doctype html>\n<html>\n<head>\n  <meta charset="{{encoding}}">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\n  <title>{{title}}</title>\n  <style type="text/css">\n    {{{style}}}\n  </style>\n</head>\n<body>\n  {{{slideshow}}}\n\n  <script type="text/javascript">\n    {{{script}}}\n  </script>\n</body>\n</html>\n',
    // Template for displaying author information on a dedicated slide.
    'authorInfo': '<div class="author-details">\n  <h1 class="author-name">{{name}}</h1>\n  {{#twitter}}\n    <h3 class="social-twitter">\n      <a href="http://twitter.com/{{{twitter}}}">{{{twitter}}}</a>\n    </h3>\n  {{/twitter}}\n  {{#url}}\n    <h3 class="social-url">\n      <a href="{{{url}}}">{{{url}}}</a>\n    </h3>\n  {{/url}}\n  {{#email}}\n    <h3 class="social-email">\n      <a href="mailto:{{{email}}}">{{{email}}}</a>\n    </h3>\n  {{/email}}\n</div>\n',
    // Template for generating an agenda slide, typically a list of topics.
    'presentationAgenda': '<h3>Agenda Overview</h3>\n<ul>\n  {{#.}}\n    <li>{{.}}</li>\n  {{/.}}\n</ul>\n',
    // Template defining how individual slides are structured within the overall slideshow.
    'slideStructure': '{{#progress}}\n  <div class="progress-indicator">\n    <div class="progress-bar-fill"></div>\n  </div>\n{{/progress}}\n\n<div id="presentation-wrapper">\n  {{#slides}}\n    <section class="individual-slide">{{{.}}}</section>\n  {{/slides}}\n</div>\n{{#controls}}\n  <div class="navigation-controls">\n    <div class="nav-arrow previous-slide"></div>\n    <div class="nav-arrow next-slide"></div>\n  </div>\n{{/controls}}\n'
  };

  /**
   * Triggers the re-rendering of the presentation based on current models
   * and updates the embedded preview frame. This function acts as the core
   * update mechanism for the live preview.
   */
  scopeContext.refreshView = function() {
    // A guard clause to prevent rendering if no slide source is available.
    if (!scopeContext.presentationContent.slideSource) {
      console.warn("No slide source content available for rendering. Skipping refresh.");
      return;
    }
    generatedOutput = slideGenerator.render(scopeContext.presentationContent);
    scopeContext.updatePreviewFrame(generatedOutput);
  };

  /**
   * Saves the currently rendered HTML presentation to a file.
   * Provides a warning if no content has been rendered yet.
   */
  scopeContext.exportRenderedHTML = function() {
    // Validate that there is actual HTML content to save.
    if (!generatedOutput || generatedOutput.trim().length === 0) {
      alert('No HTML content has been generated yet. Please ensure your slides are rendered first.');
      return;
    }
    const outputBlob = new Blob([generatedOutput], { type: "text/html;charset=utf-8" });
    fileSaverUtil(outputBlob, "my_presentation.html");
  };

  /**
   * Saves the raw Markdown source of the presentation to a file.
   * Provides a warning if no Markdown content is present.
   */
  scopeContext.exportMarkdownSource = function() {
    const rawMarkdown = scopeContext.presentationContent.slideSource;
    // Validate that there is raw Markdown content to save.
    if (!rawMarkdown || rawMarkdown.trim().length === 0) {
      alert('No raw Markdown content found to save. Please add some slide source.');
      return;
    }
    const markdownBlob = new Blob([rawMarkdown], { type: "text/plain;charset=utf-8" });
    fileSaverUtil(markdownBlob, "my_presentation_source.md");
  };

  /**
   * Updates the content of the embedded iframe with the provided HTML string.
   * This effectively refreshes the live preview displayed in the UI.
   * @param {string} htmlContent - The HTML string to load into the iframe.
   */
  scopeContext.updatePreviewFrame = function(htmlContent) {
    const previewFrame = domContainer.find('iframe')[0];
    // Early exit if the iframe element cannot be found.
    if (!previewFrame) {
      console.error("Preview iframe element not found in the DOM.");
      return;
    }

    let frameWindow;
    // Attempt to get the iframe's window object in a cross-browser compatible way.
    if (previewFrame.contentWindow) {
      frameWindow = previewFrame.contentWindow;
    } else if (previewFrame.contentDocument && previewFrame.contentDocument.document) {
      frameWindow = previewFrame.contentDocument.document; // For older IE
    } else {
      frameWindow = previewFrame.contentDocument;
    }

    // Ensure a valid document object is obtained for writing.
    if (!frameWindow || !frameWindow.document) {
      console.error("Could not obtain iframe document object for writing.");
      return;
    }

    // Open, write, and close the iframe's document to refresh its content.
    frameWindow.document.open('replace');
    frameWindow.document.write(htmlContent);
    frameWindow.document.close();
  };

  // Perform an initial render of the slides when the controller is first loaded.
  scopeContext.refreshView();

  // A boolean flag to enable or disable continuous preview updates as content changes.
  scopeContext.autoUpdateEnabled = true;

  // Watcher for the `autoUpdateEnabled` flag to manage the content watch listener.
  scopeContext.$watch('autoUpdateEnabled', function(newValue, oldValue) {
    // If a previous watch handler exists, unregister it to prevent memory leaks.
    if (modelChangeUnregister) {
      modelChangeUnregister();
      modelChangeUnregister = null; // Clear the reference for garbage collection.
    }
    // If auto-update is enabled, set up a new deep watch on the content models.
    if (newValue === true) {
      // The 'true' argument ensures a deep watch on the `presentationContent` object.
      modelChangeUnregister = scopeContext.$watch('presentationContent', scopeContext.refreshView, true);
      console.log("Automatic preview updates are now active.");
    } else {
      console.log("Automatic preview updates have been paused.");
    }
  });

  /**
   * Sets the currently active tab/panel in the UI.
   * This determines which content editor is visible to the user.
   * @param {string} panelId - The unique identifier of the panel to activate.
   * @returns {string} The identifier of the newly active panel, or an empty string if invalid.
   */
  scopeContext.setActivePanel = function(panelId) {
    if (typeof panelId !== 'string' || panelId.trim().length === 0) {
      console.error("Invalid panel ID provided for activation. Must be a non-empty string.");
      scopeContext.currentActivePanel = ''; // Reset to ensure no invalid state
      return '';
    }
    scopeContext.currentActivePanel = panelId;
    return scopeContext.currentActivePanel;
  };

  /**
   * Checks if a given tab/panel is currently active.
   * Used for conditional styling or visibility in the UI.
   * @param {string} panelId - The identifier of the panel to check.
   * @returns {boolean} True if the panel is active, false otherwise.
   */
  scopeContext.isPanelActive = function (panelId) {
    return panelId === scopeContext.currentActivePanel;
  };

  // Define the list of available editable panels, corresponding to keys in `presentationContent`.
  scopeContext.availablePanels = [
    'slideSource',
    'mainLayout',
    'authorInfo',
    'presentationAgenda',
    'slideStructure'
  ];

  // Set the default active panel to the first item in the list upon controller initialization.
  scopeContext.setActivePanel(scopeContext.availablePanels[0]);
});

/*
 * Directive for rendering navigation tabs to switch between different content panels.
 * This component provides the visual navigation elements.
 */
presentationApp.directive('panelNavigation', function() {
  return {
    restrict: "E", // The directive can only be used as an element (e.g., <panel-navigation></panel-navigation>).
    // The HTML template for the navigation bar, dynamically generated using ng-repeat.
    template: "<nav class='navigation-bar'><ul class='nav-list'><li ng-class='{active: isPanelActive(panelItem)}' class='nav-item' title='{{panelItem}}' ng-repeat='panelItem in availablePanels' ng-click='setActivePanel(panelItem)'>{{ formatSpacify(formatCapitalize(panelItem)) }}</li></ul></nav>",
    scope: false, // Inherit scope from the parent controller (BuilderController).
    replace: true, // Replace the directive's element with its template content.
    link: function(currentScope, elementRef, attributes) {
      /**
       * Capitalizes the first letter of a given string.
       * This is a utility function used for display formatting in the tabs.
       * @param {string} inputString - The string to capitalize.
       * @returns {string} The capitalized string, or an empty string if input is invalid.
       */
      currentScope.formatCapitalize = function capitalizeFirstLetter(inputString) {
        if (!inputString || typeof inputString !== 'string') return '';
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
      };

      /**
       * Replaces all underscores with spaces in a string.
       * Another utility for making panel names more readable in the UI.
       * @param {string} inputString - The string to process.
       * @returns {string} The string with underscores replaced by spaces.
       */
      currentScope.formatSpacify = function replaceUnderscoresWithSpaces(inputString) {
        if (!inputString || typeof inputString !== 'string') return '';
        return inputString.replace(/_/g, ' ');
      };

      // Attaching a click listener to the navigation bar using event delegation.
      // This improves performance by having one listener for all list items.
      elementRef.on('click', function(event) {
        const clickedTitle = event.target.title;
        if (clickedTitle) {
          currentScope.setActivePanel(clickedTitle);
          // Manually trigger Angular's digest cycle since this event is outside
          // Angular's direct control (e.g., not an ng-click on the element itself).
          currentScope.$apply();
        }
      });
    }
  };
});

/*
 * Service responsible for interacting with the core presentation generation engine.
 * It initializes the engine with default content and provides a rendering interface
 * for the BuilderController.
 */
presentationApp.service('slideGenerator', function() {
  // Initialize the core presentation engine with a dummy URL.
  // The URL parameter is not critical for local rendering in this context.
  const presentationCore = new PresentationEngine('http://mock-cleaver-url.info');

  // Populate external data loaded into the engine. This typically includes the
  // main Markdown document for the presentation content.
  presentationCore.externalData = {
    document: 'http://placeholder.txt', // A placeholder document URL.
    loaded: {
      // Default markdown content for the presentation, used when no user content is provided.
      document: "title: Initial Sample Presentation\nauthor:\n  name: Developer Sandbox\n  twitter: dev_sandbox\n  url: https://sandbox.dev\noutput: default_output.html\n\n--\n\n# Getting Started\n## Your First Steps with the Editor\n\n--\n\n### Basic Markdown Syntax\n\nWrite content using **standard Markdown**. Newlines now automatically create paragraphs.\n\nThis is another paragraph.\n\n<img src=\"https://example.com/images/default_logo.gif\" alt=\"Logo\" style=\"width: 160px;\"/>\n\n    ![example-image](image.gif)\n    <img src=\"image.gif\" />\n\n[Explore more](https://developer.mozilla.org/en-US/docs/Web/Markdown).\n\n--\n\n### List Structures\n\n* Bullet Point 1\n* Bullet Point 2\n* Bullet Point 3\n\nNo need for multiple templates for lists! [Another useful resource](https://www.markdownguide.org/basic-syntax/).\n\n--\n\n### International Character Sets\n\n* 日本語のテキスト\n* 한글 텍스트\n* Quotation Marks «»‹› “”‘’「」〈〉《》〔〕\n* Greek Alpha Beta Gamma Delta\n* Currency Symbols  ¤ $ ¢ € ₠ £ ¥\n\n--\n\n### Code Highlighting Example\n\n```python\n# Python function to calculate factorial\ndef factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)\n\nprint(factorial(5)) # Outputs 120\n```\n\nInline `code snippets` are also supported."
    }
  };

  // Pre-load default template definitions for the engine.
  // These templates define the structure and appearance of different parts of the presentation.
  presentationCore.loadedTemplates = {
    mainLayout: '<!doctype html>\n<html>\n<head>\n  <meta charset="{{encoding}}">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\n  <title>{{title}}</title>\n  <style type="text/css">\n    {{{style}}}\n  </style>\n</head>\n<body>\n  {{{slideshow}}}\n\n  <script type="text/javascript">\n    {{{script}}}\n  </script>\n</body>\n</html>\n',
    authorInfo: '<div class="author-details-block">\n  <h1 class="author-label">{{name}}</h1>\n  {{#twitter}}\n    <h3 class="author-twitter-link">\n      <a href="http://twitter.com/{{{twitter}}}">{{{twitter}}}</a>\n    </h3>\n  {{/twitter}}\n  {{#url}}\n    <h3 class="author-website-link">\n      <a href="http://{{{url}}}">{{{url}}}</a>\n    </h3>\n  {{/url}}\n  {{#email}}\n    <h3 class="author-email-contact">\n      <a href="mailto:{{{email}}}">{{{email}}}</a>\n    </h3>\n  {{/email}}\n</div>\n',
    presentationAgenda: '<h3>Session Agenda</h3>\n<ol>\n  {{#.}}\n    <li>{{.}}</li>\n  {{/.}}\n</ol>\n', // Changed from <ul> to <ol> for a minor structural alteration.
    slideStructure: '{{#progress}}\n  <div class="progress-container">\n    <div class="progress-bar-segment"></div>\n  </div>\n{{/progress}}\n\n<div id="slide-group-wrapper">\n  {{#slides}}\n    <section class="presentation-slide-item">{{{.}}}</section>\n  {{/slides}}\n</div>\n{{#controls}}\n  <div class="slide-navigation-buttons">\n    <div class="nav-button prev-slide-button"></div>\n    <div class="nav-button next-slide-button"></div>\n  </div>\n{{/controls}}\n'
  };

  // Perform an initial parsing and rendering of slides to populate internal structures.
  // This is necessary before any rendering can take place.
  presentationCore.initializeSlides();

  // Configure default metadata options for the presentation, such as controls and progress bar.
  presentationCore.configOptions = presentationCore.configOptions || {}; // Ensure the object exists.
  presentationCore.configOptions.enableNavigationControls = true;
  presentationCore.configOptions.showProgressBar = true;

  // Load default resource assets (CSS and JavaScript) that will be embedded in the presentation HTML.
  presentationCore.assetResources = presentationCore.assetResources || {};
  presentationCore.assetResources.loaded = {
    // Default styling for the presentation.
    style: 'body {\n  font-family: \'Roboto\', \'Segoe UI\', Arial, sans-serif;\n  color: #333;\n  background-color: #f0f0f0;\n  font-size: 105%;\n}\n\n#presentation-wrapper {\n  width: 900px;\n  height: 650px;\n  overflow: hidden;\n  margin: 70px auto 0 auto;\n  box-shadow: 0 0 15px rgba(0,0,0,0.1);\n  border-radius: 8px;\n}\n\n.presentation-slide-item {\n  width: auto;\n  height: 580px;\n  padding: 40px;\n  font-weight: 300;\n  font-size: 220%;\n  line-height: 1.4;\n  background-color: #ffffff;\n}\n\n.navigation-controls {\n  position: fixed;\n  bottom: 25px;\n  left: 25px;\n  z-index: 100;\n}\n\n.navigation-controls .nav-arrow {\n  width: 0; height: 0;\n  border: 35px solid #555;\n  float: left;\n  margin-right: 35px;\n  cursor: pointer;\n\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -khtml-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\n.navigation-controls .previous-slide {\n  border-top-color: transparent;\n  border-bottom-color: transparent;\n  border-left-color: transparent;\n\n  border-left-width: 0;\n  border-right-width: 55px;\n}\n\n.navigation-controls .next-slide {\n  border-top-color: transparent;\n  border-bottom-color: transparent;\n  border-right-color: transparent;\n\n  border-left-width: 55px;\n  border-right-width: 0;\n}\n\n.navigation-controls .previous-slide:hover {\n  border-right-color: #999;\n}\n\n.navigation-controls .next-slide:hover {\n  border-left-color: #999;\n}\n\n.presentation-slide-item h1 {\n  font-size: 320%;\n  line-height: 1.1;\n  text-align: center;\n  margin: 160px 0 0;\n}\n\n.presentation-slide-item h2 {\n  font-size: 110%;\n  line-height: 1.1;\n  margin: 8px 0;\n  text-align: center;\n  font-weight: 300;\n}\n\n.presentation-slide-item h3 {\n  font-size: 150%;\n  line-height: 1.1;\n  border-bottom: 2px solid #bbb;\n  margin: 0;\n  padding-bottom: 18px;\n}\n\n.presentation-slide-item ul {\n  padding: 25px 0 0 65px;\n  font-weight: 300;\n  line-height: 1.4;\n}\n\n.presentation-slide-item .author-details-block h1.author-label {\n  font-size: 180%;\n  font-weight: 300;\n  text-align: center;\n  margin-bottom: 35px;\n}\n\n.presentation-slide-item .author-details-block h3 {\n  font-weight: 200;\n  text-align: center;\n  font-size: 100%;\n  border: none;\n}\n\na {\n  text-decoration: none;\n  color: #5cb85c;\n}\n\na:hover {\n  color: #6edc6e;\n}\n\npre {\n  font-size: 65%;\n  line-height: 1.25;\n  background-color: #f8f8f8;\n  border: 1px solid #e0e0e0;\n  border-radius: 4px;\n  padding: 10px;\n  overflow-x: auto;\n}\n\n.progress-container {\n  position: fixed;\n  top: 0; left: 0; right: 0;\n  height: 4px;\n  background-color: #e0e0e0;\n}\n\n.progress-bar-segment {\n  width: 0%;\n  height: 4px;\n  background-color: #5cb85c;\n\n  -webkit-transition: width 0.15s ease-out;\n  -moz-transition: width 0.15s ease-out;\n  -o-transition: width 0.15s ease-out;\n  transition: width 0.15s ease-out;\n}\n\n@media (max-width: 900px) {\n  #presentation-wrapper {\n    width: auto;\n  }\n\n  body {\n    font-size: 75%;\n  }\n\n  img {\n    max-width: 100%;\n    height: auto;\n  }\n\n  .presentation-slide-item h1 {\n    margin-top: 130px;\n  }\n\n  .navigation-controls .previous-slide, .navigation-controls .previous-slide:hover {\n    border-right-color: rgba(150, 150, 150, 0.6);\n  }\n\n  .navigation-controls .next-slide, .navigation-controls .next-slide:hover {\n    border-left-color: rgba(150, 150, 150, 0.6);\n  }\n}\n\n@media (max-width: 500px) {\n  body {\n    font-size: 55%;\n    overflow-x: hidden;\n  }\n\n  #presentation-wrapper {\n    margin-top: 15px;\n    height: 380px;\n  }\n\n  .presentation-slide-item {\n    padding: 15px;\n    height: 380px;\n  }\n\n  .presentation-slide-item h1 {\n    margin-top: 60px;\n  }\n\n  .presentation-slide-item ul {\n    padding-left: 30px;\n  }\n}\n\n@media print {\n  * {\n    -webkit-print-color-adjust: exact;\n  }\n\n  @page {\n    size: A4 landscape;\n    margin: 1cm;\n  }\n\n  html {\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n  }\n\n  body {\n    margin: 0 auto !important;\n    border: 0;\n    padding: 0;\n    float: none !important;\n    overflow: visible;\n    background: none !important;\n    font-size: 58%;\n  }\n\n  .progress-container, .navigation-controls {\n    display: none;\n  }\n\n  #presentation-wrapper {\n    overflow: visible;\n    height: 100%;\n    margin-top: 0;\n    box-shadow: none;\n    border-radius: 0;\n  }\n\n  .presentation-slide-item {\n    border: 1px dashed #444;\n    margin-bottom: 30px;\n    height: 4in;\n    page-break-after: always;\n  }\n\n  .presentation-slide-item:last-child {\n    page-break-after: avoid;\n  }\n}\n',
    // Styling for code blocks (GitHub-like theme for syntax highlighting).
    codeHighlightStyle: '/*\n  Code Highlighting Theme (based on GitHub style)\n  (c) Custom Refactor Team <refactor@example.com>\n*/\n\ncode, pre {\n  border: 1px solid #c0c0c0;\n  border-radius: 4px;\n  overflow: auto;\n  padding: 8px 12px;\n  background-color: #fdfdfd;\n}\n\ncode {\n  padding: 2px 6px;\n}\n\npre>code {\n  margin: 0; padding: 0;\n  border: none;\n  background: transparent;\n}\n\npre .comment,\npre .template_comment,\npre .diff .header,\npre .javadoc {\n  color: #887;\n  font-style: italic\n}\n\npre .keyword,\npre .css .rule .keyword,\npre .winutils,\npre .javascript .title,\npre .nginx .title,\npre .subst,\npre .request,\npre .status {\n  color: #444;\n  font-weight: bold\n}\n\npre .number,\npre .hexcolor,\npre .ruby .constant {\n  color: #0aa;\n}\n\npre .string,\npre .tag .value,\npre .phpdoc,\npre .tex .formula {\n  color: #c23\n}\n\npre .title,\npre .id {\n  color: #a00;\n  font-weight: bold\n}\n\npre .javascript .title,\npre .lisp .title,\npre .clojure .title,\npre .subst {\n  font-weight: normal\n}\n\npre .class .title,\npre .haskell .type,\npre .vhdl .literal,\npre .tex .command {\n  color: #569;\n  font-weight: bold\n}\n\npre .tag,\npre .tag .title,\npre .rules .property,\npre .django .tag .keyword {\n  color: #000090;\n  font-weight: normal\n}\n\npre .attribute,\npre .variable,\npre .lisp .body {\n  color: #009090\n}\n\npre .regexp {\n  color: #00a030\n}\n\npre .class {\n  color: #569;\n  font-weight: bold\n}\n\npre .symbol,\npre .ruby .symbol .string,\npre .lisp .keyword,\npre .tex .special,\npre .prompt {\n  color: #a00080\n}\n\npre .built_in,\npre .lisp .title,\npre .clojure .built_in {\n  color: #0096c3\n}\n\npre .preprocessor,\npre .pi,\npre .doctype,\npre .shebang,\npre .cdata {\n  color: #aaa;\n  font-weight: bold\n}\n\npre .deletion {\n  background: #fee\n}\n\npre .addition {\n  background: #efe\n}\n\npre .diff .change {\n  background: #0096c3\n}\n\npre .chunk {\n  color: #bbb\n}\n',
    // JavaScript for interactive slide functionality (navigation, keyboard controls, etc.).
    script: '/**\n * Navigates to the previous slide by moving the last slide to the beginning\n * of the presentation container. Ensures proper progress, URL, and accessibility\n * updates are applied after the navigation.\n */\nfunction navigateBackward() {\n  const presentationContainer = document.querySelector(\'#slide-group-wrapper\');\n  if (!presentationContainer) return;\n\n  let lastVisibleSlide = presentationContainer.lastElementChild;\n  // Traverse backwards to ensure we get an actual element node, skipping text nodes.\n  while (lastVisibleSlide && lastVisibleSlide.nodeType !== Node.ELEMENT_NODE) {\n    lastVisibleSlide = lastVisibleSlide.previousElementSibling;\n  }\n\n  if (lastVisibleSlide) {\n    presentationContainer.removeChild(lastVisibleSlide);\n    presentationContainer.insertBefore(lastVisibleSlide, presentationContainer.firstElementChild);\n\n    updatePresentationProgress();\n    syncBrowserURLHash();\n    adjustFocusability();\n  }\n}\n\n/**\n * Advances to the next slide by moving the first slide to the end of the\n * presentation container. Updates progress, URL, and accessibility settings\n * accordingly after the transition.\n */\nfunction navigateForward() {\n  const presentationContainer = document.querySelector(\'#slide-group-wrapper\');\n  if (!presentationContainer) return;\n\n  let firstVisibleSlide = presentationContainer.firstElementChild;\n  // Traverse forwards to ensure we get an actual element node.\n  while (firstVisibleSlide && firstVisibleSlide.nodeType !== Node.ELEMENT_NODE) {\n    firstVisibleSlide = firstVisibleSlide.nextElementSibling;\n  }\n\n  if (firstVisibleSlide) {\n    presentationContainer.removeChild(firstVisibleSlide);\n    presentationContainer.appendChild(firstVisibleSlide);\n\n    updatePresentationProgress();\n    syncBrowserURLHash();\n    adjustFocusability();\n  }\n}\n\n/**\n * Updates the browser\'s URL hash to reflect the current slide number (index).\n * This allows for direct linking to specific slides and browser history navigation.\n */\nfunction syncBrowserURLHash() {\n  const currentSlideElement = document.querySelector(\'#slide-group-wrapper .presentation-slide-item\');\n  if (currentSlideElement && currentSlideElement.dataset.slideIndex) {\n    window.history.replaceState({}, \'\', \'#\' + currentSlideElement.dataset.slideIndex);\n  }\n}\n\n/**\n * Retrieves the index of the current active slide from its data attribute.\n * @returns {number|null} The current slide index as a number, or null if not found.\n */\nfunction getCurrentSlideIndex() {\n  const activeSlide = document.querySelector(\'#slide-group-wrapper .presentation-slide-item\');\n  return activeSlide ? parseInt(activeSlide.dataset.slideIndex, 10) : null;\n}\n\n/**\n * Returns a NodeList of all individual slide elements within the presentation container.\n * @returns {NodeList} A live list of all slide elements.\n */\nfunction retrieveAllSlides() {\n  return document.querySelectorAll(\'#slide-group-wrapper .presentation-slide-item\');\n}\n\n/**\n * Assigns a unique data-attribute index (`data-slide-index`) to each slide element.\n * This is crucial for programmatic navigation and URL synchronization.\n */\nfunction assignSlideIndices() {\n  const slideWrapper = document.querySelector(\'#slide-group-wrapper\');\n  if (!slideWrapper) return;\n  const allSlides = slideWrapper.querySelectorAll(\'section\');\n  allSlides.forEach((slide, index) => {\n    slide.dataset.slideIndex = index.toString();\n  });\n}\n\n/**\n * Updates the visual progress bar based on the current slide position.\n * The progress is calculated as a percentage of slides viewed.\n */\nfunction updatePresentationProgress() {\n  const slideWrapper = document.querySelector(\'#slide-group-wrapper\');\n  const progressFiller = document.querySelector(\'.progress-bar-segment\');\n\n  if (progressFiller && slideWrapper) {\n    const totalSlides = slideWrapper.querySelectorAll(\'section\').length;\n    const currentIdx = getCurrentSlideIndex();\n    if (currentIdx !== null) {\n      // Calculate percentage, handling single slide case to be 100%.\n      const progressPercentage = totalSlides === 1 ? 100 : (100 * currentIdx / (totalSlides - 1));\n      progressFiller.style.width = `${progressPercentage.toFixed(2)}%`;\n    }\n  }\n}\n\n/**\n * Navigates directly to a specified slide index by repeatedly calling `navigateForward`.\n * @param {string|number} targetIndex - The index (as string or number) of the slide to navigate to.\n */\nfunction jumpToSlide(targetIndex) {\n  const targetSlideElement = document.querySelector(`#slide-group-wrapper .presentation-slide-item[data-slide-index="${targetIndex}"]`);\n  if (!targetSlideElement) { /* console.warn(`Slide with index ${targetIndex} not found.`); */ return; }\n\n  const totalSlides = retrieveAllSlides().length;\n  let currentIteration = 0;\n\n  // Loop until the desired slide is at the front or we\'ve iterated through all slides\n  while (getCurrentSlideIndex() !== parseInt(targetIndex, 10) && currentIteration < totalSlides) {\n    navigateForward();\n    currentIteration++;\n  }\n}\n\n/**\n * Manages the `tabindex` attribute for hyperlinks within slides to control keyboard focus behavior.\n * Only links on the active slide should be focusable, improving accessibility.\n */\nfunction adjustFocusability() {\n  const allHyperlinks = document.querySelectorAll(\'.presentation-slide-item a\');\n  // Use optional chaining for robustness if the querySelector returns null.\n  const currentSlideHyperlinks = document.querySelector(\'.presentation-slide-item\')?.querySelectorAll(\'a\') || [];\n\n  // Disable focus for all links initially.\n  allHyperlinks.forEach(link => link.setAttribute(\'tabindex\', -1));\n\n  // Enable focus for links specifically on the current active slide.\n  currentSlideHyperlinks.forEach(link => link.removeAttribute(\'tabindex\'));\n}\n\n// Initialize presentation functionality once the DOM is fully loaded.\n// Using window.addEventListener for modern event handling, allowing multiple listeners.\nwindow.addEventListener(\'load\', function () {\n\n  // Assign unique indices to each slide for navigation purposes.\n  assignSlideIndices();\n\n  // Update link focusability for accessibility compliance.\n  adjustFocusability();\n\n  // Check if a specific slide is requested via URL hash and navigate there.\n  const initialHashPage = window.location.hash.slice(1);\n  if (initialHashPage && !isNaN(parseInt(initialHashPage, 10))) {\n    jumpToSlide(parseInt(initialHashPage, 10));\n  } else if (initialHashPage) {\n      // Log a message if the hash is present but not a valid slide number.\n      console.log(`Ignoring non-numeric or invalid hash segment: "${initialHashPage}"`);\n  }\n\n  // Global keyboard event listener for slide navigation.\n  document.addEventListener(\'keydown\', function (event) {\n    const keyCode = event.keyCode;\n\n    // Define key codes for backward navigation.\n    const backwardKeys = [37, 40, 8, 72, 74, 33]; // Left, Down, Backspace, H, J, Page Up\n    // Define key codes for forward navigation.\n    const forwardKeys = [38, 39, 13, 32, 75, 76, 34]; // Up, Right, Enter, Space, K, L, Page Down\n\n    if (backwardKeys.includes(keyCode)) {\n      event.preventDefault(); // Prevent default browser actions like scrolling.\n      navigateBackward();\n    } else if (forwardKeys.includes(keyCode)) {\n      event.preventDefault(); // Prevent default browser actions.\n      navigateForward();\n    }\n  });\n\n  // Attach click handlers to navigation buttons if they are present in the DOM.\n  const nextButton = document.querySelector(\'.next-slide\');\n  const prevButton = document.querySelector(\'.previous-slide\');\n\n  if (nextButton && prevButton) {\n    nextButton.addEventListener(\'click\', function (event) {\n      event.preventDefault();\n      navigateForward();\n    });\n\n    prevButton.addEventListener(\'click\', function (event) {\n      event.preventDefault();\n      navigateBackward();\n    });\n  } else {\n      console.info("Navigation buttons (.next-slide, .previous-slide) not found; interactive navigation may be limited.");\n  }\n\n  // Ensure initial progress is set after DOM is ready and slides are indexed.\n  updatePresentationProgress();\n});\n'
  };

  /**
   * Main rendering function for the presentation service.
   * It takes an object of content models, updates the internal engine state,
   * and triggers the presentation generation process.
   * @param {object} inputData - An object containing various content models (e.g., slideSource, mainLayout).
   * @returns {string} The final rendered HTML string of the complete presentation.
   */
  function processAndRender(inputData) {
    // Basic validation for the input data object.
    if (!inputData || typeof inputData !== 'object') {
      console.error("Invalid input data provided to processAndRender. Expecting an object.");
      return "";
    }

    // Update the engine's internal markdown document if `slideSource` is provided.
    if (inputData.slideSource !== undefined) {
        presentationCore.externalData.loaded.document = inputData.slideSource;
    } else {
        console.warn("slideSource not provided in inputData, using existing or default markdown content.");
    }

    // Conditionally update template definitions if new data is provided in the input.
    if (inputData.mainLayout) {
        presentationCore.loadedTemplates.mainLayout = inputData.mainLayout;
    }
    if (inputData.authorInfo) {
        presentationCore.loadedTemplates.authorInfo = inputData.authorInfo;
    }
    if (inputData.presentationAgenda) {
        presentationCore.loadedTemplates.presentationAgenda = inputData.presentationAgenda;
    }
    if (inputData.slideStructure) {
        presentationCore.loadedTemplates.slideStructure = inputData.slideStructure;
    }

    // Conditionally update resource assets (CSS/JS) if new data is provided.
    if (inputData.style) {
        presentationCore.assetResources.loaded.style = inputData.style;
    }
    if (inputData.codeHighlightStyle) {
        presentationCore.assetResources.loaded.codeHighlightStyle = inputData.codeHighlightStyle;
    }
    if (inputData.script) {
        presentationCore.assetResources.loaded.script = inputData.script;
    }

    // Reset the internal slide array and re-parse the markdown source to build new slides.
    presentationCore.presentationSlides = []; // Renamed from cleaver.slides for clarity.
    presentationCore.initializeSlides(); // Equivalent to cleaver.renderSlides() in the original.

    // Generate and return the complete HTML slideshow output.
    const finalHtmlOutput = presentationCore.renderSlideshow();
    return finalHtmlOutput;
  }

  // Expose the `processAndRender` function through the service interface under the name `render`.
  return {
    render: processAndRender
  };
});