document.addEventListener('DOMContentLoaded', () => {

  const retrieveTemperatureData = () => {
    const categoryElements = document.querySelectorAll('#temp-data tfoot th');
    const positiveValueElements = document.querySelectorAll('#temp-data tbody td.pos');
    const negativeValueElements = document.querySelectorAll('#temp-data tbody td.neg');

    return {
      categoryLabels: Array.from(categoryElements).map(el => el.textContent.trim()),
      positiveValues: Array.from(positiveValueElements).map(el => el.textContent.trim()),
      negativeValues: Array.from(negativeValueElements).map(el => el.textContent.trim())
    };
  };

  const retrievePrecipitationData = () => {
    const categoryElements = document.querySelectorAll('#rain-data tfoot th');
    const valueElements = document.querySelectorAll('#rain-data tbody td');

    return {
      categoryLabels: Array.from(categoryElements).map(el => el.textContent.trim()),
      valueReadings: Array.from(valueElements).map(el => el.textContent.trim())
    };
  };

  const temperatureMetrics = retrieveTemperatureData();
  const precipitationMetrics = retrievePrecipitationData();

  document.getElementById('rain-data').style.display = 'none';
  document.getElementById('temp-data').style.display = 'none';

  $("#simplest_graph_holder").simplegraph(temperatureMetrics.positiveValues, temperatureMetrics.categoryLabels);
  
  $("#temp_graph_holder").simplegraph(temperatureMetrics.positiveValues, temperatureMetrics.categoryLabels,
    {penColor: "#f00", fillUnderLine: true, units: "ºC", minYAxisValue: 30, drawPoints: true});
  
  $("#rain_graph_holder").simplegraph(precipitationMetrics.valueReadings, precipitationMetrics.categoryLabels,
    {penColor: "#00f", units: "mm", leftGutter: 60, minYAxisValue: 10, yAxisCaption: "Max Rainfall", yAxisLabelFont: "Times New Roman"});
  
  $("#combined_graph_holder").simplegraph(temperatureMetrics.negativeValues, temperatureMetrics.categoryLabels,
    {penColor: "#f00", leftGutter: 90, units: "ºC", minYAxisValue: 10, yAxisCaption: "Max Temp", lowerBound: -10, drawPoints: true})
    .simplegraph_more(precipitationMetrics.valueReadings, {penColor: "#00f", units: "mm", minYAxisValue: 10, yAxisCaption: "Max Rainfall", lowerBound: 0});
  
  $("#bar_graph_holder").simplegraph(temperatureMetrics.positiveValues, temperatureMetrics.categoryLabels,
    {penColor: "#f00", units: "ºC", minYAxisValue: 30, drawBars: true, drawLine: false, drawPoints: false, drawGrid: false, barWidth: 20});
  
});