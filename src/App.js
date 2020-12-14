import { MenuItem, Select, FormControl, Card, CardContent } from '@material-ui/core';
import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from "./Table";
import { sortData } from './util'
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import {prettyPrintStat} from './util'

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState('cases');
  const [color, setColor] = useState('red')

  useEffect(() => {
      fetch("https://disease.sh/v3/covid-19/all")
        .then(res => res.json())
        .then(data => {
          setCountryInfo(data)
        })
  }, [])

  useEffect(() => {
    const getCountriesData = async() => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((res) => res.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ));
          const sortedData = sortData(data)
          setTableData(sortedData);
          setCountries(countries)
          setMapCountries(data);
        })
    };

    getCountriesData()
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(Response => Response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data);
        setMapZoom(5);
      })
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covic 19 Tracker</h1>
          <FormControl className = "app__drawdown">
              <Select
                variant = "outlined"
                value = {country}
                onChange = {onCountryChange}
              >
                <MenuItem value = "worldwide">Worldwide</MenuItem> 
                {
                  countries.map(country => (
                    <MenuItem value = {country.value}>{country.name}</MenuItem>
                  ))
                }

              </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
              active = {casesType === 'cases'}
              onClick = {e => {
                setCasesType('cases') 
                              setColor('red')
              } }
              title="Coronavirus cases"
              total = {prettyPrintStat(countryInfo.cases)}
              cases = {prettyPrintStat(countryInfo.todayCases)}
          />
          <InfoBox
              active = {casesType === 'recovered'}
              onClick = {e => {
                setCasesType('recovered') 
                setColor('green')
              } }
              title="Recovered"
              total = {prettyPrintStat(countryInfo.recovered)}
              cases = {prettyPrintStat(countryInfo.todayRecovered)}
          />

          <InfoBox
              active = {casesType === 'deaths'}
              onClick = {e => {
                setCasesType('deaths') 
                setColor('lightcoral')
              } }
              title="Coronavirus deaths"
              total = {prettyPrintStat(countryInfo.deaths)}
              cases = {prettyPrintStat(countryInfo.todayDeaths)}
          />
        </div>

        <Map 
            casesType = {casesType}
            center = {mapCenter}
            zoom = {mapZoom}
            countries = {mapCountries}
            color = {color}
        />
        </div>
        <Card className="app__right">
              <CardContent>
                  <h3>Live cases by country</h3>
                  <Table countries = {tableData}/>
                  <h3 style = {{paddingTop: '25px', paddingBottom: '25px'}}>Worldwide new {casesType}</h3>
                  <LineGraph casesType = {casesType} color = {color}/>
              </CardContent>
        </Card>
    </div>
  );
}

export default App;
