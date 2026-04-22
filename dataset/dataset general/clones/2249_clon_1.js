/*
 * This file contains JavaScript code for dynamic table row manipulation.
 * It's part of a web application for managing display and annotation data.
 */

// Global counters for managing table row insertion points and data indexing.
// These variables track the state across multiple calls to AddTableRows.
var counter    = 1; // Main counter for display item indexing.
var counterUpT = 3; // Counter for the insertion point of 'Title 1' rows.
var counterUpI = 4; // Counter for the insertion point of 'Input 1' rows.
var counterDownT = 5; // Counter for the insertion point of 'Title 2' rows.
var counterDownI = 6; // Counter for the insertion point of 'Input 2' rows.


/**
 * Dynamically adds a new set of rows to the "DispTable" HTML table.
 * This function handles the creation of two title rows and two input rows,
 * along with their respective cells and content.
 */
function AddTableRows()
{
    // Increment the primary counter for new item identification.
    counter++;

    // Adjust insertion counters based on whether it's the first run or subsequent runs.
    if ( counterUpT == 3 )
    {
        // For the very first set of rows, increment by one to make space.
        counterUpT++;
        counterUpI++;
        counterDownT++;
        counterDownI++;
    }
    else
    {
        // For subsequent row additions, increment by four to maintain spacing
        // between the different types of rows (title, input).
        counterUpT   += 4;
        counterUpI   += 4;
        counterDownT += 4;
        counterDownI += 4;
    }

    // --- Section: Create Title 1 Rows ---
    // Retrieve the target table element using its ID.
    var DispTable = document.getElementById( "DispTable" );

    // Insert a new row at the calculated position for 'Title 1'.
    var row1 = DispTable.insertRow( counterUpT );

    // Insert 8 cells into the newly created 'Title 1' row.
    var cellT1 = row1.insertCell( 0 );
    var cellT2 = row1.insertCell( 1 );
    var cellT3 = row1.insertCell( 2 );
    var cellT4 = row1.insertCell( 3 );
    var cellT5 = row1.insertCell( 4 );
    var cellT6 = row1.insertCell( 5 );
    var cellT7 = row1.insertCell( 6 );
    var cellT8 = row1.insertCell( 7 );


    // --- Section: Create Input 1 Rows ---
    // Re-get the table (though not strictly necessary, it aligns with original pattern).
    var DispTable = document.getElementById( "DispTable" );

    // Insert a new row at the calculated position for 'Input 1'.
    var row2 = DispTable.insertRow( counterUpI );

    // Insert 8 cells into the newly created 'Input 1' row.
    var cellI1 = row2.insertCell( 0 );
    var cellI2 = row2.insertCell( 1 );
    var cellI3 = row2.insertCell( 2 );
    var cellI4 = row2.insertCell( 3 );
    var cellI5 = row2.insertCell( 4 );
    var cellI6 = row2.insertCell( 5 );
    var cellI7 = row2.insertCell( 6 );
    var cellI8 = row2.insertCell( 7 );


    // --- Section: Create Title 2 Rows (e.g., Action ID related) ---
    // Re-get the table element.
    var DispTable = document.getElementById( "DispTable" );

    // Insert a new row at the calculated position for 'Title 2'.
    var row3 = DispTable.insertRow( counterDownT );

    // Insert 4 cells into the newly created 'Title 2' row.
    var cellT9  = row3.insertCell( 0 );
    var cellT10 = row3.insertCell( 1 );
    var cellT11 = row3.insertCell( 2 );
    var cellT12 = row3.insertCell( 3 );


    // --- Section: Create Input 2 Rows ---
    // Re-get the table element.
    var DispTable = document.getElementById( "DispTable" );

    // Insert a new row at the calculated position for 'Input 2'.
    var row4 = DispTable.insertRow( counterDownI );

    // Insert 4 cells into the newly created 'Input 2' row.
    var cellI9  = row4.insertCell( 0 );
    var cellI10 = row4.insertCell( 1 );
    var cellI11 = row4.insertCell( 2 );
    var cellI12 = row4.insertCell( 3 );


    /*
     * Assign CSS classes to the newly created cells using setAttribute().
     * This method is used first, as some older browsers or specific UserAgents
     * might behave differently with direct .className assignment.
     */
    // Apply classes for 'Title 1' cells.
    cellT1.setAttribute( "class", "itemNo" );
    cellT2.setAttribute( "class", "itemNmJa" );
    cellT3.setAttribute( "class", "component" );
    cellT4.setAttribute( "class", "annotationCd" );
    cellT6.setAttribute( "class", "displayDigit" );
    cellT7.setAttribute( "class", "requiredKb" );
    cellT8.setAttribute( "class", "searchConditionKb" );

    // Apply classes for 'Input 1' cells.
    cellI1.setAttribute( "class", "itemNo" );
    cellI2.setAttribute( "class", "itemNmJa" );
    cellI3.setAttribute( "class", "component" );
    cellI4.setAttribute( "class", "annotationSel" );
    cellI5.setAttribute( "class", "annotationCd" );
    cellI6.setAttribute( "class", "displayDigit" );
    cellI7.setAttribute( "class", "requiredKb" );
    cellI8.setAttribute( "class", "searchConditionKb" );

    // Apply classes for 'Title 2' cells.
    cellT9.setAttribute( "class", "actionId" );
    cellT10.setAttribute( "class", "actionNm" );
    cellT11.setAttribute( "class", "forwardScreenId" );
    cellT12.setAttribute( "class", "errorScreenId" );

    // Apply classes for 'Input 2' cells.
    cellI9.setAttribute( "class", "actionId" );
    cellI10.setAttribute( "class", "actionNm" );
    cellI11.setAttribute( "class", "forwardScreenId" );
    cellI12.setAttribute( "class", "errorScreenId" );


    /*
     * Assign CSS classes to the newly created cells using the .className property.
     * This is generally the more modern and common way to assign classes.
     * Both methods are used for maximum compatibility.
     */
    // Apply classes for 'Title 1' cells again using .className.
    cellT1.className = 'itemNo';
    cellT2.className = 'itemNmJa';
    cellT3.className = 'component';
    cellT4.className = 'annotationCd';
    cellT6.className = 'displayDigit';
    cellT7.className = 'requiredKb';
    cellT8.className = 'searchConditionKb';

    // Apply classes for 'Input 1' cells again.
    cellI1.className = 'itemNo';
    cellI2.className = 'itemNmJa';
    cellI3.className = 'component';
    cellI4.className = 'annotationSel';
    cellI5.className = 'annotationCd';
    cellI6.className = 'displayDigit';
    cellI7.className = 'requiredKb';
    cellI8.className = 'searchConditionKb';

    // Apply classes for 'Title 2' cells again.
    cellT9.className  = 'actionId';
    cellT10.className = 'actionNm';
    cellT11.className = 'forwardScreenId';
    cellT12.className = 'errorScreenId';

    // Apply classes for 'Input 2' cells again.
    cellI9.className  = 'actionId';
    cellI10.className = 'actionNm';
    cellI11.className = 'forwardScreenId';
    cellI12.className = 'errorScreenId';


    // --- Section: Define HTML Content for Cells ---
    // HTML content for 'Title 1' cells.
    var HTMLT1 = '<th bgcolor="#7b68ee">番号</th>';
    var HTMLT2 = '<th bgcolor="#7b68ee">表示項目名称</th>';
    var HTMLT3 = '<th bgcolor="#7b68ee">画面部品種類</th>';
    var HTMLT4 = '<th bgcolor="#7b68ee" colspan="2">ア</th>';
    var HTMLT5 = '<th bgcolor="#7b68ee" colspan="2">アノテーション</th>';
    var HTMLT6 = '<th bgcolor="#7b68ee">表示桁数</th>';
    var HTMLT7 = '<th bgcolor="#7b68ee">必須条件</th>';
    var HTMLT8 = '<th bgcolor="#7b68ee">検索条件区分</th>';

    // HTML content for 'Input 1' cells, including dynamic counter values.
    var HTMLI1 = '' + counter + '<input type="text" value = "' + counter + '" name= "display[' + counter + '].itemNo">';
    var HTMLI2 = '<input type="String" name="display[' + counter + '].itemNmJa"/>';
    var HTMLI3 = '<input type="String" name="display[' + counter + '].component"/>';
    var HTMLI4 = '<a href="Annotation.html" target="_blank" name="display[' + counter + '].annotationSel' + counter + '">選択</a/>';
    var HTMLI5 = '<input type="String" name="display[' + counter + '].annotationCd"/>';
    var HTMLI6 = '<input type="String" name="display[' + counter + '].displayDigit"/>';
    var HTMLI7 = '<select type="String" name="display[' + counter + '].requiredKb"><option value="ブランク"></option><option value="不要">-</option><option value="必須">必須</option></select>';
    var HTMLI8 = '<select type="String" name="display[' + counter + '].searchConditionKb" ><option value="ブランク"></option><option value="--">--</option><option value="=">=</option><option value="<>"><></option></select>';

    // HTML content for 'Title 2' cells.
    var HTMLT9  = '<th>アクションID</th>';
    var HTMLT10 = '<th>アクション名</th>';
    var HTMLT11 = '<th>遷移先画面</th>';
    var HTMLT12 = '<th>エラー時遷移先</th>';

    // HTML content for 'Input 2' cells.
    var HTMLI9  = '<input type="String" name="display[' + counter + '].actionID"/>';
    var HTMLI10 = '<input type="String" name="display[' + counter + '].actionNm"/>';
    var HTMLI11 = '<input type="String" name="display[' + counter + '].forwardScreenId"/>';
    var HTMLI12 = '<input type="String" name="display[' + counter + '].errorScreenId"/>';


    // --- Section: Populate Cells with HTML Content ---
    // Set innerHTML for 'Title 1' cells.
    cellT1.innerHTML = HTMLT1;
    cellT2.innerHTML = HTMLT2;
    cellT3.innerHTML = HTMLT3;
    cellT4.innerHTML = HTMLT4;
    cellT5.innerHTML = HTMLT5;
    cellT6.innerHTML = HTMLT6;
    cellT7.innerHTML = HTMLT7;
    cellT8.innerHTML = HTMLT8;

    // Set innerHTML for 'Input 1' cells.
    cellI1.innerHTML = HTMLI1;
    cellI2.innerHTML = HTMLI2;
    cellI3.innerHTML = HTMLI3;
    cellI4.innerHTML = HTMLI4;
    cellI5.innerHTML = HTMLI5;
    cellI6.innerHTML = HTMLI6;
    cellI7.innerHTML = HTMLI7;
    cellI8.innerHTML = HTMLI8;

    // Set innerHTML for 'Title 2' cells.
    cellT9.innerHTML  = HTMLT9;
    cellT10.innerHTML = HTMLT10;
    cellT11.innerHTML = HTMLT11;
    cellT12.innerHTML = HTMLT12;

    // Set innerHTML for 'Input 2' cells.
    cellI9.innerHTML  = HTMLI9;
    cellI10.innerHTML = HTMLI10;
    cellI11.innerHTML = HTMLI11;
    cellI12.innerHTML = HTMLI12;
}


// Redefine counter for the Annotation Table, separate from the Display Table counter.
// This ensures independent counting for annotation rows.
var counter = 1;

/**
 * Dynamically adds a new row to the "AnnotationTable" HTML table.
 * This function is specifically for managing annotation-related input fields.
 */
function AddAnnoTableRows2()
{
    // Increment the counter for the annotation table rows.
    counter++;

    // Get the target annotation table element.
    var AnnTable = document.getElementById( "AnnotationTable" );

    // Insert a new row at the current counter position.
    var row1 = AnnTable.insertRow( counter );

    // Insert 8 cells into the new annotation row.
    var cell1 = row1.insertCell( 0 );
    var cell2 = row1.insertCell( 1 );
    var cell3 = row1.insertCell( 2 );
    var cell4 = row1.insertCell( 3 );
    var cell5 = row1.insertCell( 4 );
    var cell6 = row1.insertCell( 5 );
    var cell7 = row1.insertCell( 6 );
    var cell8 = row1.insertCell( 7 );


    // Assign CSS classes to the cells using setAttribute().
    // This is done for robustness across various browsers/user agents.
    cell1.setAttribute( "class", "check" );
    cell2.setAttribute( "class", "annotationCd" );
    cell3.setAttribute( "class", "annotationNmEn" );
    cell4.setAttribute( "class", "argumentType" );
    cell5.setAttribute( "class", "argument1" );
    cell6.setAttribute( "class", "argument2" );
    cell7.setAttribute( "class", "argument3" );
    cell8.setAttribute( "class", "classpathStr" );

    // Assign CSS classes to the cells using the .className property.
    // This is a common and usually preferred method.
    cell1.className = 'check';
    cell2.className = 'annotationCd';
    cell3.className = 'annotationNmEn';
    cell4.className = 'argumentType';
    cell5.className = 'argument1';
    cell6.className = 'argument2';
    cell7.className = 'argument3';
    cell8.className = 'classpathStr';


    // Define the HTML content for each cell in the annotation row.
    // Each input element's name includes the dynamic counter for unique identification.
    var HTML1 = '<input type="checkbox" name="annotation[' + counter + '].check" value="">';
    var HTML2 = '<input type="text" name="annotation[' + counter + '].annotationCd">';
    var HTML3 = '<input type="text" name="annotation[' + counter + '].annotationNmEn">';
    var HTML4 = '<select name="annotation[' + counter + '].argumentType"><option value="brank"></option><option value="int">int</option><option value="String">String</option><option value="Long">Long</option></select>';
    var HTML5 = '<input type="text" name="annotation[' + counter + '].argument1">';
    var HTML6 = '<input type="text" name="annotation[' + counter + '].argument2">';
    var HTML7 = '<input type="text" name="annotation[' + counter + '].argument3">';
    var HTML8 = '<input type="text" name="annotation[' + counter + '].classpathStr">';

    // Populate the cells with their respective HTML content.
    cell1.innerHTML = HTML1;
    cell2.innerHTML = HTML2;
    cell3.innerHTML = HTML3;
    cell4.innerHTML = HTML4;
    cell5.innerHTML = HTML5;
    cell6.innerHTML = HTML6;
    cell7.innerHTML = HTML7;
    cell8.innerHTML = HTML8;
}