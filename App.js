/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  LogBox,
  Platform,
} from 'react-native';
import HrmBrowser from './_HrmBrowser';
import {
  Header,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';
import Geolocation from '@react-native-community/geolocation';



// https://www.npmjs.com/package/react-native-get-location
//-------------------------------------------------------------------------------------------------

export async function ANDROID_requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Example App',
        'message': 'Example App access to your location '
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the location")
      alert("You can use the location");
    } else {
      console.log("location permission denied")
      alert("Location permission denied");
    }
  } catch (err) {
    console.warn(err)
  }
}

const App: () => React$Node = () => {
  const [macWifi, setMacWifi] = useState('');
  const [uuid, setuuid] = useState('');




  useEffect(() => {
    try {
      // 1: First get permission to get wifi mac
      if (Platform.OS === "ios") {
        Geolocation.requestAuthorization();
      }
      else if (Platform === "android") {
        ANDROID_requestLocationPermission();
      }


      let uniqueId = DeviceInfo.getUniqueId();
      setuuid(uniqueId);

      NetworkInfo.getBSSID().then(bssid => {
        let temp = bssid;

        if (temp) {
          // iOS phai cong phan tu th 4 len 1 don vi moi = thuc te
          if (Platform.OS === "ios") {
            let arr = temp.split(":");
            let tempElement4 = arr[3];
            arr[3] = parseInt(tempElement4) - 1;

            temp = arr.join(":");
            setMacWifi(temp);

            alert("Origin::"+bssid+"\n iOS::"+temp);
          }

        }
      }, (error) => {
      });
    } catch (error) {

    }
  });
  return (
    <>
      <StatusBar barStyle="dark-content" />
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
