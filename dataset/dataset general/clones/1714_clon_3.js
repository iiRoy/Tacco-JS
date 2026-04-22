const path = require('path');
const { readFile } = require('fs');
const webFramework = require('express');
const applicationApis = require('./api_endpoints'); // Renamed periscope.js

// Configuration settings for the demonstration server environment
const appConfig = {
    listeningPort: 4200, // Changed port from 3000
    templateDirectory: 'view_templates', // Renamed 'views'
    defaultEngineName: 'render_tmpl', // Renamed 'html' engine
    staticAssetPaths: {
        root: './public_assets', // Renamed 'public'
        components: './vendor_libs' // Renamed 'bower_components'
    },
    demoRoutePrefix: '/showcase', // New route prefix
    defaultAngularVersion: '1.5' // Added a default angular version
};

let webApplication = webFramework(); // Renamed 'app'

// Middleware to log all incoming HTTP requests for debugging purposes
webApplication.use((incomingReq, serverRes, next) => {
    // Add a small delay for demonstration of middleware processing, non-essential
    const requestStartTime = Date.now();
    next();
    const elapsedTime = Date.now() - requestStartTime;
    console.log(`[${new Date().toISOString()}] Request: ${incomingReq.method} ${incomingReq.url} - Processed in ${elapsedTime}ms`);
});

// Custom template rendering function setup for '.render_tmpl' files
webApplication.engine(appConfig.defaultEngineName, processTemplateContent); // Renamed 'myTemplateEngine'
webApplication.set('views', path.join(__dirname, appConfig.templateDirectory));
webApplication.set('view engine', appConfig.defaultEngineName);

// Define a route for dynamic demo pages, allowing for version and page customization
webApplication.get(`${appConfig.demoRoutePrefix}/:pageIdentifier/:angularFrameworkVersion`, (incomingReq, serverRes) => {
    const { pageIdentifier, angularFrameworkVersion } = incomingReq.params;

    // Guard clause: Ensure a page identifier is always provided
    if (!pageIdentifier) {
        return serverRes.status(400).send('Page identifier parameter is missing from the request.');
    }

    // Use a default framework version if not explicitly passed in the route (though route params enforce it)
    const frameworkVersionToRender = angularFrameworkVersion || appConfig.defaultAngularVersion;

    serverRes.render(pageIdentifier, {
        targetPage: pageIdentifier, // Renamed 'demoPage'
        frameworkVersion: frameworkVersionToRender, // Renamed 'angularVersion'
        debugMode: incomingReq.query.debug === 'true' // Added an optional query parameter for debug mode
    });
});

// Serve static resources from various renamed directories
webApplication.use(webFramework.static(path.join(__dirname, appConfig.staticAssetPaths.root)));
webApplication.use('/vendor_libs', webFramework.static(path.join(__dirname, appConfig.staticAssetPaths.components)));
webApplication.use('/utility_scripts', webFramework.static(path.join(__dirname, 'js_helpers'))); // Added a new static path

// Attach API handlers from the renamed periscope module
webApplication.use('/api', applicationApis); // Renamed base path and periscopeRoutes

// Start the HTTP server and log its operational status
let activeListener = webApplication.listen(appConfig.listeningPort, () => {
    const serverAddressInfo = activeListener.address();
    console.info(`Demonstration server is now operational and listening on: http://localhost:${serverAddressInfo.port}`); // Changed log message
});

// --- Template-related constants and functions for the custom engine ---

// Changed string concatenation to template literals, removed some buttons for simplification
const PAGE_TOP_PARTIAL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{frameworkVersion}} - {{displayPageTitle}}</title>
  <link rel="stylesheet" href="/style_sheets/demos_base.css">
  <base href="/">
</head>
<body ng-app="myApplication">
<div class="header-banner">
  <img class="logo-image" src="/visuals/brand_icon.png" alt="Peri$scope Branding">
  <span class="main-page-title">Angular {{frameworkVersion}} - {{displayPageTitle}}</span>
  <button class="instruction-toggle" onclick="document.getElementById('instructionPanel').style.display = 'none'">Hide Guide</button>
  <button class="instruction-toggle" onclick="document.getElementById('instructionPanel').style.display = 'block'">Show Guide</button>
</div>`; // Renamed DEMO_HEADER and its content

const PAGE_BOTTOM_PARTIAL = `<div periscope-component></div>
<script>var instructionPanel = document.getElementById("instructionPanel");</script>
<script src="/vendor_libs/angularjs-{{frameworkVersion}}/angular.js"></script>
<script src="/utility_scripts/periscope_module.js"></script>`; // Renamed DEMO_FOOTER and its content

// Changed object to a Map for page titles and renamed keys/values, also deleted some entries
const DEMO_PAGE_DESCRIPTIONS = new Map([
    ['nested_controllers', 'Nested Control Flow'], // Renamed nested_ctrls
    ['scope_properties', 'Scope Data Bindings'], // Renamed scope_props
    ['simple_form', 'Basic Data Entry Form'],
    ['ng_repeat_list', 'Repeated Element List'], // Renamed ngrepeat
    ['ng_conditional', 'Conditional Rendering'], // Renamed ngif
    ['ng_switch_cases', 'Switch Case Display'], // Renamed ngswitch
    ['directive_no_scope', 'Directive without dedicated scope'], // Renamed dir_noscope
    ['directive_child_scope', 'Directive with child scope'], // Renamed dir_scope
    ['directive_isolated_scope', 'Directive with isolated scope'], // Renamed dir_isolate
    ['service_data_access', 'Service for Shared Data'], // Renamed service
    ['controller_alias', 'Controller as syntax'] // Renamed controller_as
]);

const INLINE_CODE_MARKUP_START = '<div class="source-code-display"><pre>'; // Renamed CODE_PRE
const INLINE_CODE_MARKUP_END = '</pre></div>'; // Renamed CODE_POST


// Custom view processing engine function responsible for rendering templates
function processTemplateContent(templatePath, renderOptions, completionCallback) {
    readFile(templatePath, 'utf8', (readErr, fileContent) => { // Changed to async fs.readFile
        if (readErr) {
            // Updated error handling: log the error and invoke callback
            console.error(`Error encountered while reading template file '${templatePath}': ${readErr.message}`);
            return completionCallback(readErr);
        }

        let processedOutput = fileContent.toString(); // Renamed 'content' to 'fileContent', then 'rendered' to 'processedOutput'
        const pageTitleText = DEMO_PAGE_DESCRIPTIONS.get(renderOptions.targetPage) || 'Unknown Demo Page'; // Using Map.get

        // Introduced intermediate variables for clearer placeholder management
        const headerPlaceholder = '[[HEADER_SECTION_PLACEHOLDER]]';
        const footerPlaceholder = '[[FOOTER_SECTION_PLACEHOLDER]]';
        const pageTitlePlaceholder = /\{\{displayPageTitle\}\}/g;
        const pageIdPlaceholder = /\{\{targetPage\}\}/g;
        const angularVersionPlaceholder = /\{\{frameworkVersion\}\}/g;
        const periscopeButtonPlaceholder = /#psb#/g;
        const resetButtonPlaceholder = /#rb#/g;

        // Perform extensive string replacements using new placeholders and updated text
        processedOutput = processedOutput
            .replace(headerPlaceholder, PAGE_TOP_PARTIAL)
            .replace(footerPlaceholder, PAGE_BOTTOM_PARTIAL)
            .replace(pageTitlePlaceholder, pageTitleText)
            .replace(pageIdPlaceholder, renderOptions.targetPage)
            .replace(angularVersionPlaceholder, renderOptions.frameworkVersion)
            .replace(periscopeButtonPlaceholder, 'P-Scope Control Button') // Changed replacement text
            .replace(resetButtonPlaceholder, 'Clear Form Button') // Changed replacement text
            .replace(/\|([$-\w\.\(\)]+)\|/g, '<code>$1</code>'); // Changed <tt> to <code>

        // Updated ngView logic, simplified conditions and placeholders
        if (renderOptions.targetPage === 'ng_view_example') { // Renamed 'ngview'
            const angularMinorVersion = parseFloat(renderOptions.frameworkVersion);
            let ngRouteScriptInsertion = '';
            let ngRouteModuleInsertion = '';

            if (angularMinorVersion >= 1.3) { // Changed condition from 1.0/1.2 check
                ngRouteScriptInsertion = `<script src="/vendor_libs/angularjs-route-${renderOptions.frameworkVersion}/angular-route.js"></script>`;
                ngRouteModuleInsertion = "'ngRoute',";
            }

            processedOutput = processedOutput
                .replace('<!-- NG_ROUTE_SCRIPT_INSERT -->', ngRouteScriptInsertion) // New placeholder
                .replace('<!-- NG_ROUTE_MODULE_INSERT -->', ngRouteModuleInsertion); // New placeholder
        }

        // Add a new fragment: conditional debug information based on renderOptions
        if (renderOptions.debugMode) {
            processedOutput += `\n<!-- DEBUG INFORMATION: Rendered template for '${renderOptions.targetPage}' at ${new Date().toISOString()} -->`;
        }

        completionCallback(null, processCodeDisplay(processedOutput)); // Renamed 'sideBySideCode'
    });
}

// Function to process and format code snippets embedded within the template content
function processCodeDisplay(htmlContentString) { // Renamed 'sideBySideCode'
    const codeBlockStartMarker = '<!-- SOURCE_CODE_BEGIN -->'; // Renamed '#code-start#'
    const codeBlockEndMarker = '<!-- SOURCE_CODE_END -->'; // Renamed '#code-end#'

    // Guard clause: Check if both code markers are present in the HTML string
    if (htmlContentString.includes(codeBlockStartMarker) && htmlContentString.includes(codeBlockEndMarker)) {
        const startIndex = htmlContentString.indexOf(codeBlockStartMarker) + codeBlockStartMarker.length;
        const endIndex = htmlContentString.indexOf(codeBlockEndMarker);

        // Another guard: Ensure the markers are in a valid order and don't overlap
        if (startIndex >= endIndex) {
            console.warn("Code block markers found but are in an invalid order or overlap. Skipping code formatting.");
            return htmlContentString; // Return original content if markers are malformed
        }

        let rawCodeSection = htmlContentString.substring(startIndex, endIndex); // Renamed 'code'

        // Intermediate step: cleaning the extracted code snippet
        let cleanedCodeSnippet = rawCodeSection
            .replace(/<br>/g, '')   // Remove HTML line breaks
            .replace(/<\/?i>/g, '') // Remove italic tags
            .replace(/</g, '&lt;'); // Escape less-than characters

        // Update: Change how Angular expressions are escaped/formatted, using a more specific class
        cleanedCodeSnippet = cleanedCodeSnippet.replace(/\{\{/g, '{<span class="angular-expr-marker"></span>{');

        // Update: Remove trailing whitespace lines more explicitly at the end of the snippet
        cleanedCodeSnippet = cleanedCodeSnippet.replace(/\n\s*$/, '');

        const formattedCodeBlock = INLINE_CODE_MARKUP_START + cleanedCodeSnippet + INLINE_CODE_MARKUP_END;

        // Replace the markers and the original content with the newly formatted code block
        htmlContentString = htmlContentString
            .replace(codeBlockStartMarker, formattedCodeBlock)
            .replace(codeBlockEndMarker, '');
    }

    // Add a new non-essential fragment: remove a special 'no-code-block' marker if present
    const noCodeBlockMarker = '<!-- NO_CODE_SNIPPET_INDICATOR -->';
    if (htmlContentString.includes(noCodeBlockMarker)) {
        htmlContentString = htmlContentString.replace(noCodeBlockMarker, '');
    }

    return htmlContentString;
}