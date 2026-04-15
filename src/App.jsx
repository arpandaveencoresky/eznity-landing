import { useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingLayout from './components/LandingLayout'
import LandingPage from './components/LandingPage'
import Home3 from './components/Home3'
import DesignSystem from './pages/DesignSystem'
import Pricing from './pages/Pricing'

const ProductApp = lazy(() => import('./ProductApp'));


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <LandingLayout theme="dark">
            <Home3 />
          </LandingLayout>
        } />
        <Route path="/home3" element={
          <LandingLayout theme="dark">
            <Home3 />
          </LandingLayout>
        } />
        <Route path="/pricing" element={
          <LandingLayout theme="dark">
            <Pricing />
          </LandingLayout>
        } />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/product/*" element={
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <ProductApp />
          </Suspense>
        } />

      </Routes>
    </Router>
  )
}

export default App
