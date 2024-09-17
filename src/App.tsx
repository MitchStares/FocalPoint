import { FocalPoint } from './components/Focal-Point'
import './App.css'
import './index.css'
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseAuth } from './firebaseConfig'
import CloudStorageDialog from './components/CloudStorageDialog'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="App">
        <FirebaseAuth />
        <CloudStorageDialog />
        <FocalPoint />
      </div>
    </ThemeProvider>
  )
}

export default App
