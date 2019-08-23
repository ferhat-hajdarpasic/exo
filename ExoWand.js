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

const EXOWAND_SERVICE_UUID =       'cb029ef2-c540-11e9-aa8c-2a2ae2dbcce4';
const EXOWAND_PROFILE_MOTO1_UUID = 'cb02a262-c540-11e9-aa8c-2a2ae2dbcce4';
const EXOWAND_PROFILE_MOTO2_UUID = 'cb02a424-c540-11e9-aa8c-2a2ae2dbcce4';
const EXOWAND_PROFILE_MOTO3_UUID = 'cb02a640-c540-11e9-aa8c-2a2ae2dbcce4';

const MOTOR_UUIDS = [EXOWAND_PROFILE_MOTO1_UUID, EXOWAND_PROFILE_MOTO2_UUID, EXOWAND_PROFILE_MOTO3_UUID];

export default class ExoWand extends Component {
  static isDevice(device) {
    return device.name === 'ExoWand';
  }
  static isServiceAndCharacteristic(service, characteristic) {
    return (service.uuid == EXOWAND_SERVICE_UUID && EXOWAND_PROFILE_MOTO1_UUID == characteristic.uuid);
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

  writeDataBytes = async (data, serviceUuid, characteristicDataUuid) => {
    const dataBase64 = Buffer.from(data).toString('base64');
    await this.props.connectedDevice.writeCharacteristicWithResponseForService(serviceUuid, characteristicDataUuid, dataBase64);
  }

  setMotorSpeedAndDuration = async (motorIndex, speed, duration) => {
    let motors = this.state.motors;
    if (motors[motorIndex].on) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt16BE(speed, 0);
        buffer.writeInt16BE(duration, 2);
        await this.writeDataBytes([...buffer], EXOWAND_SERVICE_UUID, MOTOR_UUIDS[motorIndex]);
    }
  }

  toggleMotor = async (motorIndex) => {
    let motors = this.state.motors;
    motors[motorIndex].on = !motors[motorIndex].on;
    if (motors[motorIndex].on) {
      await this.writeMotor(motorIndex, motors[motorIndex].speed);
    } else {
      await this.writeMotor(motorIndex, 0);
    }
    this.setState({ motors: motors });
  }

  render() {
    let Motor = (props) => {
      return <View style={{ flex: 1, flexDirection: 'row', padding: 4 }}>
        <Button onPress={async () => await this.toggleMotor(props.motorIndex, props.value)}
          title={this.state.motors[props.motorIndex].on ? "ON" : "OFF"} color={this.state.motors[props.motorIndex].on ? "steelblue" : "powderblue"} />
        <Slider step={1} maximumValue={255} onSlidingComplete={async (value) => await this.setMotorSpeedAndDuration(props.motorIndex, value)} 
          value={this.state.motors[props.motorIndex].speed} style={{ flexGrow: 1 }} />
      </View>
    }
    return (
      <TouchableHighlight>
        <View style={[styles.row, { backgroundColor: '#fff' }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{this.props.connectedDevice.name}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 10 }}>{this.props.connectedDevice.id}</Text>
          <Motor motorIndex='0' value={1} />
          <Motor motorIndex='1' value={2} />
          <Motor motorIndex='2' value={4} />
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