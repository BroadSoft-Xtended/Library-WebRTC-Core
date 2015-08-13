# WebRTC Core

## Cookie Config

Persists the properties inside cookies with the prefix bdsft_cookieconfig_<property\>.

Namespace : bdsft_webrtc.default.core.cookieconfig

### Properties
<a name="cookieconfig_properties"></a>

Property              |Type     |Description
----------------------|---------|--------------------------------------------------------------
authenticationUserid  |string   |The Authentication User ID used for registration.
displayName           |string   |The SIP display name.
displayResolution     |string   |The display resolution for the calls.
enableAutoAnswer      |boolean  |True if an incoming call should be automatically answered.
enableSelfView        |boolean  |True if the self view should be enabled.
encodingResolution    |string   |The encoding resolution for the calls.
hd                    |boolean  |True if an encoding resolution of 1280 x 720 should be used.
password              |string   |The password used for registration.
userid                |string   |The SIP User ID used for registration.

# Event Bus

Managing events through a publish/subscribe pattern.

Namespace : bdsft_webrtc.default.core.eventbus

## Events
<a name="eventbus_events"></a>

<table>
<tr>
	<th>Event</th><th>Parameters</th><th>Description</th>
</tr>
	<tr>
	<td>calling</td>
	<td>{<br>destination : string,<br>session : ExSIP.RTCSession<br>}</td>
	<td>An outgoing call has been placed</td>
	</tr>
	<tr>
	<td>dataReceived</td>
	<td>{<br/> data : string {<br/>}</td>
	<td>Data has been received through the ExSIP.DataChannel.</td>
	</tr>
	<tr>
	<td>dataSent</td>
	<td>{<br/> data : string {<br/>}</td>
	<td>Data has been sent through the ExSIP.DataChannel.</td>
	</tr>
	<tr>
	<td>digit</td>
	<td>{<br/> digit : 0 – 9 or \* or \#,<br\> isFromDestination : true if event source is destination input <br/>}</td>
	<td>DMTF digit has been pressed.</td>
	</tr>
	<tr>
	<td>endCall</td>
	<td></td>
	<td>Ends the call.</td>
	</tr>
	<tr>
	<td>ended</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> message : ExSIP.SIPMessage,<br\> cause: string<br/>}</td>
	<td>The call has been ended.</td>
	</tr>
	<tr>
	<td>failed</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> message : ExSIP.SIPMessage,<br\> cause: string<br/>}</td>
	<td>The call has failed.</td>
	</tr>
	<tr>
	<td>held</td>
	<td>ExSIP.RTCSession</td>
	<td>The call has been put on hold.</td>
	</tr>
	<tr>
	<td>iceclosed</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> response: ExSIP.SIPMessage<br/>}</td>
	<td>Fired when the iceConnectionState of the peerConnection is closed.</td>
	</tr>
	<tr>
	<td>icecompleted</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> response: ExSIP.SIPMessage<br/>}</td>
	<td>Fired when the iceConnectionState of the peerConnection is completed.</td>
	</tr>
	<tr>
	<td>iceconnected</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> response: ExSIP.SIPMessage<br/>}</td>
	<td>Fired when the iceConnectionState of the peerConnection is connected.</td>
	</tr>
	<tr>
	<td>incomingCall</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> session: ExSIP.RTCSession,<br\> request: ExSIP.SIPMessage<br/>}</td>
	<td>An incoming call has been received.</td>
	</tr>
	<tr>
	<td>modifier</td>
	<td>{<br/> which : integer of the keyboard key <br/>}</td>
	<td>The alt and another key have been pressed.</td>
	</tr>
	<tr>
	<td>newDTMF</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> dtmf : ExSIP.DTMF,<br\> tone : char<br/>}</td>
	<td>A DTMF tone has been sent.</td>
	</tr>
	<tr>
	<td>progress</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> response: ExSIP.SIPMessage<br/>}</td>
	<td>The incoming call has been progressed.</td>
	</tr>
	<tr>
	<td>reInvite</td>
	<td>{<br/> session : ExSIP.RTCSession,<br\> request: ExSIP.SIPMessage<br/>}</td>
	<td>A reInvite has occured for the session.</td>
	</tr>
	<tr>
	<td>resumed</td>
	<td>ExSIP.RTCSession</td>
	<td>The call has been resumed.</td>
	</tr>
	<tr>
	<td>started</td>
	<td>{<br/> originator : 'local' or 'remote',<br\> response: ExSIP.SIPMessage<br/>}</td>
	<td>The call has been started.</td>
	</tr>
	<tr>
	<td>userMediaUpdated</td>
	<td>localStream: the local media stream</td>
	<td>The user's local media stream has been updated.</td>
	</tr>
</table>

## Url Config

Handles configuration through URL parameters.

Namespace : bdsft_webrtc.default.core.urlconfig

### Properties
<a name="urlconfig_properties"></a>

Property/URL Parameter  |Type     |Description
------------------------|---------|-------------------------------------------------------------------------------
audioOnly               |boolean  |True for audio only calling.
destination             |string   |The destination to call.
displayName             |string   |The SIP display name.
displayResolution       |string   |The display resolution for the calls.
enableMessages          |boolean  |True to disable the message display.
encodingResolution      |string   |The encoding resolution for the calls.
endCallURL              |string   |URL of the location to navigate to if a call ends or fails.
features                |integer  |Enables the features through a bit set. (see setFeatures() below for details)
hd                      |boolean  |True if an encoding resolution of 1280 x 720 should be used.
maxCallLength           |integer  |The maximum time limit of a call in seconds.
networkUserId           |string   |The SIP User ID used for non registered calling.

### Methods
<a name="urlconfig_methods"></a>

<table>
	<tr>
	<th>Method</th>
	<th>Parameters</th>
	<th>Description</th>
	</tr>
	<tr>
	<td>getFeatures()</td>
	<td></td>
	<td>Returns all enabled features as bit set.</td>
	</tr>
	<tr>
	<td>setFeatures(flags)</td>
	<td>flags : integer as bit set<br>
	enableCallControl: 1 <br>
	enableCallTimer: 2 <br>
   enableCallHistory: 4 <br>
   enableFullscreen: 8 <br>
   enableSelfView: 16 <br>
   enableCallStats: 32 <br>
   enableScreenshare: 64 <br>
   enableMute: 128 <br>
   enableMessages: 256 <br>
   enableRegistrationIcon: 512 <br>
   enableConnectionIcon: 1024 <br>
   enableSettings: 2048 <br>
   enableAutoAnswer: 4096 <br>
   enableConnectLocalMedia: 8192 <br>
   enableTransfer: 16384 <br>
   enableHold: 32768 <br>
   enableIms: 65536 <br>
	</td>
	<td>Enables the features through a bit set.<br><br>
	In order to enable features add the values of the features that you want to set, <br><br>eg. in order to set enableCallHistory and enableMute the value of the features URI parameter would be<br><br>
	4 (enableCallHistory) + 128 (enableMute) = 132
	</td>
	</tr>
	<tr>
	<td>setViewAudio()</td>
	<td></td>
	<td>Sets the view to audioOnly.</td>
	</tr>
	<tr>
	<td>setViewVideo()</td>
	<td></td>
	<td>Sets the view to audio and video.</td>
	</tr>	
</table>
