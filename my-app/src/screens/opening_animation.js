import React, { useEffect } from 'react';
import { View, Dimensions, Image, StyleSheet } from 'react-native';
import Svg, { Text as SvgText, Rect, ClipPath, Defs } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const ORANGE_COLOR = '#E8812B';
const TEXT = 'The grATE App';

// Placeholder images (you can replace with your own local assets)
const ORANGE_URI = 'https://i.imgur.com/ePzq5JY.png'; // simple orange image with transparent bg
const CLOUD_LEFT_URI = 'https://i.imgur.com/5zV9cV6.png'; // cloud left
const CLOUD_RIGHT_URI = 'https://i.imgur.com/TmPUEtD.png'; // cloud right

export default function OpeningAnimation({ navigation }) {
  // Animation progress shared values
  const orangeY = useSharedValue(height);
  const cloudLeftX = useSharedValue(-150);
  const cloudRightX = useSharedValue(width + 150);
  const squeeze = useSharedValue(1);
  const juiceFill = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    async function runAnimation() {
      // 1. Orange rises
      orangeY.value = withTiming(height / 3, { duration: 2000 });

      // Wait 2s then clouds come
      await new Promise((r) => setTimeout(r, 2100));

      cloudLeftX.value = withTiming(width / 2 - 120, { duration: 1200 });
      cloudRightX.value = withTiming(width / 2 + 120, { duration: 1200 });

      // Squeeze orange after clouds arrive
      await new Promise((r) => setTimeout(r, 1300));
      squeeze.value = withSequence(
        withTiming(0.7, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      );

      // Juice fill animation starts
      await new Promise((r) => setTimeout(r, 1200));
      juiceFill.value = withTiming(1, { duration: 2500 });

      // Wait juice fill, then fade out and navigate
      await new Promise((r) => setTimeout(r, 2600));
      opacity.value = withTiming(0, { duration: 700 }, (finished) => {
        if (finished) {
          runOnJS(navigateToMain)();
        }
      });
    }

    runAnimation();
  }, []);

  // Navigation callback
  function navigateToMain() {
    navigation.replace('MainScreen');
  }

  // Animated styles

  const orangeStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 120,
    height: 120,
    bottom: 0,
    left: width / 2 - 60,
    transform: [
      { translateY: orangeY.value - 120 },
      { scaleX: squeeze.value },
      { scaleY: squeeze.value },
    ],
  }));

  const cloudLeftStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 140,
    height: 80,
    top: height / 3 - 40,
    left: cloudLeftX.value,
  }));

  const cloudRightStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 140,
    height: 80,
    top: height / 3 - 40,
    left: cloudRightX.value,
  }));

  const containerOpacity = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
  }));

  // Juice fill height interpolation for clipping
  const juiceHeight = juiceFill.value * 80; // height of fill inside text

  // Render juice fill mask for SVG text
  return (
    <Animated.View style={[styles.container, containerOpacity]}>
      {/* Orange */}
      <Animated.Image
        source={{ uri: ORANGE_URI }}
        style={orangeStyle}
        resizeMode="contain"
      />

      {/* Clouds */}
      <Animated.Image
        source={{ uri: CLOUD_LEFT_URI }}
        style={cloudLeftStyle}
        resizeMode="contain"
      />
      <Animated.Image
        source={{ uri: CLOUD_RIGHT_URI }}
        style={cloudRightStyle}
        resizeMode="contain"
      />

      {/* Text with juice fill effect */}
      <View style={styles.textWrapper}>
        <Svg width={width} height={100}>
          <Defs>
            <ClipPath id="clip">
              <SvgText
                x={width / 2}
                y={70}
                textAnchor="middle"
                fontSize={33}
                fontWeight="bold"
                fontFamily="Playfair Display"
                fill={ORANGE_COLOR}
              >
                {TEXT}
              </SvgText>
            </ClipPath>
          </Defs>

          {/* Juice fill rectangle animates height */}
          <Animated.Rect
            x={width / 2 - 150}
            y={80 - juiceHeight}
            width={300}
            height={juiceHeight}
            fill={ORANGE_COLOR}
            clipPath="url(#clip)"
          />

          {/* Text outline on top */}
          <SvgText
            x={width / 2}
            y={70}
            textAnchor="middle"
            fontSize={33}
            fontWeight="bold"
            fontFamily="Playfair Display"
            fill="none"
            stroke={ORANGE_COLOR}
            strokeWidth={1}
          >
            {TEXT}
          </SvgText>
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f3ff', // subtle sky blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    alignItems: 'center',
  },
});
