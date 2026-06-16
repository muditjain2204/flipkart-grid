import axios from 'axios';
import { Agent, TrafficPerceptionOutput } from './index';
import { env } from '../config/env';
import { logger } from '../config/logger';

/**
 * Agent 2: Traffic Perception Agent
 *
 * Bridge between the Node.js backend and the Python CV microservice.
 * Sends video URL/file to FastAPI and returns processed traffic data.
 *
 * Falls back to mock data if the CV service is unavailable (hackathon resilience).
 */
export class TrafficPerceptionAgent implements Agent<string | undefined, TrafficPerceptionOutput> {
  name = 'Traffic Perception Agent';

  async execute(videoUrl?: string): Promise<TrafficPerceptionOutput> {
    logger.info(`[${this.name}] Processing video: ${videoUrl || 'none provided'}`);

    if (!videoUrl) {
      logger.warn(`[${this.name}] No video URL provided, returning mock data`);
      return this.getMockData();
    }

    try {
      const response = await axios.post(
        `${env.CV_SERVICE_URL}/analyze-video`,
        { video_url: videoUrl },
        {
          timeout: 60_000, // 60s timeout for video processing
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = response.data;

      logger.info(
        `[${this.name}] CV analysis complete: ${data.cars} cars, ${data.bikes} bikes, ` +
        `${data.buses} buses, ${data.trucks} trucks, density=${data.density_level}`
      );

      return {
        cars: data.cars || 0,
        bikes: data.bikes || 0,
        buses: data.buses || 0,
        trucks: data.trucks || 0,
        densityLevel: data.density_level || 'MODERATE',
        queueLengthMeters: data.queue_length_meters || 0,
        averageSpeedKmh: data.average_speed_kmh || 0,
        framesProcessed: data.frames_processed || 0,
        processingTimeSeconds: data.processing_time_seconds || 0,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `[${this.name}] CV service error: ${error.message}. ` +
          `Status: ${error.response?.status}. Falling back to mock data.`
        );
      } else {
        logger.error(`[${this.name}] Unexpected error. Falling back to mock data.`, error);
      }

      return this.getMockData();
    }
  }

  /**
   * Returns realistic mock traffic data for hackathon demo
   * when the CV microservice is unavailable.
   */
  private getMockData(): TrafficPerceptionOutput {
    return {
      cars: Math.floor(Math.random() * 300) + 200,
      bikes: Math.floor(Math.random() * 150) + 100,
      buses: Math.floor(Math.random() * 40) + 10,
      trucks: Math.floor(Math.random() * 20) + 5,
      densityLevel: 'HIGH',
      queueLengthMeters: Math.floor(Math.random() * 800) + 400,
      averageSpeedKmh: Math.floor(Math.random() * 15) + 5,
      framesProcessed: 0,
      processingTimeSeconds: 0,
    };
  }
}
