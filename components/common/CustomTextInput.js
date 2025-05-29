import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import CountryPicker from "react-native-country-picker-modal";
const CustomTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  type,
  onSelectCountry,
  selectedCountry,
  isNumber,
  keyboardType,
  withCallingCodeButton,
  editable = true,
  multiline,
  numberOfLines,
}) => {
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  return (
    <View style={{ marginTop: 15 }}>
      {label && (
        <Text
          style={{
            marginLeft: 20,
            marginBottom: 5,
            fontWeight: "600",
            color: "#333",
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          width: "90%",
          height: multiline ? undefined : 50,
          borderWidth: 0.5,
          borderRadius: 10,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          paddingLeft: 20,
          paddingRight: 20,
          paddingVertical: multiline ? 10 : 0,
          backgroundColor: editable ? "#fff" : "#f0f0f0",
          borderColor: editable ? "#ccc" : "#ddd",
        }}
      >
        {isNumber && (
          <CountryPicker
            withFlag
            withFilter
            withCallingCode
            withFlagButton
            withCallingCodeButton={withCallingCodeButton}
            onSelect={(country) => {
              onSelectCountry(country);
              setCountryModalVisible(false);
            }}
            countryCode={selectedCountry}
            visible={countryModalVisible}
            theme={{
              fontSize: 14, // smaller font size
            }}
          />
        )}
        {icon && (
          <Image
            source={icon}
            style={{ width: 24, height: 24, marginLeft: 10 }}
          />
        )}
        <TextInput
          clearButtonMode={"always"}
          value={value}
          onChangeText={(txt) => {
            onChangeText(txt);
          }}
          placeholder={placeholder}
          secureTextEntry={type ? true : false}
          style={{
            marginLeft: 10,
            flex: 1,
            color: editable ? "#000" : "#888",
            textAlignVertical: multiline ? "top" : "center",
          }}
          keyboardType={keyboardType || "default"}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
    </View>
  );
};

export default CustomTextInput;
