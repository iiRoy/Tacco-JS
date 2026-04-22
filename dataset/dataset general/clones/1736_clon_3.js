// This module provides a flexible HTML templating engine, allowing for dynamic content generation,
// attribute handling, and optional HTML formatting with indentation and entity escaping.
// It is designed to process template functions defined within a specific context and return
// a fully rendered HTML string.
function renderHtmlTemplate(renderOptions) {
  // Initialize configuration options, ensuring all critical properties have default values
  // to prevent runtime errors if they are not explicitly provided by the caller.
  renderOptions = renderOptions ?? {}; // Use nullish coalescing for concise defaults.
  renderOptions.context ??= {};        // Context object for template function execution.
  renderOptions.locals ??= {};         // Local variables (though not extensively used in this version).
  renderOptions.format ??= false;      // Flag to enable pretty-printing with indentation.
  renderOptions.autoescape ??= false;  // Flag to automatically escape HTML entities in output.

  // --- Core Utility Functions for HTML Generation ---

  // A modernized replacement for Object.prototype.hasOwnProperty.call.
  // Checks if an object has a specified property directly on itself.
  const checkOwnProperty = Object.hasOwn;

  // The primary buffer where all generated HTML fragments are stored before final assembly.
  const outputFragments = [];

  // Transforms a plain JavaScript object into an HTML attribute string.
  // Example: `{ id: 'myDiv', class: 'container' }` becomes ` id="myDiv" class="container"`.
  const formatAttributes = (attributeObject) => {
    let attributeString = '';
    // Iterates over all direct properties of the given object.
    for (const keyName in attributeObject) {
      if (checkOwnProperty(attributeObject, keyName)) {
        const attributeValue = attributeObject[keyName];
        // Each attribute value is HTML-escaped to prevent injection vulnerabilities.
        attributeString += ` ${keyName}="${escapeContent(attributeValue)}"`;
      }
    }
    return attributeString;
  };

  // A comprehensive map of common HTML doctype declarations.
  // This allows templates to easily specify the desired document type.
  const knownDoctypes = {
    '5': '<!DOCTYPE html>',
    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.W3C.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.W3C.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.W3C.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.W3C.org/TR/xhtml-basic/xhtml-basic11.dtd">',
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
  };

  // An array listing HTML tags that are "void elements" (self-closing) and do not
  // require a separate closing tag (e.g., `<img />` instead of `<img></img>`).
  const voidElements = ['area', 'base', 'basefont', 'br', 'hr', 'img', 'input', 'link', 'meta'];

  // Conditionally escapes HTML entities in a given string based on the `autoescape` option.
  // If autoescaping is disabled, the input is simply converted to a string.
  const escapeContent = (inputString) => {
    return renderOptions.autoescape ? sanitizeString(inputString) : String(inputString);
  };

  // Manages the current level of indentation for formatted HTML output.
  let currentIndentLevel = 0;

  // Generates a string by repeating a base string a specified number of times.
  // Ensures the repetition count is a valid non-negative integer.
  const makeRepeatedString = (baseString, repetitionCount) => {
    const count = Math.max(0, Math.floor(repetitionCount));
    return baseString.repeat(count);
  };

  // Adds the current indentation (spaces) to the output buffer if formatting is enabled.
  const generateIndentation = () => {
    if (renderOptions.format) {
      addTextFragment(makeRepeatedString('  ', currentIndentLevel));
    }
  };

  // Performs basic HTML entity escaping for characters like '&', '<', '>', and '"'.
  // This is a crucial security measure against Cross-Site Scripting (XSS).
  const sanitizeString = (rawText) => {
    return String(rawText)
      .replace(/&(?!\w+;)/g, '&amp;') // Escape '&' unless it's part of an existing entity.
      .replace(/</g, '&lt;')          // Escape '<'
      .replace(/>/g, '&gt;')          // Escape '>'
      .replace(/"/g, '&quot;');       // Escape '"'
  };

  // Appends a specific HTML doctype declaration to the output.
  // Defaults to HTML5 if no type identifier is provided or if it's unknown.
  const outputDoctype = (typeIdentifier) => {
    const actualType = typeIdentifier ?? '5'; // Default to HTML5.
    const doctypeString = knownDoctypes[actualType];

    if (!doctypeString) {
      // Log a warning for unknown doctypes but proceed with a default.
      console.warn(`Template Warning: Unknown doctype identifier "${actualType}". Defaulting to HTML5.`);
      addTextFragment(knownDoctypes['5']);
    } else {
      addTextFragment(doctypeString);
    }

    if (renderOptions.format) {
      addTextFragment('\n'); // Add a newline after doctype for readability.
    }
  };

  // The most fundamental function: adds any string value directly to the output buffer.
  const addTextFragment = (textValue) => {
    outputFragments.push(String(textValue));
    return null; // Returns null to be consistent with other helper functions.
  };

  // Generates an HTML comment tag.
  const htmlComment = (commentText) => {
    addTextFragment(`<!--${commentText}-->`);
    if (renderOptions.format) {
      addTextFragment('\n'); // Newline after comment for formatted output.
    }
  };

  // A public-facing function to create an HTML tag. It acts as a facade,
  // delegating to the internal `processHtmlTag` for the heavy lifting.
  // It uses rest parameters for a cleaner argument signature.
  const createTag = (tagName, ...tagContent) => {
    // Basic input validation: ensure the tag name is a non-empty string.
    if (typeof tagName !== 'string' || tagName.trim() === '') {
      console.error('Template Error: Invalid or empty tag name provided:', tagName);
      return null;
    }
    return processHtmlTag(tagName, tagContent);
  };

  // The core logic for rendering an HTML element. It handles:
  // - Indentation for formatted output.
  // - Attribute rendering from objects.
  // - Differentiating between self-closing and regular tags.
  // - Processing nested content, including direct text, numbers, and callback functions.
  const processHtmlTag = (elementName, elementArgs) => {
    generateIndentation();
    addTextFragment(`<${elementName}`);

    // First pass: extract and render attributes from the arguments.
    // Attributes are typically the first object argument.
    for (const arg of elementArgs) {
      // Check if the argument is a plain object (not null and not an array).
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        addTextFragment(formatAttributes(arg));
      }
    }

    // Determine if the tag is self-closing based on the `voidElements` list.
    if (voidElements.includes(elementName)) {
      addTextFragment(' />'); // XHTML-style self-closing tag.
      if (renderOptions.format) {
        addTextFragment('\n');
      }
    } else {
      addTextFragment('>'); // End the opening tag.

      // Second pass: process the content of the tag.
      for (const arg of elementArgs) {
        switch (typeof arg) {
          case 'string':
          case 'number':
            // Direct text or numbers are escaped and added.
            addTextFragment(escapeContent(arg));
            break;
          case 'function':
            // If content is a function, execute it to get dynamic content.
            if (renderOptions.format) {
              addTextFragment('\n'); // Newline before indented content.
            }
            currentIndentLevel++; // Increase indent for nested content.
            // Call the function, ensuring `this` refers to the template context.
            const functionResult = arg.call(renderOptions.context);
            if (typeof functionResult === 'string' || typeof functionResult === 'number') {
              generateIndentation();
              addTextFragment(escapeContent(functionResult));
              if (renderOptions.format) {
                addTextFragment('\n');
              }
            }
            currentIndentLevel--; // Decrease indent after nested content.
            generateIndentation(); // Indent the closing tag to match its opening.
            break;
          // Objects (attributes) are handled in the first pass. Other types are ignored as content.
        }
      }
      addTextFragment(`</${elementName}>`); // Add the closing tag.
      if (renderOptions.format) {
        addTextFragment('\n');
      }
    }
    return null; // Return null consistently.
  };

  // Helper function to embed raw JavaScript code within a <script> tag.
  const embedScript = (scriptCode) => {
    // The original code wraps the script in `(;(... )();)`. We simplify this.
    return createTag('script', `(${scriptCode})();`);
  };

  // --- Shorthand Functions for Common HTML Tags ---
  // These provide a more convenient and readable way to construct HTML elements
  // without repeatedly calling `createTag`.
  const anchor = (...args) => createTag('a', ...args);
  const division = (...args) => createTag('div', ...args);
  const emphasis = (...args) => createTag('em', ...args);
  const webForm = (...args) => createTag('form', ...args);
  const headingTwo = (...args) => createTag('h2', ...args);
  const italicText = (...args) => createTag('i', ...args);
  const formInput = (...args) => createTag('input', ...args);
  const listItem = (...args) => createTag('li', ...args);
  const paragraph = (...args) => createTag('p', ...args);
  const strikethrough = (...args) => createTag('s', ...args);
  const sectionContainer = (...args) => createTag('section', ...args);
  const spanElement = (...args) => createTag('span', ...args);
  const tableHeader = (...args) => createTag('th', ...args);
  const timeElement = (...args) => createTag('time', ...args);
  const tableRow = (...args) => createTag('tr', ...args);
  const underlinedText = (...args) => createTag('u', ...args);
  const unorderedList = (...args) => createTag('ul', ...args);

  // --- Template Definition and Execution ---
  // An Immediately-Invoked Function Expression (IIFE) is used here to encapsulate
  // template definitions and their associated helper functions, preventing global
  // scope pollution and organizing the template logic.
  (() => {
    // Stores all named template functions.
    const componentLibrary = {};

    // Utility to left-pad a number with a leading zero if it's a single digit.
    // Useful for consistent date/time formatting.
    const formatZeroPad = (value) => {
      const stringValue = String(value);
      return stringValue.length < 2 ? `0${stringValue}` : stringValue;
    };

    // Formats a Date object's time components (hours, minutes, seconds) into a `HH:MM:SS` string.
    const getFormattedTime = (dateObject) => {
      // Robust validation for the input Date object.
      if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
        console.warn('Template Warning: Invalid Date object provided for time formatting. Returning empty string.');
        return '';
      }
      return `${formatZeroPad(dateObject.getHours())}:${formatZeroPad(dateObject.getMinutes())}:${formatZeroPad(dateObject.getSeconds())}`;
    };

    // --- Individual Template Component Definitions ---

    // Template for the overall application layout.
    componentLibrary.appLayout = () => {
      return sectionContainer({ class: 'application-wrapper' }, () => {
        division({ id: 'left-panel' }, () => {
          return division({ class: 'content-area', id: 'channel-list-display' });
        });
        return division({ id: 'right-panel' }, () => {
          return division({ class: 'content-area', id: 'channel-view' });
        });
      });
    };

    // Template for a chat window interface.
    componentLibrary.chatWindow = () => {
      return sectionContainer({ class: 'chat-interface' }, () => {
        headingTwo(() => {
          // Accesses 'name' from the provided rendering context.
          return renderOptions.context.name || 'General Chat'; // Default if name is missing.
        });
        unorderedList({ class: 'message-list' }); // Placeholder for chat messages.
        return webForm({ class: 'message-input-form' }, () => {
          return formInput({
            type: 'text',
            id: 'message-input',
            autocomplete: 'off',
            placeholder: 'Enter your message here...' // Added a helpful placeholder.
          });
        });
      });
    };

    // Template for displaying a single chat message within a list.
    componentLibrary.chatMessage = () => {
      return listItem({ class: 'chat-message-item' }, () => {
        spanElement({ class: 'sender-nickname' }, () => {
          return renderOptions.context.from || 'Anonymous';
        });
        spanElement({ class: 'message-timestamp' }, () => {
          return getFormattedTime(renderOptions.context.received);
        });
        // The message content itself, directly from the context.
        return renderOptions.context.message || '';
      });
    };

    // Template for a list of conversations or channels.
    componentLibrary.conversationList = () => {
      return sectionContainer({ class: 'conversation-list-wrapper' }, () => {
        headingTwo(() => {
          return 'Current Conversations';
        });
        return unorderedList({ class: 'channel-items' }); // Placeholder for individual channel entries.
      });
    };

    // Template for an individual item within the conversation list.
    componentLibrary.conversationListItem = () => {
      return listItem({ class: 'channel-entry-item' }, () => {
        spanElement({ class: 'channel-name' }, () => {
          return renderOptions.context.name || 'Unnamed Conversation';
        });
        // A span for dynamic message count, defaulting to '0'.
        return spanElement({ class: 'unread-message-count' }, '0');
      });
    };

    // --- Template Execution Logic ---
    // The engine determines which template to render based on the 'template' property
    // found within the `renderOptions.context`.
    const requestedTemplateName = renderOptions.context.template;

    if (requestedTemplateName && typeof componentLibrary[requestedTemplateName] === 'function') {
      // If a valid template is found, execute it. The `.call()` method ensures that
      // `this` inside the template function refers to `renderOptions.context`.
      componentLibrary[requestedTemplateName].call(renderOptions.context);
    } else if (requestedTemplateName) {
      console.warn(`Template Warning: Requested template "${requestedTemplateName}" not found in component library.`);
    } else {
      console.warn('Template Warning: No template name specified in renderOptions.context.template.');
    }

    // The orphaned object literal `({ tagName: 'li', className: 'irc-channel' });`
    // from the original source has been identified as non-functional and removed.
  }).call(renderOptions.context); // Execute the IIFE, binding `this` to the template context.

  // Finally, join all collected HTML fragments into a single, complete HTML string.
  return outputFragments.join('');
}