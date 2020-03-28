import React from "react";
//import Joi from "joi-browser";
import Button from "@material-ui/core/Button";

//import Defs from "iipzy-shared/src/defs";

import auth from "../services/auth";
import InfoPopup from "./infoPopup";
import Navigator from "./navigator";
import Input from "./input";

let app = null;

class LoginWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("LoginWindow.constructor");

    this.state = { count: 0 };

    app = this;
  }

  componentDidMount() {
    console.log("LoginWindow.componentDidMount");
    this.doRender();
  }

  componentWillUnmount() {
    console.log("LoginWindow.componentWillUnmount");
    app = null;
  }

  doRender() {
    const count = this.state.count + 1;
    this.setState({ count: count });
  }

  getUserName() {
    return LoginWindow.userName;
  }

  getPassword() {
    return LoginWindow.password;
  }

  getInfoMessage() {
    return LoginWindow.infoMessage;
  }

  getSubmitButtonEnabled() {
    return (
      LoginWindow.buttonsEnabled &&
      (LoginWindow.verified ||
        (LoginWindow.userName.length >= 5 && LoginWindow.password.length >= 5))
    );
  }

  handleInfoPopupClick() {
    console.log("LoginWindow.handleInfoPopupClick");
  }

  hideInfoPopup() {
    LoginWindow.showInfoPopup = false;
    LoginWindow.buttonsEnabled = true;
    this.doRender();
  }

  handleChange(ev) {
    const name = ev.target.name;
    const value = ev.target.value;
    console.log("LoginWindow.handleChange: " + name + " = " + value);
    switch (name) {
      case "userName": {
        LoginWindow.userName = value;
        break;
      }
      case "password": {
        LoginWindow.password = value;
        break;
      }
      default: {
        break;
      }
    }

    this.doRender();
  }

  async handleSubmitClick(ev) {
    console.log("LoginWindow.handleSubmitClick");

    LoginWindow.buttonsEnabled = false;
    this.doRender();

    const { data, status } = await auth.verifyRequest({
      userName: LoginWindow.userName,
      password: LoginWindow.password
    });

    if (data.__hadError__) {
      LoginWindow.infoMessage = data.__hadError__.errorMessage;
      LoginWindow.verified = false;
    } else {
      LoginWindow.infoMessage = "Successfully logged in";
      LoginWindow.verified = true;
    }

    LoginWindow.showInfoPopup = true;
    LoginWindow.buttonsEnabled = true;
    this.doRender();
  }

  render() {
    console.log("loginWindow render");

    const verified = LoginWindow.verified;
    const showInfoPopup = LoginWindow.showInfoPopup;

    return (
      <div>
        <Navigator />
        {showInfoPopup ? (
          <InfoPopup
            getInfoMessage={() => this.getInfoMessage()}
            onSubmit={ev => this.handleInfoPopupClick(ev)}
            closePopup={this.hideInfoPopup.bind(this)}
          />
        ) : null}
        {!verified && (
          <div style={{ marginLeft: 20, textAlign: "left" }}>
            <p style={{ fontSize: "140%" }}>Log in @ iipzy.com</p>
          </div>
        )}
        {verified && (
          <div style={{ marginLeft: 20, textAlign: "left" }}>
            <p style={{ fontSize: "140%" }}>
              {this.getUserName()} is Logged in @ iipzy.com
            </p>
          </div>
        )}
        {!showInfoPopup && !verified && (
          <Input
            type="text"
            autofocus={true}
            disabled={verified}
            name="userName"
            value={this.getUserName()}
            label="User Name"
            onChange={ev => this.handleChange(ev)}
            error=""
          />
        )}
        {!showInfoPopup && !verified && (
          <Input
            type="password"
            autofocus={false}
            hidden={verified}
            disabled={verified}
            name="password"
            value={this.getPassword()}
            label="Password"
            onChange={ev => this.handleChange(ev)}
            error=""
          />
        )}
        {!showInfoPopup && !verified && (
          <div style={{ textAlign: "center" }}>
            <Button
              type="button"
              variant="contained"
              disabled={!this.getSubmitButtonEnabled()}
              style={{
                width: "130px",
                color: "#0000b0"
              }}
              autoFocus
              onClick={ev => this.handleSubmitClick(ev)}
            >
              Login
            </Button>
          </div>
        )}
      </div>
    );
  }
}

LoginWindow.buttonsEnabled = true;
LoginWindow.infoMessage = "";
LoginWindow.password = "";
LoginWindow.showInfoPopup = false;
LoginWindow.userName = "";
LoginWindow.verified = false;

// const handleSubmitVerifyResponse = (event, data) => {
//   console.log(
//     "LoginWindow.handleSubmitVerifyResponse: data = " +
//       JSON.stringify(data, null, 2)
//   );
//   if (data.__hadError__) {
//     LoginWindow.infoMessage = data.__hadError__.errorMessage;
//     LoginWindow.verified = false;
//   } else {
//     LoginWindow.infoMessage = "Successfully logged in";
//     LoginWindow.verified = true;
//   }

//   LoginWindow.showInfoPopup = true;
//   LoginWindow.buttonsEnabled = false;
//   if (app != null) app.doRender();
// };

// eventManager.on(Defs.ipcSubmitVerifyResponse, handleSubmitVerifyResponse);

export default LoginWindow;
