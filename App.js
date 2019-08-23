import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  PermissionsAndroid,
  FlatList,
  ScrollView,
  AppState,
  Dimensions,
  Button
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import SensortTag from './SensorTag';

const window = Dimensions.get('window');

export default class App extends Component {
  constructor() {
    super()
    this.manager = new BleManager();
    this.state = {
      connectedDevice: null,
      scanning: false,
      connected: false,
      appState: '',
      info: "", values: {},
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    // this.handleStopScan = this.handleStopScan.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    console.log('conponentWillMount');
    const subscription = this.manager.onStateChange((state) => {
      console.log(`state=${JSON.stringify(state)}`);
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      } else if (state === 'PoweredOff') {
        console.log('Blutooth is turned off.');
      }
    }, true);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

  }

  scanAndConnect = () => {
    this.setState({ scanning: true });
    this.manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.log(`Error ${error} while scanning`);
        return
      }

      if (device.name) {
        console.log(`device: id = ${device.id}, name = ${device.name}`);
      }
      if (SensortTag.isDevice(device)) {
        console.log('Found the device so stopping scanning');
        this.manager.stopDeviceScan();
        try {
          let connectedDevice = await device.connect();
          let discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
          let services = await discoveredDevice.services();
          console.log(`service count = ${services.length}`);
          for (let service of services) {
            console.log(`service id = ${service.id}, uuid = ${service.uuid}`);
            let characteristics = await service.characteristics();
            console.log(`characteristics count = ${characteristics.length}`);
            for (let characteristic of characteristics) {
              console.log(`characteristic id = ${characteristic.id}, uuid = ${characteristic.uuid}, isWritableWithoutResponse = ${characteristic.isWritableWithoutResponse}, isWritableWithResponse = ${characteristic.isWritableWithResponse}`);
              if (SensortTag.isServiceAndCharacteristic(service, characteristic)) {
                this.handleDiscoverPeripheral(discoveredDevice);
              }
            }
          }
        } catch (error) {
          console.log(`Error while discovering services ${error}`);
        };
      }
    });
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({ appState: nextAppState });
  }

  componentWillUnmount() {
  }

  startScan = () => {
    if (!this.state.scanning) {
      this.scanAndConnect();
    }
  }

  toggleConnect = async () => {
    if (this.state.connectedDevice) {
      this.handleDisconnectedPeripheral();
      await this.state.connectedDevice.cancelConnection();
      this.setState({ scanning: false, connected: false, connectedDevice: null });
    } else {
      this.startScan();
    }
  }

  handleDisconnectedPeripheral() {
  }

  handleDiscoverPeripheral(peripheral) {
    this.setState({ scanning: false, connected: true, connectedDevice: peripheral });
  }

  render() {
    let RenderItem = (props) => {
      return (
        <SensortTag connectedDevice={this.state.connectedDevice}>
        </SensortTag>
      );
    };
    return (
      <View style={styles.container}>
        <TouchableHighlight style={{ marginTop: 4, margin: 2, padding: 2, backgroundColor: '#ccc' }}>
          <Text> {this.state.scanning ? 'Scanning' : ''}{this.state.connected ? 'Connected' : ''}</Text>
        </TouchableHighlight>
        <Button onPress={async () => await this.toggleConnect()} title={this.state.connected ? 'Disconnect' : 'Connect'} color={this.state.connected ? 'steelblue' : 'powderblue'} />
        <ScrollView style={styles.scroll}>
          {(this.state.connectedDevice == null) &&
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: 'center' }}>No device</Text>
            </View>
          }
          {(this.state.connectedDevice != null) &&          
            <RenderItem />
          }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10
  },
});