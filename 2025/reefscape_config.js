const config_data = `
{
    "dataFormat": "kvs",
    "title": "BBQScoutingPASS 2025",
    "page_title": "FRC 2025: REEFSCAPE",
    "checkboxAs": "10",
    "prematch": [
        {
            "name": "Scouter Initials",
            "code": "s",
            "type": "scouter",
            "size": 5,
            "maxSize": 5,
            "defaultValue": "",
            "required": "true"
        },
        {
            "name": "Event",
            "code": "e",
            "type": "event",
            "defaultValue": "2025txcmp1",
            "required": "true"
        },
        {
            "name": "Match Level",
            "code": "l",
            "type": "level",
            "choices": {
                "qm": "Quals<br>",
                "sf": "Semifinals<br>",
                "f": "Finals"
            },
            "defaultValue": "qm",
            "required": "true"
        },
        {
            "name": "Match #",
            "code": "m",
            "type": "match",
            "min": 1,
            "max": 150,
            "defaultValue": 1,
            "required": "true"
        },
        {
            "name": "Robot",
            "code": "r",
            "type": "robot",
            "choices": {
                "r1": "Red-1",
                "b1": "Blue-1<br>",
                "r2": "Red-2",
                "b2": "Blue-2<br>",
                "r3": "Red-3",
                "b3": "Blue-3"
            },
            "required": "true"
        },
        {
            "name": "Team #",
            "code": "t",
            "type": "team",
            "min": 1,
            "max": 99999,
	    "required": "true"
        },
        {
            "name": "Auto Start Position",
            "code": "as",
            "type": "clickable_image",
            "filename": "2025/field_image.png",
            "clickRestriction": "one",
            "shape": "circle 4 white orangered true"
        }
    ],
    "auto": [
        {
            "name": "Left Starting Zone",
            "code": "las",
            "type": "bool"
        },
        {
            "name": "Auto Notes",
            "code": "an",
            "type": "text",
            "size": 15,
	        "defaultValue": "",
            "maxSize": 100
        },
        {
            "name": "Bicycle",
            "code": "teleopbicycle",
            "type": "bicycle",
            "bicycle_id": "auto"
        }
    ],
    "teleop": [
        {
            "name": "Defense Timer",
            "code": "dt",
            "type": "timer"
        },
        {
            "name": "Was Defended",
            "code": "wd",
            "type": "bool"
        },
        {
            "name": "Fouls",
            "code": "fo",
            "type": "counter"
        },
        {
            "name": "Algae Removal",
            "code": "ar",
            "type": "counter"
        },
        {
            "name": "Bicycle",
            "code": "teleopbicycle",
            "type": "bicycle",
            "bicycle_id": "teleop"
        }
    ],
    "endgame": [
        {
            "name": "Barge Status",
            "code": "bs",
            "type": "radio",
            "choices": {
                "s": "Shallow",
                "fs": "Failed<br>",
                "d": "&nbsp;Deep &nbsp;",
                "fd": "Failed<br>",
                "p": "Parked<br>",
                "x": "n/a"
            },
            "defaultValue": "x"
        },
        {
            "name": "Fail Reason",
            "code": "fr",
            "type": "radio",
            "choices": {
                "t": "Time trouble<br>",
                "m": "Mechanism failure<br>",
                "x": "n/a"
            },
            "defaultValue": "x"
        }
    ],
    "postmatch": [
        {
            "name": "Was Fouled",
            "code": "wf",
            "type": "bool"
        },
        {
            "name": "Defense Rating",
            "code": "dr",
            "type": "radio",
            "choices": {
                "0": "Below Average<br>",
                "1": "Average<br>",
                "2": "Good<br>",
                "3": "Excellent<br>",
                "x": "Did not play defense"
            },
            "defaultValue": "x"
        },
        {
            "name": "Tippiness",
            "code": "tip",
            "type": "radio",
            "choices": {
                "4": "Solid<br>",
                "3": "<br>",
                "2": "<br>",
                "1": "<br>",
                "0": "Tipped<br>"
            },
            "defaultValue": "2"
        },
        {
            "name": "Notes",
            "code": "co",
            "type": "text",
            "size": 15,
            "maxSize": 100
        }
    ]
}`;
