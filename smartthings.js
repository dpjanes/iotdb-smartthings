/*
 *  smartthings.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-01
 *
 *  Demonstrate how to use the SmartThings API from Node
 *
 *  See also:
 *  Example App explanation:
 *  http://build.smartthings.com/blog/tutorial-creating-a-custom-rest-smartapp-endpoint/
 *
 *  Example PHP code:
 *  https://www.dropbox.com/s/7m7gmlr9q3u7rmk/exampleOauth.php
 *
 *  Example "Groovy"/SMART code  (this is the app we tap into)
 *  https://www.dropbox.com/s/lohzziy2wjlrppb/endpointExample.groovy
 */

"use strict";

var unirest = require('unirest');

var fs = require('fs');
var util = require('util');
var events = require('events');
var minimist = require('minimist');

var SmartThings = require("./smartthingslib").SmartThings;

var ad = require('minimist')(process.argv.slice(2), {
    boolean: ["poll"]
});

var sm = new SmartThings();
sm.on("endpoint", function () {
    sm.request_devices(ad.type);
});
sm.on("devices", function (device_type, devices) {
    var di;
    var device;

    if (ad.device_id) {
        var ds = [];
        for (di in devices) {
            device = devices[di];
            if ((device.id === ad.device_id) || (device.label === ad.device_id)) {
                ds.push(device);
            }
        }
        devices = ds;
    }

    if (ad.request) {
        for (di in devices) {
            device = devices[di];
            sm.device_request(device, ad.request);
        }
    } else if (ad.poll && ad.device_id) {
        var _on_state = function (error, _deviced, _stated) {
            console.log(JSON.stringify(_stated, null, 2));
        };
        for (di in devices) {
            device = devices[di];
            sm.device_poll(device, _on_state);
        }
    } else {
        console.log(JSON.stringify(devices, null, 2));
    }

});

var help = function () {
    console.log("usage:", process.argv[1], "[arguments...]");
    console.log("");
    console.log("--type <device_type>");
    console.log("  the device type (required), one of switch, motion, presence, acceleration, …");
    console.log("  …contact, temperature, battery, threeAxis");
    console.log("");
    console.log("--device_id <device_id>");
    console.log("  the ID or Name of the device to manipulate");
    console.log("");
    console.log("--request <something=value>");
    console.log("  something to do, e.g. 'switch=1', 'switch=0'");
    console.log("");
    console.log("--poll");
    console.log("  request the device's state (must be paired with device_id");

};

if (Object.keys(ad).length === 1) {
    help();
    process.exit(1);
}
if (!ad.type) {
    console.log("error:");
    console.log("  --type <device_type> is required");
    console.log("");
    help();
    process.exit(1);
}
if (ad.request) {
    var parts = ad.request.split("=", 2);
    if (parts.length !== 2) {
        console.log("error:");
        console.log("  --request requires an argument like 'switch=1'");
        console.log("");
        help();
        process.exit(1);
    }
    ad.request = {};
    ad.request[parts[0]] = parseInt(parts[1]);
}

sm.load_settings();
sm.request_endpoint();
