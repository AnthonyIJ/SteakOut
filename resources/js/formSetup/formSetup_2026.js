// The guts of the ScoutingPASS application

// === Bicycle & Cycle data ===
let requiredFields = ["e", "m", "l", "r", "s", "t", "as"];  // What are these again...?  (Prob from first init. page)
let cycles = []
let isFlipped = false;
let recordTeleopCycleTime = false;

// Cycle class
class Cycle {
    static src_condense_map = new Map([
        ["p", "p"],
        ["d", "d"],
        ["o", "o"],
        ["n", "nz"],
        ["f", "f"],
        ["c", "c"],
        ['x', "x"] //no source
    ])
    static volley_condense_map = new Map([
        ['10', 10],
        ['20', 20],
        ['30', 30],
        ['40', 40],
        ['50', 50],
        ["x", "x"]
    ])

    constructor(gametime, source, score_loc, volley, percentage) {
        this.gametime = gametime  // 1=auto, 2=teleop
        this.source = source;      // p=preload, d=depot, o=outpost, n=neutral zone, f=fed, c=collected
        this.score_loc = score_loc;   // zone_id {xy} format
        this.volley = volley;      // numbers yay
        this.percentage = percentage;      // 0=unsuccessful, 1=successful
    }
    condense() {
        // gsxyvp
        // g = gametime (auto / teleop)
        // s = source
        // x, y = grid_x, grid_y
        // v = volley
        // p = percentage
        return `${this.gametime}${this.source}${this.score_loc}${this.volley}${this.percentage}`
    }

    toString() {
        return this.condense()
    }
}

// Called on the nextSuccessfulCycle
function nextSuccessfulCycle(code_identifier) {
    let cycleText;
    if (code_identifier.endsWith('a')) {
        cycleText = 'Auto'
    } else {
        cycleText = 'Teleop'
    }

    let undefined_vars = saveCycle(code_identifier, 1)  // TODO: What is this
    if (undefined_vars.length > 0) {  // More than 0 undefined vars
        alert(`Missing fields in ${cycleText} Cycle Form: ${undefined_vars.join(', ')}`)
        return
    }
    try {
        clearCycle(code_identifier)
    } catch (e) {
        alert(e)
    }
    let break_component = document.getElementById(`break_${code_identifier}break`)
    break_component.setAttribute("nof_cycles", (parseInt(break_component.getAttribute("nof_cycles")) + 1).toString())
    break_component.innerHTML = `${cycleText} Cycle Form (${break_component.getAttribute("nof_cycles")}):` + '&nbsp;';
}

// Called on next_Cycle; saves the cycle, returns undefined variables?
function saveCycle(code_identifier, successful) {
    let Form = document.forms.scoutingForm;

    let src = Form[`${code_identifier}src`]
    let src_value = Cycle.src_condense_map.get(src.value ? src.value.replace(/"/g, '').replace(/;/g, "-") : "");

    let scoreloc = document.getElementById('canvas_' + code_identifier + 'scoreloc')
    let scoreloc_value = scoreloc.getAttribute('boxes')

    let vol = Form[`${code_identifier}vol`]
    let vol_value = Cycle.volley_condense_map.get(vol.value ? vol.value.replace(/"/g, '').replace(/;/g, "-") : "");

    let per = Form[`${code_identifier}per`]
    let per_value = per.value

    let gametime = code_identifier.endsWith('a') ? 1 : 2

    let undefined_vars = []
    if (src_value === undefined) {
        undefined_vars.push('\"Source\"')
    }
    if ((scoreloc_value === null || scoreloc_value === 'null')) {
        undefined_vars.push('\"Score Location\"')
    }
    if (vol_value === undefined) {
        undefined_vars.push('\"Initial Fuel\"')
    }
    if (undefined_vars.length > 0) {
        return undefined_vars
    }

    let break_component = document.getElementById(`break_${code_identifier}break`)

    let cycle = new Cycle(
        gametime,
        src_value,
        scoreloc_value,
        vol_value,
        per_value
    )
    cycles.push(cycle)
    return []
}

function clearCycle(code_identifier) {
    // Clear XY coordinates
    let inputs = document.querySelectorAll("[id*='XY_']");
    for (let e of inputs) {
        let code = e.id.substring(3)
        e.value = "[]"
    }

    let scoreloc_component = document.getElementById('canvas_' + code_identifier + 'scoreloc')
    console.log(scoreloc_component)
    scoreloc_component.setAttribute('boxes', null)



    inputs = new Set(document.querySelectorAll("[id*='input_']"));
    for (let e of inputs) {
        let code = e.id.substring(6)
        if (!code.startsWith(code_identifier)) {
            continue
        }
        if (e.className === "clickableImage") {
            e.value = "[]";
            continue;
        }
        // let radio = code.indexOf("_")
        // if (radio > -1) {
        //     let baseCode = code.substr(0, radio)
        //     if (e.checked) {
        //         e.checked = false
        //         document.getElementById("display_" + baseCode).value = ""
        //     }
        //     let defaultValue;
        //     try {
        //         defaultValue = document.getElementById("default_" + baseCode).value
        //     } catch (p) {
        //         defaultValue = ''
        //     }
        //     if (defaultValue !== "") {
        //         if (defaultValue === e.value) {
        //             e.checked = true
        //             document.getElementById("display_" + baseCode).value = defaultValue
        //         }
        //     }
        // } else {
        //     if (e.type === "number" || e.type === "text" || e.type === "hidden") {
        //         if ((e.className === "counter") ||
        //             (e.className === "timer") ||
        //             (e.className === "cycle")) {
        //             e.value = 0
        //             if (e.className === "timer" || e.className === "cycle") {
        //                 // Stop interval
        //                 let timerStatus = document.getElementById("status_" + code);
        //                 let startButton = document.getElementById("start_" + code);
        //                 let intervalIdField = document.getElementById("intervalId_" + code);
        //                 let intervalId = intervalIdField.value;
        //                 timerStatus.value = 'stopped';
        //                 startButton.innerHTML = "Start";
        //                 if (intervalId !== '') {
        //                     clearInterval(intervalId);
        //                 }
        //                 intervalIdField.value = '';
        //                 if (e.className === "cycle") {
        //                     document.getElementById("display_" + code).value = ""
        //                 }
        //             }
        //         } else {
        //             e.value = ""
        //         }
        //     } else if (e.type === "checkbox") {
        //         if (e.checked === true) {
        //             e.checked = false
        //         }
        //     } else {
        //         console.log("unsupported input type")
        //     }
        // }
    }
    drawFields()
}

// Adds a next successful cycle button to the current
function addNextSuccessfulCycleButton(table, idx, name, data, code_identifier) {
    let row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    cell1.innerHTML = name + '&nbsp;';
    let cell2 = row.insertCell(1)
    let inp = document.createElement("input");
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("type", "button");
    inp.setAttribute("onclick", `nextSuccessfulCycle(\"${code_identifier}\")`)
    inp.setAttribute("value", "Next Volley") //inp.setAttribute("value", "Next Cycle")
    inp.setAttribute("name", data.code);
    if (data.hasOwnProperty('defaultValue')) {
        inp.setAttribute("value", data.defaultValue);
    }
    if (data.hasOwnProperty('disabled')) {
        inp.setAttribute("disabled", "");
    }
    cell2.appendChild(inp);
    return idx + 1;
}

bicycle_component_identifier = 'cycle'

// Add bicycle
function addBicycle(table, idx, name, data) {
    // Is this bicycle the auto or teleop bicycle?
    let code_identifier = bicycle_component_identifier + ((data.bicycle_id === 'auto') ? 'a' : 't');

    // Create the title display (called "break") component for this bicycle component
    let break_name = (data.bicycle_id === 'auto') ? 'Auto' : 'Teleop';
    let break_data = JSON.parse(`{
            "name": "${break_name} Cycle Form:",
            "code": "${code_identifier}break",
            "type": "break"
        }`)
    idx = addBreak(table, idx, break_data.name, break_data)

    let source_data;
    if (code_identifier === bicycle_component_identifier + 'a') { // Auto
        source_data = JSON.parse(`{ 
     "name": "Source",
     "code": "${code_identifier}src",
     "type": "radio",
     "choices": {
        "p": "Preload&emsp;",
        "d": "Depot<br>",
        "o": "Outpost&emsp;",
        "n": "NZ"
     },
     "defaultValue": "p"
     }`)
    } else {  // Teleop intake
        source_data = JSON.parse(`{ 
     "name": "Source",
     "code": "${code_identifier}src",
     "type": "radio",
     "choices": {
      "f": "Fed&emsp;",
      "c": "Collected"
     },
     "defaultValue": "f"
     }`)
    }
    idx = addRadio(table, idx, source_data.name, source_data)

    // Add Score Location component (name used to have "Score Location")
    let score_loc_data = JSON.parse(`{
      "name": "",
      "code": "${code_identifier}scoreloc",
      "type": "scoreloc",
      "filename": "2026/field_image.png",
      "clickRestriction": "four",
      "shape": "rect 4 white orangered true"
  }`)
    idx = addScoreLoc(table, idx, score_loc_data.name, score_loc_data)

    // add volley data component
    let volley_data;
    if (code_identifier === bicycle_component_identifier + 'a') {
        volley_data = JSON.parse(`
        { 
            "name": "Initial Fuel",
            "code": "${code_identifier}vol",
            "type": "radio",
            "choices": {
            "10": "10<br>",
            "20": "20<br>",
            "30": "30<br>",
            "40": "40<br>",
            "50": "50"
            },
            "defaultValue": "10"
        }`)
    } else {
        volley_data = JSON.parse(`
        { 
            "name": "Initial Fuel",
            "code": "${code_identifier}vol",
            "type": "radio",
            "choices": {
            "10": "10<br>",
            "20": "20<br>",
            "30": "30<br>",
            "40": "40<br>",
            "50": "50"
            },
            "defaultValue": "30"
        }`)
    }

    idx = addRadio(table, idx, volley_data.name, volley_data)  // volley

    let percentage_data;
    if (code_identifier === bicycle_component_identifier + 'a') {
        percentage_data = JSON.parse(`
        {
            "name": "Percent Made",
            "code": "${code_identifier}per",
            "type": "radio",
            "choices": {
                "25": "25%<br>",
                "50": "50%<br>",
                "75": "75%<br>",
                "100": "100%"
            },
            "defaultValue": "75"
        }`)
    } else {
        percentage_data = JSON.parse(`
        {
            "name": "Percent Made",
            "code": "${code_identifier}per",
            "type": "radio",
            "choices": {
                "25": "25%<br>",
                "50": "50%<br>",
                "75": "75%<br>",
                "100": "100%"
            },
            "defaultValue": "100"
        }`)
    }

    idx = addRadio(table, idx, percentage_data.name, percentage_data) //Percentage

    let total_fuel_break_data = JSON.parse(`
    {
        "name": "",
        "code": "${code_identifier}tf",
        "type": "break"
    }`)
    idx = addBreak(table, idx, total_fuel_break_data.name, total_fuel_break_data)

    // next successful cycle button
    let next_successful_button_data = JSON.parse(`
  { 
    "name": "Record:",
    "code": "${code_identifier}nsc",
    "type": "nextCycleButton"
  }`) //"name": "Make:",
    idx = addNextSuccessfulCycleButton(table, idx, next_successful_button_data.name, next_successful_button_data, code_identifier)

    return idx
}

// Add Score Location Component
function addScoreLoc(table, idx, name, data) {
    let row = table.insertRow(idx);
    let cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");
    cell.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    cell.innerHTML = name;
    if (data.hasOwnProperty('tooltip')) {
        cell.setAttribute("title", data.tooltip);
    }

    let showFlip = false;
    // if (data.hasOwnProperty('showFlip')) {
    //     if (data.showFlip.toLowerCase() === 'false') {
    //         showFlip = false;
    //     }
    // }

    let showUndo = true;
    if (data.hasOwnProperty('showUndo')) {
        if (data.showUndo.toLowerCase() === 'false') {
            showUndo = false;
        }
    }

    if (showFlip || showUndo) {
        idx += 1
        row = table.insertRow(idx);
        cell = row.insertCell(0);
        cell.setAttribute("colspan", 2);
        cell.setAttribute("style", "text-align: center;");

        if (showUndo) {
            // Undo button
            let undoButton = document.createElement("input");
            undoButton.setAttribute("type", "button");
            undoButton.setAttribute("onclick", "undo(this.parentElement)");
            undoButton.setAttribute("value", "Undo");
            undoButton.setAttribute("id", "undo_" + data.code);
            undoButton.setAttribute("class", "undoButton");
            cell.appendChild(undoButton);
        }

        if (showFlip) {
            // Flip button
            let flipButton = document.createElement("input");
            flipButton.setAttribute("type", "button");
            flipButton.setAttribute("onclick", "flip(this.parentElement)");
            flipButton.setAttribute("value", "Flip Image");
            flipButton.setAttribute("id", "flip_" + data.code);
            flipButton.setAttribute("class", "flipButton");
            if (showUndo) {
                flipButton.setAttribute("margin-left", '8px');
            }
            cell.appendChild(flipButton);
        }
    }

    idx += 1;
    row = table.insertRow(idx);
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");
    let canvas = document.createElement('canvas');
    //canvas.onclick = onFieldClick;
    canvas.setAttribute("onclick", "onScoreLocClicked(event)");
    canvas.setAttribute("class", "field-image-src");
    canvas.setAttribute("id", "canvas_" + data.code);
    canvas.innerHTML = "No canvas support";
    cell.appendChild(canvas);

    idx += 1;
    row = table.insertRow(idx);
    row.setAttribute("style", "display:none");
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    let inp = document.createElement('input');
    inp.setAttribute("type", "hidden");
    inp.setAttribute("id", "XY_" + data.code);
    inp.setAttribute("value", "[]");
    cell.appendChild(inp);
    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
        inp.setAttribute("name", data.gsCol);
    } else {
        inp.setAttribute("name", data.code);
    }
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("value", "[]");
    inp.setAttribute("class", "clickableImage");

    cell.appendChild(inp);

    // TODO: Make these more efficient/elegant
    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "clickRestriction_" + data.code);
    inp.setAttribute("value", "none");
    if (data.hasOwnProperty('clickRestriction')) {
        if ((data.clickRestriction === "one") ||
            (data.clickRestriction === "onePerBox")) {
            inp.setAttribute("value", data.clickRestriction);
        }
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "allowableResponses_" + data.code);
    inp.setAttribute("value", "none");
    if (data.hasOwnProperty('allowableResponses')) {
        let responses = data.allowableResponses.split(' ').map(Number)
        console.log(responses)
        inp.setAttribute("value", responses);
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "dimensions_" + data.code);
    inp.setAttribute("value", "12 6");
    if (data.hasOwnProperty('dimensions')) {
        if (data.dimensions !== "") {
            // TODO: Add validation for "X Y" format
            inp.setAttribute("value", data.dimensions);
        }
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "shape_" + data.code);
    // Default shape: white circle of size 5 not filled in
    inp.setAttribute("value", "rect 5 white white true");
    if (data.hasOwnProperty('shape')) {
        if (data.shape !== "") {
            // TODO: Add validation for "shape size color fill" format
            inp.setAttribute("value", data.shape);
        }
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "toggleClick_" + data.code);
    inp.setAttribute("value", "false");
    if (data.hasOwnProperty('toggleClick')) {
        if (data.toggleClick !== "") {
            // TODO: Add validation for true/false format
            inp.setAttribute("value", data.toggleClick);
        }
    }
    cell.appendChild(inp);

    idx += 1
    row = table.insertRow(idx);
    row.setAttribute("style", "display:none");
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    let img = document.createElement('img');
    img.src = data.filename;
    img.setAttribute("id", "img_" + data.code);
    img.setAttribute("class", "field-image-src");
    img.setAttribute("onload", "drawFields()");
    img.setAttribute("hidden", "");
    cell.appendChild(img);

    return idx + 1
}

// On Score Location map clicked (2026 season)
function onScoreLocClicked(event) {
    try {
        let target = event.target;
        let base = getIdBase(target.id);
        //Resolution height and width (e.g. 52x26)
        let resX = 20;
        let resY = 10;

        //Turns coordinates into a numeric box
        let box = ((Math.ceil(event.offsetY / target.height * resY) - 1) * resX) + Math.ceil(event.offsetX / target.width * resX);
        let coords = event.offsetX + "," + event.offsetY;
        let allowableResponses = document.getElementById("allowableResponses" + base).value;
        if (allowableResponses !== "none") {
            let allowableResponsesList = allowableResponses.split(',').map(Number);
            if (allowableResponsesList.indexOf(box) === -1) {
                return;
            }
        }

        //Cumulating values
        let changingXY = document.getElementById("XY" + base);
        let changingInput = document.getElementById("input" + base);
        let clickRestriction = document.getElementById("clickRestriction" + base).value;
        let toggleClick = document.getElementById("toggleClick" + base).value;
        let boxArr = Array.from(JSON.parse(changingInput.value));
        let xyArr = Array.from(JSON.parse(changingXY.value));

        if ((toggleClick.toLowerCase() === 'true') &&
            (boxArr.includes(box))) {
            // Remove it
            let idx = boxArr.indexOf(box);
            boxArr.splice(idx, 1);
            xyArr.splice(idx, 1);
            changingInput.value = JSON.stringify(boxArr);
            changingXY.value = JSON.stringify(xyArr);
        } else {
            if (JSON.stringify(changingXY.value).length <= 2) {
                changingXY.value = JSON.stringify([coords]);
                changingInput.value = JSON.stringify([box]);
            } else if (clickRestriction === "one") {
                // Replace box and coords
                changingXY.value = JSON.stringify([coords]);
                changingInput.value = JSON.stringify([box]);
            } else if (clickRestriction === "onePerBox") {
                // Add if box already not in box list/Array
                if (!boxArr.includes(box)) {
                    boxArr.push(box);
                    changingInput.value = JSON.stringify(boxArr);

                    coords = findMiddleOfBox(box, target.width, target.height, resX, resY);
                    xyArr.push(coords);
                    changingXY.value = JSON.stringify(xyArr);
                }
            } else {
                // No restrictions - add to array
                xyArr.push(coords);
                changingXY.value = JSON.stringify(xyArr);

                boxArr.push(box);
                changingInput.value = JSON.stringify(boxArr);
            }
        }

        let scoreloc_component = document.getElementById('canvas' + base)
        scoreloc_component.setAttribute('boxes', `${changingInput.value}`)

        //anthony alert("x: " + centerX + " y: " + centerY);
        drawFields()
    } catch (e) {
        alert(e)
    }
}

// Add clickable image field
function addClickableImage(table, idx, name, data) {
    let row = table.insertRow(idx);
    let cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");
    cell.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    cell.innerHTML = name;
    if (data.hasOwnProperty('tooltip')) {
        cell.setAttribute("title", data.tooltip);
    }

    let showFlip = true;
    if (data.hasOwnProperty('showFlip')) {
        if (data.showFlip.toLowerCase() === 'false') {
            showFlip = false;
        }
    }

    let showUndo = false;
    // if (data.hasOwnProperty('showUndo')) {
    //     if (data.showUndo.toLowerCase() === 'false') {
    //         showUndo = false;
    //     }
    // }

    if (showFlip || showUndo) {
        idx += 1
        row = table.insertRow(idx);
        cell = row.insertCell(0);
        cell.setAttribute("colspan", 2);
        cell.setAttribute("style", "text-align: center;");

        // if (showUndo) {
        //     // Undo button
        //     let undoButton = document.createElement("input");
        //     undoButton.setAttribute("type", "button");
        //     undoButton.setAttribute("onclick", "undo(this.parentElement)");
        //     undoButton.setAttribute("value", "Undo");
        //     undoButton.setAttribute("id", "undo_" + data.code);
        //     undoButton.setAttribute("class", "undoButton");
        //     cell.appendChild(undoButton);
        // }

        if (showFlip) {
            // Flip button
            let flipButton = document.createElement("input");
            flipButton.setAttribute("type", "button");
            flipButton.setAttribute("onclick", "flip(this.parentElement)");
            flipButton.setAttribute("value", "Flip Image");
            flipButton.setAttribute("id", "flip_" + data.code);
            flipButton.setAttribute("class", "flipButton");
            if (showUndo) {
                flipButton.setAttribute("margin-left", '8px');
            }
            cell.appendChild(flipButton);
        }
    }

    idx += 1;
    row = table.insertRow(idx);
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");
    let canvas = document.createElement('canvas');
    //canvas.onclick = onFieldClick;
    canvas.setAttribute("onclick", "onFieldClick(event)");
    canvas.setAttribute("class", "field-image-src");
    canvas.setAttribute("id", "canvas_" + data.code);
    canvas.innerHTML = "No canvas support";
    cell.appendChild(canvas);

    idx += 1;
    row = table.insertRow(idx);
    row.setAttribute("style", "display:none");
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    let inp = document.createElement('input');
    inp.setAttribute("type", "hidden");
    inp.setAttribute("id", "XY_" + data.code);
    inp.setAttribute("value", "[]");
    cell.appendChild(inp);
    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
        inp.setAttribute("name", data.gsCol);
    } else {
        inp.setAttribute("name", data.code);
    }
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("value", "[]");
    inp.setAttribute("class", "clickableImage");

    cell.appendChild(inp);

    // TODO: Make these more efficient/elegant
    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "clickRestriction_" + data.code);
    inp.setAttribute("value", "none");
    if (data.hasOwnProperty('clickRestriction')) {
        if ((data.clickRestriction === "one") ||
            (data.clickRestriction === "onePerBox")) {
            inp.setAttribute("value", data.clickRestriction);
        }
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "allowableResponses_" + data.code);
    inp.setAttribute("value", "none");
    if (data.hasOwnProperty('allowableResponses')) {
        let responses = data.allowableResponses.split(' ').map(Number)
        console.log(responses)
        inp.setAttribute("value", responses);
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "dimensions_" + data.code);
    inp.setAttribute("value", "12 6");
    if (data.hasOwnProperty('dimensions')) {
        if (data.dimensions !== "") {
            // TODO: Add validation for "X Y" format
            inp.setAttribute("value", data.dimensions);
        }
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "shape_" + data.code);
    // Default shape: white circle of size 5 not filled in
    inp.setAttribute("value", "circle 5 white white true");
    if (data.hasOwnProperty('shape')) {
        if (data.shape !== "") {
            // TODO: Add validation for "shape size color fill" format
            inp.setAttribute("value", data.shape);
        }
    }
    cell.appendChild(inp);

    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "toggleClick_" + data.code);
    inp.setAttribute("value", "false");
    if (data.hasOwnProperty('toggleClick')) {
        if (data.toggleClick !== "") {
            // TODO: Add validation for true/false format
            inp.setAttribute("value", data.toggleClick);
        }
    }
    cell.appendChild(inp);

    idx += 1
    row = table.insertRow(idx);
    row.setAttribute("style", "display:none");
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    let img = document.createElement('img');
    img.src = data.filename;
    img.setAttribute("id", "img_" + data.code);
    img.setAttribute("class", "field-image-src");
    img.setAttribute("onload", "drawFields()");
    img.setAttribute("hidden", "");
    cell.appendChild(img);
    return idx + 1
}

// === Add Default Elements ===

// Add text input field
function addText(table, idx, name, data) {
    let row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    let cell2 = row.insertCell(1);
    cell1.innerHTML = name + '&nbsp;';
    cell2.classList.add("field");
    let inp = document.createElement("input");
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("type", "text");
    inp.setAttribute("name", data.code);
    if (data.hasOwnProperty('size')) {
        inp.setAttribute("size", data.size);
    }
    if (data.hasOwnProperty('maxSize')) {
        inp.setAttribute("maxLength", data.maxSize);
    }
    if (data.hasOwnProperty('defaultValue')) {
        if (data.type === 'event') {
            data.defaultValue = data.defaultValue.toLowerCase();
        }
        inp.setAttribute("value", data.defaultValue);
    }
    if (data.hasOwnProperty('required')) {
        inp.setAttribute("required", "");
    }
    if (data.hasOwnProperty('disabled')) {
        inp.setAttribute("disabled", "");
    }
    cell2.appendChild(inp);
    if (data.hasOwnProperty('defaultValue')) {
        let def = document.createElement("input");
        def.setAttribute("id", "default_" + data.code)
        def.setAttribute("type", "hidden");
        def.setAttribute("value", data.defaultValue);
        cell2.appendChild(def);
    }
    return idx + 1
}

// Add break field
function addBreak(table, idx, name, data) {
    let row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.classList.add("title");
    cell1.setAttribute("colspan", 2);
    cell1.setAttribute('id', 'break_' + data.code)

    if (data.code.endsWith("break")) {
        cell1.setAttribute('nof_cycles', '0')
    } else if (data.code.endsWith("tf")) {
        if (data.code.endsWith("atf")) {
            cell1.setAttribute('total_fuel', '8')
        } else {
            cell1.setAttribute('total_fuel', '30')
        }
    }
    cell1.style.textAlign = 'center'
    cell1.style.fontWeight = 'bold'
    cell1.style.fontSize = 'large'
    cell1.border = '1px'
    cell1.borderColor = 'orangered'

    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }

    if (data.code.endsWith("break")) {
        cell1.innerHTML = `${name} (${cell1.getAttribute("nof_cycles")})` + '&nbsp;';
    } else if (data.code.endsWith("tf")) {
        cell1.innerHTML = `${cell1.getAttribute("total_fuel")}` + ' Fuel&nbsp;';
    }
    return idx + 1
}

// Add number input field
function addNumber(table, idx, name, data) {
    let row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    let cell2 = row.insertCell(1);
    cell1.innerHTML = name + '&nbsp;';
    cell2.classList.add("field");
    let inp = document.createElement("input");
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("type", "number");
    inp.setAttribute("name", data.code);
    if ((data.type === 'team') || (data.type === 'match')) {
        inp.setAttribute("onchange", "updateMatchStart(event)");
    }
    if (data.hasOwnProperty('min')) {
        inp.setAttribute("min", data.min);
    }
    if (data.hasOwnProperty('max')) {
        inp.setAttribute("max", data.max);
    }
    if (data.hasOwnProperty('defaultValue')) {
        inp.setAttribute("value", data.defaultValue);
    }
    if (data.hasOwnProperty('disabled')) {
        inp.setAttribute("disabled", "");
    }
    if (data.hasOwnProperty('required')) {
        inp.setAttribute("required", "");
    }
    cell2.appendChild(inp);

    if (data.hasOwnProperty('defaultValue')) {
        let def = document.createElement("input");
        def.setAttribute("id", "default_" + data.code)
        def.setAttribute("type", "hidden");
        def.setAttribute("value", data.defaultValue);
        cell2.appendChild(def);
    }

    if (data.type === 'team') {
        idx += 1
        row = table.insertRow(idx);
        cell1 = row.insertCell(0);
        cell1.setAttribute("id", "teamname-label");
        cell1.setAttribute("colspan", 2);
        cell1.setAttribute("style", "text-align: center;");
    }

    return idx + 1;
}

// Add radio select field
function addRadio(table, idx, name, data) {
    const row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    let cell2 = row.insertCell(1);
    cell1.innerHTML = name + '&nbsp;';
    cell2.classList.add("field");
    if ((data.type === 'level') ||
        (data.type === 'robot')
    ) {
        cell2.setAttribute("onchange", "updateMatchStart(event)");
    }

    if (data.code.endsWith("avol") || data.code.endsWith("aper")) {
        cell2.setAttribute("onchange", "updateATotalFuel()");
    } else if (data.code.endsWith("tvol") || data.code.endsWith("tper")) {
        cell2.setAttribute("onchange", "updateTTotalFuel()");
    }

    let checked = null
    if (data.hasOwnProperty('defaultValue')) {
        checked = data.defaultValue;
    }
    let keys;
    if (data.hasOwnProperty('choices')) {
        keys = Object.keys(data.choices);
        keys.forEach(c => {
            let inp = document.createElement("input");
            inp.setAttribute("id", "input_" + data.code + "_" + c);
            inp.setAttribute("type", "radio");
            if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
                inp.setAttribute("name", data.gsCol);
            } else {
                inp.setAttribute("name", data.code);
            }
            inp.setAttribute("value", c);
            if (checked === c) {
                inp.setAttribute("checked", "");
            }
            cell2.appendChild(inp);
            cell2.innerHTML += data.choices[c];
        });
    }
    let inp = document.createElement("input");
    inp.setAttribute("id", "display_" + data.code);
    inp.setAttribute("hidden", "");
    inp.setAttribute("value", "");
    cell2.appendChild(inp);

    if (data.hasOwnProperty('defaultValue')) {
        let def = document.createElement("input");
        def.setAttribute("id", "default_" + data.code)
        def.setAttribute("type", "hidden");
        def.setAttribute("value", data.defaultValue);
        cell2.appendChild(def);
    }

    return idx + 1;
}

// Add single checkbox component
function addCheckbox(table, idx, name, data) {
    let row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    let cell2 = row.insertCell(1);
    cell1.innerHTML = name + '&nbsp;';
    cell2.classList.add("field");
    let inp = document.createElement("input");
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("type", "checkbox");
    inp.setAttribute("name", data.code);
    cell2.appendChild(inp);

    if (data.type === 'bool') {
        cell2.innerHTML += "(checked = Yes)";
    }

    if (data.hasOwnProperty('defaultValue')) {
        let def = document.createElement("input");
        def.setAttribute("id", "default_" + data.code)
        def.setAttribute("type", "hidden");
        def.setAttribute("value", data.defaultValue);
        cell2.appendChild(def);
    }

    return idx + 1;
}

// Add element to table
function addElement(table, idx, data) {
    let name = 'Default Name';
    if (data.hasOwnProperty('name')) {
        name = data.name
    }
    let err;
    if (!data.hasOwnProperty('type')) {
        console.log("No type specified");
        console.log("Data: ")
        console.log(data);
        err = { code: "err", defaultValue: "No type specified: " + data };
        idx = addText(table, idx, name, err);
        return
    }
    if (data.type === 'counter') {
        idx = addCounter(table, idx, name, data);
    } else if (data.type === 'bicycle') {
        idx = addBicycle(table, idx, name, data)
    } else if (data.type === 'break') {
        idx = addBreak(table, idx, name, data)
    } else if ((data.type === 'scouter') || (data.type === 'event') || (data.type === 'text')) {
        idx = addText(table, idx, name, data);
    } else if ((data.type === 'level') || (data.type === 'radio') || (data.type === 'robot')) {
        idx = addRadio(table, idx, name, data);
    } else if ((data.type === 'match') || (data.type === 'team') || (data.type === 'number')) {
        idx = addNumber(table, idx, name, data);
    } else if ((data.type === 'field_image') || (data.type === 'clickable_image')) {
        idx = addClickableImage(table, idx, name, data);
    } else if ((data.type === 'bool') || (data.type === 'checkbox') || (data.type === 'pass_fail')) {
        idx = addCheckbox(table, idx, name, data);
    } else if (data.type === 'counter') {
        idx = addCounter(table, idx, name, data);
    } else if ((data.type === 'timer') || (data.type === 'cycle')) {
        idx = addTimer(table, idx, name, data);
    } else {
        console.log(`Unrecognized type: ${data.type}`);
    }
    return idx
}

// === Elements with special on-changed behavior ===

// Add Counter field
function addCounter(table, idx, name, data) {
    let row = table.insertRow(idx);
    const cell1 = row.insertCell(0);
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    let cell2 = row.insertCell(1);
    cell1.innerHTML = name + '&nbsp;';
    cell2.classList.add("field");

    const button1 = document.createElement("input");
    button1.setAttribute("type", "button");
    button1.setAttribute("id", "minus_" + data.code);
    button1.setAttribute("onclick", "counter(this.parentElement, -1)");
    button1.setAttribute("value", "-");
    cell2.appendChild(button1);

    let inp = document.createElement("input");
    inp.classList.add("counter");
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("type", "text");
    inp.setAttribute("name", data.code);
    inp.setAttribute("style", "background-color: black; color: white;border: none; text-align: center;");
    inp.setAttribute("disabled", "");
    inp.setAttribute("value", 0);
    inp.setAttribute("size", 2);
    inp.setAttribute("maxLength", 2);
    cell2.appendChild(inp);

    const button2 = document.createElement("input");
    button2.setAttribute("type", "button");
    button2.setAttribute("id", "plus_" + data.code);
    button2.setAttribute("onclick", "counter(this.parentElement, 1)");
    button2.setAttribute("value", "+");
    cell2.appendChild(button2);

    if (data.hasOwnProperty('defaultValue')) {
        let def = document.createElement("input");
        def.setAttribute("id", "default_" + data.code)
        def.setAttribute("type", "hidden");
        def.setAttribute("value", data.defaultValue);
        cell2.appendChild(def);
    }

    return idx + 1;
}

// Update counter element method
function counter(element, step) {
    let target = event.target;
    let base = getIdBase(target.id);

    let ctr = element.getElementsByClassName("counter")[0];
    let result = parseInt(ctr.value) + step;

    if (isNaN(result)) {
        result = 0;
    }

    if (result >= 0 || ctr.hasAttribute('data-negative')) {
        ctr.value = result;
    } else {
        ctr.value = 0;
    }
}

// Add timer field
function addTimer(table, idx, name, data) {
    let lineBreak;
    let row = table.insertRow(idx);
    let cell1 = row.insertCell(0);
    cell1.setAttribute("colspan", "2");
    cell1.setAttribute("style", "text-align: center;");
    cell1.classList.add("title");
    if (!data.hasOwnProperty('code')) {
        cell1.innerHTML = `Error: No code specified for ${name}`;
        return idx + 1;
    }
    cell1.innerHTML = name;
    if (data.hasOwnProperty('tooltip')) {
        cell1.setAttribute("title", data.tooltip);
    }

    idx += 1
    row = table.insertRow(idx);
    let cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");

    if (data.type === 'cycle') {
        let ct = document.createElement('input');
        ct.setAttribute("type", "hidden");
        ct.setAttribute("id", "cycletime_" + data.code);
        if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
            ct.setAttribute("name", data.gsCol);
        } else {
            ct.setAttribute("name", data.code);
        }
        ct.setAttribute("value", "[]");
        cell.appendChild(ct);
        ct = document.createElement('input');
        ct.setAttribute("type", "text");
        ct.setAttribute("id", "display_" + data.code);
        ct.setAttribute("value", "");
        ct.setAttribute("disabled", "");
        cell.appendChild(ct);
        lineBreak = document.createElement("br");
        cell.appendChild(lineBreak);
    }
    const button1 = document.createElement("input");
    button1.setAttribute("id", "start_" + data.code);
    button1.setAttribute("type", "button");
    button1.setAttribute("onclick", "timer(this.parentElement)");
    button1.setAttribute("value", "Start");
    cell.appendChild(button1);

    let inp = document.createElement("input");
    if (data.type === 'timer') {
        inp.classList.add("timer");
    } else {
        inp.classList.add("cycle");
    }
    inp.setAttribute("id", "input_" + data.code);
    inp.setAttribute("type", "text");
    if (data.type !== 'cycle') {
        if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
            inp.setAttribute("name", data.gsCol);
        } else {
            inp.setAttribute("name", data.code);
        }
    }
    inp.setAttribute("style", "background-color: black; color: white;border: none; text-align: center;");
    inp.setAttribute("disabled", "");
    inp.setAttribute("value", 0);
    inp.setAttribute("size", 7);
    inp.setAttribute("maxLength", 7);
    cell.appendChild(inp);

    const button2 = document.createElement("input");
    button2.setAttribute("id", "clear_" + data.code);
    button2.setAttribute("type", "button");
    button2.setAttribute("onclick", "resetTimer(this.parentElement)");
    button2.setAttribute("value", "Reset");
    cell.appendChild(button2);
    lineBreak = document.createElement("br");
    cell.appendChild(lineBreak);

    if (data.type === 'cycle') {
        const button3 = document.createElement("input");
        button3.setAttribute("id", "cycle_" + data.code);
        button3.setAttribute("type", "button");
        button3.setAttribute("onclick", "newCycle(this.parentElement)");
        button3.setAttribute("value", "New Cycle");
        cell.appendChild(button3);
        const button4 = document.createElement("input");
        button4.setAttribute("id", "undo_" + data.code);
        button4.setAttribute("type", "button");
        button4.setAttribute("onclick", "undoCycle(this.parentElement)");
        button4.setAttribute("value", "Undo");
        button4.setAttribute('style', "margin-left: 20px;");
        cell.appendChild(button4);
    }

    idx += 1
    row = table.insertRow(idx);
    row.setAttribute("style", "display:none");
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");
    inp = document.createElement('input');
    inp.setAttribute("type", "hidden");
    inp.setAttribute("id", "status_" + data.code);
    inp.setAttribute("value", "stopped");
    cell.appendChild(inp);
    inp = document.createElement('input');
    inp.setAttribute("hidden", "");
    inp.setAttribute("id", "intervalId_" + data.code);
    inp.setAttribute("value", "");
    cell.appendChild(inp);

    if (data.hasOwnProperty('defaultValue')) {
        const def = document.createElement("input");
        def.setAttribute("id", "default_" + data.code)
        def.setAttribute("type", "hidden");
        def.setAttribute("value", data.defaultValue);
        cell2.appendChild(def);
    }

    return idx + 1;
}

// Resets time element
function resetTimer(event) {
    let timerID = event.firstChild;
    let tId = getIdBase(timerID.id);
    let inp = document.getElementById("input" + tId)
    inp.value = 0

    // stop timer
    let timerStatus = document.getElementById("status" + tId);
    let startButton = document.getElementById("start" + tId);
    let intervalIdField = document.getElementById("intervalId" + tId);
    let intervalId = intervalIdField.value;
    timerStatus.value = 'stopped';
    startButton.setAttribute("value", "Start");
    if (intervalId !== '') {
        clearInterval(intervalId);
    }
    intervalIdField.value = '';
}

// Handles timer element
function timer(event) {
    let timerID = event.firstChild;
    let tId = getIdBase(timerID.id)
    let timerStatus = document.getElementById("status" + tId);
    let startButton = document.getElementById("start" + tId);
    let intervalIdField = document.getElementById("intervalId" + tId);
    let statusValue = timerStatus.value;
    let intervalId = intervalIdField.value;
    if (statusValue === 'stopped') {
        timerStatus.value = 'started';
        startButton.setAttribute("value", "Stop");

        intervalIdField.value = setInterval(() => {
            let tTrunc;
            let inp;
            if (document.getElementById("status" + tId).value === 'started') {
                inp = document.getElementById("input" + tId);
                let t = parseFloat(inp.value);
                t += 0.1;
                tTrunc = t.toFixed(1)
                inp.value = tTrunc;
            }
        }, 100);
    } else {
        timerStatus.value = 'stopped';
        startButton.setAttribute("value", "Start");

        clearInterval(intervalId);
        intervalIdField.value = '';
    }
    drawFields();
}


// === Data Configuration ===

// Configures something?
function configure() {
    let mydata;
    try {
        mydata = JSON.parse(config_data);
    } catch (err) {
        console.log(`Error parsing configuration file`)
        console.log(err.message)
        console.log('Use a tool like http://jsonlint.com/ to help you debug your config file')
        let table = document.getElementById("prematch_table")
        let row = table.insertRow(0);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = `Error parsing configuration file: ${err.message}<br><br>Use a tool like <a href="http://jsonlint.com/">http://jsonlint.com/</a> to help you debug your config file`
        return -1
    }

    if (mydata.hasOwnProperty('dataFormat')) {
        dataFormat = mydata.dataFormat;
    }

    if (mydata.hasOwnProperty('title')) {
        document.title = mydata.title;
    }

    if (mydata.hasOwnProperty('page_title')) {
        for (pgtitle of document.getElementsByClassName("page_title")) {
            pgtitle.innerHTML = mydata.page_title;
        }
    }

    if (mydata.hasOwnProperty('enable_google_sheets')) {
        if (mydata.enable_google_sheets.toUpperCase() === 'TRUE') {
            enableGoogleSheets = true;
        }
    }

    if (mydata.hasOwnProperty('pitConfig')) {
        if (mydata.pitConfig.toUpperCase() === 'TRUE') {
            pitScouting = true;
        }
    }

    if (mydata.hasOwnProperty('checkboxAs')) {
        // Supported modes
        // YN - Y or N
        // TF - T or F
        // 10 - 1 or 0
        if (['YN', 'TF', '10'].includes(mydata.checkboxAs)) {
            console.log("Setting checkboxAs to " + mydata.checkboxAs);
            checkboxAs = mydata.checkboxAs;
        } else {
            console.log("unrecognized checkboxAs setting.  Defaulting to YN.")
            checkboxAs = 'YN';
        }
    }
    let idx = 0

    // Configure prematch screen
    let pmc = mydata.prematch;
    let pmt = document.getElementById("prematch_table");
    idx = 0;
    pmc.forEach(element => {
        idx = addElement(pmt, idx, element);
    });

    // Configure auto screen
    let ac = mydata.auto;
    let at = document.getElementById("auto_table");
    idx = 0;
    ac.forEach(element => {
        idx = addElement(at, idx, element);
    });

    // Configure teleop screen
    let tc = mydata.teleop;
    let tt = document.getElementById("teleop_table");
    idx = 0;
    tc.forEach(element => {
        idx = addElement(tt, idx, element);
    });

    // Configure endgame screen
    let egc = mydata.endgame;
    let egt = document.getElementById("endgame_table");
    idx = 0;
    egc.forEach(element => {
        idx = addElement(egt, idx, element);
    });

    // Configure postmatch screen
    pmc = mydata.postmatch;
    pmt = document.getElementById("postmatch_table");
    idx = 0;
    pmc.forEach(element => {
        idx = addElement(pmt, idx, element);
    });

    if (!enableGoogleSheets) {
        document.getElementById("submit").style.display = "none";
    }
    return 0
}

// Resets robot
function resetRobot() {
    for (rb of document.getElementsByName('r')) {
        rb.checked = false
    }
}

// Gets the robot
function getRobot() {
    return document.forms.scoutingForm.r.value;
}

// Gets level
function getLevel() {
    return document.forms.scoutingForm.l.value
}

// get the id base of a name
function getIdBase(name) {
    return name.slice(name.indexOf("_"), name.length)
}

// Gets the team name
function getTeamName(teamNumber) {
    if (teamNumber !== undefined) {
        if (teams) {
            let teamKey = "frc" + teamNumber;
            let ret = "";
            Array.from(teams).forEach(team => ret = team.key === teamKey ? team.nickname : ret);
            return ret;
        }
    }
    return "";
}

// Gets the match
function getMatch(matchKey) {
    //This needs to be different than getTeamName() because of how JS stores their data
    if (matchKey !== undefined) {
        if (schedule) {
            let ret = "";
            Array.from(schedule).forEach(match => ret = match.key === matchKey ? match.alliances : ret);
            return ret;
        }
    }
    return "";
}

// Gets current team number from the current robot
function getCurrentTeamNumberFromRobot() {
    if (getRobot() !== "" && typeof getRobot() !== 'undefined' && getCurrentMatch() !== "") {
        if (getRobot().charAt(0) === "r") {
            return getCurrentMatch().red.team_keys[parseInt(getRobot().charAt(1)) - 1]
        } else if (getRobot().charAt(0) === "b") {
            return getCurrentMatch().blue.team_keys[parseInt(getRobot().charAt(1)) - 1]
        }
    }
}

// Gets the current match key
function getCurrentMatchKey() {
    return document.getElementById("input_e").value + "_" + getLevel() + document.getElementById("input_m").value;
}

// Gets the current match
function getCurrentMatch() {
    return getMatch(getCurrentMatchKey());
}

// updates the match start
function updateMatchStart(event) {
    if ((getCurrentMatch() === "") ||
        (!teams)) {
        console.log("No match or team data.");
        return;
    }
    if (event.target.id.startsWith("input_r")) {
        document.getElementById("input_t").value = getCurrentTeamNumberFromRobot().replace("frc", "");
        onTeamnameChange();
    }
    if (event.target.id === "input_m") {
        if (getRobot() !== "" && typeof getRobot()) {
            document.getElementById("input_t").value = getCurrentTeamNumberFromRobot().replace("frc", "");
            onTeamnameChange();
        }
    }
}

//Updates Total Fuel Calculation
function updateATotalFuel() {
    let code_identifier = "cyclea"
    let Form = document.forms.scoutingForm;

    let break_component = document.getElementById(`break_${code_identifier}tf`)

    let vol = Form[`${code_identifier}vol`]
    let vol_value = Cycle.volley_condense_map.get(vol.value ? vol.value.replace(/"/g, '').replace(/;/g, "-") : "");

    let per = Form[`${code_identifier}per`]
    let per_value = per.value

    break_component.setAttribute("total_fuel", (Math.round(vol_value * per_value / 100)).toString())
    break_component.innerHTML = `${break_component.getAttribute("total_fuel")}` + ' Fuel&nbsp;';
}

function updateTTotalFuel() {
    let code_identifier = "cyclet"
    let Form = document.forms.scoutingForm;

    let break_component = document.getElementById(`break_${code_identifier}tf`)

    let vol = Form[`${code_identifier}vol`]
    let vol_value = Cycle.volley_condense_map.get(vol.value ? vol.value.replace(/"/g, '').replace(/;/g, "-") : "");

    let per = Form[`${code_identifier}per`]
    let per_value = per.value

    break_component.setAttribute("total_fuel", (Math.round(vol_value * per_value / 100)).toString())
    break_component.innerHTML = `${break_component.getAttribute("total_fuel")}` + ' Fuel&nbsp;';
}

// On team change event (for "You are scouting..."
function onTeamnameChange(event) {
    let newNumber = document.getElementById("input_t").value;
    let teamLabel = document.getElementById("teamname-label");
    if (newNumber !== "") {
        teamLabel.innerText = getTeamName(newNumber) !== "" ? "You are scouting " + getTeamName(newNumber) : "That team isn't playing this match, please double check to verify correct number";
    } else {
        teamLabel.innerText = "";
    }
}

// Gets data in the current form
function getData(dataFormat) {
    let Form = document.forms.scoutingForm;
    let UniqueFieldNames = [];
    let fd = new FormData();
    let strArray = [];

    let checkedChar;
    let uncheckedChar;
    switch (checkboxAs) {
        case 'TF':
            checkedChar = 'T';
            uncheckedChar = 'F';
            break;
        case '10':
            checkedChar = '1';
            uncheckedChar = '0';
            break;
        default:
            checkedChar = 'Y';
            uncheckedChar = 'N';
    }

    // collect the names of all the elements in the form
    let fieldnames = Array.from(Form.elements, formElmt => formElmt.name);
    // make sure to add the name attribute only to elements from which you want to collect values.
    // Radio button groups all share the same name so those element names need to be de-duplicated here.
    fieldnames.forEach((fieldname) => {
        if (fieldname !== "" && !UniqueFieldNames.includes(fieldname)) {
            UniqueFieldNames.push(fieldname)
        }
    });

    UniqueFieldNames.forEach((fieldname) => {
        if (fieldname.startsWith(bicycle_component_identifier)) {
            return
        }
        let thisField = Form[fieldname];
        let thisFieldValue;
        if (thisField.type === 'checkbox') {
            thisFieldValue = thisField.checked ? checkedChar : uncheckedChar;
        } else if (fieldname === 'as') {
            let field = document.getElementById('canvas_' + 'as')
            let field_value = field.getAttribute('grid_coords')
            if (field_value === null) {
                alert('Missing Auto Start Position!')
            }
            /*
            0   4
            1   3
            2   2
            3   1
            4   0
             */
            thisFieldValue = /*(parseInt(field_value.substring(0, 1)) * 5)*/ + parseInt(field_value.substring(1, 2));
            if (getRobot().charAt(0) === 'b') {
                thisFieldValue = -thisFieldValue + 4;
            }
        } else {
            thisFieldValue = thisField.value ? thisField.value.replace(/"/g, '').replace(/;/g, "-") : "";
        }
        fd.append(fieldname, thisFieldValue)
    })
    Array.from(fd.keys()).forEach(thisKey => {
        strArray.push(/*thisKey + "=" + */fd.get(thisKey))
    });
    let gametimes = []
    let sources = []
    let score_locs = []
    let volleys = []
    let percentages = []
    for (let i = 0; i < cycles.length; i++) {
        let cycle = cycles[i]
        gametimes.push(cycle.gametime)
        sources.push(cycle.source)
        score_locs.push(cycle.score_loc)
        volleys.push(cycle.volley)
        percentages.push(cycle.percentage)
    }
    // normal_data;gametimes;sources;zone_ids;volleys;percentages
    //            |-> cycle data, in array format, delimiter = comma
    return `${strArray.join("|")}|${gametimes.join(',')}|${sources.join(',')}|${score_locs.join(',')}|${volleys.join(',')}|${percentages.join(',')}`
}

// Returns a boolean: whether data in form is valid or not
function validateData() {
    var ret = true;
    var errStr = "";
    for (rf of requiredFields) {
        var thisRF = document.forms.scoutingForm[rf];
        if (thisRF.value == "[]" || thisRF.value.length == 0) {
            if (rf == "as") {
                rftitle = "Auto Start Position"
            } else {
                thisInputEl = thisRF instanceof RadioNodeList ? thisRF[0] : thisRF;
                rftitle = thisInputEl.parentElement.parentElement.children[0].innerHTML.replace("&nbsp;", "");
            }
            errStr += rf + ": " + rftitle + "\n";
            ret = false;
        }
    }
    if (ret == false) {
        alert("Enter all required values\n" + errStr);
    }
    return ret
}

// Clears the form
function clearForm() {
    let match = 0;
    let e = 0;

    if (pitScouting) {
        swipePage(-1);
    } else {
        swipePage(-5);

        // Increment match
        match = parseInt(document.getElementById("input_m").value)
        if (isNaN(match)) {
            document.getElementById("input_m").value = ""
        } else {
            document.getElementById("input_m").value = match + 1
        }

        // Robot
        resetRobot()
    }

    try {
        // Clear XY coordinates
        inputs = document.querySelectorAll("[id*='XY_']");
        for (e of inputs) {
            code = e.id.substring(3)
            e.value = "[]"
        }

        inputs = document.querySelectorAll("[id*='input_']");
        for (e of inputs) {
            code = e.id.substring(6)

            // Don't clear key fields
            if (code === "m") continue
            if (code.substring(0, 2) === "r_") continue
            if (code.substring(0, 2) === "l_") continue
            if (code === "e") continue
            if (code === "s") continue

            if (code === "r") {
                //e.value = undefined;
                continue;
            }

            if (e.className === "clickableImage") {
                e.value = "[]";
                continue;
            }

            let radio = code.indexOf("_")
            if (radio > -1) {
                let baseCode = code.substr(0, radio)
                if (e.checked) {
                    e.checked = false
                    document.getElementById("display_" + baseCode).value = ""
                }
                let defaultValue;
                try {
                    defaultValue = document.getElementById("default_" + baseCode).value
                } catch (p) {
                    defaultValue = ''
                }
                if (defaultValue !== "") {
                    if (defaultValue === e.value) {
                        e.checked = true
                        document.getElementById("display_" + baseCode).value = defaultValue
                    }
                }
            } else {
                if (e.type === "number" || e.type === "text" || e.type === "hidden") {
                    if ((e.className === "counter") ||
                        (e.className === "timer") ||
                        (e.className === "cycle")) {
                        e.value = 0
                        if (e.className === "timer" || e.className === "cycle") {
                            // Stop interval
                            let timerStatus = document.getElementById("status_" + code);
                            let startButton = document.getElementById("start_" + code);
                            let intervalIdField = document.getElementById("intervalId_" + code);
                            let intervalId = intervalIdField.value;
                            timerStatus.value = 'stopped';
                            startButton.innerHTML = "Start";
                            if (intervalId !== '') {
                                clearInterval(intervalId);
                            }
                            intervalIdField.value = '';
                            if (e.className === "cycle") {
                                document.getElementById("cycletime_" + code).value = "[]"
                                document.getElementById("display_" + code).value = ""
                            }
                        }
                    } else {
                        e.value = ""
                    }
                } else if (e.type === "checkbox") {
                    if (e.checked === true) {
                        e.checked = false
                    }
                } else {
                    console.log("unsupported input type")
                }
            }
        }
        cycles = []

        let auto_specifier = bicycle_component_identifier + 'a'
        let teleop_specifier = bicycle_component_identifier + 't'

        let break_component;
        break_component = document.getElementById(`break_${auto_specifier}break`)
        break_component.setAttribute("nof_cycles", "0")
        break_component.innerHTML = `Auto Cycle Form (${break_component.getAttribute("nof_cycles")}):` + '&nbsp;';
        break_component = document.getElementById(`break_${teleop_specifier}break`)
        break_component.setAttribute("nof_cycles", "0")
        break_component.innerHTML = `Teleop Cycle Form (${break_component.getAttribute("nof_cycles")}):` + '&nbsp;';

        break_component = document.getElementById(`break_${auto_specifier}tf`)
        break_component.setAttribute("total_fuel", "8")
        break_component.innerHTML = `${break_component.getAttribute("total_fuel")}` + ' Fuel&nbsp;'
        break_component = document.getElementById(`break_${teleop_specifier}tf`)
        break_component.setAttribute("total_fuel", "30")
        break_component.innerHTML = `${break_component.getAttribute("total_fuel")}` + ' Fuel&nbsp;'

        clearCycle(auto_specifier)
        clearCycle(teleop_specifier)
        drawFields()
    } catch (e) {
        alert(e)
    }
}


// === Field Handling ===

//auto start rectangles
let autoBoxWidth = 30;
let ys = [8, 30, 66, 84, 120];
let heights = [22, 36, 18, 36, 22];

// Draw fields on
function drawFields(name) {
    let fields = document.querySelectorAll("[id*='canvas_']");
    for (let f of fields) {
        let code = f.id.substring(7);
        let img = document.getElementById("img_" + code);
        let shape = document.getElementById("shape_" + code);
        let shapeArr = shape.value.split(' ');
        let ctx = f.getContext("2d");
        ctx.clearRect(0, 0, f.width, f.height);

        ctx.drawImage(img, 0, 0, f.width, f.height);

        if (shapeArr[0].toLowerCase() === 'circle') {
            for (let x = 78 - autoBoxWidth; x < 226; x += autoBoxWidth + 147) {
                for (let y = 0; y < ys.length; y++) {
                    rectangle(ctx, x, ys[y], autoBoxWidth, heights[y], false);
                }
            }
        }


        let xyStr = document.getElementById("XY_" + code).value
        if (JSON.stringify(xyStr).length > 2) {
            let pts = Array.from(JSON.parse(xyStr))

            let prevX = null;
            let prevY = null;

            for (let p of pts) {
                let coord = p.split(",")
                let centerX = coord[0];
                let centerY = coord[1];
                let radius = 5;
                let drawType = shapeArr[0].toLowerCase()
                if (drawType === 'circle') {  // Should only be for auto start pos {Circle: ctx.arc(centerX, centerY, shapeArr[1], 0, 2 * Math.PI, false);}
                    let x_level = (centerX < 78 && centerX > 78 - autoBoxWidth) ? 78 - autoBoxWidth : ((centerX > 225 && centerX < 225 + autoBoxWidth) ? 225 : -1);
                    let y_level;
                    if (x_level === -1 || (x_level == 225 && getRobot().charAt(0) === "r") || (x_level == 78 - autoBoxWidth && getRobot().charAt(0) === "b")) { continue; }
                    for (y_level = 0; y_level < ys.length - 1; y_level++) {
                        if (centerY > ys[y_level] && centerY <= ys[y_level + 1]) {
                            break;
                        }
                    }

                    rectangle(ctx, x_level, ys[y_level], autoBoxWidth, heights[y_level], true);
                } else {
                    ctx.fillStyle = 'rgba(255, 165, 0, 0.2)'
                    ctx.strokeStyle = '#FFFFFF'

                    ctx.beginPath()
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    ctx.fill()
                    if (prevX != null && prevY != null) {
                        ctx.moveTo(prevX, prevY)
                        ctx.lineTo(centerX, centerY)
                    }

                    ctx.closePath()

                    ctx.stroke()


                    prevX = centerX;
                    prevY = centerY;
                }
            }
        }
    }
}

function rectangle(ctx, x, y, width, height, fill) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);

    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    if (fill) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.fill();
    }
    ctx.closePath();
}

// On field click
function onFieldClick(event) {
    let target = event.target;
    let base = getIdBase(target.id);

    //Resolution height and width (e.g. 52x26)
    let resX = 12;
    let resY = 6;

    let dimensions = document.getElementById("dimensions" + base);
    if (dimensions.value !== "") {
        let arr = dimensions.value.split(' ');
        resX = arr[0];
        resY = arr[1];
    }

    //Turns coordinates into a numeric box
    let box = ((Math.ceil(event.offsetY / target.height * resY) - 1) * resX) + Math.ceil(event.offsetX / target.width * resX);
    let coords = event.offsetX + "," + event.offsetY;

    let allowableResponses = document.getElementById("allowableResponses" + base).value;

    if (allowableResponses !== "none") {
        let allowableResponsesList = allowableResponses.split(',').map(Number);
        if (allowableResponsesList.indexOf(box) === -1) {
            return;
        }
    }

    // Cumulating values
    let changingXY = document.getElementById("XY" + base);
    let changingInput = document.getElementById("input" + base);
    let clickRestriction = document.getElementById("clickRestriction" + base).value;
    let toggleClick = document.getElementById("toggleClick" + base).value;
    let boxArr = Array.from(JSON.parse(changingInput.value));
    let xyArr = Array.from(JSON.parse(changingXY.value));

    if ((toggleClick.toLowerCase() === 'true') &&
        (boxArr.includes(box))) {
        // Remove it
        let idx = boxArr.indexOf(box);
        boxArr.splice(idx, 1);
        xyArr.splice(idx, 1);
        changingInput.value = JSON.stringify(boxArr);
        changingXY.value = JSON.stringify(xyArr);
    } else {
        if (JSON.stringify(changingXY.value).length <= 2) {
            changingXY.value = JSON.stringify([coords]);
            changingInput.value = JSON.stringify([box]);
        } else if (clickRestriction === "one") {
            // Replace box and coords
            changingXY.value = JSON.stringify([coords]);
            changingInput.value = JSON.stringify([box]);
        } else if (clickRestriction === "onePerBox") {
            // Add if box already not in box list/Array
            if (!boxArr.includes(box)) {
                boxArr.push(box);
                changingInput.value = JSON.stringify(boxArr);

                coords = findMiddleOfBox(box, target.width, target.height, resX, resY);
                xyArr.push(coords);
                changingXY.value = JSON.stringify(xyArr);
            }
        } else {
            // No restrictions - add to array
            xyArr.push(coords);
            changingXY.value = JSON.stringify(xyArr);

            boxArr.push(box);
            changingInput.value = JSON.stringify(boxArr);
        }
    }
    let centerX = event.offsetX
    let centerY = event.offsetY
    //anthony alert(centerX + " " + centerY);
    let x_level = (centerX < 78 && centerX > 78 - autoBoxWidth && getRobot().charAt(0) === "r") ? 0 : ((centerX > 225 && centerX < 225 + autoBoxWidth && getRobot().charAt(0) === "b") ? 1 : -1)
    let field_component = document.getElementById('canvas' + base)
    if (x_level == -1 || centerY <= 8 || centerY > 144) {
        return
    }
    let y_level;
    for (y_level = 0; y_level < ys.length - 1; y_level++) {
        if (centerY > ys[y_level] && centerY <= ys[y_level + 1]) {
            break;
        }
    }

    field_component.setAttribute('grid_coords', `${x_level}${y_level}`)
    drawFields()
}

// Finds the middle of a box
function findMiddleOfBox(boxNum, width, height, resX, resY) {
    let boxHeight = height / resY;
    let boxWidth = width / resX;
    let boxX = (boxNum % resX) - 1;
    if (boxX === -1) { boxX = resX - 1 }
    let boxY = Math.floor((boxNum - boxX + 1) / resX);
    let x = Math.round((boxWidth * boxX) + (Math.floor(boxWidth / 2)));
    let y = Math.round((boxHeight * boxY) + (Math.floor(boxHeight / 2)));
    return x + "," + y
}

// Undo some field action?
function undo(event) {
    let undoID = event.firstChild;

    //Getting rid of last value
    let changingXY = document.getElementById("XY" + getIdBase(undoID.id));
    let changingInput = document.getElementById("input" + getIdBase(undoID.id));
    let tempValue = Array.from(JSON.parse(changingXY.value));
    tempValue.pop();
    changingXY.value = JSON.stringify(tempValue);

    tempValue = Array.from(JSON.parse(changingInput.value));
    tempValue.pop();
    changingInput.value = JSON.stringify(tempValue);

    let scoreloc_component = document.getElementById(undoID.id.replace("undo", "canvas"))
    if (Array.from(JSON.parse(changingInput.value)).length == 0) {
        scoreloc_component.setAttribute('boxes', null)
    } else {
        scoreloc_component.setAttribute('boxes', `${changingInput.value}`)
    }

    drawFields();
}

// Flips image
function flip(event) {
    isFlipped = !isFlipped;
    let flipID = event.firstChild;
    let flipImg = document.getElementById("canvas" + getIdBase(flipID.id));
    if (flipImg.style.transform === "") {
        flipImg.style.transform = 'rotate(180deg)';
    } else {
        flipImg.style.transform = '';
    }

    let img = document.getElementById('canvas_cycleascoreloc')
    if (img.style.transform === "") {
        img.style.transform = 'rotate(180deg)';
    } else {
        img.style.transform = '';
    }

    img = document.getElementById('canvas_cycletscoreloc')
    if (img.style.transform === "") {
        img.style.transform = 'rotate(180deg)';
    } else {
        img.style.transform = '';
    }

    drawFields();
}


// === QR & Data Sharing Handling ===

// Regenerates QR code
function qr_regenerate() {
    if (!validateData()) {
        // Don't allow a swipe until all required data is filled in
        return false
    }
    let data = getData(dataFormat)
    qr.makeCode(data)
    let str = 'Event: !EVENT! Match: !MATCH! Robot: !ROBOT! Team: !TEAM!';
    str = str
        .replace('!EVENT!', document.getElementById("input_e").value)
        .replace('!MATCH!', document.getElementById("input_m").value)
        .replace('!ROBOT!', document.getElementById("display_r").value)
        .replace('!TEAM!', document.getElementById("input_t").value);
    document.getElementById("display_qr-info").textContent = str;
    return true
}

// Displays QR data
function displayData() {
    document.getElementById('data').innerHTML = getData(dataFormat);
}

// Copies data to clipboard
function copyData() {
    navigator.clipboard.writeText(getData(dataFormat));
    document.getElementById('copyButton').setAttribute('value', 'Copied');
}


// === Main Onload ===
window.onload = function () {
    let ret = configure();
    if (ret !== -1) {
        let ece = document.getElementById("input_e");  // TODO What is anything?
        let ec = null;
        if (ece !== null) {
            ec = ece.value;
        }
        if (ec !== null) {
            console.log(ec)
            getTeams(ec);
            getSchedule(ec);
        }
        this.drawFields();
    }
    nextStylesheet()
};
