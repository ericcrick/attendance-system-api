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



// // backend/src/modules/fingerprint/fingerprint.controller.ts
// import { Controller, Get, Post, Body, Query, Sse } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
// import { Public } from '../auth/decorators/public.decorator';
// import { FingerprintBridgeService } from './fingerprint-bridgge.service';
// import { interval, map, Observable } from 'rxjs';


// @ApiTags('fingerprint')
// @Controller('fingerprint')
// export class FingerprintController {
//   constructor(
//     private readonly fingerprintBridgeService: FingerprintBridgeService,
//   ) { }

//   @Public()
//   @Get('poll')
//   @ApiOperation({ summary: 'Poll for latest fingerprint scan' })
//   @ApiResponse({ status: 200, description: 'Latest scan data' })
//   pollForScan() {
//     const scan = this.fingerprintBridgeService.getLatestScan();

//     return {
//       hasNewScan: !!scan,
//       template: scan?.template || null,
//       timestamp: scan?.timestamp || null,
//       quality: scan?.quality || null,
//     };
//   }

//   @Public()
//   @Get('status')
//   @ApiOperation({ summary: 'Get fingerprint monitoring status' })
//   @ApiResponse({ status: 200, description: 'Status information' })
//   getStatus() {
//     return this.fingerprintBridgeService.getMonitoringStatus();
//   }

//   @Public()
//   @Get('devices')
//   @ApiOperation({ summary: 'Get all available fingerprint devices info' })
//   @ApiResponse({ status: 200, description: 'Devices information' })
//   async getDevices() {
//     return await this.fingerprintBridgeService.getAllDevicesInfo();
//   }

//   @Public()
//   @Get('history')
//   @ApiOperation({ summary: 'Get recent scan history' })
//   @ApiResponse({ status: 200, description: 'Scan history' })
//   getHistory() {
//     return {
//       scans: this.fingerprintBridgeService.getScanHistory(),
//     };
//   }

//   @Post('start-monitoring')
//   @ApiOperation({ summary: 'Start fingerprint monitoring' })
//   @ApiResponse({ status: 200, description: 'Monitoring started' })
//   async startMonitoring() {
//     return await this.fingerprintBridgeService.startMonitoring();
//   }

//   @Post('stop-monitoring')
//   @ApiOperation({ summary: 'Stop fingerprint monitoring' })
//   @ApiResponse({ status: 200, description: 'Monitoring stopped' })
//   async stopMonitoring() {
//     return await this.fingerprintBridgeService.stopMonitoring();
//   }

//   @Post('switch-device')
//   @ApiOperation({ summary: 'Switch between fingerprint devices' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         deviceType: {
//           type: 'string',
//           enum: ['ZKTECO', 'DIGITAL_PERSONA'],
//           example: 'DIGITAL_PERSONA',
//         },
//       },
//     },
//   })
//   @ApiResponse({ status: 200, description: 'Device switched' })
//   async switchDevice(@Body() body: { deviceType: string }) {
//     return await this.fingerprintBridgeService.switchDevice(body.deviceType);
//   }

//   @Post('simulate-scan')
//   @ApiOperation({ summary: 'Simulate fingerprint scan (testing)' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         template: { type: 'string' },
//       },
//     },
//   })
//   @ApiResponse({ status: 200, description: 'Scan simulated' })
//   simulateScan(@Body() body: { template: string }) {
//     this.fingerprintBridgeService.simulateScan(body.template);
//     return { success: true, message: 'Scan simulated' };
//   }


//   @Public()
//   @Get('capture-single')
//   @ApiOperation({
//     summary: 'Capture a single fingerprint (for testing)',
//     description: 'Captures one fingerprint from the currently selected device'
//   })
//   @ApiResponse({ status: 200, description: 'Fingerprint captured' })
//   async captureSingle() {
//     try {
//       const service = this.fingerprintBridgeService['fingerprintFactory'].getService();
//       const result = await service.captureFingerprintTemplate();

//       if (result.success) {
//         // Store it temporarily for polling
//         this.fingerprintBridgeService['handleFingerprintScan'](result);
//       }

//       return result;
//     } catch (error) {
//       return {
//         success: false,
//         error: error.message,
//       };
//     }
//   }

//   @Public()
//   @Sse('stream')
//   @ApiOperation({
//     summary: 'Server-Sent Events stream for fingerprint scans',
//     description: 'Real-time fingerprint scan notifications via SSE'
//   })
//   stream(): Observable<any> {
//     return interval(500).pipe(
//       map(() => {
//         const scan = this.fingerprintBridgeService.getLatestScan();
//         if (scan) {
//           return {
//             data: {
//               hasNewScan: true,
//               template: scan.template,
//               timestamp: scan.timestamp,
//               quality: scan.quality,
//             }
//           };
//         }
//         return { data: { hasNewScan: false } };
//       }),
//     );
//   }



//   @Public()
//   @Post('test-capture')
//   @ApiOperation({
//     summary: 'Force a manual fingerprint capture test',
//     description: 'Tests if the device can capture a fingerprint'
//   })
//   @ApiResponse({ status: 200, description: 'Capture test result' })
//   async testCapture() {
//     try {
//       const fingerprintFactory = this.fingerprintBridgeService['fingerprintFactory'];
//       const service = fingerprintFactory.getService();
//       const deviceType = fingerprintFactory.getCurrentDeviceType();

//       this.fingerprintBridgeService['logger'].log('Manual capture test started');

//       // Try to capture
//       const result = await service.captureFingerprintTemplate();

//       return {
//         deviceType,
//         captureResult: result,
//         instructions: result.success
//           ? 'Fingerprint captured successfully!'
//           : 'Place your finger on the scanner and try again',
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.message,
//         stack: error.stack,
//       };
//     }
//   }
// }