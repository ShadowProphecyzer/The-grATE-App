import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

const ORANGE_COLOR = '#E8812B';
const BUTTON_WIDTH = 250;
const BUTTON_HEIGHT = 50;

export default function MainScreen() {
  return (
    <View style={styles.container}>
      {/* Top Text */}
      <Text style={styles.topText}>The grATE App</Text>

      {/* Logo */}
      <View style={styles.logoContainer}>
        {/* Placeholder logo with orange border */}
        <Image
          source={{ uri: 'https://i.imgur.com/ePzq5JY.png' }} // Replace with your logo URI/local asset
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',

    // Space top and bottom evenly using paddingTop and paddingBottom
    paddingTop: height * 0.1, // 10% from top
    paddingBottom: height * 0.1, // 10% from bottom
  },
  topText: {
    fontFamily: 'Poppins_600SemiBold', // Make sure font is loaded
    fontSize: 16.5,
    color: ORANGE_COLOR,
    textAlign: 'center',
  },
  logoContainer: {
    width: BUTTON_WIDTH,
    height: BUTTON_WIDTH,
    borderWidth: 3,
    borderColor: ORANGE_COLOR,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  button: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: ORANGE_COLOR,
    borderRadius: BUTTON_HEIGHT / 2, // rounded button
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 7,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16.5,
    color: '#fff',
  },
});
