import React, { Component, useCallback, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { getUniqueId, supported32BitAbis } from 'react-native-device-info';
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
//var StrHrmUrl = 'http://testhrm.ml/domain';
//var StrHrmUrl = 'https://onpeople.asia/domain';
var StrHrmUrl = 'https://hrm.novaon.asia/login';
//var StrHrmUrl = 'https://hrm.novaon.asia/logout';
var currentUrl = '';
const MacWifi = '';
//-------------------------------------------------------------------------------------------------
const _persisDomain = async (key, jsonObj) => {
  if (jsonObj) {
    await AsyncStorage.setItem(
      key,
      JSON.stringify(jsonObj.Domain).replace('"', ''),
    ).then(() => {
      return;
    });
  } else {
    return;
  }
};
const _getPersisDomain = async (key) => {
  await AsyncStorage.getItem(key).then((result) => {
    StrHrmUrl = result;
    if(!StrHrmUrl){
      StrHrmUrl = 'https://onpeople.asia/domain';
    }
  });
};
//-------------------------------------------------------------------------------------------------

class HrmBrowser extends Component {
  webView = null;

  constructor() {
    //alert(getStatusBarHeight());
    _getPersisDomain(_hrmDomainKey).then(() => {
  
    });

    super();
  }

  render() {

    const onLoadEnd = () => {
      let data = {
        Command: '__apppostSaveCheckinoutPanelState',
        UserMac: this.props.uuid,
        WifiMac: MacWifi,//this.props.macWifi,
      };
      this.webView.postMessage(JSON.stringify(data));
      //alert(data.WifiMac);
    };

    const onNavigationStateChange = (webViewState) => {
      currentUrl = webViewState.url;
      //alert(currentUrl);
    };

    const onMessage = (event) => {
      let data = JSON.parse(event.nativeEvent.data);
      let postbackData = {};
      postbackData.UserMac = this.props.uuid;
      postbackData.WifiMac = MacWifi;//'this.props.macWifi';

      if (data) {
        // ------------------------------------------
        if (data.Command === 'checkstate_checkinout') {
          postbackData.Command = '__apppostSaveCheckinoutPanelState';
          this.webView.postMessage(JSON.stringify(postbackData));
          // ------------------------------------------
        } else if (data.Command === 'checkinout') {
          postbackData.Command = '__apppostCheckinOut';
          this.webView.postMessage(JSON.stringify(postbackData));

          alert('Mac wifi ::' + postbackData.WifiMac  +'\n' + 'Mac User ::' + postbackData.UserMac);
        }
        // ------------------------------------------
        else if (data.Command === 'savedomain') {
          //let newDomain = data.data.Domain;
          let newDomain = data.data;
          if ((newDomain && StrHrmUrl !== newDomain) || !StrHrmUrl) {
            _persisDomain(_hrmDomainKey, data.data).then(() => {
              // eslint-disable-next-line no-alert
              // alert('Da luu domain newDomain::' + newDomain.Domain);
            });
          }
          postbackData.Command = '__apppostSaveCheckinoutPanelState';
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
        onMessage={onMessage}
        onLoadError={onLoadError}
        renderError={onRenderError}
        startInLoadingState={true}
        renderLoading={ActivityIndicatorImplement}
        onNavigationStateChange={onNavigationStateChange.bind(this)}
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
