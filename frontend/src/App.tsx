import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { AppProvider } from './context/AppContext';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Races from './pages/Races';
import RaceWeekend from './pages/RaceWeekend';
import Standings from './pages/Standings';
import Chat from './pages/Chat';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="font-body-md text-body-md bg-background-base text-on-surface selection:bg-f1-red selection:text-white">
          <Sidebar />
          <main className="md:ml-sidebar-width min-h-screen pb-20 md:pb-0">
            <NavBar />
            <div className="p-margin-mobile md:p-margin-desktop max-w-7xl mx-auto space-y-gutter">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/races" element={<Races />} />
                <Route path="/races/:year/:round" element={<RaceWeekend />} />
                <Route path="/standings" element={<Standings />} />
                <Route path="/chat" element={<Chat />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
