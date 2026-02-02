import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Realtors } from './pages/Realtors';
import { Resources } from './pages/Resources';
import { ClientPortal } from './pages/ClientPortal';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Realtors />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/client-portal" element={<ClientPortal />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
