/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 * @flow react-native-network-info
 * @flow @react-native-community/netinfo
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
  const [deviceId, setDeviceId] = useState('');
  // var macWifi = '';
  // var deviceId = '';

  // const unsubscribe = NetInfo.addEventListener((state) => {
  //   if (state.isConnected === true) {
  //     console.log('có mạng');
  //     return <InformActivity />;
  //   } else {
  //     console.log('không có mạng');
  //     return <HomeActivity />;
  //   }
  // });

  useEffect(() => {
    async function GetMacWifi() {
      try {
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
                console.log('-----> Mac wifi of ios device is :: ' + temp);
              } else if (PlatformOS === 'android') {
                // Mac wifi ::74:83:c2:37:f7:f9
                setMacWifi(temp);
                console.log('-----> Mac wifi for android device is :: ' + temp);
              }
            }
          },
          (error) => {
            console.log('error v2 app.js' + error);
            //return ActivityIndicatorImplement();
          },
        );
      } catch (error) {
        console.log('await NetworkInfo.getBSSID() error :: ' + error);
      }
    }
    //-----------------------
    try {
      // 1: First get permission to get wifi mac
      if (PlatformOS === 'ios') {
        Geolocation.requestAuthorization();
      } else if (PlatformOS === 'android') {
        ANDROID_requestLocationPermission();
      }
      let uniqId = DeviceInfo.getUniqueId();
      setDeviceId(uniqId); // ok
      NetInfo.fetch('wifi').then((state) => {
        //console.log('----- EVENT 0000 ----- Connection type=' + state.type + '-----Is connected=' + state.isConnected);
        if (state.type === 'wifi') {
          GetMacWifi();
        }
      });
    } catch (error) {
      console.log('error app.js' + error);
    }
  }, [macWifi, deviceId]);

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <HrmBrowser deviceId={deviceId} macWifi={macWifi} />
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
