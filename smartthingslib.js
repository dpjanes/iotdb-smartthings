/*
 *  smartthingslib.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-01
 *
 *  Library for interfacing with smartthings
 */

"use strict"

var unirest = require('unirest')

var fs = require('fs')
var util = require('util')
var events = require('events')

var SmartThings = function() {
    var self = this;

    events.EventEmitter.call(self);

    self.std = {}
    self.endpointd = {}
}
util.inherits(SmartThings, events.EventEmitter);

/**
 *  Explicitly make the settings
 */
SmartThings.prototype.configure = function(paramd) {
    var self = this;

    paramd = paramd || {};

    self.std = {};
    self.std.client_id = paramd.client_id || "";
    self.std.access_token = paramd.access_token || "";
    self.std.api = paramd.api || "https://graph.api.smartthings.com/api/smartapps/endpoints/" + self.std.client_id;
    self.std.api_location = paramd.api_location || "graph.api.smartthings.com";
};

/**
 *  Load the JSON Settings file. 
 *
 *  <p>
 *  See the documentation, but briefly you can get it from here:
 *  {@link https://iotdb.org/playground/oauthorize}
 */
SmartThings.prototype.load_settings = function(filename) {
    var self = this;

    if (!filename) filename = "smartthings.json";

    var data = fs.readFileSync(filename, 'utf8')
    self.std = JSON.parse(data);
}

/**
 *  Get the endpoints exposed by the SmartThings App.
 *
 *  <p>
 *  When the endpoints are found, we emit an 'endpoint' event.
 *  The endpoint itself will be stored in the SmartThings object
 *
 *  <p>
 *  The first command you need to call
 */
SmartThings.prototype.request_endpoint = function() {
    var self = this;

    var endpoints_url = self.std["api"]
    var endpoints_paramd = {
        "access_token": self.std["access_token"]
    }

    unirest
        .get(endpoints_url)
        .query(endpoints_paramd)
        .end(function(result) {
            if (!result.ok) {
                console.log("SmartThings.request_endpoints", "something went wrong", result);
                return;
            }

            self.endpointd = result.body[0]
            self.emit("endpoint", self)
        });
}

/**
 *  Get devices.
 *  <p>
 *  When devices are found, we emit a "devices" event
 *
 *  @param {string} device_type
 *  The type of device to request, i.e.
 *  switch, motion, acceleration, contact, presence
 */
SmartThings.prototype.request_devices = function(device_type) {
    var self = this;

    if (!self.endpointd.url) {
        console.log("SmartThings.request_devices: no endpoint? Perhaps .request_endpoint has not been called")
        return
    }

    var devices_url = "https://graph.api.smartthings.com" + self.endpointd.url + "/" + device_type
    var devices_paramd = {
    }
    var devices_headerd = {
        "Authorization": "Bearer " + self.std["access_token"]
    }
    
    unirest
        .get(devices_url)
        .query(devices_paramd)
        .headers(devices_headerd)
        .end(function(result) {
            if (!result.ok) {
                console.log("SmartThings.request_devices", "something went wrong", 
                    "\n url=", devices_url,
                    "\n error=", result.error, 
                    "\n body=", result.body
                );
                return;
            }

            self.emit("devices", device_type, result.body)
        });
}

/**
 *  Send a request to a device
 *
 *  @param {dictionary} device
 *  A device dictionary, as found by {@link request_devices}
 *
 *  @param {dictionary} requestd
 *  A request dictinary, for example something like
 *  <code>{ switch: 1 }</code>
 */
SmartThings.prototype.device_request = function(deviced, requestd) {
    var self = this;

    if (!self.endpointd.url) {
        console.log("SmartThings.device_request: no endpoint? Perhaps .request_endpoint has not been called")
        return
    }

    var devices_url = "https://graph.api.smartthings.com" + self.endpointd.url + "/" + deviced.type + "/" + deviced.id;
    var devices_paramd = {
        "access_token": self.std["access_token"]
    }
    var devices_headerd = {
        "Authorization": "Bearer " + self.std["access_token"]
    }
    
    unirest
        .put(devices_url)
        .type('json')
        .send(requestd)
        .headers(devices_headerd)
        .end(function(result) {
            if (!result.ok) {
                console.log("SmartThings.device_request", "something went wrong", 
                    "\n url=", devices_url,
                    "\n error=", result.error, 
                    "\n body=", result.body
                );
                return;
            }

            self.emit("request", deviced)
        });
}

exports.SmartThings = SmartThings
exports.device_types = [
    "switch",
    "motion",
    "presence",
    "acceleration",
    "contact",
    "temperature",
    "battery",
    "threeAxis",
];
