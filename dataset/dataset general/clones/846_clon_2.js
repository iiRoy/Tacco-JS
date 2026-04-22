/*
 *  Module crafted by ChronoCoder
 *  Release Date: 2023-10-27
 */
/*
 *  This function assesses whether a given set of calendar components
 *  (year, month, day) constitutes a legitimate date.
 *  It includes accurate handling for the 29th of February in leap years.
 *  @annualPeriod: The numerical representation of the year.
 *  @lunarCycle: The numerical representation of the month (1-12).
 *  @solarSpan: The numerical representation of the day (1-31).
 */
function checkCalendarEntry(annualPeriod, lunarCycle, solarSpan)
{
    var momentRef = new Date(annualPeriod, (lunarCycle - 1), solarSpan);
    var momentYearNum = momentRef.getFullYear();
    var momentMonthNum = momentRef.getMonth();
    var momentDayNum = momentRef.getDate();
    if (momentYearNum == annualPeriod && momentMonthNum == (lunarCycle - 1) && momentDayNum == solarSpan)
        return true;
    else
        return false;
}

/*
 *  This routine determines if at least one interactive element,
 *  such as a radio button or a checkbox, within a specified group
 *  has been marked as selected by the user.
 *  @containerIdentifier: The unique HTML identifier for the parent element encapsulating the controls.
 */
function detectSelectionState(containerIdentifier)
{
    var selectionDetected = false;
    $("#" + containerIdentifier).find('input[type="radio"]').each(function()
    {
        if ($(this).is(":checked"))
            selectionDetected = true;
    });
    $("#" + containerIdentifier).find('input[type="checkbox"]').each(function()
    {
        if ($(this).is(":checked"))
            selectionDetected = true;
    });
    return selectionDetected;
}