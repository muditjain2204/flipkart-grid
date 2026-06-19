import { Event } from '@prisma/client';
import { HistoricalContext } from '../services/historical-data.service';

// ─── Agent Interface ─────────────────────────────────────

export interface Agent<TInput, TOutput> {
  name: string;
  execute(input: TInput): Promise<TOutput>;
}

// ─── Agent Output Types ──────────────────────────────────

export interface EventIntelligenceOutput {
  eventRiskLevel: string;
  riskScore: number;
  arrivalWindowStart: Date;
  arrivalWindowEnd: Date;
  departureWindowStart: Date;
  departureWindowEnd: Date;
  reasoning: string;
  historicalInsight?: string;
}

export interface TrafficPerceptionOutput {
  cars: number;
  bikes: number;
  buses: number;
  trucks: number;
  densityLevel: string;
  queueLengthMeters: number;
  averageSpeedKmh: number;
  framesProcessed: number;
  processingTimeSeconds: number;
}

export interface CongestionPredictionOutput {
  congestionSeverity: string;
  peakStartTime: Date;
  peakEndTime: Date;
  impactedCorridors: string[];
  predictionConfidence: number;
  reasoning: string;
  historicalInsight?: string;
}

export interface ResourcePlanningOutput {
  officersRequired: number;
  barricadesRequired: number;
  deploymentZones: string[];
  patrolPriority: Array<{ zone: string; priority: number }>;
  reasoning: string;
}

export interface DiversionStrategyOutput {
  diversionRoutes: Array<{
    from: string;
    to: string;
    via: string;
    estimatedTime: string;
  }>;
  restrictedZones: string[];
  advisoryMessages: string[];
  reasoning: string;
}

export interface DecisionSynthesisOutput {
  eventSummary: Record<string, unknown>;
  currentTraffic: Record<string, unknown>;
  predictedCongestion: Record<string, unknown>;
  highRiskLocations: string[];
  officerDeployment: Record<string, unknown>;
  barricadeStrategy: Record<string, unknown>;
  diversions: Record<string, unknown>;
  publicAdvisory: string[];
  confidenceScore: number;
  explanation: string;
}

// ─── Pipeline Context ────────────────────────────────────

export interface PipelineContext {
  event: Event;
  videoUrl?: string;
  historicalContext?: HistoricalContext;
  eventIntelligence?: EventIntelligenceOutput;
  trafficPerception?: TrafficPerceptionOutput;
  congestionPrediction?: CongestionPredictionOutput;
  resourcePlanning?: ResourcePlanningOutput;
  diversionStrategy?: DiversionStrategyOutput;
  decisionSynthesis?: DecisionSynthesisOutput;
}
