jQuery(document).ready(function() {
    // This entire file constitutes a series of behavioral specifications for a custom right-click menu utility.
    // It leverages QUnit for assertions and jQuery for DOM manipulation and event handling.

    /**
     * Helper function to construct the standard HTML structure for a test menu.
     * @param {string} mainId - ID for the main container.
     * @param {string} menuId - ID for the actual popup menu panel.
     * @param {string} dataAttributes - Additional data attributes for the toggle element.
     * @param {string} extraClasses - Additional classes for the toggle element.
     * @returns {string} The HTML string.
     */
    const buildMenuMarkup = (mainId, menuId, dataAttributes = '', extraClasses = '') => {
        const itemOptions = [
            `<li><a href="#">Perform Action</a></li>`,
            `<li><a href="#">Alternative Option Here</a></li>`,
            `<li class="menu-separator"></li>`,
            `<li><a href="#">Another Navigation Link</a></li>`
        ].join('\n');

        return `
            <section class="test-section">
                <div id="${mainId}" data-trigger="right-click-menu" data-target="#${menuId}" ${dataAttributes} class="${extraClasses.trim()}">
                    <div id="${menuId}" class="menu-panel-container">
                        <ul class="flyout-options-list">
                            ${itemOptions}
                        </ul>
                    </div>
                </div>
            </section>
        `;
    };

    // Define a group of related tests for the right-click menu feature.
    specGroup('Right-Click Menu Functionality');

    verifyBehavior('Ensure the rightClickMenu method is available on jQuery objects', function() {
        // Assert that the custom 'initPopupMenu' method is defined on a jQuery selection.
        assertResult(jQuery('html body').initPopupMenu, 'The initPopupMenu extension method must be present.');
    });

    verifyBehavior('Verify the method returns the original element collection', function() {
        const testTarget = jQuery('<div />');
        const operationResult = testTarget.initPopupMenu();
        // Confirm that the returned jQuery object references the same DOM element.
        assertResult(operationResult.get(0) === testTarget.get(0), 'The same DOM element reference should be returned by the method.');
        console.log('Test: returns element - result:', operationResult.get(0));
    });

    verifyBehavior('Should prevent menu display if trigger element is marked as inactive via attribute', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel', 'data-state="inactive"');
        const menuActivator = jQuery(menuStructure)
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu();
        
        console.log('Attempting to trigger menu on an inactive element (attribute)...');
        menuActivator.trigger('contextmenu'); // Simulate a right-click event.
        
        const menuPanel = menuActivator.find('#popup-menu-panel');
        // The menu panel should NOT have the 'active-display' class.
        assertResult(!menuPanel.hasClass('active-display'), 'Menu should not become visible when its trigger has the "data-state=inactive" attribute.');
        assertResult(menuPanel.is(':hidden'), 'The menu panel should remain hidden.');
    });

    verifyBehavior('Should prevent menu display if trigger element has an inactive state class', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel', '', 'state-inactive');
        const menuActivator = jQuery(menuStructure)
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu();

        console.log('Attempting to trigger menu on an inactive element (class)...');
        menuActivator.trigger('contextmenu');
        
        const menuPanel = menuActivator.find('#popup-menu-panel');
        // The menu panel should NOT have the 'active-display' class.
        assertResult(!menuPanel.hasClass('active-display'), 'Menu should not become visible when its trigger has the "state-inactive" class.');
        assertResult(menuPanel.css('display') === 'none', 'The menu panel should maintain its hidden state.');
    });

    verifyBehavior('Should apply active-display class to menu when trigger element is right-clicked', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const menuActivator = jQuery(menuStructure)
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu();
        
        console.log('Triggering right-click on active element...');
        menuActivator.trigger('contextmenu');
        
        const menuPanel = menuActivator.find('#popup-menu-panel');
        // The menu panel SHOULD have the 'active-display' class.
        assertResult(menuPanel.hasClass('active-display'), 'The menu panel should receive the "active-display" class upon right-click.');
        assertResult(menuPanel.is(':visible'), 'The menu panel should be visible.');
    });

    verifyBehavior('Should remove active-display class when any part of the document body is clicked', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const menuActivator = jQuery(menuStructure)
                                .appendTo('#fixtureContainer')
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu();

        console.log('Opening menu and then clicking body to close...');
        menuActivator.trigger('contextmenu');
        const menuPanel = menuActivator.find('#popup-menu-panel');
        
        assertResult(menuPanel.hasClass('active-display'), 'Pre-condition: "active-display" class present after right-click.');
        
        const mainBody = jQuery('body');
        mainBody.trigger('click'); // Simulate a left-click on the body.
        
        assertResult(!menuPanel.hasClass('active-display'), '"active-display" class should be removed after body click.');
        assertResult(menuPanel.is(':hidden'), 'The menu panel should become hidden after body click.');
        // Cleanup is handled by QUnit fixture.
    });

    verifyBehavior('Should close all menus when document body is clicked, even with multiple menus open', function() {
        const menuOneMarkup = buildMenuMarkup('hostDivOne', 'popup-menu-one');
        const menuTwoMarkup = buildMenuMarkup('hostDivTwo', 'popup-menu-two');
        
        const combinedMarkup = `<div>${menuOneMarkup}${menuTwoMarkup}</div>`;

        const allActivators = jQuery(combinedMarkup)
                                .appendTo('#fixtureContainer')
                                .find('[data-trigger="right-click-menu"]');
        
        const firstActivator = allActivators.eq(0);
        const secondActivator = allActivators.eq(1);

        assertResult(allActivators.length === 2, 'Expected two menu activators to be present.');

        // Test 1: Open first menu, close via body click
        firstActivator.initPopupMenu().trigger('contextmenu');
        assertResult(firstActivator.find('#popup-menu-one').hasClass('active-display'), 'Menu One should be open.');
        assertResult(jQuery('#fixtureContainer .active-display').length === 1, 'Only one menu should be open at this point.');
        jQuery('body').trigger('click');
        assertResult(jQuery('#fixtureContainer .active-display').length === 0, 'All menus should be closed after body click.');

        // Test 2: Open second menu, close via body click
        secondActivator.initPopupMenu().trigger('contextmenu');
        assertResult(secondActivator.find('#popup-menu-two').hasClass('active-display'), 'Menu Two should be open.');
        assertResult(jQuery('#fixtureContainer .active-display').length === 1, 'Only one menu should be open at this point.');
        jQuery('body').trigger('click');
        assertResult(jQuery('#fixtureContainer .active-display').length === 0, 'All menus should be closed after body click.');

        // Test 3: Open both menus, close via body click
        firstActivator.trigger('contextmenu');
        secondActivator.trigger('contextmenu');
        assertResult(jQuery('#fixtureContainer .active-display').length === 2, 'Both menus should be open.');
        jQuery('body').trigger('click');
        assertResult(jQuery('#fixtureContainer .active-display').length === 0, 'Both menus should be closed after body click.');
        console.log('Multiple menus closed by body click test completed.');
    });

    verifyBehavior('Clicking a menu item should only close its own menu, not others', function() {
        const menuOneMarkup = buildMenuMarkup('hostDivAlpha', 'menu-alpha');
        const menuTwoMarkup = buildMenuMarkup('hostDivBeta', 'menu-beta');
        
        const combinedMarkup = `<div>${menuOneMarkup}${menuTwoMarkup}</div>`;

        const allActivators = jQuery(combinedMarkup)
                                .appendTo('#fixtureContainer')
                                .find('[data-trigger="right-click-menu"]');
        
        const initialMenuActivator = allActivators.eq(0);
        const secondaryMenuActivator = allActivators.eq(1);

        assertResult(allActivators.length === 2, 'Expected two distinct menu activators.');

        // Open both right-click menus.
        initialMenuActivator.initPopupMenu().trigger('contextmenu');
        secondaryMenuActivator.initPopupMenu().trigger('contextmenu');
        assertResult(jQuery('#fixtureContainer .active-display').length === 2, 'Pre-condition: Both menus are open.');
        
        // Click an item in the first menu.
        initialMenuActivator.find('.flyout-options-list > li:first-child > a').trigger('click');
        // Only the first menu should close, leaving one still open.
        assertResult(jQuery('#fixtureContainer .active-display').length === 1, 'Only one menu should remain open after clicking an item in the first menu.');

        // Click an item in the second menu.
        secondaryMenuActivator.find('.flyout-options-list > li:first-child > a').trigger('click');
        // Now both menus should be closed.
        assertResult(jQuery('#fixtureContainer .active-display').length === 0, 'All menus should be closed after clicking an item in the second menu.');
        console.log('Menu item click behavior test completed.');
    });

    verifyBehavior('The preDisplayHook callback should be invoked before menu display', function() {
        let invocationCount = 0;
        const preDisplayHook = function() {
            invocationCount++;
            console.log('preDisplayHook invoked! Count:', invocationCount);
        };

        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const rightClickPanel = jQuery(menuStructure)
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu({
                                    'preDisplay': preDisplayHook // Using a renamed option for the callback.
                                });

        rightClickPanel.trigger('contextmenu'); // Simulate right-click to open.

        assertResult(invocationCount === 1, 'The preDisplayHook callback should have been called exactly once.');
        rightClickPanel.remove(); // Clean up the element for this specific test.
    });

    verifyBehavior('The onMenuItemSelect callback should be invoked when a menu item is clicked', function() {
        let invocationCount = 0;
        const onMenuItemSelect = function() {
            invocationCount++;
            console.log('onMenuItemSelect invoked! Count:', invocationCount);
        };

        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const rightClickPanel = jQuery(menuStructure)
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu({
                                    'onItemClick': onMenuItemSelect // Using a renamed option for the callback.
                                });
        
        rightClickPanel.trigger('contextmenu'); // Open the menu first.
        rightClickPanel.find('.flyout-options-list > li:first-child > a').trigger('click'); // Click an item.

        assertResult(invocationCount === 1, 'The onMenuItemSelect callback should have been called exactly once.');
        rightClickPanel.remove(); // Clean up the element.
    });

    verifyBehavior('Menu should dispatch custom showing and hiding events', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const menuElement = jQuery(menuStructure)
                            .appendTo('#fixtureContainer')
                            .find('[data-trigger="right-click-menu"]')
                            .initPopupMenu();
        
        // Pause QUnit to handle asynchronous event assertions.
        pauseAsync();

        let showingEventFired = false;
        let hidingEventFired = false;

        const actualMenuPanel = menuElement.find('#popup-menu-panel');

        actualMenuPanel
            .on('menu:showing.custom', function() {
                showingEventFired = true;
                assertResult(true, 'The "menu:showing.custom" event was successfully dispatched.');
                console.log('Event: menu:showing.custom fired.');
            })
            .on('menu:hiding.custom', function() {
                hidingEventFired = true;
                assertResult(true, 'The "menu:hiding.custom" event was successfully dispatched.');
                console.log('Event: menu:hiding.custom fired.');
                resumeAsync(); // Resume QUnit after both events have potentially fired.
            });

        // Trigger menu open
        menuElement.trigger('contextmenu');
        // Trigger menu close
        jQuery(document.documentElement).trigger('click'); // Use document.documentElement for broader click event.
        
        // Assert that both events were eventually fired.
        // The actual `ok` calls are within the event handlers, but this ensures the test completes.
        assertResult(showingEventFired, 'Verify showing event flag is set.');
        assertResult(hidingEventFired, 'Verify hiding event flag is set.');
    });

    verifyBehavior('Menu should dispatch custom shown and hidden events', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const menuElement = jQuery(menuStructure)
                            .appendTo('#fixtureContainer')
                            .find('[data-trigger="right-click-menu"]')
                            .initPopupMenu();
        
        // Pause QUnit for async.
        pauseAsync();

        let shownEventFired = false;
        let hiddenEventFired = false;

        const actualMenuPanel = menuElement.find('#popup-menu-panel');

        actualMenuPanel
            .on('menu:shown.custom', function() {
                shownEventFired = true;
                assertResult(true, 'The "menu:shown.custom" event was successfully dispatched.');
                console.log('Event: menu:shown.custom fired.');
            })
            .on('menu:hidden.custom', function() {
                hiddenEventFired = true;
                assertResult(true, 'The "menu:hidden.custom" event was successfully dispatched.');
                console.log('Event: menu:hidden.custom fired.');
                resumeAsync(); // Resume QUnit.
            });

        menuElement.trigger('contextmenu');
        jQuery('body').trigger('click');
        
        assertResult(shownEventFired, 'Verify shown event flag is set.');
        assertResult(hiddenEventFired, 'Verify hidden event flag is set.');
    });

    verifyBehavior('Menu should close if the Escape key is pressed', function() {
        const menuStructure = buildMenuMarkup('primaryContainer', 'popup-menu-panel');
        const menuActivator = jQuery(menuStructure)
                                .appendTo('#fixtureContainer')
                                .find('[data-trigger="right-click-menu"]')
                                .initPopupMenu();

        console.log('Opening menu and then simulating Escape key press...');
        menuActivator.trigger('contextmenu');
        const menuPanel = menuActivator.find('#popup-menu-panel');

        assertResult(menuPanel.hasClass('active-display'), 'Pre-condition: Menu is open after right-click.');
        
        // Simulate an Escape key press event on the document body.
        jQuery('body').trigger(jQuery.Event('keydown', { keyCode: 27, key: 'Escape' }));
        
        assertResult(!menuPanel.hasClass('active-display'), 'Menu should close (remove "active-display" class) after Escape key press.');
        assertResult(menuPanel.is(':hidden'), 'The menu panel should become hidden after Escape key press.');
        // Cleanup is handled by QUnit fixture.
    });
});