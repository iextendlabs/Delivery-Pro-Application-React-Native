import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

const DatePickerModal = ({ visible, value, onChange }) => {
  if (!visible) return null;

  return (
    <DateTimePicker
      value={value}
      mode="date"
      display="default"
      onChange={onChange}
    />
  );
};

export default DatePickerModal;