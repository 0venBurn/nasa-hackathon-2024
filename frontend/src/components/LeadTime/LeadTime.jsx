import React from 'react';
import Select from 'react-select';

const values = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' }    
];

const LeadTime = ({ leadTime, setLeadTime }) => {
    const handleChange = (selectedOption) => {
        setLeadTime = selectedOption
    };

    // Find the currently selected option based on leadTime state
    const selectedValue = values.find(option => option.value === leadTime);

    return (
        <Select id='leadTime'
            options={values} 
            placeholder='Lead time' 
            value={selectedValue} // Set the selected value
            onChange={handleChange} // Handle change event
        />
    );
}

export default LeadTime;
