let totalTestCount = 0;
let failedTestCount = 0;
let testScenarios = [];

function logFailure(messageContent) {
  console.error("TEST FAILURE: " " + messageContent);
  failedTestCount++;
}

function logSuccess(messageContent) {
  // console.log("TEST SUCCESS: " + messageContent); // Optional: log successes
}

function assertMatch(actualValue, expectedValue, assertionDescription) {
  totalTestCount++;
  if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
    logFailure(`[${assertionDescription}] Mismatch. Result: '${JSON.stringify(actualValue)}', Anticipated: '${JSON.stringify(expectedValue)}'`);
  } else {
    logSuccess(`[${assertionDescription}] Match.`);
  }
}

function assertNoThrow(operationFunction, assertionDescription) {
  totalTestCount++;
  try {
    operationFunction();
    logSuccess(`[${assertionDescription}] No exception.`);
  } catch (caughtError) {
    logFailure(`[${assertionDescription}] Unexpected exception: ${caughtError.message}`);
  }
}

function executeAllScenarios() {
  console.log("\n--- Commencing All Verification Scenarios ---");
  testScenarios.forEach(scenarioEntry => {
    scenarioEntry.run();
  });
  console.log("\n--- Verification Run Concluded ---");
  console.log(`Total Scenarios Examined: ${totalTestCount}`);
  console.log(`Scenarios That Failed: ${failedTestCount}`);

  if (failedTestCount > 0) {
    console.error("!!! SOME VERIFICATION SCENARIOS DID NOT PASS !!!");
    // process.exit(1); // Uncomment for Node.js to indicate failure
  } else {
    console.log("All Verification Scenarios Passed Successfully.");
    // process.exit(0); // Uncomment for Node.js to indicate success
  }
}

function defineTestGroup(groupLabel, groupInitializationFunction) {
  console.log(`\n--- Verification Group: ${groupLabel} ---`);
  groupInitializationFunction();
}

function addTestScenario(scenarioLabel, scenarioExecutionFunction) {
  testScenarios.push({ name: scenarioLabel, run: scenarioExecutionFunction });
}

// Assume `globalThis.contentFilter` is the external library being tested.
// It should expose `globalThis.contentFilter`, `globalThis.contentFilter.url`,
// `globalThis.contentFilter._processElementAttributes`, and
// `globalThis.contentFilter._fetchAttributeKey`.

function createMarkupTestExecutor(sourceText, expectedCleanText) {
  if (arguments.length === 1) expectedCleanText = sourceText;
  return function() { assertMatch(globalThis.contentFilter(sourceText), expectedCleanText, sourceText); };
}

function createResourcePathTestExecutor(sourcePath, expectedCleanPath) {
  if (arguments.length === 1) expectedCleanPath = sourcePath;
  return function() { assertMatch(globalThis.contentFilter.url(sourcePath), expectedCleanPath, sourcePath); };
}

defineTestGroup("Content Filtering Module Checks", function() {
  defineTestGroup("Content Removal Cases", function() {
    addTestScenario("Script elements eradicated", createMarkupTestExecutor('<script>doevil</script>', ''));
    addTestScenario("Style elements eradicated", createMarkupTestExecutor('<style>doevil</style>', ''));
    addTestScenario("Iframe elements eradicated", createMarkupTestExecutor('<iframe></iframe>', ''));
    addTestScenario("ID property removed", createMarkupTestExecutor('<img id="one">', '<img>'));
    addTestScenario("Class property removed", createMarkupTestExecutor('<img class="one">', '<img>'));
    addTestScenario("Style property removed", createMarkupTestExecutor('<img style="test">', '<img>'));
    addTestScenario("Event properties removed", createMarkupTestExecutor('<img onclick="doevil">', '<img>'));
    addTestScenario("Data properties removed", createMarkupTestExecutor('<img data-test="test">', '<img>'));
    addTestScenario("Unnested LI element cleared", createMarkupTestExecutor('<div><li></li></div>', '<div></div>'));
    addTestScenario("Unnested THEAD element cleared", createMarkupTestExecutor('<thead></thead>', ''));
    addTestScenario("Unnested TBODY element cleared", createMarkupTestExecutor('<tbody></tbody>', ''));
    addTestScenario("Unnested TFOOT element cleared", createMarkupTestExecutor('<tfoot></tfoot>', ''));
    addTestScenario("Unnested TR element cleared", createMarkupTestExecutor('<tr></tr>', ''));
    addTestScenario("Unnested TD element cleared", createMarkupTestExecutor('<td></td>', ''));
    addTestScenario("Unnested TH element cleared", createMarkupTestExecutor('<th></th>', ''));
  });

  defineTestGroup("Permitted Content Cases", function() {
    addTestScenario("Anchor element permitted", createMarkupTestExecutor('<a>one</a>'));
    addTestScenario("Anchor with link permitted", createMarkupTestExecutor('<a href="#">one</a>'));
    addTestScenario("Aside element permitted", createMarkupTestExecutor('<aside></aside>'));
    addTestScenario("Break element permitted", createMarkupTestExecutor('<br>'));
    addTestScenario("List item in unordered list permitted", createMarkupTestExecutor('<ul><li>one</li></ul>'));
    addTestScenario("List item in ordered list permitted", createMarkupTestExecutor('<ol><li>one</li></ol>'));
    addTestScenario("Horizontal rule permitted", createMarkupTestExecutor('<hr>'));
    addTestScenario("Table structure permitted", createMarkupTestExecutor('<table><tbody><tr><th></th></tr><tr><td></td></tr></tbody></table>'));
  });

  defineTestGroup("Resource Locator Filtering", function() {
    defineTestGroup("Locator Removal", function() {
      addTestScenario("Javascript URI scheme eradicated", createResourcePathTestExecutor("javascript:doevil", ""));
    });

    defineTestGroup("Locator Permitted", function() {
      addTestScenario("HTTP URL scheme allowed", createResourcePathTestExecutor('http://'));
      addTestScenario("HTTPS URL scheme allowed", createResourcePathTestExecutor('https://'));
      addTestScenario("Mailto URL scheme allowed", createResourcePathTestExecutor('mailto:'));
      addTestScenario("Local fragment identifier allowed", createResourcePathTestExecutor('#local'));
      addTestScenario("Relative path allowed", createResourcePathTestExecutor('/relative'));
    });
  });

  defineTestGroup("Security Exploitation Tests", function() {
    addTestScenario("Maliciously formatted image tag with script", createMarkupTestExecutor('<IMG """><SCRIPT>alert("XSS")</SCRIPT>"', '<img>"'));
    addTestScenario("Maliciously formatted image tag with event trigger", createMarkupTestExecutor('<IMG SRC= onmouseover="alert(\'xxs\')">', '<img src="">'));
    addTestScenario("Obfuscated javascript URI with space", createMarkupTestExecutor('<a href=" &#14; javascript:doevil"></a>', '<a href=""></a>'));
    addTestScenario("Obfuscated javascript URI with numeric entities", createMarkupTestExecutor('<a href="&#106;&#97;"></a>', '<a href=""></a>'));
  });
});

defineTestGroup("Element Property Sanitation Routines", function() {
  addTestScenario("Handles undefined properties robustly", function() {
    let elementDefinition = [{ tagName: "div", attributes: { "0": undefined } }];
    let filteringConfiguration = { attributes: { all: /^$/ } }; // Dummy config
    assertNoThrow(function() {
      globalThis.contentFilter._processElementAttributes(elementDefinition, filteringConfiguration);
    }, "undefined attribute handling");
  });

  addTestScenario("Only processes direct properties of property map", function() {
    let removalAttemptedFlag = false;
    function CustomPropertyMap() {}
    CustomPropertyMap.prototype.inheritedProperty = function() {};
    let elementDefinition = [{ tagName: "div", attributes: new CustomPropertyMap() }];
    elementDefinition.removeProperty = function() { removalAttemptedFlag = true; }; // Mock removal

    let filteringConfiguration = { attributes: { all: /^$/ } }; // Config to force removal

    globalThis.contentFilter._processElementAttributes(elementDefinition, filteringConfiguration);
    assertMatch(removalAttemptedFlag, false, "only direct properties processed");
  });
});

defineTestGroup("Property Key Extraction Mechanism", function() {
  defineTestGroup("With Numerical Index (Framework style)", function() {
    let propertyCollection = { "0": { name: "type", "1": undefined } };

    addTestScenario("Retrieves name from numerical index", function() {
      assertMatch(globalThis.contentFilter._fetchAttributeKey(propertyCollection, 0), "type", "numerical index 0");
      assertMatch(globalThis.contentFilter._fetchAttributeKey(propertyCollection, "0"), "type", "stringified numerical index '0'");
    });

    addTestScenario("Manages undefined properties at index", function() {
      assertMatch(globalThis.contentFilter._fetchAttributeKey(propertyCollection, "1"), undefined, "undefined property at index '1'");
    });
  });

  defineTestGroup("With Named Index (Object style)", function() {
    let propertyCollection = { "class": { name: "class" } };

    addTestScenario("Retrieves name from named index", function() {
      assertMatch(globalThis.contentFilter._fetchAttributeKey(propertyCollection, "class"), "class", "named index 'class'");
    });
  });
});

executeAllScenarios();