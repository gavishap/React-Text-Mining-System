import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/WelcomPage';
import WordsDisplayScreen from './pages/WordsDisplaySreen';
import WordGroup from './pages/ManageWords';
import WordExpression from './pages/ManageDecleration';
import Statistics from './pages/ManageStatistics'
import DataMining from './pages/DataTextAnalyst';
// Import other pages and components as needed

function App() {
  const [documentList, setDocumentList] = useState<any[]>([]);

  const fetchDocuments = async () => {
    try {
      console.log("Fetching documents")
      const res = await fetch("http://localhost:5000/documents_list")
      const data = await res.json();
      console.log("Data in app.tsx: ", data)
      setDocumentList([...data]);
    } catch (e) {
      console.log("Failed to fetch documents", e)
    }
  }

  React.useEffect(() => {
    fetchDocuments();
  }, [])

  return (
    <Router>
      <div className="App">
        <header>
          {/* Add your header or navigation bar here */}
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/words-display" element={<WordsDisplayScreen />} />
            <Route path="/words-group" element={<WordGroup />} />
            <Route path='/words-expressions' element={<WordExpression documents={documentList} />} />
            <Route path='/stats' element={<Statistics documents={documentList} />} />
            <Route path='/data-mining' element={<DataMining documents={documentList} />} />
          </Routes>
        </main>
        <footer>
          {/* Footer content */}
        </footer>
      </div>
    </Router>
  );
}

export default App;
