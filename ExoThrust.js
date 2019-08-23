import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
  Slider
} from 'react-native';

import { Buffer } from 'buffer';

const SERVICE_UUID = 'f000aa64-0451-4000-b000-000000000000';
const CHARACTERISTIC_DATA_UUID = 'f000aa65-0451-4000-b000-000000000000';
const CHARACTERISTIC_CONFIG_UUID = 'f000aa66-0451-4000-b000-000000000000';
const remote = 1;

export default class SensortTag extends Component {
  static isSensorTag(device) {
    return device.name === 'CC2650 SensorTag' ||  device.name === 'SensorTag';
  }
  static isServiceAndCharacteristic(service, characteristic) {
    return (service.uuid == SERVICE_UUID && CHARACTERISTIC_DATA_UUID == characteristic.uuid);
  }
  constructor(props) {
    super(props)
    this.state = {
      motors: [
        { on: false, speed: 0 },
        { on: false, speed: 0 },
        { on: false, speed: 0 }
      ]
    }
  }

  readConfigurationBytes = async () => {
    let ch = await this.props.connectedDevice.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_CONFIG_UUID);
    let bytes = Buffer.from(ch.value, 'base64');
    return bytes
  }

  readDataBytes = async () => {
    let ch = await this.props.connectedDevice.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_CONFIG_UUID);
    let bytes = Buffer.from(ch.value, 'base64');
    return bytes
  }

  writeConfiguration = async (data) => {
    const dataBase64 = Buffer.from(data).toString('base64');
    await this.props.connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, CHARACTERISTIC_CONFIG_UUID, dataBase64);
  }

  writeDataBytes = async (data) => {
    const dataBase64 = Buffer.from(data).toString('base64');
    await this.props.connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, CHARACTERISTIC_DATA_UUID, dataBase64);
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

  render() {
    let Motor = (props) => {
      return <View style={{ flex: 1, flexDirection: 'row', padding: 4 }}>
        <Button onPress={async () => await this.toggleMotor(props.number, props.value)}
          title={this.state.motors[props.number].on ? "ON" : "OFF"} color={this.state.motors[props.number].on ? "steelblue" : "powderblue"} />
        <Slider step={1} maximumValue={255} onSlidingComplete={async (value) => await this.setMotorSpeed(props.number, value)} 
          value={this.state.motors[props.number].speed} style={{ flexGrow: 1 }} />
      </View>
    }
    return (
      <TouchableHighlight>
        <View style={[styles.row, { backgroundColor: '#fff' }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{this.props.connectedDevice.name}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 10 }}>{this.props.connectedDevice.id}</Text>
          <Motor number='0' value={1} />
          <Motor number='1' value={2} />
          <Motor number='2' value={4} />
        </View>
      </TouchableHighlight>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
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