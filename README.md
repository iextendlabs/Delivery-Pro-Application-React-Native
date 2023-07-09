# saloon
React Native Expo - Navigation (Side Menu & Footer with Icons)

How to:

npx create-expo-app rn-navigation

cd rn-navigation

npx expo install react-dom react-native-web @expo/webpack-config

npm install @react-navigation/native @react-navigation/drawer react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view

expo install react-native-reanimated

npm install react-native-vector-icons

Make changes in babel.config.js presets: ['babel-preset-expo'], plugins: ["react-native-reanimated/plugin"],

npx expo start --clear
