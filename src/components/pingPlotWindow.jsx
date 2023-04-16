import React from "react";
import { Chart } from "react-google-charts";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";

import Defs from "iipzy-shared/src/defs";

import eventManager from "../ipc/eventManager";
import toSentinel from "../ipc/toSentinel";

import Navigator from "./navigator";
import SpinnerPopup from "./spinnerPopup";

//  zoom
//                duration    num samples   points 	point-samples     scroll-unit   scroll-unit-samples
//  Zoom +++      7m          84            84		  1                 35s           7
//  Zoom ++       15 mins     180           180		  1                 1m15s         15
//  Zoom +        30 mins     360           360		  1                 2m30s         30
//  Zoom nominal  1 hour      720			      720     1   (5 secs)      5 mins        60
//  Zoom -        1 day       17280			    720    	24  (2 mins)      1 hour        720
//  Zoom --       1 week      120960		    720    	168 (14 mins)     1 day         17280
//  Zoom ---      1 month     518400		    720    	720 (60 mins)     na            na

let app = null;

// const roundToTwo = num => {
//   return +(Math.round(num + "e+1") + "e-1");
// };

const ZOOMLEVEL_5MIN = 0;
const ZOOMLEVEL_10MIN = 1;
const ZOOMLEVEL_20MIN = 2;
const ZOOMLEVEL_30MIN = 3;
const ZOOMLEVEL_1HOUR = 4;
const ZOOMLEVEL_6HOURS = 5;
const ZOOMLEVEL_12HOURS = 6;
const ZOOMLEVEL_1DAY = 7;
const ZOOMLEVEL_1WEEK = 8;
const ZOOMLEVEL_30DAYS = 9;
const ZOOMLEVEL_MIN = 0;
const ZOOMLEVEL_MAX = ZOOMLEVEL_30DAYS;
const ZOOMLEVEL_DEFAULT = ZOOMLEVEL_1HOUR;

class PingPlotWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("PingPlotWindow constructor");
    this.state = { count: 0 };
    // this.intervalId = null;
    // this.progress = 0;

    // see https://developers.google.com/chart/interactive/docs/gallery/scatterchart
    // this.scatterOptions = {
    //   title: "bite the wax tadpole",
    //   pointSize: 2,
    //   hAxis: { title: "time" },
    //   vAxis: { title: "ms" }
    // };
    this.zoomArray = [
      { numPoints: 60, numSamples: 1, numScrollUnitSamples: 5 }, //        ZOOMLEVEL_5MIN
      { numPoints: 120, numSamples: 1, numScrollUnitSamples: 10 }, //      ZOOMLEVEL_10MIN
      { numPoints: 240, numSamples: 1, numScrollUnitSamples: 20 }, //      ZOOMLEVEL_20MIN
      { numPoints: 360, numSamples: 1, numScrollUnitSamples: 30 }, //      ZOOMLEVEL_30MIN
      { numPoints: 720, numSamples: 1, numScrollUnitSamples: 60 }, //      ZOOMLEVEL_1HOUR
      { numPoints: 720, numSamples: 6, numScrollUnitSamples: 180 }, //     ZOOMLEVEL_6HOURS
      { numPoints: 720, numSamples: 12, numScrollUnitSamples: 360 }, //    ZOOMLEVEL_12HOURS
      { numPoints: 720, numSamples: 24, numScrollUnitSamples: 720 }, //    ZOOMLEVEL_1DAY
      { numPoints: 720, numSamples: 168, numScrollUnitSamples: 17280 }, // ZOOMLEVEL_1WEEK
      { numPoints: 720, numSamples: 720, numScrollUnitSamples: 0 }, //      ZOOMLEVEL_30DAYS
    ];
    this.zoomLevel = ZOOMLEVEL_DEFAULT;
    this.zoomLevelPrev = ZOOMLEVEL_DEFAULT;

    this.maxPoints = 720;
    this.minPoints = 90;
    this.numPoints = this.zoomArray[this.zoomLevel].numPoints;
    this.numPointsSamples =
      this.zoomArray[this.zoomLevel].numPoints *
      this.zoomArray[this.zoomLevel].numSamples;
    this.prevTimeMillis = 0;

    // ping
    this.pingArray = [];
    this.pingArray[0] = [
      "time",
      "ms",
      { type: "string", role: "style" },
      { type: "string", role: "tooltip" },
      { type: "string", role: "id-linkId" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.pingArray[i] = [null, 0, null, null, null];
    }

    // rx_rate
    this.rxRateArray = [];
    this.rxRateArray[0] = [
      "time",
      "rx_mbits",
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.rxRateArray[i] = [null, 0, null];
    }

    // tx_rate
    this.txRateArray = [];
    this.txRateArray[0] = [
      "time",
      "tx_mbits",
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.txRateArray[i] = [null, 0, null];
    }

    // rx_rate_pri
    this.rxRatePriArray = [];
    this.rxRatePriArray[0] = [
      "time",
      "rx_pri_mbits",
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.rxRatePriArray[i] = [null, 0, null];
    }

    // tx_rate_pri
    this.txRatePriArray = [];
    this.txRatePriArray[0] = [
      "time",
      "tx_pri_mbits",
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.txRatePriArray[i] = [null, 0, null];
    }

    this.maxEntries = 0;
    this.numEntries = 0;
    this.oldest = false;
    this.newest = true;
    this.droppedLeft = false;
    this.droppedRight = false;

    this.id = 0;
    this.linkId = 0;

    this.allButtonsDisabled = false;

    this.selectedRow = -1;
    this.pingChartEvents = [
      {
        eventName: "ready",
        callback: ({ chartWrapper, google }) => {
          console.log("------------------------------ready");
          this.handleChartReadyEvent(chartWrapper);
        },
      },
      {
        eventName: "select",
        callback: ({ chartWrapper }) => {
          this.handleChartSelectEvent(chartWrapper);
        },
      },
    ];

    app = this;
  }

  componentDidMount() {
    console.log("PingPlotWindow.componentDidMount");
    console.log(this.numPoints);
    this.allButtonsDisabled = true;
    toSentinel.send(
      Defs.ipcPingPlotWindowMountEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  componentWillUnmount() {
    console.log("PingPlotWindow.componentWillUnmount");
    app = null;
  }

  getPingData() {
    return this.pingArray;
  }
 
  getRxRateData() {
    return this.rxRateArray;
  }
 
  getTxRateData() {
    return this.txRateArray;
  }

  getRxRatePriData() {
    return this.rxRatePriArray;
  }
 
  getTxRatePriData() {
    return this.txRatePriArray;
  }

  getTitle() {
    switch (this.zoomLevel) {
      case ZOOMLEVEL_5MIN:
        return "Five Minutes";
      case ZOOMLEVEL_10MIN:
        return "10 Minutes";
      case ZOOMLEVEL_20MIN:
        return "20 minutes";
      case ZOOMLEVEL_30MIN:
        return "30 minutes";
      case ZOOMLEVEL_1HOUR:
        return "One Hour";
      case ZOOMLEVEL_12HOURS:
        return "12 Hours";
      case ZOOMLEVEL_6HOURS:
        return "6 Hours";
      case ZOOMLEVEL_1DAY:
        return "One Day";
      case ZOOMLEVEL_1WEEK:
        return "One Week";
      case ZOOMLEVEL_30DAYS:
        return "30 Days (all)";
      default:
        return "?";
    }
  }

  getDisabledLeftButton() {
    return (
      this.oldest || this.zoomLevel === ZOOMLEVEL_MAX || this.allButtonsDisabled
    );
  }

  getDisabledLeftDroppedButton() {
    return (
      !this.droppedLeft ||
      this.zoomLevel === ZOOMLEVEL_MAX ||
      this.allButtonsDisabled
    );
  }

  getDisabledRightButtons() {
    return (
      this.newest || this.zoomLevel === ZOOMLEVEL_MAX || this.allButtonsDisabled
    );
  }

  getDisabledRightDroppedButton() {
    return (
      !this.droppedRight ||
      this.zoomLevel === ZOOMLEVEL_MAX ||
      this.allButtonsDisabled
    );
  }

  getDisabledZoomOutButton() {
    return this.zoomLevel === ZOOMLEVEL_MAX || this.allButtonsDisabled;
  }

  getDisabledZoomInButton() {
    return this.zoomLevel === ZOOMLEVEL_MIN || this.allButtonsDisabled;
  }

  getDay() {
    const center = Math.floor((this.pingArray.length - 1) / 2) + 1;
    if (
      this.pingArray &&
      this.pingArray.length > 1 &&
      this.pingArray[center][0]
    ) {
      return this.pingArray[center][0].toDateString();
    }
    return "";
  }

  handlePingPlotData(jo) {
    if (this.selectedRow >= 0) {
      this.selectedRow--;
    }

    console.log("...handlePingPlotData: " + JSON.stringify(jo, null, 2));

    this.allButtonsDisabled = false;

    this.maxEntries = jo.maxEntries;
    this.numEntries = jo.numEntries;
    this.oldest = jo.oldest;
    this.newest = jo.newest;
    this.droppedLeft = jo.droppedLeft;
    this.droppedRight = jo.droppedRight;
    const ja = jo.entries;

    console.log(
      "handlePingPlotData: maxEntries=" +
        this.maxEntries +
        ", numEntries=" +
        this.numEntries +
        ", oldest =" +
        this.oldest +
        ", newest=" +
        this.newest +
        ", droppedLeft =" +
        this.droppedLeft +
        ", droppedRight=" +
        this.droppedRight +
        ", addEntries=" +
        ja.length
    );

    if (ja.length === 1) {
      // real time update.
      if (this.selectedRow >= 0) this.selectedRow--;
    }

    this.pingArray.splice(1, ja.length);
    this.rxRateArray.splice(1, ja.length);
    this.txRateArray.splice(1, ja.length);
    this.rxRatePriArray.splice(1, ja.length);
    this.txRatePriArray.splice(1, ja.length);
    for (let i = 0; i < ja.length; i++) {
      const joe = ja[i];
      const id = joe.id;
      const linkId = joe.linkId;
      const jod = joe.data;
      let millis = Number(jod["timeMillis"]);
      const date = new Date(jod["timeStamp"]);
      const dropped = jod["dropped"];
      // netrate
      const rx_rate_bits = jod["rx_rate_bits"];
      const tx_rate_bits = jod["tx_rate_bits"];
      const rx_rate_pri_bits = jod["rx_rate_dns_bits"] + jod["rx_rate_rt_bits"];
      const tx_rate_pri_bits = jod["tx_rate_dns_bits"] + jod["tx_rate_rt_bits"];
      //console.log("+++rx_rate_bits=" + rx_rate_bits + ", tx_rate_bits=" + tx_rate_bits);

      let droppedStyle = null;
      let tooltipStyle = null;
      if (dropped) {
        millis = this.prevTimeMillis;
        droppedStyle = "point { size: 4; fill-color: #a52714; }";
        tooltipStyle = date.toLocaleString() + ", dropped packet";
      } else {
        this.prevTimeMillis = millis;
        tooltipStyle = date.toLocaleString() + ", " + millis + " ms";
      }
      const idLinkIdStyle = JSON.stringify({ id, linkId, dropped });
      // console.log("...idLinkIdStyle = " + idLinkIdStyle);
      //console.log("handlePingPlotData: entry[" + i + "], date =" + date);

      this.pingArray.push([
        date,
        millis,
        droppedStyle,
        tooltipStyle,
        idLinkIdStyle,
      ]);

      let rx_mbits = this.round(rx_rate_bits / 1000000, 2);
      //rx_mbits = Math.round(rx_mbits);
      let tx_mbits = this.round(tx_rate_bits / 1000000, 2);
      //tx_mbits = Math.round(tx_mbits);
      let rx_pri_mbits = this.round(rx_rate_pri_bits / 1000000, 2);
      //rx_mbits = Math.round(rx_mbits);
      let tx_pri_mbits = this.round(tx_rate_pri_bits / 1000000, 2);
      //tx_mbits = Math.round(tx_mbits);

      const rxTooltipStyle = date.toLocaleString() + ", " + rx_mbits + " mbits";
      const txTooltipStyle = date.toLocaleString() + ", " + tx_mbits + " mbits";

      this.rxRateArray.push([
        date,
        rx_mbits,
        rxTooltipStyle,
      ]);

       this.txRateArray.push([
        date,
        tx_mbits,
        txTooltipStyle,
      ]);

      this.rxRatePriArray.push([
        date,
        rx_pri_mbits,
        rxTooltipStyle,
      ]);

       this.txRatePriArray.push([
        date,
        tx_pri_mbits,
        txTooltipStyle,
      ]);

    }

    const nextCount = this.state.count + 1;
    this.setState({ count: nextCount });
  }

  handleSentinelStatusOnline() {
    toSentinel.send(
      Defs.ipcPingPlotWindowMountEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  doRender() {
    const nextCount = this.state.count + 1;
    this.setState({ count: nextCount });
  }

  handleLeftClick(ev) {
    console.log("handleLeftClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonLeftEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  handleLeftDroppedClick(ev) {
    console.log("handleLeftClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonLeftDroppedEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  handleRightClick(ev) {
    console.log("handleRightClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonRightEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  handleRightDroppedClick(ev) {
    console.log("handleRightClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonRightDroppedEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  handleHomeClick(ev) {
    console.log("handleHomeClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonHomeEx,
      this.zoomArray[this.zoomLevel]
    );
  }

  handlZoomInClick(ev) {
    console.log("handleZoomInClick");
    this.allButtonsDisabled = true;
    this.doRender();
    if (this.zoomLevel > ZOOMLEVEL_MIN) {
      this.zoomLevelPrev = this.zoomLevel;
      this.zoomLevel--;
      this.numPoints = this.zoomArray[this.zoomLevel].numPoints;
      this.numPointsSamples =
        this.zoomArray[this.zoomLevel].numPoints *
        this.zoomArray[this.zoomLevel].numSamples;

      this.pingArray.splice(1, this.pingArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.pingArray[i] = [null, 0, null, null, null];
      }
    
      this.rxRateArray.splice(1, this.rxRateArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.rxRateArray[i] = [null, 0, null];
      }

      this.txRateArray.splice(1, this.txRateArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.txRateArray[i] = [null, 0, null];
      }

      const moveOffset = this.computeMoveOffset();

      toSentinel.send(Defs.ipcPingPlotWindowButtonZoomChangeEx, {
        zoom: this.zoomArray[this.zoomLevel],
        moveOffset,
      });
    }
  }

  handlZoomOutClick(ev) {
    console.log("handleZoomOutClick");
    this.allButtonsDisabled = true;
    if (this.zoomLevel < ZOOMLEVEL_MAX) {
      this.zoomLevelPrev = this.zoomLevel;
      this.zoomLevel++;
      this.numPoints = this.zoomArray[this.zoomLevel].numPoints;
      this.numPointsSamples =
        this.zoomArray[this.zoomLevel].numPoints *
        this.zoomArray[this.zoomLevel].numSamples;

      this.pingArray.splice(1, this.pingArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.pingArray[i] = [null, 0, null, null, null];
      }
      
      this.rxRateArray.splice(1, this.rxRateArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.rxRateArray[i] = [null, 0, null];
      }
       
      this.txRateArray.splice(1, this.txRateArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.txRateArray[i] = [null, 0, null];
      }

      const moveOffset = this.computeMoveOffset();

      toSentinel.send(Defs.ipcPingPlotWindowButtonZoomChangeEx, {
        zoom: this.zoomArray[this.zoomLevel],
        moveOffset,
      });
    }
    this.doRender();
  }

  handleChartReadyEvent(chartWrapper) {
    console.log("pingPlotWindow.handleChartReadyEvent");
    if (this.selectedRow !== -1) {
      chartWrapper
        .getChart()
        .setSelection([{ row: this.selectedRow, column: 1 }]);
      console.log(
        "pingPlotWindow.handleChartReadyEvent: set selected row = " +
          this.selectedRow
      );
    }
  }

  handleChartSelectEvent(chartWrapper) {
    const selection = chartWrapper.getChart().getSelection();
    if (selection && selection[0]) {
      this.selectedRow = selection[0].row;
      this.doRender();
    } else this.selectedRow = -1;
    console.log(
      "pingPlotWindow.handleChartSelectEvent: selected row = " +
        this.selectedRow
    );
  }

  computeMoveOffset() {
    let moveOffset = 0;
    if (this.selectedRow > 0) {
      const numPoints = this.zoomArray[this.zoomLevel].numPoints;
      if (numPoints === 720) {
        const centerPos = this.numPoints / 2;
        // NB: > 0, move right. < 0 move left.
        moveOffset = this.selectedRow - centerPos;
        moveOffset = moveOffset * this.zoomArray[this.zoomLevelPrev].numSamples;
      } else {
        moveOffset = this.selectedRow - numPoints;
      }

      console.log(
        "pingPlotWindow.computeMoveOffset: selectedRow = " +
          this.selectedRow +
          ", numPoints = " +
          this.numPoints +
          ", offset = " +
          moveOffset
      );
      this.selectedRow = -1;
    }
    return moveOffset;
  }

  render() {
    console.log("pingPlotWindow.render called");

    const showSpinner =
      this.allButtonsDisabled && this.zoomLevel >= ZOOMLEVEL_1DAY;
    const pingHeader = "Latency Milliseconds (" + this.getTitle() + ")";
    /*
    const throughputUpHeader = "Throughput Up (" + this.getTitle() + ")";
    const throughputDownHeader = "Throughput Down (" + this.getTitle() + ")";
    const throughputUpHeaderPri = "Throughput Up - High Priority (" + this.getTitle() + ")";
    const throughputDownHeaderPri = "Throughput Down - High Priority (" + this.getTitle() + ")";
    */
    const throughputHeader = "Throughput Mbits (" + this.getTitle() + ")";
    const throughputHeaderPri = "Throughput Mbits - High Priority (" + this.getTitle() + ")";

    //               vAxis: { title: "latency (milliseconds)" },

    return (
      <div>
        <Navigator />
        {showSpinner && <SpinnerPopup />}
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{pingHeader}</p>
        </div>
        {/*         <div style={{ display: "flex", maxWidth: 800 }}> */}
        <div style={{ marginLeft: 0, marginTop: -18, marginBottom: 0 }}>
          <Chart
            width={850}
            height={180}
            chartType="LineChart"
            data={this.getPingData()}
            chartEvents={this.chartEvents}
            options={{
              pointSize: 2,
              hAxis: {textPosition: "none" },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 20, marginTop: 0, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{throughputHeader}</p>
        </div>
        <div style={{ marginLeft: 0, marginTop: -18, marginBottom: 0 }}>
          <Chart
            width={850}
            height={180}
            chartType="LineChart"
            data={this.getTxRateData()}
            chartEvents={this.chartEvents}
            options={{
              pointSize: 2,
              hAxis: {textPosition: "none" },
              vAxis: { title: "up", titleTextStyle: {bold: true} },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 0, marginTop: -30, marginBottom:  0 }}>
          <Chart
            width={850}
            height={180}
            chartType="LineChart"
            data={this.getRxRateData()}
            chartEvents={this.chartEvents}
            options={{
              pointSize: 2,
              hAxis: {textPosition: "none" },
              vAxis: { title: "down", direction: -1, titleTextStyle: {bold: true} },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 20, marginTop: 0, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{throughputHeaderPri}</p>
        </div>
        <div style={{ marginLeft: 0, marginTop: -16, marginBottom: 0 }}>
          <Chart
            width={850}
            height={180}
            chartType="LineChart"
            data={this.getTxRatePriData()}
            chartEvents={this.chartEvents}
            options={{
              pointSize: 2,
              hAxis: {textPosition: "none" },
              vAxis: { title: "up", titleTextStyle: {bold: true} },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 0, marginTop: -30, marginBottom: 0 }}>
          <Chart
            width={850}
            height={180}
            chartType="LineChart"
            data={this.getRxRatePriData()}
            chartEvents={this.chartEvents}
            options={{
              pointSize: 2,
              vAxis: { title: "down", direction: -1, titleTextStyle: {bold: true} },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 0, marginTop: 10 }}>
          <table>
            <tbody>
              <tr>
                <td>
                  <Tooltip title="scroll left">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledLeftButton()}
                        style={{ marginLeft: 90 }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleLeftClick(ev)}
                      >
                        &lt;
                      </Button>
                    </div>
                  </Tooltip>
                </td>
                <td>
                  <Tooltip title="find previous dropped packet">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledLeftDroppedButton()}
                        style={{ marginLeft: 5, color: "#dc3545" }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleLeftDroppedClick(ev)}
                      >
                        &lt;
                      </Button>
                    </div>
                  </Tooltip>
                </td>
                <td>
                  <div
                    style={{ width: 140, marginLeft: 90, textAlign: "center" }}
                  >
                    <p>{this.getDay()}</p>
                  </div>
                </td>
                <td>
                  <Tooltip title="find next dropped packet">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledRightDroppedButton()}
                        style={{ marginLeft: 90, color: "#dc3545" }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleRightDroppedClick(ev)}
                      >
                        &gt;
                      </Button>
                    </div>
                  </Tooltip>
                </td>
                <td>
                  <Tooltip title="scroll right">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledRightButtons()}
                        style={{ marginLeft: 5 }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleRightClick(ev)}
                      >
                        &gt;
                      </Button>
                    </div>
                  </Tooltip>
                </td>
                <td>
                  <Tooltip title="scroll to most recent">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledRightButtons()}
                        style={{ marginLeft: 5 }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleHomeClick(ev)}
                      >
                        &gt;&gt;
                      </Button>
                    </div>
                  </Tooltip>
                </td>
              </tr>
              <tr>
                <td>
                  <Tooltip title="less detail">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledZoomOutButton()}
                        style={{ marginTop: 10, marginLeft: 90 }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handlZoomOutClick(ev)}
                      >
                        Zoom -
                      </Button>
                    </div>
                  </Tooltip>
                </td>
                <td>
                  <Tooltip title="more detail">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledZoomInButton()}
                        style={{ marginTop: 10, marginLeft: 5 }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handlZoomInClick(ev)}
                      >
                        Zoom +
                      </Button>
                    </div>
                  </Tooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }
}

PingPlotWindow.mounted = false;
PingPlotWindow.selectedRow = -1;

const updatePingPlotData = (event, data) => {
  if (app) app.handlePingPlotData(data);
};

const handleSentinelOnLineStatus = (event, data) => {
  const { sentinelStatus } = data;

  if (sentinelStatus === Defs.sentinelStatusOnline) {
    if (app) app.handleSentinelStatusOnline();
  }
};

eventManager.on(Defs.ipcPingPlotData, updatePingPlotData);

eventManager.on(Defs.ipcSentinelOnlineStatus, handleSentinelOnLineStatus);

export default PingPlotWindow;
