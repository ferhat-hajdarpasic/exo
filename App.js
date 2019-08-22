import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  FlatList,
  ScrollView,
  AppState,
  Dimensions,
  Button,
  Slider
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const window = Dimensions.get('window');

const serviceUUID = 'f000aa64-0451-4000-b000-000000000000';
const characteristicDataUUID = 'f000aa65-0451-4000-b000-000000000000';
const characteristicConfigUUID = 'f000aa66-0451-4000-b000-000000000000';
const red = 1;
const green = 2;
const buzzer = 4;

const remote = 1;

export default class App extends Component {
  constructor() {
    super()
    this.manager = new BleManager();
    this.m_connectedDevice = null;
    this.state = {
      scanning: false,
      connected: false,
      peripherals: new Map(),
      appState: '',
      info: "", values: {},
      motors: [
        { on: false, speed: 0 },
        { on: false, speed: 0 },
        { on: false, speed: 0 }
      ]
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    // this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
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
        // Handle error (scanning will be stopped automatically)
        console.log(`Error ${error} while scanning`);
        return
      }

      if (device.name) {
        console.log(`device: id = ${device.id}, name = ${device.name}`);
      }
      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (device.name === 'CC2650 SensorTag' ||
        device.name === 'SensorTag') {

        console.log('Found the device so stopping scanning');
        // Stop scanning as it's not necessary if you are scanning for one device.
        //this.device = device;
        this.manager.stopDeviceScan();

        try {
          // Proceed with connection.
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
              if (service.uuid == serviceUUID && characteristicDataUUID == characteristic.uuid) {
                this.setState({ connected: true, scanning: false });
                this.m_connectedDevice = discoveredDevice;

                this.handleDiscoverPeripheral(this.m_connectedDevice);
              }
            }
          }
        } catch (error) {
          console.log(`Error while discovering services ${error}`);
        };
      }
    });
  }

  readConfigurationBytes = async () => {
    let ch = await this.m_connectedDevice.readCharacteristicForService(serviceUUID, characteristicConfigUUID);
    let bytes = Buffer.from(ch.value, 'base64');
    return bytes
  }

  readDataBytes = async () => {
    let ch = await this.m_connectedDevice.readCharacteristicForService(serviceUUID, characteristicConfigUUID);
    let bytes = Buffer.from(ch.value, 'base64');
    return bytes
  }

  writeConfiguration = async (data) => {
    const dataBase64 = Buffer.from(data).toString('base64');
    await this.m_connectedDevice.writeCharacteristicWithResponseForService(serviceUUID, characteristicConfigUUID, dataBase64);
  }

  writeDataBytes = async (data) => {
    const dataBase64 = Buffer.from(data).toString('base64');
    await this.m_connectedDevice.writeCharacteristicWithResponseForService(serviceUUID, characteristicDataUUID, dataBase64);
  }

  setIO = async (io) => {
    let configuration = await this.readConfigurationBytes();
    console.log(`FRED value=${configuration[0]}`);
    await this.writeConfiguration([remote]);
    await this.writeDataBytes([io]);
  }

  toggleMotor = async (number, value) => {
    let motors = this.state.motors;
    motors[number].on = !motors[number].on;
    if (motors[number].on) {
      await this.setIO(value);
    } else {
      await this.setIO(0);
    }
    this.setState({ motors: motors });
  }

  setMotorSpeed = async (number, value) => {
    await this.setIO(0);
    let motors = this.state.motors;
    motors[number].speed = value;
    this.setState({ motors: motors });
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({ appState: nextAppState });
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleUpdateValueForCharacteristic(data) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  startScan = () => {
    if (!this.state.scanning) {
      this.scanAndConnect();
    }
  }

  toggleConnect = async () => {
    if (this.m_connectedDevice) {
      this.handleDisconnectedPeripheral();
      await this.m_connectedDevice.cancelConnection();
      this.m_connectedDevice = null;
      this.setState({ connected: false });
    } else {
      this.startScan();
    }
  }

  handleDisconnectedPeripheral() {
    let peripherals = this.state.peripherals;
    peripherals.clear();
    this.setState({ peripherals });
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }

  renderItem = (item) => {
    const color = item.connected ? 'green' : '#fff';
    let Motor = (props) => {
      return <View style={{ flex: 1, flexDirection: 'row', padding: 4 }}>
        <Button onPress={async () => await this.toggleMotor(props.number, props.value)}
          title={this.state.motors[props.number].on ? "ON" : "OFF"} color={this.state.motors[props.number].on ? "steelblue" : "powderblue"} />
        <Slider step={1} maximumValue={255} onSlidingComplete={async (value) => await this.setMotorSpeed(props.number, value)} value={this.state.motors[props.number].speed } style={{ flexGrow: 1 }} />
      </View>
    }
    return (
      <TouchableHighlight>
        <View style={[styles.row, { backgroundColor: color }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.item.name}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 10 }}>{item.item.id}</Text>
          <Motor number='0' value={1} />
          <Motor number='1' value={2} />
          <Motor number='2' value={4} />
        </View>
      </TouchableHighlight>
    );
  };


  render() {
    const list = Array.from(this.state.peripherals.values());
    //const dataSource = ds.cloneWithRows(list);

    return (
      <View style={styles.container}>
        <TouchableHighlight style={{ marginTop: 4, margin: 2, padding: 2, backgroundColor: '#ccc' }}>
          <Text> {this.state.scanning ? 'Scanning' : ''}{this.state.connected ? 'Connected' : ''}</Text>
        </TouchableHighlight>
        <Button onPress={async () => await this.toggleConnect()} title={this.state.connected ? 'Disconnect' : 'Connect'} color={this.state.connected ? 'steelblue' : 'powderblue'} />
        <ScrollView style={styles.scroll}>
          {(list.length == 0) &&
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: 'center' }}>No peripherals</Text>
            </View>
          }
          <FlatList data={list} renderItem={this.renderItem} />
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