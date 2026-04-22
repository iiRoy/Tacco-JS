// This script initializes the browser-like application upon document loading.
document.addEventListener('DOMContentLoaded', function() {
  // Array to hold all active browser panels.
  let appWindowPanes = [];
  // Index indicating the currently displayed group of panels.
  let currentPaneGroupIndex = 0;

  /**
   * Represents a single browser panel or tab within the application.
   * @param {string} pageAddress - The initial URL/address for this panel.
   */
  const WebAppPanel = function(pageAddress) {
    this.pageAddress = pageAddress;

    // Create a visual indicator for loading status.
    const loaderIndicator = document.createElement("div");
    loaderIndicator.classList.add("icon-base");
    loaderIndicator.classList.add("icon-spinner-rotating");
    loaderIndicator.classList.add("panel-loader-icon");
    this.rotationProgress = 0; // Tracks rotation for the spinner.
    this.animationIntervalId = null; // ID for the spinner animation interval.
    this.loaderIndicator = loaderIndicator;

    // Create a button to close the panel.
    const terminateButton = document.createElement("div");
    terminateButton.classList.add("icon-base");
    terminateButton.classList.add("icon-close-cross");
    terminateButton.classList.add("panel-exit-icon");
    terminateButton.onclick = function(eventObject) {
      this.dispose(); // Close this panel.
      eventObject.stopPropagation(); // Prevent event bubbling.
    }.bind(this);

    // Create a text node for the panel's title.
    this.displayTitleNode = document.createTextNode(pageAddress);
    const captionContainer = document.createElement("div");
    captionContainer.classList.add("panel-caption");
    captionContainer.appendChild(this.displayTitleNode);

    // Create the main header element for the panel.
    const panelElement = document.createElement("li");
    panelElement.classList.add("browser-panel");
    panelElement.appendChild(loaderIndicator);
    panelElement.appendChild(captionContainer);
    panelElement.appendChild(terminateButton);
    panelElement.onclick = function() {
      const previousActivePanel = retrieveActivePanel();
      if (previousActivePanel !== this) {
        previousActivePanel.makeInactive();
        this.makeActive();
      }
    }.bind(this);

    // Method to begin the loading animation.
    this.beginLoadingAnimation = function() {
      this.haltLoadingAnimation(); // Stop any existing animation first.

      this.animationIntervalId = setInterval(() => {
        this.loaderIndicator.style.transform = `rotate(${this.rotationProgress}turn)`;
        this.rotationProgress += 0.01;
      }, 17); // Approximately 60 FPS (1000ms / 60 frames ≈ 16.67ms)
    }
    // Method to stop the loading animation.
    this.haltLoadingAnimation = function() {
      if (this.animationIntervalId !== null) {
        clearInterval(this.animationIntervalId);
        this.animationIntervalId = null;
      }
    }

    // Create the iframe for displaying web content.
    const webContentFrame = document.createElement("iframe");
    webContentFrame.src = pageAddress;
    webContentFrame.mozbrowser = true; // Enable experimental browser features.
    webContentFrame.classList.add("content-display-area");

    if (!webContentFrame.mozbrowser) {
      systemLog.output("!!!!! Browser frame creation failed - is experimental mode (-e) enabled? !!!!!");
      applicationWindow.terminate(); // Exit application if feature is missing.
    }

    // Event listener for when content loading starts.
    webContentFrame.addEventListener("mozbrowserloadstart", function(eventObject) {
      this.beginLoadingAnimation();
    }.bind(this));

    // Event listener for when content loading finishes.
    webContentFrame.addEventListener("mozbrowserloadend", function(eventObject) {
      this.haltLoadingAnimation();
    }.bind(this));

    // Event listener for title changes within the iframe.
    webContentFrame.addEventListener("mozbrowsertitlechange", function(eventObject) {
      this.displayTitleNode.nodeValue = eventObject.detail;
      refreshUserInterface();
    }.bind(this));

    // Event listener for URL changes within the iframe.
    webContentFrame.addEventListener("mozbrowserlocationchange", function(eventObject) {
      this.pageAddress = eventObject.detail;
      refreshUserInterface();
    }.bind(this));

    // Append the iframe to the main content area.
    const mainContentArea = document.getElementById("main-content-area");
    mainContentArea.appendChild(webContentFrame);

    this.panelElement = panelElement;
    this.webContentFrame = webContentFrame;

    // Method to close and dispose of this panel.
    this.dispose = function() {
      removePanel(this);
    }
    // Checks if this panel is currently active.
    this.isCurrentlyActive = function() {
      return this.panelElement.classList.contains("panel-active-status");
    };
    // Activates this panel, making it visible and current.
    this.makeActive = function() {
      this.panelElement.classList.add("panel-active-status");
      this.webContentFrame.classList.remove("visually-concealed");
      // Determine the correct panel group to display.
      for(let panelIndex in appWindowPanes) {
        if(appWindowPanes[panelIndex] === this) {
          currentPaneGroupIndex = Math.floor(panelIndex / calculateMaxVisiblePanels());
          break;
        }
      }
      refreshUserInterface();
    };
    // Deactivates this panel, hiding its content and header.
    this.makeInactive = function() {
      this.webContentFrame.classList.add("visually-concealed");
      this.panelElement.classList.remove("panel-active-status");
    };
    // Hides the panel's header element.
    this.concealPanelHeader = function() {
      this.panelElement.classList.add("visually-concealed");
    }
    // Shows the panel's header element.
    this.revealPanelHeader = function() {
      this.panelElement.classList.remove("visually-concealed");
    }
    // Reloads the content within the panel's iframe.
    this.refreshContent = function() {
      try {
        this.webContentFrame.reload();
      }
      catch (error) {
        systemLog.output("Error: iframe.reload not yet implemented.");
      }
    }
    // Navigates the panel's iframe forward in history.
    this.navigateForward = function() {
      try {
        this.webContentFrame.goForward();
      }
      catch (error) {
        systemLog.output("Error: goForward feature missing - experimental mode (-e) likely required.");
        applicationWindow.terminate();
      }
      refreshUserInterface();
    }
    // Navigates the panel's iframe backward in history.
    this.navigateBackward = function() {
      try {
        this.webContentFrame.goBack();
      }
      catch (error) {
        systemLog.output("Error: goBack feature missing - experimental mode (-e) likely required.");
        applicationWindow.terminate();
      }
      refreshUserInterface();
    }
    // Loads a new URL into the panel's iframe.
    this.loadResource = function(newAddress) {
      const normalizedAddress = newAddress.toLowerCase();

      if (normalizedAddress.indexOf("http://") === -1 &&
        normalizedAddress.indexOf("https://") === -1) {
        newAddress = "http://" + newAddress;
      }

      this.webContentFrame.src = newAddress;
    }
  } // End of WebAppPanel constructor.

  // Function to create a new panel and add it to the display.
  const createAndAppendPanel = function(initialAddress) {
    const newPanel = new WebAppPanel(initialAddress);
    appWindowPanes.push(newPanel);
    newPanel.makeActive();

    const addNewPanelButton = document.getElementById("add-new-panel-button");
    const panelHeaderContainer = document.getElementById("panel-header-container");
    panelHeaderContainer.insertBefore(newPanel.panelElement, addNewPanelButton);

    return newPanel;
  }

  // Retrieves the currently active panel from the global list.
  const retrieveActivePanel = function() {
    for (let panelIndex = 0; panelIndex < appWindowPanes.length; ++panelIndex) {
      const currentPanel = appWindowPanes[panelIndex];
      if (currentPanel.isCurrentlyActive()) {
        return currentPanel;
      }
    }
    throw new Error("Application Error: No active panel found!");
  }

  // Removes a specified panel from the application.
  const removePanel = function(panelToRemove) {
    const panelIndex = appWindowPanes.indexOf(panelToRemove);
    if (panelIndex === -1) {
      throw new Error("Application Error: Panel to remove not found.");
    }
    const removedPanel = appWindowPanes.splice(panelIndex, 1)[0];
    const wasActive = removedPanel.isCurrentlyActive();
    if (wasActive) {
      removedPanel.makeInactive();
    }
    // Remove the panel's header element from the DOM.
    removedPanel.panelElement.parentNode.removeChild(removedPanel.panelElement);

    if (appWindowPanes.length === 0) {
      applicationWindow.terminate(); // Close window if no panels remain.
    } else if (wasActive) {
      // Activate an adjacent panel if the removed one was active.
      let nextActiveIndex = panelIndex - 1;
      if (nextActiveIndex < 0) {
        nextActiveIndex = 0;
      }
      const nextPanelToActivate = appWindowPanes[nextActiveIndex];
      nextPanelToActivate.makeActive();
    }
    refreshUserInterface();
  }

  // Handler for creating a new, blank panel.
  const onNewPanelRequest = function() {
    if (appWindowPanes.length > 0) {
      const previousActivePanel = retrieveActivePanel();
      previousActivePanel.makeInactive();
    }

    createAndAppendPanel("about:empty");
  }

  // Updates all UI elements based on the current application state.
  const refreshUserInterface = function() {
    const currentlyActivePanel = retrieveActivePanel();
    retrieveAddressBar().currentValue = currentlyActivePanel.pageAddress;
    document.title = currentlyActivePanel.displayTitleNode.nodeValue;

    // Only display panel headers belonging to the current group.
    const maxDisplayedPanels = calculateMaxVisiblePanels();
    const startIndex = currentPaneGroupIndex * maxDisplayedPanels
    const endIndex = startIndex + maxDisplayedPanels;
    for(let panelIndex in appWindowPanes) {
      if(panelIndex < startIndex || panelIndex >= endIndex){
        appWindowPanes[panelIndex].concealPanelHeader();
      } else {
        appWindowPanes[panelIndex].revealPanelHeader();
      }
    }

    // Conceal the 'previous group' button if on the first group.
    const previousGroupButton =  document.getElementById("panel-group-previous");
    if(currentPaneGroupIndex === 0) {
      previousGroupButton.classList.add("visually-concealed");
    } else {
      previousGroupButton.classList.remove("visually-concealed");
    }

    // Conceal the 'next group' button if on the last group.
    const nextGroupButton = document.getElementById("panel-group-next");
    if(endIndex >= appWindowPanes.length) {
      nextGroupButton.classList.add("visually-concealed");
    } else {
      nextGroupButton.classList.remove("visually-concealed");
    }
  }

  // Calculates the maximum number of panel headers that can be shown.
  const calculateMaxVisiblePanels = function() {
    // TODO: Replace with more robust width calculation.
    const availableWindowWidth = document.body.clientWidth;

    // These are hardcoded values for button widths and individual panel width.
    // It calculates the available space minus fixed UI elements, divided by panel width.
    return Math.floor((availableWindowWidth - 85) / 160);
  }

  // Moves to the previous group of panels.
  const goToPreviousPanelGroup = function() {
    if(currentPaneGroupIndex === 0) {
      return; // Already at the first group.
    }
    currentPaneGroupIndex--;
    refreshUserInterface();
  }

  // Moves to the next group of panels.
  const goToNextPanelGroup = function() {
    const maxDisplayedPanels = calculateMaxVisiblePanels();
    if(appWindowPanes.length / maxDisplayedPanels <= currentPaneGroupIndex + 1) {
      return; // Already at or beyond the last group.
    }
    currentPaneGroupIndex++;
    refreshUserInterface();
  }

  // Handles the reload action for the active panel.
  const handleReloadAction = function() {
    retrieveActivePanel().refreshContent();
  }

  // Handles user input in the address bar.
  const handleNavigationAttempt = function(keyboardEvent) {
    if (keyboardEvent.keyCode === 8 || keyboardEvent.keyCode === 46) { // Backspace or Delete
      retrieveAddressBar().currentValue = "";
      keyboardEvent.preventDefault();
    } else if (keyboardEvent.keyCode === 13) { // Enter key
      const currentActivePanel = retrieveActivePanel();
      currentActivePanel.loadResource(retrieveAddressBar().currentValue);
    }
  }

  // Handles the forward navigation action.
  const handleForwardNavigation = function() {
    retrieveActivePanel().navigateForward();
  }

  // Handles the backward navigation action.
  const handleBackwardNavigation = function() {
    retrieveActivePanel().navigateBackward();
  }

  // Handles window resize events.
  const handleWindowResize = function() {
    retrieveActivePanel().makeActive(); // Re-activates to ensure UI refresh.
  }

  // Retrieves the address bar input element.
  const retrieveAddressBar = function() {
    return document.getElementById("address-input-field");
  }

  // Initialize the application with a default empty panel.
  createAndAppendPanel("about:empty");

  // Add event listener for window resizing.
  window.addEventListener("resize", handleWindowResize);
}); // End of DOMContentLoaded listener.