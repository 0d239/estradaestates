import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Team } from './pages/Team';
import { Services } from './pages/Services';
import { Resources } from './pages/Resources';
// import { ClientPortal } from './pages/ClientPortal';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Team />} />
          <Route path="/services" element={<Services />} />
          <Route path="/resources" element={<Resources />} />
          {/* <Route path="/client-portal" element={<ClientPortal />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
