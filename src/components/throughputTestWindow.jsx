import React from "react";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";

import Defs from "iipzy-shared/src/defs";

import eventManager from "../ipc/eventManager";
import toSentinel from "../ipc/toSentinel";

import cookie from "../utils/cookie";

import Gauge from "./gauge";
import Navigator from "./navigator";

let app = null;

class ThroughputTestWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("ThroughputTestWindow.constructor");

    this.state = {
      timeOfTest: null,
      downloadBloat: 0,
      uploadBloat: 0,
      nominalLatency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
      inTest: false,
      hideButton: false,
      isLoggedIn: false,
      failedToGetServer: false,
      errorMessage: "",
      // progress indicators
      numTicksNominalLatency: 0,
      tickNumNominalLatency: 0,
      numTicksIperf3Down: 0,
      tickNumIperf3Down: 0,
      numTicksIperf3Up: 0,
      tickNumIperf3Up: 0
    };

    app = this;
  }

  componentDidMount() {
    console.log("ThroughputTestWindow.componentDidMount");
    toSentinel.send(Defs.ipcThroughputTestWindowMount, {
      position: ThroughputTestWindow.position
    });
  }

  componentWillUnmount() {
    console.log("ThroughputTestWindow.componentWillUnmount");
    app = null;
  }

  log(str) {
    console.log(str);
  }

  getActive() {
    return this.state.inTest;
  }

  getButtonVisibility() {
    console.log(
      "throughputTestWindow.getButtonVisibility: hide=" + this.state.hideButton
    );
    return ThroughputTestWindow.position !== 1 || this.state.hideButton
      ? "hidden"
      : "visible";
    // for test - return this.state.hideButton ? "hidden" : "visible";
  }

  isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }

  getTimeOfTest() {
    console.log(
      "throughputTestWindow.getTimeOfTest: " +
        JSON.stringify(this.state.timeOfTest)
    );
    if (this.isPlainObject(this.state.timeOfTest)) return "<time-of-test>";
    return this.state.timeOfTest;
  }

  getNominalLatency() {
    return this.state.nominalLatency;
  }

  getDownloadBloat() {
    return this.state.downloadBloat;
  }

  getUploadBloat() {
    return this.state.uploadBloat;
  }

  getDownloadThroughput() {
    console.log(
      "throughputTestWindow.downloadThroughput = " +
        this.state.downloadThroughput
    );
    return this.state.downloadThroughput;
  }

  getUploadThroughput() {
    console.log(
      "throughputTestWindow.uploadThroughput = " + this.state.uploadThroughput
    );
    return this.state.uploadThroughput;
  }

  getProgressNominalLatency() {
    console.log("throughputTestWindow.getProgressNominalLatency");

    const numTicks = this.state.numTicksNominalLatency;
    const tickNum = this.state.tickNumNominalLatency;
    // percentage done
    console.log(
      "throughputTestWindow.getProgressNominalLatency, numTicks = " +
        numTicks +
        ", tickNum = " +
        tickNum
    );
    if (numTicks <= 0 || tickNum <= 0) return 0;
    return (tickNum / numTicks) * 100;
  }

  getProgressIperf3Down() {
    console.log("throughputTestWindow.getProgressIperf3Down");

    const numTicks = this.state.numTicksIperf3Down;
    const tickNum = this.state.tickNumIperf3Down;
    // percentage done

    if (numTicks <= 0 || tickNum <= 0) return 0;
    return (tickNum / numTicks) * 100;
  }

  getProgressIperf3Up() {
    console.log("throughputTestWindow.getProgressIperf3Up");

    const numTicks = this.state.numTicksIperf3Up;
    const tickNum = this.state.tickNumIperf3Up;
    // percentage done
    if (numTicks <= 0 || tickNum <= 0) return 0;
    return (tickNum / numTicks) * 100;
  }

  getDisabledLeftButton() {
    return ThroughputTestWindow.position === -1;
  }

  getDisabledRightButton() {
    return ThroughputTestWindow.position === 1;
  }

  getDisabledNewestButton() {
    return ThroughputTestWindow.position === 1;
  }

  getDisabledOldestButton() {
    return ThroughputTestWindow.position === -1;
  }

  handleLoginStatus() {
    console.log("throughputTestWindow.handleLoginStatus");
    this.setState({
      isLoggedIn: ThroughputTestWindow.isLoggedIn
    });
  }

  handleFailedToGetServer(message) {
    this.setState({
      failedToGetServer: true,
      errorMessage: message
    });
  }

  handleBeginTestClick(ev) {
    console.log("throughputTestWindow.handleBeginTestClick");
    const data = {
      nominalLatencyTestDurationSeconds: parseInt(
        cookie.get("nominalLatencySeconds", 10)
      ),
      downloadThroughputTestDurationSeconds: parseInt(
        cookie.get("downloadSeconds", 10)
      ),
      uploadThroughputTestDurationSeconds: parseInt(
        cookie.get("uploadSeconds", 10)
      )
    };
    toSentinel.send(Defs.ipcThroughputTestWindowStart, data);
    this.setState({
      inTest: true,
      hideButton: true,
      failedToGetServer: false
    });
  }

  handleCancelTestClick(ev) {
    console.log("throughputTestWindow.handleCancelTestClick");
    toSentinel.send(Defs.ipcThroughputTestWindowCancel, {});
    this.setState({
      inTest: true,
      hideButton: true,
      failedToGetServer: false
    });
  }

  handleLoginClick(ev) {
    console.log("throughputTestWindow.handleLoginClick");
    toSentinel.send(Defs.ipcLinkTo, Defs.urlLogin);
  }

  handleClearDials(jsonResults) {
    this.setState({
      timeOfTest: null,
      downloadBloat: 0,
      uploadBloat: 0,
      nominalLatency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
      numTicksNominalLatency: 0,
      tickNumNominalLatency: 0,
      numTicksIperf3Down: 0,
      tickNumIperf3Down: 0,
      numTicksIperf3Up: 0,
      tickNumIperf3Up: 0
    });
  }

  handleTestingState(jsonResults) {
    if (jsonResults === "{}") return;

    console.log("throughputTestWindow.handleTestingState: " + jsonResults);

    const ret = JSON.parse(jsonResults);
    if (ret) {
      const {
        testState: _testState,
        hideButton: _hideButton,
        testBusy: _testBusy,
        failed: _failed
      } = ret;

      if (typeof _testState !== "undefined") {
        const hideButton =
          typeof _hideButton !== "undefined" ? _hideButton : false;

        this.setState({
          inTest: _testState,
          hideButton
        });
      }
    }
  }

  handleStatusNominalLatency(timeMillis) {
    this.setState({ nominalLatency: this.roundToTwo(timeMillis) });
  }

  handleStatusNominalLatencyFinal(avgMillis) {
    this.setState({ nominalLatency: this.roundToTwo(avgMillis) });
  }

  handleStatusIperf3Down(mbitsPerSec) {
    this.log("throughputTestWindow.handleStatusIperf3Down: " + mbitsPerSec);

    this.setState({ downloadThroughput: this.roundToTwo(mbitsPerSec) });
  }

  handleStatusIperf3Up(mbitsPerSec) {
    console.log("throughputTestWindow.handleStatusIperf3Up: " + mbitsPerSec);

    this.setState({ uploadThroughput: this.roundToTwo(mbitsPerSec) });
  }

  handleProgressNominalLatency(data) {
    const { numTicks, tickNum } = data;

    this.setState({
      numTicksNominalLatency: numTicks,
      tickNumNominalLatency: tickNum
    });
  }

  roundToTwo(num) {
    return +(Math.round(num + "e+1") + "e-1");
  }

  handleProgressIperf3Down(data) {
    const { numTicks, tickNum } = data;

    this.setState({
      numTicksIperf3Down: numTicks,
      tickNumIperf3Down: tickNum
    });
  }

  handleProgressIperf3Up(data) {
    const { numTicks, tickNum } = data;

    this.setState({
      numTicksIperf3Up: numTicks,
      tickNumIperf3Up: tickNum
    });
  }

  handleBloatLatencyIperf3Down(sampleMillis) {
    console.log(
      "throughputTestWindow.handleBloatLatencyIperf3Down: " +
        sampleMillis +
        ", typeof= " +
        typeof sampleMillis
    );

    this.setState({ downloadBloat: this.roundToTwo(sampleMillis) });
  }

  handleBloatLatencyIperf3Up(sampleMillis) {
    console.log(
      "throughputTestWindow.handleBloatLatencyIperf3Up: " + sampleMillis
    );

    this.setState({ uploadBloat: this.roundToTwo(sampleMillis) });
  }

  handleTimeOfTest(timeOfTest) {
    console.log(
      "throughputTestWindow.handleTimeOfTest: " + JSON.stringify(timeOfTest)
    );
    this.setState({ timeOfTest });
  }

  handleThroughputTestStatus(data) {
    console.log("throughputTestWindow.handleThroughputTestStatus");
    const response = JSON.parse(data);
    console.log(JSON.stringify(response, null, 2));
    ThroughputTestWindow.position = response.position;
    const status = response.status;
    this.setState({
      timeOfTest: status.timeOfTest,
      numTicksNominalLatency: status.nominalLatency.numTicks,
      tickNumNominalLatency: status.nominalLatency.tickNum,
      nominalLatency: this.roundToTwo(status.nominalLatencyMillis),
      numTicksIperf3Down: status.tickStatusIperf3Down.numTicks,
      tickNumIperf3Down: status.tickStatusIperf3Down.tickNum,
      numTicksIperf3Up: status.tickStatusIperf3Up.numTicks,
      tickNumIperf3Up: status.tickStatusIperf3Up.tickNum,
      downloadThroughput: this.roundToTwo(status.downloadThroughputMBits),
      downloadBloat: this.roundToTwo(status.downloadBloatMillis),
      uploadThroughput: this.roundToTwo(status.uploadThroughputMBits),
      uploadBloat: this.roundToTwo(status.uploadBloatMillis)
    });
  }

  handleLeftClick(ev) {
    console.log("throughputTestWindow.handleLeftClick");
    toSentinel.send(Defs.ipcThroughputTestWindowButtonLeft, 1);
  }

  handleRightClick(ev) {
    console.log("throughputTestWindow.handleRightClick");
    toSentinel.send(Defs.ipcThroughputTestWindowButtonRight, 1);
  }

  handleNewestClick(ev) {
    console.log("throughputTestWindow.handleNewestClick");
    toSentinel.send(Defs.ipcThroughputTestWindowButtonNewest, 1);
  }

  handleOldestClick(ev) {
    console.log("throughputTestWindow.handleOldestClick");
    toSentinel.send(Defs.ipcThroughputTestWindowButtonOldest, 1);
  }

  render() {
    console.log("throughputTestWindow.throughputTestWindow render");

    const isLoggedIn = ThroughputTestWindow.isLoggedIn;
    const failedToGetServer = this.state.failedToGetServer;
    const errorMessage = this.state.errorMessage;
    const displayResults =
      !failedToGetServer && !this.state.inTest && this.state.timeOfTest;

    return (
      <div>
        <Navigator />
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "140%" }}>Speed Test</p>
        </div>
        {!isLoggedIn && (
          <div style={{ marginLeft: 20, textAlign: "left" }}>
            <p style={{ fontSize: "140%" }}>
              You must be logged in to run Speed Test
            </p>
            <Button
              type="button"
              variant="contained"
              style={{
                width: "130px",
                color: "#0000b0"
              }}
              autoFocus
              onClick={ev => this.handleLoginClick(ev)}
            >
              Login
            </Button>
          </div>
        )}
        {isLoggedIn && (
          <div style={{ marginLeft: 15, marginTop: -20 }}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <Gauge
                      value={this.getNominalLatency()}
                      progress={this.getProgressNominalLatency()}
                      active={this.getActive()}
                      label={"Latency"}
                    />
                    <div
                      style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: "1000",
                        left: "0px",
                        top: "-112px"
                      }}
                    >
                      <span
                        style={{
                          position: "relative",
                          font: "12px sans-serif",
                          zIndex: 1000,
                          top: 0,
                          left: 0
                        }}
                      >
                        {this.getNominalLatency()} ms
                      </span>
                    </div>
                  </td>
                  <td>
                    <Gauge
                      value={this.getDownloadThroughput()}
                      progress={this.getProgressIperf3Down()}
                      active={this.getActive()}
                      label={"Download"}
                    />
                    <div
                      style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: "1000",
                        left: "0px",
                        top: "-112px"
                      }}
                    >
                      <span
                        style={{
                          position: "relative",
                          font: "12px sans-serif",
                          zIndex: 1000,
                          top: 0,
                          left: 0
                        }}
                      >
                        Bloat:{this.getDownloadBloat()} ms
                      </span>
                    </div>
                  </td>
                  <td>
                    <Gauge
                      value={this.getUploadThroughput()}
                      progress={this.getProgressIperf3Up()}
                      active={this.getActive()}
                      label={"Upload"}
                    />
                    <div
                      style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: "1000",
                        left: "0px",
                        top: "-112px"
                      }}
                    >
                      <span
                        style={{
                          position: "relative",
                          font: "12px sans-serif",
                          zIndex: 1000,
                          top: 0,
                          left: 0
                        }}
                      >
                        Bloat:{this.getUploadBloat()} ms
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td />
                  <td>
                    <div style={{ textAlign: "center" }}>
                      <Button
                        type="button"
                        variant="contained"
                        style={{
                          width: "130px",
                          color: "#0000b0",
                          visibility: this.getButtonVisibility()
                        }}
                        autoFocus
                        onClick={
                          this.getActive()
                            ? ev => this.handleCancelTestClick(ev)
                            : ev => this.handleBeginTestClick(ev)
                        }
                      >
                        {this.getActive() ? "Cancel" : "Start"}
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {displayResults && (
              <div>
                <table
                  class="border-iipzy"
                  style={{ margin: "20px 0px 0px 20px" }}
                >
                  <tbody>
                    <tr>
                      <td>Time of Test:</td>
                      <td>{this.getTimeOfTest()}</td>
                    </tr>
                    <tr />
                    <tr>
                      <td>Nominal Latency:</td>
                      <td>{this.getNominalLatency()} millis</td>
                    </tr>
                    <tr />
                    <tr>
                      <td>Download Throughput:</td>
                      <td>{this.getDownloadThroughput()} MBits/sec</td>
                    </tr>
                    <tr>
                      <td>Download Buffer Bloat:</td>
                      <td>{this.getDownloadBloat()} millis</td>
                    </tr>
                    <tr />
                    <tr>
                      <td>Upload Throughput:</td>
                      <td>{this.getUploadThroughput()} MBits/sec</td>
                    </tr>
                    <tr>
                      <td>Upload Buffer Bloat:</td>
                      <td>{this.getUploadBloat()} millis</td>
                    </tr>
                  </tbody>
                </table>
                <Tooltip title="oldest">
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={this.getDisabledOldestButton()}
                    style={{ marginLeft: 20, marginTop: 10 }}
                    onClick={ev => this.handleOldestClick(ev)}
                  >
                    &lt;&lt;
                  </Button>
                </Tooltip>
                <Tooltip title="previous">
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={this.getDisabledLeftButton()}
                    style={{ marginLeft: 5, marginTop: 10 }}
                    onClick={ev => this.handleLeftClick(ev)}
                  >
                    &lt;
                  </Button>
                </Tooltip>
                <Tooltip title="next">
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={this.getDisabledRightButton()}
                    style={{ marginLeft: 190, marginTop: 10 }}
                    onClick={ev => this.handleRightClick(ev)}
                  >
                    &gt;
                  </Button>
                </Tooltip>
                <Tooltip title="newest">
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={this.getDisabledNewestButton()}
                    style={{ marginLeft: 5, marginTop: 10 }}
                    onClick={ev => this.handleNewestClick(ev)}
                  >
                    &gt;&gt;
                  </Button>
                </Tooltip>
              </div>
            )}
            {failedToGetServer && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <p style={{ fontSize: "160%" }}>{errorMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

ThroughputTestWindow.isLoggedIn = true;
// NB position 1 == newest, -1 == oldest, 0 == in between.
ThroughputTestWindow.position = 1;

// ipc handlers

const clearDials = (event, data) => {
  console.log("clearDials = " + data);
  if (app) app.handleClearDials(data);
};

const updateTestingState = (event, data) => {
  console.log("updateTestingState = " + data);
  if (app) app.handleTestingState(data);
};

const updateStatusNominalLatency = (event, data) => {
  //console.log("updateStatusNominalLatency: " + data);
  if (app) app.handleStatusNominalLatency(data);
};

const updateStatusNominalLatencyFinal = (event, data) => {
  //console.log("updateStatusNominalLatencyFinal: " + data);
  if (app) app.handleStatusNominalLatencyFinal(data);
};

const updateStatusIperf3Down = (event, data) => {
  //console.log("updateIperf3StatusDown = " + data);
  if (app) app.handleStatusIperf3Down(data);
};

const updateStatusIperf3Up = (event, data) => {
  //console.log("updateIperf3StatusUp = " + data);
  if (app) app.handleStatusIperf3Up(data);
};

const updateProgressNominalLatency = (event, data) => {
  //console.log("updateProgressNominalLatency: " + data);
  if (app) app.handleProgressNominalLatency(data);
};

const updateProgressIperf3Down = (event, data) => {
  //console.log("updateProgressNominalLatency: " + data);
  if (app) app.handleProgressIperf3Down(data);
};

const updateProgressIperf3Up = (event, data) => {
  //console.log("updateProgressIperf3Up: " + data);
  if (app) app.handleProgressIperf3Up(data);
};

const updateBloatLatencyIperf3Down = (event, data) => {
  //console.log("updateBloatLatencyIperf3Down: " + data);
  if (app) app.handleBloatLatencyIperf3Down(data);
};

const updateBloatLatencyIperf3Up = (event, data) => {
  //console.log("updateBloatLatencyIperf3Up: " + data);
  if (app) app.handleBloatLatencyIperf3Up(data);
};

const updateTimeOfTest = (event, data) => {
  // console.log("updateTimeOfTest: " + data);
  if (app) app.handleTimeOfTest(data);
};

const handleLoginStatus = (event, data) => {
  const { loginStatus } = data;
  console.log(
    "throughputTestWindow handleLoginStatus: loginStatus = " + loginStatus
  );

  ThroughputTestWindow.isLoggedIn = loginStatus === Defs.loginStatusLoggedIn;
  if (app) app.handleLoginStatus();
};

const handleFailedToGetServer = (event, data) => {
  if (app) app.handleFailedToGetServer(data);
};

const handleThroughputTestStatus = (event, data) => {
  if (app) app.handleThroughputTestStatus(data);
};

eventManager.on(Defs.ipcClearDials, clearDials);

eventManager.on(Defs.ipcTestingState, updateTestingState);

eventManager.on(Defs.ipcIperf3StatusDown, updateStatusIperf3Down);

eventManager.on(Defs.ipcIperf3StatusUp, updateStatusIperf3Up);

eventManager.on(Defs.ipcNominalLatencyStatus, updateStatusNominalLatency);

eventManager.on(
  Defs.ipcNominalLatencyStatusFinal,
  updateStatusNominalLatencyFinal
);

eventManager.on(Defs.ipcTickStatusNominalLatency, updateProgressNominalLatency);

eventManager.on(Defs.ipcTickStatusIperf3Down, updateProgressIperf3Down);

eventManager.on(Defs.ipcTickStatusIperf3Up, updateProgressIperf3Up);

eventManager.on(
  Defs.ipcBloatLatencyStatusIperf3Down,
  updateBloatLatencyIperf3Down
);

eventManager.on(
  Defs.ipcBloatLatencyStatusIperf3DownFinal,
  updateBloatLatencyIperf3Down
);

eventManager.on(Defs.ipcBloatLatencyStatusIperf3Up, updateBloatLatencyIperf3Up);

eventManager.on(
  Defs.ipcBloatLatencyStatusIperf3UpFinal,
  updateBloatLatencyIperf3Up
);

eventManager.on(Defs.ipcTimeOfTest, updateTimeOfTest);

eventManager.on(Defs.ipcLoginStatus, handleLoginStatus);

eventManager.on(
  Defs.ipcThroughputTestFailedToGetServer,
  handleFailedToGetServer
);

eventManager.on(Defs.ipcThrouputTestStatus, handleThroughputTestStatus);

export default ThroughputTestWindow;
