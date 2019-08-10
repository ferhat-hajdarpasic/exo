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
} from 'react-native';
//import BleManager from 'react-native-ble-manager';
import { BleManager } from 'react-native-ble-plx';


const window = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const serviceUUID = 'f000aa64-0451-4000-b000-000000000000';
const characteristicDataUUID = 'f000aa65-0451-4000-b000-000000000000';
const characteristicConfigUUID = 'f000aa66-0451-4000-b000-000000000000';

export default class App extends Component {
  constructor() {
    super()
    this.manager = new BleManager();
    //this.device = null;
    this.state = {
      scanning: false,
      connected: false,
      peripherals: new Map(),
      appState: '',
      info: "", values: {}
    }
    this.prefixUUID = "f000aa"
    this.suffixUUID = "-0451-4000-b000-000000000000"
    this.sensors = {
      0: "Temperature",
      1: "Accelerometer",
      2: "Humidity",
      3: "Magnetometer",
      4: "Barometer",
      5: "Gyroscope"
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    // this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  serviceUUID(num) {
    return this.prefixUUID + num + "0" + this.suffixUUID
  }

  notifyUUID(num) {
    return this.prefixUUID + num + "1" + this.suffixUUID
  }

  writeUUID(num) {
    return this.prefixUUID + num + "2" + this.suffixUUID
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    console.log('conponentWillMount');
    const subscription = this.manager.onStateChange((state) => {
      console.log(`state=${JSON.stringify(state)}`);
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
    //BleManager.start({showAlert: false});

    //this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    //this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    //this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    //this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );



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
              if(service.uuid == serviceUUID && characteristicDataUUID == characteristic.uuid) {
                this.setState({connected: true, scanning: false});
              }
            }
          }

          // for (const id in this.sensors) {
          //   const service = this.serviceUUID(id)
          //   const characteristicW = this.writeUUID(id)
          //   const characteristicN = this.notifyUUID(id)

          //   const characteristic = await device.writeCharacteristicWithResponseForService(
          //     service, characteristicW, "AQ==" /* 0x01 in hex */
          //   )

          //   device.monitorCharacteristicForService(service, characteristicN, (error, characteristic) => {
          //     if (error) {
          //       this.error(error.message)
          //       return
          //     }
          //     this.updateValue(characteristic.uuid, characteristic.value)
          //   })
          // }
          // Do work on device with services and characteristics
          console.log(`serviceUUIDs=${discoveredDevice.serviceUUIDs}`);
        } catch (error) {
          // Handle errors
          console.log(`Error while discovering services ${error}`);
        };
      }
    });
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      //BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      //  console.log('Connected peripherals: ' + peripheralsArray.length);
      //});
    }
    this.setState({ appState: nextAppState });
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  // handleStopScan() {
  //   console.log('Scan is stopped');
  //   ;
  // }

  startScan() {
    if (!this.state.scanning) {
      scanAndConnect();
    }
  }

  retrieveConnected() {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({ peripherals });
      }
    });
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      console.log(`Got ble peripheral ${JSON.stringify(peripheral)}`);
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }

  test(peripheral) {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id).then(() => {
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({ peripherals });
          }
          console.log(`Connected to ${JSON.stringify(peripheral)}`);


          setTimeout(() => {

            /* Test read current RSSI value
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);

              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);
              });
            });*/

            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log('Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1, 95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');
                        /*
                        var PizzaBakeResult = {
                          HALF_BAKED: 0,
                          BAKED:      1,
                          CRISPY:     2,
                          BURNT:      3,
                          ON_FIRE:    4
                        };*/
                      });
                    });

                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  renderItem = (item) => {
    console.log(`Render item=${JSON.stringify(item.item)}`);
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => this.test(item.item)}>
        <View style={[styles.row, { backgroundColor: color }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.item.name}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 10 }}>{item.item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  render() {
    const list = Array.from(this.state.peripherals.values());
    //const dataSource = ds.cloneWithRows(list);


    return (
      <View style={styles.container}>
        <TouchableHighlight style={{ marginTop: 40, margin: 20, padding: 20, backgroundColor: '#ccc' }} onPress={() => this.startScan()}>
          <Text> ({this.state.scanning ? 'Scanning' : 'Not scanning'}) ({this.state.connected ? 'Connected' : 'Not connected'})</Text>
        </TouchableHighlight>
        <TouchableHighlight style={{ marginTop: 0, margin: 20, padding: 20, backgroundColor: '#ccc' }} onPress={() => this.retrieveConnected()}>
          <Text>Retrieve connected peripherals</Text>
        </TouchableHighlight>
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