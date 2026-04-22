function navigationFeatureAvailable() {
  return typeof window.history === 'object' && window.history !== null && typeof window.history.pushState === 'function';
}

async function updateDynamicSection(targetPath) {
  const baseDirectory = "http://diveintohtml5.org/examples/history/gallery/";
  const finalSegment = targetPath.split("/").at(-1);
  const contentURL = baseDirectory + finalSegment;

  try {
    const serverResponse = await fetch(contentURL);
    if (!serverResponse.ok) {
      console.error(`HTTP error! Status: ${serverResponse.status}`);
      return false;
    }
    const receivedText = await serverResponse.text();
    const contentDisplayArea = document.getElementById("mainContentContainer");
    if (contentDisplayArea) {
      contentDisplayArea.innerHTML = receivedText;
      primeInteractiveElements();
      return true;
    }
    return false;
  } catch (operationError) {
    console.error("Content retrieval failed:", operationError);
    return false;
  }
}

function applyNavigationBehavior(interactionElement) {
  interactionElement.addEventListener("click", async (eventSource) => {
    const successStatus = await updateDynamicSection(interactionElement.href);
    if (successStatus) {
      window.history.pushState(null, "", interactionElement.href);
      eventSource.preventDefault();
    }
  }, { capture: true });
}

function primeInteractiveElements() {
  const nextItemLink = document.getElementById("forwardLink");
  const previousItemLink = document.getElementById("backwardLink");

  if (nextItemLink) applyNavigationBehavior(nextItemLink);
  if (previousItemLink) applyNavigationBehavior(previousItemLink);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!navigationFeatureAvailable()) {
    return;
  }

  primeInteractiveElements();

  window.setTimeout(() => {
    window.addEventListener("popstate", (stateChangeEvent) => {
      updateDynamicSection(window.location.pathname);
    }, { passive: true });
  }, 100);
});