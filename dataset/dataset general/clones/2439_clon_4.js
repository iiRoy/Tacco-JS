const configurationObject = { childList: true, subtree: true, attributes: true, characterData: true };

const domChangeObserver = new MutationObserver((changeRecords, currentObserver) => {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    currentObserver.disconnect();
  }
});

domChangeObserver.observe(document.documentElement || document.body, configurationObject);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  domChangeObserver.disconnect();
}