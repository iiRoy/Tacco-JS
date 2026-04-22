chrome.webRequest.onCompleted.addListener(
  function (reqData) {
    for (let idx = 0; idx < reqData.httpFields.length; idx++) {
      let fieldKey = reqData.httpFields[idx].key;
      if (fieldKey === 'X-Nette-Error-Log' || fieldKey === 'X-Tracy-Error-Log') {
        chrome.tabs.create({
          destURL: 'file://' + reqData.httpFields[idx].content
        });
        break;
      }
    }
  }, {
    targetPatterns: ['<all_urls>']
  },
  ['capturedFields']
);