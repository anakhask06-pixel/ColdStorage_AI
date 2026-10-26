
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

// Get environmental sensor readings
export const getSensorData = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/sensor-data`);
  return response.data;
};

// Get all food items
export const getFoodItems = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/food`);
  return response.data;
};

// Add a new food item
export const addFoodItem = async (food) => {
  const response = await axios.post(`${API_BASE_URL}/api/food`, food);
  return response.data;
};

// Advance simulated time for all food items
export const advanceFoodTime = async (hours) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/food/advance-time`,
    { hours }
  );
  return response.data;
};


 // Analyze a sensor reading using the trained AI models
export const analyzeEnvironment = async (temperature, humidity) => {
  const response = await axios.post(`${API_BASE_URL}/api/ai/analyze`, {
    temperature: Number(temperature),
    humidity: Number(humidity),
  });

  return response.data;
};



export const deleteFoodItem = async (foodId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/food/${foodId}`
  );
  return response.data;
};
