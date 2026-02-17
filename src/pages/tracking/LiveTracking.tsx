import { useParams } from 'react-router-dom';
import TrackingMap from '@/components/tracking/TrackingMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LiveTracking() {
    const { vehicleId } = useParams();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Live Tracking</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Location</CardTitle>
                </CardHeader>
                <CardContent>
                    {vehicleId ? (
                        <TrackingMap vehicleId={vehicleId} />
                    ) : (
                        <div className="text-center py-10">
                            Select a vehicle to track or view broad map
                            {/* Could show all vehicles map here */}
                            <TrackingMap />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-- km/h</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">ETA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-- min</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Distance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-- km</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
