// public/fingerprint-sdk/types.d.ts

declare namespace Fingerprint {
    enum SampleFormat {
        Raw = 1,
        Intermediate = 2,
        Compressed = 3,
        PngImage = 5,
    }

    enum QualityCode {
        Good = 0,
        NoImage = 1,
        TooLight = 2,
        TooDark = 3,
        TooNoisy = 4,
        LowContrast = 5,
        NotEnoughFeatures = 6,
        NotCentered = 7,
        NotAFinger = 8,
    }

    enum DeviceModality {
        Unknown = 0,
        Swipe = 1,
        Area = 2,
        AreaMultifinger = 3,
    }

    enum DeviceTechnology {
        Unknown = 0,
        Optical = 1,
        Capacitive = 2,
        Thermal = 3,
        Pressure = 4,
    }

    interface DeviceInfo {
        DeviceID: string;
        eDeviceModality: DeviceModality;
        eDeviceTech: DeviceTechnology;
        eUidType: number;
    }

    interface SamplesAcquiredEvent {
        deviceUid: string;
        sampleFormat: SampleFormat;
        samples: string; // JSON string containing base64 encoded samples
    }

    interface QualityReportedEvent {
        deviceUid: string;
        quality: QualityCode;
    }

    interface ErrorEvent {
        deviceUid: string;
        error: number;
    }

    class WebApi {
        constructor();

        // Event handlers
        onDeviceConnected: ((event: { deviceUid: string }) => void) | null;
        onDeviceDisconnected: ((event: { deviceUid: string }) => void) | null;
        onSamplesAcquired: ((event: SamplesAcquiredEvent) => void) | null;
        onQualityReported: ((event: QualityReportedEvent) => void) | null;
        onErrorOccurred: ((event: ErrorEvent) => void) | null;
        onCommunicationFailed: (() => void) | null;

        // Methods
        enumerateDevices(): Promise<string[]>;
        getDeviceInfo(deviceUid: string): Promise<DeviceInfo>;
        startAcquisition(sampleFormat: SampleFormat, deviceUid?: string): Promise<void>;
        stopAcquisition(deviceUid?: string): Promise<void>;
    }

    function b64UrlTo64(b64Url: string): string;
    function b64To64Url(b64: string): string;
    function b64UrlToUtf8(b64Url: string): string;
    function strToB64Url(str: string): string;
}

declare global {
    interface Window {
        Fingerprint: typeof Fingerprint;
    }
}

export { };