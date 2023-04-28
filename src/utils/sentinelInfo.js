global.sentinelIPAddress = "sentinel address not set";

function init(sentinelIPAddress_, sentinelProtocol_) {
  global._73162ca9_cb43_4b75_8e61_81f2b9e8a674_sentinelInfo = 
    { sentinelIPAddress : sentinelIPAddress_ , 
      sentinelProtocol : sentinelProtocol_
    }
}

function getSentinelIPAddress() {
  return global._73162ca9_cb43_4b75_8e61_81f2b9e8a674_sentinelInfo.sentinelIPAddress;
}

function getSentinelProtocol() {
  return global._73162ca9_cb43_4b75_8e61_81f2b9e8a674_sentinelInfo.sentinelProtocol;
}

export default { getSentinelIPAddress, getSentinelProtocol, init };
