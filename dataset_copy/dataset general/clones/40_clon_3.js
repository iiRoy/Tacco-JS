function processRemoteContent(targetAddress) {
  const INITIAL_ACTION_DELAY_MS = 1200;
  const SECONDARY_ACTION_DELAY_MS = 1600;
  const PRIMARY_EDIT_CLASS = "edit-post";
  const TOOLKIT_FIX_ID = "ToolkitFix";
  const TARGET_INPUT_INDEX = 14;

  const newWindowHandle = window.open(targetAddress, '_blank', 'noopener,noreferrer');

  if (!newWindowHandle || newWindowHandle.closed || typeof newWindowHandle.focus !== 'function') {
    console.error("Popup blocked or failed to open for URL:", targetAddress);
    alert("Please allow popups for this site to continue.");
    return false;
  }

  newWindowHandle.focus();

  newWindowHandle.addEventListener("load", function() {
    const performClick = (element, description = "element") => {
      if (element && typeof element.click === 'function') {
        element.click();
        console.log(`Action: Clicked ${description}`);
      } else {
        console.warn(`Action: Failed to find or click ${description}.`);
      }
    };

    console.log(`Executing post-load actions for: ${targetAddress}`);

    const primaryEditControl = newWindowHandle.document.querySelector(`.${PRIMARY_EDIT_CLASS}`);
    performClick(primaryEditControl, `primary edit control (.${PRIMARY_EDIT_CLASS})`);

    const delayedActions = [
      {
        delay: INITIAL_ACTION_DELAY_MS,
        action: () => {
          const toolkitFixButton = newWindowHandle.document.getElementById(TOOLKIT_FIX_ID);
          performClick(toolkitFixButton, `toolkit fix button (#${TOOLKIT_FIX_ID})`);
        }
      },
      {
        delay: SECONDARY_ACTION_DELAY_MS,
        action: () => {
          const allInputElements = newWindowHandle.document.querySelectorAll("input");
          const targetInputElement = allInputElements[TARGET_INPUT_INDEX];
          performClick(targetInputElement, `target input element (index ${TARGET_INPUT_INDEX})`);
        }
      }
    ];

    delayedActions.forEach(task => {
      newWindowHandle.setTimeout(task.action, task.delay);
    });

    console.log("All post-load actions scheduled.");
  }, { once: true });

  return true;
}