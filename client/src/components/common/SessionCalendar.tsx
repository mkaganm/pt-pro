import { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import { Session } from '../../types';

interface SessionCalendarProps {
    sessions: Session[];
    onDateSelect?: (date: Date) => void;
}

export default function SessionCalendar({ sessions, onDateSelect }: SessionCalendarProps) {
    const { i18n } = useTranslation();
    const [value, onChange] = useState<Date>(new Date());

    const locale = i18n.language === 'tr' ? tr : enUS;

    const getTileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return null;

        const dateStr = format(date, 'yyyy-MM-dd');
        const daySessions = sessions.filter(s => s.scheduled_at.startsWith(dateStr));

        if (daySessions.length === 0) return null;

        return (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                {daySessions.slice(0, 3).map((s, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${s.status === 'completed' ? 'bg-green-400' :
                                s.status === 'cancelled' ? 'bg-gray-400' :
                                    s.status === 'no_show' ? 'bg-red-400' :
                                        'bg-primary'
                            }`}
                    />
                ))}
                {daySessions.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                )}
            </div>
        );
    };

    return (
        <div className="bg-dark-200 p-4 rounded-xl border border-dark-100 session-calendar-wrapper">
            <Calendar
                onChange={(val) => {
                    const date = val as Date;
                    onChange(date);
                    onDateSelect?.(date);
                }}
                value={value}
                locale={i18n.language}
                tileContent={getTileContent}
                prevLabel={<ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />}
                nextLabel={<ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />}
                className="w-full bg-transparent border-none font-sans text-white"
                tileClassName={({ date, view }) => {
                    if (view !== 'month') return '';
                    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    return `relative h-14 flex items-center justify-center rounded-lg hover:bg-dark-300 transition-colors ${isToday ? 'bg-primary/10 text-primary font-bold' : 'text-gray-300'
                        }`;
                }}
            />
            <style>{`
                .session-calendar-wrapper .react-calendar {
                    width: 100%;
                    background: transparent;
                    border: none;
                    font-family: inherit;
                }
                .session-calendar-wrapper .react-calendar__navigation {
                    margin-bottom: 1rem;
                }
                .session-calendar-wrapper .react-calendar__navigation button {
                    color: white;
                    min-width: 44px;
                    background: none;
                    font-size: 1rem;
                    font-weight: 600;
                }
                .session-calendar-wrapper .react-calendar__navigation button:enabled:hover,
                .session-calendar-wrapper .react-calendar__navigation button:enabled:focus {
                    background-color: transparent;
                }
                .session-calendar-wrapper .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: 600;
                    font-size: 0.75em;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                .session-calendar-wrapper .react-calendar__month-view__weekdays__weekday {
                    padding: 0.5em;
                }
                .session-calendar-wrapper .react-calendar__month-view__days__day--weekend {
                    color: #ef4444;
                }
                .session-calendar-wrapper .react-calendar__month-view__days__day--neighboringMonth {
                    color: #374151 !important;
                }
                .session-calendar-wrapper .react-calendar__tile:enabled:hover,
                .session-calendar-wrapper .react-calendar__tile:enabled:focus {
                    background-color: #1f2937;
                    border-radius: 0.5rem;
                }
                .session-calendar-wrapper .react-calendar__tile--now {
                    background: rgba(255, 77, 77, 0.1);
                    border-radius: 0.5rem;
                }
                .session-calendar-wrapper .react-calendar__tile--now:enabled:hover,
                .session-calendar-wrapper .react-calendar__tile--now:enabled:focus {
                    background: rgba(255, 77, 77, 0.2);
                }
                .session-calendar-wrapper .react-calendar__tile--active {
                    background: #ff4d4d !important;
                    color: white !important;
                    border-radius: 0.5rem;
                }
            `}</style>
        </div>
    );
}
