const appConstants = {
  domElementIds: {
    displayMain: 'detail',
    diagnosticOutput: 'debug',
    toggleHeaderVisibility: 'show_header',
    categoryTab: 'tabCategory',
    technologyTab: 'tabTechnology',
    detailTab: 'tabDetail',
    optionsButton: 'btnOptions',
    cloudSearchButton: 'cloud_search',
    issueButton: 'btnIssue',
  },
  cssStrings: {
    imageClass: 'img',
    eyeClosedIcon: 'icon-eye-close',
    eyeOpenIcon: 'icon-eye-open',
  },
  pathPrefixes: {
    flags: 'flags/',
    icons: 'icons/',
  },
  imageDimensions: {
    width: '19px',
    height: '19px', // Original code had 'hight', preserving this for exact clone
  },
};

const domHelpers = {
  createImgTag: (source, label = '', classes = appConstants.cssStrings.imageClass, imgWidth = appConstants.imageDimensions.width, imgHeight = appConstants.imageDimensions.height) =>
    `<img class="${classes}" width="${imgWidth}" hight="${imgHeight}" src="${source}" ${label ? `title="${label}"` : ''}>`,
  createAnchorTag: (hyperlink, content, openInNewTab = '_blank') =>
    `<a href="${hyperlink}" target="${openInNewTab}">${content}</a>`,
  createBoldText: (content) => `<strong>${content}</strong>`,
  createTableDataCell: (content, columnSpan = null) =>
    `<td ${columnSpan ? `colspan="${columnSpan}"` : ''}>${content}</td>`,
  createTableRow: (cellContentsHtml) => `<tr>${cellContentsHtml.join('')}</tr>`,
};

class UserInterfaceOrchestrator {
  constructor(browserApiReference) {
    this.browserApi = browserApiReference;
    this.primaryContentDisplay = document.getElementById(appConstants.domElementIds.displayMain);
    this.diagnosticPanel = document.getElementById(appConstants.domElementIds.diagnosticOutput);
    this.headerVisibilityToggle = document.getElementById(appConstants.domElementIds.toggleHeaderVisibility);
    this.isPanelVisible = false;

    this.initializeEventHandlers();
    this.applyInternationalization();
  }

  // Main method to render content based on the current tab's data
  async commenceDisplayProcess() {
    try {
      const activeTabContext = await new Promise(resolver => this.browserApi.tabs.getSelected(null, resolver));
      const retrievedPageData = this.browserApi.extension.getBackgroundPage().technologyData[activeTabContext.id];

      if (!retrievedPageData) {
        console.warn("No relevant data found for the current browser tab.");
        return;
      }

      this.renderInformationSections(retrievedPageData);

    } catch (errorDetails) {
      console.error("Failure during content display initialization:", errorDetails);
    }
  }

  // Renders various data sections into the main content area
  renderInformationSections(pageDetails) {
    const contentSchema = [
      {
        dataKey: 'ip_info',
        i18nLabel: 'ip',
        renderCells: (infoObject) => {
          const flagImageHtml = domHelpers.createImgTag(`${appConstants.pathPrefixes.flags}${infoObject.CountryCode.toLowerCase()}.gif`);
          const geoDetails = `${infoObject.Ip}/${infoObject.City}, ${infoObject.RegionName}, ${infoObject.CountryName}`;
          return [domHelpers.createTableDataCell(flagImageHtml), domHelpers.createTableDataCell(geoDetails)];
        }
      },
      {
        dataKey: 'technology',
        i18nLabel: 'webTechnology',
        renderCells: (infoObject) => this.renderIconAndDescription(infoObject)
      },
      {
        dataKey: 'server',
        i18nLabel: 'webserver',
        renderCells: (infoObject) => this.renderIconAndDescription(infoObject)
      },
      {
        dataKey: 'os',
        i18nLabel: 'os',
        renderCells: (infoObject) => this.renderIconAndDescription(infoObject)
      },
      {
        dataKey: 'front_libraries',
        i18nLabel: 'frontLibraries',
        renderCells: (itemsArray) => [domHelpers.createTableDataCell(this.renderMultipleItems(itemsArray), 2)]
      },
      {
        dataKey: 'web_apps',
        i18nLabel: 'webApps',
        renderCells: (itemsArray) => [domHelpers.createTableDataCell(this.renderMultipleItems(itemsArray), 2)]
      }
    ];

    let accumulatedRowsHtml = '';
    for (const schemaEntry of contentSchema) {
      const sectionData = pageDetails[schemaEntry.dataKey];
      const shouldRender = sectionData && (Array.isArray(sectionData) ? sectionData.length !== 0 : true);

      if (shouldRender) {
        const labelCellHtml = domHelpers.createTableDataCell(domHelpers.createBoldText(this.browserApi.i18n.getMessage(schemaEntry.i18nLabel)));
        const dynamicCellsHtml = schemaEntry.renderCells(sectionData);
        accumulatedRowsHtml += domHelpers.createTableRow([labelCellHtml, ...dynamicCellsHtml]);
      }
    }
    this.primaryContentDisplay.innerHTML = accumulatedRowsHtml;
  }

  // Helper for rendering a cell with an icon and associated text, potentially linked
  renderIconAndDescription(itemInfo) {
    const iconSource = `${appConstants.pathPrefixes.icons}${itemInfo.icon}`;
    const iconLabel = itemInfo.title;
    let iconElementHtml = domHelpers.createImgTag(iconSource, iconLabel);

    if (itemInfo.url) {
      iconElementHtml = domHelpers.createAnchorTag(itemInfo.url, iconElementHtml);
    }

    const descriptionText = itemInfo.result ? itemInfo.result[0] : itemInfo.title;
    return [domHelpers.createTableDataCell(iconElementHtml), domHelpers.createTableDataCell(descriptionText)];
  }

  // Helper for rendering multiple items (like libraries or apps) within a single table cell
  renderMultipleItems(itemsCollection) {
    return itemsCollection.map(item => {
      const itemIconElement = domHelpers.createImgTag(`${appConstants.pathPrefixes.icons}${item.icon}`, item.title);
      const itemLabelWithSpace = `&nbsp;${item.title}`;
      let combinedItemContent = `${itemIconElement}${itemLabelWithSpace}`;
      if (item.url) {
        combinedItemContent = domHelpers.createAnchorTag(item.url, combinedItemContent);
      }
      return combinedItemContent;
    }).join('&nbsp;&nbsp;');
  }

  // Toggles the visibility of the diagnostic panel and updates its control
  async toggleDiagnosticPanelVisibility() {
    const activeTabContext = await new Promise(resolver => this.browserApi.tabs.getSelected(null, resolver));
    const retrievedPageData = this.browserApi.extension.getBackgroundPage().technologyData[activeTabContext.id];

    if (!this.isPanelVisible) {
      if (retrievedPageData && retrievedPageData.raw_header) {
        this.diagnosticPanel.innerText = retrievedPageData.raw_header;
        this.diagnosticPanel.style.display = '';
        this.headerVisibilityToggle.innerHTML = `<i class="${appConstants.cssStrings.eyeClosedIcon}"></i>`;
        this.isPanelVisible = true;
      }
    } else {
      this.diagnosticPanel.style.display = 'none';
      this.headerVisibilityToggle.innerHTML = `<i class="${appConstants.cssStrings.eyeOpenIcon}"></i>`;
      this.isPanelVisible = false;
    }
  }

  // Sets up all necessary event listeners for UI interactions
  initializeEventHandlers() {
    window.addEventListener('load', () => this.commenceDisplayProcess());
    this.headerVisibilityToggle.addEventListener('click', () => this.toggleDiagnosticPanelVisibility());
  }

  // Applies localized strings to static UI elements
  applyInternationalization() {
    const uiElementLocalizationMap = {
      [appConstants.domElementIds.categoryTab]: { property: 'innerText', messageKey: 'tabCategory' },
      [appConstants.domElementIds.technologyTab]: { property: 'innerText', messageKey: 'tabTechnology' },
      [appConstants.domElementIds.detailTab]: { property: 'innerText', messageKey: 'tabDetail' },
      [appConstants.domElementIds.optionsButton]: { property: 'title', messageKey: 'btnOptions' },
      [appConstants.domElementIds.toggleHeaderVisibility]: { property: 'title', messageKey: 'btnShowHeader' },
      [appConstants.domElementIds.cloudSearchButton]: { property: 'title', messageKey: 'btnCloudSearch' },
      [appConstants.domElementIds.issueButton]: { property: 'title', messageKey: 'btnIssue' },
    };

    for (const elementId in uiElementLocalizationMap) {
      const targetElement = document.getElementById(elementId);
      if (targetElement) {
        const { property, messageKey } = uiElementLocalizationMap[elementId];
        targetElement[property] = this.browserApi.i18n.getMessage(messageKey);
      }
    }
  }
}

// Global instance to manage the application's user interface
const appManagerInstance = new UserInterfaceOrchestrator(chrome);