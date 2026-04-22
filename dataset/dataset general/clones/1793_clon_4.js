async function processWorkflowTransition(elementIdentifier, targetStageKey) {
  try {
    const postBody = new URLSearchParams({
      storyNumber: elementIdentifier,
      phase: targetStageKey,
    });

    const operationResponse = await fetch("/card/move", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postBody,
    });

    const serverReply = await operationResponse.text();
    const feedbackDisplay = document.getElementById("message");
    if (feedbackDisplay) {
      feedbackDisplay.innerHTML = serverReply;
    }
  } catch (errorDetails) {
    console.error("Task update failed:", errorDetails);
    const feedbackDisplay = document.getElementById("message");
    if (feedbackDisplay) {
      feedbackDisplay.innerHTML = "Error processing task transition: " + errorDetails.message;
    }
  }
}

function setBoardOperations() {
  const stageConfigurations = [
    { containerId: "readyPhase", designation: "ready" },
    { containerId: "devPhase", designation: "dev" },
    { containerId: "testPhase", designation: "test" },
    { containerId: "deployPhase", designation: "deploy" }
  ];

  document.querySelectorAll(".story").forEach(function(itemElement) {
    itemElement.setAttribute("draggable", "true");
    itemElement.addEventListener("dragstart", function(commenceEvent) {
      commenceEvent.dataTransfer.setData("text/plain", commenceEvent.target.id);
      commenceEvent.dataTransfer.effectAllowed = "move";
    });
  });

  stageConfigurations.forEach(function(configEntry) {
    const dropZone = document.getElementById(configEntry.containerId);
    if (dropZone) {
      dropZone.addEventListener("dragover", function(hoverEvent) {
        hoverEvent.preventDefault();
        hoverEvent.dataTransfer.dropEffect = "move";
      });

      dropZone.addEventListener("drop", function(releaseEvent) {
        releaseEvent.preventDefault();
        const draggedItemId = releaseEvent.dataTransfer.getData("text/plain");
        if (draggedItemId) {
          processWorkflowTransition(draggedItemId, configEntry.designation);
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", setBoardOperations);