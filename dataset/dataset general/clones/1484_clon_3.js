const assert = require("chai").expect;
const contentFilter = require(".."); // Assuming '..' refers to the main module export

// This module contains a series of unit tests for the HTML sanitization utility.
// It verifies that various HTML constructs are correctly filtered or allowed.
describe("contentFilter.filterContent() functionality", () => {
  /**
   * Generates a test suite function for HTML sanitization.
   * This helper sets up an expectation for how a given HTML string should be transformed.
   *
   * @param {string} rawInput - The original, potentially unsafe, HTML string.
   * @param {string} [expectedOutput] - The anticipated safe HTML string after filtering.
   *                                    If omitted, rawInput is used as expectedOutput.
   * @returns {Function} A test function compatible with Mocha's `it` block.
   */
  const createHtmlTestScenario = (rawInput, expectedOutput) => {
    // If no specific output is provided, assume the input should remain unchanged.
    const finalExpected = expectedOutput !== undefined ? expectedOutput : rawInput;

    return () => {
      // Execute the sanitization and compare the result.
      const processedResult = contentFilter(rawInput);
      assert(processedResult, `Processing "${rawInput}"`).to.equal(finalExpected);
      // An additional check for type consistency could be added here, e.g., typeof processedResult === 'string'
    };
  };

  /**
   * Generates a test suite function for URL sanitization.
   * This helper sets up an expectation for how a given URL string should be transformed.
   *
   * @param {string} unsafeUrl - The original URL string to be filtered.
   * @param {string} [safeUrl] - The anticipated safe URL string after processing.
   *                             If omitted, unsafeUrl is used as safeUrl.
   * @returns {Function} A test function for URL filtering.
   */
  const createUrlTestScenario = (unsafeUrl, safeUrl) => {
    // Default to the input URL if no specific safe URL is provided.
    const finalExpectedUrl = safeUrl !== undefined ? safeUrl : unsafeUrl;

    return () => {
      // Perform the URL sanitization and assert the outcome.
      const filteredLink = contentFilter.url(unsafeUrl);
      assert(filteredLink, `Filtering URL "${unsafeUrl}"`).to.equal(finalExpectedUrl);
    };
  };

  // --- Test Group: Forbidden Elements and Attributes ---
  describe("Removes disallowed elements and attributes", () => {
    // Tests for script tags
    it("eliminates script blocks", createHtmlTestScenario('<script>maliciousCode();</script>', ''));
    // Tests for style tags
    it("removes style definitions", createHtmlTestScenario('<style>body { display: none; }</style>', ''));
    // Tests for iframe tags
    it("strips iframe embeds", createHtmlTestScenario('<iframe>external content</iframe>', ''));
    // Tests for specific attributes
    it("discards 'id' attribute", createHtmlTestScenario('<div id="uniqueId"></div>', '<div></div>'));
    it("discards 'class' attribute", createHtmlTestScenario('<span class="cssClass"></span>', '<span></span>'));
    it("discards 'style' attribute", createHtmlTestScenario('<p style="color:red;"></p>', '<p></p>'));
    it("discards 'on*' event attributes", createHtmlTestScenario('<button onclick="alert(1)"></button>', '<button></button>'));
    it("discards 'data-*' attributes", createHtmlTestScenario('<div data-custom="value"></div>', '<div></div>'));

    // Tests for uncontained list items (structural integrity)
    it("removes orphaned list items", createHtmlTestScenario('<div><li>Item</li></div>', '<div></div>'));
    // Tests for uncontained table elements (structural integrity)
    it("removes orphaned table headers", createHtmlTestScenario('<thead><tr><th></th></tr></thead>', ''));
    it("removes orphaned table bodies", createHtmlTestScenario('<tbody><tr><td></td></tr></tbody>', ''));
    it("removes orphaned table footers", createHtmlTestScenario('<tfoot><tr><td></td></tr></tfoot>', ''));
  });

  // --- Test Group: Permitted Elements and Attributes ---
  describe("Preserves allowed elements and attributes", () => {
    it("keeps anchor tags", createHtmlTestScenario('<a>Link Text</a>'));
    it("retains 'href' attribute on anchors", createHtmlTestScenario('<a href="/path/to/page">Link</a>'));
    it("allows aside elements", createHtmlTestScenario('<aside>Sidebar content</aside>'));
    it("preserves break tags", createHtmlTestScenario('<br>'));
    it("handles list items within unordered lists", createHtmlTestScenario('<ul><li>First</li><li>Second</li></ul>'));
    it("handles list items within ordered lists", createHtmlTestScenario('<ol><li>Step 1</li><li>Step 2</li></ol>'));
    it("keeps horizontal rule tags", createHtmlTestScenario('<hr>'));
    it("allows complex table structures", createHtmlTestScenario('<table><caption>Data</caption><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>'));
  });

  // --- Test Group: URL Filtering ---
  describe("URL filtering mechanism (contentFilter.url)", () => {
    // This section focuses on the specific URL sanitization utility.
    describe("Disallows potentially dangerous URL schemes", () => {
      it("blocks 'javascript:' protocol", createUrlTestScenario("javascript:alert('XSS')", ""));
      it("blocks 'data:' protocol", createUrlTestScenario("data:text/html,<script>alert(1)</script>", ""));
    });

    describe("Permits safe URL schemes and structures", () => {
      it("allows standard 'http' URLs", createUrlTestScenario('http://example.com/'));
      it("allows secure 'https' URLs", createUrlTestScenario('https://secure.example.com/path'));
      it("allows 'mailto' links", createUrlTestScenario('mailto:user@example.com'));
      it("allows local anchor links", createUrlTestScenario('#sectionId'));
      it("allows relative paths", createUrlTestScenario('/relative/path/page.html'));
      it("allows protocol-relative URLs", createUrlTestScenario('//cdn.example.com/image.png'));
    });
  });

  // --- Test Group: Known XSS Attack Vectors ---
  describe("Resists common XSS attack patterns", () => {
    // Helper for common XSS attack snippets
    const createAttackTest = (attackString, expectedClean) => {
      // Basic validation: ensure inputs are strings
      if (typeof attackString !== 'string' || typeof expectedClean !== 'string') {
        throw new Error("Attack test inputs must be strings.");
      }
      return createHtmlTestScenario(attackString, expectedClean);
    };

    it("malformed image tag with script injection", createAttackTest('<IMG """><SCRIPT>alert("XSS")</SCRIPT>"', '<img>"'));
    it("image tag with malformed event handler", createAttackTest('<IMG SRC= onmouseover="alert(\'xxs\')">', '<img src="">'));
    it("anchor with HTML entity encoded javascript protocol", createAttackTest('<a href=" &#14; javascript:doevil">Click</a>', '<a href="">Click</a>'));
    it("anchor with numeric HTML entity encoded javascript protocol", createAttackTest('<a href="&#106;&#97;">Hack</a>', '<a href="">Hack</a>'));
    it("double encoded script tag in href", createAttackTest('<a href="%2520javascript:alert(1)">Click here</a>', '<a href="">Click here</a>'));
  });
});

// --- Test Group: Internal Utility Function: sanitizeAttributes ---
describe("contentFilter._sanitizeAttributes() internal utility", () => {
  // Verifies robust handling of attribute structures.
  it("gracefully manages undefined attribute entries", () => {
    assert(() => {
      // Simulate an element with an attribute that might be undefined due to parsing quirks.
      const simulatedElement = [{ tagName: "div", attributes: { "0": undefined, "name": "data-test" } }];
      contentFilter._sanitizeAttributes(simulatedElement, contentFilter.defaults);
    }, "Should not throw an error for undefined attributes").to.not.throw();
  });

  // Verifies that only own properties are iterated over to prevent prototype pollution or unexpected behavior.
  it("processes only direct properties, ignoring prototype chain", () => {
    let removalAttempted = false; // Flag to check if an attribute removal was triggered.

    // Custom attribute map that has a property on its prototype.
    function CustomAttrMap() { }
    CustomAttrMap.prototype.inheritedProp = () => { }; // This should be ignored.

    const elemAttributes = new CustomAttrMap();
    elemAttributes.someAttr = { name: "test", value: "value" }; // This is an own property.

    const mockElement = [{ tagName: "p", attributes: elemAttributes }];
    // Mock the removeAttr method to capture calls.
    mockElement.removeAttr = (attrName) => {
      if (attrName === "inheritedProp") {
        removalAttempted = true;
      }
    };

    // Options configured to remove all attributes (regex matches nothing).
    const filteringOptions = { attributes: { all: /^$/ } };
    contentFilter._sanitizeAttributes(mockElement, filteringOptions);

    // Assert that the prototype property was not considered for removal.
    assert(removalAttempted, "Prototype properties should not trigger attribute removal logic").to.be.false;
  });
});

// --- Test Group: Internal Utility Function: getAttributeName ---
describe("contentFilter._getAttributeName() internal utility", () => {
  describe("Handles attributes with numeric indices (e.g., jQuery-style DOM elements)", () => {
    // Example attribute collection from jQuery or similar DOM parsing.
    const indexedAttributes = { "0": { name: "id", value: "myId" }, "1": undefined, "length": 2 };
    const indexedAttributesAlt = { "0": { name: "class", value: "test-class" }, "length": 1 };

    it("successfully retrieves attribute name by numeric index", () => {
      assert(contentFilter._getAttributeName(indexedAttributes, 0), "Attribute at index 0").to.equal("id");
      assert(contentFilter._getAttributeName(indexedAttributesAlt, "0"), "Attribute at string '0' index").to.equal("class");
    });

    it("returns undefined for non-existent or undefined numeric attributes", () => {
      assert(contentFilter._getAttributeName(indexedAttributes, 1), "Undefined attribute at index 1").to.be.undefined;
      assert(contentFilter._getAttributeName(indexedAttributes, 5), "Non-existent attribute at index 5").to.be.undefined;
    });
  });

  describe("Handles attributes with named indices (e.g., Node.js/Cheerio-style objects)", () => {
    // Example attribute collection from Node.js environment or Cheerio.
    const namedAttributes = { "data-role": { name: "data-role", value: "button" }, "aria-hidden": { name: "aria-hidden", value: "true" } };

    it("successfully retrieves attribute name by its string key", () => {
      assert(contentFilter._getAttributeName(namedAttributes, "data-role"), "Attribute by 'data-role' key").to.equal("data-role");
      assert(contentFilter._getAttributeName(namedAttributes, "aria-hidden"), "Attribute by 'aria-hidden' key").to.equal("aria-hidden");
    });

    it("returns undefined for a non-existent named attribute", () => {
      assert(contentFilter._getAttributeName(namedAttributes, "non-existent-attr"), "Non-existent named attribute").to.be.undefined;
    });
  });
});