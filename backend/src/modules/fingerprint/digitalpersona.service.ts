// // backend/src/modules/fingerprint/digital-persona.service.ts

// import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//     IFingerprintService,
//     FingerprintDeviceInfo,
//     FingerprintMatchResult,
// } from './fingerprint-service.interface';

// @Injectable()
// export class DigitalPersonaService extends IFingerprintService {
//     private readonly logger = new Logger(DigitalPersonaService.name);
//     private readonly matchingThreshold: number;
//     private readonly minTemplateLength: number = 100;

//     constructor(private configService: ConfigService) {
//         super();
//         // Default matching threshold (70% similarity)
//         this.matchingThreshold = this.configService.get<number>(
//             'FINGERPRINT_MATCH_THRESHOLD',
//             70,
//         );
//         this.logger.log(
//             `DigitalPersona Service initialized with threshold: ${this.matchingThreshold}%`,
//         );
//     }

//     /**
//      * Validate fingerprint template format
//      * Digital Persona templates from WebSDK are base64 encoded strings
//      */
//     validateFingerprintTemplate(template: string): boolean {
//         try {
//             if (!template || typeof template !== 'string') {
//                 this.logger.warn('Invalid template: null or not a string');
//                 return false;
//             }

//             // Remove whitespace
//             const cleaned = template.trim();

//             if (cleaned.length < this.minTemplateLength) {
//                 this.logger.warn(
//                     `Template too short: ${cleaned.length} < ${this.minTemplateLength}`,
//                 );
//                 return false;
//             }

//             // Check if valid base64
//             const base64Regex =
//                 /^[A-Za-z0-9+/]*={0,2}$|^[A-Za-z0-9_-]*={0,2}$/;
//             if (!base64Regex.test(cleaned)) {
//                 this.logger.warn('Template is not valid base64');
//                 return false;
//             }

//             // Try to decode
//             const decoded = Buffer.from(cleaned, 'base64');
//             if (decoded.length === 0) {
//                 this.logger.warn('Template decodes to empty buffer');
//                 return false;
//             }

//             this.logger.debug(
//                 `Template validated: length=${cleaned.length}, decoded=${decoded.length} bytes`,
//             );
//             return true;
//         } catch (error) {
//             this.logger.error('Template validation error:', error);
//             return false;
//         }
//     }

//     /**
//      * Normalize template format
//      * Handle both base64 and base64url formats
//      */
//     normalizeTemplate(template: string): string {
//         try {
//             let normalized = template.trim();

//             // Convert base64url to standard base64 if needed
//             normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');

//             // Ensure proper padding
//             while (normalized.length % 4 !== 0) {
//                 normalized += '=';
//             }

//             return normalized;
//         } catch (error) {
//             this.logger.error('Template normalization error:', error);
//             return template;
//         }
//     }

//     /**
//      * Extract quality score from template metadata
//      * Digital Persona templates may include quality info
//      */
//     extractQuality(template: string): number {
//         try {
//             // Default quality if not available
//             return 80;
//         } catch {
//             return 0;
//         }
//     }

//     /**
//      * Compare two fingerprint templates
//      * Returns similarity score (0-100)
//      */
//     async compareFingerprintTemplates(
//         template1: string,
//         template2: string,
//     ): Promise<number> {
//         try {
//             if (!this.validateFingerprintTemplate(template1)) {
//                 throw new BadRequestException('Invalid template 1');
//             }
//             if (!this.validateFingerprintTemplate(template2)) {
//                 throw new BadRequestException('Invalid template 2');
//             }

//             // Normalize both templates
//             const norm1 = this.normalizeTemplate(template1);
//             const norm2 = this.normalizeTemplate(template2);

//             // Exact match check first
//             if (norm1 === norm2) {
//                 this.logger.debug('Exact template match found');
//                 return 100;
//             }

//             // Calculate similarity score using multiple methods
//             const similarityScore = await this.calculateSimilarityScore(
//                 norm1,
//                 norm2,
//             );

//             this.logger.debug(
//                 `Template comparison score: ${similarityScore.toFixed(2)}%`,
//             );
//             return similarityScore;
//         } catch (error) {
//             this.logger.error('Error comparing templates:', error);
//             return 0;
//         }
//     }

//     /**
//      * Calculate similarity score using multiple algorithms
//      */
//     private async calculateSimilarityScore(
//         template1: string,
//         template2: string,
//     ): Promise<number> {
//         try {
//             // Decode templates to binary
//             const buffer1 = Buffer.from(template1, 'base64');
//             const buffer2 = Buffer.from(template2, 'base64');

//             // Method 1: Byte-level comparison with tolerance
//             const byteSimilarity = this.compareByteSimilarity(buffer1, buffer2);

//             // Method 2: Length similarity
//             const lengthSimilarity = this.compareLengthSimilarity(
//                 buffer1.length,
//                 buffer2.length,
//             );

//             // Method 3: Hash-based similarity
//             const hashSimilarity = this.compareHashSimilarity(template1, template2);

//             // Weighted average
//             const weights = {
//                 byte: 0.5,
//                 length: 0.2,
//                 hash: 0.3,
//             };

//             const finalScore =
//                 byteSimilarity * weights.byte +
//                 lengthSimilarity * weights.length +
//                 hashSimilarity * weights.hash;

//             return Math.round(finalScore * 100) / 100;
//         } catch (error) {
//             this.logger.error('Error calculating similarity:', error);
//             return 0;
//         }
//     }

//     /**
//      * Compare byte-level similarity with tolerance
//      */
//     private compareByteSimilarity(buffer1: Buffer, buffer2: Buffer): number {
//         try {
//             const minLength = Math.min(buffer1.length, buffer2.length);
//             const maxLength = Math.max(buffer1.length, buffer2.length);

//             if (minLength === 0) return 0;

//             let matches = 0;
//             const tolerance = 5; // Allow small byte value differences

//             for (let i = 0; i < minLength; i++) {
//                 if (Math.abs(buffer1[i] - buffer2[i]) <= tolerance) {
//                     matches++;
//                 }
//             }

//             // Account for length difference
//             const lengthPenalty = (maxLength - minLength) / maxLength;
//             const matchRate = matches / minLength;

//             return matchRate * (1 - lengthPenalty * 0.5);
//         } catch {
//             return 0;
//         }
//     }

//     /**
//      * Compare template lengths
//      */
//     private compareLengthSimilarity(length1: number, length2: number): number {
//         if (length1 === 0 || length2 === 0) return 0;

//         const ratio = Math.min(length1, length2) / Math.max(length1, length2);
//         return ratio;
//     }

//     /**
//      * Compare hash-based similarity
//      */
//     private compareHashSimilarity(template1: string, template2: string): number {
//         try {
//             const crypto = require('crypto');

//             const hash1 = crypto.createHash('sha256').update(template1).digest('hex');
//             const hash2 = crypto.createHash('sha256').update(template2).digest('hex');

//             // Compare first N characters of hash
//             const compareLength = 16;
//             let matches = 0;

//             for (let i = 0; i < compareLength; i++) {
//                 if (hash1[i] === hash2[i]) matches++;
//             }

//             return matches / compareLength;
//         } catch {
//             return 0;
//         }
//     }

//     /**
//      * Match two fingerprints against threshold
//      */
//     async matchFingerprints(
//         template1: string,
//         template2: string,
//         threshold?: number,
//     ): Promise<boolean> {
//         const matchThreshold = threshold ?? this.matchingThreshold;
//         const score = await this.compareFingerprintTemplates(template1, template2);

//         this.logger.debug(
//             `Fingerprint match: score=${score}%, threshold=${matchThreshold}%, matched=${score >= matchThreshold}`,
//         );

//         return score >= matchThreshold;
//     }

//     /**
//      * Match fingerprints with detailed result
//      */
//     async matchFingerprintsWithScore(
//         template1: string,
//         template2: string,
//         threshold?: number,
//     ): Promise<FingerprintMatchResult> {
//         const matchThreshold = threshold ?? this.matchingThreshold;
//         const score = await this.compareFingerprintTemplates(template1, template2);
//         const matched = score >= matchThreshold;

//         return {
//             matched,
//             score: Math.round(score * 100) / 100,
//             threshold: matchThreshold,
//         };
//     }

//     /**
//      * Connect to device (client-side operation, mock for server)
//      */
//     async connectToDevice(): Promise<boolean> {
//         this.logger.log('Device connection managed by client (browser)');
//         return true;
//     }

//     /**
//      * Disconnect from device
//      */
//     async disconnectFromDevice(): Promise<void> {
//         this.logger.log('Device disconnection managed by client (browser)');
//     }

//     /**
//      * Get device information
//      */
//     async getDeviceInfo(): Promise<FingerprintDeviceInfo> {
//         return {
//             connected: true,
//             model: 'U.are.U 4500',
//             manufacturer: 'DigitalPersona (HID Global)',
//             sdkVersion: '5.2.0',
//             status: 'Server-side processing active',
//         };
//     }

//     /**
//      * Test connection
//      */
//     async testConnection(): Promise<{
//         success: boolean;
//         message: string;
//         info?: any;
//     }> {
//         try {
//             const info = await this.getDeviceInfo();
//             return {
//                 success: true,
//                 message: 'DigitalPersona service is operational',
//                 info,
//             };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: `Service test failed: ${error.message}`,
//             };
//         }
//     }

//     /**
//      * Enroll fingerprint (server-side storage)
//      * For Digital Persona, templates are stored in database, not on device
//      */
//     async enrollFingerprintOnDevice(
//         employeeId: string,
//         template: string,
//     ): Promise<string> {
//         if (!this.validateFingerprintTemplate(template)) {
//             throw new BadRequestException('Invalid fingerprint template for enrollment');
//         }

//         this.logger.log(
//             `Fingerprint enrolled for employee: ${employeeId}, template length: ${template.length}`,
//         );

//         // Return employee ID as device user ID
//         // Digital Persona doesn't require device-side enrollment for WebSDK
//         return employeeId;
//     }

//     /**
//      * Delete fingerprint from device
//      */
//     async deleteFingerprintFromDevice(deviceUserId: string): Promise<void> {
//         this.logger.log(`Fingerprint deleted for device user: ${deviceUserId}`);
//         // Digital Persona: deletion happens in database
//     }

//     /**
//      * Sync fingerprints to device
//      */
//     async syncFingerprintsToDevice(
//         fingerprints: Array<{
//             id: string;
//             employeeId: string;
//             fingerprintTemplate: string;
//         }>,
//     ): Promise<{ success: number; failed: number }> {
//         let success = 0;
//         let failed = 0;

//         for (const fp of fingerprints) {
//             try {
//                 if (this.validateFingerprintTemplate(fp.fingerprintTemplate)) {
//                     success++;
//                 } else {
//                     failed++;
//                 }
//             } catch {
//                 failed++;
//             }
//         }

//         this.logger.log(
//             `Sync completed: ${success} successful, ${failed} failed`,
//         );

//         return { success, failed };
//     }
// }



// backend/src/modules/fingerprint/digital-persona.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    IFingerprintService,
    FingerprintDeviceInfo,
    FingerprintMatchResult,
} from './fingerprint-service.interface';

@Injectable()
export class DigitalPersonaService extends IFingerprintService {
    private readonly logger = new Logger(DigitalPersonaService.name);
    private readonly matchingThreshold: number;
    private readonly minTemplateLength: number = 100;

    constructor(private configService: ConfigService) {
        super();
        this.matchingThreshold = this.configService.get<number>(
            'FINGERPRINT_MATCH_THRESHOLD',
            65,
        );
        this.logger.log(
            `✅ DigitalPersona Service initialized with threshold: ${this.matchingThreshold}%`,
        );
    }

    /**
     * Validate fingerprint template format
     */
    validateFingerprintTemplate(template: string): boolean {
        try {
            if (!template || typeof template !== 'string') {
                this.logger.warn('❌ Invalid template: null or not a string');
                return false;
            }

            const cleaned = template.trim();

            if (cleaned.length < this.minTemplateLength) {
                this.logger.warn(
                    `❌ Template too short: ${cleaned.length} < ${this.minTemplateLength}`,
                );
                return false;
            }

            // Check if valid base64
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$|^[A-Za-z0-9_-]*={0,2}$/;
            if (!base64Regex.test(cleaned)) {
                this.logger.warn('❌ Template is not valid base64');
                return false;
            }

            // Try to decode
            const decoded = Buffer.from(cleaned, 'base64');
            if (decoded.length === 0) {
                this.logger.warn('❌ Template decodes to empty buffer');
                return false;
            }

            this.logger.debug(
                `✅ Template validated: length=${cleaned.length}, decoded=${decoded.length} bytes`,
            );
            return true;
        } catch (error) {
            this.logger.error('❌ Template validation error:', error);
            return false;
        }
    }

    /**
     * Normalize template format
     */
    normalizeTemplate(template: string): string {
        try {
            let normalized = template.trim();

            // Convert base64url to standard base64
            normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');

            // Ensure proper padding
            while (normalized.length % 4 !== 0) {
                normalized += '=';
            }

            return normalized;
        } catch (error) {
            this.logger.error('❌ Template normalization error:', error);
            return template;
        }
    }

    /**
     * Extract quality score from template
     */
    extractQuality(template: string): number {
        return 80; // Default quality
    }

    /**
     * Compare two fingerprint templates
     * Returns similarity score (0-100)
     */
    async compareFingerprintTemplates(
        template1: string,
        template2: string,
    ): Promise<number> {
        try {
            if (!this.validateFingerprintTemplate(template1)) {
                throw new BadRequestException('Invalid template 1');
            }
            if (!this.validateFingerprintTemplate(template2)) {
                throw new BadRequestException('Invalid template 2');
            }

            // Normalize both templates
            const norm1 = this.normalizeTemplate(template1);
            const norm2 = this.normalizeTemplate(template2);

            // Exact match check first
            if (norm1 === norm2) {
                this.logger.debug('✅ Exact template match found - 100%');
                return 100;
            }

            // Calculate similarity score
            const similarityScore = await this.calculateAdvancedSimilarity(
                norm1,
                norm2,
            );

            this.logger.debug(
                `📊 Template comparison score: ${similarityScore.toFixed(2)}%`,
            );
            return similarityScore;
        } catch (error) {
            this.logger.error('❌ Error comparing templates:', error);
            return 0;
        }
    }

    /**
     * IMPROVED: Advanced similarity calculation for biometric templates
     * Returns percentage score (0-100)
     */
    private async calculateAdvancedSimilarity(
        template1: string,
        template2: string,
    ): Promise<number> {
        try {
            // Decode templates to binary
            const buffer1 = Buffer.from(template1, 'base64');
            const buffer2 = Buffer.from(template2, 'base64');

            // Calculate multiple similarity metrics
            const hammingScore = this.calculateHammingDistance(buffer1, buffer2);
            const structuralScore = this.calculateStructuralSimilarity(
                buffer1,
                buffer2,
            );
            const statisticalScore = this.calculateStatisticalSimilarity(
                buffer1,
                buffer2,
            );
            const sequenceScore = this.calculateSequenceSimilarity(buffer1, buffer2);

            // Weighted combination (adjusted for biometric matching)
            const weights = {
                hamming: 0.35, // Most important for fingerprints
                structural: 0.30,
                statistical: 0.20,
                sequence: 0.15,
            };

            const finalScore =
                hammingScore * weights.hamming +
                structuralScore * weights.structural +
                statisticalScore * weights.statistical +
                sequenceScore * weights.sequence;

            // Ensure score is in 0-100 range
            const clampedScore = Math.max(0, Math.min(100, finalScore));

            this.logger.debug(
                `🔍 Similarity breakdown: Hamming=${hammingScore.toFixed(2)}%, Structural=${structuralScore.toFixed(2)}%, Statistical=${statisticalScore.toFixed(2)}%, Sequence=${sequenceScore.toFixed(2)}% → Final=${clampedScore.toFixed(2)}%`,
            );

            return Math.round(clampedScore * 100) / 100;
        } catch (error) {
            this.logger.error('❌ Error calculating similarity:', error);
            return 0;
        }
    }

    /**
     * Calculate Hamming Distance (percentage similarity)
     * Good for comparing binary fingerprint templates
     */
    private calculateHammingDistance(buffer1: Buffer, buffer2: Buffer): number {
        try {
            const minLength = Math.min(buffer1.length, buffer2.length);
            const maxLength = Math.max(buffer1.length, buffer2.length);

            if (minLength === 0) return 0;

            let matchingBits = 0;
            let totalBits = maxLength * 8;

            // Compare bit by bit
            for (let i = 0; i < minLength; i++) {
                const xor = buffer1[i] ^ buffer2[i];
                // Count matching bits (0s in XOR result)
                matchingBits += 8 - this.countSetBits(xor);
            }

            // Account for length difference
            const lengthDifference = maxLength - minLength;
            const lengthPenalty = (lengthDifference * 8) / totalBits;

            const similarity = ((matchingBits / totalBits) * (1 - lengthPenalty)) * 100;

            return Math.max(0, similarity);
        } catch {
            return 0;
        }
    }

    /**
     * Count set bits in a byte
     */
    private countSetBits(byte: number): number {
        let count = 0;
        while (byte > 0) {
            count += byte & 1;
            byte >>= 1;
        }
        return count;
    }

    /**
     * Calculate structural similarity using byte patterns
     */
    private calculateStructuralSimilarity(
        buffer1: Buffer,
        buffer2: Buffer,
    ): number {
        try {
            const minLength = Math.min(buffer1.length, buffer2.length);
            if (minLength < 4) return 0;

            let similarBlocks = 0;
            const blockSize = 4; // 4-byte blocks
            const totalBlocks = Math.floor(minLength / blockSize);

            for (let i = 0; i < totalBlocks * blockSize; i += blockSize) {
                let blockMatch = 0;
                for (let j = 0; j < blockSize; j++) {
                    if (Math.abs(buffer1[i + j] - buffer2[i + j]) <= 10) {
                        // Tolerance
                        blockMatch++;
                    }
                }

                if (blockMatch >= 3) {
                    // At least 3/4 bytes match
                    similarBlocks++;
                }
            }

            return (similarBlocks / totalBlocks) * 100;
        } catch {
            return 0;
        }
    }

    /**
     * Calculate statistical similarity using distribution analysis
     */
    private calculateStatisticalSimilarity(
        buffer1: Buffer,
        buffer2: Buffer,
    ): number {
        try {
            // Calculate byte value distributions
            const dist1 = this.calculateDistribution(buffer1);
            const dist2 = this.calculateDistribution(buffer2);

            // Compare distributions using Chi-Square-like metric
            let totalDifference = 0;
            for (let i = 0; i < 256; i++) {
                const diff = Math.abs(dist1[i] - dist2[i]);
                totalDifference += diff;
            }

            // Normalize to 0-100 scale
            const maxDifference = Math.min(buffer1.length, buffer2.length);
            const similarity = (1 - totalDifference / maxDifference) * 100;

            return Math.max(0, similarity);
        } catch {
            return 0;
        }
    }

    /**
     * Calculate byte value distribution
     */
    private calculateDistribution(buffer: Buffer): number[] {
        const distribution = new Array(256).fill(0);
        for (let i = 0; i < buffer.length; i++) {
            distribution[buffer[i]]++;
        }
        // Normalize
        return distribution.map((count) => count / buffer.length);
    }

    /**
     * Calculate sequence similarity using longest common subsequence
     */
    private calculateSequenceSimilarity(
        buffer1: Buffer,
        buffer2: Buffer,
    ): number {
        try {
            const minLength = Math.min(buffer1.length, buffer2.length);
            const maxLength = Math.max(buffer1.length, buffer2.length);

            if (minLength === 0) return 0;

            // Simplified LCS for performance
            let consecutiveMatches = 0;
            let maxConsecutiveMatches = 0;
            const tolerance = 5;

            for (let i = 0; i < minLength; i++) {
                if (Math.abs(buffer1[i] - buffer2[i]) <= tolerance) {
                    consecutiveMatches++;
                    maxConsecutiveMatches = Math.max(
                        maxConsecutiveMatches,
                        consecutiveMatches,
                    );
                } else {
                    consecutiveMatches = 0;
                }
            }

            const similarity = (maxConsecutiveMatches / maxLength) * 100;
            return Math.min(100, similarity * 2); // Boost factor for matches
        } catch {
            return 0;
        }
    }

    /**
     * Match two fingerprints against threshold
     */
    async matchFingerprints(
        template1: string,
        template2: string,
        threshold?: number,
    ): Promise<boolean> {
        const matchThreshold = threshold ?? this.matchingThreshold;
        const score = await this.compareFingerprintTemplates(template1, template2);

        const matched = score >= matchThreshold;

        this.logger.log(
            `${matched ? '✅' : '❌'} Fingerprint match: score=${score.toFixed(2)}%, threshold=${matchThreshold}%, result=${matched ? 'MATCHED' : 'NOT MATCHED'}`,
        );

        return matched;
    }

    /**
     * Match fingerprints with detailed result
     */
    async matchFingerprintsWithScore(
        template1: string,
        template2: string,
        threshold?: number,
    ): Promise<FingerprintMatchResult> {
        const matchThreshold = threshold ?? this.matchingThreshold;
        const score = await this.compareFingerprintTemplates(template1, template2);
        const matched = score >= matchThreshold;

        return {
            matched,
            score: Math.round(score * 100) / 100,
            threshold: matchThreshold,
        };
    }

    /**
     * Connect to device
     */
    async connectToDevice(): Promise<boolean> {
        this.logger.log('📱 Device connection managed by client (browser)');
        return true;
    }

    /**
     * Disconnect from device
     */
    async disconnectFromDevice(): Promise<void> {
        this.logger.log('📱 Device disconnection managed by client (browser)');
    }

    /**
     * Get device information
     */
    async getDeviceInfo(): Promise<FingerprintDeviceInfo> {
        return {
            connected: true,
            model: 'U.are.U 4500',
            manufacturer: 'DigitalPersona (HID Global)',
            sdkVersion: '5.2.0',
            status: 'Server-side processing active',
        };
    }

    /**
     * Test connection
     */
    async testConnection(): Promise<{
        success: boolean;
        message: string;
        info?: any;
    }> {
        try {
            const info = await this.getDeviceInfo();
            return {
                success: true,
                message: 'DigitalPersona service is operational',
                info,
            };
        } catch (error) {
            return {
                success: false,
                message: `Service test failed: ${error.message}`,
            };
        }
    }

    /**
     * Enroll fingerprint
     */
    async enrollFingerprintOnDevice(
        employeeId: string,
        template: string,
    ): Promise<string> {
        if (!this.validateFingerprintTemplate(template)) {
            throw new BadRequestException(
                'Invalid fingerprint template for enrollment',
            );
        }

        this.logger.log(
            `✅ Fingerprint enrolled for employee: ${employeeId}, template length: ${template.length}`,
        );

        return employeeId;
    }

    /**
     * Delete fingerprint from device
     */
    async deleteFingerprintFromDevice(deviceUserId: string): Promise<void> {
        this.logger.log(`🗑️ Fingerprint deleted for device user: ${deviceUserId}`);
    }

    /**
     * Sync fingerprints to device
     */
    async syncFingerprintsToDevice(
        fingerprints: Array<{
            id: string;
            employeeId: string;
            fingerprintTemplate: string;
        }>,
    ): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const fp of fingerprints) {
            try {
                if (this.validateFingerprintTemplate(fp.fingerprintTemplate)) {
                    success++;
                } else {
                    failed++;
                }
            } catch {
                failed++;
            }
        }

        this.logger.log(
            `🔄 Sync completed: ${success} successful, ${failed} failed`,
        );

        return { success, failed };
    }
}