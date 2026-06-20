import { create } from 'zustand';
import { audioSynth } from '../utils/audio-synth';

export type TabType = 'live' | 'predictions' | 'analytics' | 'reports' | 'settings';

export interface RoadTelemetry {
  id: string;
  name: string;
  congestion: number; // percentage
  vehiclesCount: number;
  avgSpeed: number; // km/h
  predictedJamTime: string; // in mins
  etaToCongestion: string;
  status: 'green' | 'yellow' | 'red';
}

export interface SignalState {
  id: string;
  state: 'RED' | 'GREEN';
  timer: number;
}

interface TrafficStore {
  activeTab: TabType;
  selectedRoad: RoadTelemetry | null;
  signals: Record<string, SignalState>;
  metrics: {
    capacity: number;
    jamTime: number;
    congestionScore: number;
    growthRate: number;
    confidence: number;
  };
  emergencyActive: boolean;
  triggerEmergency: boolean;
  simulationPlaying: boolean;
  
  // Actions
  setActiveTab: (tab: TabType) => void;
  setSelectedRoad: (road: RoadTelemetry | null) => void;
  toggleSignal: (id: string) => void;
  setSignalState: (id: string, state: 'RED' | 'GREEN') => void;
  spawnEmergency: () => void;
  handleEmergencyCleared: () => void;
  setTriggerEmergencyHandled: () => void;
  setSimulationPlaying: (playing: boolean) => void;
  updateTelemetry: () => void;
}

export const useStore = create<TrafficStore>((set) => ({
  activeTab: 'live',
  selectedRoad: null,
  signals: {
    S1: { id: 'S1', state: 'GREEN', timer: 15 },
    S2: { id: 'S2', state: 'RED', timer: 15 },
    S3: { id: 'S3', state: 'RED', timer: 15 },
    S4: { id: 'S4', state: 'GREEN', timer: 15 },
  },
  metrics: {
    capacity: 74,
    jamTime: 23,
    congestionScore: 68,
    growthRate: 4.8,
    confidence: 95,
  },
  emergencyActive: false,
  triggerEmergency: false,
  simulationPlaying: true,

  setActiveTab: (activeTab) => {
    audioSynth.playClick();
    set({ activeTab });
  },
  
  setSelectedRoad: (selectedRoad) => {
    if (selectedRoad) {
      audioSynth.playClick();
    }
    set({ selectedRoad });
  },
  
  toggleSignal: (id) => set((state) => {
    audioSynth.playClick();
    const prev = state.signals[id];
    if (!prev) return {};
    return {
      signals: {
        ...state.signals,
        [id]: {
          ...prev,
          state: prev.state === 'GREEN' ? 'RED' : 'GREEN',
        }
      }
    };
  }),

  setSignalState: (id, state) => set((stateStore) => {
    const prev = stateStore.signals[id];
    if (!prev) return {};
    return {
      signals: {
        ...stateStore.signals,
        [id]: {
          ...prev,
          state
        }
      }
    };
  }),

  spawnEmergency: () => {
    audioSynth.playWarning();
    audioSynth.startSiren();
    set({ triggerEmergency: true, emergencyActive: true });
  },
  
  handleEmergencyCleared: () => {
    audioSynth.stopSiren();
    set({ emergencyActive: false });
  },
  
  setTriggerEmergencyHandled: () => set({ triggerEmergency: false }),
  setSimulationPlaying: (simulationPlaying) => set({ simulationPlaying }),
  
  updateTelemetry: () => set((state) => {
    const diff = (Math.random() - 0.5) * 2;
    const nextCapacity = Math.max(40, Math.min(95, Math.round(state.metrics.capacity + diff)));
    const nextScore = Math.max(30, Math.min(98, Math.round(state.metrics.congestionScore + diff * 1.5)));
    
    let updatedRoad = state.selectedRoad;
    if (updatedRoad) {
      const roadDiff = (Math.random() - 0.5) * 4;
      const nextCong = Math.max(10, Math.min(98, Math.round(updatedRoad.congestion + roadDiff)));
      const countDiff = Math.random() > 0.5 ? 1 : -1;
      const nextCount = Math.max(2, Math.min(80, updatedRoad.vehiclesCount + countDiff));
      const nextSpeed = Math.max(5, Math.min(80, Math.round(updatedRoad.avgSpeed - roadDiff * 0.5)));
      
      let nextStatus: RoadTelemetry['status'] = 'green';
      if (nextCong > 70) nextStatus = 'red';
      else if (nextCong > 40) nextStatus = 'yellow';
      
      updatedRoad = {
        ...updatedRoad,
        congestion: nextCong,
        vehiclesCount: nextCount,
        avgSpeed: nextSpeed,
        status: nextStatus,
        predictedJamTime: nextCong > 60 ? `${Math.round(40 - nextCong * 0.3)} min` : 'None',
      };
    }

    return {
      metrics: {
        ...state.metrics,
        capacity: nextCapacity,
        congestionScore: nextScore,
        growthRate: Math.max(0.5, Math.min(15, parseFloat((state.metrics.growthRate + diff * 0.1).toFixed(1)))),
      },
      selectedRoad: updatedRoad,
    };
  })
}));
