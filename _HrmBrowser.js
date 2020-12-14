//@flow
import React, {Component, useCallback, useState, useEffect} from 'react';
import {
  Dimensions,
  StatusBar,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  BackHandler,
} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {NetworkInfo} from 'react-native-network-info';
import NetInfo from '@react-native-community/netinfo';

//-------------------------------------------------------------------------------------------------

const ActivityIndicatorImplement = () => {
  return (
    <View style={styles.activityIndicatorImplementStyle}>
      <ActivityIndicator color="#2CA01C" size="large" />
    </View>
  );
};

const PlatformOS = Platform.OS;
const _height = Math.round(
  Dimensions.get('screen').height - 2 * getStatusBarHeight(),
);
const _width = Math.round(Dimensions.get('screen').width);
const _hrmDomainKey = 'HrmDomain';
//const StrHrmUrlOrigin = 'https://onpeople.asia/domain';
const StrHrmUrlOrigin = 'http://testhrm.ml/domain';
//const StrHrmUrlOrigin = 'https://onpeople.asia/domain';
//const StrHrmUrlOrigin = 'https://hrm.novaon.asia/login';
//const StrHrmUrlOrigin = 'https://hrm.novaon.asia/logout';
var StrHrmUrl = '';
var currentUrl = StrHrmUrlOrigin;
var registPostMessage = '';

if (PlatformOS === 'android') {
  registPostMessage =
    'document.postMessage = function (data) {window.ReactNativeWebView.postMessage(data);};';
}

//-------------------------------------------------------------------------------------------------
const _persisDomain = async (key, domain) => {
  try {
    //console.log(domain);
    let valueToSave = domain.toString();

    if (valueToSave) {
      if (valueToSave.indexOf('denied') >= 0) {
        valueToSave = StrHrmUrlOrigin.trim();
      }
      // dong nay truoc da bi cong dau nhay kep vao cuoi nen da bi loi access-denied
      //valueToSave = JSON.stringify(valueToSave).replace(/"/g, '').trim();
      valueToSave = valueToSave.replace(/"/g, '').trim();
      await AsyncStorage.setItem(key, valueToSave.toString());
      //alert('Ghi vao::' + valueToSave);
    } else {
      //console.log('domain::' + domain);
      return;
    }
  } catch (error) {
    console.log('_persisDomain error :: ' + error);
  }
  //console.log(jsonObj.Domain);
};
const _getPersisDomain = async (key) => {
  let temp = '';
  try {
    await AsyncStorage.getItem(key).then((result) => {
      if (result) {
        temp = result.toString().trim();
      }
    });
  } catch (error) {
    console.log('_getPersisDomain error :: ' + error);
  }
  if (!temp) {
    temp = StrHrmUrlOrigin;
    console.log(
      '_getPersisDomain blank; get default uri from StrHrmUrlOrigin variable.',
    );
  }
  StrHrmUrl = temp.toString();
  //this.webView.reload();
  console.log('Doc ra StrHrmUrl ::' + StrHrmUrl);
  return temp.toString();
};
if (!StrHrmUrl) {
  _getPersisDomain(_hrmDomainKey);
}

//-------------------------------------------------------------------------------------------------
//_persisDomain(_hrmDomainKey, StrHrmUrlOrigin);

class HrmBrowser extends Component {
  webView = null;

  constructor() {
    super();
  }
  render() {
    console.log('begin 1');
    // Subscribe
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('Connection type', state.type); // ==> no bao la typewifi; 4G no bao la cellular
      console.log('Is connected?', state.isConnected); // ==> no bao true
    });

    // Unsubscribe
    unsubscribe();

    const onMessage = (event) => {
      if (
        event &&
        event.nativeEvent &&
        event.nativeEvent.data &&
        event.nativeEvent.data !== 'undefined'
      ) {
        console.log('onMessage react fired :: ' + event.nativeEvent.data);
        if (!this.webView) {
          alert('this.webView is null so onMessage will run out');
          return;
        }

        let data = JSON.parse(event.nativeEvent.data);
        let postbackData = {};
        postbackData.UserMac = this.props.uuid;
        postbackData.WifiMac = this.props.macWifi;

        if (data) {
          // ------------------------------------------
          if (data.Command === 'posttoapp_checkstate_checkinout') {
            postbackData.Command = 'apppost_SaveCheckinoutPanelState';
            postMessageToPage(
              'apppostSaveCheckinoutPanelState("' +
                JSON.stringify(postbackData) +
                '");',
            );
            // ------------------------------------------
          } else if (data.Command === 'posttoapp_checkinout') {
            postbackData.Command = 'apppost_CheckinOut';
            postMessageToPage(
              'apppostCheckinOut(' + JSON.stringify(postbackData) + ');',
            );
            //console.log('just call :: '+'apppostCheckinOut("' + JSON.stringify(postbackData) + '");')
          }
          // ------------------------------------------
          else if (data.Command === 'posttoapp_savedomain') {
            let newDomain = data.data.Domain.toString();
            if ((newDomain && StrHrmUrl !== newDomain) || !StrHrmUrl) {
              _persisDomain(_hrmDomainKey, newDomain);
            }
            postbackData.Command = 'apppost_SaveCheckinoutPanelState';
            postMessageToPage(
              'apppostSaveCheckinoutPanelState("' +
                JSON.stringify(postbackData) +
                '");',
            );
            // ------------------------------------------
          } else if (data.Command === 'posttoapp_userlogout') {
            //console.log('posttoapp_userlogout');
            this.setState({StrHrmUrl: StrHrmUrlOrigin});
            _persisDomain(_hrmDomainKey, StrHrmUrlOrigin);
            postMessageToPage(
              'apppostUserLogout("' + JSON.stringify(postbackData) + '");',
            );
            // ------------------------------------------
          } else if (data.Command === 'posttoapp_getdeviceinfo') {
            postbackData.Command = 'apppost_pushdeviceinfo';
            postMessageToPage(
              'apppostPushDeviceInfo("' + JSON.stringify(postbackData) + '");',
            );
          }
        }
      }
    };
    const onLoadError = (wv) => {
      console.log('onLoadError :: ' + wv);
    };
    const onRenderError = (wv) => {
      console.log(
        'onRenderError :: ' + wv + '\n' + 'currentUrl :: ' + currentUrl,
      );
      //this.webView.reload();
    };
    const onLoadStart = (wv) => {
      console.log('onLoadStart :: ' + wv);
    };
    const onLoadEnd = (wv) => {
      console.log('onLoadEnd 1'); // ok
      let postbackData = {
        Command: 'apppostSaveCheckinoutPanelState',
        UserMac: this.props.uuid,
        WifiMac: this.props.macWifi,
      };
      postMessageToPage(
        'apppostSaveCheckinoutPanelState("' +
          JSON.stringify(postbackData) +
          '");',
      );
    };
    const onError = (wv) => {
      console.log('onError' + wv);
      wv.source = {uri: StrHrmUrlOrigin};
    };
    const onNavigationStateChange = (webViewState) => {
      //alert(JSON.stringify(webViewState));
      currentUrl = webViewState.url.toString().trim();
      console.log('currentUrl::' + currentUrl);
      if (currentUrl === 'about:blank' || currentUrl.indexOf('file:///') > -1) {
        StrHrmUrl = StrHrmUrlOrigin;
      }
      console.log('onNavigationStateChange ==>currentUrl::' + currentUrl);
      console.log('OS::' + Platform.OS);
    };
    const postMessageToPage = (callClientJsFunction) => {
      this.webView.injectJavaScript(callClientJsFunction);
      console.log('just call :: ' + callClientJsFunction);
    };
    //----------------------------------

    return (
      <WebView
        ref={(r) => (this.webView = r)}
        useWebKit={true}
        javaScriptEnabled={true}
        source={{uri: StrHrmUrl}}
        style={{flex: 1, height: _height, width: _width}}
        onLoadEnd={onLoadEnd.bind(this)}
        onLoadStart={onLoadStart.bind(this)}
        onMessage={onMessage}
        onError={onError.bind(this)}
        onLoadError={onLoadError.bind(this)}
        renderError={onRenderError.bind(this)}
        startInLoadingState={true}
        renderLoading={ActivityIndicatorImplement}
        onNavigationStateChange={onNavigationStateChange.bind(this)}
        originWhitelist={['*']}
        ignoreSslError={true}
        cacheEnabled={false}
        //injectedJavaScript={injectJs}
        //onShouldStartLoadWithRequest={onNavigationStateChange.bind(this)} // ios
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
    // backgroundColor: 'green',
  },
});

//-------------------------------------------------------------------------------------------------
export default HrmBrowser;
