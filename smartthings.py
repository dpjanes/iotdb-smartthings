#
#   smartthings.py
#
#   David Janes
#   IOTDB.org
#   2014-01-31
#
#   Demonstrate how to use the SmartThings API
#   from Python.
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
#   
#

import requests
import pprint
import json

import iotdb_log

class SmartThings(object):
    def __init__(self, verbose=True):
        self.verbose = verbose
        self.std = {}
        self.endpointds = {}
        self.switchds = {}

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
        self.endpointds = endpoints_response.json()

        if self.verbose: iotdb_log.log(
            "endpoints",
            endpoints_url=endpoints_url,
            endpoints_paramd=endpoints_paramd,
            resultds=self.endpointds,
        )

    def request_switches(self):
        """List the switches"""

        for resultd in self.endpointds:
            switches_url = "http://graph.api.smartthings.com%s/switch" % ( resultd["url"], )
            switches_paramd = {
            }
            switches_headerd = {
                "Authorization": "Bearer %s" % self.std["access_token"],
            }

            switches_response = requests.get(url=switches_url, params=switches_paramd, headers=switches_headerd)
            self.switchds = switches_response.json()
            iotdb_log.log(switchds = self.switchds)
            for switchd in self.switchds:
                switchd['url'] = "%s/%s" % ( switches_url, switchd['id'], )

            if self.verbose: iotdb_log.log(
                "switches",
                url=switches_url,
                paramd=switches_paramd,
                switchds=self.switchds,
            )

    def switch(self, label, command):
        """Send a command the named switch

        Commands are 'on', 'off', 'toggle'. The command
        is basically just appended to the switch URL
        """

        switchd = self.switch_by_label(label)
        if not switchd:
            print >> sys.stderr, "switch '%s' not found" % ( label, )

        if 1:
            command_url = switchd['url']
            command_paramd = {
                "access_token": self.std["access_token"]
            }
            command_headerd = {}
            command_payload = {
                "switch" : "hi there"
            }

            command_response = requests.put(
                url=command_url, 
                params=command_paramd, 
                headers=command_headerd,
                data=json.dumps(command_payload)
            )
        else:
            command_url = switchd['url'] + "/" + command
            command_paramd = {
                "access_token": self.std["access_token"]
            }
            command_headerd = {}

            command_response = requests.get(url=command_url, params=command_paramd, headers=command_headerd)
        if self.verbose: iotdb_log.log(
            "switch-command",
            command=command,
            url=command_url,
            paramd=command_paramd,
            response=command_response,
        )

    def switch_by_label(self, label):
        """Find a switch with the label (or ID)"""

        for switchd in self.switchds:
            if label == ( switchd.get('label') or switchd.get('id') ):
                return switchd
            

if __name__ == '__main__':
    st = SmartThings()
    st.load_settings()
    st.request_endpoints()
    st.request_switches()
    st.switch('My Z-Wave Switch', 'toggle')
