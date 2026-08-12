import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Transliterator from './pages/Transliterator';
import PracticeSheets from './pages/PracticeSheets';
import CharacterReference from './pages/CharacterReference';
import CopyStudio from './pages/CopyStudio';
import TakriReader from './pages/TakriReader';
import GlyphTrainer from './pages/GlyphTrainer';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="transliterator" element={<Transliterator />} />
        <Route path="practice-sheets" element={<PracticeSheets />} />
        <Route path="character-reference" element={<CharacterReference />} />
        <Route path="copy-studio" element={<CopyStudio />} />
        <Route path="reader" element={<TakriReader />} />
        <Route path="trainer" element={<GlyphTrainer />} />
      </Route>
    </Routes>
  );
}
