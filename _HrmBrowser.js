import React, { Component, useCallback, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { getStatusBarHeight } from 'react-native-status-bar-height';

//-------------------------------------------------------------------------------------------------

const ActivityIndicatorImplement = () => {
  return (
    <View style={styles.activityIndicatorImplementStyle}>
      <ActivityIndicator color="#2CA01C" size="large" />
    </View>
  );
};
const _height = Math.round(
  Dimensions.get('screen').height - 2 * getStatusBarHeight(),
);
const _width = Math.round(Dimensions.get('screen').width);
const _hrmDomainKey = 'HrmDomain';
//var StrHrmUrl = 'http://demo.testhrm.ml/login';
var StrHrmUrl = 'https://onpeople.asia/domain';
//var StrHrmUrl = 'https://hrm.novaon.asia/login';
//var StrHrmUrl = 'https://hrm.novaon.asia/logout';
var currentUrl = '';
var StrHrmUrlOrigin = StrHrmUrl;


//-------------------------------------------------------------------------------------------------
const _persisDomain = (key, domain) => {
  //alert(domain);
  let valueToSave = domain;

  if (valueToSave) {
    if (valueToSave.indexOf('denied') >= 0) {
      valueToSave = StrHrmUrlOrigin.trim();
    }
    // dong nay truoc da bi cong dau nhay kep vao cuoi nen da bi loi access-denied
    valueToSave = JSON.stringify(valueToSave).replace(/"/g,"").trim();
    AsyncStorage.setItem(
      key,
      valueToSave,
    );
//alert(valueToSave);
  } else {
    //alert('domain::' + domain);
    return;
  }
  //alert(jsonObj.Domain);
};
const _getPersisDomain = (key) => {
  AsyncStorage.getItem(key).then((result) => {
    //alert(result); //ok
    StrHrmUrl = result.trim();
  });
};
//-------------------------------------------------------------------------------------------------

class HrmBrowser extends Component {
  webView = null;

  constructor() {
    //alert(getStatusBarHeight());
    _getPersisDomain(_hrmDomainKey);

    super();
  }

  render() {

    const onLoadEnd = () => {
      let data = {
        Command: '__apppost_SaveCheckinoutPanelState',
        UserMac: this.props.uuid,
        WifiMac: this.props.macWifi,
      };
      this.webView.postMessage(JSON.stringify(data));
      //alert('macWifi::'+this.props.macWifi);
      //alert(JSON.stringify(data));
      //alert(StrHrmUrl);
    };

    const onNavigationStateChange = (webViewState) => {
      currentUrl = webViewState.url.trim();
      _persisDomain(_hrmDomainKey, currentUrl);
      //alert(currentUrl);
    };

    const onMessage = (event) => {
      let data = JSON.parse(event.nativeEvent.data);
      let postbackData = {};
      postbackData.UserMac = this.props.uuid;
      postbackData.WifiMac = this.props.macWifi;
      //alert(data);
      if (data) {
        // ------------------------------------------
        if (data.Command === '__posttoapp_checkstate_checkinout') {
          postbackData.Command = '__apppost_SaveCheckinoutPanelState';
          this.webView.postMessage(JSON.stringify(postbackData));
          // ------------------------------------------
        } else if (data.Command === '__posttoapp_checkinout') {
          postbackData.Command = '__apppost_CheckinOut';
          this.webView.postMessage(JSON.stringify(postbackData));

          //alert('Mac wifi ::' + postbackData.WifiMac  +'\n' + 'Mac User ::' + postbackData.UserMac);
        }
        // ------------------------------------------
        else if (data.Command === '__posttoapp_savedomain') {
          //alert('__posttoapp_savedomain::'+data.data);
          let newDomain = data.data.trim();
          if ((newDomain && StrHrmUrl !== newDomain) || !StrHrmUrl) {
            _persisDomain(_hrmDomainKey, newDomain);
            //alert(data);
          }
          postbackData.Command = '__apppost_SaveCheckinoutPanelState';
          this.webView.postMessage(JSON.stringify(postbackData));
          // alert('From app::' + JSON.stringify(postbackData));
        }
      }
    };

    const onLoadError = () => {
      //alert('onLoadError');
    };

    const onRenderError = () => {
      //alert('onRenderError');
    };
    const onLoadStart = (wView) => {

      //alert('onLoadStart::'+JSON.stringify(wView));
    };

    return (
      <WebView
        ref={(r) => {
          this.webView = r;
        }}
        useWebKit={true}
        javaScriptEnabled={true}
        source={{ uri: StrHrmUrl }}
        style={{ flex: 1, height: _height, width: _width }}
        onLoadEnd={onLoadEnd}
        onLoadStart={onLoadStart.bind(this)}

        onMessage={onMessage}
        onLoadError={onLoadError}
        renderError={onRenderError}
        startInLoadingState={true}
        renderLoading={ActivityIndicatorImplement}
        onNavigationStateChange={onNavigationStateChange.bind(this)}
        originWhitelist={['*']}
      />
    );
  }
}

const styles = StyleSheet.create({
  activityIndicatorImplementStyle: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 'auto',
    marginTop: 'auto',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
  },
});

//-------------------------------------------------------------------------------------------------
export default HrmBrowser;
