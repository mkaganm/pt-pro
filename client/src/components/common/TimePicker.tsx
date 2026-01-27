import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

export default function TimePicker({ value, onChange, onClose, isOpen }: TimePickerProps) {
    const [selectedHour, setSelectedHour] = useState(10);
    const [selectedMinute, setSelectedMinute] = useState(0);

    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 - 22:00
    const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':').map(Number);
            if (hours.includes(h)) setSelectedHour(h);
            setSelectedMinute(m);
        }
    }, [value]);

    useEffect(() => {
        if (isOpen && hourRef.current) {
            const hourIndex = hours.indexOf(selectedHour);
            hourRef.current.scrollTop = hourIndex * 48 - 48;
        }
        if (isOpen && minuteRef.current) {
            const minIndex = minutes.indexOf(selectedMinute);
            minuteRef.current.scrollTop = minIndex * 48 - 48;
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const time = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onChange(time);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-dark-300 rounded-2xl w-80 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-100">
                    <span className="text-lg font-semibold text-white">Saat Seç</span>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Time Display */}
                <div className="text-center py-4 border-b border-dark-100">
                    <span className="text-3xl font-bold text-primary">
                        {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Picker Columns */}
                <div className="flex justify-center p-4 relative">
                    {/* Selection Highlight */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-12 bg-dark-100 rounded-lg pointer-events-none" />

                    {/* Hour Column */}
                    <div
                        ref={hourRef}
                        className="h-40 overflow-y-auto scrollbar-hide relative z-10 snap-y snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="py-14">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    onClick={() => setSelectedHour(hour)}
                                    className={`h-12 w-16 flex items-center justify-center cursor-pointer snap-center transition-all ${selectedHour === hour
                                        ? 'text-primary text-2xl font-bold'
                                        : 'text-gray-500 text-lg hover:text-gray-300'
                                        }`}
                                >
                                    {hour.toString().padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-40 flex items-center justify-center z-10">
                        <span className="text-2xl font-bold text-primary">:</span>
                    </div>

                    {/* Minute Column */}
                    <div
                        ref={minuteRef}
                        className="h-40 overflow-y-auto scrollbar-hide relative z-10 snap-y snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="py-14">
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    onClick={() => setSelectedMinute(minute)}
                                    className={`h-12 w-16 flex items-center justify-center cursor-pointer snap-center transition-all ${selectedMinute === minute
                                        ? 'text-primary text-2xl font-bold'
                                        : 'text-gray-500 text-lg hover:text-gray-300'
                                        }`}
                                >
                                    {minute.toString().padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t border-dark-100">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-dark-200 text-gray-300 rounded-lg font-medium hover:bg-dark-100 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 px-4 bg-primary text-dark font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
}
