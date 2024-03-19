import axios from "axios";
import http from "http";
import https from "https";

import Defs from "iipzy-shared/src/defs";

import cookie from "../utils/cookie";
import sentinelInfo from "../utils/sentinelInfo";

const baseURLCookie = "baseURL";

let httpInstance = null;

function init() {
  cookie.remove(Defs.httpCustomHeader_XAuthToken);
  cookie.remove(baseURLCookie);
  cookie.remove(Defs.httpCustomHeader_XClientToken);
  cookie.remove(Defs.httpCustomHeader_XConnToken);

  if (sentinelInfo.getSentinelProtocol().startsWith("https")) {
    httpInstance = axios.create({
      httpAgent: new https.Agent({
        keepAlive: true
      }),
      validateStatus: function(status) {
        // return success for all http response codes.
        //console.log("-------validateStatus: status = " + status);
        return true;
      }
    });
  } else {
    httpInstance = axios.create({
      httpAgent: new http.Agent({
        keepAlive: true
      }),
      validateStatus: function(status) {
        // return success for all http response codes.
        //console.log("-------validateStatus: status = " + status);
        return true;
      }
    });
  }
}

/*
const httpInstance = axios.create({
  httpAgent: new http.Agent({
    keepAlive: true
  }),
  validateStatus: function(status) {
    // return success for all http response codes.
    //console.log("-------validateStatus: status = " + status);
    return true;
  }
});
*/

function handleHttpException(title, ex) {
  console.log("(Exception) " + title + ": " + ex + ", code = " + ex.code);
  let status = Defs.httpStatusException;
  switch (ex.code) {
    case "ECONNREFUSED": {
      status = Defs.httpStatusConnRefused;
      break;
    }
    case "ECONNABORTED": {
      status = Defs.httpStatusConnAborted;
      break;
    }
    case "ECONNRESET": {
      status = Defs.httpStatusConnReset;
      break;
    }
    default: {
      status = Defs.httpStatusConnRefused;
      break;
    }
  }

  return { status };
}

async function _delete(url, config) {
  try {
    return await httpInstance.delete(url, addHeaders(config));
  } catch (ex) {
    return handleHttpException("delete", ex);
  }
}

async function _get(url, config) {
  console.log("--------------_get: url " + url);
  try {
    return await httpInstance.get(url, addHeaders(config));
  } catch (ex) {
    console.log("(Exception)--------------_get: ex " + ex.code);
    return handleHttpException("get", ex);
  }
}

async function _post(url, params, config) {
  console.log("--------------_post: url " + url);
  try {
    return await httpInstance.post(url, params, addHeaders(config));
  } catch (ex) {
    console.log("(Exception)--------------_post: ex " + ex.code);
    return handleHttpException("post", ex);
  }
}

async function _put(url, params, config) {
  try {
    return await httpInstance.put(url, params, addHeaders(config));
  } catch (ex) {
    return handleHttpException("put", ex);
  }
}

function logAuthToken() {
  console.log(
    "authToken: " +
      axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken]
  );
}

function setAuthTokenHeader(authToken) {
  console.log("setAuthTokenHeader = " + authToken);
  axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken] = authToken;
  cookie.set(Defs.httpCustomHeader_XAuthToken, authToken);
}

function setBaseURL(baseURL) {
  axios.defaults.baseURL = "http://" + baseURL + "/";
  cookie.set(baseURLCookie, axios.defaults.baseURL);
  console.log("setBaseURL = " + axios.defaults.baseURL);
}

function getClientTokenHeader() {
  //console.log("getClientTokenHeader");
  //console.log("getClientTokenHeader = " + cookie.get(Defs.httpCustomHeader_XClientToken)); // axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken]);
  return cookie.get(Defs.httpCustomHeader_XClientToken); // axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken];
}

function setClientTokenHeader(clientToken) {
  console.log("setClientTokenHeader = " + clientToken);
  axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken] = clientToken;
  cookie.set(Defs.httpCustomHeader_XClientToken, clientToken);
}

function setConnTokenHeader(connToken) {
  console.log("setConnTokenHeader = " + connToken);
  axios.defaults.headers.common[Defs.httpCustomHeader_XConnToken] = connToken;
  cookie.set(Defs.httpCustomHeader_XConnToken, connToken);
}

function addHeaders(config) {
  const configWithHeaders = config ? config : {};
  configWithHeaders.headers = {};
  configWithHeaders.headers[Defs.httpCustomHeader_XTimestamp] = Date.now();
  configWithHeaders.headers[Defs.httpCustomHeader_XWebClient] = 1;

  /*
  if (axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken])
    configWithHeaders.headers[Defs.httpCustomHeader_XAuthToken] =
      axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken];
  if (axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken])
    configWithHeaders.headers[Defs.httpCustomHeader_XClientToken] =
      axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken];
  if (axios.defaults.headers.common[Defs.httpCustomHeader_XConnToken])
    configWithHeaders.headers[Defs.httpCustomHeader_XConnToken] =
      axios.defaults.headers.common[Defs.httpCustomHeader_XConnToken];
  */

  let token = cookie.get(Defs.httpCustomHeader_XAuthToken);
  if (token) configWithHeaders.headers[Defs.httpCustomHeader_XAuthToken] = token;
  token = cookie.get(Defs.httpCustomHeader_XClientToken);
  if (token) configWithHeaders.headers[Defs.httpCustomHeader_XClientToken] = token;
  token = cookie.get(Defs.httpCustomHeader_XConnToken);
  if (token) configWithHeaders.headers[Defs.httpCustomHeader_XConnToken] = token;

  return configWithHeaders;
}

export default {
  delete: _delete,
  get: _get,
  init,
  post: _post,
  put: _put,
  logAuthToken,
  getClientTokenHeader,
  setAuthTokenHeader,
  setBaseURL,
  setClientTokenHeader,
  setConnTokenHeader
}; 
