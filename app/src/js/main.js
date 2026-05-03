const invoke = window.__TAURI__.core.invoke;
const listen = window.__TAURI__.event.listen;


var keyboards;
var currentLang;
var currentLangObject;
var currentOrient;
var currentOrientObject;
var currentKeyboard;

var bleDevices;

var currentCase = 0;
var totalCaseCount = 0;
var totalRows = 0;
var totalCols = 0;
var currentSquircle = {row: 0, col: 0};

var currentDiacritic = 0;
var totalDiacriticCount = 0;

const dirNames = ["left", "up", "right", "down"];


// Asynchronous SVG injecting
function getSvg(path) {
	let foo;
	$.ajax({
		async: false,
		type: "GET",
		dataType: "xml",
		url: path,
		success: function(svgData) {
			foo = $(svgData).contents();
		}
	});
	return foo;
}


// Squircles :-)
var squircleBtnBackEl = getSvg("img/squircles/outlines/straight.svg");
var squircleBtn = $(`
	<div class="squircle-btn">
		${squircleBtnBackEl[0].outerHTML}
		<div class="squircle-btn-label"></div>
	</div>
`);


// Changing screens
var currentScreen = "";
function changeScreen(screen) {
	currentScreen = screen;
	$(".screen").removeClass("current-screen");
	setTimeout(function() {
		$(`#${screen}-screen`).addClass("current-screen");
	}, 500);
}

function nextScreen() {
	let nextScreenEl = $(".current-screen").next().filter(".screen");
	$(".screen").removeClass("current-screen");
	setTimeout(function() {
		nextScreenEl.addClass("current-screen");
	}, 500);
}


// On load
$(document).ready(async function() {
	invoke("disconnect_ble_device");

	await fetch("keyboards.json").then(response => response.json()).then(data => {
		keyboards = data.sort((a, b) => a.exonym - b.exonym);
	});

	generateLangOptions();
});


// Dev stuff
$(document).on("keydown", function(e) {
	if (e.code == "Space") {
		recenter();
		// if (currentScreen == "calib") changeScreen("keyboard");
		nextScreen();
	}
	else if (e.key == "Shift") {
		nextCase();
	}
	else if (e.key == "Alt") {
		nextDiacritic();
	}
});
