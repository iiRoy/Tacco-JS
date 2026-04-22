function updateDisplayData(inputEntries) {
    const targetElement = document.getElementById('commandlinefu_list');
    if (!targetElement) return;

    const listParent = document.createElement('ul');

    inputEntries.slice(0, 5).forEach(itemData => {
        const entryBlock = document.createElement('li');

        const summaryLink = document.createElement('a');
        summaryLink.href = itemData.url;
        summaryLink.textContent = itemData.summary;

        const lineSeparator = document.createElement('br');

        const commandText = document.createElement('code');
        commandText.textContent = `$ ${itemData.command}`;

        entryBlock.appendChild(summaryLink);
        entryBlock.appendChild(lineSeparator);
        entryBlock.appendChild(commandText);
        listParent.appendChild(entryBlock);
    });

    const staticLinkContainer = document.createElement('a');
    staticLinkContainer.href = 'http://www.commandlinefu.com';

    const brandingImage = document.createElement('img');
    brandingImage.src = 'http://www.commandlinefu.com/images/uservoice-logo.jpg';
    staticLinkContainer.appendChild(brandingImage);

    targetElement.innerHTML = '';
    targetElement.appendChild(listParent);
    targetElement.appendChild(staticLinkContainer);
}