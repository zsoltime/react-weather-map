class WeatherApp extends React.Component {
  constructor() {
    super();
    this.state = {
      location: null,
      lat: 51.509865,
      lon: -0.118092,
      weather: '',
      temp: null,
      icon: '',
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.mapZoomLevel = 12;
    this.map = null;
    this.marker = null;
    this.appid = '90304f68a674375d3f1a825bffe6ac05';
    this.apiURL = 'http://api.openweathermap.org/data/2.5/weather';
  }
  getData(location, lat, lon) {
    if (location) {
      return fetch(`${this.apiURL}?q=${location}&APPID=${this.appid}`);
    }
    return fetch(`${this.apiURL}?lat=${lat}&lon=${lon}&APPID=${this.appid}`);
  }
  updatePosition(location, lat, lon) {
    this.getData(location, lat, lon)
    .then(res => res.json())
    .then(res => {
      this.setState({
        location: res.name,
        lat: res.coord.lat,
        lon: res.coord.lon,
        weather: res.weather[0].description,
        temp: res.main.temp,
        icon: `http://openweathermap.org/img/w/${res.weather[0].icon}.png`
      },
      this.updateMap);
    });
  }
  drawMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.mapZoomLevel,
      disableDefaultUI: true,
      zoomControl: true,
    });
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
    });
    this.marker.setAnimation(google.maps.Animation.DROP);

    google.maps.event.addListener(this.map, 'click', event => {
      const position = event.latLng;
      this.updatePosition(null, position.lat(), position.lng());
    });
    google.maps.event.addListener(this.marker, 'dragend', event => {
      const position = event.latLng;
      this.updatePosition(null, position.lat(), position.lng());
    });
    this.map.addListener('zoom_changed', () => {
      this.mapZoomLevel = this.map.getZoom();
    });
  }
  updateMap() {
    const position = new google.maps.LatLng(this.state.lat, this.state.lon);
    setTimeout(() => {
      this.marker.setPosition(position);
      this.map.panTo(position);
    }, 500);
  }
  componentDidMount() {
    this.drawMap();
    // todo: add geolocation API, too
    fetch('http://ip-api.com/json')
    .then(res => res.json())
    .then(res => {
      this.updatePosition(null, res.lat, res.lon);
    });
  }
  onChange(event) {
    this.setState({
      location: event.target.value,
    });
  }
  onSubmit(location) {
    if (location) {
      this.updatePosition(location, null, null);
    }
    return;
  }
  render() {
    return (
      <div className="container">
        <div className="modal">
          <header>
            <span>Enter a place name below. You can also drag the marker or just click on the map.</span>
          </header>
          <Form
            onChange={this.onChange}
            onSubmit={this.onSubmit}
          />
          <WeatherDetails
            location={this.state.location}
            weather={this.state.weather}
            temp={this.state.temp}
            icon={this.state.icon}
          />
        </div>
        <div id="map" />
      </div>
    );
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  onChange(event) {
    this.setState({
      value: event.target.value,
    });
  }
  onSubmit(event) {
    event.preventDefault();
    setTimeout(() => (this.refs.input.value = ''), 1000);
    this.props.onSubmit(this.state.value);
  }
  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input
          type="text"
          placeholder="Enter a town or city"
          onChange={this.onChange}
          ref="input"
        />
        <button type="submit">Search</button>
      </form>
    );
  }
}

Form.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
};

const WeatherDetails = (props) => {
  return (
    <div className="weather">
      <div className="location">{props.location}</div>
      <div className="description">{props.weather}</div>
      <Temp temp={props.temp} />
      <img src={props.icon} />
    </div>
  );
}

WeatherDetails.propTypes = {
  location: React.PropTypes.string,
  weather: React.PropTypes.string,
  temp: React.PropTypes.number,
  icon: React.PropTypes.string,
};

const Temp = (props) => {
  const temp = props.temp ? Math.round(props.temp - 273.15) : '-';
  return <div className="temp">{temp} °C</div>;
};

Temp.propTypes = {
  temp: React.PropTypes.number,
}

ReactDOM.render(<WeatherApp />, document.getElementById('app'));
