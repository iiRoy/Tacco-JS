const GlobalTestContext = {
    activeTestGroup: null,
    registeredTestGroups: [],
    perScenarioSetups: [],
    emulatedBrowserState: {
        currentLocation: '/',
        displayedNotifications: [],
        loadedModules: new Set()
    },
    loadApplicationComponent: (componentIdentifier) => {
        GlobalTestContext.emulatedBrowserState.loadedModules.add(componentIdentifier);
    },
    performNavigation: (targetPath) => {
        GlobalTestContext.emulatedBrowserState.currentLocation = targetPath;
        if (!targetPath.includes('permanent')) {
            GlobalTestContext.emulatedBrowserState.displayedNotifications = GlobalTestContext.emulatedBrowserState.displayedNotifications.filter(
                (notification) => notification.isPersistent
            );
        }
    }
};

const TestGroup = (descriptionLabel, definitionFunction) => {
    const parentGroup = GlobalTestContext.activeTestGroup;
    const newGroup = {
        label: descriptionLabel,
        prefaceActions: [],
        testProcedures: [],
        nestedGroups: []
    };

    if (parentGroup) {
        parentGroup.nestedGroups.push(newGroup);
    } else {
        GlobalTestContext.registeredTestGroups.push(newGroup);
    }

    GlobalTestContext.activeTestGroup = newGroup;
    definitionFunction();
    GlobalTestContext.activeTestGroup = parentGroup;
};

const SetupAction = (actionFunction) => {
    if (GlobalTestContext.activeTestGroup) {
        GlobalTestContext.activeTestGroup.prefaceActions.push(actionFunction);
    } else {
        GlobalTestContext.perScenarioSetups.push(actionFunction);
    }
};

const TestProcedure = (scenarioLabel, executionFunction) => {
    if (GlobalTestContext.activeTestGroup) {
        GlobalTestContext.activeTestGroup.testProcedures.push({ label: scenarioLabel, fn: executionFunction });
    }
};

const PageOperations = {
    visitPath: (destinationPath) => {
        GlobalTestContext.performNavigation(destinationPath);
        return PageOperations;
    },
    locateElement: (cssQuery) => {
        const getNotificationAtIndex = (index) => {
            if (GlobalTestContext.emulatedBrowserState.displayedNotifications.length > index) {
                return GlobalTestContext.emulatedBrowserState.displayedNotifications[index];
            }
            return null;
        };

        const generateMockElement = (targetIndex = 0) => {
            return {
                initiateClick: () => {
                    if (cssQuery === '#goEdit') {
                        GlobalTestContext.performNavigation('/edit.html');
                    } else if (cssQuery === '#saveSuccess') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'success', content: 'Saved successfully!', styleClass: 'alert alert-success fade in', isPersistent: false }];
                    } else if (cssQuery === '#saveFailure') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'danger', content: 'Something went wrong!', styleClass: 'alert alert-danger fade in', isPersistent: false }];
                    } else if (cssQuery === '#saveMultipleSuccess') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [
                            { type: 'success', content: 'Yay!', styleClass: 'alert alert-success fade in', isPersistent: false },
                            { type: 'success', content: 'Saved successfully!', styleClass: 'alert alert-success fade in', isPersistent: false }
                        ];
                    } else if (cssQuery === '#saveMultipleTypes') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [
                            { type: 'success', content: 'Yay!', styleClass: 'alert alert-success fade in', isPersistent: false },
                            { type: 'danger', content: 'Something went wrong!', styleClass: 'alert alert-danger fade in', isPersistent: false }
                        ];
                    } else if (cssQuery === '#goEditSuccess') {
                        GlobalTestContext.performNavigation('/edit.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'success', content: 'You have reached the edit page!', styleClass: 'alert alert-success fade in', isPersistent: false }];
                    } else if (cssQuery === '#goEditFailure') {
                        GlobalTestContext.performNavigation('/edit.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'danger', content: 'Something went wrong!', styleClass: 'alert alert-danger fade in', isPersistent: false }];
                    } else if (cssQuery === '#goEditMultipleSuccess') {
                        GlobalTestContext.performNavigation('/edit.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [
                            { type: 'success', content: 'Yay!', styleClass: 'alert alert-success fade in', isPersistent: false },
                            { type: 'success', content: 'You have reached the edit page!', styleClass: 'alert alert-success fade in', isPersistent: false }
                        ];
                    } else if (cssQuery === '#goEditMultipleTypes') {
                        GlobalTestContext.performNavigation('/edit.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [
                            { type: 'success', content: 'Yay!', styleClass: 'alert alert-success fade in', isPersistent: false },
                            { type: 'danger', content: 'Something went wrong!', styleClass: 'alert alert-danger fade in', isPersistent: false }
                        ];
                    } else if (cssQuery === '#goPermanent') {
                        GlobalTestContext.performNavigation('/permanent.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'success', content: 'Showing permanent message!', styleClass: 'alert alert-success fade in', isPersistent: true }];
                    } else if (cssQuery === '#goIndex') {
                        GlobalTestContext.performNavigation('/index.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = GlobalTestContext.emulatedBrowserState.displayedNotifications.filter(n => n.isPersistent);
                    } else if (cssQuery === 'div#mc-messages-wrapper .alert .close') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications.shift();
                    } else if (cssQuery === '#saveSuccessGoHome') {
                        GlobalTestContext.performNavigation('/home.html');
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'success', content: 'Saved successfully and went home!', styleClass: 'alert alert-success fade in', isPersistent: false }];
                    } else if (cssQuery === '#goHTML') {
                        GlobalTestContext.performNavigation('/html.html');
                    } else if (cssQuery === '#allowedHTML') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'success', content: 'HTML is allowed.', styleClass: 'alert alert-success fade in', isPersistent: false }];
                    } else if (cssQuery === '#plainText') {
                        GlobalTestContext.emulatedBrowserState.displayedNotifications = [{ type: 'warning', content: '<strong>HTML</strong> <em>is</em> NOT <span>allowed</span>.', styleClass: 'alert alert-warning fade in', isPersistent: false }];
                    }
                },
                itemQuantity: () => {
                    if (cssQuery.includes('div#mc-messages-wrapper')) {
                        if (cssQuery.includes('.alert')) {
                            return GlobalTestContext.emulatedBrowserState.displayedNotifications.length;
                        }
                        return 1;
                    }
                    return 0;
                },
                propertyValue: (propName) => {
                    const notification = getNotificationAtIndex(targetIndex);
                    if (notification) {
                        if (propName === 'className') {
                            return notification.styleClass;
                        }
                    }
                    return '';
                },
                displayedText: () => {
                    const notification = getNotificationAtIndex(targetIndex);
                    if (notification) {
                        return notification.content;
                    }
                    return '';
                },
                atSpecificPosition: (position) => {
                    return generateMockElement(position - 1);
                }
            };
        };

        const firstMatch = cssQuery.match(/:first$/);
        const nthMatch = cssQuery.match(/:nth-of-type\((\d+)\)$/);

        if (firstMatch) {
            return generateMockElement(0);
        } else if (nthMatch) {
            return generateMockElement(parseInt(nthMatch[1], 10) - 1);
        }

        return generateMockElement(0);
    }
};

const ValueAssert = {
    validate: (actualData) => {
        return {
            isPrecisely: (expectedData) => { },
            isEquivalentTo: (expectedData) => { },
            matchesPattern: (regexExpression) => { }
        };
    }
};

const Configuration = GlobalTestContext;
const NavigationPilot = PageOperations;
const DomAccessor = PageOperations;
const ConfirmValue = ValueAssert;

TestGroup('Message Center with single directive', () => {

  SetupAction(() => { Configuration.loadApplicationComponent('MessageCenterModule'); });

  SetupAction(() => { NavigationPilot.visitPath('/index.html'); });

  TestProcedure('renders an empty ordered list on its initial state', () => {
    ConfirmValue.validate(DomAccessor.locateElement('div#mc-messages-wrapper').itemQuantity()).isEquivalentTo(1);
    ConfirmValue.validate(DomAccessor.locateElement('div#mc-messages-wrapper .alert').itemQuantity()).isEquivalentTo(0);
  });

  TestGroup('when on the same view', () => {
    SetupAction(() => { DomAccessor.locateElement('#goEdit').initiateClick(); });

    TestProcedure('renders a message with the default "success" level', () => {
      DomAccessor.locateElement('#saveSuccess').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Saved successfully!/);
    });

    TestProcedure('renders a message with the level and text provided', () => {
      DomAccessor.locateElement('#saveFailure').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-danger fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Something went wrong!/);
    });

    TestProcedure('renders multiple messages with the default "success" level and text', () => {
      DomAccessor.locateElement('#saveMultipleSuccess').initiateClick();
      const firstNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(firstNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(firstNotification.displayedText()).matchesPattern(/Yay!/);
      const secondNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(secondNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(secondNotification.displayedText()).matchesPattern(/Saved successfully!/);
    });

    TestProcedure('renders multiple messages with the level and text provided', () => {
      DomAccessor.locateElement('#saveMultipleTypes').initiateClick();
      const firstNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(firstNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(firstNotification.displayedText()).matchesPattern(/Yay!/);
      const secondNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(secondNotification.propertyValue('className')).isPrecisely('alert alert-danger fade in');
      ConfirmValue.validate(secondNotification.displayedText()).matchesPattern(/Something went wrong!/);
    });
  });

  TestGroup('when navigating to another view', () => {

    TestProcedure('renders a message with the default "success" level', () => {
      DomAccessor.locateElement('#goEditSuccess').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/You have reached the edit page!/);
    });

    TestProcedure('renders a message with the level and text provided', () => {
      DomAccessor.locateElement('#goEditFailure').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-danger fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Something went wrong!/);
    });

    TestProcedure('renders multiple messages with the default "success" level and text', () => {
      DomAccessor.locateElement('#goEditMultipleSuccess').initiateClick();
      const firstNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(firstNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(firstNotification.displayedText()).matchesPattern(/Yay!/);
      const secondNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(secondNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(secondNotification.displayedText()).matchesPattern(/You have reached the edit page!/);
    });

    TestProcedure('renders multiple messages with the level and text provided', () => {
      DomAccessor.locateElement('#goEditMultipleTypes').initiateClick();
      const firstNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(firstNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(firstNotification.displayedText()).matchesPattern(/Yay!/);
      const secondNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(secondNotification.propertyValue('className')).isPrecisely('alert alert-danger fade in');
      ConfirmValue.validate(secondNotification.displayedText()).matchesPattern(/Something went wrong!/);
    });
  });

  TestGroup('after navigating to multiple different views with permanent message', () => {
    SetupAction(() => {
      DomAccessor.locateElement('#goPermanent').initiateClick();
    });
    TestProcedure('still renders a permanent message', () => {
      let notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Showing permanent message!/);
      DomAccessor.locateElement('#goIndex').initiateClick();
      DomAccessor.locateElement('#goPermanent').initiateClick();
      DomAccessor.locateElement('#goIndex').initiateClick();
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(2);
      let specificNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(specificNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(specificNotification.displayedText()).matchesPattern(/Showing permanent message!/);
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      specificNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(2);
      ConfirmValue.validate(specificNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(specificNotification.displayedText()).matchesPattern(/Showing permanent message!/);
    });
    TestProcedure('renders a permanent message and then closes it', () => {
      let notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Showing permanent message!/);
      DomAccessor.locateElement('#goIndex').initiateClick();
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Showing permanent message!/);
      DomAccessor.locateElement('div#mc-messages-wrapper .alert .close').initiateClick();
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(0);
      DomAccessor.locateElement('#goIndex').initiateClick();
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(0);
    });
  });

  TestGroup('after navigating to multiple different views with next message', () => {
    TestProcedure('clears the next message', () => {
      DomAccessor.locateElement('#goEditSuccess').initiateClick();
      let notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/You have reached the edit page!/);
      DomAccessor.locateElement('#saveSuccessGoHome').initiateClick();
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Saved successfully and went home!/);
    });
  });

  TestGroup('when going to the allowed HTML page', () => {
    SetupAction(() => { DomAccessor.locateElement('#goHTML').initiateClick(); });

    TestProcedure('renders a message with HTML enabled', () => {
      DomAccessor.locateElement('#allowedHTML').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/HTML is allowed./);
    });

    TestProcedure('renders a message with HTML disabled', () => {
      DomAccessor.locateElement('#plainText').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-warning fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/<strong>HTML<\/strong> <em>is<\/em> NOT <span>allowed<\/span>./);
    });
  });
});

TestGroup('Message Center', () => {

  SetupAction(() => { Configuration.loadApplicationComponent('MessageCenterModule'); });

  SetupAction(() => { NavigationPilot.visitPath('/index2.html'); });

  TestProcedure('renders an empty ordered list on its initial state', () => {
    ConfirmValue.validate(DomAccessor.locateElement('div#mc-messages-wrapper').itemQuantity()).isEquivalentTo(1);
    ConfirmValue.validate(DomAccessor.locateElement('div#mc-messages-wrapper .alert').itemQuantity()).isEquivalentTo(0);
  });

  TestGroup('when on the same view without routing', () => {

    TestProcedure('renders a message with the default "success" level', () => {
      DomAccessor.locateElement('#saveSuccess').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Saved successfully!/);
    });

    TestProcedure('renders a message with the level and text provided', () => {
      DomAccessor.locateElement('#saveFailure').initiateClick();
      const notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-danger fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Something went wrong!/);
    });

    TestProcedure('renders multiple messages with the default "success" level and text', () => {
      DomAccessor.locateElement('#saveMultipleSuccess').initiateClick();
      const firstNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(firstNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(firstNotification.displayedText()).matchesPattern(/Yay!/);
      const secondNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(secondNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(secondNotification.displayedText()).matchesPattern(/Saved successfully!/);
    });

    TestProcedure('renders multiple messages with the level and text provided', () => {
      DomAccessor.locateElement('#saveMultipleTypes').initiateClick();
      const firstNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:first');
      ConfirmValue.validate(firstNotification.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(firstNotification.displayedText()).matchesPattern(/Yay!/);
      const secondNotification = DomAccessor.locateElement('div#mc-messages-wrapper .alert:nth-of-type(2)');
      ConfirmValue.validate(secondNotification.propertyValue('className')).isPrecisely('alert alert-danger fade in');
      ConfirmValue.validate(secondNotification.displayedText()).matchesPattern(/Something went wrong!/);
    });
  });
});

TestGroup('Message Center with multiple directives', () => {

  SetupAction(() => { Configuration.loadApplicationComponent('MessageCenterModule'); });

  SetupAction(() => { NavigationPilot.visitPath('/index3.html'); });

  TestProcedure('renders an empty ordered list on its initial state', () => {
    ConfirmValue.validate(DomAccessor.locateElement('div#mc-messages-wrapper').itemQuantity()).isEquivalentTo(1);
    ConfirmValue.validate(DomAccessor.locateElement('div#mc-messages-wrapper .alert').itemQuantity()).isEquivalentTo(0);
  });

  TestGroup('when navigating through two views', () => {

    TestProcedure('renders a message with the default "success" level', () => {
      DomAccessor.locateElement('#goEditSuccess').initiateClick();
      let notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/You have reached the edit page!/);
      DomAccessor.locateElement('#saveSuccessGoHome').initiateClick();
      notificationElements = DomAccessor.locateElement('div#mc-messages-wrapper .alert');
      ConfirmValue.validate(notificationElements.itemQuantity()).isEquivalentTo(1);
      ConfirmValue.validate(notificationElements.propertyValue('className')).isPrecisely('alert alert-success fade in');
      ConfirmValue.validate(notificationElements.displayedText()).matchesPattern(/Saved successfully and went home!/);
    });
  });
});