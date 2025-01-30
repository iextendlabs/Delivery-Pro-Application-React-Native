import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";

const CustomTextInput = ({
  value,
  onChangeText,
  placeholder,
  icon,
  type
}) => {
  return (
    <View style={{ marginTop: 10 }}>
      <View
        style={{
          width: "90%",
          height: 50,
          borderWidth: 0.5,
          borderRadius: 10,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {icon && (
          <Image source={icon} style={{ width: 24, height: 24, marginLeft: 10 }} />
        )}
        <TextInput
          clearButtonMode={"always"}
          value={value}
          onChangeText={(txt) => {
            onChangeText(txt);
          }}
          placeholder={placeholder}
          secureTextEntry={type ? true : false}
          style={{ marginLeft: 10, width: 200 }}
        />
      </View>
    </View>
  );
};

export default CustomTextInput;
