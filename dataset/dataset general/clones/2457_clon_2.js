// Function responsible for orchestrating the initial display setup upon page load.
function initializeDisplay() {

  // Asynchronously retrieve details about the currently active browser tab.
  browserAPI.tabs.getSelected(
    null,
    function (currentTabInfo) {

      // Access the background page's data store to fetch comprehensive analysis results
      // pertaining to the current tab, identified by its unique ID.
      const pageAnalysisResult = browserAPI.extension.getBackgroundPage().techObservationCache[currentTabInfo.uniqueId];

      // Original code had a console.log(data) here, which is now removed per Type II requirements.

      // Conditional block for rendering Internet Protocol (IP) information.
      if (pageAnalysisResult['internetProtocolDetails']) {
        const tableRowElement = domRoot.createElement('tr');
        let cellOne = domRoot.createElement('td');
        cellOne.innerHTML = "<strong>";
        cellOne.innerHTML += browserAPI.i18n.getMessage("ip"); // Fetch localized string for "ip".
        cellOne.innerHTML += "</strong>";

        let cellTwo = domRoot.createElement('td');
        // The original line to display raw IP was commented out; this line displays country flag.
        cellTwo.innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"flags/" + pageAnalysisResult['internetProtocolDetails']['CountryIdentifier'].toLowerCase() + ".gif\">";

        let cellThree = domRoot.createElement('td');
        // The original line to display full location was commented out; this combines IP and location.
        cellThree.innerHTML = pageAnalysisResult['internetProtocolDetails']['IpAddress'] + "/" + pageAnalysisResult['internetProtocolDetails']['CityName'] + ", " + pageAnalysisResult['internetProtocolDetails']['RegionLabel'] + ", " + pageAnalysisResult['internetProtocolDetails']['CountryLabel'];

        tableRowElement.appendChild(cellOne);
        tableRowElement.appendChild(cellTwo);
        tableRowElement.appendChild(cellThree);
        domRoot.getElementById("detail").appendChild(tableRowElement);
      }

      // Conditional block for rendering detected web technology details.
      if (pageAnalysisResult['webTech']) {
        const tableRowElement = domRoot.createElement('tr');
        let cellOne = domRoot.createElement('td');
        cellOne.innerHTML = "<strong>";
        cellOne.innerHTML += browserAPI.i18n.getMessage("webTechnology"); // Fetch localized string for "webTechnology".
        cellOne.innerHTML += "</strong>";

        let cellTwo = domRoot.createElement('td');
        if (pageAnalysisResult['webTech'].resourceLink) {
          // Original commented out HTML for linked technology.
          cellTwo.innerHTML = "<a href=\"" + pageAnalysisResult['webTech'].resourceLink + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['webTech'].visualRepresentation + "\" title=\"" + pageAnalysisResult['webTech'].descriptiveName + "\"></a>";
        } else {
          cellTwo.innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['webTech'].visualRepresentation + "\" title=\"" + pageAnalysisResult['webTech'].descriptiveName + "\">";
        }

        let cellThree = domRoot.createElement('td');
        if (pageAnalysisResult['webTech'].outcomeData) {
          cellThree.innerHTML = pageAnalysisResult['webTech'].outcomeData[0];
        } else {
          cellThree.innerHTML = pageAnalysisResult['webTech'].descriptiveName;
        }

        tableRowElement.appendChild(cellOne);
        tableRowElement.appendChild(cellTwo);
        tableRowElement.appendChild(cellThree);
        domRoot.getElementById("detail").appendChild(tableRowElement);
      }

      // Conditional block for rendering web server information.
      if (pageAnalysisResult['webEngine']) {
        const tableRowElement = domRoot.createElement('tr');
        let cellOne = domRoot.createElement('td');
        cellOne.innerHTML = "<strong>";
        cellOne.innerHTML += browserAPI.i18n.getMessage("webserver"); // Fetch localized string for "webserver".
        cellOne.innerHTML += "</strong>";

        let cellTwo = domRoot.createElement('td');
        if (pageAnalysisResult['webEngineDetails'].resourceLink) {
          // Original commented out HTML for linked webserver.
          cellTwo.innerHTML = "<a href=\"" + pageAnalysisResult['webEngineDetails'].resourceLink + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['webEngineDetails'].visualRepresentation + "\" title=\"" + pageAnalysisResult['webEngineDetails'].descriptiveName + "\"></a>";
        } else {
          cellTwo.innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['webEngineDetails'].visualRepresentation + "\" title=\"" + pageAnalysisResult['webEngineDetails'].descriptiveName + "\">";
        }

        let cellThree = domRoot.createElement('td');
        if (pageAnalysisResult['webEngineDetails'].outcomeData) {
          cellThree.innerHTML = pageAnalysisResult['webEngineDetails'].outcomeData[0];
        } else {
          cellThree.innerHTML = pageAnalysisResult['webEngineDetails'].descriptiveName;
        }

        tableRowElement.appendChild(cellOne);
        tableRowElement.appendChild(cellTwo);
        tableRowElement.appendChild(cellThree);
        domRoot.getElementById("detail").appendChild(tableRowElement);
      }

      // Conditional block for rendering operating system details.
      if (pageAnalysisResult['operatingSystem']) {
        const tableRowElement = domRoot.createElement('tr');
        let cellOne = domRoot.createElement('td');
        cellOne.innerHTML = "<strong>";
        cellOne.innerHTML += browserAPI.i18n.getMessage("os"); // Fetch localized string for "os".
        cellOne.innerHTML += "</strong>";

        let cellTwo = domRoot.createElement('td');
        if (pageAnalysisResult['operatingSystem'].resourceLink) {
          // Original commented out HTML for linked OS.
          cellTwo.innerHTML = "<a href=\"" + pageAnalysisResult['operatingSystem'].resourceLink + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['operatingSystem'].visualRepresentation + "\" title=\"" + pageAnalysisResult['operatingSystem'].descriptiveName + "\"></a>";
        } else {
          cellTwo.innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['operatingSystem'].visualRepresentation + "\" title=\"" + pageAnalysisResult['operatingSystem'].descriptiveName + "\">";
        }

        let cellThree = domRoot.createElement('td');
        if (pageAnalysisResult['operatingSystem'].outcomeData) {
          cellThree.innerHTML = pageAnalysisResult['operatingSystem'].outcomeData[0];
        } else {
          cellThree.innerHTML = pageAnalysisResult['operatingSystem'].descriptiveName;
        }

        tableRowElement.appendChild(cellOne);
        tableRowElement.appendChild(cellTwo);
        tableRowElement.appendChild(cellThree);
        domRoot.getElementById("detail").appendChild(tableRowElement);
      }

      // Conditional block for rendering client-side library information.
      // Checks if the array of client-side libraries is not empty.
      if (pageAnalysisResult['clientSideLibraries'].length !== 0) {
        const tableRowElement = domRoot.createElement('tr');
        let cellOne = domRoot.createElement('td');
        cellOne.innerHTML = "<strong>";
        cellOne.innerHTML += browserAPI.i18n.getMessage("frontLibraries"); // Fetch localized string for "frontLibraries".
        cellOne.innerHTML += "</strong>";

        let cellTwo = domRoot.createElement('td');
        cellTwo.setAttribute("colspan", "2"); // Span two columns for the list of libraries.
        for (const idx in pageAnalysisResult['clientSideLibraries']) {
          if (pageAnalysisResult['clientSideLibraries'][idx].resourceLink) {
            // Original commented out HTML for linked library.
            cellTwo.innerHTML += "<a href=\"" + pageAnalysisResult['clientSideLibraries'][idx].resourceLink + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['clientSideLibraries'][idx].visualRepresentation + "\" title=\"" + pageAnalysisResult['clientSideLibraries'][idx].descriptiveName + "\" />&nbsp;" + pageAnalysisResult['clientSideLibraries'][idx].descriptiveName + "</a>&nbsp;&nbsp;";
          } else {
            cellTwo.innerHTML += "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['clientSideLibraries'][idx].visualRepresentation + "\" />&nbsp;" + pageAnalysisResult['clientSideLibraries'][idx].descriptiveName + "&nbsp;&nbsp;";
          }
        }

        tableRowElement.appendChild(cellOne);
        tableRowElement.appendChild(cellTwo);
        domRoot.getElementById("detail").appendChild(tableRowElement);
      }

      // Conditional block for rendering web application framework information.
      // Checks if the array of web apps is not empty.
      if (pageAnalysisResult['applicationFrameworks'].length !== 0) {
        const tableRowElement = domRoot.createElement('tr');
        let cellOne = domRoot.createElement('td');
        cellOne.innerHTML = "<strong>";
        cellOne.innerHTML += browserAPI.i18n.getMessage("webApps"); // Fetch localized string for "webApps".
        cellOne.innerHTML += "</strong>";

        let cellTwo = domRoot.createElement('td');
        cellTwo.setAttribute("colspan", "2"); // Span two columns for the list of applications.
        for (const idx in pageAnalysisResult['applicationFrameworks']) {
          if (pageAnalysisResult['applicationFrameworks'][idx].resourceLink) {
            // Original commented out HTML for linked application.
            cellTwo.innerHTML += "<a href=\"" + pageAnalysisResult['applicationFrameworks'][idx].resourceLink + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['applicationFrameworks'][idx].visualRepresentation + "\" title=\"" + pageAnalysisResult['applicationFrameworks'][idx].descriptiveName + "\" />&nbsp;" + pageAnalysisResult['applicationFrameworks'][idx].descriptiveName + "</a>&nbsp;&nbsp;";
          } else {
            cellTwo.innerHTML += "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + pageAnalysisResult['applicationFrameworks'][idx].visualRepresentation + "\" />&nbsp;" + pageAnalysisResult['applicationFrameworks'][idx].descriptiveName + "&nbsp;&nbsp;";
          }
        }

        tableRowElement.appendChild(cellOne);
        tableRowElement.appendChild(cellTwo);
        domRoot.getElementById("detail").appendChild(tableRowElement);
      }
    }
  );
}

// Function to make raw HTTP headers visible.
function revealHeaders() {
  browserAPI.tabs.getSelected(
    null,
    function (currentTabInfo) {
      const pageAnalysisResult = browserAPI.extension.getBackgroundPage().techObservationCache[currentTabInfo.uniqueId];
      if (pageAnalysisResult['rawHTTPHeaders']) {
        domRoot.getElementById('debugConsole').innerText = pageAnalysisResult['rawHTTPHeaders'];
        domRoot.getElementById('debugConsole').style.display = ""; // Set display to default (visible).
        domRoot.getElementById('headerToggleBtn').innerHTML = "<i class=\"icon-eye-close\"></i>"; // Update icon to 'hide headers'.
        domRoot.getElementById('headerToggleBtn').removeEventListener('click', revealHeaders); // Remove current event listener.
        domRoot.getElementById('headerToggleBtn').addEventListener('click', concealHeaders); // Add new event listener for hiding headers.
      }
    }
  );
}

// Function to hide raw HTTP headers.
function concealHeaders() {
  browserAPI.tabs.getSelected(
    null,
    function (currentTabInfo) {
      domRoot.getElementById('debugConsole').style.display = "none"; // Hide the debug console element.
      domRoot.getElementById('headerToggleBtn').innerHTML = "<i class=\"icon-eye-open\"></i>"; // Update icon to 'show headers'.
      domRoot.getElementById('headerToggleBtn').removeEventListener('click', concealHeaders); // Remove current event listener.
      domRoot.getElementById('headerToggleBtn').addEventListener('click', revealHeaders); // Add new event listener for revealing headers.
    }
  );
}

// Attach event listeners to global objects and DOM elements.
globalScope.addEventListener('load', initializeDisplay); // Execute initializeDisplay when the window finishes loading.
domRoot.getElementById('headerToggleBtn').addEventListener('click', revealHeaders); // Attach click handler to the header toggle button.

// Update inner text and attributes of various UI elements with localized strings.
domRoot.getElementById('categoryTabElement').innerText = browserAPI.i18n.getMessage("tabCategory");
domRoot.getElementById('techTabElement').innerText = browserAPI.i18n.getMessage("tabTechnology");
domRoot.getElementById('detailTabElement').innerText = browserAPI.i18n.getMessage("tabDetail");
domRoot.getElementById('optionsButton').setAttribute("title", browserAPI.i18n.getMessage("btnOptions"));
domRoot.getElementById('headerToggleBtn').setAttribute("title", browserAPI.i18n.getMessage("toggleHeaderButton"));
domRoot.getElementById('cloudSearchButton').setAttribute("title", browserAPI.i18n.getMessage("btnCloudSearch"));
// The original line for 'btnSource' was commented out and is now removed.
domRoot.getElementById('issueReportButton').setAttribute("title", browserAPI.i18n.getMessage("btnIssue"));