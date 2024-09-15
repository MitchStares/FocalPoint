import { FocalPoint } from './components/Focal-Point'
import './App.css'
import './index.css'
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="App">
        <FocalPoint />
      </div>
    </ThemeProvider>
  )
}

export default App
