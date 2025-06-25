import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Calendar from "./Calendar";

function App() {
  return (
    <div className="h-screen  w-screen bg-gray-500 p-4 overflow-y-auto maincontainer">
      <h1 className="text-3xl font-bold text-center mb-6"></h1>
      <Calendar />
    </div>
  );

}

export default App
