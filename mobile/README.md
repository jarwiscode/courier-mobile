Mobile Integration Guide (Foreground, Consent-Based)

Goal
- Send periodic, consent-based GPS updates from courier devices to the server’s /v1/locations endpoint while the app is active (foreground).
- For background tracking, follow platform policies: visible foreground service (Android) and proper permissions with clear disclosure (iOS).

Server Endpoint
- URL (local dev): http://localhost:8080/v1/locations
- Method: POST
- JSON body:
  {
    "courierId": "string",
    "lat": 12.34,
    "lng": 56.78,
    "speed": 5.1,          // optional, m/s
    "heading": 135,        // optional, degrees
    "jobId": "job-123",    // optional
    "battery": 0.83,       // optional, 0..1
    "timestamp": 1730899200000 // optional, ms since epoch
  }

Minimum React Native (Expo) Foreground Example
- This example uses expo-location for simplicity. You must request permissions at runtime and show an in-app indicator that location sharing is active.
- For background collection, read Expo or native docs (foreground service on Android, significant-change/background modes on iOS with visible indicators and Info.plist usage descriptions).

Example (TypeScript)

```tsx
// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import * as Location from 'expo-location';

const SERVER_URL = 'http://YOUR_SERVER_HOST:8080/v1/locations';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'sharing'>('idle');
  const timerRef = useRef<number | null>(null);
  const courierId = 'courier-001'; // Replace with authenticated user ID

  async function sendLocation() {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude: lat, longitude: lng, speed, heading } = loc.coords;
      const payload = {
        courierId,
        lat,
        lng,
        speed: typeof speed === 'number' ? speed : null,
        heading: typeof heading === 'number' ? heading : null,
        jobId: null,
        battery: null, // obtain via native module if needed
        timestamp: Date.now(),
      };
      await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('sendLocation failed', e);
    }
  }

  async function startSharing() {
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== 'granted') {
      alert('Location permission is required.');
      return;
    }
    setStatus('sharing');
    // Fire immediately, then every 10 seconds
    await sendLocation();
    // @ts-ignore setInterval type on web/native
    timerRef.current = setInterval(sendLocation, 10_000);
  }

  function stopSharing() {
    setStatus('idle');
    if (timerRef.current) {
      // @ts-ignore
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        // @ts-ignore
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Courier Location Sharing: {status.toUpperCase()}
        </Text>
        {status === 'idle' ? (
          <Button title="Start Sharing" onPress={startSharing} />
        ) : (
          <Button title="Stop Sharing" onPress={stopSharing} />
        )}
        <Text>
          Note: This simple example sends location only while the app is open (foreground).
          For background updates, implement a visible Android foreground service or iOS
          background mode with clear disclosure and user controls.
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

Android Background Notes (High Level)
- Use a Foreground Service with a persistent notification indicating active tracking.
- Request ACCESS_FINE_LOCATION and, if required, ACCESS_BACKGROUND_LOCATION (Android 10+).
- Throttle intervals sensibly and batch when appropriate to reduce battery drain.

iOS Background Notes (High Level)
- Use NSLocationWhenInUseUsageDescription and, if needed, NSLocationAlwaysAndWhenInUseUsageDescription.
- Enable location background mode; use significant-change updates or region monitoring; show clear in-app disclosure and a control to stop tracking.

Testing with curl
```bash
curl -X POST http://localhost:8080/v1/locations \
  -H 'Content-Type: application/json' \
  -d '{ "courierId": "c1", "lat": 40.7128, "lng": -74.0060, "speed": 9.1, "heading": 180, "jobId": "job-123", "battery": 0.76, "timestamp": 1730899200000 }'
```

Security and Privacy Checklist
- Obtain explicit consent and provide an always-available toggle to stop sharing.
- Limit tracking to work hours or active jobs when possible.
- Use HTTPS and authenticate requests in production.
- Implement data retention limits (e.g., 30–90 days) and restrict access via roles.



