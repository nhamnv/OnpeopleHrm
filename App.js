/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  LogBox,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import HrmBrowser from './_HrmBrowser';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import DeviceInfo from 'react-native-device-info';
import {NetworkInfo} from 'react-native-network-info';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';


LogBox.ignoreAllLogs();
const PlatformOS = Platform.OS;
// https://www.npmjs.com/package/react-native-get-location
//-------------------------------------------------------------------------------------------------

export async function ANDROID_requestLocationPermission() {
  try {
    // console.log('111111'); // ok
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Onpeople HRM',
        message:
          'Onpeople HRM needs access to your location to use wifi timekeeping feature.',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the location'); // ok
    } else {
      console.log('location permission denied');
    }
  } catch (err) {
    console.log('ANDROID_requestLocationPermission error :: ' + err);
  }
  // console.log('222222'); // ok
}

//----------------------------------------------
const App: () => React$Node = () => {
  const [macWifi, setMacWifi] = useState('');
  const [uuid, setuuid] = useState('');
  const [networkOk, setNetworkOk] = useState('');
  const [connectionType, setConnectionType] = useState('');
  //let networkOk = false;
  console.log('begin 1');
  // check network
  const unsubscribe = NetInfo.addEventListener((state) => {
    console.log('Connection type', state.type); // ==> no bao la typewifi; 4G no bao la cellular
    console.log('Is connected?', state.isConnected); // ==> no bao true
    //setNetworkOk(state.isConnected);
    //setConnectionType(state.type);
  });

  // Unsubscribe
  unsubscribe();

  useEffect(() => {
    async function fetchNetworkinfo() {
      await NetInfo.fetch().then((state) => {
        //console.log('Connection type' + state.type);
        //console.log('Is connected?', state.isConnected);
        setNetworkOk(state.isConnected);
        setConnectionType(state.type);
      });
    }

    async function GetMacWifi() {
      await NetworkInfo.getBSSID().then(
        (bssid) => {
          let temp = bssid;
          console.log('NetworkInfo.getBSSID()==>' + bssid);
          if (temp) {
            // iOS phai cong phan tu th 4 len 1 don vi moi = thuc te
            if (PlatformOS === 'ios') {
              //Mac wifi ::74:83:c2:37:f7:f9
              let arr = temp.split(':');
              let tempElement4 = arr[3];
              arr[3] = parseInt(tempElement4) - 1;

              temp = arr.join(':');
              setMacWifi(temp);

              //alert('Origin::'+bssid+'\n iOS::'+temp);
            } else if (PlatformOS === 'android') {
              // Mac wifi ::74:83:c2:37:f7:f9
              setMacWifi(temp);
              console.log('Mac wifi for android device is :: ' + temp);
            }
          }
        },
        (error) => {
          console.log('error v2 app.js' + error);
          return ActivityIndicatorImplement();
        },
      );
    }
    //-----------------------
    try {
      // 1: First get permission to get wifi mac
      if (PlatformOS === 'ios') {
        Geolocation.requestAuthorization();
      } else if (PlatformOS === 'android') {
        ANDROID_requestLocationPermission();
      }
      // console.log('333333'); // ok
      let uniqueId = DeviceInfo.getUniqueId();
      setuuid(uniqueId); // ok

      fetchNetworkinfo().then(function () {
        console.log('gogogo');
      });

      console.log('networkOk:' + networkOk + ' type:' + connectionType);
      if (networkOk === true && connectionType === 'wifi') {
        console.log('check ok; connectionType=' + connectionType); // vao day roi
        GetMacWifi();
        //alert('5555'); //ok
      } else {
        console.log('Network not found.');
      }
    } catch (error) {
      console.log('error app.js' + error);
    }
  }, [macWifi, uuid, networkOk, connectionType]);

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <HrmBrowser uuid={uuid} macWifi={macWifi} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
});
//-------------------------------------------------------------------------------------------------

export default App;
