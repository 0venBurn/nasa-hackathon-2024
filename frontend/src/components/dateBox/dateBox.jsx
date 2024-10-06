import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './dateBox.css'; 


const DateBox = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    return (
        <>
            <br/>
            <DatePicker
                showIcon
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
                endDate={endDate}
                className="date"
            />
            
            <DatePicker
                showIcon
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
                minDate={startDate}
                className="date"

        />
      </>
    );
  };

export default DateBox;