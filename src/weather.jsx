import React, { useState, useEffect } from 'react';
import { Search, MapPin, Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye, Gauge, Star, StarOff, RefreshCw, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric'); // metric or imperial
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load favorites from state on mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('weatherFavorites') || '[]');
    setFavorites(savedFavorites);
    // Get user's location on first load
    getCurrentLocationWeather();
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Mock weather data generator for demonstration
  const generateMockWeatherData = (cityName) => {
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy'];
    const currentType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    const baseTemp = unit === 'metric' ? 
      Math.floor(Math.random() * 30) + 5 : 
      Math.floor(Math.random() * 86) + 41;

    const current = {
      location: cityName,
      country: 'Country',
      temperature: baseTemp,
      condition: currentType,
      description: currentType === 'sunny' ? 'Clear sky' : 
                  currentType === 'cloudy' ? 'Partly cloudy' :
                  currentType === 'rainy' ? 'Light rain' : 'Snow',
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      pressure: Math.floor(Math.random() * 50) + 1000,
      visibility: Math.floor(Math.random() * 10) + 5,
      uvIndex: Math.floor(Math.random() * 11),
      feelsLike: baseTemp + Math.floor(Math.random() * 6) - 3
    };

    const forecastData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: baseTemp + Math.floor(Math.random() * 10) - 5,
        low: baseTemp - Math.floor(Math.random() * 10) - 5,
        condition: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        precipitation: Math.floor(Math.random() * 80),
        humidity: Math.floor(Math.random() * 40) + 40
      };
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(i);
      return {
        time: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
        temperature: baseTemp + Math.floor(Math.random() * 10) - 5,
        condition: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        precipitation: Math.floor(Math.random() * 20)
      };
    });

    return { current, forecast: forecastData, hourly: hourlyData };
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we'll use a mock city name
          const mockCityName = 'Current Location';
          const data = generateMockWeatherData(mockCityName);
          setCurrentWeather(data.current);
          setForecast(data.forecast);
          setHourlyForecast(data.hourly);
          setLocation(mockCityName);
          setIsLoading(false);
        },
        (error) => {
          setError('Unable to get your location. Please search for a city.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const searchWeather = (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generateMockWeatherData(query);
      setCurrentWeather(data.current);
      setForecast(data.forecast);
      setHourlyForecast(data.hourly);
      setLocation(query);
      setIsLoading(false);
    }, 1000);
  };

  const toggleFavorite = (locationName) => {
    if (favorites.some(fav => fav.name === locationName)) {
      setFavorites(favorites.filter(fav => fav.name !== locationName));
    } else {
      setFavorites([...favorites, { 
        name: locationName, 
        addedAt: new Date().toISOString(),
        temperature: currentWeather?.temperature,
        condition: currentWeather?.condition
      }]);
    }
  };

  const convertTemp = (temp) => {
    if (unit === 'imperial') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snowy': return <CloudSnow className="w-6 h-6 text-blue-300" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getBackgroundGradient = (condition) => {
    switch (condition) {
      case 'sunny': return 'from-yellow-400 via-orange-500 to-red-500';
      case 'cloudy': return 'from-gray-400 via-gray-500 to-gray-600';
      case 'rainy': return 'from-blue-400 via-blue-500 to-blue-600';
      case 'snowy': return 'from-blue-200 via-blue-300 to-blue-400';
      default: return 'from-blue-400 via-blue-500 to-blue-600';
    }
  };

  const WeatherCard = ({ title, value, icon: Icon, unit: unitSymbol, color = 'text-blue-500' }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}{unitSymbol}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  const ForecastCard = ({ day, high, low, condition, precipitation }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center min-w-32">
      <p className="text-sm font-medium text-gray-600 mb-2">{day}</p>
      <div className="flex justify-center mb-2">
        {getWeatherIcon(condition)}
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-gray-800">{convertTemp(high)}°</p>
        <p className="text-sm text-gray-500">{convertTemp(low)}°</p>
        <p className="text-xs text-blue-500">{precipitation}%</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Weather Dashboard</h1>
          <p className="text-gray-600">Get real-time weather updates and forecasts</p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchWeather(searchQuery);
                    setSearchQuery('');
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  searchWeather(searchQuery);
                  setSearchQuery('');
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={getCurrentLocationWeather}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Use Location
              </button>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Favorites
              </button>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-gray-600">Temperature Unit:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUnit('metric')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  unit === 'metric' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  unit === 'imperial' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Panel */}
        {showFavorites && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Favorite Locations</h2>
            {favorites.length === 0 ? (
              <p className="text-gray-500">No favorite locations yet. Add some by searching for cities!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(fav.condition)}
                      <div>
                        <p className="font-medium text-gray-800">{fav.name}</p>
                        <p className="text-sm text-gray-500">{convertTemp(fav.temperature)}°</p>
                      </div>
                    </div>
                    <button
                      onClick={() => searchWeather(fav.name)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Current Weather */}
        {currentWeather && !isLoading && (
          <>
            <div className={`bg-gradient-to-r ${getBackgroundGradient(currentWeather.condition)} rounded-xl shadow-lg p-8 mb-6 text-white`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg font-medium">{currentWeather.location}</span>
                  </div>
                  <p className="text-3xl md:text-5xl font-bold mb-2">
                    {convertTemp(currentWeather.temperature)}°{unit === 'metric' ? 'C' : 'F'}
                  </p>
                  <p className="text-lg opacity-90">{currentWeather.description}</p>
                  <p className="text-sm opacity-75">
                    Feels like {convertTemp(currentWeather.feelsLike)}°
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-8xl opacity-80 mb-4">
                    {getWeatherIcon(currentWeather.condition)}
                  </div>
                  <button
                    onClick={() => toggleFavorite(currentWeather.location)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    {favorites.some(fav => fav.name === currentWeather.location) ? 
                      <Star className="w-4 h-4 fill-current" /> : 
                      <StarOff className="w-4 h-4" />
                    }
                    {favorites.some(fav => fav.name === currentWeather.location) ? 'Remove' : 'Add to'} Favorites
                  </button>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <WeatherCard
                title="Humidity"
                value={currentWeather.humidity}
                icon={Droplets}
                unit="%"
                color="text-blue-500"
              />
              <WeatherCard
                title="Wind Speed"
                value={currentWeather.windSpeed}
                icon={Wind}
                unit={unit === 'metric' ? ' km/h' : ' mph'}
                color="text-green-500"
              />
              <WeatherCard
                title="Pressure"
                value={currentWeather.pressure}
                icon={Gauge}
                unit=" hPa"
                color="text-purple-500"
              />
              <WeatherCard
                title="Visibility"
                value={currentWeather.visibility}
                icon={Eye}
                unit={unit === 'metric' ? ' km' : ' mi'}
                color="text-orange-500"
              />
            </div>

            {/* 24-Hour Forecast Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">24-Hour Forecast</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'temperature' ? `${convertTemp(value)}°` : `${value}%`,
                      name === 'temperature' ? 'Temperature' : 'Precipitation'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="precipitation" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">7-Day Forecast</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {forecast.map((day, index) => (
                  <ForecastCard key={index} {...day} />
                ))}
              </div>
            </div>

            {/* Weather Statistics Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Weather Statistics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'high' || name === 'low' ? `${convertTemp(value)}°` : `${value}%`,
                      name === 'high' ? 'High Temp' : name === 'low' ? 'Low Temp' : 'Humidity'
                    ]}
                  />
                  <Bar dataKey="high" fill="#f59e0b" />
                  <Bar dataKey="low" fill="#3b82f6" />
                  <Bar dataKey="humidity" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;