global.sentinelIPAddress = "sentinel address not set";

function init(sentinelIPAddress_) {
  global._73162ca9_cb43_4b75_8e61_81f2b9e8a674_sentinelIPAddress = sentinelIPAddress_;
}

function getSentinelIPAddress() {
  return global._73162ca9_cb43_4b75_8e61_81f2b9e8a674_sentinelIPAddress;
}

export default { getSentinelIPAddress, init };
