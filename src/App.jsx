import React from 'react'
import Dashboard from './components/Dashboard'
import rawData from './data/db.dashboard_incidents.json'

function App() {
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <header className="mb-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900">Near Miss Incident Dashboard</h1>
                <p className="mt-2 text-gray-600">Overview of safety incidents, trends, and risk analysis.</p>
            </header>

            <main className="max-w-7xl mx-auto">
                <Dashboard rawData={rawData} />
            </main>
        </div>
    )
}

export default App
