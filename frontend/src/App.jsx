import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductPage from './pages/ProductPage';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/product/:vertical" element={<ProductPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
