import { useNavigate } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import type { ClientResponse } from '../../types';
import Card from '../common/Card';

interface ClientCardProps {
    client: ClientResponse;
}

export default function ClientCard({ client }: ClientCardProps) {
    const navigate = useNavigate();

    const remainingPercentage = client.total_package_size > 0
        ? (client.remaining_sessions / client.total_package_size) * 100
        : 0;

    const getProgressColor = () => {
        if (remainingPercentage > 50) return 'bg-green-500';
        if (remainingPercentage > 20) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card
            hover
            onClick={() => navigate(`/clients/${client.id}`)}
            className="flex items-center justify-between"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                    </span>
                </div>

                {/* Info */}
                <div>
                    <h3 className="font-semibold text-white">
                        {client.first_name} {client.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">
                            {client.remaining_sessions} / {client.total_package_size} sessions
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-32 h-1.5 bg-dark-100 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full ${getProgressColor()} transition-all duration-300`}
                            style={{ width: `${remainingPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-500" />
        </Card>
    );
}
