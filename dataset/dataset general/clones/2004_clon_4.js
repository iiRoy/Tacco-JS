let isLoggingEnabled = true;

function devConsoleLog(messageContent) {
  if (window.console && isLoggingEnabled) {
    console.log(messageContent);
  }
}

function extractQueryValue(parameterName) {
  const queryPattern = new RegExp("[\\?&]" + parameterName + "=([^&#]*)", "i");
  const matchResult = queryPattern.exec(parent.location.search);
  return matchResult ? decodeURIComponent(matchResult[1].replace(/\+/g, ' ')) : "";
}

document.addEventListener('DOMContentLoaded', () => {

  const OPERATION_MODE_FULL = "full";
  const OPERATION_MODE_PARTIAL = "partial";
  const OPERATION_MODE_GENERATE = "generate";

  const currentOperationMode = OPERATION_MODE_FULL;

  let successfulCases = 0;
  let unsuccessfulCases = 0;

  const processedResults = [];

  const htmlRootElement = document.documentElement;

  const navigatorInfoContainer = document.createElement('h1');
  const userAgentDiv = document.createElement('div');
  userAgentDiv.className = 'user_agent';
  userAgentDiv.textContent = 'Your UA string: ' + navigator.userAgent;
  const classesDiv = document.createElement('div');
  classesDiv.className = 'generated_classes';
  classesDiv.textContent = 'Your HTML classes: ' + htmlRootElement.className;
  navigatorInfoContainer.appendChild(userAgentDiv);
  navigatorInfoContainer.appendChild(classesDiv);

  if (currentOperationMode === OPERATION_MODE_FULL) {
    htmlRootElement.classList.add("full_test");
  }

  user_agent_strings.forEach((entryItem, entryIndex) => {
    const agentString = entryItem[0];
    const expectedClassSet = entryItem[1];
    let computedClassSet = css_browser_selector(agentString);

    computedClassSet = computedClassSet
      .replace(/ ?orientation_\w+/g, "")
      .replace(/ [min|max|cl]+[w|h]_\d+/g, "")
      .replace(/\s(no-)?hidpi/, "");

    devConsoleLog("|" + computedClassSet + "|");

    let currentResultElement;
    let generateOutputString = '';

    switch (currentOperationMode) {
      case OPERATION_MODE_GENERATE:
        generateOutputString += (expectedClassSet === "header" ? '<br /><br />' : '<br />');
        generateOutputString += '\t["' + agentString + '","' + ((expectedClassSet === "header") ? expectedClassSet : computedClassSet) + '"]';
        generateOutputString += (entryIndex < user_agent_strings.length - 1 ? ',' : '');
        generateOutputString += (expectedClassSet === "header" ? '<br />' : '');
        processedResults.push(generateOutputString);
        break;

      case OPERATION_MODE_PARTIAL:
      case OPERATION_MODE_FULL:
        currentResultElement = document.createElement('div');
        let resultClass = (expectedClassSet === "header") ? expectedClassSet : "result partial";
        currentResultElement.className = resultClass;

        const headerElement = document.createElement('h3');
        headerElement.textContent = agentString;
        currentResultElement.appendChild(headerElement);

        if (expectedClassSet !== "header") {
          const returnedDiv = document.createElement('div');
          returnedDiv.className = 'returned';
          returnedDiv.textContent = 'generated: ' + computedClassSet;
          currentResultElement.appendChild(returnedDiv);
        }

        if (currentOperationMode === OPERATION_MODE_FULL && expectedClassSet !== "header") {
          if (expectedClassSet === computedClassSet) {
            currentResultElement.classList.remove('partial');
            currentResultElement.classList.add('pass');
            successfulCases++;
          } else {
            currentResultElement.classList.remove('partial');
            currentResultElement.classList.add('fail');
            unsuccessfulCases++;

            const expectedDiv = document.createElement('div');
            expectedDiv.className = 'expected';
            expectedDiv.textContent = 'expected: ' + expectedClassSet;
            currentResultElement.appendChild(expectedDiv);

            const gotDiv = document.createElement('div');
            gotDiv.className = 'got';
            gotDiv.textContent = 'got: ' + computedClassSet;
            currentResultElement.appendChild(gotDiv);
          }
        }
        processedResults.push(currentResultElement);
        break;
    }
  });

  const mainContainer = document.createElement('div');
  mainContainer.id = 'container';

  mainContainer.appendChild(navigatorInfoContainer);

  const resultsSection = document.createElement('div');
  resultsSection.id = 'results';

  if (currentOperationMode === OPERATION_MODE_GENERATE) {
    const preFormattedOutput = document.createElement('pre');
    preFormattedOutput.textContent = processedResults.join('');
    resultsSection.appendChild(preFormattedOutput);
  } else {
    if (currentOperationMode === OPERATION_MODE_FULL) {
      const successfulHeader = document.createElement('h2');
      successfulHeader.className = 'pass passed';
      successfulHeader.textContent = successfulCases + ' tests passed';
      mainContainer.appendChild(successfulHeader);

      const unsuccessfulHeader = document.createElement('h2');
      unsuccessfulHeader.className = 'fail failed';
      unsuccessfulHeader.textContent = unsuccessfulCases + ' tests failed';
      mainContainer.appendChild(unsuccessfulHeader);
    }

    processedResults.forEach(element => {
      resultsSection.appendChild(element);
    });

    const resultElementsForStyling = resultsSection.querySelectorAll('.result');
    resultElementsForStyling.forEach((element, index) => {
      if (index % 2 !== 0) {
        element.classList.add('odd');
      }
    });
  }

  mainContainer.appendChild(resultsSection);
  document.body.appendChild(mainContainer);

});