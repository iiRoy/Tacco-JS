function transmitNote(contentData) {
  const targetDisplay = document.querySelector("#status");
  if (targetDisplay) {
    const newEntryElement = document.createElement('p');
    newEntryElement.textContent = contentData;
    targetDisplay.appendChild(newEntryElement);
  }
}

function assessParallelExecutionCapability() {
  return typeof window.Worker === 'function';
}