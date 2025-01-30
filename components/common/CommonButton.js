import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const CommonButton = ({ onPress, title, bgColor, textColor, disabled }) => {
  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: bgColor,
          justifyContent: "center",
          alignItems: "center",
          height: 50,
          width: "90%",
          borderRadius: 10,
          alignSelf: "center",
          marginTop: 20,
        }}
        onPress={() => {
          if (!disabled) {
            onPress();
          }
        }}
        disabled={disabled}
      >
        <Text style={{ fontSize: 17, fontWeight: "600", color: textColor }}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CommonButton;
