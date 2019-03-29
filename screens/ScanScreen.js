import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FileSystem,
  Vibration
} from 'react-native'
import { WebBrowser } from 'expo'
import { Camera, Permissions, FaceDetector, ImageManipulator } from 'expo'
import { withNavigationFocus } from 'react-navigation'

import { MonoText } from '../components/StyledText';

export default withNavigationFocus(class ScanScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  static defaultProps = {
    cameraType: Camera.Constants.Type.front, //front vs rear facing camera
  }

  state = {
    hasCameraPermission: null,
    faceDetecting: false, //when true, we look for faces
    faceDetected: false, //when true, we've found a face
    scanResult: null // result
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentWillUpdate(nextProps, nextState) {
    setTimeout(()=>{
          this.detectFaces(true);
        },500);
  }

  detectFaces(doDetect){
    this.setState({
      faceDetecting: doDetect,
    });
  }

  render() {
    if (this.props.isFocused){
      const { hasCameraPermission } = this.state;

      const {height, width} = Dimensions.get('window');
      const newWidth = height*(3/4);
      const widthOffset = -((newWidth-width)/2);

      if (hasCameraPermission === null) {
        return <View />;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
        return (
          <View style={{ flex: 1 }}>
            <Camera
              style={{ flex: 1 }}
              type={this.props.cameraType}
              onFacesDetected={this.state.faceDetecting ? this.handleFacesDetected : undefined }
              onFaceDetectionError={this.handleFaceDetectionError}
              faceDetectorSettings={{
                mode: FaceDetector.Constants.Mode.fast,
                detectLandmarks: FaceDetector.Constants.Mode.none,
                runClassifications: FaceDetector.Constants.Mode.none,
              }}
              ref={ref => {
                this.camera = ref;
              }}
              ratio={"16:9"}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  position: 'absolute',
                  bottom: 0,
                }}>
                  <Text
                    style={styles.textStandard}>
                    {this.state.faceDetected ? 'Face Detected' : 'No Face Detected'}
                  </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: this.state.scanResult ? 'flex' : 'none',
                }}>
                <Text style={styles.result}>
                  {this.state.scanResult}
                </Text>
              </View>


            </Camera>
          </View>
        );
      }
    }
    else{
      return (
        <View/>
      )
    }
  }

  handleFacesDetected = ({ faces }) => {
    if (faces.length === 1){
      this.setState({
        faceDetected: true,
      });
      if (!this.state.faceDetected){
        this.takePicture()
      }
    } else {
      this.setState({faceDetected: false, scanResult: false });
    }
  }

  getPhoto = async () => {
    return await this.camera.takePictureAsync(
      {
        base64: false,
        quality: 0.3,
      }
    ).then(response => {
      return response
    });
  }

  resizePhoto = async (photo) => {
    return await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { height: 200 } }],
          { compress: 0.2, format: "jpg", base64: true }
      ).then(response => {
        return response
      })
  }

  takePicture = async () =>{
    this.setState({scanResult: null });
    if (this.camera) {
        var photoPromise = this.getPhoto()

        photoPromise.then(photo => {
            console.log("Took photo!")
            return this.resizePhoto(photo)
        })
        .then(image => {
          return this.sendPhoto(image)
        })
        .then(sendImageStatus => {
          try{
            console.log(sendImageStatus)
            if (sendImageStatus != false)
            {
              sendImageStatus = JSON.parse(sendImageStatus)
              if (sendImageStatus != null)
              {
                this.setState({
                  scanResult: sendImageStatus.result
                })
              }
              else{
                throw "sendImageStatus is null."
              }
            }
            else{
              throw "sendImageStatus is false."
            }
          }
          catch(err){
            console.log("caught error: "+err)
            this.setState({
              faceDetected: false,
              scanResult: null
            })
          }
        })
    }
  }

  sendPhoto = async(image) => {
    var data = {
      "image": image.base64,
    }
    const settings = {
        method: 'POST',
        body: JSON.stringify(data)
    };
    return await fetch("https://s05u10oab9.execute-api.ap-northeast-1.amazonaws.com/dev/clockin", settings)
        .then(response => {
          return response.json()
        })
        .catch(e => {
          console.log("error: "+ e )
          return false;
        });
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  scanScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  textStandard: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white'
  },
  result: {
    fontSize: 20,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 5
  }
})
