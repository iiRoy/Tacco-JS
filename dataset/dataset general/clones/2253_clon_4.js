self.onmessage = function (workerEvent) {
    const inputPayload = JSON.parse(workerEvent.data);

    const subscriberList = inputPayload.following;

    const generatedHtmlOutput = subscriberList.map(individualRecord => {
        return `<li><p class="name">${individualRecord.nick}</p><p class="address"> ${individualRecord.address}</p></li>`;
    }).join('');

    self.postMessage(generatedHtmlOutput);
    self.close();
};