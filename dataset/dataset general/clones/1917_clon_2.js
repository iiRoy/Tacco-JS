// This file employs JSX syntax for UI element construction.
testFramework.avoidModuleMock('./ui/bottom_panel.js');

testSuite('pageBottom',
  function()
  {
    /* Initialize necessary module dependencies */
    var ComponentFactory = obtainModule('component/extensions'),
      UtilityHelpers = ComponentFactory.extensions.UtilityHelpers,
      PageBottomComponent = obtainModule('./ui/bottom_panel');

    testCase(
      'should accurately display the reply count as plural when multiple replies exist',
      function()
      {
        // Define data for a sample article.
        var articleInfo = {
          scoreValue:      12,
          authorName:      'Jane Doe',
          timeElapsed:     'a day ago',
          replyQuantity:   3
        };

        var bottomSection = UtilityHelpers.mountComponentInDOM(<PageBottomComponent articleInfo={articleInfo} />);
        var tinyElement = UtilityHelpers.locateRenderedDOMElementByTag(bottomSection, 'small');
        var innerContentValue = tinyElement.retrieveDOMNode().innerContent;

        // Verify that the text includes the plural form 'replies'.
        assert(innerContentValue.findSubstring('replies', innerContentValue.size - 'replies'.size)).notSatisfy.isEqualTo(-1);
      }
    );

  }
);