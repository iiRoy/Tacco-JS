(function() {
  let interactionTimeoutHandle = null;

  const targetUploadElementId = '#file_manager_modal #new_upload';
  const visualDropBoundaryId = '#dropzone';
  const uploadItemsDisplayClass = '.file_table';

  const mainUploadInput = document.querySelector(targetUploadElementId);
  const boundaryElement = document.querySelector(visualDropBoundaryId);
  const displayContainer = document.querySelector(uploadItemsDisplayClass);

  const generateUploadItemHtml = (fileDescriptor) => {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.innerHTML = `
      <div class="upload-progress-entry">
        <span class="entry-file-name">${fileDescriptor.name}</span>
        <div class="progress-indicator-wrapper"><div class="progress-bar-segment" style="width: 0%;"></div></div>
      </div>
    `;
    return wrapperDiv.firstElementChild;
  };

  const processNewFile = (triggerEvent, transferData) => {
    const initialFile = transferData.files[0];
    const visualEntry = generateUploadItemHtml(initialFile);
    transferData.context = $(visualEntry);
    displayContainer.appendChild(visualEntry);
    transferData.submit();
  };

  const updateTransferProgress = (triggerEvent, progressDetails) => {
    if (progressDetails.context) {
      const completionValue = progressDetails.loaded / progressDetails.total;
      const percentageCompleted = Math.floor(completionValue * 100);
      progressDetails.context.find('.progress-bar-segment').css('width', percentageCompleted + '%');
    }
  };

  const completeTransferAction = (triggerEvent, finalData) => {
    if (finalData.context) {
      finalData.context.remove();
    }
  };

  const uploadProcessConfig = {
    dataType: "script",
    dropZone: boundaryElement,
    add: processNewFile,
    progress: updateTransferProgress,
    done: completeTransferAction
  };

  $(mainUploadInput).fileupload(uploadProcessConfig);

  document.addEventListener('dragover', (dragActivityEvent) => {
    const currentBoundary = boundaryElement;

    if (!interactionTimeoutHandle) {
      currentBoundary.classList.add('drag-active-state');
    } else {
      clearTimeout(interactionTimeoutHandle);
    }

    if (dragActivityEvent.target === currentBoundary) {
      currentBoundary.classList.add('drag-hover-state');
    } else {
      currentBoundary.classList.remove('drag-hover-state');
    }

    interactionTimeoutHandle = setTimeout(() => {
      interactionTimeoutHandle = null;
      currentBoundary.classList.remove('drag-active-state', 'drag-hover-state');
    }, 100);
  });

  document.addEventListener('drop', (dropEvent) => {
    dropEvent.preventDefault();
  });
  document.addEventListener('dragover', (dragEvent) => {
    dragEvent.preventDefault();
  });

})();