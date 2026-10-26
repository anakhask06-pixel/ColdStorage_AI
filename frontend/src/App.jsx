
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import LiveMonitoring from './pages/LiveMonitoring'
import Predictions from './pages/Predictions'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import FoodSimulation from './pages/FoodSimulation';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveMonitoring />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/food-simulation" element={<FoodSimulation />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
