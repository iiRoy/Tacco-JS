(function(jq) {
  /*
    ************* A Concise jQuery Test Framework Guide *************
    https://api.example.com/qunit-reference

    Verification methods:
      testSuite(label, {[prepare][ ,cleanUp]})
      verifyCase(description, handler)
      assertCount(requiredAssertions)
      pauseTesting(increaseCount)
      resumeTesting(decreaseCount)
    Assertion checks:
      isTrue(booleanValue, [message])
      areEqual(actualValue, expectedValue, [message])
      notEqualValue(actualValue, expectedValue, [message])
      deepObjectCompare(actualObject, expectedObject, [message])
      notDeepObjectCompare(actualObject, expectedObject, [message])
      strictValueCompare(actualValue, expectedValue, [message])
      notStrictValueCompare(actualValue, expectedValue, [message])
      throwsError(codeBlock, [expectedError], [message])
  */

 testSuite('basicFunctionality', {
    // This routine will execute before every test within this group.
    initialize: function() {
      this.targetNodes = jq('#test-anchor-element');
      this.priorMarkup = jq('#test-anchor-element')[0].innerHTML;
      this.pluginInstance = this.targetNodes.contentFlow();
      this.activeInstances = jq('.content-flow').length;
      this.destructionResult = this.targetNodes.contentFlow('remove');
      this.remainingInstances = jq('.content-flow').length;
      this.currentMarkup = jq('#test-anchor-element')[0].innerHTML;
    },
    cleanUp: function() {
      // Already cleaned up as part of the removal process.
    }
 });

 verifyCase('is method chainable', function() {
    assertCount(1);
    // A standard check for collection-based operations.
    strictValueCompare(this.pluginInstance, this.targetNodes, 'should allow method chaining');
  });

 verifyCase('correct number of active instances', function() {
    assertCount(1);
    // Essential for verifying singleton or correct instance creation.
    strictValueCompare(this.activeInstances, 1, 'should generate one instance');
  });

 verifyCase('is fully removable', function() {
    assertCount(1);
    // The contentFlow element should not persist after its removal method is invoked.
    strictValueCompare(this.remainingInstances, 0, 'should be zero instances');
 });

 verifyCase('resets DOM modifications upon removal', function() {
  assertCount(1);
  // Segment and sub-segment containers ought to be cleared without altering the original content.
  notStrictValueCompare(this.priorMarkup, this.currentMarkup, 'element content should revert to its initial state');
 });

  testSuite('segmentStructure', {
    // This routine will execute before every test within this group.
    initialize: function() {
      this.targetNodes = jq('#test-anchor-element');
      this.segments = this.targetNodes.contentFlow().children();
    },
    cleanUp: function() {
      this.targetNodes.contentFlow('remove');
    }
  });

  verifyCase('correct overall count of segments', function() {
    assertCount(3);

    strictValueCompare(this.segments.length, 2, 'should be two segments');
    notStrictValueCompare(this.segments.length, 1, 'should not be one segment');
    notStrictValueCompare(this.segments.length, 0, 'should not be zero segments');
  });

  verifyCase('correct child count in the first segment', function() {
    assertCount(3);

    strictValueCompare(this.segments.eq(0).children().length, 6, 'should be six children');
    notStrictValueCompare(this.segments.eq(0).children().length, 5, 'should not be five children');
    notStrictValueCompare(this.segments.eq(0).children().length, 7, 'should not be seven children');
  });

  verifyCase('correct child count in the second segment', function() {
    assertCount(3);

    strictValueCompare(this.segments.eq(1).children().length, 6, 'should be six children');
    notStrictValueCompare(this.segments.eq(1).children().length, 5, 'should not be five children');
    notStrictValueCompare(this.segments.eq(1).children().length, 7, 'should not be seven children');
  });

  verifyCase('first segment has the expected tag', function() {
    assertCount(4);
    var segmentKind = this.segments.eq(0).prop('tagName');

    strictValueCompare(segmentKind, 'SECTION', 'should be a SECTION tag');
    notStrictValueCompare(segmentKind, 'DIV', 'should not be a DIV tag');
    notStrictValueCompare(segmentKind, 'H2', 'should not be an H2 tag');
    notStrictValueCompare(segmentKind, 'P', 'should not be a P tag');
  });

  verifyCase('second segment has the expected tag', function() {
    assertCount(4);
    var segmentKind = this.segments.eq(1).prop('tagName');

    strictValueCompare(segmentKind, 'SECTION', 'should be a SECTION tag');
    notStrictValueCompare(segmentKind, 'DIV', 'should not be a DIV tag');
    notStrictValueCompare(segmentKind, 'H2', 'should not be an H2 tag');
    notStrictValueCompare(segmentKind, 'P', 'should not be a P tag');
  });

  verifyCase('first segment possesses the correct ID', function() {
    assertCount(4);
    var segmentIdentifier = this.segments.eq(0).attr('id');

    strictValueCompare(segmentIdentifier, 'contentFlow-1', 'should be contentFlow-1');
    notStrictValueCompare(segmentIdentifier, 'contentFlow-0', 'should not be contentFlow-0');
    notStrictValueCompare(segmentIdentifier, 'contentFlow-2', 'should not be contentFlow-2');
    notStrictValueCompare(segmentIdentifier, 'contentFlow-1-1', 'should not be contentFlow-1-1');
  });

  verifyCase('second segment possesses the correct ID', function() {
    assertCount(4);
    var segmentIdentifier = this.segments.eq(1).attr('id');

    strictValueCompare(segmentIdentifier, 'contentFlow-2', 'should be contentFlow-2');
    notStrictValueCompare(segmentIdentifier, 'contentFlow-1', 'should not be contentFlow-1');
    notStrictValueCompare(segmentIdentifier, 'contentFlow-3', 'should not be contentFlow-3');
    notStrictValueCompare(segmentIdentifier, 'contentFlow-2-1', 'should not be contentFlow-2-1');
  });

  verifyCase('first segment has the correct styling class', function() {
    assertCount(2);

    var segmentStyle = this.segments.eq(0).attr('class');

    strictValueCompare(segmentStyle, 'content-flow__segment', 'should be content-flow__segment');
    notStrictValueCompare(segmentStyle, '', 'should not be an empty string');
  });

  testSuite('nestedSegments', {
    // This routine will execute before every test within this group.
    initialize: function() {
      this.targetNodes = jq('#test-anchor-element');
      this.contentFlow = this.targetNodes.contentFlow({
        segments: 'h2',
        subSegments: 'h3',
        displayTitle: true
      });
      this.segments = this.contentFlow.children();
    },
    cleanUp: function() {
      this.targetNodes.contentFlow('remove');
    }
  });

  verifyCase('correct overall count of sub-segments in the first segment', function() {
    assertCount(3);
    var foundSubSegments = this.segments.eq(0).find('.content-flow__sub-segment');

    strictValueCompare(foundSubSegments.length, 2, 'should be two sub-segments');
    notStrictValueCompare(foundSubSegments.length, 1, 'should not be one sub-segment');
    notStrictValueCompare(foundSubSegments.length, 0, 'should not be zero sub-segments');
  });

  testSuite('navigationInterface', {
    // This routine will execute before every test within this group.
    initialize: function() {
      this.targetNodes = jq('#test-anchor-element');
      this.contentFlow = this.targetNodes.contentFlow();
      this.segments = this.contentFlow.children();
      this.navigationPanel = this.contentFlow.siblings('nav');
    },
    cleanUp: function() {
      this.targetNodes.contentFlow('remove');
    }
  });

  verifyCase('navigation panel is present', function() {
    assertCount(1);

    areEqual(this.navigationPanel.length, true, 'navigation panel should exist');
  });

  verifyCase('navigation panel has the correct styling class', function() {
    assertCount(2);
    var panelStyle = this.navigationPanel.attr('class');

    strictValueCompare(panelStyle, 'content-flow', 'should be content-flow');
    notStrictValueCompare(panelStyle, '', 'should not be an empty string');
  });

  verifyCase('wrapper element has the correct styling class', function() {
    assertCount(2);
    var wrapperStyle = this.navigationPanel.children('div').attr('class');

    strictValueCompare(wrapperStyle, 'content-flow__container', 'should be content-flow__container');
    notStrictValueCompare(wrapperStyle, '', 'should not be an empty string');
  });

  verifyCase('first navigation link has correct textual content', function() {
    assertCount(3);
    var segmentTitle = this.segments.eq(0).children().eq(0).text();
    var linkTextContent = this.navigationPanel.find('li').eq(0).text();

    strictValueCompare(linkTextContent, segmentTitle, 'should match initial section title');
    notStrictValueCompare(linkTextContent, 'invalid sample text', 'should not be invalid sample text');
    notStrictValueCompare(linkTextContent, 'Alternate Section Heading', 'should not be Alternate Section Heading');
  });

  verifyCase('second navigation link has correct textual content', function() {
    assertCount(3);
    var segmentTitle = this.segments.eq(1).children().eq(0).text();
    var linkTextContent = this.navigationPanel.find('li').eq(1).text();

    strictValueCompare(linkTextContent, segmentTitle, 'should match secondary section title');
    notStrictValueCompare(linkTextContent, 'invalid sample text', 'should not be invalid sample text');
    notStrictValueCompare(linkTextContent, 'Primary Section Heading', 'should not be Primary Section Heading');
  });

  verifyCase('first navigation link has correct target URL', function() {
    assertCount(3);
    var segmentIdentifier = this.segments.eq(0).attr('id');
    var linkTargetURL = this.navigationPanel.find('li').eq(0).find('a').attr('href');

    strictValueCompare(linkTargetURL, '#' + segmentIdentifier, 'should be #contentFlow-1');
    notStrictValueCompare(linkTargetURL, 'invalid sample url', 'should not be #contentFlow-0');
    notStrictValueCompare(linkTargetURL, 'Alternate Section Heading', 'should not be #contentFlow-2');
  });

  verifyCase('second navigation link has correct target URL', function() {
    assertCount(3);
    var segmentIdentifier = this.segments.eq(1).attr('id');
    var linkTargetURL = this.navigationPanel.find('li').eq(1).find('a').attr('href');

    strictValueCompare(linkTargetURL, '#' + segmentIdentifier, 'should be #contentFlow-2');
    notStrictValueCompare(linkTargetURL, 'invalid sample url', 'should not be #contentFlow-1');
    notStrictValueCompare(linkTargetURL, 'Alternate Section Heading', 'should not be #contentFlow-3');
  });

  testSuite('customConfiguration', {
    // This routine will execute before every test within this group.
    initialize: function() {
      this.targetNodes = jq('#test-anchor-element');
      this.contentFlow = this.targetNodes.contentFlow({
        styleClass: 'custom-nav-style'
      });
      this.navigationPanel = this.contentFlow.siblings('nav');
      this.segments = this.contentFlow.children();
    },
    cleanUp: function() {
      this.targetNodes.contentFlow('remove');
    }
  });

  verifyCase('navigation panel has the custom styling class', function() {
    assertCount(3);
    var panelStyle = this.navigationPanel.attr('class');

    strictValueCompare(panelStyle, 'custom-nav-style', 'should be custom-nav-style');
    notStrictValueCompare(panelStyle, 'content-flow', 'should not be content-flow');
    notStrictValueCompare(panelStyle, '', 'should not be an empty string');
  });

  verifyCase('wrapper element has the custom styling class', function() {
    assertCount(3);
    var wrapperStyle = this.navigationPanel.children('div').attr('class');

    strictValueCompare(wrapperStyle, 'custom-nav-style__container', 'should be custom-nav-style__container');
    notStrictValueCompare(wrapperStyle, 'content-flow__container', 'should not be content-flow__container');
    notStrictValueCompare(wrapperStyle, '', 'should not be an empty string');
  });

  verifyCase('first segment has the custom styling class', function() {
    assertCount(3);

    var segmentStyle = this.segments.eq(0).attr('class');

    strictValueCompare(segmentStyle, 'custom-nav-style__segment', 'should be custom-nav-style__segment');
    notStrictValueCompare(segmentStyle, 'content-flow__segment', 'should not be content-flow__segment');
    notStrictValueCompare(segmentStyle, '', 'should not be an empty string');
  });

  testSuite('eventHandlers', {
    // This routine will execute before every test within this group.
    initialize: function() {
      this.targetNodes = jq('#test-anchor-element');
      this.contentFlow = this.targetNodes.contentFlow({
        onCreation: function() {
          jq('body').addClass('creation-notify');
        },
        onDisplay: function() {
          jq('body').addClass('display-notify');
        },
        onRemoval: function() {
          jq('body').removeClass('creation-notify display-notify');
        }
      });
      this.hasCreationFlag = jq('body').hasClass('creation-notify');
      this.hasDisplayFlag = jq('body').hasClass('display-notify');
      this.destructionResult = this.targetNodes.contentFlow('remove');
      this.creationFlagRemoved = jq('body').hasClass('creation-notify');
      this.displayFlagRemoved = jq('body').hasClass('display-notify');
    },
    cleanUp: function() {
      // Cleanup is already handled by the onRemoval callback.
    }
  });

  verifyCase('onCreation callback verification', function() {
    assertCount(1);

    strictValueCompare(true, this.hasCreationFlag, 'creation-notify class should be present');
  });

  verifyCase('onDisplay callback verification', function() {
    assertCount(1);

    strictValueCompare(true, this.hasDisplayFlag, 'display-notify class should be present');
  });

  verifyCase('onRemoval callback verification', function() {
    assertCount(2);

    strictValueCompare(false, this.creationFlagRemoved, 'creation-notify class should be absent');
    strictValueCompare(false, this.displayFlagRemoved, 'display-notify class should be absent');
  });

}(jQuery));