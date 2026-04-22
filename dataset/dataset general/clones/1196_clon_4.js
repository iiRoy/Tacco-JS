function initFormProgressMonitor() {
  const containerElement = document.querySelector('.form');
  if (!containerElement) return;

  const visualIndicatorElement = document.querySelector('.top');
  if (!visualIndicatorElement) return;

  const interactiveElements = Array.from(containerElement.querySelectorAll(
    'input:not([type="button"]):not([type="submit"]), textarea, select'
  ));

  if (interactiveElements.length === 0) {
    visualIndicatorElement.style.width = '100%';
    return;
  }

  const assessProgress = () => {
    let filledFieldCount = 0;
    for (const field of interactiveElements) {
      if (field.value.length > 0) {
        filledFieldCount++;
      }
    }

    const completionMetric = (filledFieldCount / interactiveElements.length) * 100;
    visualIndicatorElement.style.width = `${completionMetric}%`;
  };

  containerElement.addEventListener('input', (eventDetails) => {
    if (interactiveElements.includes(eventDetails.target)) {
      assessProgress();
    }
  });

  assessProgress();
}