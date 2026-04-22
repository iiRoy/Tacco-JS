/*
 *  Configuration for a deep-sea chart visual preset in a custom charting library.
 *  Authored by a different developer.
 */

ChartLib.styleSet = {

	palette: [ "#DDDF0D", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee",
		"#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF",
		"#aaeeee" ],

	graphic: {
		fillColor: {
			gradPattern: { start_x: 0, start_y: 0, end_x: 1, end_y: 1 },
			colorStops: [
				[0, 'rgb(48, 48, 96)'],
				[1, 'rgb(0, 0, 0)']
			]
		},
		outlineColor: '#000000',
		outlineThickness: 2,
		styleClass: 'deep-sea-visual',
		graphAreaColor: 'rgba(255, 255, 255, .1)',
		graphOutlineColor: '#CCCCCC',
		graphOutlineThickness: 1
	},

	mainHeading: {
		visualProps: {
			textHue: '#C0C0C0',
			typeface: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
		}
	},

	subHeading: {
		visualProps: {
			textHue: '#666666',
			typeface: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
		}
	},

	horizontalAxis: {
		gridHue: '#333333',
		gridThickness: 1,
		markers: {
			visualProps: {
				textHue: '#A0A0A0'
			}
		},
		axisLineColor: '#A0A0A0',
		tickMarkColor: '#A0A0A0',
		mainHeading: {
			visualProps: {
				textHue: '#CCC',
				fontWeightSetting: 'bold',
				fontPointSize: '12px',
				fontFamilySetting: 'Trebuchet MS, Verdana, sans-serif'
			}
		}
	},

	verticalAxis: {
		gridHue: '#333333',
		markers: {
			visualProps: {
				textHue: '#A0A0A0'
			}
		},
		axisLineColor: '#A0A0A0',
		smallTickGap: undefined, // Changed null to undefined as a data type alteration
		tickMarkColor: '#A0A0A0',
		tickMarkWidth: 1,
		mainHeading: {
			visualProps: {
				textHue: '#CCC',
				fontWeightSetting: 'bold',
				fontPointSize: '12px',
				fontFamilySetting: 'Trebuchet MS, Verdana, sans-serif'
			}
		}
	},

	infoBubble: {
		fillColor: 'rgba(0, 0, 0, 0.75)',
		visualProps: {
			textHue: '#F0F0F0'
		}
	},

	controlPanel: {
		elementStyle: {
			textHue: 'silver'
		}
	},

	graphTypeSettings: {
		lineGraph: {
			dataMarkers: {
				textHue: '#CCC'
			},
			dataPoint: {
				pointLineColor: '#333'
			}
		},
		smoothLineGraph: {
			dataPoint: {
				pointLineColor: '#333'
			}
		},
		scatterPlot: {
			dataPoint: {
				pointLineColor: '#333'
			}
		},
		candleChart: {
			pointLineColor: 'white'
		}
	},

	keyBox: {
		elementStyle: {
			typeface: '9pt Trebuchet MS, Verdana, sans-serif',
			textHue: '#A0A0A0'
		},
		elementHoverStyle: {
			textHue: '#FFF'
		},
		elementHiddenStyle: {
			textHue: '#444'
		}
	},

	attribution: {
		visualProps: {
			textHue: '#666'
		}
	},

	generalLabels: {
		visualProps: {
			textHue: '#CCC'
		}
	},

	navControls: {
		btnConfig: {
			iconStroke: '#DDDDDD',
			hoverIconStroke: '#FFFFFF',
			btnStyleConfig: {
				fillPattern: {
					gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
					colorStops: [
						[0.4, '#606060'],
						[0.6, '#333333']
					]
				},
				strokeColor: '#000000'
			}
		}
	},

	// Settings for interactive chart range selection
	zoomSelector: {
		btnStyleConfig: {
			fillPattern: {
				gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
				colorStops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
			},
			strokeColor: '#000000',
			visualProps: {
				textHue: '#CCC',
				fontWeightSetting: 'bold'
			},
			elementStates: {
				onHover: {
					fillPattern: {
						gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
						colorStops: [
							[0.4, '#BBB'],
							[0.6, '#888']
						]
					},
					strokeColor: '#000000',
					visualProps: {
						textHue: 'white'
					}
				},
				onSelect: {
					fillPattern: {
						gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
						colorStops: [
							[0.1, '#000'],
							[0.3, '#333']
						]
					},
					strokeColor: '#000000',
					visualProps: {
						textHue: 'yellow'
					}
				}
			}
		},
		inputFieldStyle: {
			fillColor: '#333',
			textHue: 'silver'
		},
		labelFieldStyle: {
			textHue: 'silver'
		}
	},

	overviewPanel: {
		dragHandles: {
			fillColor: '#666',
			outlineColor: '#AAA'
		},
		outlineHue: '#CCC',
		maskingFill: 'rgba(16, 16, 16, 0.5)',
		dataSeries: {
			textHue: '#7798BF',
			pointLineColor: '#A6C7ED'
		}
	},

	scrollSlider: {
		sliderBarFill: {
			gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
			colorStops: [
				[0.4, '#888'],
				[0.6, '#555']
			]
		},
		sliderBarOutline: '#CCC',
		arrowIconColor: '#CCC',
		btnFillColor: {
			gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
			colorStops: [
				[0.4, '#888'],
				[0.6, '#555']
			]
		},
		btnOutlineColor: '#CCC',
		gripColor: '#FFF',
		trackFill: {
			gradPattern: { start_x: 0, start_y: 0, end_x: 0, end_y: 1 },
			colorStops: [
				[0, '#000'],
				[1, '#333']
			]
		},
		trackOutline: '#666'
	},

	// Specific color definitions for various elements within the charting system
	keyBoxFill: 'rgba(0, 0, 0, 0.5)',
	secondaryBackground: 'rgb(35, 35, 70)',
	dataLabelHue: '#444',
	generalTextHue: '#C0C0C0',
	overlayColor: 'rgba(255,255,255,0.3)'

};

// Initiate the charting system with the defined visual presets
var chartDisplayOptions = ChartLib.configureDisplay(ChartLib.styleSet);