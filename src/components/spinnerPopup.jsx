import React from "react";
import Spinner from "react-bootstrap/Spinner";

import Navigator from "./navigator";

class SpinnerPopup extends React.Component {
  constructor(props) {
    super(props);
    console.log("SpinnerPopup.constructor");

    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log("SpinnerPopup.componentDidMount");
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    console.log("SpinnerPopup render");

    return (
      <div>
        <Navigator />
        <div className="popup_spinner">
          <div className="popup_spinner_inner" alignItems="center">
            <div>
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SpinnerPopup;
