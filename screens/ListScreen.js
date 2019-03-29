import React from 'react'
import { Button, Image, View, TextInput, Text, StyleSheet, FlatList, Alert} from 'react-native'
import { ImagePicker, ImageManipulator } from 'expo'

export default class ListScreen extends React.Component {
  static navigationOptions = {
    title: 'List Indexed Faces',
  };

  state = {
    data: null,
    isClearing: false,
    isFetching: false,
  };

  async componentDidMount() {
    this.getData()
  }

  render() {

    return (
      <View style={styles.container}>
        <View>
          <Button
            title={'Refresh'}
            onPress={this.onRefresh}
            style={styles.button}
          />
          <Button
            title={'Clear all faces'}
            onPress={this.clearFaces}
            style={styles.button}
            disabled={this.state.isClearing ? true : false}
          />
        </View>
        <Text style={styles.faceCount}>Number of Faces Indexed: {this.state.data ? this.state.data.faceCount : '0'}</Text>
        <FlatList
          data={this.state.data ? this.state.data.items : []}
          keyExtractor={this._keyExtractor}
          renderItem={({item}) =>
            <View style={styles.flatView}>
              <Text style={styles.fullName}>{item.FullName}</Text>
              <Text style={styles.rekognitionId}>{item.RekognitionId}</Text>
            </View>
          }
        />
      </View>
    )
  }

  _keyExtractor = (item, index) => item.FullName

  getData = async () =>{
    var data = {}
    const settings = {
        method: 'POST',
        body: JSON.stringify(data)
    }
    return await fetch("https://s05u10oab9.execute-api.ap-northeast-1.amazonaws.com/dev/listfaces", settings)
        .then(response => {
          return response.json()
        })
        .then(json => {
          this.setState({data: json})
        })
        .catch(e => {
          console.log("error: "+ e )
          return false;
        })
    }

    clearFaces = async () =>{
      this.setState({ isClearing: true });
      var data = {}
      const settings = {
          method: 'POST',
          body: JSON.stringify(data)
      }
      return await fetch("https://s05u10oab9.execute-api.ap-northeast-1.amazonaws.com/dev/clearfaces", settings)
          .then(response => {
            this.setState({ isClearing: false, isFetching: false });
            Alert.alert(
              'Clear Faces',
              'Indexed faces successfully cleared.',
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              { cancelable: false }
            )
            this.onRefresh()
            return response.json()
          })
          .catch(e => {
            console.log("error: "+ e )
            return false;
          })
    }

  onRefresh = () =>{
    this.setState({ isFetching: true }, () => { this.getData() })
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 22,
    paddingLeft: 20,
    paddingRight: 20,
  },
  flatView: {
    flex:1,
    justifyContent: 'center',
    borderRadius: 2,
  },
  fullName: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 5,
  },
  rekognitionId:{
    fontSize: 10,
    paddingBottom: 5,
  },
  faceCount:{
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    flex:1,
    paddingBottom: 10,
    marginBottom: 10
  }
})
