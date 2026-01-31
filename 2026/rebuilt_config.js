const config_data = `
{
    "dataFormat": "kvs",
    "title": "SteakOut 2026",
    "page_title": "SteakOut 2026: REBUILT",
    "checkboxAs": "10",
    "prematch": [
        {
            "name": "Scouter Name",
            "code": "s",
            "type": "scouter",
            "size": 10,
            "maxSize": 7,
            "defaultValue": "",
            "required": "true"
        },
        {
            "name": "Event",
            "code": "e",
            "type": "event",
            "defaultValue": "2026txbel",
            "size": 10,
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
                "r1": "Red 1",
                "b1": "Blue 1<br>",
                "r2": "Red 2",
                "b2": "Blue 2<br>",
                "r3": "Red 3",
                "b3": "Blue 3"
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
            "filename": "2026/field_image.png",
            "clickRestriction": "one",
            "shape": "circle 4 white orangered true"
        }
    ],
    "auto": [
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
            "name": "Robot Niche",
            "code": "rn",
            "type": "radio",
            "choices": {
                "cl": "Cleaner&ensp;",
                "cy": "Cycler<br>",
                "pa": "Passer&emsp;",
                "de": "Defense"
            },
            "defaultValue": "cy"
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
            "name": "Climb Status",
            "code": "cs",
            "type": "radio",
            "choices": {
                "l3": "L3",
                "f3": "Failed<br>",
                "l2": "L2",
                "f2": "Failed<br>",
                "l1": "L1",
                "f1": "Failed<br>",
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
            "name": "Defense Notes",
            "code": "dn",
            "type": "text",
            "size": 15,
            "defaultValue": ""
        },
        {
            "name": "Notes",
            "code": "co",
            "type": "text",
            "size": 15
        }
    ]
}`;