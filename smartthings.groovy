/**
 *  smartthings.groovy
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-01
 *
 *  Allow control and monitoring of your SmartThings
 *  using an API.  
 *
 *  A work in progress!
 */

/* --- setup section --- */
/*
 *  The user preferences - SmartThings turns this into an UI.
 *  Make sure that if you change anything related to this in the code
 *  that you update the preferences in your installed apps.
 *
 *  Note that there's a SmartThings magic that's _required_ here,
 *  in that you cannot access a device unless you have it listed
 *  in the preferences. Access to those devices is given through
 *  the name used here (i.e. d_*)
 */
preferences {
    section("Allow IOTDB to Control & Access These Things...") {
        input "d_switch", "capability.switch", title: "Switch", multiple: true
        input "d_motion", "capability.motionSensor", title: "Motion", required: false, multiple: true
        input "d_contact", "capability.contactSensor", title: "Contact", required: false, multiple: true
        input "d_acceleration", "capability.accelerationSensor", title: "Acceleration", required: false, multiple: true
        input "d_presence", "capability.presenceSensor", title: "Presence", required: false, multiple: true
    }
}

/*
 *  The API
 *  - ideally the command/update bit would actually
 *    be a PUT call on the ID to make this restful
 */
mappings {
    path("/:type") {
        action: [
            GET: "_api_list"
        ]
    }
    path("/:type/:id") {
        action: [
            GET: "_api_show"
        ]
    }
    path("/:type/:id/:command") {
        action: [
            GET: "_api_update"
        ]
    }
}

/*
 *  This function is called once when the app is installed
 */
def installed() {
    _event_subscribe()
}

/*
 *  This function is called every time the user changes
 *  their preferences
 */
def updated()
{
    log.debug "updated"
    unsubscribe()
    _event_subscribe()
}

/* --- event section --- */

/*
 *  What events are we interested in. This needs
 *  to be in it's own function because both
 *  updated() and installed() are interested in it.
 */
def _event_subscribe()
{
    subscribe(d_switch, "switch", "_on_event")
    subscribe(d_motion, "motion", "_on_event")
    subscribe(d_contact, "contact", "_on_event")
    subscribe(d_acceleration, "acceleration", "_on_event")
    subscribe(d_presence, "presence", "_on_event")
}

/*
 *  This function is called whenever something changes.
 *  Right now it just 
 */
def _on_event(evt)
{
	def dt = _device_and_type_for_id(evt.deviceId)
    if (!dt) {
	    log.debug "_on_event deviceId=${evt.deviceId} not found?"
        return;
    }
    
    def jd = _device_to_json(dt.device, dt.type)
    log.debug "_on_event deviceId=${jd}"

}

/* --- API section --- */
def _api_list()
{
    _devices_for_type(params.type).collect{
        _device_to_json(it, params.type)
    }
}

def _api_put()
{
    log.debug "${params}"
    [:]
}

def _api_show()
{
	def devices = _devices_for_type(params.type)
    def device = devices.find { it.id == params.id }
    if (!device) {
        httpError(404, "Device not found")
    } else {
    	_device_to_json(device, type)
    }
}

void _api_update()
{
    _do_update(_devices_for_type(params.type), params.type)
}

/*
 *  I don't know what this does but it seems to be needed
 */
def deviceHandler(evt) {
}

/* --- communication section: not done --- */

/*
 *  An example of how to get PushingBox.com to send a message
 */
def _send_pushingbox() {
    log.debug "_send_pushingbox called";

    def devid = "XXXX"
    def messageText = "Hello_World"

    httpGet("http://api.pushingbox.com/pushingbox?devid=${devid}&message=xxx_xxx")
}

/* --- internals --- */
/*
 *  Devices and Types Dictionary
 */
def _dtd()
{
	[ 
    	switch: d_switch, 
    	motion: d_motion, 
        contact: d_contact,
        acceleration: d_acceleration,
        presence: d_presence
    ]
}

def _devices_for_type(type) 
{
    _dtd()[type]
}

def _device_and_type_for_id(id)
{
	def dtd = _dtd()
    log.debug "dtd=${dtd}"
    
    for (dt in _dtd()) {
    	def type = dt.key
        def devices = dt.value
    	for (device in devices) {
        	log.debug "want ${id} got ${device.id}"
        	if (device.id == id) {
            	return [ device: device, type: type ]
            }
        }
    }
}

/*
 *  Perform the operation on the 
 */
private void _do_update(devices, type)
{
    log.debug "_do_update, request: params: ${params}, devices: $devices.id"

    def command = params.command
    if (command) {
        def device = devices.find { it.id == params.id }
        if (!device) {
            httpError(404, "Device not found")
        } else {
            if (command == "toggle") {
                if (device.currentValue('switch') == "on") {
                    device.off();
                } else {
                    device.on();
                }
            } else {
                device."$command"()
            }
        }
    }
}

/*
 *  Convert a single device into a JSONable object
 */
private _device_to_json(device, type) {
	if (!device) {
    	return;
    }

	def vd = [:]
    def jd = [id: device.id, label: device.label, type: type, value: vd];
    
	if (type == "switch") {
    	def s = device.currentState('switch')
        vd['datetime'] = s?.isoDate
    	vd['switch'] = s?.value == "on"
	} else if (type == "motion") {
    	def s = device.currentState('motion')
        vd['datetime'] = s?.isoDate
    	vd['motion'] = s?.value == "active"
	} else if (type == "contact") {
    	def s = device.currentState('contact')
        vd['datetime'] = s?.isoDate
    	vd['contact'] = s?.value == "closed"
	} else if (type == "acceleration") {
    	def s = device.currentState('acceleration')
        vd['datetime'] = s?.isoDate
    	vd['acceleration'] = s?.value == "active"
	} else if (type == "presence") {
    	def s = device.currentState('presence')
        vd['datetime'] = s?.isoDate
    	vd['presence'] = s?.value == "present"
    }
    
    return jd
}

