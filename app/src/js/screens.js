// Languages
function generateLangOptions() {
	for (let o = 0; o < keyboards.length; o++) {
		let keyboard = keyboards[o];
		let iso = keyboard.iso;
		let exonym = keyboard.exonym;
		let endonym = keyboard.endonym;
		let font = keyboard.font;
		let btn = squircleBtn.clone();

		btn.attr("data-iso", iso);
		btn.find(".squircle-btn-label").append(`<div class="squircle-btn-exonym">${exonym}</div>`);
		btn.find(".squircle-btn-label").append(`<div class="squircle-btn-endonym" style="font-family: ${font};">${endonym}</div>`);
		$("#lang-option-container").append(btn);
	}
}

$("#lang-option-container").on("click", ".squircle-btn", function() {
	currentLang = $(this).attr("data-iso");
	currentLangObject = keyboards.find(obj => obj.iso === currentLang);
	let font = currentLangObject.font;

	generateOrientOptions();
	$("#keyboard-screen").attr("data-current-iso", currentLang);
	$("#keyboard-screen").css("font-family", font);
	changeScreen("orient");
});


// Orientation
function generateOrientOptions() {
	for (let o = 0; o < currentLangObject.orients.length; o++) {
		let orient = currentLangObject.orients[o];
		let abbr = orient.abbr;
		let name = orient.name;
		let btn = squircleBtn.clone();

		btn.attr("data-orient", abbr);
		btn.find(".squircle-btn-label").html(name);
		$("#orient-option-container").append(btn);
	}
}

$("#orient-option-container").on("click", ".squircle-btn", async function() {
	currentOrient = $(this).attr("data-orient");
	currentOrientObject = currentLangObject.orients.find(obj => obj.abbr === currentOrient);
	currentKeyboard = currentOrientObject.chars;
	let btn = squircleBtn.clone();

	btn.find(".squircle-btn-label").html("Listen");
	$("#port-input-container").append(btn);
	$("#keyboard-screen").attr("data-current-orient", currentOrient);
	generateKeyboard();

	// Before scanning
	let btIcon = getSvg("img/bluetooth.svg");
	$("#ble-icon").html(btIcon);
	changeScreen("ble");
	bleDevices = await invoke("scan_ble_devices");

	// After scanning
	generateBLEDevices();
	$("#ble-screen").attr("data-scanning", false);
	// changeScreen("calib");
	// $("body").attr("data-connection", "connected");
});


// BLE
function generateBLEDevices() {
	$("#ble-devices-list").empty();

	bleDevices = bleDevices.filter(str => !/^\d/.test(str));
	bleDevices.sort();
	let deviceCount = parseInt($("#ble-screen").css("--device-count"));
	let firstNDevices = bleDevices.slice(0, deviceCount);

	for (let d = 0; d < firstNDevices.length; d++) {
		$("#ble-devices-list").append(`
			<div class="ble-device">
				<div class="ble-device-name">${firstNDevices[d]}</div>
				<div class="ble-device-connection-container">
					<div class="ble-device-not-connected">Not connected</div>
					<div class="ble-device-connecting-loader"></div>
					<div class="ble-device-connected">Connected</div>
				</div>
			</div>	
		`);
	}
}

$("#ble-devices-container").on("click", ".ble-device", async function() {
	let deviceName = $(this).find(".ble-device-name").html();

	// Before connecting
	$("body").attr("data-connection", "loading");
	$(this).addClass("connected-device");
	await invoke("connect_ble_device", {deviceName: deviceName});

	// After connecting
	$("body").attr("data-connection", "connected");
	invoke("read_ble_data");

	setTimeout(function() {
		changeScreen("calib");
	}, 500);
});
