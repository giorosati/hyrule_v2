import './App.css'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import ItemDetail from './components/ItemDetail'

function App() {
  return (
    <div className="App">
      <h1>Hyrule API Dashboard</h1>
      <Routes>
        <Route path="/" element={<Dashboard endpoint="all" />} />
        <Route path="/item/:category/:id" element={<ItemDetail />} />
      </Routes>
    </div>
  )
}

export default App
