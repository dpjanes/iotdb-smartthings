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
 *  Get devices
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

    var devices_url = "http://graph.api.smartthings.com" + self.endpointd.url + "/" + device_type
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

var sm = new SmartThings()
sm.on("endpoint", function() {
    sm.request_devices("motion")
})
sm.on("devices", function(device_type, devices) {
    console.log(device_type, devices)
})

sm.load_settings()
sm.request_endpoint()
