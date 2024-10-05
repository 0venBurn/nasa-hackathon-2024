import React, { useEffect } from 'react';
import jsonData from '../../../../dummyData/metadata-LC09_L2SP_039030_20240926_20241001_02_T1_MTL.json';

const MetadataDisplay = () => {
    useEffect(() => {
        console.log(jsonData);
    }, []);

    return (
        <div>
            <h2>Landsat Metadata</h2>
            <p>Check the console to see the logged metadata!</p>
        </div>
    );
};

export default MetadataDisplay;