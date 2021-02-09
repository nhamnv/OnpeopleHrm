//@flow
import React, {Component, useState} from 'react';
import {
  Dimensions,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import {getStatusBarHeight} from 'react-native-status-bar-height';
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
var _height = Math.round(Dimensions.get('window').height);
if (PlatformOS === 'ios') {
  _height = Math.round(
    Dimensions.get('screen').height - 2 * getStatusBarHeight(),
  );
} else if (PlatformOS === 'android') {
  _height = Math.round(Dimensions.get('window').height);
}

const _width = Math.round(Dimensions.get('screen').width);
const _hrmDomainKey = 'HrmDomain';
const _hrmDomainShortKey = 'HrmDomainShort';
const _hrmUserNameKey = 'HrmUserNameKey';
const _hrmPasswordKey = 'HrmPasswordKey';
const StrHrmUrlOrigin = 'https://onpeople.asia/domain';
//const StrHrmUrlOrigin = 'http://demo.testhrm.ml/login';
//const StrHrmUrlOrigin = 'https://onpeople.asia/domain';
//const StrHrmUrlOrigin = 'https://hrm.novaon.asia/login';
//const StrHrmUrlOrigin = 'https://hrm.novaon.asia/logout';
var StrHrmUrl = StrHrmUrlOrigin;
var currentUrl = StrHrmUrlOrigin;

//-------------------------------------------------------------------------------------------------
const _setDomain = async (domain) => {
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
      await AsyncStorage.setItem(_hrmDomainKey, valueToSave.toString());
      //alert('Ghi vao::' + valueToSave);
    } else {
      //console.log('domain::' + domain);
      return true;
    }
  } catch (error) {
    console.log('_setDomain error :: ' + error);
  }
  //console.log(jsonObj.Domain);
  return true;
};
const _getDomain = async () => {
  let temp = '';
  try {
    await AsyncStorage.getItem(_hrmDomainKey).then((result) => {
      if (result) {
        temp = result.toString().trim();
      }
    });
  } catch (error) {
    console.log('_getDomain error :: ' + error);
  }
  if (!temp) {
    temp = StrHrmUrlOrigin;
    console.log(
      '_getDomain blank; get default uri from StrHrmUrlOrigin variable.',
    );
  }
  StrHrmUrl = temp.toString();
  //this.webView.reload();
  console.log('Doc ra StrHrmUrl ::' + StrHrmUrl);
  return temp.toString();
};

const _setDomainShort = async (domain) => {
  try {
    let valueToSave = domain.toString();
    await AsyncStorage.setItem(_hrmDomainShortKey, valueToSave.toString());
  } catch (error) {
    console.log('_setDomainShort error :: ' + error);
  }
  return true;
};
const _getDomainShort = async () => {
  let temp = '';
  try {
    await AsyncStorage.getItem(_hrmDomainShortKey).then((result) => {
      if (result) {
        temp = result.toString().trim();
      }
    });
  } catch (error) {
    console.log('_getDomainShort error :: ' + error);
  }
  return temp.toString();
};

const _setUserName = async (uName) => {
  try {
    let valueToSave = uName.toString();
    await AsyncStorage.setItem(_hrmUserNameKey, valueToSave.toString());
  } catch (error) {
    console.log('_setUserName error :: ' + error);
  }
  return true;
};
const _getUserName = async () => {
  let temp = '';
  try {
    await AsyncStorage.getItem(_hrmUserNameKey).then((result) => {
      if (result) {
        temp = result.toString().trim();
      }
    });
  } catch (error) {
    console.log('_getUserName error :: ' + error);
  }
  return temp.toString();
};

const _setPassword = async (pass) => {
  try {
    let valueToSave = pass.toString();
    await AsyncStorage.setItem(_hrmPasswordKey, valueToSave.toString());
  } catch (error) {
    console.log('_setPassword error :: ' + error);
  }
  return true;
};
const _getPassword = async () => {
  let temp = '';
  try {
    await AsyncStorage.getItem(_hrmPasswordKey).then((result) => {
      if (result) {
        temp = result.toString().trim();
      }
    });
  } catch (error) {
    console.log('_getPassword error :: ' + error);
  }
  return temp.toString();
};

if (!StrHrmUrl) {
  _getDomain();
}

// function initState(){
// const [onpeopleUrl, setOnpeopleUrl] = useState('https://vnexpress.net');
// }
//-------------------------------------------------------------------------------------------------

class HrmBrowser extends Component<Props> {
  webView = null;
  state = {};

  constructor() {
    super();
    this.setState({isConnected: false});
  }

  render() {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (this.state.isConnected !== state.isConnected) {
        this.setState({isConnected: state.isConnected});
        console.log('-----> isConnected::::' + this.state.isConnected);
      }

      console.log(
        '----- EVENT 1111 ----- Connection type=' +
          state.type +
          '-----Is connected=' +
          state.isConnected,
      );
      if (state.isConnected === true) {
        //this.setState({uri: 'https://vnexpress.net'});
        //setOnpeopleUrl('https://vnexpress.net');
        console.log('có mang. onpeopleUrl::');
        //StrHrmUrl = 'https://vnexpress.net';
      } else {
        //this.setState({uri: 'https://google.com'});

        //setOnpeopleUrl('https://google.com');
        console.log('no internet. onpeopleUrl::');
        //StrHrmUrl = 'https://google.com';
      }
    });

    const onMessage = (event) => {
      if (
        event &&
        event.nativeEvent &&
        event.nativeEvent.data &&
        event.nativeEvent.data !== 'undefined'
      ) {
        console.log('onMessage react fired :: ' + event.nativeEvent.data);
        if (!this.webView) {
          console.log('this.webView is null so onMessage will run out');
          return;
        }

        let data = null;
        try {
          data = JSON.parse(event.nativeEvent.data);
        } catch (e) {}
        let postbackData = {};
        postbackData.UserMac = this.props.deviceId;
        postbackData.WifiMac = this.props.macWifi;

        if (data) {
          // ------------------------------------------
          if (data.Command === 'posttoapp_checkstate_checkinout') {
            postbackData.Command = 'apppost_SaveCheckinoutPanelState';
            postMessageToPage('apppostSaveCheckinoutPanelState', postbackData);

            // ------------------------------------------
          } else if (data.Command === 'posttoapp_checkinout') {
            postbackData.Command = 'apppost_CheckinOut';
            postMessageToPage('apppostCheckinOut', postbackData);
          }
          // ------------------------------------------
          else if (data.Command === 'posttoapp_savedomain') {
            let newDomain = data.data.Domain.toString();
            if ((newDomain && StrHrmUrl !== newDomain) || !StrHrmUrl) {
              _setDomain(newDomain);
            }

            // Save domain short
            let tempData = data.data.Domain.toString();
            tempData = tempData.replace('https://', '').replace('http://', '');
            let tempUrl = tempData.split(/[/?#]/)[0];

            if (tempUrl) {
              _setDomainShort(tempUrl);
              console.log('Saved domain short :: ' + tempUrl);
            }

            postbackData.Command = 'apppost_SaveCheckinoutPanelState';
            postMessageToPage('apppostSaveCheckinoutPanelState', postbackData);

            // ------------------------------------------
          } else if (data.Command === 'posttoapp_userlogout') {
            //console.log('posttoapp_userlogout');
            StrHrmUrl = StrHrmUrlOrigin;
            _setDomain(StrHrmUrlOrigin);
            postbackData.Command = 'apppost_userlogout';
            postMessageToPage('apppostUserLogout', postbackData);

            // ------------------------------------------
          } else if (data.Command === 'posttoapp_getuserinfo') {
            postbackData.Command = 'apppost_pushuserinfo';
            postbackData.Domain = _getDomainShort();
            postbackData.UserName = _getUserName();
            postbackData.Password = _getPassword();

            postMessageToPage('apppostPushUserInfo', postbackData);

            // ------------------------------------------
          } else if (data.Command === 'posttoapp_getdeviceinfo') {
            postbackData.Command = 'apppost_pushdeviceinfo';
            setTimeout(() => {
              postMessageToPage('apppostPushDeviceInfo', postbackData);
            }, 800);
          }
        }
      }
      return true;
    };
    const onLoadError = (wv) => {
      console.log('onLoadError :: ' + wv);
      return true;
    };
    const onRenderError = (wv) => {
      console.log(
        'onRenderError :: ' + wv + '\n' + 'currentUrl :: ' + currentUrl,
      );
      //this.webView.reload();
      return true;
    };
    const onLoadStart = (wv) => {
      //console.log('onLoadStart :: ' + wv);
      return true;
    };
    const onLoadEnd = (wv) => {
      console.log('onLoadEnd 1'); // ok
      let postbackData = {
        Command: 'apppostSaveCheckinoutPanelState',
        UserMac: this.props.deviceId,
        WifiMac: this.props.macWifi,
      };
      postMessageToPage('apppostSaveCheckinoutPanelState', postbackData);
      return true;
    };
    const onError = (wv) => {
      console.log('onError' + wv);
      wv.source = {uri: StrHrmUrlOrigin};
    };
    const onNavigationStateChange = (webViewState) => {
      currentUrl = webViewState.url.toString().trim();
      console.log('currentUrl::' + currentUrl);
      if (currentUrl === 'about:blank' || currentUrl.indexOf('file:///') > -1) {
        StrHrmUrl = StrHrmUrlOrigin;
      }
      console.log('onNavigationStateChange ==>currentUrl::' + currentUrl);

      return true;
    };
    const postMessageToPage = (functionName, postbackData) => {
      if (PlatformOS === 'android') {
        let jsInject =
          functionName + '(' + JSON.stringify(postbackData) + ');return true;';
        this.webView.ReactNativeWebview.injectJavascript(jsInject);
        console.log('just call from android :: ' + jsInject);
      } else if (PlatformOS === 'ios') {
        this.webView.postMessage(JSON.stringify(postbackData));
        console.log('just call from ios :: ' + JSON.stringify(postbackData));
      }
      return true;
    };
    //----------------------------------

    return (
      <WebView
        ref={(r) => (this.webView = r)}
        useWebKit={true}
        javaScriptEnabled={true}
        source={{uri: StrHrmUrl}}
        //source={{uri: 'https://google.com'}}
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
