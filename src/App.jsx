import './App.css'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="App">
      <h1>Hyrule API Dashboard</h1>
      <Dashboard endpoint="all" />
    </div>
  )
}

export default App
