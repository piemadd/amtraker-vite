import { createContext } from 'react';
import DataManager from './dataManager';

const dataManger = new DataManager();
const DataManagerContext = createContext(dataManger);
export default DataManagerContext;