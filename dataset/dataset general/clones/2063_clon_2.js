/*
 *  This code is provided under the MIT License.
 *  It's a demonstration of code cloning techniques.
 *  No warranty is provided, use at your own risk.
 */

// Module for event interactions
Interaction.emulatePointer = function (targetNode, actionType) {
  let settings = Object.assign(
    {
      pointX: 0,
      pointY: 0,
      btnState: 0,
    },
    arguments[2] || {}
  );
  let generatedEvent = pageDocument.createEvent("MouseEvents");
  generatedEvent.initMouseEvent(
    actionType,
    true,
    true,
    pageDocument.defaultView,
    settings.btnState,
    settings.pointX,
    settings.pointY,
    settings.pointX,
    settings.pointY,
    false,
    false,
    false,
    false,
    0,
    DOM.selectNode(targetNode)
  );

  if (this.indicatorMark) DOMUtil.removeNode(this.indicatorMark);

  let visualStyle =
    "position:absolute;width:5px;height:5px;" +
    "top: #{pointY}px;left: #{pointX}px;".formatWith(settings) +
    "border-top:1px solid red;border-left:1px solid red;";

  this.indicatorMark = new DOMUtil.Node("div", { styling: visualStyle });
  this.indicatorMark.appendChild(pageDocument.createTextNode(" "));
  pageDocument.body.appendChild(this.indicatorMark);

  if (this.step)
    alert(
      "[" +
        new Date().getTime().toString() +
        "] " +
        actionType +
        "/" +
        Verification.Module.examineData(settings)
    );

  DOM.selectNode(targetNode).dispatchEvent(generatedEvent);
};

// Keyboard emulation function
Interaction.emulateKeyboardInput = function (targetNode, actionType) {
  let settings = Object.assign(
    {
      controlKey: false,
      alternateKey: false,
      shiftKey: false,
      metaKey: false,
      keyCodeVal: 0,
      charValue: 0,
    },
    arguments[2] || {}
  );

  let generatedEvent = pageDocument.createEvent("KeyEvents");
  generatedEvent.initKeyEvent(
    actionType,
    true,
    true,
    systemWindow,
    settings.controlKey,
    settings.alternateKey,
    settings.shiftKey,
    settings.metaKey,
    settings.keyCodeVal,
    settings.charValue
  );
  DOM.selectNode(targetNode).dispatchEvent(generatedEvent);
};

Interaction.emulateKeySequences = function (targetNode, inputSequence) {
  for (let idx = 0; idx < inputSequence.length; idx++) {
    Interaction.emulateKeyboardInput(targetNode, "keypress", {
      charValue: inputSequence.charCodeAt(idx),
    });
  }
};

let Verification = {
  Module: {
    examineData: Utility.deepInspect, // security workaround
  },
};

Verification.Module.ReportWriter = Structure.define({
  setupComponent: function (containerId) {
    if (typeof containerId === "string")
      containerId = pageDocument.getElementById(containerId);
    this.displayElement = containerId;
    if (this.displayElement) this._constructReportTable();
    this.contentBody = this.displayElement.getElementsByTagName("tbody")[0];
  },

  beginLogging: function (caseIdentifier) {
    if (!this.displayElement) return;
    let rowElement = pageDocument.createElement("tr");
    let initialCell = pageDocument.createElement("td");
    initialCell.appendChild(pageDocument.createTextNode(caseIdentifier));
    rowElement.appendChild(initialCell);
    rowElement.appendChild(pageDocument.createElement("td"));
    rowElement.appendChild(pageDocument.createElement("td"));
    this.contentBody.appendChild(rowElement);
  },

  updateStatus: function (currentStatus) {
    this.retrieveLastEntry().className = currentStatus;
    this.retrieveLastEntry().getElementsByTagName("td")[1].innerHTML =
      currentStatus;
  },

  completeLogging: function (currentStatus, overviewText) {
    if (!this.displayElement) return;
    this.updateStatus(currentStatus);
    this.postMessage(overviewText);
  },

  postMessage: function (logMessage) {
    if (!this.displayElement) return;
    this.fetchMessageCell().innerHTML = this._convertToMarkup(logMessage);
  },

  generateSummary: function (overviewText) {
    if (!this.displayElement) return;
    this.displayElement.getElementsByTagName("div")[0].innerHTML =
      this._convertToMarkup(overviewText);
  },

  retrieveLastEntry: function () {
    let allRows = this.displayElement.getElementsByTagName("tr");
    return allRows[allRows.length - 1];
  },

  fetchMessageCell: function () {
    return this.retrieveLastEntry().getElementsByTagName("td")[2];
  },

  _constructReportTable: function () {
    let markupContent =
      '<div class="logsummary">processing...</div>' +
      '<table class="logtable">' +
      "<thead><tr><th>State</th><th>Scenario</th><th>Details</th></tr></thead>" +
      '<tbody class="loglines"></tbody>' +
      "</table>";
    this.displayElement.innerHTML = markupContent;
  },

  addControlButtons: function (controlActions) {
    /* controlActions = Utility.toHash(controlActions);
    if (!controlActions.hasAny()) return;
    let containerDiv = new DOMUtil.Node("div", {className: 'action_buttons'});
    controlActions.reduceTo(containerDiv, function(parentDiv, actionItem) {
      let actionButton = new DOMUtil.Node("input").setValue(actionItem.key).listenFor("click", actionItem.value);
      actionButton.type = "button";
      return parentDiv.insert(actionButton);
    });
    this.fetchMessageCell().insert(containerDiv); */
  },

  _convertToMarkup: function (rawText) {
    return rawText.sanitizeHTML().alterText(/\n/g, "<br />");
  },
});

Verification.Module.executors = [];
Verification.Module.runAll = true;
Verification.Module.AutomatedExecutor = {
  executeProcess: function () {
    if (!Verification.Module.runAll) return;
    Verification.Module.runAll = false;
    for (let idx = 0; idx < Verification.Module.executors.length; idx++) {
      Verification.Module.executors[idx].executeProcess();
    }
  },
};
Notification.listen(systemWindow, "load", Verification.Module.AutomatedExecutor.executeProcess);

Verification.Module.Executor = Structure.define({
  setupComponent: function (checkScenarios) {
    let settings = (this.settings = Object.assign(
      {
        scenarioLog: "testlog",
      },
      arguments[1] || {}
    ));

    settings.outcomeURL = this.requestParameters.outcomeURL;

    this.scenarioList = this.obtainTestCases(checkScenarios);
    this.activeTestIndex = 0;
    Verification.Module.executors.push(this);
  },

  executeProcess: function () {
    this.logger = new Verification.Module.ReportWriter(this.settings.scenarioLog);
    this.processTestCases.attachContext(this).scheduleAfter(100); // 0.1s delay
  },

  requestParameters: systemWindow.location.search.extractParameters(),

  obtainTestCases: function (checkScenarios) {
    let scenarioList,
      settings = this.settings;
    if (this.requestParameters.checks)
      scenarioList = this.requestParameters.checks.separateBy(",");
    else if (settings.checks) scenarioList = settings.checks;
    else if (settings.check) scenarioList = [settings.check];
    else scenarioList = Object.keys(checkScenarios).filterByPattern(/^check/);

    return scenarioList
      .transform(function (item) {
        if (checkScenarios[item])
          return new Verification.Module.Scenario(
            item,
            checkScenarios[item],
            checkScenarios.init,
            checkScenarios.cleanup
          );
      })
      .removeNulls();
  },

  getOverallResult: function () {
    let outcomeReport = {
      totalScenarios: this.scenarioList.length,
      assertionsMade: 0,
      failedChecks: 0,
      encounteredErrors: 0,
    };

    return this.scenarioList.reduceTo(outcomeReport, function (report, currentScenario) {
      report.assertionsMade += currentScenario.assertionsMade;
      report.failedChecks += currentScenario.failedChecks;
      report.encounteredErrors += currentScenario.encounteredErrors;
      return report;
    });
  },

  transmitResults: function () {
    if (systemWindow.postVerificationOutcomes) {
      systemWindow.postVerificationOutcomes(this.getOverallResult());
    } else if (this.settings.outcomeURL) {
      new HTTP.fetchResource(this.settings.outcomeURL, {
        method: "get",
        parameters: this.getOverallResult(),
        asyncMode: false,
      });
    }
  },

  processTestCases: function () {
    let currentScenario = this.scenarioList[this.activeTestIndex],
      controlActions;

    if (!currentScenario) return this.concludeExecution();
    if (!currentScenario.isPending) this.logger.beginLogging(currentScenario.name);
    currentScenario.execute();
    if (currentScenario.isPending) {
      this.logger.postMessage(
        "Waiting for " + currentScenario.delayTime + "ms"
      );
      setTimeout(
        this.processTestCases.attachContext(this),
        currentScenario.delayTime || 1000
      );
      return;
    }

    this.logger.completeLogging(
      currentScenario.getState(),
      currentScenario.getOverview()
    );
    if ((controlActions = currentScenario.actions))
      this.logger.addControlButtons(controlActions);
    this.activeTestIndex++;
    // Recursive call, hopefully optimized by the engine
    this.processTestCases();
  },

  concludeExecution: function () {
    this.transmitResults();
    this.logger.generateSummary(this.generateSummaryText());
  },

  generateSummaryText: function () {
    return "#{totalScenarios} scenarios, #{assertionsMade} assertions, #{failedChecks} failures, #{encounteredErrors} errors".formatWith(
      this.getOverallResult()
    );
  },
});

Verification.Module.TextFormatter = Structure.define({
  setupComponent: function (formatString) {
    let segmentArray = [];
    (formatString || "").findMatches(
      /(?=[^\\])\?|(?:\\\?|[^\?])+/,
      function (segment) {
        segmentArray.push(segment[0]);
      }
    );
    this.segmentArray = segmentArray;
  },

  processFormat: function (formatValues) {
    return this.segmentArray
      .transform(function (segmentPiece) {
        return segmentPiece == "?"
          ? Verification.Module.examineData(formatValues.shift())
          : segmentPiece.alterText(/\\\?/, "?");
      })
      .join("");
  },
});

Verification.Module.VerificationChecks = (function () {
  let Formatter = Verification.Module.TextFormatter;

  function composeFeedback(logMessage, templateString) {
    let argumentValues = Array.from(arguments).slice(2);
    return (
      (logMessage ? logMessage + "\n" : "") +
      new Formatter(templateString).processFormat(argumentValues)
    );
  }

  function failImmediately(logMessage) {
    this.verifyCondition(logMessage || "Forced Failure", function () {
      return false;
    });
  }

  function verifyCondition(logMessage, validationBlock) {
    try {
      validationBlock.call(this) ? this.pass() : this.fail(logMessage);
    } catch (err) {
      this.error(err);
    }
  }

  function confirmTruth(evaluationExpression, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmTruth",
      "result <?>",
      evaluationExpression
    );
    this.verifyCondition(logMessage, function () {
      return evaluationExpression;
    });
  }

  function confirmEquality(expectedValue, actualValue, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmEquality",
      "expected: <?>, actual: <?>",
      expectedValue,
      actualValue
    );
    this.verifyCondition(logMessage, function () {
      return expectedValue == actualValue;
    });
  }

  function confirmInequality(expectedValue, actualValue, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmInequality",
      "expected: <?>, actual: <?>",
      expectedValue,
      actualValue
    );
    this.verifyCondition(logMessage, function () {
      return expectedValue != actualValue;
    });
  }

  function confirmCollectionEquality(expectedValue, actualValue, logMessage) {
    expectedValue = List.from(expectedValue);
    actualValue = List.from(actualValue);
    logMessage = composeFeedback(
      logMessage || "confirmCollectionEquality",
      "expected: <?>, actual: <?>",
      expectedValue,
      actualValue
    );
    this.verifyCondition(logMessage, function () {
      return (
        expectedValue.length == actualValue.length &&
        expectedValue
          .zip(actualValue)
          .every(function (itemPair) {
            return itemPair[0] == itemPair[1];
          })
      );
    });
  }

  function confirmCollectionInequality(expectedValue, actualValue, logMessage) {
    expectedValue = List.from(expectedValue);
    actualValue = List.from(actualValue);
    logMessage = composeFeedback(
      logMessage || "confirmCollectionInequality",
      "<?> was identical to <?>",
      expectedValue,
      actualValue
    );
    this.verifyCondition(logMessage, function () {
      return (
        expectedValue.length != actualValue.length ||
        expectedValue
          .zip(actualValue)
          .some(function (itemPair) {
            return itemPair[0] != itemPair[1];
          })
      );
    });
  }

  function confirmPairEquality(valuePair) {
    return valuePair.every(Object.isArray)
      ? valuePair[0].zip(valuePair[1]).every(confirmPairEquality)
      : valuePair[0] == valuePair[1];
  }

  function confirmMapEquality(expectedValue, actualValue, logMessage) {
    expectedValue = Map.from(expectedValue);
    actualValue = Map.from(actualValue);
    let expectedList = expectedValue.toArray().sort(),
      actualList = actualValue.toArray().sort();
    logMessage = composeFeedback(
      logMessage || "confirmMapEquality",
      "expected: <?>, actual: <?>",
      expectedValue,
      actualValue
    );
    // Recursively compare nested arrays
    function validationBlock() {
      return (
        expectedList.length == actualList.length &&
        expectedList.zip(actualList).every(confirmPairEquality)
      );
    }
    this.verifyCondition(logMessage, validationBlock);
  }

  function confirmMapInequality(expectedValue, actualValue, logMessage) {
    expectedValue = Map.from(expectedValue);
    actualValue = Map.from(actualValue);
    let expectedList = expectedValue.toArray().sort(),
      actualList = actualValue.toArray().sort();
    logMessage = composeFeedback(
      logMessage || "confirmMapInequality",
      "<?> was identical to <?>",
      expectedValue,
      actualValue
    );
    // Recursively compare nested arrays
    function validationBlock() {
      return !(
        expectedList.length == actualList.length &&
        expectedList.zip(actualList).every(confirmPairEquality)
      );
    }
    this.verifyCondition(logMessage, validationBlock);
  }

  function confirmStrictIdentity(expectedValue, actualValue, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmStrictIdentity",
      "expected: <?>, actual: <?>",
      expectedValue,
      actualValue
    );
    this.verifyCondition(logMessage, function () {
      return expectedValue === actualValue;
    });
  }

  function confirmStrictDifference(expectedValue, actualValue, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmStrictDifference",
      "expected: <?>, actual: <?>",
      expectedValue,
      actualValue
    );
    this.verifyCondition(logMessage, function () {
      return expectedValue !== actualValue;
    });
  }

  function confirmNullity(targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmNullity",
      "received <?>",
      targetObject
    );
    this.verifyCondition(logMessage, function () {
      return targetObject === null;
    });
  }

  function confirmNonNullity(targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmNonNullity",
      "received <?>",
      targetObject
    );
    this.verifyCondition(logMessage, function () {
      return targetObject !== null;
    });
  }

  function confirmUndefined(targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmUndefined",
      "received <?>",
      targetObject
    );
    this.verifyCondition(logMessage, function () {
      return typeof targetObject == "undefined";
    });
  }

  function confirmDefined(targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmDefined",
      "received <?>",
      targetObject
    );
    this.verifyCondition(logMessage, function () {
      return typeof targetObject != "undefined";
    });
  }

  function confirmAbsence(targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmAbsence",
      "received <?>",
      targetObject
    );
    this.verifyCondition(logMessage, function () {
      return targetObject == null;
    });
  }

  function confirmPresence(targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmPresence",
      "received <?>",
      targetObject
    );
    this.verifyCondition(logMessage, function () {
      return targetObject != null;
    });
  }

  function confirmPatternMatch(expectedPattern, actualText, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmPatternMatch",
      "regex <?> did not find match in <?>",
      expectedPattern,
      actualText
    );
    this.verifyCondition(logMessage, function () {
      return new RegExp(expectedPattern).exec(actualText);
    });
  }

  function confirmNoPatternMatch(expectedPattern, actualText, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmNoPatternMatch",
      "regex <?> matched <?>",
      expectedPattern,
      actualText
    );
    this.verifyCondition(logMessage, function () {
      return !new RegExp(expectedPattern).exec(actualText);
    });
  }

  function confirmHiddenState(targetNode, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmHiddenState",
      "? is not hidden.",
      targetNode
    );
    this.verifyCondition(logMessage, function () {
      return targetNode.style.display == "none";
    });
  }

  function confirmInstanceType(expectedType, actualInstance, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmInstanceType",
      "<?> was not an instance of the expected type",
      actualInstance
    );
    this.verifyCondition(logMessage, function () {
      return actualInstance instanceof expectedType;
    });
  }

  function confirmNotInstanceType(expectedType, actualInstance, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmNotInstanceType",
      "<?> was an instance of the expected type",
      actualInstance
    );
    this.verifyCondition(logMessage, function () {
      return !(actualInstance instanceof expectedType);
    });
  }

  function confirmMethodExistence(targetMethod, targetObject, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmMethodExistence",
      "object doesn't possess method <?>",
      targetMethod
    );
    this.verifyCondition(logMessage, function () {
      return targetMethod in targetObject && typeof targetObject[targetMethod] == "function";
    });
  }

  function confirmExceptionRaised(exceptionKind, methodCall, logMessage) {
    logMessage = composeFeedback(
      logMessage || "confirmExceptionRaised",
      "<?> exception anticipated but none occurred",
      exceptionKind
    );
    let validationBlock = function () {
      try {
        methodCall();
        return false;
      } catch (err) {
        if (err.name == exceptionKind) return true;
        else throw err;
      }
    };
    this.verifyCondition(logMessage, validationBlock);
  }

  function confirmNoException(methodCall, logMessage) {
    try {
      methodCall();
      this.confirmTruth(true, "Anticipated no exception.");
    } catch (err) {
      logMessage = composeFeedback(
        logMessage || "confirmNoException",
        "<?> was thrown when nothing was expected.",
        err
      );
      this.failImmediately(logMessage);
    }
  }

  function isNodeVisible(targetNode) {
    targetNode = DOM.selectNode(targetNode);
    if (!targetNode.parentNode) return true;
    this.confirmNonNullity(targetNode);
    if (
      targetNode.style &&
      DOMUtil.fetchStyle(targetNode, "display") == "none"
    )
      return false;
    return isNodeVisible.call(this, targetNode.parentNode);
  }

  function confirmNodeVisible(targetNode, logMessage) {
    logMessage = composeFeedback(logMessage, "? was not visible.", targetNode);
    this.verifyCondition(logMessage, function () {
      return isNodeVisible.call(this, targetNode);
    });
  }

  function confirmNodeHidden(targetNode, logMessage) {
    logMessage = composeFeedback(
      logMessage,
      "? was not hidden and lacked a hidden parent.",
      targetNode
    );
    this.verifyCondition(logMessage, function () {
      return !isNodeVisible.call(this, targetNode);
    });
  }

  function confirmNodesMatch() {
    let logMessage,
      isPassing = true,
      evaluationExpressions = List.from(arguments),
      nodeCollection = List.from(evaluationExpressions.shift());
    if (nodeCollection.length != evaluationExpressions.length) {
      logMessage = composeFeedback(
        "confirmNodesMatch",
        "size mismatch: ? nodes, ? expressions (?).",
        nodeCollection.length,
        evaluationExpressions.length,
        evaluationExpressions
      );
      this.failImmediately(logMessage);
      isPassing = false;
    }
    nodeCollection.zip(evaluationExpressions).every(
      function (itemPair, itemIndex) {
        let currentElement = DOM.selectNode(itemPair.first()),
          currentExpression = itemPair.last();
        if (currentElement.match(currentExpression)) return true;
        logMessage = composeFeedback(
          "confirmNodesMatch",
          "At index <?>: expected <?> but received ?",
          itemIndex,
          currentExpression,
          currentElement
        );
        this.failImmediately(logMessage);
        isPassing = false;
      }.attachContext(this)
    );

    if (isPassing) this.confirmTruth(true, "Anticipated all nodes to match.");
  }

  function confirmSingleNodeMatch(targetNode, evaluationExpression, logMessage) {
    this.confirmNodesMatch([targetNode], evaluationExpression);
  }

  return {
    composeFeedback: composeFeedback,
    failImmediately: failImmediately,
    verifyCondition: verifyCondition,
    confirmTruth: confirmTruth,
  };
})();