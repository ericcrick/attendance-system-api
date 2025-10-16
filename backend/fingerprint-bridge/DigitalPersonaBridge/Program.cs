using System;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Runtime.InteropServices;
using Newtonsoft.Json;

namespace DigitalPersonaBridge
{
    class Program
    {
        private const string BACKEND_URL = "http://localhost:3000/api/v1/fingerprint/simulate-scan";
        private static HttpClient httpClient = new HttpClient();
        private static int captureCount = 0;

        // WinBio API imports
        [DllImport("winbio.dll")]
        private static extern int WinBioOpenSession(
            uint Factor,
            uint PoolType,
            uint Flags,
            IntPtr DatabaseId,
            uint DatabaseCount,
            IntPtr CryptoId,
            out IntPtr SessionHandle);

        [DllImport("winbio.dll")]
        private static extern int WinBioCloseSession(IntPtr SessionHandle);

        [DllImport("winbio.dll")]
        private static extern int WinBioCaptureSample(
            IntPtr SessionHandle,
            byte Purpose,
            byte SubFactor,
            out IntPtr Sample,
            out uint SampleSize,
            out uint RejectDetail);

        [DllImport("winbio.dll")]
        private static extern int WinBioFree(IntPtr Memory);

        private const uint WINBIO_TYPE_FINGERPRINT = 8;
        private const uint WINBIO_POOL_SYSTEM = 1;

        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Digital Persona Fingerprint Bridge ===");
            Console.WriteLine($"Backend URL: {BACKEND_URL}\n");

            // Test backend connection
            try
            {
                var response = await httpClient.GetAsync(BACKEND_URL.Replace("/simulate-scan", "/status"));
                Console.WriteLine("✓ Backend is reachable\n");
            }
            catch
            {
                Console.WriteLine("⚠ Warning: Cannot reach backend\n");
            }

            await StartCaptureLoop();
        }

        static async Task StartCaptureLoop()
        {
            Console.WriteLine("Opening biometric session...");

            IntPtr sessionHandle = IntPtr.Zero;
            int result = WinBioOpenSession(
                WINBIO_TYPE_FINGERPRINT,
                WINBIO_POOL_SYSTEM,
                0,
                IntPtr.Zero,
                0,
                IntPtr.Zero,
                out sessionHandle);

            if (result != 0)
            {
                Console.WriteLine($"✗ Failed to open biometric session (Error: 0x{result:X})");
                Console.WriteLine("\nTroubleshooting:");
                Console.WriteLine("1. Run as Administrator");
                Console.WriteLine("2. Enable Windows Hello");
                Console.WriteLine("3. Test device with Windows Hello");
                return;
            }

            Console.WriteLine("✓ Biometric session opened");
            Console.WriteLine("\nPlace your finger on the scanner...\n");

            try
            {
                while (true)
                {
                    IntPtr sample = IntPtr.Zero;
                    uint sampleSize = 0;
                    uint rejectDetail = 0;

                    result = WinBioCaptureSample(
                        sessionHandle,
                        0,
                        0,
                        out sample,
                        out sampleSize,
                        out rejectDetail);

                    if (result == 0 && sample != IntPtr.Zero)
                    {
                        captureCount++;
                        Console.WriteLine($"[{captureCount}] ✓ Fingerprint captured! Size: {sampleSize} bytes");

                        try
                        {
                            // Convert to byte array
                            byte[] buffer = new byte[sampleSize];
                            Marshal.Copy(sample, buffer, 0, (int)sampleSize);

                            // Convert to Base64
                            string base64Template = Convert.ToBase64String(buffer);

                            // Send to backend
                            await SendToBackend(base64Template);

                            Console.WriteLine("Waiting for next scan...\n");
                            await Task.Delay(2000);
                        }
                        finally
                        {
                            WinBioFree(sample);
                        }
                    }

                    await Task.Delay(500);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Error: {ex.Message}");
            }
            finally
            {
                WinBioCloseSession(sessionHandle);
                Console.WriteLine("✓ Session closed");
            }
        }

        static async Task SendToBackend(string template)
        {
            try
            {
                var payload = new { template = template };
                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync(BACKEND_URL, content);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("✓ Sent to backend");
                }
                else
                {
                    Console.WriteLine($"✗ Backend error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Failed to send: {ex.Message}");
            }
        }
    }
}