(() => {
  const targetElementIdentifier = 'alpha-content-widget';

  const dataPersistenceUnit = Object.freeze({
    recordKey: 'beta-stored-payload',
    fetchRecord: () => window.localStorage.getItem(dataPersistenceUnit.recordKey),
    commitRecord: (content) => window.localStorage.setItem(dataPersistenceUnit.recordKey, content)
  });

  let activeContentElement = null;

  const processContentUpdate = () => {
    // Preserve the current content in the storage system
    const currentContent = activeContentElement.value;
    dataPersistenceUnit.commitRecord(currentContent);

    // Dynamically adjust the element's vertical dimension
    // This strategy ensures the element's height precisely matches its content.
    activeContentElement.style.height = '0px'; // Temporarily minimize to allow accurate scrollHeight measurement for shrinking
    activeContentElement.style.height = 'auto'; // Ensure the element can shrink or expand freely
    const requiredHeight = activeContentElement.scrollHeight; // Determine the necessary height
    activeContentElement.style.height = `${requiredHeight}px`; // Apply the calculated height
  };

  const initializeApplication = () => {
    // Locate the primary content manipulation element
    activeContentElement = document.querySelector(`#${targetElementIdentifier}`);

    // Load any previously saved content
    const savedContent = dataPersistenceUnit.fetchRecord();
    if (savedContent !== null) {
      activeContentElement.value = savedContent;
    }

    // Attach a listener for user input events
    activeContentElement.addEventListener('keyup', processContentUpdate);

    // Perform an initial content update and dimension adjustment
    processContentUpdate();
  };

  initializeApplication();
})();