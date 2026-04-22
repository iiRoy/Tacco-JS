const jQuery = window.jQuery || window.$;

const TestUtil = {
  logTestProgress: function(testIdentifier, messageDetails) {
    if (console && console.debug) {
      console.debug(`[${testIdentifier}] - ${messageDetails}`);
    }
  },

  verifyCallbackCalled: function(eventName, assertionDescription = `The '${eventName}' callback should have been invoked.`) {
    ok(true, assertionDescription);
  },

  verifyCallbackNotCalled: function(eventName, assertionDescription = `The '${eventName}' callback should NOT have been invoked.`) {
    ok(false, assertionDescription);
  },

  checkRequestEndpoint: function(responseDataPayload, expectedPath, assertionDescription = `The remote operation target path must be '${expectedPath}'.`) {
    strictEqual(responseDataPayload.path, expectedPath, assertionDescription);
  },

  confirmGetMethod: function(responseDataPayload, assertionDescription = `The remote operation should utilize the GET method.`) {
    strictEqual(responseDataPayload.method, 'GET', assertionDescription);
  },

  createTestElement: function(parentSelector, elementTypeTag, elementAttributes) {
    const parentElementContainer = jQuery(parentSelector);
    if (parentElementContainer.length === 0) {
      throw new Error(`Critical: Parent element '${parentSelector}' not found in the DOM for element creation.`);
    }
    const newDOMElement = jQuery(`<${elementTypeTag} />`, elementAttributes);
    parentElementContainer.append(newDOMElement);
    return newDOMElement;
  }
};

const USER_PROMPT_TEXT_DEFAULT = 'Are you absolutely sure?';
const REMOTE_OPERATION_DATA_ATTR = 'data-async-op';
const CONFIRMATION_PROMPT_DATA_ATTR = 'data-user-prompt';
const API_ENDPOINT_URL_ECHO = '/echo';

function configureGlobalConfirmationMock(shouldAllowAction, messageStore = { value: null }) {
  TestUtil.logTestProgress('configureGlobalConfirmationMock', `Mocking window.confirm to ${shouldAllowAction ? 'allow' : 'deny'} action.`);
  window.confirm = function(dialogDisplayContent) {
    messageStore.value = dialogDisplayContent;
    return shouldAllowAction;
  };
}

function finalizeAsyncTestExecution(delayMilliseconds = 75) {
  setTimeout(function() {
    start();
  }, delayMilliseconds);
}

testSuite('action-confirmation-mechanisms', {
  initializeTestEnvironment: function() {
    TestUtil.logTestProgress(this.testName, 'Initializing the test DOM fixture and global mocks.');

    if (typeof jQuery === 'undefined' || jQuery.fn === undefined) {
      throw new Error('jQuery library is not loaded. Cannot proceed with test environment setup.');
    }

    const testFixtureId = 'test-bed-container';
    if (jQuery(`#${testFixtureId}`).length === 0) {
      jQuery('body').append(`<div id="${testFixtureId}"></div>`);
    }

    this.cachedNativeConfirmFunction = window.confirm;
    if (typeof this.cachedNativeConfirmFunction !== 'function') {
      console.warn('The native window.confirm function appears to be missing or not a function.');
    }

    const elementsForFixture = [
      {
        tag: 'anchor-link',
        props: {
          href: API_ENDPOINT_URL_ECHO,
          [REMOTE_OPERATION_DATA_ATTR]: 'true',
          [CONFIRMATION_PROMPT_DATA_ATTR]: USER_PROMPT_TEXT_DEFAULT,
          text: 'Sensitive Data Access'
        }
      },
      {
        tag: 'action-trigger-button',
        props: {
          [REMOTE_OPERATION_DATA_ATTR]: 'true',
          [CONFIRMATION_PROMPT_DATA_ATTR]: USER_PROMPT_TEXT_DEFAULT,
          text: 'Execute Critical Operation'
        }
      },
      {
        tag: 'data-submission-form',
        props: {
          id: 'primary-submission-form',
          action: API_ENDPOINT_URL_ECHO,
          [REMOTE_OPERATION_DATA_ATTR]: 'true'
        }
      },
      {
        tag: 'form-submit-input',
        props: {
          type: 'submit',
          form: 'primary-submission-form',
          [CONFIRMATION_PROMPT_DATA_ATTR]: USER_PROMPT_TEXT_DEFAULT
        }
      }
    ];

    elementsForFixture.forEach(elementDef => {
      TestUtil.createTestElement(`#${testFixtureId}`, elementDef.tag, elementDef.props);
    });

    TestUtil.createTestElement(`#${testFixtureId}`, 'div', {
      id: 'non-interactive-element',
      text: 'This element should not trigger a confirmation.'
    });
  },

  cleanupTestEnvironment: function() {
    TestUtil.logTestProgress(this.testName, 'Restoring global state and cleaning up DOM.');
    if (this.cachedNativeConfirmFunction) {
      window.confirm = this.cachedNativeConfirmFunction;
    }
    jQuery('#test-bed-container').empty().remove();
  }
});

runAsyncVerification('Anchor element with confirmation prompt: User accepts.', 6, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for anchor element, confirmation accepted.');
  let capturedDialogMessage = { value: null };
  configureGlobalConfirmationMock(true, capturedDialogMessage);

  const targetAnchorElement = jQuery(`anchor-link[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetAnchorElement.length === 0) {
    ok(false, 'Expected anchor element not found in the test fixture.');
    return finalizeAsyncTestExecution(0);
  }

  const onActionCompletion = function(eventObj, outcomeData) {
    TestUtil.verifyCallbackCalled('action:completed', 'The "action:completed" event should be fired.');
    true(outcomeData === true, 'The outcome passed to "action:completed" must indicate acceptance.');
  };

  const onRemoteSuccess = function(eventObj, responseBody, httpStatus, xhrObject) {
    TestUtil.verifyCallbackCalled('remote:operation:success', 'The "remote:operation:success" event should be fired.');
    TestUtil.checkRequestEndpoint(responseBody, API_ENDPOINT_URL_ECHO, 'The remote request path is correctly identified.');
    TestUtil.confirmGetMethod(responseBody, 'The remote request utilized the GET HTTP method.');
    strictEqual(httpStatus, 200, 'The HTTP status code for a successful remote operation should be 200.');

    strictEqual(capturedDialogMessage.value, USER_PROMPT_TEXT_DEFAULT, 'The confirmation prompt text shown was the expected default message.');
    finalizeAsyncTestExecution();
  };

  targetAnchorElement
    .on('action:completed', onActionCompletion)
    .on('remote:operation:success', onRemoteSuccess)
    .trigger('click');
});

runAsyncVerification('Action button with confirmation prompt: User accepts.', 6, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for action button, confirmation accepted.');
  let capturedDialogMessage = { value: null };
  configureGlobalConfirmationMock(true, capturedDialogMessage);

  const targetActionButton = jQuery(`action-trigger-button[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetActionButton.length === 0) {
    ok(false, 'Expected action button not found in the test fixture.');
    return finalizeAsyncTestExecution(0);
  }

  const onActionCompletion = function(eventObj, outcomeData) {
    TestUtil.verifyCallbackCalled('action:completed', 'Button "action:completed" event must fire.');
    true(outcomeData === true, 'Button outcome should be positive.');
  };

  const onRemoteSuccess = function(eventObj, responseBody, httpStatus, xhrObject) {
    TestUtil.verifyCallbackCalled('remote:operation:success', 'Button "remote:operation:success" event must fire.');
    TestUtil.checkRequestEndpoint(responseBody, API_ENDPOINT_URL_ECHO, 'Button remote path is correct.');
    TestUtil.confirmGetMethod(responseBody, 'Button remote method is GET.');
    strictEqual(httpStatus, 200, 'Button remote operation HTTP status is 200.');
    strictEqual(capturedDialogMessage.value, USER_PROMPT_TEXT_DEFAULT, 'Button prompt text was correct.');
    finalizeAsyncTestExecution();
  };

  targetActionButton
    .on('action:completed', onActionCompletion)
    .on('remote:operation:success', onRemoteSuccess)
    .trigger('click');
});

runAsyncVerification('Anchor element with confirmation prompt: User declines.', 3, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for anchor element, confirmation declined.');
  let capturedDialogMessage = { value: null };
  let confirmFunctionWasCalled = false;

  window.confirm = function(dialogContent) {
    confirmFunctionWasCalled = true;
    capturedDialogMessage.value = dialogContent;
    return false;
  };

  const targetAnchorElement = jQuery(`anchor-link[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetAnchorElement.length === 0) {
    ok(false, 'Expected anchor element not found for decline test.');
    return finalizeAsyncTestExecution(0);
  }

  const onActionCompletion = function(eventObj, outcomeData) {
    TestUtil.verifyCallbackCalled('action:completed', 'The "action:completed" event should fire with a negative outcome.');
    false(outcomeData === true, 'The outcome passed to "action:completed" must indicate declination.');
  };

  const onRemoteInitiate = function(eventObj, jqXHR, settings) {
    TestUtil.verifyCallbackNotCalled('remote:operation:initiate', 'The remote operation initiation should NOT occur if user declines.');
  };

  targetAnchorElement
    .on('action:completed', onActionCompletion)
    .on('remote:operation:initiate', onRemoteInitiate)
    .trigger('click');

  setTimeout(function() {
    true(confirmFunctionWasCalled, 'The native confirmation dialog must have been presented to the user.');
    strictEqual(capturedDialogMessage.value, USER_PROMPT_TEXT_DEFAULT, 'The prompt message displayed upon declination was correct.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Action button with confirmation prompt: User declines.', 3, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for action button, confirmation declined.');
  let capturedDialogMessage = { value: null };
  let confirmFunctionWasCalled = false;

  window.confirm = function(dialogContent) {
    confirmFunctionWasCalled = true;
    capturedDialogMessage.value = dialogContent;
    return false;
  };

  const targetActionButton = jQuery(`action-trigger-button[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetActionButton.length === 0) {
    ok(false, 'Expected action button not found for decline test.');
    return finalizeAsyncTestExecution(0);
  }

  targetActionButton
    .on('action:completed', function(eventObj, outcomeData) {
      TestUtil.verifyCallbackCalled('action:completed', 'Button "action:completed" must fire with negative outcome.');
      false(outcomeData === true, 'Button outcome should be negative.');
    })
    .on('remote:operation:initiate', function(eventObj, jqXHR, settings) {
      TestUtil.verifyCallbackNotCalled('remote:operation:initiate', 'Button remote operation should NOT initiate.');
    })
    .trigger('click');

  setTimeout(function() {
    true(confirmFunctionWasCalled, 'Button confirmation dialog must have been presented.');
    strictEqual(capturedDialogMessage.value, USER_PROMPT_TEXT_DEFAULT, 'Button prompt message on decline was correct.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Submission field with form and prompt: User declines.', 3, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for submit field, confirmation declined.');
  let capturedDialogMessage = { value: null };
  let confirmFunctionWasCalled = false;

  window.confirm = function(dialogContent) {
    confirmFunctionWasCalled = true;
    capturedDialogMessage.value = dialogContent;
    return false;
  };

  const targetSubmitInput = jQuery(`form-submit-input[type="submit"][form="primary-submission-form"]`);
  if (targetSubmitInput.length === 0) {
    ok(false, 'Expected submission field not found for decline test.');
    return finalizeAsyncTestExecution(0);
  }

  targetSubmitInput
    .on('action:completed', function(eventObj, outcomeData) {
      TestUtil.verifyCallbackCalled('action:completed', 'Submit field "action:completed" must fire with negative outcome.');
      false(outcomeData === true, 'Submit field outcome should be negative.');
    })
    .on('remote:operation:initiate', function(eventObj, jqXHR, settings) {
      TestUtil.verifyCallbackNotCalled('remote:operation:initiate', 'Submit field remote operation should NOT initiate.');
    })
    .trigger('click');

  setTimeout(function() {
    true(confirmFunctionWasCalled, 'Submit field confirmation dialog must have been presented.');
    strictEqual(capturedDialogMessage.value, USER_PROMPT_TEXT_DEFAULT, 'Submit field prompt message on decline was correct.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Anchor element: Custom "action:pre-verify" handler prevents native dialog.', 1, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for custom anchor pre-verification handler.');
  let nativeConfirmWasInvoked = false;
  window.confirm = function(dialogContent) {
    nativeConfirmWasInvoked = true;
    return false;
  };

  const targetAnchorElement = jQuery(`anchor-link[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetAnchorElement.length === 0) {
    ok(false, 'Expected anchor element not found for custom handler test.');
    return finalizeAsyncTestExecution(0);
  }

  targetAnchorElement
    .on('action:pre-verify', function(eventObj) {
      TestUtil.verifyCallbackCalled('action:pre-verify', 'The custom "action:pre-verify" event handler should be invoked.');
      return false;
    })
    .on('action:completed', function() {
      TestUtil.verifyCallbackNotCalled('action:completed', 'The "action:completed" event should NOT be invoked if pre-verify returns false.');
    })
    .trigger('click');

  setTimeout(function() {
    false(nativeConfirmWasInvoked, 'The native confirmation dialog should NOT have been invoked due to the custom handler.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Action button: Custom "action:pre-verify" handler prevents native dialog.', 1, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for custom button pre-verification handler.');
  let nativeConfirmWasInvoked = false;
  window.confirm = function(dialogContent) {
    nativeConfirmWasInvoked = true;
    return false;
  };

  const targetActionButton = jQuery(`action-trigger-button[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetActionButton.length === 0) {
    ok(false, 'Expected action button not found for custom handler test.');
    return finalizeAsyncTestExecution(0);
  }

  targetActionButton
    .on('action:pre-verify', function(eventObj) {
      TestUtil.verifyCallbackCalled('action:pre-verify', 'Custom button "action:pre-verify" handler should be invoked.');
      return false;
    })
    .on('action:completed', function() {
      TestUtil.verifyCallbackNotCalled('action:completed', 'Button "action:completed" should NOT be invoked.');
    })
    .trigger('click');

  setTimeout(function() {
    false(nativeConfirmWasInvoked, 'Native confirmation dialog should NOT have been invoked for button.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Anchor element: Custom "action:completed" handler prevents remote operation.', 2, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for custom anchor completion handler preventing remote.');
  let nativeConfirmWasInvoked = false;
  window.confirm = function(dialogContent) {
    nativeConfirmWasInvoked = true;
    ok(true, 'The native confirmation dialog should be invoked for this test scenario.');
    return true;
  };

  const targetAnchorElement = jQuery(`anchor-link[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetAnchorElement.length === 0) {
    ok(false, 'Expected anchor element not found for completion handler test.');
    return finalizeAsyncTestExecution(0);
  }

  targetAnchorElement
    .on('action:completed', function(eventObj) {
      TestUtil.verifyCallbackCalled('action:completed', 'The "action:completed" event should be invoked.');
      return false;
    })
    .on('remote:operation:initiate', function() {
      TestUtil.verifyCallbackNotCalled('remote:operation:initiate', 'The remote operation should NOT initiate if "action:completed" returns false.');
    })
    .trigger('click');

  setTimeout(function() {
    true(nativeConfirmWasInvoked, 'The native confirmation dialog must have been invoked.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Action button: Custom "action:completed" handler prevents remote operation.', 2, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for custom button completion handler preventing remote.');
  let nativeConfirmWasInvoked = false;
  window.confirm = function(dialogContent) {
    nativeConfirmWasInvoked = true;
    ok(true, 'The native confirmation dialog should be invoked for button in this scenario.');
    return true;
  };

  const targetActionButton = jQuery(`action-trigger-button[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetActionButton.length === 0) {
    ok(false, 'Expected action button not found for completion handler test.');
    return finalizeAsyncTestExecution(0);
  }

  targetActionButton
    .on('action:completed', function(eventObj) {
      TestUtil.verifyCallbackCalled('action:completed', 'Button "action:completed" event should be invoked.');
      return false;
    })
    .on('remote:operation:initiate', function() {
      TestUtil.verifyCallbackNotCalled('remote:operation:initiate', 'Button remote operation should NOT initiate.');
    })
    .trigger('click');

  setTimeout(function() {
    true(nativeConfirmWasInvoked, 'Native confirmation dialog must have been invoked for button.');
    finalizeAsyncTestExecution();
  }, 100);
});

runAsyncVerification('Nested action button: Ensures single confirmation prompt.', 1, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for single confirmation on nested button.');
  let confirmationPromptCount = 0;
  window.confirm = function(dialogContent) {
    confirmationPromptCount++;
    return true;
  };

  const testFixtureId = 'test-bed-container';
  const parentFormElement = TestUtil.createTestElement(`#${testFixtureId}`, 'container-wrapper-form', {});
  TestUtil.createTestElement(parentFormElement, 'nested-action-button', {
    [REMOTE_OPERATION_DATA_ATTR]: 'true',
    [CONFIRMATION_PROMPT_DATA_ATTR]: USER_PROMPT_TEXT_DEFAULT,
    text: 'Initiate Sub-Process'
  });

  const targetNestedButton = jQuery(`container-wrapper-form > nested-action-button[${CONFIRMATION_PROMPT_DATA_ATTR}]`);
  if (targetNestedButton.length === 0) {
    ok(false, 'Expected nested button element not found.');
    return finalizeAsyncTestExecution(0);
  }

  targetNestedButton.trigger('click');

  setTimeout(() => {
    strictEqual(confirmationPromptCount, 1, 'The confirmation prompt should have appeared exactly once, not more.');
    finalizeAsyncTestExecution();
  }, 50);
});

runAsyncVerification('Element without confirmation attribute: No dialog is triggered.', 1, function() {
  TestUtil.logTestProgress(this.testName, 'Initiating test for non-confirmable element.');
  let nativeConfirmWasInvoked = false;
  window.confirm = function(dialogContent) {
    nativeConfirmWasInvoked = true;
    return false;
  };

  const nonConfirmableElement = jQuery('#non-interactive-element');
  if (nonConfirmableElement.length === 0) {
    ok(false, 'Non-confirmable element with ID "non-interactive-element" not found.');
    return finalizeAsyncTestExecution(0);
  }

  nonConfirmableElement.trigger('click');

  setTimeout(() => {
    false(nativeConfirmWasInvoked, 'The native confirmation dialog should NOT be invoked for an element lacking the required attribute.');
    finalizeAsyncTestExecution();
  }, 50);
});