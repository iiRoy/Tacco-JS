const identifyNode = (designator) => typeof designator === 'string' ? document.getElementById(designator) : designator;

const escapeTextForHtml = (rawContent) => {
  const charMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return rawContent.replace(/[&<>"']/g, (symbol) => charMap[symbol]);
};

class OutcomeMonitor {
  #hostContainer = null;
  #recordBody = null;
  #reportPanel = null;

  constructor(targetIdentifier) {
    this.#hostContainer = identifyNode(targetIdentifier);
    if (this.#hostContainer) {
      this.establishDisplay();
    }
  }

  establishDisplay() {
    const initialMarkup = `
      <section class="report-summary-area">processing results...</section>
      <table class="report-data-table">
        <thead class="report-header">
          <tr>
            <th>Test Description</th>
            <th>Outcome</th>
            <th>Information</th>
          </tr>
        </thead>
        <tbody class="report-entries"></tbody>
      </table>
    `;
    this.#hostContainer.innerHTML = initialMarkup;
    this.#reportPanel = this.#hostContainer.querySelector('.report-summary-area');
    this.#recordBody = this.#hostContainer.querySelector('.report-entries');
  }

  beginTestRecord(description) {
    if (!this.#hostContainer) return;
    const newRowMarkup = `
      <tr>
        <td class="test-description-cell">${escapeTextForHtml(description)}</td>
        <td class="outcome-cell"></td>
        <td class="info-cell"></td>
      </tr>
    `;
    this.#recordBody.insertAdjacentHTML('beforeend', newRowMarkup);
  }

  markRecordStatus(statusLabel) {
    const currentRow = this.fetchCurrentRecordRow();
    if (!currentRow) return;
    currentRow.className = statusLabel;
    const statusCell = currentRow.querySelector('.outcome-cell');
    if (statusCell) {
      statusCell.textContent = statusLabel;
    }
  }

  concludeTestRecord(finalStatus, finalReport) {
    if (!this.#hostContainer) return;
    this.markRecordStatus(finalStatus);
    this.addRecordDetail(finalReport);
  }

  addRecordDetail(detailContent) {
    if (!this.#hostContainer) return;
    const detailCell = this.fetchCurrentDetailCell();
    if (detailCell) {
      detailCell.innerHTML = this.cleanForDisplay(detailContent);
    }
  }

  updateOverallReport(summaryContent) {
    if (!this.#hostContainer) return;
    if (this.#reportPanel) {
      this.#reportPanel.innerHTML = this.cleanForDisplay(summaryContent);
    }
  }

  fetchCurrentRecordRow() {
    if (!this.#recordBody) return null;
    const rows = this.#recordBody.querySelectorAll('tr');
    return rows.length > 0 ? rows[rows.length - 1] : null;
  }

  fetchCurrentDetailCell() {
    const currentRow = this.fetchCurrentRecordRow();
    return currentRow ? currentRow.querySelector('.info-cell') : null;
  }

  cleanForDisplay(textValue) {
    return escapeTextForHtml(textValue).replace(/\n/g, "<br/>");
  }

  ignoreControlElements(controls) {
    // This method performs no operation, mirroring the commented-out original.
  }
}