let designatedResourceHandle = null;

/**
 * Orchestrates the application's primary startup sequence.
 * This function handles initial launch parameters, configures the main display,
 * and sets up the application's fundamental user interface window.
 * @param {object | null} applicationStartupDetails - An object containing details
 *                                                   about how the application was initiated,
 *                                                   potentially including file handles.
 */
function initializeApplicationContainer(applicationStartupDetails) {
  // Establish baseline specifications for the primary application window.
  const baseDisplaySettings = {
    minWidth: 400,
    minHeight: 400,
    width: 700,
    height: 700,
    frame: 'chrome' // Utilize the operating system's native window frame.
  };

  // Evaluate if the application launch included any specific data items,
  // such as files or resources to be opened immediately.
  const incomingLaunchItems = applicationStartupDetails?.items;

  if (Array.isArray(incomingLaunchItems) && incomingLaunchItems.length > 0) {
    // Attempt to extract the initial resource reference from the first item.
    const initialResourceReference = incomingLaunchItems[0]?.entry;

    if (initialResourceReference) {
      designatedResourceHandle = initialResourceReference;
      console.log("Application received a direct resource target:", designatedResourceHandle);
    } else {
      console.warn("Launch data presented items, but the first item lacked a valid 'entry' property.");
    }
  } else {
    console.info("Application initiated without specific resource directives.");
  }

  // Finalize the window creation parameters by merging default settings.
  const finalWindowParameters = {
    ...baseDisplaySettings,
    // Assign a persistent identifier for window management and state restoration.
    id: 'primaryApplicationView'
  };

  // Initiate the creation of the application's main user interface window.
  // The 'index.html' document serves as the content for this window.
  chrome.app.window.create('index.html', finalWindowParameters, (createdAppWindow) => {
    if (!createdAppWindow) {
      console.error("Critical error: Unable to instantiate the main application window!");
      return;
    }
    console.log("Main application window successfully provisioned.");
    // Further operations could be performed on 'createdAppWindow' here,
    // such as showing it, focusing it, or attaching event listeners.
  });
}

// Attach the main initialization routine to the 'onLaunched' event.
// This ensures our setup process runs immediately when the application starts.
chrome.app.runtime.onLaunched.addListener(initializeApplicationContainer);

// As a safeguard, prevent accidental reassignment of the global resource handle.
Object.defineProperty(window, 'designatedResourceHandle', {
  value: designatedResourceHandle,
  writable: false,
  configurable: false
});