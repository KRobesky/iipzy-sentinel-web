import React from "react";
import Button from "@material-ui/core/Button";

import CloseButton from "./closeButton";
import Input from "./input";
import Navigator from "./navigator";

class PasswordPopup extends React.Component {
  constructor(props) {
    super(props);

    console.log("PasswordPopup.constructor");

    this.state = { password: "" };
  }

  getPassword() {
    return this.state.password;
  }

  handleChange(ev) {
    const name = ev.target.name;
    const value = ev.target.value;

    console.log("PasswordPopup.name=" + name + ", value=" + this.state[name]);

    this.setState({ [name]: value });
  }

  handleCloseClick(ev) {
    console.log("PasswordPopup.handleCloseClick");

    this.props.onSubmit("");
    this.props.closePopup();
    this.setState({ password: "" });
  }

  handleSubmitClick(ev) {
    // console.log("...Popup handleSubmitClick");

    this.props.onSubmit(this.state.password);
    this.props.closePopup();
    this.setState({ password: "" });
  }

  isValidInput() {
    return !!this.state.password;
  }

  render() {
    console.log("PasswordPopup render");

    return (
      <div>
        <Navigator />
        <div className="popup_over">
          <div className="popup_inner">
            <div style={{ marginLeft: 20, textAlign: "left" }}>
              <p style={{ fontSize: "140%" }}>Enter Password</p>
            </div>
            <Input
              type="password"
              autofocus={true}
              disabled={false}
              name="password"
              value={this.getPassword()}
              label="Password"
              onChange={(ev) => this.handleChange(ev)}
              error=""
            />
            <h1>{this.props.text}</h1>
            <div style={{ textAlign: "center" }}>
              <Button
                type="button"
                variant="contained"
                disabled={!this.isValidInput()}
                style={{
                  width: "130px",
                  color: "#0000b0",
                }}
                /*  autoFocus */
                onClick={(ev) => this.handleSubmitClick(ev)}
              >
                Submit
              </Button>
            </div>
            <CloseButton onClick={(ev) => this.handleCloseClick(ev)} />
          </div>
        </div>
      </div>
    );
  }
}

export default PasswordPopup;
