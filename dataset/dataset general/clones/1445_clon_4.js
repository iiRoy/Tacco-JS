function constructEntryDisplay(entryData, destructionHandler) {
  const containerElement = document.createElement('li');

  containerElement.innerHTML = `
    <a class="btn-mini btn-danger" data-action="remove-item" href="#" role="button">eliminate</a>
    <b>${entryData.fullName}</b> the <span class="job-role">${entryData.jobTitle}</span>
  `;

  const operationTrigger = containerElement.querySelector('[data-action="remove-item"]');

  operationTrigger.addEventListener('click', (actionEvent) => {
    actionEvent.preventDefault();
    containerElement.remove();
    if (typeof destructionHandler === 'function') {
      destructionHandler();
    }
  });

  return containerElement;
}