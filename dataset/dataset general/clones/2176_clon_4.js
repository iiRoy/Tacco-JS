const applicationCore = {
  currentRenderingMode: 'markdown',
  refreshInterval: 300,
  pendingRenderTimer: null,
  isContentModified: false,
  dragActive: false,
  dragElement: null,
  dialogElement: null,
  dialogTextarea: null,
};

const calculateRatio = (portion, total) => Math.round((portion / 100) * total);

const reconfigureLayout = () => {
  const currentWindowWidth = window.innerWidth;
  const currentWindowHeight = window.innerHeight;
  const topOffset = 30;
  const halfWidth = calculateRatio(50, currentWindowWidth);

  const mainContainer = document.getElementById('main-container');
  const inputPanel = document.getElementById('input-panel');
  const dividerBar = document.getElementById('divider-bar');
  const outputPanel = document.getElementById('output-panel');
  const contentArea = document.getElementById('content-area');

  if (!mainContainer || !inputPanel || !dividerBar || !outputPanel || !contentArea) return;

  mainContainer.style.height = `${currentWindowHeight - topOffset}px`;

  inputPanel.style.top = `${topOffset}px`;
  inputPanel.style.bottom = '0';
  inputPanel.style.height = `${currentWindowHeight}px`;
  inputPanel.style.width = `${halfWidth - 2}px`;

  dividerBar.style.top = '0';
  dividerBar.style.bottom = '0';
  dividerBar.style.left = `${halfWidth - 2}px`;
  dividerBar.style.height = `${currentWindowHeight - topOffset}px`;

  outputPanel.style.top = `${topOffset}px`;
  outputPanel.style.left = `${halfWidth + 2}px`;
  outputPanel.style.right = '0';
  outputPanel.style.bottom = '0';

  contentArea.style.width = `${inputPanel.offsetWidth - 16}px`;
  contentArea.style.height = `${inputPanel.offsetHeight - 46}px`;
};

const adjustPanelDivision = () => {
  const dividerBar = document.getElementById('divider-bar');
  const inputPanel = document.getElementById('input-panel');
  const outputPanel = document.getElementById('output-panel');
  const contentArea = document.getElementById('content-area');

  if (!dividerBar || !inputPanel || !outputPanel || !contentArea) return;

  const currentDividerPosition = dividerBar.offsetLeft;

  inputPanel.style.left = '0';
  inputPanel.style.width = `${currentDividerPosition - 2}px`;
  outputPanel.style.left = `${currentDividerPosition + 2}px`;

  contentArea.style.width = `${inputPanel.offsetWidth - 16}px`;
  contentArea.style.height = `${inputPanel.offsetHeight - 16}px`;
};

const synchronizeScrollPositions = () => {
  const inputElement = document.getElementById('content-area');
  const outputElement = document.getElementById('output-panel');

  if (!inputElement || !outputElement) return;

  const inputMetrics = {
    total: inputElement.scrollHeight,
    visible: inputElement.clientHeight,
    current: inputElement.scrollTop
  };

  const outputMetrics = {
    total: outputElement.scrollHeight,
    visible: outputElement.clientHeight,
    current: outputElement.scrollTop
  };

  if (inputMetrics.total <= inputMetrics.visible || outputMetrics.total <= outputMetrics.visible) {
      return;
  }

  const scrollRatio = inputMetrics.current / (inputMetrics.total - inputMetrics.visible);
  const targetPosition = (outputMetrics.total - outputMetrics.visible) * scrollRatio;
  outputElement.scrollTop = targetPosition;
};

const applyHighlighting = () => {
  document.querySelectorAll('#output-display > pre').forEach(codeBlock => {
    if (typeof hljs !== 'undefined' && hljs.highlightBlock) {
      hljs.highlightBlock(codeBlock);
    }
  });
};

const triggerContentRefresh = () => {
  applicationCore.isContentModified = true;

  const contentElement = document.getElementById('content-area');
  if (!contentElement) return;

  const payload = {
    sourceContent: contentElement.value,
    renderFormat: applicationCore.currentRenderingMode
  };

  fetch('/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(renderedHtml => {
    const outputElement = document.getElementById('output-display');
    if (outputElement) {
      outputElement.innerHTML = renderedHtml;
      applyHighlighting();
    }
  })
  .catch(error => console.error('Rendering failed:', error));
};

const handleContentKeyInput = () => {
  if (applicationCore.pendingRenderTimer !== null) {
    clearTimeout(applicationCore.pendingRenderTimer);
  }
  applicationCore.pendingRenderTimer = setTimeout(triggerContentRefresh, applicationCore.refreshInterval);
};

const setupModalDialog = () => {
  applicationCore.dialogElement = document.getElementById('modal-overlay');
  applicationCore.dialogTextarea = document.getElementById('dialog-textarea');
  const closeButton = document.getElementById('modal-close');

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (applicationCore.dialogElement) {
        applicationCore.dialogElement.style.display = 'none';
      }
    });
  }
};

const displayHtmlContentModal = (content) => {
  if (applicationCore.dialogElement && applicationCore.dialogTextarea) {
    applicationCore.dialogTextarea.value = content;
    applicationCore.dialogElement.style.display = 'block';
  }
};

const implementTabKey = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    const target = event.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const indent = '  ';

    target.value = target.value.substring(0, start) + indent + target.value.substring(end);
    target.selectionStart = target.selectionEnd = start + indent.length;
  }
};

let initialDividerX;
let initialMouseX;

const startDividerDrag = (event) => {
  const dividerBar = document.getElementById('divider-bar');
  if (!dividerBar) return;

  applicationCore.dragActive = true;
  applicationCore.dragElement = dividerBar;
  initialDividerX = dividerBar.offsetLeft;
  initialMouseX = event.clientX;

  document.addEventListener('mousemove', performDividerDrag);
  document.addEventListener('mouseup', endDividerDrag);
  document.body.style.cursor = 'ew-resize';
  dividerBar.style.userSelect = 'none';
};

const performDividerDrag = (event) => {
  if (!applicationCore.dragActive || !applicationCore.dragElement) return;

  const deltaX = event.clientX - initialMouseX;
  let newPosition = initialDividerX + deltaX;

  const mainContainer = document.getElementById('main-container');
  if (mainContainer) {
    const minX = 100;
    const maxX = mainContainer.offsetWidth - 100;
    newPosition = Math.max(minX, Math.min(newPosition, maxX));
  }
  
  applicationCore.dragElement.style.left = `${newPosition}px`;
  adjustPanelDivision();
};

const endDividerDrag = () => {
  applicationCore.dragActive = false;
  applicationCore.dragElement = null;
  document.removeEventListener('mousemove', performDividerDrag);
  document.removeEventListener('mouseup', endDividerDrag);
  document.body.style.cursor = '';
  const dividerBar = document.getElementById('divider-bar');
  if (dividerBar) dividerBar.style.userSelect = '';
};


const initializeApplication = () => {
  setupModalDialog();
  reconfigureLayout();

  window.addEventListener('resize', reconfigureLayout);

  window.addEventListener('beforeunload', (event) => {
    const contentArea = document.getElementById('content-area');
    if (applicationCore.isContentModified && contentArea && contentArea.value.trim().length > 0) {
      event.preventDefault();
      event.returnValue = "You have unsaved document";
      return "You have unsaved document";
    }
  });

  const htmlViewLink = document.querySelector('nav ul li.html-view a');
  if (htmlViewLink) {
    htmlViewLink.addEventListener('click', (event) => {
      event.preventDefault();
      const outputElement = document.getElementById('output-display');
      if (outputElement) {
        displayHtmlContentModal(outputElement.innerHTML);
      }
    });
  }

  const contentArea = document.getElementById('content-area');
  if (contentArea) {
    contentArea.addEventListener('keydown', implementTabKey);
    contentArea.addEventListener('scroll', synchronizeScrollPositions);
    contentArea.addEventListener('keyup', handleContentKeyInput);
  }

  const dividerBar = document.getElementById('divider-bar');
  if (dividerBar) {
    dividerBar.addEventListener('mousedown', startDividerDrag);
  }

  document.querySelectorAll('a.format-selector').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      applicationCore.currentRenderingMode = link.dataset.formatType;
      document.querySelectorAll('a.format-selector').forEach(sel => sel.classList.remove('selected-active'));
      link.classList.add('selected-active');
      triggerContentRefresh();
    });
  });

  document.querySelectorAll('a.delay-setting').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      applicationCore.refreshInterval = parseInt(link.dataset.updateDelay, 10);
      document.querySelectorAll('a.delay-setting').forEach(sel => sel.classList.remove('selected-active'));
      link.classList.add('selected-active');
      triggerContentRefresh();
    });
  });

  if (contentArea && contentArea.value !== '') {
    setTimeout(triggerContentRefresh, 300);
  }
};

document.addEventListener('DOMContentLoaded', initializeApplication);