import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Session } from '../../types';

interface SessionCalendarProps {
    sessions: Session[];
    onDateSelect?: (date: Date) => void;
}

export default function SessionCalendar({ sessions, onDateSelect }: SessionCalendarProps) {
    const { i18n } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Get week days
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const locale = i18n.language === 'tr' ? tr : enUS;

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onDateSelect?.(date);
    };

    const nextWeek = () => {
        setCurrentDate(addDays(currentDate, 7));
    };

    const prevWeek = () => {
        setCurrentDate(addDays(currentDate, -7));
    };

    // Get sessions for a specific date
    const getSessionsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return sessions.filter(s => s.scheduled_at.startsWith(dateStr));
    };

    return (
        <div className="bg-dark-200 p-4 rounded-xl border border-dark-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale })}
                </h3>
                <div className="flex gap-2">
                    <button 
                        onClick={prevWeek}
                        className="p-1 hover:bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={nextWeek}
                        className="p-1 hover:bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Week View */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const daySessions = getSessionsForDate(date);
                    const hasSessions = daySessions.length > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => handleDateClick(date)}
                            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                                isSelected 
                                    ? 'bg-primary text-dark font-bold' 
                                    : 'hover:bg-dark-300 text-gray-400 hover:text-white'
                            } ${isToday && !isSelected ? 'text-primary' : ''}`}
                        >
                            <span className="text-xs font-medium uppercase mb-1">
                                {format(date, 'EEE', { locale })}
                            </span>
                            <span className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                                isToday && !isSelected ? 'bg-primary/10' : ''
                            }`}>
                                {format(date, 'd')}
                            </span>
                            
                            {/* Session Indicators */}
                            <div className="flex gap-0.5 mt-1 h-1.5">
                                {daySessions.slice(0, 3).map((s, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            s.status === 'completed' ? 'bg-green-400' :
                                            s.status === 'cancelled' ? 'bg-gray-400' :
                                            s.status === 'no_show' ? 'bg-red-400' :
                                            (isSelected ? 'bg-dark' : 'bg-primary')
                                        }`}
                                    />
                                ))}
                                {daySessions.length > 3 && (
                                    <div className={`w-1.5 h-1.5 rounded-full opacity-50 ${isSelected ? 'bg-dark' : 'bg-gray-400'}`} />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
