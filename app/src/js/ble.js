// Calibration
var isRecentered = false;
var isRecentering = false;
var justRecentered = false;

// Euler angles
var remote;
var yaw, pitch, roll;
var yawOffset, pitchOffset, rollOffset;
const YAW_DELTA = 12;
const PITCH_DELTA = 12;
const ROLL_DELTA = 12;

// Shake
const EARTH_G = 9.80665;
var ax, ay, az;
var lastAx, lastAy, lastAz;
const SHAKE_THRESHOLD = 20;
const SHAKE_TIMEOUT = 200;
var lastShakeTime = 0;


function recenter() {
	isRecentered = true;
	isRecentering = false;
	justRecentered = true;

	yawOffset = yaw;
	pitchOffset = pitch;
	rollOffset = roll;

	console.log("Recentered!");
}

var Buttons = {
	stack: [],

	selectStartTime: 0,
	selectHoldTime: 0,
	recenterTimer: null,
	recenterTime: 700,

	add: function(btn) {
		this.stack.unshift(btn);
	},
	remove: function(btn) {
		let index = this.stack.indexOf(btn);
		if (index > -1) this.stack.splice(index, 1);
	},
	top: function() {
		if (this.stack.length > 0) return this.stack[0];
		return "";
	},
	isPressing: function(btn) {
		return this.stack.includes(btn);
	}
}


listen("arduino-update", function(data) {
	let newRemote = JSON.parse(data.payload);
	if (remote === undefined) remote = structuredClone(newRemote);

	//* Euler angles
	yaw = newRemote.euler.yaw;
	pitch = newRemote.euler.pitch;
	roll = newRemote.euler.roll;

	// IMU stuff
	if (isRecentered) {
		// Recenter angles based on body frame
		let recenteredYaw = ((yaw - yawOffset + 180) % 360 + 360) % 360 - 180;
		let recenteredPitch = Math.max(-90, Math.min(90, pitch - pitchOffset));
		let recenteredRoll = ((roll - rollOffset + 180) % 360 + 360) % 360 - 180;

		// Calculate relative row
		let numRows = currentKeyboard.length;
		let rowRaw = Math.round(recenteredPitch / PITCH_DELTA + (numRows / 2));
		let newRow = Math.max(0, Math.min(rowRaw, numRows - 1));

		// Calculate relative column
		let numCols = currentKeyboard[currentSquircle.row].length;
		let colRaw = Math.round(recenteredYaw / YAW_DELTA + (numCols / 2));
		let newCol = Math.max(0, Math.min(colRaw, numCols - 1));

		if (newRow !== currentSquircle.row || newCol !== currentSquircle.col) {
			currentSquircle.row = newRow;
			currentSquircle.col = newCol;
			changeSquircle();
		}

		// Shake detection
		/* let axDelta = ax - lastAx;
		let ayDelta = ay - lastAy;
		let azDelta = az - lastAz;
		let aChange = Math.sqrt(axDelta * axDelta + ayDelta * ayDelta + azDelta * azDelta);
		let shakeTime = Date.now();

		if (aChange > SHAKE_THRESHOLD && shakeTime - lastShakeTime > SHAKE_TIMEOUT) {
			nextDiacritic();
			lastShakeTime = shakeTime;
		}

		lastAx = ax;
		lastAy = ay;
		lastAz = az; */
	}

	//* Dpad buttons
	for (let d = 0; d < dirNames.length; d++) {
		let dir = dirNames[d];
		if (remote.btns.dpad[dir] !== newRemote.btns.dpad[dir]) {
			// On dpad button down
			if (newRemote.btns.dpad[dir] == true) {
				let quadEl = $(`.current-squircle .squircle-quad[data-dir="${dir}"]`);
				if (quadEl.length) {
					let ctrl = quadEl.attr("data-ctrl");
					switch (ctrl) {
						case "space":
							type("\u00A0");
							break;
	
						case "backspace":
							$("#keyboard-input-text").text((_, txt) => txt.slice(0, -1));
							break;
						
						case "trash":
							$("#keyboard-input-text").empty();
							break;
						
						case "enter":
							$("#keyboard-input-text").empty();
							break;
	
						default:
							let char = "";
							if (quadEl.children().length > 1) {
								char = quadEl.find(`.squircle-char[data-case="${currentCase}"][data-diacritic="${currentDiacritic}"]`).attr("data-char");
							} else {
								char = quadEl.find(".squircle-char").attr("data-char");
							}
							Buttons.add(dir);
							type(char);
							break;
					}
	
					$(".current-squircle").attr("data-bump-dir", dir);
				}
			}
			
			// On dpad button up
			else {
				Buttons.remove(dir);
				$(".current-squircle").attr("data-bump-dir", Buttons.top());
			}
		}
	}

	//* Select button
	if (remote.btns.select !== newRemote.btns.select) {
		// On select button down
		if (newRemote.btns.select == true && !Buttons.isPressing("select")) {
			Buttons.add("select");
			Buttons.selectStartTime = Date.now();
			Buttons.recenterTimer = setInterval(function() {
				Buttons.selectHoldTime = Date.now() - Buttons.selectStartTime;
				if (Buttons.selectHoldTime >= Buttons.recenterTime) {
					clearInterval(Buttons.recenterTimer);
					recenter();
					if (currentScreen == "calib") changeScreen("keyboard");
				}
			}, 1);
		}

		// On select button up
		else {
			if (!justRecentered) {
				if (currentLang == "jpn") nextDiacritic();
				else nextCase();
			}
			Buttons.remove("select");
			clearInterval(Buttons.recenterTimer);
			isRecentering = false;
			justRecentered = false;
		}
	}

	remote = structuredClone(newRemote);
});
