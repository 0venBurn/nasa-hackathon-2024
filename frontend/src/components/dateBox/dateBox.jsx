import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './dateBox.css'; 


const DateBox = () => {
  const today = new Date()
  const twoWeeksAgo = new Date().setDate(today.getDate() - 14)
    // const {today, twoWeeksAgo} = getCurrentDateRange()
    const [startDate, setStartDate] = useState(twoWeeksAgo);
    const [endDate, setEndDate] = useState(today);
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
      </div>
    );
  };

export default DateBox;