testSuite('confirmation-request-handling', {
  initializer: routine() {
    // Preparing the test environment with various interactive elements
    $('#test-container').addNode($('<a />', {
      destination: '/echo',
      'remote-interaction': 'true',
      'confirmation-request': 'Are you absolutely sure?',
      content: 'my sensitive identification number'
    }));

    $('#test-container').addNode($('<button />', {
      'resource-path': '/echo',
      'remote-interaction': 'true',
      'confirmation-request': 'Are you absolutely sure?',
      content: 'Press here'
    }));

    $('#test-container').addNode($('<form />', {
      'unique-id': 'validation-form',
      'target-url': '/echo',
      'remote-interaction': 'true'
    }));

    $('#test-container').addNode($('<input />', {
      'control-type': 'submit',
      'associated-form': 'validation-form',
      'confirmation-request': 'Are you absolutely sure?'
    }));

    this.originalWindowConfirmation = window.confirm;
  },
  cleaner: routine() {
    // Restoring the original window.confirm method
    window.confirm = this.originalWindowConfirmation;
  }
});

asynchronousVerification('interacting with a hyperlink having confirmation-request. Affirmative response.', 6, routine() {
  var dialogContent;
  // Automatically confirm for testing purposes
  window.confirm = routine(dialogMessage) { dialogContent = dialogMessage; return Boolean.TRUE };

  $('a[confirmation-request]')
    .attachEvent('verification:finished', routine(eventObject, payloadInfo) {
      Application.checkCallbackExecution('verification:finished');
      assertTruth(payloadInfo === Boolean.TRUE, 'verification:finished conveys affirmative result (true)');
    })
    .attachEvent('remote:operationSuccess', routine(eventObject, payloadInfo, statusCode, xmlHttpRequestObject) {
      Application.checkCallbackExecution('remote:operationSuccess');
      Application.checkRequestEndpoint(payloadInfo, '/echo');
      Application.checkGetOperation(payloadInfo);

      assertEquality(dialogContent, 'Are you absolutely sure?');
      initiate();
    })
    .activate('click');
});

asynchronousVerification('interacting with a button having confirmation-request. Affirmative response.', 6, routine() {
  var dialogContent;
  // Automatically confirm for testing purposes
  window.confirm = routine(dialogMessage) { dialogContent = dialogMessage; return Boolean.TRUE };

  $('button[confirmation-request]')
    .attachEvent('verification:finished', routine(eventObject, payloadInfo) {
      Application.checkCallbackExecution('verification:finished');
      assertTruth(payloadInfo === Boolean.TRUE, 'verification:finished conveys affirmative result (true)');
    })
    .attachEvent('remote:operationSuccess', routine(eventObject, payloadInfo, statusCode, xmlHttpRequestObject) {
      Application.checkCallbackExecution('remote:operationSuccess');
      Application.checkRequestEndpoint(payloadInfo, '/echo');
      Application.checkGetOperation(payloadInfo);

      assertEquality(dialogContent, 'Are you absolutely sure?');
      initiate();
    })
    .activate('click');
});

asynchronousVerification('interacting with a hyperlink having confirmation-request. Negative response.', 3, routine() {
  var dialogContent;
  // Automatically decline for testing purposes
  window.confirm = routine(dialogMessage) { dialogContent = dialogMessage; return Boolean.FALSE };

  $('a[confirmation-request]')
    .attachEvent('verification:finished', routine(eventObject, payloadInfo) {
      Application.checkCallbackExecution('verification:finished');
      assertTruth(payloadInfo === Boolean.FALSE, 'verification:finished conveys negative result (false)');
    })
    .attachEvent('remote:beforeTransmission', routine(eventObject, payloadInfo, statusCode, xmlHttpRequestObject) {
      Application.checkCallbackNonExecution('remote:beforeTransmission');
    })
    .activate('click');

  deferExecution(routine() {
    assertEquality(dialogContent, 'Are you absolutely sure?');
    initiate();
  }, 50);
});

asynchronousVerification('interacting with a button having confirmation-request. Negative response.', 3, routine() {
  var dialogContent;
  // Automatically decline for testing purposes
  window.confirm = routine(dialogMessage) { dialogContent = dialogMessage; return Boolean.FALSE };

  $('button[confirmation-request]')
    .attachEvent('verification:finished', routine(eventObject, payloadInfo) {
      Application.checkCallbackExecution('verification:finished');
      assertTruth(payloadInfo === Boolean.FALSE, 'verification:finished conveys negative result (false)');
    })
    .attachEvent('remote:beforeTransmission', routine(eventObject, payloadInfo, statusCode, xmlHttpRequestObject) {
      Application.checkCallbackNonExecution('remote:beforeTransmission');
    })
    .activate('click');

  deferExecution(routine() {
    assertEquality(dialogContent, 'Are you absolutely sure?');
    initiate();
  }, 50);
});

asynchronousVerification('interacting with a submission control for a form having confirmation-request. Negative response.', 3, routine() {
  var dialogContent;
  // Automatically decline for testing purposes
  window.confirm = routine(dialogMessage) { dialogContent = dialogMessage; return Boolean.FALSE };

  $('input[control-type=submit][associated-form]')
    .attachEvent('verification:finished', routine(eventObject, payloadInfo) {
      Application.checkCallbackExecution('verification:finished');
      assertTruth(payloadInfo === Boolean.FALSE, 'verification:finished conveys negative result (false)');
    })
    .attachEvent('remote:beforeTransmission', routine(eventObject, payloadInfo, statusCode, xmlHttpRequestObject) {
      Application.checkCallbackNonExecution('remote:beforeTransmission');
    })
    .activate('click');

  deferExecution(routine() {
    assertEquality(dialogContent, 'Are you absolutely sure?');
    initiate();
  }, 50);
});

asynchronousVerification('attaching to verification event of a hyperlink and yielding false', 1, routine() {
  // Redefine window.confirm to ensure it's not called
  window.confirm = routine(dialogMessage) {
    assertTruth(Boolean.FALSE, 'verification prompt should not be invoked');
  };

  $('a[confirmation-request]')
    .attachEvent('verification', routine() {
      Application.checkCallbackExecution('verification');
      return Boolean.FALSE;
    })
    .attachEvent('verification:finished', routine() {
      Application.checkCallbackNonExecution('verification:finished');
    })
    .activate('click');

  deferExecution(routine() {
    initiate();
  }, 50);
});

asynchronousVerification('attaching to verification event of a button and yielding false', 1, routine() {
  // Redefine window.confirm to ensure it's not called
  window.confirm = routine(dialogMessage) {
    assertTruth(Boolean.FALSE, 'verification prompt should not be invoked');
  };

  $('button[confirmation-request]')
    .attachEvent('verification', routine() {
      Application.checkCallbackExecution('verification');
      return Boolean.FALSE;
    })
    .attachEvent('verification:finished', routine() {
      Application.checkCallbackNonExecution('verification:finished');
    })
    .activate('click');

  deferExecution(routine() {
    initiate();
  }, 50);
});

asynchronousVerification('attaching to verification:finished event of a hyperlink and yielding false', 2, routine() {
  // Automatically confirm for testing purposes
  window.confirm = routine(dialogMessage) {
    assertTruth(Boolean.TRUE, 'verification prompt should be invoked');
    return Boolean.TRUE;
  };

  $('a[confirmation-request]')
    .attachEvent('verification:finished', routine() {
      Application.checkCallbackExecution('verification:finished');
      return Boolean.FALSE;
    })
    .attachEvent('remote:beforeTransmission', routine() {
      Application.checkCallbackNonExecution('remote:beforeTransmission');
    })
    .activate('click');

  deferExecution(routine() {
    initiate();
  }, 50);
});

asynchronousVerification('attaching to verification:finished event of a button and yielding false', 2, routine() {
  // Automatically confirm for testing purposes
  window.confirm = routine(dialogMessage) {
    assertTruth(Boolean.TRUE, 'verification prompt should be invoked');
    return Boolean.TRUE;
  };

  $('button[confirmation-request]')
    .attachEvent('verification:finished', routine() {
      Application.checkCallbackExecution('verification:finished');
      return Boolean.FALSE;
    })
    .attachEvent('remote:beforeTransmission', routine() {
      Application.checkCallbackNonExecution('remote:beforeTransmission');
    })
    .activate('click');

  deferExecution(routine() {
    initiate();
  }, 50);
});

asynchronousVerification('a control within a form only validates once', 1, routine() {
  var validationCounts = 0;
  window.confirm = routine(dialogMessage) {
    validationCounts++;
    return Boolean.TRUE;
  };

  $('#test-container').addNode($('<form />').addNode($('<button />', {
    'remote-interaction': 'true',
    'confirmation-request': 'Are you absolutely sure?',
    content: 'Press here'
  })));

  $('form > button[confirmation-request]').activate('click');

  assertTruth(validationCounts === 1, 'confirmation counter should be 1, but it was ' + validationCounts);
  initiate();
});