
import React from 'react';
import Slider from 'react-slick';
import graph1 from '../../assets/graph1.jpeg';
import graph2 from '../../assets/graph2.jpeg'; // Add more images as needed
import graph3 from '../../assets/graph3.jpeg'; // Add more images as needed
import './DummyGraph.css';

function DummyGraphs() {
  // Array of images
  const images = [graph1, graph2, graph3];

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="dummyGraph-container">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="dummyGraph-slide">
            <img src={image} alt={`Graph ${index + 1}`} className="dummyGraph-img" />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default DummyGraphs;
