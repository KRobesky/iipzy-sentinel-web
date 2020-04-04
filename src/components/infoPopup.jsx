import React from "react";

import CloseButton from "./closeButton";
import Navigator from "./navigator";

class InfoPopup extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  getInfoMessage() {
    return this.props.getInfoMessage();
  }

  handleSubmitClick(ev) {
    console.log("...Popup handleSubmitClick");
    this.props.closePopup();
  }

  render() {
    console.log("InfoPopup render");

    return (
      <div>
        <Navigator />
        <div className="popup">
          <div className="popup_inner">
            <div style={{ marginLeft: 20, textAlign: "left" }}>
              <p style={{ fontSize: "140%" }}>{this.props.title}</p>
            </div>
            <div style={{ marginLeft: 30, textAlign: "left" }}>
              <p>
                <br />
                {this.getInfoMessage()}
              </p>
            </div>
            <CloseButton onClick={(ev) => this.handleSubmitClick(ev)} />
          </div>
        </div>
      </div>
    );
  }
}

export default InfoPopup;
