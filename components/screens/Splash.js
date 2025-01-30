import { View, Text, Image } from "react-native";
import React from "react";
import * as Animatable from "react-native-animatable";

const Splash = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animatable.Image
        animation="fadeIn" // You can use other animations like 'fadeIn', 'slideInUp', etc.
        iterationCount="infinite"
        source={require("../images/icon.png")}
        style={{
          width: 100,
          height: 100,
          resizeMode: "center",
        }}
      />
      <Text style={{ fontWeight: "800", marginTop: 20, fontSize: 24, color: "#000" }}>
        LipsLay Staff
      </Text>
    </View>
  );
};

export default Splash;
