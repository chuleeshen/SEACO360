import React, { useState, useEffect, useRef } from 'react';
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import 'chart.js/auto';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import data2018 from './full_structured_health_data_2018_5.json'; 
import './Dashboard.css'; 

const HealthChart2018 = () => {
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('BEKOK');
  const [subdistrictData, setSubdistrictData] = useState(data2018[selectedSubdistrict]);
  const mapRef = useRef(null);

  const subdistrictCoordinates = {
    BEKOK: [2.3869, 103.0544],
    CHAAH: [2.2384, 103.0573],
    GEMEREH: [2.5048, 102.8093],
    JABI: [2.5085, 102.8193],
    SUNGAI_SEGAMAT: [2.4873, 102.8212],
    Overall: [2.5147, 102.8151],
  };

  useEffect(() => {
    setSubdistrictData(data2018[selectedSubdistrict]);
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      const coordinates = subdistrictCoordinates[selectedSubdistrict] || subdistrictCoordinates.Overall;
      mapRef.current.setView(coordinates, 14);
    }
  }, [selectedSubdistrict]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map2018').setView(subdistrictCoordinates.Overall, 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 5,
      }).addTo(mapRef.current);

      fetch('https://seaco.onrender.com/SEACO.geojson')
        .then((response) => response.json())
        .then((data) => {
          const segamatFeature = data.features.filter(
            (feature) => feature.properties.district === 'Segamat'
          );

          L.geoJSON(segamatFeature, {
            style: function (feature) {
              return {
                color: '#FF0000',
                fillColor: '#ffffff',
                fillOpacity: 0.5,
                weight: 2,
              };
            },
          }).addTo(mapRef.current);

          Object.keys(subdistrictCoordinates).forEach((subdistrict) => {
            if (subdistrict !== 'Overall') {
              const marker = L.marker(subdistrictCoordinates[subdistrict])
                .addTo(mapRef.current)
                .bindPopup(subdistrict.replace('_', ' '));

              marker.on('click', () => {
                setSelectedSubdistrict(subdistrict);
              });
            }
          });
        })
        .catch((error) => {
          console.log('Error loading the GeoJSON data: ' + error);
        });
    }
  }, [subdistrictCoordinates]);

  const categoryMapping = {
    'Sex': ['Male', 'Female'],
    'Ethnicity': ['Malay', 'Chinese', 'Indian', 'Orang Asli', 'Other', 'Non-citizen'],
    'Education level': ['No formal education', 'Primary', 'Secondary', 'Tertiary', 'Do not know', 'Refused to answer'],
    'Age group': ['5 to 19', '20 to 39', '40 to 59', '60 and above'],
    'Employment status last 30 days': [
      'Too young to work', 
      'Student', 
      'Housewife / Househusband', 
      'Not Working', 
      'Casual Jobs', 
      'Working Part-time', 
      'Working Full-Time', 
      'Do not Know', 
      'Pensioners/Pensions', 
      'Self Employed'
    ],
    'Oral health problems in the last 2 weeks': ['Yes', 'No'],
    'Heart disease': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Asthma': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Stroke': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Arthritis': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Ever had dengue fever': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Dengue in the past 12 months': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'UTI in the past 12 months': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Kidney disease': ['Yes', 'No', 'Do not Know', 'Refused to answer'],
    'Ever smoked': ['Yes', 'No', 'Refused to answer'],
    'Age started smoking': ['< 13', '13-', '18-', '30-', '40-'],
    'BMI categories (WHO)(18+)': ['underweight', 'normal', 'overweight', 'obese I', 'obese II', 'obese III'],
    'BMI categories (WHO) recoded (18+)': ['underweight', 'normal', 'overweight', 'obese'],
    'BMI categories (Msian CGPO)': ['underweight', 'normal', 'overweight', 'obese I', 'obese II', 'obese III'],
    'Abdominal obesity (18+)': ['Yes', 'No'],
    'Have been screened for hypertension': ['Yes', 'No'],
    'Known hypertensive': ['Yes', 'No'],
    'sbp(last2reads)140above or dbp90': ['Yes', 'No'],
    'Hpt population (known + undiagnosed)': ['Yes', 'No'],
    'Taking BP meds': ['Yes', 'No'],
    'Have been screened for diabetes mellitus (DM)': ['Yes', 'No'],
    'Known DM': ['Yes', 'No'],
    'BG >= 11.1 mmol/l': ['Yes', 'No'],
    'DM population (known + undiagnosed)': ['Yes', 'No'],
    'Taking DM meds': ['Yes', 'No'],
  };

  const prepareChartData = (category) => {
    if (!subdistrictData) {
      return null;
    }

    const labels = categoryMapping[category];
    const values = labels.map((label) => subdistrictData[label]?.n || 0);
    const percentages = labels.map((label) => subdistrictData[label]?.percentage || 0);

    return {
      barData: {
        labels: labels,
        datasets: [
          {
            label: `${category} distribution`,
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.4)',
            borderColor: 'rgba(75, 192, 192, 0.8)',
            borderWidth: 1,
          },
        ],
      },
      pieData: {
        labels: labels,
        datasets: [
          {
            data: percentages,
            backgroundColor: [
              'rgba(255, 99, 132, 0.4)',
              'rgba(54, 162, 235, 0.4)',
              'rgba(255, 206, 86, 0.4)',
              'rgba(75, 192, 192, 0.4)',
              'rgba(153, 102, 255, 0.4)',
              'rgba(255, 159, 64, 0.4)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderWidth: 1,
          },
        ],
      },
      lineData: {
        labels: labels,
        datasets: [
          {
            label: `${category} over years`,
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 0.8)',
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      doughnutData: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.4)',
              'rgba(54, 162, 235, 0.4)',
              'rgba(255, 206, 86, 0.4)',
              'rgba(75, 192, 192, 0.4)',
              'rgba(153, 102, 255, 0.4)',
              'rgba(255, 159, 64, 0.4)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderWidth: 1,
          },
        ],
      },
      radarData: {
        labels: labels,
        datasets: [
          {
            label: `${category} status`,
            data: values,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            pointBackgroundColor: 'rgba(255, 99, 132, 0.8)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 0.8)',
          },
        ],
      },
      polarAreaData: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.4)',
              'rgba(54, 162, 235, 0.4)',
              'rgba(255, 206, 86, 0.4)',
              'rgba(75, 192, 192, 0.4)',
              'rgba(153, 102, 255, 0.4)',
              'rgba(255, 159, 64, 0.4)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const categories = [
    { name: 'Sex', chartType: 'pie' },
    { name: 'Ethnicity', chartType: 'doughnut' },
    { name: 'Education level', chartType: 'bar' },
    { name: 'Age group', chartType: 'line' },
    { name: 'Employment status last 30 days', chartType: 'polarArea' },
    { name: 'Oral health problems in the last 2 weeks', chartType: 'pie' },
    { name: 'Heart disease', chartType: 'bar' },
    { name: 'Asthma', chartType: 'bar' },
    { name: 'Stroke', chartType: 'bar' },
    { name: 'Arthritis', chartType: 'radar' },
    { name: 'Ever had dengue fever', chartType: 'pie' },
    { name: 'Dengue in the past 12 months', chartType: 'pie' },
    { name: 'UTI in the past 12 months', chartType: 'bar' },
    { name: 'Kidney disease', chartType: 'bar' },
    { name: 'Ever smoked', chartType: 'pie' },
    { name: 'Age started smoking', chartType: 'bar' },
    { name: 'BMI categories (WHO)(18+)', chartType: 'bar' },
    { name: 'BMI categories (WHO) recoded (18+)', chartType: 'bar' },
    { name: 'BMI categories (Msian CGPO)', chartType: 'bar' },
    { name: 'Abdominal obesity (18+)', chartType: 'pie' },
    { name: 'Have been screened for hypertension', chartType: 'bar' },
    { name: 'Known hypertensive', chartType: 'pie' },
    { name: 'sbp(last2reads)140above or dbp90', chartType: 'bar' },
    { name: 'Hpt population (known + undiagnosed)', chartType: 'bar' },
    { name: 'Taking BP meds', chartType: 'pie' },
    { name: 'Have been screened for diabetes mellitus (DM)', chartType: 'bar' },
    { name: 'Known DM', chartType: 'pie' },
    { name: 'BG >= 11.1 mmol/l', chartType: 'pie' },
    { name: 'DM population (known + undiagnosed)', chartType: 'bar' },
    { name: 'Taking DM meds', chartType: 'pie' },
  ];

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h2>Subdistricts</h2>
        <ul>
          {Object.keys(subdistrictCoordinates).map((district) => (
            <li key={district}>
              <button onClick={() => setSelectedSubdistrict(district)}>
                {district.replace('_', ' ')}
              </button>
            </li>
          ))}
        </ul>
      </nav>
  
      <div className="main-content">
        <header className="navbar">
          <h1>
            HEALTH 2018 SUMMARY FOR {selectedSubdistrict.replace('_', ' ').toUpperCase()}
          </h1>
        </header>
  
        <div className="map-container">
          <div id="map2018" style={{ height: '400px', marginBottom: '20px' }}></div>
        </div>
  
<div className="charts-container">
          {categories.map((category) => {
            const chartData = prepareChartData(category.name);
            if (!chartData) return null;

            return (
              <div key={category.name} className="chart">
                <h3>{category.name}</h3>
                <div style={{ height: '400px', width: '100%' }}>
                  {category.chartType === 'bar' && (
                    <Bar data={chartData.barData} options={{ maintainAspectRatio: false }} />
                  )}
                  {category.chartType === 'pie' && (
                    <Pie data={chartData.pieData} options={{ maintainAspectRatio: false }} />
                  )}
                  {category.chartType === 'line' && (
                    <Line data={chartData.lineData} options={{ maintainAspectRatio: false }} />
                  )}
                  {category.chartType === 'doughnut' && (
                    <Doughnut data={chartData.doughnutData} options={{ maintainAspectRatio: false }} />
                  )}
                  {category.chartType === 'radar' && (
                    <Radar data={chartData.radarData} options={{ maintainAspectRatio: false }} />
                  )}
                  {category.chartType === 'polarArea' && (
                    <PolarArea data={chartData.polarAreaData} options={{ maintainAspectRatio: false }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HealthChart2018;
