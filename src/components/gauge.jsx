import React from "react";
import { Chart } from "react-google-charts";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Platform } from "react-native";

//let app;

// const roundToTwo = num => {
//   return +(Math.round(num + "e+1") + "e-1");
// };

class Gauge extends React.Component {
  constructor(props) {
    super(props);

    console.log("Gauge constructor: " + this.props.label);
    this.state = { count: 0 };
    this.interval = 500;
    this.updateCount = () =>
      this.setState({ count: this.state.count + this.interval });
    this.timer = null;
    // see https://developers.google.com/chart/interactive/docs/gallery/gauge
    this.gaugeOptions = {
      width: 300,
      height: 250,
      // redFrom: 90,
      // redTo: 100,
      // yellowFrom: 75,
      // yellowTo: 90,
      majorTicks: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      minorTicks: 5,
      max: 10
    };
    this.overlayMarginTop = Platform.OS === 'ios' ? 5 : 50;
    //app = this;
  }

  getData() {
    return [
      ["Label", "Value"],
      [this.props.label, this.props.value]
    ];
  }

  getProgress() {
    return this.props.progress;
  }

  shouldComponentUpdate(nextProps, nextState) {
    //console.log("...shouldComponentUpdate: active = " + this.props.active);
    return (
      //     this.props.active &&
      this.props.progress !== nextProps.progress ||
      this.props.value !== nextProps.value ||
      this.state.count !== nextState.count
    );
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  startTimer() {
    this.timer = setInterval(this.updateCount, this.interval);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  render() {
    //console.log("Gauge render called: " + this.props.label);

    const val = Math.round(this.props.value);
    //
    //console.log("...val=" + val);
    let max = Math.round(Math.round(val) / 10) * 10; // + 10;
    //
    //console.log("...max=" + max);
    if (max > this.gaugeOptions.max) {
      if (max > 1000) max = 10000;
      else if (max > 100) max = 1000;
      else if (max > 10) max = 100;
      this.gaugeOptions.max = max;
      const majorTick = max / 10;
      //console.log("majorTick=" + majorTick);
      let majorTicks = [];
      for (let i = 0; i < 11; i++) {
        majorTicks.push(`${i * majorTick}`);
      }
      this.gaugeOptions.majorTicks = majorTicks;

      //console.log("...major ticks=" + this.gaugeOptions.majorTicks);
    }

    const gaugeOptions = this.gaugeOptions;

    // const { classes } = this.props;
    // var style = this.props.style || { margin: 20 } || { width: "85%" };
    const overlayMarginTop = this.overlayMarginTop;

    return (
      <div>
        <table>
          <div>
            <tr>
              <td>
                <Chart
                  className="gauge"
                  chartType="Gauge"
                  width="100%"
                  height="200px"
                  data={this.getData()}
                  options={gaugeOptions}
                />
              </td>
            </tr>
            <tr>
              <td>
                {/*                 <div align="center" style={style}> */}
                <div
                  align="center"
                  style={{ width: "88%", marginLeft: 13, marginTop: overlayMarginTop }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={this.getProgress()}
                  />
                </div>
              </td>
            </tr>
          </div>
        </table>
      </div>
    );
  }
}

export default Gauge;
