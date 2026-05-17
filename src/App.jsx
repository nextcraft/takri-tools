import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Transliterator from './pages/Transliterator';
import PracticeSheets from './pages/PracticeSheets';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="transliterator" element={<Transliterator />} />
        <Route path="practice-sheets" element={<PracticeSheets />} />
      </Route>
    </Routes>
  );
}
