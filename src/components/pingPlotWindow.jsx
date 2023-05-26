import React from "react";
import { Chart } from "react-google-charts";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";

import Defs from "iipzy-shared/src/defs";
import { get_is_debugging } from "iipzy-shared/src/utils/globals";

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

/*
const roundToTwo = num => {
   return +(Math.round(num + "e+1") + "e-1");
};
*/

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
    this.tcMode = false;
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

     // timeline
    this.timeLineArray = [];
    this.timeLineArray[0] = [
      "time",
      "status",
      { type: "string", role: "style" },
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.timeLineArray[i] = [null, 0, null, null];
    }

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

    // cpu_utilization
    this.cpuUtlzArray = [];
    this.cpuUtlzArray[0] = [
      "time",
      "cpu_utlz",
      { type: "string", role: "tooltip" },
      "mem_use_pct",
      { type: "string", role: "tooltip" },
      "stg_use_pct",
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.cpuUtlzArray[i] = [null, 0, null, 0, null, 0, null];
    }

    // cpu_temperature
    this.cpuTempArray = [];
    this.cpuTempArray[0] = [
      "time",
      "cpu_temp",
      { type: "string", role: "tooltip" },
    ];

    for (let i = 1; i < this.numPoints + 1; i++) {
      this.cpuTempArray[i] = [null, 0, null];
    }

    this.maxEntries = 0;
    this.numEntries = 0;
    this.oldest = false;
    this.newest = true;
    this.markedLeft = false;
    this.markedRight = false;

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

  getTimeLineData() {
    return this.timeLineArray;
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
   
  getCpuUtlzData() {
    return this.cpuUtlzArray;
  }
     
  getCpuTempData() {
    return this.cpuTempArray;
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

  getDisabledLeftMarkedButton() {
    return (
      !this.markedLeft ||
      this.zoomLevel === ZOOMLEVEL_MAX ||
      this.allButtonsDisabled
    );
  }

  getDisabledRightButtons() {
    return (
      this.newest || this.zoomLevel === ZOOMLEVEL_MAX || this.allButtonsDisabled
    );
  }

  getDisabledRightMarkedButton() {
    return (
      !this.markedRight ||
      this.zoomLevel === ZOOMLEVEL_MAX ||
      this.allButtonsDisabled
    );
  }

  computeNeededPoints(zoomLevel) {
    return this.zoomArray[zoomLevel].numPoints * this.zoomArray[zoomLevel].numSamples;
  }

  getDisabledZoomOutButton() {
    const atLimit = this.zoomLevel === ZOOMLEVEL_MAX || (this.numEntries > 0 && this.computeNeededPoints(this.zoomLevel + 1) > this.numEntries);
    return atLimit || this.allButtonsDisabled;
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

  getTimeOfDay(date) {
    const dsa = date.toLocaleString().split(' ');
    return dsa[1] + " " + dsa[2];
  }

  handlePingPlotData(jo) {
    if (this.selectedRow >= 0) {
      this.selectedRow--;
    }

    if (get_is_debugging()) console.log("...handlePingPlotData: " + JSON.stringify(jo, null, 2));

    this.allButtonsDisabled = false;

    this.maxEntries = jo.maxEntries;
    this.numEntries = jo.numEntries;
    this.oldest = jo.oldest;
    this.newest = jo.newest;
    this.markedLeft = jo.markedLeft;
    this.markedRight = jo.markedRight;
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
        ", markedLeft =" +
        this.markedLeft +
        ", markedRight=" +
        this.markedRight +
        ", addEntries=" +
        ja.length
    );

    if (ja.length === 1) {
      // real time update.
      if (this.selectedRow >= 0) this.selectedRow--;
    }

    this.timeLineArray.splice(1, ja.length);
    this.pingArray.splice(1, ja.length);
    this.rxRateArray.splice(1, ja.length);
    this.txRateArray.splice(1, ja.length);
    this.rxRatePriArray.splice(1, ja.length);
    this.txRatePriArray.splice(1, ja.length);
    this.cpuUtlzArray.splice(1, ja.length);
    this.cpuTempArray.splice(1, ja.length);
    for (let i = 0; i < ja.length; i++) {
      const joe = ja[i];
      const id = joe.id;
      const linkId = joe.linkId;
      const jod = joe.data;

      const date = new Date(jod.timeStamp);
      const mark = jod.mark;

      // tcMode
      this.tcMode = jod.flag & Defs.pingFlagTcMode;

      // netrate data
      const rx_rate_mbits = this.round(jod.rx_rate_bits / 1000000, 2);
      const tx_rate_mbits = this.round(jod.tx_rate_bits / 1000000, 2);
      const rx_bw_peak_mbits = this.round(jod.rx_bw_peak_bits / 1000000, 2);
      const tx_bw_peak_mbits = this.round(jod.tx_bw_peak_bits / 1000000, 2);
      const rx_bw_quality_mbits = this.round(jod.rx_bw_quality_bits / 1000000, 2);
      const tx_bw_quality_mbits = this.round(jod.tx_bw_quality_bits / 1000000, 2);
      const rx_rate_pri_mbits = this.round((jod.rx_rate_dns_bits + jod.rx_rate_rt_bits) / 1000000, 2);
      const tx_rate_pri_mbits = this.round((jod.tx_rate_dns_bits + jod.tx_rate_rt_bits) / 1000000, 2);

      // timeline
      let tlStatusStyle = null;
      let tlTooltip = null;
      if (mark & Defs.pingMarkDropped) {
        // red
        tlStatusStyle = "point { size: 10; fill-color: #a52714; shape-type: square;  }";
        tlTooltip = this.getTimeOfDay(date) + ": dropped";
      } else if (mark & Defs.pingMarkSavedRx) {
        // blue
        tlStatusStyle = "point { size: 10; fill-color: #3366cc; shape-type: square;  }";
        tlTooltip = this.getTimeOfDay(date) + ": saved down";
      } else if (mark & Defs.pingMarkSavedTx) {
        // blue
        tlStatusStyle = "point { size: 10; fill-color: #3366cc; shape-type: square;  }";
        tlTooltip = this.getTimeOfDay(date) + ": saved up";
      } else {
        // green
        tlStatusStyle = "point { size: 10; fill-color: #109618; shape-type: square;  }";
        tlTooltip = this.getTimeOfDay(date) + ": everything is hunky-dorry";
      }

      this.timeLineArray.push([
        date,
        1,
        tlStatusStyle,
        tlTooltip,
      ]);

      // ping
      let millis = Number(jod["timeMillis"]);

      //const dropped = jod["dropped"];
      let dropped = null;
      let tooltip = null;
      if (mark & Defs.pingMarkDropped) {
        millis = this.prevTimeMillis;
        dropped = "point { size: 4; fill-color: #a52714; }";
        tooltip = this.getTimeOfDay(date) + ": dropped packet";
      } else {
        this.prevTimeMillis = millis;
        tooltip = this.getTimeOfDay(date) + ": " + millis + " ms";
      }

      const idLinkId = JSON.stringify({ id, linkId, mark });

      this.pingArray.push([
        date,
        millis,
        dropped,
        tooltip,
        idLinkId,
      ]);

      // netrate
      const rxTooltip = this.getTimeOfDay(date) + ": " + rx_rate_mbits + " mbits, peak capacity " + rx_bw_peak_mbits + " mbits, quality capacity " + rx_bw_quality_mbits + " mbits";
      const txTooltip = this.getTimeOfDay(date) + ": " + tx_rate_mbits + " mbits, peak capacity " + tx_bw_peak_mbits + " mbits, quality capacity " + tx_bw_quality_mbits + " mbits";
      const rxPriTooltip = this.getTimeOfDay(date) + ": " + rx_rate_pri_mbits + " mbits, peak capacity " + rx_bw_peak_mbits + " mbits, quality capacity " + rx_bw_quality_mbits + " mbits";
      const txPriTooltip = this.getTimeOfDay(date) + ": " + tx_rate_pri_mbits + " mbits, peak capacity " + tx_bw_peak_mbits + " mbits, quality capacity " + tx_bw_quality_mbits + " mbits";

      this.rxRateArray.push([
        date,
        rx_rate_mbits,
        rxTooltip,
      ]);

       this.txRateArray.push([
        date,
        tx_rate_mbits,
        txTooltip,
      ]);

      this.rxRatePriArray.push([
        date,
        rx_rate_pri_mbits,
        rxPriTooltip,
      ]);

       this.txRatePriArray.push([
        date,
        tx_rate_pri_mbits,
        txPriTooltip,
      ]);

      // cpu utilization
      const cpu_utlz = this.round((jod.cpu_utlz_pct), 2);
      const mem_use_pct = this.round(jod.mem_use_pct, 2);
      const stg_use_pct = this.round(jod.stg_use_pct, 2);
      const cpuUtlzTooltip = this.getTimeOfDay(date) + ": cpu utilization " + cpu_utlz + "%";
      const memUsePctTooltip = this.getTimeOfDay(date) + ": memory use " + mem_use_pct + "%";
      const stgUsePctTooltip = this.getTimeOfDay(date) + ": storage use " + stg_use_pct + "%";

      this.cpuUtlzArray.push([
        date,
        cpu_utlz,
        cpuUtlzTooltip,
        mem_use_pct,
        memUsePctTooltip,
        stg_use_pct,
        stgUsePctTooltip
      ]);

      // cpu temperature
      const cpu_temp = jod["temp_celsius"];
      const cpuTempTooltip = this.getTimeOfDay(date) + ": " + cpu_temp + " celsius";
      
      this.cpuTempArray.push([
        date,
        cpu_temp,
        cpuTempTooltip,
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

  handleLeftMarkedClick(ev) {
    console.log("handleLeftMarkedClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonLeftMarkedEx,
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

  handleRightMarkedClick(ev) {
    console.log("handleRightMarkedClick");
    this.allButtonsDisabled = true;
    this.doRender();
    toSentinel.send(
      Defs.ipcPingPlotWindowButtonRightMarkedEx,
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

      this.timeLineArray.splice(1, this.timeLineArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.timeLineArray[i] = [null, 0, null, null];
      }

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
      
      this.cpuUtlzArray.splice(1, this.cpuUtlzArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.cpuUtlzArray[i] = [null, 0, null, 0, null, 0, null];
      }
            
      this.cpuTempArray.splice(1, this.cpuTempArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.cpuTempArray[i] = [null, 0, null];
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

      this.timeLineArray.splice(1, this.timeLineArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.timeLineArray[i] = [null, 0, null, null];
      }

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
   
      this.cpuUtlzArray.splice(1, this.cpuUtlzArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.cpuUtlzArray[i] = [null, 0, null, 0, null, 0, null];
      }
         
      this.cpuTempArray.splice(1, this.cpuTempArray.length - 1);
      for (let i = 1; i < this.numPoints + 1; i++) {
        this.cpuTempArray[i] = [null, 0, null];
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

    const tcMode = this.tcMode;
    const showSpinner =
      this.allButtonsDisabled && this.zoomLevel >= ZOOMLEVEL_1DAY;
    const timeLineHeader = this.getTitle();
    const pingHeader = "Latency Milliseconds";

    const throughputHeader = "Throughput Mbits";
    const throughputHeaderPri = "Throughput Mbits - High Priority";
    const cpuUtlzHeader = "CPU/Memory/Storage Utilization";
    const cpuTempHeader = "CPU Temperature";

    //               vAxis: { title: "latency (milliseconds)" },
    //hAxis: {baseline: {color: 'transparent'}, gridlines: {color: 'transparent'}},

    return (
      <div>
        <Navigator />
        {showSpinner && <SpinnerPopup />}
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{timeLineHeader}</p>
        </div>
        <div style={{ marginLeft: -10, marginTop: -20, marginBottom: 0 }}>
          <Chart
            width={750}
            height={80}
            chartType="LineChart"
            data={this.getTimeLineData()}
            chartEvents={this.chartEvents}
            options={{
              chartArea: {left: 100,top: 20,width:640,height: 40},
              pointShape: "square",
              pointSize: 20,
              legend: { position: "none" },
              titleTextStyle: { bold: false },
              hAxis: {
                gridlines: {color: 'transparent'},
              },
              vAxis: {gridlines: {color: 'transparent'}},
  
            }}
          />
        </div>
        <div style={{ marginLeft: 0, marginTop: 20, marginBottom: 40 }}>
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
                        style={{ marginLeft: 84 }}
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
                  <Tooltip title="find previous dropped or saved sample">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledLeftMarkedButton()}
                        style={{ marginLeft: 5, color: "#dc3545" }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleLeftMarkedClick(ev)}
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
                  <Tooltip title="find next dropped or saved sample">
                    <div>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        disabled={this.getDisabledRightMarkedButton()}
                        style={{ marginLeft: 64, color: "#dc3545" }}
                        /*                       style={{
                        width: "130px",
                        color: "#0000b0",
                        visibility: this.getButtonVisibility()
                      }} */
                        onClick={(ev) => this.handleRightMarkedClick(ev)}
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
                        style={{ marginTop: 10, marginLeft: 84 }}
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
        <div style={{ marginLeft: 20, marginTop: -20, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{pingHeader}</p>
        </div>
        {/*         <div style={{ display: "flex", maxWidth: 800 }}> */}
        <div style={{ marginLeft: 0, marginTop: -18, marginBottom: 0 }}>
          <Chart
            width={850}
            height={140}
            chartType="LineChart"
            data={this.getPingData()}
            chartEvents={this.chartEvents}
            options={{
              chartArea: {left: 86,top: 20,width:650,height: 100},
              pointSize: 2,
              hAxis: { textPosition: "none" },
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
            height={140}
            chartType="LineChart"
            data={this.getTxRateData()}
            chartEvents={this.chartEvents}
            options={{
              chartArea: {left: 90,top: 20,width:650,height: 100},
              pointSize: 2,
              hAxis: { textPosition: "none" },
              vAxis: { title: "up", titleTextStyle: {bold: true} },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 0, marginTop: -16, marginBottom:  0 }}>
          <Chart
            width={850}
            height={140}
            chartType="LineChart"
            data={this.getRxRateData()}
            chartEvents={this.chartEvents}
            options={{
              chartArea: {left: 90,top: 20,width:650,height: 100},
              pointSize: 2,
              hAxis: { textPosition: "none" },
              vAxis: { title: "down", direction: -1, titleTextStyle: {bold: true} },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        {this.tcMode && (
          <div style={{ marginLeft: 20, marginTop: 0, textAlign: "left" }}>
        
            <p style={{ fontSize: "80%", fontWeight: "bold" }}>{throughputHeaderPri}</p>
          </div>
        )}
        {this.tcMode && (
          <div style={{ marginLeft: 0, marginTop: -18, marginBottom: 0 }}>
            <Chart
              width={850}
              height={140}
              chartType="LineChart"
              data={this.getTxRatePriData()}
              chartEvents={this.chartEvents}
              options={{
                chartArea: {left: 90,top: 20,width:650,height: 100},
                pointSize: 2,
                hAxis: { textPosition: "none" },
                vAxis: { title: "up", titleTextStyle: {bold: true} },
                legend: { position: "none" },
                titleTextStyle: { bold: false },
              }}
            />
          </div>
        )}
        {this.tcMode && (
          <div style={{ marginLeft: 0, marginTop: -16, marginBottom: 0 }}>
            <Chart
              width={850}
              height={140}
              chartType="LineChart"
              data={this.getRxRatePriData()}
              chartEvents={this.chartEvents}
              options={{
                chartArea: {left: 90,top: 20,width:650,height: 100},
                pointSize: 2,
                hAxis: { textPosition: "none" },
                vAxis: { title: "down", direction: -1, titleTextStyle: {bold: true} },
                legend: { position: "none" },
                titleTextStyle: { bold: false },
              }}
            />
          </div>
        )}
        <div style={{ marginLeft: 20, marginTop: 0, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{cpuUtlzHeader}</p>
        </div>
        <div style={{ marginLeft: 0, marginTop: -18, marginBottom: 0 }}>
          <Chart
            width={850}
            height={200}
            chartType="LineChart"
            data={this.getCpuUtlzData()}
            chartEvents={this.chartEvents}
            options={{
              chartArea: {left: 90,top: 20,width:650,height: 160},
              pointSize: 2,
              hAxis: { textPosition: "none" },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
        </div>
        <div style={{ marginLeft: 20, marginTop: 0, textAlign: "left" }}>
          <p style={{ fontSize: "80%", fontWeight: "bold" }}>{cpuTempHeader}</p>
        </div>
        <div style={{ marginLeft: 0, marginTop: -18, marginBottom: 0 }}>
          <Chart
            width={850}
            height={140}
            chartType="LineChart"
            data={this.getCpuTempData()}
            chartEvents={this.chartEvents}
            options={{
              chartArea: {left: 90,top: 20,width:650,height: 100},
              pointSize: 2,
              hAxis: { textPosition: "none" },
              legend: { position: "none" },
              titleTextStyle: { bold: false },
            }}
          />
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
