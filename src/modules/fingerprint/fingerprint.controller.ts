// backend/src/modules/fingerprint/fingerprint.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FingerprintBridgeService } from './fingerprint-bridgge.service';


@ApiTags('fingerprint')
@Controller('fingerprint')
export class FingerprintController {
  constructor(
    private readonly fingerprintBridgeService: FingerprintBridgeService,
  ) {}

  @Public()
  @Get('poll')
  @ApiOperation({ summary: 'Poll for latest fingerprint scan' })
  pollForScan() {
    const scan = this.fingerprintBridgeService.getLatestScan();
    
    return {
      hasNewScan: !!scan,
      template: scan?.template || null,
      timestamp: scan?.timestamp || null,
    };
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get fingerprint monitoring status' })
  getStatus() {
    return {
      monitoring: this.fingerprintBridgeService.getMonitoringStatus(),
    };
  }

  @Post('start-monitoring')
  @ApiOperation({ summary: 'Start fingerprint monitoring' })
  async startMonitoring() {
    await this.fingerprintBridgeService.startMonitoring();
    return { message: 'Monitoring started' };
  }

  @Post('stop-monitoring')
  @ApiOperation({ summary: 'Stop fingerprint monitoring' })
  async stopMonitoring() {
    await this.fingerprintBridgeService.stopMonitoring();
    return { message: 'Monitoring stopped' };
  }
}