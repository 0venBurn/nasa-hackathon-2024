import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const DateBox = () => {
  const today = new Date()
  const twoWeeksAgo = new Date().setDate(today.getDate() - 14)
    // const {today, twoWeeksAgo} = getCurrentDateRange()
    const [startDate, setStartDate] = useState(twoWeeksAgo);
    const [endDate, setEndDate] = useState(today);
    return (
      <div style={{
        display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          gap: "1rem",
          margin: "1.5rem"
      }}>
            <DatePicker
                showIcon
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />
            <DatePicker
                showIcon
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
        />
      </div>
    );
  };

export default DateBox;