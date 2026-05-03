// Generate keyboard
const ctrlKeys = {
	"\u2423": {
		name: "space"
	},
	"\u232B": {
		name: "backspace"
	},
	"\u1F5D": {
		name: "trash"
	},
	"\u2424": {
		name: "enter"
	}
}

function generateKeyboard() {
	totalRows = currentKeyboard.length;

	for (let r = 0; r < currentKeyboard.length; r++) {
		let row = currentKeyboard[r];
		let rowEl = $(`<div class="squircle-row" data-row="${r}">`);

		if (row.length > totalCols) totalCols = row.length;

		for (let s = 0; s < row.length; s++) {
			let squircle = row[s];
			let squircleEl = getSvg("img/squircles/systems/straight.svg");
			squircleEl.attr("data-col", s);
			squircleEl.attr("data-current-diacritic", "0");

			for (let d = 0; d < squircle.length; d++) {
				let dir = squircle[d];
				let dpadDir = dirNames[d];
				let quadEl = $(`<div class="squircle-quad" data-dir="${dpadDir}"></div>`);

				for (let c = 0; c < dir.length; c++) {
					let cayse = dir[c];
					let caseCount = dir.length;
					if (caseCount > totalCaseCount) totalCaseCount = caseCount;

					for (let ch = 0; ch < cayse.length; ch++) {
						let char = cayse[ch];
						let svg = "";
						let ctrl = ctrlKeys[char];
						let diacriticCount = cayse.length;
						if (diacriticCount > totalDiacriticCount) totalDiacriticCount = diacriticCount;
	
						if (char !== " ") {
							if (ctrl !== undefined) {
								quadEl.attr("data-ctrl", ctrl.name);
								svg = getSvg(`img/ctrl/${ctrl.name}.svg`);
							} else {
								svg = getSvg(`img/glyphs/${currentLang}/${char.charCodeAt(0)}.svg`);
								svg.addClass("squircle-char");
								if (caseCount > 1) svg.attr("data-case", c);
								svg.attr("data-diacritic", ch);
								svg.attr("data-char", char);
							}
						}
	
						quadEl.append(svg);
					}
				}

				squircleEl.find(".squircle-front-container").append(quadEl);
			}

			rowEl.append(squircleEl);
		}

		$("#keyboard").append(rowEl);
	}
}

function changeSquircle() {
	let currentSquircleEl = $(`[data-row="${currentSquircle.row}"] [data-col="${currentSquircle.col}"]`);

	$(".squircle").attr("data-bump-dir", "");
	$(".squircle").removeClass("current-squircle");

	currentSquircleEl.addClass("current-squircle");
}

function type(char) {
	let text = $("#keyboard-input-text").text();
	$("#keyboard-input-text").text(text + char);
}

function nextCase() {
	currentCase = (currentCase + 1) % totalCaseCount;
	$("#keyboard-screen").attr("data-current-case", currentCase);
}

function nextDiacritic() {
	currentDiacritic = (currentDiacritic + 1) % totalDiacriticCount;
	$("#keyboard-screen").attr("data-current-diacritic", currentDiacritic);
}


var currentPhrase = 0;
const phrases = [
	"the quick brown fox jumps over the 75 lazy dogs",
	"pack my 68 boxes with five dozen liquor jugs",
	"sphinx of black quartz judge my 11 vows",
	"the five of 23 boxing wizards jump quickly",
	"jackdaws love my big sphinx of 94 quartz"
];
