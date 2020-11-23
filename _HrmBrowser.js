import React, { Component, useCallback, useState, useEffect } from 'react';
import {
  Dimensions,
  StatusBar,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
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
const StrHrmUrlOrigin = 'https://onpeople.asia/domain';
//var StrHrmUrl = 'http://demo.testhrm.ml/login';
//var StrHrmUrl = 'https://onpeople.asia/domain';
//var StrHrmUrl = 'https://hrm.novaon.asia/login';
//var StrHrmUrl = 'https://hrm.novaon.asia/logout';
var StrHrmUrl = '';
var currentUrl = '';


//-------------------------------------------------------------------------------------------------
const _persisDomain = async (key, domain) => {
  try {
    //alert(domain);
    let valueToSave = domain.toString();

    if (valueToSave) {
      if (valueToSave.indexOf('denied') >= 0) {
        valueToSave = StrHrmUrlOrigin.trim();
      }
      // dong nay truoc da bi cong dau nhay kep vao cuoi nen da bi loi access-denied
      //valueToSave = JSON.stringify(valueToSave).replace(/"/g, '').trim();
      valueToSave = valueToSave.replace(/"/g, '').trim();
      await AsyncStorage.setItem(key, valueToSave.toString());
      console.log('Ghi vao::' + valueToSave);
    } else {
      //alert('domain::' + domain);
      return;
    }
  } catch (error) {
    console.log('_persisDomain error :: ' + error);
  }
  //alert(jsonObj.Domain);
};
const _getPersisDomain = async (key) => {
  let temp = '';
  try {
    await AsyncStorage.getItem(key).then(result => {
      if (result) {
        temp = result.toString().trim();
      }
    });
  } catch (error) {
    console.log('_getPersisDomain error :: ' + error);
  }
  if (!temp) {
    temp = StrHrmUrlOrigin;
    console.log('_getPersisDomain blank; get default uri from StrHrmUrlOrigin variable.');
  }
  StrHrmUrl = temp.toString();
  console.log('Doc ra StrHrmUrl ::' + StrHrmUrl);
  return temp.toString();
};

_getPersisDomain(_hrmDomainKey).then(result => {
  StrHrmUrl = result;
});
//-------------------------------------------------------------------------------------------------




class HrmBrowser extends Component {
  webView = null;

  constructor() {
    super();
  }
  render() {

    const onMessage = (event) => {
      console.log('onMessage of reactnative fires'); // android khong thay chay ham onMessage
      let data = JSON.parse(event.nativeEvent.data);
      let postbackData = {};
      postbackData.UserMac = this.props.uuid;
      postbackData.WifiMac = this.props.macWifi;

      if (data) {
        // ------------------------------------------
        if (data.Command === '__posttoapp_checkstate_checkinout') {
          postbackData.Command = '__apppost_SaveCheckinoutPanelState';
          this.webView.postMessage(JSON.stringify(postbackData));
          // ------------------------------------------
        } else if (data.Command === '__posttoapp_checkinout') {
          postbackData.Command = '__apppost_CheckinOut';
          //this.webView.postMessage(JSON.stringify(postbackData));

          postbackData.Command = '__apppost_showmessage';
          //postMessage(JSON.stringify(postbackData));

          console.log('Mac wifi ::' + postbackData.WifiMac + '\n' + 'Mac User ::' + postbackData.UserMac);
        }
        // ------------------------------------------
        else if (data.Command === '__posttoapp_savedomain') {
          //alert('__posttoapp_savedomain::'+data.data.Domain);
          // data.data.Domain moi dung
          let newDomain = data.data.Domain.toString();
          if ((newDomain && StrHrmUrl !== newDomain) || !StrHrmUrl) {
            _persisDomain(_hrmDomainKey, newDomain);
            //alert('newDomain::' + newDomain);
          }
          postbackData.Command = '__apppost_SaveCheckinoutPanelState';
          this.webView.postMessage(JSON.stringify(postbackData));
          // alert('From app::' + JSON.stringify(postbackData));
        }
        else if (data.Command === '__posttoapp_userlogout') {
          //alert('__posttoapp_userlogout');
          StrHrmUrl = StrHrmUrlOrigin;
          _persisDomain(_hrmDomainKey, StrHrmUrlOrigin);
          //alert('__posttoapp_userlogout::'+StrHrmUrl);
        }
        else if (data.Command === '__posttoapp_getdeviceinfo') {
          postbackData.Command = '__apppost_pushdeviceinfo';
          this.webView.postMessage(JSON.stringify(postbackData));
          console.log('__posttoapp_getdeviceinfo');
          console.log(JSON.stringify(postbackData));

          //this.webView.injectJavaScript('$(#lblUserMac).val("'+postbackData.UserMac +'"); ');
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
    const onLoadEnd = () => {
      let data = {
        Command: '__apppost_SaveCheckinoutPanelState',
        UserMac: this.props.uuid,
        WifiMac: this.props.macWifi,
      };
      this.webView.postMessage(JSON.stringify(data));
    };

    const onNavigationStateChange = (webViewState) => {
      currentUrl = webViewState.url.trim();
      console.log('currentUrl::' + currentUrl);
    };

    // Phai dang ky
    const registPostMessage = 'document.postMessage = function (data) { window.ReactNativeWebView.postMessage(data);};';
    //const registPostMessage = 'document.addEventListener("message",onMessageListener, false);';

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
        injectedJavaScript={registPostMessage}
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
