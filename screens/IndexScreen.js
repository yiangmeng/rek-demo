import React from 'react';
import { Button, Image, View, TextInput, Text, StyleSheet, Alert } from 'react-native';
import { ImagePicker, ImageManipulator } from 'expo';

export default class IndexScreen extends React.Component {
  static navigationOptions = {
    title: 'Index Face',
  };

  state = {
    image: null,
    name: null,
    isFocused: false,
    isUploading: false
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput
          selectionColor="#428AF8"
          underlineColorAndroid={
            this.state.isFocused ? "#428AF8" : "#D3D3D3"
          }
          placeholder="Enter a Name"
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          style={styles.textInput}
          onChangeText={(text) => this.setState({name: text})}
          value={this.state.name}
        />
        <Button
          title="Pick an image from camera roll"
          onPress={this._pickImage}
          style={styles.button}
        />

        {this.state.image &&
          <Image source={{ uri: this.state.image }} style={{ width:200, height: 200 }} resizeMode='contain' />
        }

        {this.state.image && this.state.name !== "" &&
          <Button
            title={this.state.isUploading ? 'Processing...' : 'Index it!'}
            onPress={this._indexImage}
            style={styles.button}
            disabled={this.state.isUploading ? true : false}
          />
        }
      </View>
    );
  }

  handleFocus = event => {
    this.setState({ isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  handleBlur = event => {
    this.setState({ isFocused: false });
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  };

  _pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.cancelled) {
        this.setState({ image: result.uri })
      }
  }

  _encodeImage = async() => {
    return await ImageManipulator.manipulateAsync(
          this.state.image,
          [],
          { compress: 1, format: "jpg", base64: true }
      ).then(response => {
        return response.base64
      })
  }

  _indexImage = async() => {
    this.setState({ isUploading: true });
    var encoded = this._encodeImage()
    encoded.then(photo => {
        console.log(photo)
        var data = {
          "filename": new Date().toLocaleString().replace(' ','-') +".jpg",
          "image": photo,
          "name": this.state.name
        }
        const settings = {
            method: 'POST',
            body: JSON.stringify(data)
        };
        return fetch("https://s05u10oab9.execute-api.ap-northeast-1.amazonaws.com/dev/indexface", settings)
            .then(response => {
              console.log(response)
              Alert.alert(
                'Face Index',
                'Successfully indexed!',
                [
                  {text: 'OK', onPress: () => console.log('OK Pressed')},
                ],
                { cancelable: false }
              )
              return response.json()
            })
            .catch(e => {
              console.log("error: "+ e )
              return false;
            });
        }
    ).then(response => {
      this.setState({
        image: null,
        name: null,
        isFocused: false,
        isUploading: false
       });
      return response
    })

  }
}

const styles = StyleSheet.create({
  textInput: {
    width: 300,
    height: 40,
    paddingLeft: 6
  },

  button: {
    paddingBottom: 10,
  }
})
