// Routine for adding display-related table rows.
let mainItemIndex = 1;
let headerRowOffset = 3;
let inputRowOffset = 4;
let actionHeaderRowOffset = 5;
let actionInputRowOffset = 6;

function appendDisplayRows() {
  // Advance the primary row index.
  mainItemIndex++;
  if (headerRowOffset === 3) {
    headerRowOffset++;
    inputRowOffset++;
    actionHeaderRowOffset++;
    actionInputRowOffset++;
  } else {
    headerRowOffset += 4;
    inputRowOffset += 4;
    actionHeaderRowOffset += 4;
    actionInputRowOffset += 4;
  }

  // Retrieve the main display table element.
  const displayContainer = document.getElementById("DispTable");

  // Create and insert the first header row.
  const mainHeaderRow = displayContainer.insertRow(headerRowOffset);
  const mhCell1 = mainHeaderRow.insertCell(0);
  const mhCell2 = mainHeaderRow.insertCell(1);
  const mhCell3 = mainHeaderRow.insertCell(2);
  const mhCell4 = mainHeaderRow.insertCell(3);
  const mhCell5 = mainHeaderRow.insertCell(4);
  const mhCell6 = mainHeaderRow.insertCell(5);
  const mhCell7 = mainHeaderRow.insertCell(6);
  const mhCell8 = mainHeaderRow.insertCell(7);

  // Create and insert the first input data row.
  const mainInputRow = displayContainer.insertRow(inputRowOffset);
  const miCell1 = mainInputRow.insertCell(0);
  const miCell2 = mainInputRow.insertCell(1);
  const miCell3 = mainInputRow.insertCell(2);
  const miCell4 = mainInputRow.insertCell(3);
  const miCell5 = mainInputRow.insertCell(4);
  const miCell6 = mainInputRow.insertCell(5);
  const miCell7 = mainInputRow.insertCell(6);
  const miCell8 = mainInputRow.insertCell(7);

  // Create and insert the second header row (for actions).
  const actionHeaderRow = displayContainer.insertRow(actionHeaderRowOffset);
  const ahCell1 = actionHeaderRow.insertCell(0);
  const ahCell2 = actionHeaderRow.insertCell(1);
  const ahCell3 = actionHeaderRow.insertCell(2);
  const ahCell4 = actionHeaderRow.insertCell(3);

  // Create and insert the second input data row (for actions).
  const actionInputRow = displayContainer.insertRow(actionInputRowOffset);
  const aiCell1 = actionInputRow.insertCell(0);
  const aiCell2 = actionInputRow.insertCell(1);
  const aiCell3 = actionInputRow.insertCell(2);
  const aiCell4 = actionInputRow.insertCell(3);

  // Apply CSS classes using setAttribute for maximum compatibility.
  // Main header cells styling.
  mhCell1.setAttribute("class", "itemNo");
  mhCell2.setAttribute("class", "itemNmJa");
  mhCell3.setAttribute("class", "component");
  mhCell4.setAttribute("class", "annotationCd");
  mhCell6.setAttribute("class", "displayDigit");
  mhCell7.setAttribute("class", "requiredKb");
  mhCell8.setAttribute("class", "searchConditionKb");

  // Main input cells styling.
  miCell1.setAttribute("class", "itemNo");
  miCell2.setAttribute("class", "itemNmJa");
  miCell3.setAttribute("class", "component");
  miCell4.setAttribute("class", "annotationSel");
  miCell5.setAttribute("class", "annotationCd");
  miCell6.setAttribute("class", "displayDigit");
  miCell7.setAttribute("class", "requiredKb");
  miCell8.setAttribute("class", "searchConditionKb");

  // Action header cells styling.
  ahCell1.setAttribute("class", "actionId");
  ahCell2.setAttribute("class", "actionNm");
  ahCell3.setAttribute("class", "forwardScreenId");
  ahCell4.setAttribute("class", "errorScreenId");

  // Action input cells styling.
  aiCell1.setAttribute("class", "actionId");
  aiCell2.setAttribute("class", "actionNm");
  aiCell3.setAttribute("class", "forwardScreenId");
  aiCell4.setAttribute("class", "errorScreenId");

  // Apply CSS classes using the className property for modern browsers.
  // Main header cells styling.
  mhCell1.className = 'itemNo';
  mhCell2.className = 'itemNmJa';
  mhCell3.className = 'component';
  mhCell4.className = 'annotationCd';
  mhCell6.className = 'displayDigit';
  mhCell7.className = 'requiredKb';
  mhCell8.className = 'searchConditionKb';

  // Main input cells styling.
  miCell1.className = 'itemNo';
  miCell2.className = 'itemNmJa';
  miCell3.className = 'component';
  miCell4.className = 'annotationSel';
  miCell5.className = 'annotationCd';
  miCell6.className = 'displayDigit';
  miCell7.className = 'requiredKb';
  miCell8.className = 'searchConditionKb';

  // Action header cells styling.
  ahCell1.className = 'actionId';
  ahCell2.className = 'actionNm';
  ahCell3.className = 'forwardScreenId';
  ahCell4.className = 'errorScreenId';

  // Action input cells styling.
  aiCell1.className = 'actionId';
  aiCell2.className = 'actionNm';
  aiCell3.className = 'forwardScreenId';
  aiCell4.className = 'errorScreenId';

  // Define the HTML content for the main header cells.
  const markupH1 = '<th bgcolor="#7b68ee">項目番</th>';
  const markupH2 = '<th bgcolor="#7b68ee">表示名</th>';
  const markupH3 = '<th bgcolor="#7b68ee">部品種別</th>';
  const markupH4 = '<th bgcolor="#7b68ee" colspan="2">アノテ</th>';
  const markupH5 = '<th bgcolor="#7b68ee" colspan="2">注釈</th>';
  const markupH6 = '<th bgcolor="#7b68ee">表示幅</th>';
  const markupH7 = '<th bgcolor="#7b68ee">必須フラグ</th>';
  const markupH8 = '<th bgcolor="#7b68ee">検索条件</th>';

  // Define the HTML content for the main input cells.
  const markupI1 = `${mainItemIndex}<input type="text" value="${mainItemIndex}" name="rendered[${mainItemIndex}].itemNo">`;
  const markupI2 = '<input type="String" name="rendered[' + mainItemIndex + '].itemNmJa"/>';
  const markupI3 = '<input type="String" name="rendered[' + mainItemIndex + '].component"/>';
  const markupI4 = '<a href="AnnotationDetails.html" target="_blank" name="rendered[' + mainItemIndex + '].annotationSel' + mainItemIndex + '">選択</a/>';
  const markupI5 = '<input type="String" name="rendered[' + mainItemIndex + '].annotationCd"/>';
  const markupI6 = '<input type="String" name="rendered[' + mainItemIndex + '].displayDigit"/>';
  const markupI7 = '<select type="String" name="rendered[' + mainItemIndex + '].requiredKb"><option value="ブランク"></option><option value="不要">-</option><option value="必須">必須</option></select>';
  const markupI8 = '<select type="String" name="rendered[' + mainItemIndex + '].searchConditionKb" ><option value="ブランク"></option><option value="--">--</option><option value="=">=</option><option value="<>"><></option></select>';

  // Define the HTML content for the action header cells.
  const markupAH1 = '<th>処理ID</th>';
  const markupAH2 = '<th>処理名</th>';
  const markupAH3 = '<th>次画面</th>';
  const markupAH4 = '<th>エラー画面</th>';

  // Define the HTML content for the action input cells.
  const markupAI1 = '<input type="String" name="rendered[' + mainItemIndex + '].actionID"/>';
  const markupAI2 = '<input type="String" name="rendered[' + mainItemIndex + '].actionNm"/>';
  const markupAI3 = '<input type="String" name="rendered[' + mainItemIndex + '].forwardScreenId"/>';
  const markupAI4 = '<input type="String" name="rendered[' + mainItemIndex + '].errorScreenId"/>';

  // Populate the cells with their respective HTML content.
  // Main header cell content.
  mhCell1.innerHTML = markupH1;
  mhCell2.innerHTML = markupH2;
  mhCell3.innerHTML = markupH3;
  mhCell4.innerHTML = markupH4;
  mhCell5.innerHTML = markupH5;
  mhCell6.innerHTML = markupH6;
  mhCell7.innerHTML = markupH7;
  mhCell8.innerHTML = markupH8;

  // Main input cell content.
  miCell1.innerHTML = markupI1;
  miCell2.innerHTML = markupI2;
  miCell3.innerHTML = markupI3;
  miCell4.innerHTML = markupI4;
  miCell5.innerHTML = markupI5;
  miCell6.innerHTML = markupI6;
  miCell7.innerHTML = markupI7;
  miCell8.innerHTML = markupI8;

  // Action header cell content.
  ahCell1.innerHTML = markupAH1;
  ahCell2.innerHTML = markupAH2;
  ahCell3.innerHTML = markupAH3;
  ahCell4.innerHTML = markupAH4;

  // Action input cell content.
  aiCell1.innerHTML = markupAI1;
  aiCell2.innerHTML = markupAI2;
  aiCell3.innerHTML = markupAI3;
  aiCell4.innerHTML = markupAI4;
}

// Resetting the primary index for the annotation table, as in original.
mainItemIndex = 1;

function appendAnnotationRows() {
  // Increment the annotation row sequence.
  mainItemIndex++;
  const annotationContainer = document.getElementById("AnnotationTable");
  const annoRow = annotationContainer.insertRow(mainItemIndex);
  const annoCell1 = annoRow.insertCell(0);
  const annoCell2 = annoRow.insertCell(1);
  const annoCell3 = annoRow.insertCell(2);
  const annoCell4 = annoRow.insertCell(3);
  const annoCell5 = annoRow.insertCell(4);
  const annoCell6 = annoRow.insertCell(5);
  const annoCell7 = annoRow.insertCell(6);
  const annoCell8 = annoRow.insertCell(7);

  // Apply CSS classes using setAttribute.
  annoCell1.setAttribute("class", "check");
  annoCell2.setAttribute("class", "annotationCd");
  annoCell3.setAttribute("class", "annotationNmEn");
  annoCell4.setAttribute("class", "argumentType");
  annoCell5.setAttribute("class", "argument1");
  annoCell6.setAttribute("class", "argument2");
  annoCell7.setAttribute("class", "argument3");
  annoCell8.setAttribute("class", "classpathStr");

  // Apply CSS classes using className.
  annoCell1.className = 'check';
  annoCell2.className = 'annotationCd';
  annoCell3.className = 'annotationNmEn';
  annoCell4.className = 'argumentType';
  annoCell5.className = 'argument1';
  annoCell6.className = 'argument2';
  annoCell7.className = 'argument3';
  annoCell8.className = 'classpathStr';

  // Construct the HTML strings for the annotation input fields.
  const annoMarkup1 = '<input type="checkbox" name="descriptor[' + mainItemIndex + '].check" value="">';
  const annoMarkup2 = '<input type="text" name="descriptor[' + mainItemIndex + '].annotationCd">';
  const annoMarkup3 = '<input type="text" name="descriptor[' + mainItemIndex + '].annotationNmEn">';
  const annoMarkup4 = '<select name="descriptor[' + mainItemIndex + '].argumentType"><option value="brank"></option><option value="int">int</option><option value="String">String</option><option value="Long">Long</option></select>';
  const annoMarkup5 = '<input type="text" name="descriptor[' + mainItemIndex + '].argument1">';
  const annoMarkup6 = '<input type="text" name="descriptor[' + mainItemIndex + '].argument2">';
  const annoMarkup7 = '<input type="text" name="descriptor[' + mainItemIndex + '].argument3">';
  const annoMarkup8 = '<input type="text" name="descriptor[' + mainItemIndex + '].classpathStr">';

  // Insert the generated HTML into the table cells.
  annoCell1.innerHTML = annoMarkup1;
  annoCell2.innerHTML = annoMarkup2;
  annoCell3.innerHTML = annoMarkup3;
  annoCell4.innerHTML = annoMarkup4;
  annoCell5.innerHTML = annoMarkup5;
  annoCell6.innerHTML = annoMarkup6;
  annoCell7.innerHTML = annoMarkup7;
  annoCell8.innerHTML = annoMarkup8;
}