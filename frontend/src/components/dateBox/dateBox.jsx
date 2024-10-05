import React, { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";


const Example = () => {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker showIcon selected={startDate} onChange={(date) => setStartDate(date)} />
  );
};

export default Example;