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
  Text,
  StatusBar,
  YellowBox,
  LogBox,
} from 'react-native';
import HrmBrowser from './_HrmBrowser';
import {
  Header,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DeviceInfo from 'react-native-device-info';
import {NetworkInfo} from 'react-native-network-info';
import Geolocation from '@react-native-community/geolocation';
import symbolicateStackTrace from 'react-native/Libraries/Core/Devtools/symbolicateStackTrace';

LogBox.ignoreAllLogs(true);

const App: () => React$Node = () => {
  const [macWifi, setMacWifi] = useState('');
  const [uuid, setuuid] = useState('');

  Geolocation.getCurrentPosition(
    (info) => console.log(info),
    (error) => console.log(JSON.stringify(error)),
    {
      enableHighAccuracy: Platform.OS !== 'android',
      timeout: 2000,
      maximumAge: 2000,
    },
  );
  useEffect(() => {
    try {
      let uniqueId = DeviceInfo.getUniqueId();
      setuuid(uniqueId);

      NetworkInfo.getBSSID().then((bssid) => {
        setMacWifi(bssid);
      });
    } catch (error) {}
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

export default App;
