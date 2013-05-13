var querystring = require('querystring')
  , OAuth = require("oauth").OAuth2
  , request = require('request');

var CLIENT = {}
  , _facebook_graph_url = 'https://graph.facebook.com';

/* gets the authorize url
 *
 * @param {Object} options
 * @return {String}
 */
CLIENT.getAuthorizeUrl = function (options) {
  options = options || {};
  return _facebook_graph_url + '/oauth/authorize?' + querystring.stringify(options);
};

/* Does an API call to facebook and callbacks
 * when the result is available.
 *
 * @param {String} method
 * @param {String} path
 * @param {Object} params
 * @param {Function} callback
 * @return {Request}
 */
CLIENT.apiCall = function (method, path, params, callback) {
  callback = callback || function () {};

  return request({
    method: method
  , uri: _facebook_graph_url + path + '?' + querystring.stringify(params)
  }, function (error, response, body) {
    var parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      error = e
    }
    callback(error, response, parsed);
  });
};

/* Does an API call to facebook and returns
 * the request stream.
 *
 * @param {String} key
 * @param {String} secret
 * @param {String} code
 * @param {String} redirect_uri
 * @param {Function} callback
 */
CLIENT.getAccessToken = function (key, secret, code, redirect_uri, callback) {
  var oAuth = new OAuth(key, secret, _facebook_graph_url);
  oAuth.getOAuthAccessToken(code, {redirect_uri: redirect_uri}, callback);
};

/* Does an API call to facebook and callbacks
 * when the renewed access token is available.
 *
 * @param {String} key
 * @param {String} secret
 * @param {String} existingToken
 * @param {Function} callback
 * @return {Object}
 */
CLIENT.renewAccessToken = function (key, secret, existingToken, callback) {
  callback = callback || function () {};
  var params = {
    grant_type: 'fb_exchange_token',
    client_id: key,
    client_secret: secret,
    fb_exchange_token: existingToken
  };
  var path = '/oauth/access_token';
  var method = 'POST';

  return request({
    method: method
  , uri: _facebook_graph_url + path + '?' + querystring.stringify(params)
  }, function (error, response, body) {
    // should return object { access_token: String, expires: Number }
    var data = querystring.parse(body);
    callback(error, response, data);
  });
};

module.exports = CLIENT;
