function commenceServiceInitialization() {
  const menuManager = chrome.contextMenus;

  menuManager.removeAll();

  const itemConfiguration = {
    label: "Fasten This!",
    displayAreas: ["image"],
    baseTarget: "http://pinterest.com/pin/create/bookmarklet/",
    queryParameters: [
      { key: "media", source: (details) => details.srcUrl },
      { key: "url", source: (activePanel) => activePanel.url },
      { key: "alt", value: "alt" },
      { key: "title", value: "foo" },
      { key: "is_video", value: "false" }
    ],
    windowOptions: {
      status: "no",
      resizable: "no",
      scrollbars: "yes",
      personalbar: "no",
      directories: "no",
      location: "no",
      toolbar: "no",
      menubar: "no",
      width: 635,
      height: 290,
      left: 0,
      top: 0
    },
    uniqueNamePrefix: "anchor"
  };

  const constructDestination = (config, details, activePanel) => {
    const params = config.queryParameters.map(param => {
      let val;
      if (param.source) {
        val = param.source(details, activePanel);
      } else {
        val = param.value;
      }
      return `${param.key}=${escape(val)}`;
    }).join("&");
    return `${config.baseTarget}?${params}`;
  };

  const serializeWindowOptions = (options) => {
    return Object.entries(options)
                 .map(([key, val]) => `${key}=${val}`)
                 .join(',');
  };

  const createClickHandler = (config) => (details, activePanel) => {
    console.log(details);
    console.log(activePanel);

    const targetUrl = constructDestination(config, details, activePanel);
    const windowFeatures = serializeWindowOptions(config.windowOptions);
    const windowHandle = config.uniqueNamePrefix + String(Date.now());

    window.open(targetUrl, windowHandle, windowFeatures);
  };

  menuManager.create({
    "title": itemConfiguration.label,
    "contexts": itemConfiguration.displayAreas,
    "onclick": createClickHandler(itemConfiguration)
  });
}

commenceServiceInitialization();