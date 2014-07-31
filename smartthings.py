#
#   smartthings.py
#
#   David Janes
#   IOTDB.org
#   2014-01-31
#
#   Demonstrate how to use the SmartThings API from Python.
#
#   See also:
#   Example App explanation:
#   http://build.smartthings.com/blog/tutorial-creating-a-custom-rest-smartapp-endpoint/
#
#   Example PHP code:
#   https://www.dropbox.com/s/7m7gmlr9q3u7rmk/exampleOauth.php
#
#   Example "Groovy"/SMART code  (this is the app we tap into)
#   https://www.dropbox.com/s/lohzziy2wjlrppb/endpointExample.groovy
#

import sys
import requests
import pprint
import json

## import httplib
## httplib.HTTPConnection.debuglevel = 1

from optparse import OptionParser

try:
    import iotdb_log
except:
    class iotdb_log(object):
        @staticmethod
        def log(**ad):
            pprint.pprint(ad)

class SmartThings(object):
    def __init__(self, verbose=True):
        self.verbose = verbose
        self.std = {}
        self.endpointd = {}
        self.deviceds = {}

    def load_settings(self, filename="smartthings.json"):
        """Load the JSON Settings file. 
        
        See the documentation, but briefly you can
        get it from here:
        https://iotdb.org/playground/oauthorize
        """

        with open(filename) as fin:
            self.std = json.load(fin)

    def request_endpoints(self):
        """Get the endpoints exposed by the SmartThings App
        
        The first command you need to call
        """

        endpoints_url = self.std["api"]
        endpoints_paramd = {
            "access_token": self.std["access_token"]
        }

        endpoints_response = requests.get(url=endpoints_url, params=endpoints_paramd)
        self.endpointd = endpoints_response.json()[0]

        if self.verbose: iotdb_log.log(
            "endpoints",
            endpoints_url=endpoints_url,
            endpoints_paramd=endpoints_paramd,
            resultds=self.endpointd,
        )

    def request_devices(self, device_type):
        """List the devices"""

        devices_url = "https://graph.api.smartthings.com%s/%s" % ( self.endpointd["url"], device_type, )
        devices_paramd = {
        }
        devices_headerd = {
            "Authorization": "Bearer %s" % self.std["access_token"],
        }

        devices_response = requests.get(url=devices_url, params=devices_paramd, headers=devices_headerd)
        self.deviceds = devices_response.json()
        for switchd in self.deviceds:
            switchd['url'] = "%s/%s" % ( devices_url, switchd['id'], )

        if self.verbose: iotdb_log.log(
            "devices",
            url=devices_url,
            paramd=devices_paramd,
            deviceds=self.deviceds,
        )

        return self.deviceds

    def device_request(self, deviced, requestd):
        """Send a request the named device"""

        command_url = deviced['url']
        command_paramd = {
            "access_token": self.std["access_token"]
        }
        command_headerd = {}

        command_response = requests.put(
            url=command_url, 
            params=command_paramd, 
            headers=command_headerd,
            data=json.dumps(requestd)
        )

if __name__ == '__main__':
    dtypes = [ 
        "switch", "motion", "presence", "acceleration", "contact", 
        "temperature", "battery", "acceleration", "threeAxis",
    ]

    parser = OptionParser()
    parser.add_option(
        "", "--debug",
        default = False,
        action = "store_true",
        dest = "debug",
        help = "",
    )
    parser.add_option(
        "", "--verbose",
        default = False,
        action = "store_true",
        dest = "verbose",
        help = "",
    )
    parser.add_option(
        "", "--type",
        dest = "device_type",
        help = "The device type (required), one of %s" % ", ".join(dtypes)
    )
    parser.add_option(
        "", "--id",
        dest = "device_id",
        help = "The ID or Name of the device to manipulate"
    )
    parser.add_option(
        "", "--request",
        dest = "request",
        help = "Something to do, e.g. 'switch=1', 'switch=0'"
    )

    (options, args) = parser.parse_args()

    if not options.device_type:
        print >> sys.stderr, "%s: --type <%s>" % ( sys.argv[0], "|".join(dtypes))
        parser.print_help(sys.stderr)
        sys.exit(1)
        

    st = SmartThings(verbose=options.verbose)
    st.load_settings()
    st.request_endpoints()

    ds = st.request_devices(options.device_type)

    if options.device_id:
        ds = filter(lambda d: options.device_id in [ d.get("id"), d.get("label"), ], ds)

    if options.request:
        key, value = options.request.split('=', 2)
        try:
            value = int(value)
        except ValueError:
            pass

        requestd = {
            key: value
        }

        for d in ds:
            iotdb_log.log(device=d, request=requestd)
            st.device_request(d, requestd)

    else:
        print json.dumps(ds, indent=2, sort_keys=True)
