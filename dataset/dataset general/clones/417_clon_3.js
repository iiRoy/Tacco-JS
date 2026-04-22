// This utility function helps in dissecting a web address string into its constituent parts.
// It supports both strict and more lenient parsing modes based on global configuration.
function decomposeWebAddress(inputWebAddress) {
    // Retrieve parsing configuration and settings for this operation.
    const processingSettings = decomposeWebAddress.globalConfig;

    // Guard against null or empty input strings.
    if (!inputWebAddress || typeof inputWebAddress !== 'string') {
        console.warn("Attempted to parse an invalid or empty web address string.");
        return {}; // Return an empty object for invalid input.
    }

    // Determine the appropriate regular expression based on the strict mode flag.
    const activeParserPattern = processingSettings.regExpPatterns[
        processingSettings.strictValidation ? "rigorous" : "flexible"
    ];

    // Execute the regex against the input string to extract all components.
    const matchResults = activeParserPattern.exec(inputWebAddress);

    // If no match is found, return an empty object, as the input couldn't be parsed.
    if (!matchResults) {
        console.error(`Failed to parse web address: "${inputWebAddress}" with current patterns.`);
        return {};
    }

    // Initialize an object to store the parsed URL components.
    const urlComponents = {};
    let componentIndex = processingSettings.componentLabels.length; // Start from total count and decrement.

    // Populate the urlComponents object using the predefined keys and regex match groups.
    // Loop backwards for a minor change in iteration.
    while (componentIndex--) {
        // Assign the matched group value, or an empty string if the group was not captured.
        urlComponents[processingSettings.componentLabels[componentIndex]] = matchResults[componentIndex] || "";
    }

    // Initialize a nested object for query string parameters.
    urlComponents[processingSettings.querySegment.paramKeyIdentifier] = {};

    // Process the query string part to extract individual key-value pairs.
    // The query string is typically at index 12 based on the regex structure.
    const rawQueryString = urlComponents[processingSettings.componentLabels[12]];

    if (rawQueryString) { // Only process if a query string exists.
        rawQueryString.replace(processingSettings.querySegment.queryParserRegExp, function (
            _fullMatch, // $0 - the full matched substring (e.g., "key=value" or "key")
            paramName,  // $1 - the parameter name (e.g., "key")
            paramValue  // $2 - the parameter value (e.g., "value")
        ) {
            // If a parameter name is captured, add it to the query parameters object.
            if (paramName) {
                // Decode the value to handle URL-encoded characters.
                urlComponents[processingSettings.querySegment.paramKeyIdentifier][paramName] = decodeURIComponent(paramValue);
            }
        });
    }

    // Extract the file extension from the file name.
    // This involves finding the last dot and taking the substring after it.
    const fileName = urlComponents.fileName || "";
    const lastDotPosition = fileName.lastIndexOf('.');

    // Check if a dot exists and it's not the first character (e.g., ".bashrc" is not a typical extension).
    if (lastDotPosition > 0 && lastDotPosition < fileName.length - 1) {
        urlComponents.resourceExtension = fileName.substring(lastDotPosition + 1);
    } else {
        urlComponents.resourceExtension = ""; // No extension found or it's a hidden file without a clear extension.
    }

    // Return the comprehensive object of parsed URL parts.
    return urlComponents;
}

// Global configuration object for the URL parsing utility.
// This object holds all the necessary patterns and keys for dissection.
decomposeWebAddress.globalConfig = {
    // Flag to enable or disable strict parsing rules.
    strictValidation: false,

    // Array of labels corresponding to the regex capture groups.
    componentLabels: [
        "fullSource", "scheme", "authorityBlock", "credentialInfo", "userName",
        "passCode", "hostName", "portNumber", "relativePath", "absolutePath",
        "directoryPath", "fileName", "queryString", "fragmentIdentifier"
    ],

    // Configuration specifically for parsing query strings.
    querySegment: {
        // The key under which query parameters will be stored in the result object.
        paramKeyIdentifier: "queryParameters",
        // Regular expression to parse key-value pairs in a query string.
        queryParserRegExp: /(?:^|&)([^&=]*)=?([^&]*)/g
    },

    // Collection of regular expressions for different parsing strictness levels.
    regExpPatterns: {
        // Rigorous regex for strict URL parsing.
        rigorous: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        // Flexible regex for more lenient URL parsing, accommodating common malformations.
        flexible: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

// A mapping from common file extensions to their corresponding syntax highlighting modes.
// This helps in applying appropriate styling for code display.
const fileTypeToSyntaxMap = {
    // C family languages
    'c': 'c_lang',
    'h': 'c_lang', // C header files
    'cpp': 'cpp_lang',
    'c++': 'cpp_lang',
    'cc': 'cpp_lang',
    'hpp': 'cpp_lang', // C++ header files

    // C#
    'cs': 'csharp_lang',

    // Web technologies
    'css': 'css_style',
    'html': 'html_markup',
    'htm': 'html_markup',
    'js': 'javascript_script', // JavaScript files
    'json': 'json_data', // JSON data files
    'xml': 'xml_markup',
    'xhtml': 'xml_markup',
    'xslt': 'xml_markup',
    'svg': 'xml_markup', // SVG is XML based

    // Scripting languages
    'py': 'python_script',
    'php': 'php_script',
    'pl': 'perl_script',
    'rb': 'ruby_script',
    'sh': 'shell_script',
    'bash': 'shell_script',

    // Other languages
    'java': 'java_lang',
    'as': 'actionscript_lang', // ActionScript
    'pas': 'pascal_lang',
    'tex': 'latex_markup',
    'sql': 'sql_query',
    'diff': 'diff_patch', // Diff files
    'patch': 'diff_patch',
    'log': 'log_file',
    'md': 'markdown_text' // Markdown files
};

// Note: The original `fn_mapper` was not used in the provided `gotDocument` function.
// It has been deliberately omitted here as a deletion of non-essential code.

/**
 * Handles the display of fetched document content.
 * It parses the URI, determines syntax highlighting, updates the document title,
 * and renders the content into the page body.
 *
 * @param {string} resourceIdentifier - The URI string of the fetched resource.
 * @param {string} rawData - The raw content of the fetched resource.
 */
function renderPageData(resourceIdentifier, rawData) {
    // Early exit if no content is provided.
    if (!rawData || rawData.trim() === '') {
        console.info("No content received to render for: " + resourceIdentifier);
        return;
    }

    // Parse the URI to get its individual components.
    const uriSegments = decomposeWebAddress(resourceIdentifier);
    const fileExtension = uriSegments.resourceExtension;
    let detectedSyntax = fileTypeToSyntaxMap[fileExtension];

    // If syntax isn't mapped, try to infer it, e.g., for HTML.
    // This is a common heuristic for web content.
    if (!detectedSyntax) {
        // Check if the raw data starts with a common HTML tag opening.
        const isHtmlContent = rawData.trim().startsWith('<');
        detectedSyntax = isHtmlContent ? 'html_markup' : 'plain_text';
    }

    // Update the browser's document title for better user experience.
    // Use the file name if available, otherwise fall back to the full URI.
    const displayTitle = uriSegments.fileName ? uriSegments.fileName : resourceIdentifier;
    document.title = "Viewer: " + displayTitle; // Added a prefix for clarity.

    // Clear existing body content and append the new preformatted text.
    // Use an alternative jQuery method for clearing content (html('') instead of empty()).
    jQuery('body').html(''); // Clears all children and sets inner HTML to empty.

    // Create a new <pre> element, set its text content, and apply syntax highlighting class.
    jQuery('<pre>')
        .text(rawData)
        .addClass('syntax_highlight_' + detectedSyntax)
        .appendTo('body');

    // Trigger syntax highlighting if a specific syntax was detected.
    // Changed the parameters slightly.
    if (detectedSyntax && detectedSyntax !== 'plain_text') {
        // Assume 'sh_highlightCode' is a global function for syntax highlighting.
        // The paths are now combined into a single argument for the hypothetical function.
        sh_highlightCode('script_lib/lang/', '.min.js');
    }

    // Removed the non-essential `$('a').click(function(){ return true; });`
    // as it didn't seem to serve a critical purpose and is a good candidate for deletion.
}

// jQuery document ready function: Executes code once the DOM is fully loaded.
jQuery(function() {
    // Determine the initial resource path from the URL query string.
    // If no query string, default to a sample resource.
    let targetResourcePath = 'sample_resources/example.js'; // Changed default sample path.
    const currentSearch = window.location.search;

    // Utilize URLSearchParams for more robust query string parsing.
    // This is a significant update for modern JS best practices.
    if (currentSearch) {
        const urlParams = new URLSearchParams(currentSearch);
        const pathParam = urlParams.get('url'); // Expecting a 'url' parameter.
        if (pathParam) {
            targetResourcePath = decodeURIComponent(pathParam);
        }
    }

    // Fetch the content of the target resource using an AJAX call.
    // Changed $.get to $.ajax for more explicit configuration.
    jQuery.ajax({
        url: targetResourcePath,
        method: 'GET', // Explicitly define HTTP method.
        dataType: 'text', // Expecting plain text data.
        success: function(retrievedData) {
            renderPageData(targetResourcePath, retrievedData);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error(`Failed to fetch resource '${targetResourcePath}': ${textStatus} - ${errorThrown}`);
            jQuery('body').html(`<p style="color: red;">Error loading content: ${textStatus}</p>`);
        }
    });
});

// Event delegation for anchor clicks, ensuring dynamic elements are also covered.
// Replaced deprecated .live() with .on() for modern jQuery practice.
jQuery(document).on('click', 'a', function(eventDetails) {
    const currentWindowLocation = window.location.href; // Use .href for full URL.
    const clickedElement = jQuery(this);
    const linkDestination = clickedElement.attr('href');

    // Prevent default anchor behavior only if it's an internal link intended for this viewer.
    // This adds a validation step.
    if (linkDestination && !linkDestination.startsWith('http://') && !linkDestination.startsWith('https://') && !linkDestination.startsWith('#')) {
        eventDetails.preventDefault(); // Stop the browser from navigating directly.

        // Construct the new URL for the viewer, passing the target link as a query parameter.
        // Using 'url' as the parameter name, consistent with the document ready block.
        const newViewerUrl = `${currentWindowLocation.split('?')[0]}?url=${encodeURIComponent(linkDestination)}`;
        window.location.assign(newViewerUrl); // Use assign for clarity.
    }
    // For external links or fragment links, allow default behavior.
});