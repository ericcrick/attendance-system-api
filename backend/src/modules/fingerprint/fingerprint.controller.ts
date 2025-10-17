// backend/src/modules/fingerprint/fingerprint.controller.ts
import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FingerprintBridgeService } from './fingerprint-bridge.service';
import { FingerprintDeviceType, FingerprintServiceFactory } from './fingerprint-device.factory';


@ApiTags('fingerprint')
@Controller('fingerprint')
export class FingerprintController {
  constructor(
    private readonly fingerprintBridgeService: FingerprintBridgeService,
    private readonly fingerprintFactory: FingerprintServiceFactory,
  ) { }

  @Public()
  @Get('poll')
  @ApiOperation({
    summary: 'Poll for latest fingerprint scan',
    description:
      'Kiosk clients poll this endpoint to get the latest fingerprint scan',
  })
  @ApiResponse({ status: 200, description: 'Latest scan data or null' })
  pollForScan() {
    const scan = this.fingerprintBridgeService.getLatestScan();

    return {
      hasNewScan: !!scan,
      template: scan?.template || null,
      timestamp: scan?.timestamp || null,
      quality: scan?.quality || null,
    };
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get fingerprint system status' })
  @ApiResponse({ status: 200, description: 'System status' })
  async getStatus() {
    const monitoringStatus = this.fingerprintBridgeService.getMonitoringStatus();
    const devicesInfo = await this.fingerprintFactory.getAllDevicesInfo();

    return {
      ...monitoringStatus,
      devices: devicesInfo,
    };
  }

  @Public()
  @Get('history')
  @ApiOperation({ summary: 'Get recent scan history (for debugging)' })
  @ApiResponse({ status: 200, description: 'Recent scans' })
  getHistory() {
    return {
      scans: this.fingerprintBridgeService.getScanHistory(),
    };
  }

  @Post('start-monitoring')
  @ApiOperation({ summary: 'Start fingerprint device monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring started' })
  async startMonitoring() {
    return await this.fingerprintBridgeService.startMonitoring();
  }

  @Post('stop-monitoring')
  @ApiOperation({ summary: 'Stop fingerprint device monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring stopped' })
  async stopMonitoring() {
    return await this.fingerprintBridgeService.stopMonitoring();
  }

  @Patch('switch-device')
  @ApiOperation({
    summary: 'Switch between fingerprint devices',
    description: 'Dynamically switch between ZKTeco and DigitalPersona',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deviceType: {
          type: 'string',
          enum: ['ZKTECO', 'DIGITAL_PERSONA'],
          example: 'DIGITAL_PERSONA',
        },
      },
      required: ['deviceType'],
    },
  })
  @ApiResponse({ status: 200, description: 'Device switched successfully' })
  async switchDevice(@Body() body: { deviceType: string }) {
    return await this.fingerprintBridgeService.switchDevice(body.deviceType);
  }

  @Post('test-connection')
  @ApiOperation({
    summary: 'Test connection to a specific device',
    description: 'Test if a device is reachable and functioning',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deviceType: {
          type: 'string',
          enum: ['ZKTECO', 'DIGITAL_PERSONA'],
          example: 'DIGITAL_PERSONA',
        },
      },
      required: ['deviceType'],
    },
  })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(@Body() body: { deviceType: string }) {
    const deviceType =
      body.deviceType === 'ZKTECO'
        ? FingerprintDeviceType.ZKTECO
        : FingerprintDeviceType.DIGITAL_PERSONA;

    return await this.fingerprintFactory.testDeviceConnection(deviceType);
  }

  @Get('devices')
  @ApiOperation({
    summary: 'Get information about all available devices',
    description: 'Returns connection status and info for all fingerprint devices',
  })
  @ApiResponse({ status: 200, description: 'Devices information' })
  async getDevicesInfo() {
    return await this.fingerprintFactory.getAllDevicesInfo();
  }

  @Post('simulate-scan')
  @ApiOperation({
    summary: 'Simulate fingerprint scan (testing only)',
    description: 'For testing without physical device',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          example: 'base64_encoded_template_here',
        },
      },
      required: ['template'],
    },
  })
  @ApiResponse({ status: 200, description: 'Scan simulated' })
  simulateScan(@Body() body: { template: string }) {
    this.fingerprintBridgeService.simulateScan(body.template);
    return {
      success: true,
      message: 'Scan simulated successfully',
    };
  }
}