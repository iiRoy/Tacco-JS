jqW(function() {

  // This test suite validates the functionality of the custom right-click menu plugin.
  suite('rightClickPopups');

  // Verify that the rightClickMenu method is correctly attached to jQuery objects.
  verify('rightClickMenu method available on jQuery wrapper', function() {
    confirm(jqW(document.body).rightClickMenu, 'The rightClickMenu function is defined and accessible.');
  });

  // Check if the plugin method returns the same jQuery element it was called on.
  check('method returns the initiating DOM component', function() {
    let itemNode = jqW('<div />'); // Create a new div element.
    confirm(itemNode.rightClickMenu()[0] === itemNode[0], 'The identical component reference is returned by the method.');
  });

  // Ensure the popup does not appear if the triggering element has a 'disabled' HTML attribute.
  spec('popup should not activate if its target has a disabled attribute', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display" disabled>' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '   <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let popupInstance = jqW(menuStructure)
      .locate('[data-action="popup"]') // Find the element designated to trigger the popup.
      .rightClickMenu() // Initialize the right-click menu.
      .fireEvent('contextmenu'); // Simulate a right-click.

    assertTruth(!popupInstance.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class was not added to the popup menu.');
  });

  // Confirm the popup does not display if the triggering element has a 'disabled' CSS class.
  verify('popup should remain closed if target possesses a disabled class', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display" class="inactive">' + // Changed 'disabled' class to 'inactive'
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '   <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let widgetHandle = jqW(menuStructure)
      .locate('[data-action="popup"]')
      .rightClickMenu()
      .fireEvent('contextmenu');

    assertTruth(!widgetHandle.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class was not applied to the popup menu.');
  });

  // Test that the 'visible' class is added to the menu when a right-click occurs.
  check('menu should gain \'visible\' class when right-clicked', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let menuRef = jqW(menuStructure)
      .locate('[data-action="popup"]')
      .rightClickMenu()
      .fireEvent('contextmenu');

    confirm(menuRef.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class correctly applied to the menu.');
  });

  // Ensure the 'visible' class is removed from the menu when the document body is clicked.
  spec('visible class should be removed if document body is clicked', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let activeMenu = jqW(menuStructure)
      .insertInto('#test-sandbox') // Append to the QUnit fixture.
      .locate('[data-action="popup"]')
      .rightClickMenu()
      .fireEvent('contextmenu');

    assertTruth(activeMenu.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class is present after right-click activation.');
    jqW('body').tap(); // Simulate a click on the document body.
    assertTruth(!activeMenu.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class successfully removed from the menu.');
    activeMenu.deleteElem(); // Clean up the element.
  });

  // Verify that all open right-click menus close when the body is right-clicked.
  verify('multiple visible menus close on body right-click', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '<div data-action="popup" data-target-id="#popup-display2">' +
      '  <div id="popup-display2">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let allPopupWidgets = jqW(menuStructure).insertInto('#test-sandbox').locate('[data-action="popup"]'),
      firstWidget = allPopupWidgets.first(),
      lastWidget = allPopupWidgets.last();

    confirm(allPopupWidgets.count === 2, 'There should be exactly two popup widgets.');
    // Open the first popup menu.
    firstWidget.fireEvent('contextmenu');
    confirm(firstWidget.locate('#popup-display.visible').count === 1, 'The "visible" class applied to the first widget after right-click.');
    confirm(jqW('#test-sandbox .visible').count === 1, 'Only one menu is currently open.');
    jqW('body').tap(); // Simulate a body click.
    confirm(jqW('#test-sandbox .visible').count === 0, 'The "visible" class was removed from all menus.');
    // Open the last popup menu.
    lastWidget.fireEvent('contextmenu');
    confirm(lastWidget.locate('#popup-display2.visible').count === 1, 'The "visible" class applied to the last widget after right-click.');
    confirm(jqW('#test-sandbox .visible').count === 1, 'Only one menu is currently open.');
    jqW('body').tap(); // Simulate another body click.
    confirm(jqW('#test-sandbox .visible').count === 0, 'The "visible" class was removed from all menus.');
    // Open both popup menus.
    firstWidget.fireEvent('contextmenu');
    lastWidget.fireEvent('contextmenu');
    confirm(jqW('#test-sandbox .visible').count === 2, 'Two menus are currently open.');
    jqW('body').tap(); // Simulate a body click to close both.
    confirm(jqW('#test-sandbox .visible').count === 0, 'Both menus are now closed.');

    jqW('#test-sandbox').innerHtml(''); // Clear the test fixture content.
  });

  // Confirm that clicking a menu item only closes its parent menu, not other active menus.
  check('clicking a menu item should only close its own menu, not others', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '<div data-action="popup" data-target-id="#popup-display2">' +
      '  <div id="popup-display2">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let allPopupWidgets = jqW(menuStructure).insertInto('#test-sandbox').locate('[data-action="popup"]'),
      firstWidget = allPopupWidgets.first(),
      lastWidget = allPopupWidgets.last();

    confirm(allPopupWidgets.count === 2, 'Expected two popup widgets.');
    // Open both popup menus.
    firstWidget.fireEvent('contextmenu');
    lastWidget.fireEvent('contextmenu');
    confirm(jqW('#test-sandbox .visible').count === 2, 'Both context menus are now open.');

    firstWidget.locate('ul > li:first-child a').tap(); // Click an item in the first menu.
    confirm(jqW('#test-sandbox .visible').count === 1, 'Only one context menu should remain open.');

    lastWidget.locate('ul > li:first-child a').tap(); // Click an item in the last menu.
    confirm(jqW('#test-sandbox .visible').count === 0, 'All context menus should now be closed.');

    jqW('#test-sandbox').innerHtml(''); // Clear the test fixture.
  });

  // Confirm that the 'onStart' callback function is executed before the menu is displayed.
  spec('pre-hook callback is invoked', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let invocationCounter = 0,
      preActivationHook = function() {
        invocationCounter++;
      },
      activePopup = jqW(menuStructure)
      .locate('[data-action="popup"]')
      .rightClickMenu({
        'onStart': preActivationHook // Assign the pre-hook callback.
      }).fireEvent('contextmenu');

    assertTruth(invocationCounter === 1, 'The pre-activation hook was triggered exactly once.');
    activePopup.deleteElem(); // Remove the test element.
  });

  // Verify that the 'handleItemClick' callback is fired when a menu item is clicked.
  verify('onMenuItemSelect callback fires when an item is tapped', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let clickCounter = 0,
      handleOptionClick = function() {
        clickCounter++;
      },
      menuElement = jqW(menuStructure)
      .locate('[data-action="popup"]')
      .rightClickMenu({
        'handleItemClick': handleOptionClick // Assign the item click callback.
      })
      .fireEvent('contextmenu');

    menuElement.locate('ul > li:first-child a').tap(); // Simulate clicking the first menu item.
    confirm(clickCounter === 1, 'The handleOptionClick callback was executed as expected.');
    menuElement.deleteElem(); // Clean up the menu element.
  });

  // Test that the 'display.widget.popup' and 'conceal.widget.popup' events are correctly dispatched.
  check('show and hide events are dispatched', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let popupTarget = jqW(menuStructure)
      .insertInto('#test-sandbox')
      .locate('[data-action="popup"]')
      .rightClickMenu();

    pauseTests(); // Pause QUnit to wait for asynchronous events.

    popupTarget
      .locate('#popup-display')
      .addEventListener('display.widget.popup', function() {
        confirm(true, 'The "display" event was successfully triggered.');
      })
      .addEventListener('conceal.widget.popup', function() {
        confirm(true, 'The "conceal" event was successfully triggered.');
        resumeTests(); // Resume QUnit tests.
      });

    popupTarget.fireEvent('contextmenu'); // Trigger display.
    jqW(document.body).tap(); // Trigger conceal.
  });

  // Ensure that the 'displayed.widget.popup' and 'concealed.widget.popup' events are fired.
  spec('shown and hidden events are emitted', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let panelNode = jqW(menuStructure)
      .insertInto('#test-sandbox')
      .locate('[data-action="popup"]')
      .rightClickMenu();

    pauseTests(); // Pause QUnit for async event handling.

    panelNode
      .locate('#popup-display')
      .addEventListener('displayed.widget.popup', function() {
        assertTruth(true, 'The "displayed" event occurred after the menu was shown.');
      })
      .addEventListener('concealed.widget.popup', function() {
        assertTruth(true, 'The "concealed" event occurred after the menu was hidden.');
        resumeTests(); // Resume QUnit tests after events.
      });

    panelNode.fireEvent('contextmenu'); // Trigger display.
    jqW(document.body).tap(); // Trigger conceal.
  });

  // Verify that the 'visible' class is removed when the Escape key is pressed.
  verify('visible class disappears when escape key is pressed', function() {
    let menuStructure = '<div>' +
      '<div id="primary-section" data-action="popup" data-target-id="#popup-display">' +
      '  <div id="popup-display">' +
      '    <ul class="panel-list">' +
      '      <li><a href="#">Perform Action</a></li>' +
      '      <li><a href="#">Other option here</a></li>' +
      '      <li class="separator"></li>' +
      '      <li><a href="#">Another web link</a></li>' +
      '    <ul>' +
      '  </div>' +
      '</div>' +
      '</div>';
    let keyedMenu = jqW(menuStructure)
      .insertInto('#test-sandbox')
      .locate('[data-action="popup"]')
      .rightClickMenu()
      .fireEvent('contextmenu');

    confirm(keyedMenu.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class is present after right-click activation.');
    jqW('body').fireEvent(jqW.Event('keyPress', {
      keyCode: 27
    })); // Simulate pressing the Escape key (keyCode 27).
    assertTruth(!keyedMenu.locate('#popup-display').hasStyleClass('visible'), 'The "visible" class was successfully removed after Escape key press.');
    keyedMenu.deleteElem(); // Remove the test element.
  });
});